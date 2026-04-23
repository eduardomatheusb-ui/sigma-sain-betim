import re

with open("server/routers.ts", "r") as f:
    content = f.read()

# Substituir a procedure stats (sem input) por uma com input opcional
old_stats = '''    stats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { totalStudents: 0, activeMediators: 0, pendingAttendances: 0, externalDemands: 0, onLeave: 0, vacancies: 0, totalSchools: 0, totalMediators: 0, studentsWithMediator: 0, studentsWithoutMediator: 0 };

      try {
        const [studentList, mediatorList, pendingList, demandList, schoolList, links] = await Promise.all([
          db.select().from(demands),
          db.select().from(mediators),
          db.select().from(attendances).where(eq(attendances.status, "pending")),
          db.select().from(externalDemands).where(eq(externalDemands.status, "pending")),
          db.select().from(schools),
          db.select().from(mediatorStudents),
        ]);

        const activeMediators = mediatorList.filter(m => m.status === "active").length;
        const onLeave = mediatorList.filter(m => m.status === "on_leave" || m.status === "temp_leave").length;
        const vacancies = mediatorList.filter(m => m.status === "vacancy").length;

        // Alunos com e sem atendente (via mediator_students - vínculo formal)
        const linkedStudentIds = new Set(
          links
            .filter(l => !l.endDate) // apenas vínculos ativos
            .map(l => l.studentId)
        );
        // Fallback: também considerar linkedStudents texto (compatibilidade)
        const linkedStudentNames = new Set<string>();
        mediatorList.filter(m => m.status === "active").forEach(m => {
          if (m.linkedStudents) {
            m.linkedStudents.split(",").map(s => s.trim()).filter(Boolean).forEach(s => linkedStudentNames.add(s.toLowerCase()));
          }
        });
        // Para demands: contar por hasAttendant
        const studentsWithMediator = studentList.filter((s: any) => s.hasAttendant === true).length;
        const studentsWithoutMediator = studentList.filter((s: any) => s.hasAttendant === false).length;

        // Ranking de escolas por demanda
        const schoolDemandMap = new Map<number, number>();
        mediatorList.filter(m => m.status === "vacancy" || m.status === "on_leave" || m.status === "temp_leave").forEach(m => {
          schoolDemandMap.set(m.schoolId, (schoolDemandMap.get(m.schoolId) || 0) + 1);
        });
        const schoolRanking = schoolList
          .map(s => ({ id: s.id, name: s.name, demand: schoolDemandMap.get(s.id) || 0 }))
          .filter(s => s.demand > 0)
          .sort((a, b) => b.demand - a.demand);
        const emRanking = schoolRanking.filter(s => s.name.startsWith("E M") || s.name.startsWith("EM ")).slice(0, 10);
        const cimRanking = schoolRanking.filter(s => s.name.startsWith("CIM")).slice(0, 10);

        // Gráfico por deficiência (demands usa campo 'disabilities' como JSON array)
        const disabilityMap = new Map<string, number>();
        studentList.forEach((s: any) => {
          let keys: string[] = [];
          if (s.disabilities) {
            try { keys = JSON.parse(s.disabilities); } catch { keys = [s.disabilities]; }
          }
          if (keys.length === 0) keys = ["Não informado"];
          keys.forEach(k => disabilityMap.set(k, (disabilityMap.get(k) || 0) + 1));
        });
        const byDisability = Array.from(disabilityMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        // Gráfico por turno
        const shiftMap = new Map<string, number>();
        studentList.forEach((s: any) => {
          const key = s.shift === "morning" ? "Manhã" : s.shift === "afternoon" ? "Tarde" : s.shift === "full" ? "Integral" : s.shift === "evening" ? "Noturno" : "Não informado";
          shiftMap.set(key, (shiftMap.get(key) || 0) + 1);
        });
        const byShift = Array.from(shiftMap.entries()).map(([name, value]) => ({ name, value }));

        // Motivos de inatividade
        const inactivityMap = new Map<string, number>();
        mediatorList.filter(m => m.status !== "active" && m.inactivityReason).forEach(m => {
          const key = m.inactivityReason!;
          inactivityMap.set(key, (inactivityMap.get(key) || 0) + 1);
        });
        const byInactivity = Array.from(inactivityMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        return {
          totalStudents: studentList.length, // demands count
          activeMediators,
          pendingAttendances: pendingList.length,
          externalDemands: demandList.length,
          onLeave,
          vacancies,
          totalSchools: schoolList.length,
          totalMediators: mediatorList.length,
          studentsWithMediator,
          studentsWithoutMediator,
          emRanking,
          cimRanking,
          byDisability,
          byShift,
          byInactivity,
        };
      } catch (error) {
        console.error("[Dashboard] Error fetching stats:", error);
        return { totalStudents: 0, activeMediators: 0, pendingAttendances: 0, externalDemands: 0, onLeave: 0, vacancies: 0, totalSchools: 0, totalMediators: 0, studentsWithMediator: 0, studentsWithoutMediator: 0, emRanking: [], cimRanking: [], byDisability: [], byShift: [], byInactivity: [] };
      }
    }),'''

new_stats = '''    stats: protectedProcedure
      .input(z.object({
        period: z.enum(["current_week", "last_week", "current_month", "all_time"]).optional().default("all_time"),
        unitType: z.string().optional().default("all"),
        mediatorStatus: z.string().optional().default("all"),
      }).optional())
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const emptyResult = { totalStudents: 0, activeMediators: 0, pendingAttendances: 0, externalDemands: 0, onLeave: 0, vacancies: 0, totalSchools: 0, totalMediators: 0, studentsWithMediator: 0, studentsWithoutMediator: 0, emRanking: [], cimRanking: [], byDisability: [], byShift: [], byInactivity: [], filtersApplied: { period: "all_time", unitType: "all", mediatorStatus: "all" } };
        if (!db) return emptyResult;

        const period = input?.period ?? "all_time";
        const unitType = input?.unitType ?? "all";
        const mediatorStatusFilter = input?.mediatorStatus ?? "all";

        // Calcular intervalo de datas para filtro de período
        const now = new Date();
        let periodStart: Date | null = null;
        let periodEnd: Date | null = null;
        if (period === "current_week") {
          const day = now.getDay();
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - day);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodStart.getDate() + 6);
          periodEnd.setHours(23, 59, 59, 999);
        } else if (period === "last_week") {
          const day = now.getDay();
          periodEnd = new Date(now);
          periodEnd.setDate(now.getDate() - day - 1);
          periodEnd.setHours(23, 59, 59, 999);
          periodStart = new Date(periodEnd);
          periodStart.setDate(periodEnd.getDate() - 6);
          periodStart.setHours(0, 0, 0, 0);
        } else if (period === "current_month") {
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        try {
          const [studentList, mediatorListAll, pendingList, demandList, schoolListAll, links] = await Promise.all([
            db.select().from(demands),
            db.select().from(mediators),
            db.select().from(attendances).where(eq(attendances.status, "pending")),
            db.select().from(externalDemands).where(eq(externalDemands.status, "pending")),
            db.select().from(schools),
            db.select().from(mediatorStudents),
          ]);

          // Filtrar escolas por tipo de unidade
          const schoolList = unitType === "all"
            ? schoolListAll
            : schoolListAll.filter(s => {
                if (unitType === "EM") return s.name.startsWith("E M") || s.name.startsWith("EM ");
                if (unitType === "CIM") return s.name.startsWith("CIM");
                if (unitType === "CMEI") return s.name.startsWith("CMEI");
                return (s as any).type === unitType;
              });
          const filteredSchoolIds = new Set(schoolList.map(s => s.id));

          // Filtrar mediadores por escola (se filtro de tipo aplicado) e por status
          let mediatorList = mediatorListAll.filter(m =>
            unitType === "all" || filteredSchoolIds.has(m.schoolId)
          );
          if (mediatorStatusFilter !== "all") {
            if (mediatorStatusFilter === "active") mediatorList = mediatorList.filter(m => m.status === "active");
            else if (mediatorStatusFilter === "inactive") mediatorList = mediatorList.filter(m => m.status === "inactive");
            else if (mediatorStatusFilter === "on_leave") mediatorList = mediatorList.filter(m => m.status === "on_leave" || m.status === "temp_leave");
          }

          // Filtrar demands por escola (se filtro de tipo aplicado) e por período
          let filteredStudents = studentList.filter(s =>
            unitType === "all" || filteredSchoolIds.has((s as any).schoolId)
          );
          if (periodStart && periodEnd) {
            filteredStudents = filteredStudents.filter(s => {
              const created = (s as any).createdAt ? new Date((s as any).createdAt) : null;
              return created && created >= periodStart! && created <= periodEnd!;
            });
          }

          const activeMediators = mediatorList.filter(m => m.status === "active").length;
          const onLeave = mediatorList.filter(m => m.status === "on_leave" || m.status === "temp_leave").length;
          const vacancies = mediatorList.filter(m => m.status === "vacancy").length;

          const studentsWithMediator = filteredStudents.filter((s: any) => s.hasAttendant === true).length;
          const studentsWithoutMediator = filteredStudents.filter((s: any) => s.hasAttendant === false).length;

          // Ranking de escolas por demanda
          const schoolDemandMap = new Map<number, number>();
          mediatorList.filter(m => m.status === "vacancy" || m.status === "on_leave" || m.status === "temp_leave").forEach(m => {
            schoolDemandMap.set(m.schoolId, (schoolDemandMap.get(m.schoolId) || 0) + 1);
          });
          const schoolRanking = schoolList
            .map(s => ({ id: s.id, name: s.name, demand: schoolDemandMap.get(s.id) || 0 }))
            .filter(s => s.demand > 0)
            .sort((a, b) => b.demand - a.demand);
          const emRanking = schoolRanking.filter(s => s.name.startsWith("E M") || s.name.startsWith("EM ")).slice(0, 10);
          const cimRanking = schoolRanking.filter(s => s.name.startsWith("CIM")).slice(0, 10);

          // Gráfico por deficiência
          const disabilityMap = new Map<string, number>();
          filteredStudents.forEach((s: any) => {
            let keys: string[] = [];
            if (s.disabilities) {
              try { keys = JSON.parse(s.disabilities); } catch { keys = [s.disabilities]; }
            }
            if (keys.length === 0) keys = ["Não informado"];
            keys.forEach(k => disabilityMap.set(k, (disabilityMap.get(k) || 0) + 1));
          });
          const byDisability = Array.from(disabilityMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

          // Gráfico por turno
          const shiftMap = new Map<string, number>();
          filteredStudents.forEach((s: any) => {
            const key = s.shift === "morning" ? "Manhã" : s.shift === "afternoon" ? "Tarde" : s.shift === "full" ? "Integral" : s.shift === "evening" ? "Noturno" : "Não informado";
            shiftMap.set(key, (shiftMap.get(key) || 0) + 1);
          });
          const byShift = Array.from(shiftMap.entries()).map(([name, value]) => ({ name, value }));

          // Motivos de inatividade
          const inactivityMap = new Map<string, number>();
          mediatorList.filter(m => m.status !== "active" && m.inactivityReason).forEach(m => {
            const key = m.inactivityReason!;
            inactivityMap.set(key, (inactivityMap.get(key) || 0) + 1);
          });
          const byInactivity = Array.from(inactivityMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

          return {
            totalStudents: filteredStudents.length,
            activeMediators,
            pendingAttendances: pendingList.length,
            externalDemands: demandList.length,
            onLeave,
            vacancies,
            totalSchools: schoolList.length,
            totalMediators: mediatorList.length,
            studentsWithMediator,
            studentsWithoutMediator,
            emRanking,
            cimRanking,
            byDisability,
            byShift,
            byInactivity,
            filtersApplied: { period, unitType, mediatorStatus: mediatorStatusFilter },
          };
        } catch (error) {
          console.error("[Dashboard] Error fetching stats:", error);
          return emptyResult;
        }
      }),'''

if old_stats in content:
    content = content.replace(old_stats, new_stats)
    with open("server/routers.ts", "w") as f:
        f.write(content)
    print("✓ dashboard.stats refatorado com filtros avançados")
else:
    print("✗ Não encontrou a procedure stats para substituir")
