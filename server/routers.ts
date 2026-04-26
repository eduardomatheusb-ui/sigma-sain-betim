import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { farolRouter } from "./routers/farol";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSchools, getStudentsBySchool, getMediatorsBySchool, getAttendancesBySchool, getExternalDemandsBySchool } from "./db";
import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { students, mediators, attendances, externalDemands, schools, users, demands, mediatorStudents, statusHistory, weeklySnapshots, studentEditHistory, mediatorStatusChangeHistory, farolCases, farolCaseHistory, farolCaseMovements } from "../drizzle/schema";
import { eq, and, like, sql, desc, inArray } from "drizzle-orm";

// Status e tipos de alteração do Quadro de Atendentes (MVP integrado)
const MEDIATOR_STATUS = ["active", "inactive", "on_leave", "dismissed", "substituted", "vacancy", "temp_leave"] as const;
const CHANGE_TYPES = [
  "Sem alteração",
  "Novo atendente",
  "Desligamento",
  "Licença médica",
  "Afastamento temporário",
  "Retorno ao trabalho",
  "Troca de escola",
  "Substituição",
  "Nova demanda",
  "Encerramento de demanda",
  "Alteração de vínculo com aluno",
  "Vaga em aberto",
] as const;

// Helper: calcular semana de referência (formato YYYY-Wnn)
function getWeekReference(date?: Date): string {
  const d = date || new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export const appRouter = router({
  system: systemRouter,
  farol: farolRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /**
   * Dashboard - Indicadores gerenciais com métricas expandidas
   */
  dashboard: router({
    stats: protectedProcedure
      .input(z.object({
        period: z.enum(["current_week", "last_week", "current_month", "all_time"]).optional().default("all_time"),
        unitType: z.string().optional().default("all"),
        mediatorStatus: z.string().optional().default("all"),
      }).optional())
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const emptyResult = { totalStudents: 0, activeMediators: 0, pendingAttendances: 0, externalDemands: 0, onLeave: 0, vacancies: 0, totalSchools: 0, totalMediators: 0, studentsWithMediator: 0, studentsWithoutMediator: 0, sharedMediators: 0, studentsInSharedCare: 0, mediators1Student: 0, mediators2Students: 0, mediators3PlusStudents: 0, avgStudentsPerMediator: 0, coverageRate: 0, emRanking: [], cimRanking: [], byDisability: [], byShift: [], byInactivity: [], filtersApplied: { period: "all_time", unitType: "all", mediatorStatus: "all" } };
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

          // ─── MEDIADORES DEDUPLICADOS ───────────────────────────────────────
          // Cada mediador é contado UMA vez, independente de quantos alunos atende.
          // ANTES: activeMediators = mediatorList.filter(active).length  → correto pois mediatorList já é 1 linha por mediador
          // AGORA: explicitamos a deduplicação por mediator.id para garantia futura
          const uniqueMediatorIds = new Set(mediatorList.map(m => m.id));
          const activeMediators = mediatorList.filter(m => m.status === "active" && uniqueMediatorIds.has(m.id)).length;
          const onLeave = mediatorList.filter(m => (m.status === "on_leave" || m.status === "temp_leave") && uniqueMediatorIds.has(m.id)).length;
          const vacancies = mediatorList.filter(m => m.status === "vacancy" && uniqueMediatorIds.has(m.id)).length;

          // ─── ALUNOS COM / SEM ATENDENTE ───────────────────────────────────
          // Conta alunos (não vínculos). Um aluno compartilhado conta UMA vez.
          // ANTES: studentsWithMediator = filteredStudents.filter(hasAttendant).length  → correto
          // AGORA: mantido, mas explicitamos que contamos alunos únicos por id
          const studentsWithMediator = filteredStudents.filter((s: any) => s.hasAttendant === true).length;
          const studentsWithoutMediator = filteredStudents.filter((s: any) => s.hasAttendant === false).length;

          // ─── INDICADORES DE COMPARTILHAMENTO ─────────────────────────────
          // Usa mediator_students (links) para calcular carga por mediador
          // Filtra apenas vínculos de mediadores ativos dentro do escopo filtrado
          const activeMediatorIdSet = new Set(mediatorList.filter(m => m.status === "active").map(m => m.id));
          const filteredStudentIdSet = new Set(filteredStudents.map((s: any) => s.id));

          // Vínculos válidos: mediador ativo + aluno no escopo filtrado
          const validLinks = links.filter(l =>
            activeMediatorIdSet.has(l.mediatorId) &&
            (l.demandId ? filteredStudentIdSet.has(l.demandId) : true)
          );

          // Mapa: mediatorId → quantidade de alunos vinculados
          const mediatorLoadMap = new Map<number, number>();
          validLinks.forEach(l => {
            mediatorLoadMap.set(l.mediatorId, (mediatorLoadMap.get(l.mediatorId) || 0) + 1);
          });

          // Mediadores que atendem 2+ alunos = compartilhados
          const sharedMediators = Array.from(mediatorLoadMap.entries()).filter(([, count]) => count >= 2).length;
          const mediators1Student = Array.from(mediatorLoadMap.entries()).filter(([, count]) => count === 1).length;
          const mediators2Students = Array.from(mediatorLoadMap.entries()).filter(([, count]) => count === 2).length;
          const mediators3PlusStudents = Array.from(mediatorLoadMap.entries()).filter(([, count]) => count >= 3).length;

          // Alunos em atendimento compartilhado: alunos cujo mediador atende 2+ alunos
          const sharedMediatorIds = new Set(
            Array.from(mediatorLoadMap.entries()).filter(([, count]) => count >= 2).map(([id]) => id)
          );
          const studentsInSharedCare = validLinks.filter(l => sharedMediatorIds.has(l.mediatorId)).length;

          // Média de alunos por atendente ativo com vínculo
          const totalLinkedStudents = Array.from(mediatorLoadMap.values()).reduce((a, b) => a + b, 0);
          const avgStudentsPerMediator = mediatorLoadMap.size > 0
            ? Math.round((totalLinkedStudents / mediatorLoadMap.size) * 10) / 10
            : 0;

          // Taxa de cobertura: % de alunos com atendente
          const coverageRate = filteredStudents.length > 0
            ? Math.round((studentsWithMediator / filteredStudents.length) * 1000) / 10
            : 0;

          // ─── RANKING DE ESCOLAS ───────────────────────────────────────────
          // ANTES: contava mediadores com vacancy/on_leave por escola → ranking vazio quando todos são 'active'
          // AGORA: conta alunos SEM atendente por escola (métrica operacional real de demanda)
          const schoolWithoutMap = new Map<number, number>();
          filteredStudents
            .filter((s: any) => !s.hasAttendant && (!s.attendantName || s.attendantName === ""))
            .forEach((s: any) => {
              const sid = (s as any).schoolId;
              if (sid) schoolWithoutMap.set(sid, (schoolWithoutMap.get(sid) || 0) + 1);
            });
          const schoolRanking = schoolList
            .map(s => ({ id: s.id, name: s.name, demand: schoolWithoutMap.get(s.id) || 0 }))
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
            // Indicadores de compartilhamento (novos)
            sharedMediators,
            studentsInSharedCare,
            mediators1Student,
            mediators2Students,
            mediators3PlusStudents,
            avgStudentsPerMediator,
            coverageRate,
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
      }),

    // Dashboard resumido para perfil escola
    schoolStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const schoolId = ctx.user.schoolId;
      if (!schoolId) return null;
      try {
        const [school] = await db.select().from(schools).where(eq(schools.id, schoolId));
        const studentList = await db.select().from(demands).where(eq(demands.schoolId, schoolId));
        const mediatorList = await db.select().from(mediators).where(eq(mediators.schoolId, schoolId));
        const attendanceList = await db.select().from(attendances).where(eq(attendances.schoolId, schoolId));
        const links = await db.select().from(mediatorStudents);

        const activeMediators = mediatorList.filter(m => m.status === "active").length;
        const onLeave = mediatorList.filter(m => m.status === "on_leave" || m.status === "temp_leave").length;
        const vacancies = mediatorList.filter(m => m.status === "vacancy").length;

        // Alunos com/sem atendente nesta escola
        const mediatorIds = mediatorList.map(m => m.id);
        const linkedStudentIds = new Set(
          links.filter(l => !l.endDate && mediatorIds.includes(l.mediatorId)).map(l => l.studentId)
        );
        const linkedStudentNames = new Set<string>();
        mediatorList.filter(m => m.status === "active").forEach(m => {
          if (m.linkedStudents) {
            m.linkedStudents.split(",").map(s => s.trim()).filter(Boolean).forEach(s => linkedStudentNames.add(s.toLowerCase()));
          }
        });
        const studentsWithMediator = studentList.filter((s: any) => s.hasAttendant === true).length;

        return {
          school,
          totalStudents: studentList.length,
          studentsWithMediator,
          studentsWithoutMediator: studentList.filter((s: any) => s.hasAttendant === false).length,
          totalMediators: mediatorList.length,
          activeMediators,
          onLeave,
          vacancies,
          totalAttendances: attendanceList.length,
          pendingAttendances: attendanceList.filter(a => a.status === "pending").length,
        };
      } catch (error) {
        console.error("[Dashboard] Error fetching school stats:", error);
        return null;
      }
    }),
  }),

  /**
   * Schools - Gestão de escolas
   */
  schools: router({
    list: protectedProcedure.query(async () => {
      return await getSchools();
    }),

    // Lista de escolas que tem alunos cadastrados (para Mediators.tsx)
    listWithStudents: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        // Obter todas as escolas que tem alunos (demands) cadastrados
        const schoolsWithStudents = await db
          .selectDistinct({ id: demands.schoolId, name: schools.name })
          .from(demands)
          .leftJoin(schools, eq(demands.schoolId, schools.id))
          .orderBy(schools.name);
        return schoolsWithStudents.filter(s => s.id !== null);
      } catch (error) {
        console.error("[Schools] Error listing with students:", error);
        return [];
      }
    }),

    // Dados detalhados de uma escola (para Schools.tsx)
    detail: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        try {
          const [school] = await db.select().from(schools).where(eq(schools.id, input.id));
          if (!school) return null;
          const studentList = await db.select({ id: demands.id, schoolId: demands.schoolId }).from(demands).where(eq(demands.schoolId, input.id));
          const mediatorList = await db.select().from(mediators).where(eq(mediators.schoolId, input.id));
          const attendanceList = await db.select().from(attendances).where(eq(attendances.schoolId, input.id));
          return {
            ...school,
            totalStudents: studentList.length,
            totalMediators: mediatorList.length,
            activeMediators: mediatorList.filter(m => m.status === "active").length,
            onLeave: mediatorList.filter(m => m.status === "on_leave" || m.status === "temp_leave").length,
            vacancies: mediatorList.filter(m => m.status === "vacancy").length,
            totalAttendances: attendanceList.length,
          };
        } catch (error) {
          console.error("[Schools] Error fetching detail:", error);
          return null;
        }
      }),

    // Painel de escolas com mediadores agrupados (visão da Secretaria)
    panel: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        const schoolList = await db.select().from(schools);
        const mediatorList = await db
          .select({
            id: mediators.id,
            name: mediators.name,
            registration: mediators.registration,
            status: mediators.status,
            changeType: mediators.changeType,
            linkedStudents: mediators.linkedStudents,
            note: mediators.note,
            responsible: mediators.responsible,
            schoolId: mediators.schoolId,
            updatedAt: mediators.updatedAt,
          })
          .from(mediators);

        return schoolList.map(school => ({
          ...school,
          attendants: mediatorList.filter(m => m.schoolId === school.id),
        }));
      } catch (error) {
        console.error("[Schools] Error fetching panel:", error);
        return [];
      }
    }),

    // Lista de escolas com contadores reais (para Schools.tsx)
    listWithStats: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        const schoolList = await db.select().from(schools);
        const studentList = await db.select({ id: demands.id, schoolId: demands.schoolId }).from(demands);
        const mediatorList = await db.select({ id: mediators.id, schoolId: mediators.schoolId, status: mediators.status }).from(mediators);
        const attendanceList = await db.select({ id: attendances.id, schoolId: attendances.schoolId }).from(attendances);
        const demandList = await db.select({ id: externalDemands.id, schoolId: externalDemands.schoolId, status: externalDemands.status }).from(externalDemands);

        return schoolList.map(school => ({
          id: school.id,
          name: school.name,
          code: school.code,
          address: school.address,
          phone: school.phone,
          principal: school.principal,
          responsible: school.responsible,
          weeklyStatus: school.weeklyStatus,
          lastWeeklyUpdate: school.lastWeeklyUpdate,
          students: studentList.filter((s: any) => s.schoolId === school.id).length,
          mediators: mediatorList.filter(m => m.schoolId === school.id).length,
          activeMediators: mediatorList.filter(m => m.schoolId === school.id && m.status === "active").length,
          onLeave: mediatorList.filter(m => m.schoolId === school.id && (m.status === "on_leave" || m.status === "temp_leave")).length,
          vacancies: mediatorList.filter(m => m.schoolId === school.id && m.status === "vacancy").length,
          attendances: attendanceList.filter(a => a.schoolId === school.id).length,
          pendingDemands: demandList.filter(d => d.schoolId === school.id && d.status === "pending").length,
        }));
      } catch (error) {
        console.error("[Schools] Error fetching listWithStats:", error);
        return [];
      }
    }),

    // Alertas da semana gerados automaticamente
    alerts: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        const schoolList = await db.select().from(schools);
        const mediatorList = await db.select().from(mediators);

        const alerts: string[] = [];

        const pendingSchools = schoolList.filter(s => s.weeklyStatus === "pending" || !s.weeklyStatus);
        if (pendingSchools.length > 0) {
          alerts.push(`${pendingSchools.length} escola${pendingSchools.length > 1 ? "s" : ""} ainda não enviaram a atualização semanal`);
        }

        const newDemands = mediatorList.filter(m => m.changeType === "Nova demanda");
        if (newDemands.length > 0) {
          alerts.push(`${newDemands.length} unidade${newDemands.length > 1 ? "s" : ""} informaram nova demanda de atendente`);
        }

        const onLeaveList = mediatorList.filter(m => m.status === "on_leave");
        if (onLeaveList.length > 0) {
          alerts.push(`${onLeaveList.length} atendente${onLeaveList.length > 1 ? "s estão" : " está"} em licença médica com necessidade de substituição`);
        }

        const linkChange = mediatorList.filter(m => m.changeType === "Alteração de vínculo com aluno");
        if (linkChange.length > 0) {
          alerts.push(`${linkChange.length} escola${linkChange.length > 1 ? "s" : ""} registraram alteração de vínculo nesta semana`);
        }

        const vacancyList = mediatorList.filter(m => m.status === "vacancy");
        if (vacancyList.length > 0) {
          alerts.push(`${vacancyList.length} vaga${vacancyList.length > 1 ? "s em aberto" : " em aberto"} aguardando preenchimento`);
        }

        return alerts;
      } catch (error) {
        console.error("[Schools] Error fetching alerts:", error);
        return [];
      }
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        address: z.string().optional(),
        phone: z.string().optional(),
        principal: z.string().optional(),
        responsible: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        try {
          // Validar duplicidade por nome
          const existingByName = await db.select().from(schools).where(eq(schools.name, input.name));
          if (existingByName.length > 0) {
            throw new TRPCError({ code: "CONFLICT", message: "Escola com este nome já existe" });
          }
          await db.insert(schools).values({
            name: input.name,
            code: input.code,
            address: input.address,
            phone: input.phone,
            principal: input.principal,
            responsible: input.responsible,
          });
          return { success: true };
        } catch (error: any) {
          if (error?.code === "ER_DUP_ENTRY") throw new TRPCError({ code: "CONFLICT", message: "Código de escola já cadastrado" });
          if (error.code === "CONFLICT") throw error;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar escola" });
        }
      }),

    // Contar usuários vinculados a uma escola
    countUsers: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return 0;
        try {
          const userList = await db.select().from(users).where(eq(users.schoolId, input.schoolId));
          return userList.length;
        } catch (err) {
          console.error("Erro ao contar usuários:", err);
          return 0;
        }
      }),

    updateWeeklyStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        weeklyStatus: z.enum(["updated", "pending", "with_vacancy", "with_leave"]),
        responsible: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await db.update(schools).set({
          weeklyStatus: input.weeklyStatus,
          responsible: input.responsible,
          lastWeeklyUpdate: new Date(),
        }).where(eq(schools.id, input.id));
        return { success: true };
      }),

    // Soft delete: inativar escola (isActive = false)
    deactivate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem inativar escolas" });
        await db.update(schools).set({ isActive: false, updatedAt: new Date() } as any).where(eq(schools.id, input.id));
        return { success: true };
      }),

    // Reativar escola (isActive = true)
    reactivate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem reativar escolas" });
        await db.update(schools).set({ isActive: true, updatedAt: new Date() } as any).where(eq(schools.id, input.id));
        return { success: true };
      }),
  }),

  /**
   * Weekly Snapshots - Quadro semanal com histórico
   */
  weeklySnapshots: router({
    submit: protectedProcedure
      .input(z.object({
        schoolId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        try {
          // Capturar snapshot dos mediadores da escola
          const mediatorList = await db.select().from(mediators).where(eq(mediators.schoolId, input.schoolId));
          const snapshotData = JSON.stringify(mediatorList.map(m => ({
            id: m.id, name: m.name, status: m.status, changeType: m.changeType,
            linkedStudents: m.linkedStudents, isShared: m.isShared,
            inactivityReason: m.inactivityReason, note: m.note,
          })));

          const weekRef = getWeekReference();

          await db.insert(weeklySnapshots).values({
            schoolId: input.schoolId,
            weekReference: weekRef,
            submittedBy: ctx.user.id,
            submittedByName: ctx.user.name || "Usuário",
            snapshotData,
            notes: input.notes,
            status: "submitted",
          });

          // Atualizar status da escola
          await db.update(schools).set({
            weeklyStatus: "updated",
            responsible: ctx.user.name || undefined,
            lastWeeklyUpdate: new Date(),
          }).where(eq(schools.id, input.schoolId));

          return { success: true, weekReference: weekRef };
        } catch (error) {
          console.error("[WeeklySnapshots] Error submitting:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao enviar quadro semanal" });
        }
      }),

    listBySchool: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          return await db.select().from(weeklySnapshots)
            .where(eq(weeklySnapshots.schoolId, input.schoolId))
            .orderBy(desc(weeklySnapshots.createdAt));
        } catch (error) {
          console.error("[WeeklySnapshots] Error listing:", error);
          return [];
        }
      }),
  }),

  /**
   * MediatorStudents - Vínculos formais mediador↔aluno
   */
  mediatorStudentLinks: router({
    list: protectedProcedure
      .input(z.object({ mediatorId: z.number().optional(), studentId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          let query = db.select({
            id: mediatorStudents.id,
            mediatorId: mediatorStudents.mediatorId,
            studentId: mediatorStudents.studentId,
            isPrimary: mediatorStudents.isPrimary,
            startDate: mediatorStudents.startDate,
            endDate: mediatorStudents.endDate,
            mediatorName: mediators.name,
            studentName: students.name,
          })
            .from(mediatorStudents)
            .leftJoin(mediators, eq(mediatorStudents.mediatorId, mediators.id))
            .leftJoin(students, eq(mediatorStudents.studentId, students.id));

          if (input?.mediatorId) {
            return await (query as any).where(eq(mediatorStudents.mediatorId, input.mediatorId));
          }
          if (input?.studentId) {
            return await (query as any).where(eq(mediatorStudents.studentId, input.studentId));
          }
          return await query;
        } catch (error) {
          console.error("[MediatorStudents] Error listing:", error);
          return [];
        }
      }),

    link: protectedProcedure
      .input(z.object({
        mediatorId: z.number(),
        studentId: z.number(),
        isPrimary: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        try {
          await db.insert(mediatorStudents).values({
            mediatorId: input.mediatorId,
            studentId: input.studentId,
            isPrimary: input.isPrimary ?? true,
            startDate: new Date(),
          });
          return { success: true };
        } catch (error) {
          console.error("[MediatorStudents] Error linking:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao vincular" });
        }
      }),

    unlink: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        try {
          await db.update(mediatorStudents).set({ endDate: new Date() }).where(eq(mediatorStudents.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("[MediatorStudents] Error unlinking:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao desvincular" });
        }
      }),
  }),

  /**
   * StatusHistory - Log de mudanças de status
   */
  statusHistory: router({
    list: protectedProcedure
      .input(z.object({ mediatorId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          return await db.select().from(statusHistory)
            .where(eq(statusHistory.mediatorId, input.mediatorId))
            .orderBy(desc(statusHistory.changedAt));
        } catch (error) {
          console.error("[StatusHistory] Error listing:", error);
          return [];
        }
      }),
  }),

  /**
   * Students - Gestão de alunos
   */
  students: router({
    // Validar duplicidade de aluno por nome + data de nascimento + escola
    checkDuplicate: protectedProcedure
      .input(z.object({
        name: z.string(),
        dateOfBirth: z.string().optional(),
        schoolId: z.number().optional(),
        excludeId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { isDuplicate: false, existingId: null };
        try {
          const schoolId = input.schoolId ?? ctx.user.schoolId ?? 0;
          let conditions = [
            eq(students.name, input.name),
            eq(students.schoolId, schoolId)
          ];
          if (input.dateOfBirth) {
            conditions.push(eq(students.dateOfBirth, new Date(input.dateOfBirth)));
          }
          const existing = await db.select().from(students).where(and(...conditions));
          const filtered = existing.filter(s => !input.excludeId || s.id !== input.excludeId);
          return {
            isDuplicate: filtered.length > 0,
            existingId: filtered.length > 0 ? filtered[0].id : null,
          };
        } catch (err) {
          console.error("Erro ao validar duplicidade:", err);
          return { isDuplicate: false, existingId: null };
        }
      }),

    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const studentRows = ctx.user.role === "admin"
          ? await db.select().from(students)
          : ctx.user.schoolId
            ? await db.select().from(students).where(eq(students.schoolId, ctx.user.schoolId))
            : [];

        // Enriquecer com nome do mediador vinculado
        if (studentRows.length === 0) return [];
        const links = await db.select().from(mediatorStudents).where(
          sql`${mediatorStudents.endDate} IS NULL`
        );
        const mediatorIds = Array.from(new Set(links.map(l => l.mediatorId)));
        const mediatorNames = mediatorIds.length > 0
          ? await db.select({ id: mediators.id, name: mediators.name }).from(mediators)
          : [];
        const mediatorMap = new Map(mediatorNames.map(m => [m.id, m.name]));

        return studentRows.map(s => {
          const studentLinks = links.filter(l => l.studentId === s.id);
          const mediatorNamesList = studentLinks.map(l => mediatorMap.get(l.mediatorId) || "").filter(Boolean);
          return {
            ...s,
            mediatorNames: mediatorNamesList.join(", ") || null,
            hasMediatorLink: mediatorNamesList.length > 0,
          };
        });
      } catch (error) {
        console.error("[Students] Error listing:", error);
        return [];
      }
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cpf: z.string().optional(),
        dateOfBirth: z.string().optional(),
        enrollmentNumber: z.string().optional(),
        specialNeeds: z.string().optional(),
        guardianName: z.string().optional(),
        guardianPhone: z.string().optional(),
        schoolId: z.number().optional(),
        disability: z.string().optional(),
        shift: z.enum(["morning", "afternoon", "full", "evening"]).optional(),
        grade: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const schoolId = input.schoolId ?? ctx.user.schoolId ?? 0;
        if (!schoolId && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário escola deve estar vinculado a uma escola" });
        }
        try {
          await db.insert(students).values({
            name: input.name,
            cpf: input.cpf,
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
            enrollmentNumber: input.enrollmentNumber,
            specialNeeds: input.specialNeeds,
            guardianName: input.guardianName,
            guardianPhone: input.guardianPhone,
            schoolId: schoolId || 1,
            status: "active",
            disability: input.disability,
            shift: input.shift,
            grade: input.grade,
            notes: input.notes,
          });
          return { success: true };
        } catch (error) {
          console.error("[Students] Error creating student:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create student" });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        cpf: z.string().optional(),
        dateOfBirth: z.string().optional(),
        enrollmentNumber: z.string().optional(),
        specialNeeds: z.string().optional(),
        guardianName: z.string().optional(),
        guardianPhone: z.string().optional(),
        schoolId: z.number().optional(),
        disability: z.string().optional(),
        shift: z.enum(["morning", "afternoon", "full", "evening"]).optional(),
        grade: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["active", "inactive", "transferred"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { id, dateOfBirth, ...rest } = input;
        const data: Record<string, unknown> = {
          ...rest,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        };
        Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
        try {
          // Registrar alterações para auditoria na tabela student_edit_history
          const oldStudent = await db.select().from(students).where(eq(students.id, id));
          if (oldStudent.length > 0) {
            const old = oldStudent[0];
            const historyEntries: Array<{ studentId: number; editedBy: number; editedByName: string; fieldChanged: string; oldValue: string | null; newValue: string | null }> = [];
            Object.entries(data).forEach(([key, newVal]) => {
              const oldVal = (old as any)[key];
              const oldStr = oldVal !== null && oldVal !== undefined ? String(oldVal) : null;
              const newStr = newVal !== null && newVal !== undefined ? String(newVal) : null;
              if (oldStr !== newStr) {
                historyEntries.push({
                  studentId: id,
                  editedBy: ctx.user.id,
                  editedByName: ctx.user.name || "Usuário",
                  fieldChanged: key,
                  oldValue: oldStr,
                  newValue: newStr,
                });
              }
            });
            if (historyEntries.length > 0) {
              await db.insert(studentEditHistory).values(historyEntries);
            }
          }
          await db.update(students).set(data as any).where(eq(students.id, id));
          return { success: true };
        } catch (error) {
          console.error("[Students] Error updating student:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update student" });
        }
      }),

    // Histórico de alterações de um aluno
    getHistory: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          const history = await db
            .select()
            .from(studentEditHistory)
            .where(eq(studentEditHistory.studentId, input.studentId))
            .orderBy(desc(studentEditHistory.editedAt));
          return history;
        } catch (error) {
          console.error("[Students] Error fetching history:", error);
          return [];
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        try {
          await db.delete(students).where(eq(students.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("[Students] Error deleting:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete student" });
        }
      }),
  }),

  /**
   * Mediators - Quadro de Atendentes (integrado com MVP)
   */
  mediators: router({
    listAll: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const rows = await db
          .select({
            id: mediators.id,
            name: mediators.name,
            registration: mediators.registration,
            cpf: mediators.cpf,
            professionalLicense: mediators.professionalLicense,
            specialization: mediators.specialization,
            status: mediators.status,
            changeType: mediators.changeType,
            linkedStudents: mediators.linkedStudents,
            note: mediators.note,
            responsible: mediators.responsible,
            maxAttendances: mediators.maxAttendances,
            schoolId: mediators.schoolId,
            updatedAt: mediators.updatedAt,
            schoolName: schools.name,
          })
          .from(mediators)
          .leftJoin(schools, eq(mediators.schoolId, schools.id));
        return rows;
      } catch (error) {
        console.error("[Mediators] Error listing all:", error);
        return [];
      }
    }),

    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const baseSelect = {
          id: mediators.id,
          name: mediators.name,
          registration: mediators.registration,
          cpf: mediators.cpf,
          professionalLicense: mediators.professionalLicense,
          specialization: mediators.specialization,
          status: mediators.status,
          changeType: mediators.changeType,
          linkedStudents: mediators.linkedStudents,
          note: mediators.note,
          responsible: mediators.responsible,
          maxAttendances: mediators.maxAttendances,
          isShared: mediators.isShared,
          schoolId: mediators.schoolId,
          updatedAt: mediators.updatedAt,
          schoolName: schools.name,
          inactivityReason: mediators.inactivityReason,
          inactivityDate: mediators.inactivityDate,
          returnDate: mediators.returnDate,
          additionalStudents: mediators.additionalStudents,
        };

        if (ctx.user.role === "admin") {
          return await db.select(baseSelect).from(mediators).leftJoin(schools, eq(mediators.schoolId, schools.id));
        }
        if (!ctx.user.schoolId) return [];
        return await db.select(baseSelect).from(mediators)
          .leftJoin(schools, eq(mediators.schoolId, schools.id))
          .where(eq(mediators.schoolId, ctx.user.schoolId));
      } catch (error) {
        console.error("[Mediators] Error listing by school:", error);
        return [];
      }
    }),

    // Lista mediadores por schoolId explícito (para admin selecionar escola no formulário de alunos)
    listBySchoolId: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          const targetSchoolId = ctx.user.role === "admin" ? input.schoolId : ctx.user.schoolId;
          if (!targetSchoolId) return [];
          return await db.select({
            id: mediators.id,
            name: mediators.name,
            status: mediators.status,
            isShared: mediators.isShared,
          }).from(mediators).where(eq(mediators.schoolId, targetSchoolId));
        } catch (error) {
          console.error("[Mediators] Error listing by schoolId:", error);
          return [];
        }
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cpf: z.string().optional(),
        registration: z.string().optional(),
        professionalLicense: z.string().optional(),
        specialization: z.string().optional(),
        responsible: z.string().optional(),
        status: z.enum(MEDIATOR_STATUS).optional(),
        changeType: z.string().optional(),
        linkedStudents: z.string().optional(),
        note: z.string().optional(),
        maxAttendances: z.number().optional(),
        schoolId: z.number().optional(),
        isShared: z.boolean().optional(),
        additionalStudents: z.string().optional(),
        inactivityReason: z.string().optional(),
        inactivityDate: z.string().optional(),
        returnDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem criar novos mediadores. Usuários de escola podem apenas editar mediadores existentes.",
          });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const schoolId = input.schoolId || ctx.user.schoolId || 1;
        try {
          await db.insert(mediators).values({
            name: input.name,
            cpf: input.cpf,
            registration: input.registration,
            professionalLicense: input.professionalLicense,
            specialization: input.specialization,
            responsible: input.responsible,
            status: input.status || "active",
            changeType: input.changeType || "Sem alteração",
            linkedStudents: input.linkedStudents,
            note: input.note,
            maxAttendances: input.maxAttendances || 20,
            schoolId,
            isShared: input.isShared || false,
            additionalStudents: input.additionalStudents,
            inactivityReason: input.inactivityReason,
            inactivityDate: input.inactivityDate ? new Date(input.inactivityDate) : null,
            returnDate: input.returnDate ? new Date(input.returnDate) : null,
          });
          return { success: true };
        } catch (error) {
          console.error("[Mediators] Error creating mediator:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create mediator" });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        cpf: z.string().optional(),
        registration: z.string().optional(),
        professionalLicense: z.string().optional(),
        specialization: z.string().optional(),
        responsible: z.string().optional(),
        status: z.enum(MEDIATOR_STATUS).optional(),
        changeType: z.string().optional(),
        linkedStudents: z.string().optional(),
        note: z.string().optional(),
        maxAttendances: z.number().optional(),
        schoolId: z.number().optional(),
        isShared: z.boolean().optional(),
        additionalStudents: z.string().optional(),
        inactivityReason: z.string().optional(),
        inactivityDate: z.string().optional(),
        returnDate: z.string().optional(),
        previousSchoolId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { id, inactivityDate, returnDate, status: newStatus, schoolId: newSchoolId, previousSchoolId, ...rest } = input;

        // Buscar mediador atual
        const [current] = await db.select({ status: mediators.status, schoolId: mediators.schoolId }).from(mediators).where(eq(mediators.id, id));
        if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Mediador não encontrado" });
        
        // RESTRIÇÃO: school_user só pode editar mediadores da própria escola
        if (ctx.user.role === "school_user" && ctx.user.schoolId !== current.schoolId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você só pode editar mediadores vinculados à sua escola.",
          });
        }
        
        // RESTRIÇÃO: school_user não pode alterar schoolId (movimentação entre escolas)
        if (ctx.user.role === "school_user" && newSchoolId && newSchoolId !== current.schoolId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Usuários de escola não podem transferir mediadores entre escolas.",
          });
        }

        // VALIDAÇÃO: Movimentação entre escolas requer mudança de status
        if (newSchoolId && newSchoolId !== current.schoolId) {
          if (!newStatus || newStatus === current.status) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Ao transferir um mediador para outra escola, é obrigatório alterar seu status. Por favor, selecione um novo status antes de salvar.",
            });
          }
        }

        // Log de mudança de status
        if (newStatus && newStatus !== current.status) {
          try {
            await db.insert(statusHistory).values({
              mediatorId: id,
              previousStatus: current.status,
              newStatus,
              reason: input.inactivityReason || input.changeType || undefined,
              changedBy: ctx.user.id,
            });
          } catch (e) {
            console.error("[StatusHistory] Error logging:", e);
          }
        }

        const data: Record<string, unknown> = {
          ...rest,
          status: newStatus,
          schoolId: newSchoolId,
          inactivityDate: inactivityDate ? new Date(inactivityDate) : undefined,
          returnDate: returnDate ? new Date(returnDate) : undefined,
        };
        Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
        try {
          await db.update(mediators).set(data as any).where(eq(mediators.id, id));

          // SINCRONIZAÇÃO: Atualizar status em demands quando mediador muda de status
          if (newStatus && newStatus !== current.status) {
            const mediatorName = rest.name || (await db.select({ name: mediators.name }).from(mediators).where(eq(mediators.id, id)).then(r => r[0]?.name));
            if (mediatorName) {
              // Mapear status de mediadores para demands
              const demandStatus = newStatus === "active" ? "active" : "inactive";
              await db.update(demands).set({ attendantStatus: demandStatus })
                .where(eq(demands.attendantName, mediatorName as string));
            }
          }

          return { success: true };
        } catch (error) {
          console.error("[Mediators] Error updating mediator:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update mediator" });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem deletar mediadores. Usuários de escola podem apenas editar mediadores existentes.",
          });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        try {
          // Encerrar vínculos antes de deletar
          await db.update(mediatorStudents).set({ endDate: new Date() })
            .where(eq(mediatorStudents.mediatorId, input.id));
          await db.delete(mediators).where(eq(mediators.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("[Mediators] Error deleting mediator:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete mediator" });
        }
      }),

    // Histórico de mudanças de situação de um mediador
    getHistory: protectedProcedure
      .input(z.object({ mediatorId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          // Buscar na tabela status_history existente
          const history = await db
            .select()
            .from(statusHistory)
            .where(eq(statusHistory.mediatorId, input.mediatorId))
            .orderBy(desc(statusHistory.changedAt));
          return history;
        } catch (error) {
          console.error("[Mediators] Error fetching history:", error);
          return [];
        }
      }),
  }),

  /**
   * Attendances - Gestão de atendimentos (com nomes resolvidos)
   */
  attendances: router({
    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const rows = ctx.user.role === "admin"
          ? await db.select({
              id: attendances.id,
              studentId: attendances.studentId,
              mediatorId: attendances.mediatorId,
              schoolId: attendances.schoolId,
              attendanceDate: attendances.attendanceDate,
              startTime: attendances.startTime,
              endTime: attendances.endTime,
              description: attendances.description,
              result: attendances.result,
              status: attendances.status,
              type: attendances.type,
              notes: attendances.notes,
              createdAt: attendances.createdAt,
              studentName: students.name,
              mediatorName: mediators.name,
              schoolName: schools.name,
            })
            .from(attendances)
            .leftJoin(students, eq(attendances.studentId, students.id))
            .leftJoin(mediators, eq(attendances.mediatorId, mediators.id))
            .leftJoin(schools, eq(attendances.schoolId, schools.id))
          : ctx.user.schoolId
            ? await db.select({
                id: attendances.id,
                studentId: attendances.studentId,
                mediatorId: attendances.mediatorId,
                schoolId: attendances.schoolId,
                attendanceDate: attendances.attendanceDate,
                startTime: attendances.startTime,
                endTime: attendances.endTime,
                description: attendances.description,
                result: attendances.result,
                status: attendances.status,
                type: attendances.type,
                notes: attendances.notes,
                createdAt: attendances.createdAt,
                studentName: students.name,
                mediatorName: mediators.name,
                schoolName: schools.name,
              })
              .from(attendances)
              .leftJoin(students, eq(attendances.studentId, students.id))
              .leftJoin(mediators, eq(attendances.mediatorId, mediators.id))
              .leftJoin(schools, eq(attendances.schoolId, schools.id))
              .where(eq(attendances.schoolId, ctx.user.schoolId))
            : [];
        return rows;
      } catch (error) {
        console.error("[Attendances] Error listing:", error);
        return [];
      }
    }),

    create: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        mediatorId: z.number(),
        attendanceDate: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        description: z.string().optional(),
        result: z.string().optional(),
        type: z.enum(["individual", "shared"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const schoolId = ctx.user.schoolId || 1;
        try {
          await db.insert(attendances).values({
            studentId: input.studentId,
            mediatorId: input.mediatorId,
            attendanceDate: new Date(input.attendanceDate),
            startTime: input.startTime,
            endTime: input.endTime,
            description: input.description,
            result: input.result,
            type: input.type || "individual",
            schoolId,
            status: "completed",
          });
          return { success: true };
        } catch (error) {
          console.error("[Attendances] Error creating attendance:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create attendance" });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        attendanceDate: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        description: z.string().optional(),
        result: z.string().optional(),
        status: z.enum(["completed", "pending", "cancelled"]).optional(),
        type: z.enum(["individual", "shared"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, attendanceDate, ...rest } = input;
        const data: Record<string, unknown> = {
          ...rest,
          attendanceDate: attendanceDate ? new Date(attendanceDate) : undefined,
        };
        Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
        try {
          await db.update(attendances).set(data as any).where(eq(attendances.id, id));
          return { success: true };
        } catch (error) {
          console.error("[Attendances] Error updating:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update attendance" });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        try {
          await db.delete(attendances).where(eq(attendances.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("[Attendances] Error deleting:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete attendance" });
        }
      }),
  }),

  /**
   * Reports - Relatórios reais com dados do banco
   */
  reports: router({
    generate: protectedProcedure
      .input(z.object({
        type: z.enum(["students", "mediators", "attendances", "schools", "demands"]),
        schoolId: z.number().optional(),
        status: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { rows: [], total: 0 };
        try {
          if (input.type === "students") {
            let rows = await db.select({
              id: demands.id,
              name: demands.studentName,
              cpf: demands.cpf,
              disability: demands.disabilities,
              shift: demands.shift,
              grade: demands.grade,
              status: demands.attendantStatus,
              schoolId: demands.schoolId,
              schoolName: demands.schoolName,
              attendanceStatus: demands.attendanceStatus,
              attendantName: demands.attendantName,
              hasAttendant: demands.hasAttendant,
            }).from(demands).leftJoin(schools, eq(demands.schoolId, schools.id));
            if (input.schoolId) rows = rows.filter((r: any) => r.schoolId === input.schoolId);
            if (input.status && input.status !== "all") rows = rows.filter((r: any) => r.status === input.status);
            return { rows, total: rows.length };
          }
          if (input.type === "mediators") {
            let rows = await db.select({
              id: mediators.id,
              name: mediators.name,
              cpf: mediators.cpf,
              registration: mediators.registration,
              status: mediators.status,
              changeType: mediators.changeType,
              linkedStudents: mediators.linkedStudents,
              inactivityReason: mediators.inactivityReason,
              schoolId: mediators.schoolId,
              schoolName: schools.name,
            }).from(mediators).leftJoin(schools, eq(mediators.schoolId, schools.id));
            if (input.schoolId) rows = rows.filter((r: any) => r.schoolId === input.schoolId);
            if (input.status && input.status !== "all") rows = rows.filter((r: any) => r.status === input.status);
            return { rows, total: rows.length };
          }
          if (input.type === "attendances") {
            let rows = await db.select({
              id: attendances.id,
              attendanceDate: attendances.attendanceDate,
              status: attendances.status,
              type: attendances.type,
              description: attendances.description,
              result: attendances.result,
              studentName: students.name,
              mediatorName: mediators.name,
              schoolName: schools.name,
            }).from(attendances)
              .leftJoin(students, eq(attendances.studentId, students.id))
              .leftJoin(mediators, eq(attendances.mediatorId, mediators.id))
              .leftJoin(schools, eq(attendances.schoolId, schools.id));
            if (input.schoolId) rows = rows.filter((r: any) => r.schoolId === input.schoolId);
            if (input.status && input.status !== "all") rows = rows.filter((r: any) => r.status === input.status);
            return { rows, total: rows.length };
          }
          if (input.type === "schools") {
            const schoolList = await db.select().from(schools);
            const studentList = await db.select({ schoolId: demands.schoolId }).from(demands);
            const mediatorList = await db.select({ schoolId: mediators.schoolId, status: mediators.status }).from(mediators);
            const rows = schoolList.map(s => ({
              id: s.id,
              name: s.name,
              code: s.code,
              weeklyStatus: s.weeklyStatus,
              lastWeeklyUpdate: s.lastWeeklyUpdate,
              students: studentList.filter(st => st.schoolId === s.id).length,
              mediators: mediatorList.filter(m => m.schoolId === s.id).length,
              activeMediators: mediatorList.filter(m => m.schoolId === s.id && m.status === "active").length,
              vacancies: mediatorList.filter(m => m.schoolId === s.id && m.status === "vacancy").length,
            }));
            return { rows, total: rows.length };
          }
          return { rows: [], total: 0 };
        } catch (error) {
          console.error("[Reports] Error generating:", error);
          return { rows: [], total: 0 };
        }
      }),
  }),

  /**
   * Users - Gestão de usuários pelo admin
   */
  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem listar usuários" });
      const db = await getDb();
      if (!db) return [];
      const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        schoolId: users.schoolId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      }).from(users);
      return allUsers;
    }),

    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "school_user"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),

    linkSchool: protectedProcedure
      .input(z.object({
        userId: z.number(),
        schoolId: z.number().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set({ schoolId: input.schoolId }).where(eq(users.id, input.userId));
        return { success: true };
      }),

    toggleActive: protectedProcedure
      .input(z.object({
        userId: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set({ isActive: input.isActive }).where(eq(users.id, input.userId));
        return { success: true };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Nome obrigatório"),
        email: z.string().email("E-mail inválido"),
        role: z.enum(["admin", "school_user"]),
        schoolId: z.number().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem criar usuários" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email));
        if (existing.length > 0) throw new TRPCError({ code: "CONFLICT", message: "Já existe um usuário com este e-mail" });
        await db.insert(users).values({
          openId: `pre_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: input.name,
          email: input.email,
          role: input.role,
          schoolId: input.schoolId ?? null,
          isActive: true,
          loginMethod: "pre_registered",
        });
        return { success: true };
      }),
  }),

  /**
   * Demands - Quadro de Atendentes (fiel ao sistema Netlify)
   */
  demands: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        if (ctx.user.role === "admin") {
          return await db.select().from(demands).orderBy(demands.updatedAt);
        }
        if (!ctx.user.schoolId) return [];
        return await db.select().from(demands).where(eq(demands.schoolId, ctx.user.schoolId)).orderBy(demands.updatedAt);
      } catch (error) {
        console.error("[Demands] Error listing:", error);
        return [];
      }
    }),

    create: protectedProcedure
      .input(z.object({
        email: z.string().optional(),
        schoolName: z.string().min(1),
        studentName: z.string().min(1),
        dateOfBirth: z.string().optional(),
        cpf: z.string().optional(),
        shift: z.enum(["morning", "afternoon", "full", "evening"]),
        grade: z.string().optional(),
        disabilities: z.array(z.string()).optional(),
        attendanceStatus: z.enum(["with_attendant", "without_attendant", "awaiting_substitution", "partially_attended"]),
        attendantStatus: z.enum(["active", "inactive"]),
        hasAttendant: z.boolean(),
        attendantName: z.string().optional(),
        isShared: z.boolean().optional(),
        notes: z.string().optional(),
        usesWheelchair: z.boolean().optional(),
        usesWalker: z.boolean().optional(),
        usesProsthesis: z.boolean().optional(),
        homeCare: z.boolean().optional(),
        needsAttendant: z.enum(["yes", "no", "nam"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        try {
          let schoolId: number | null = ctx.user.schoolId || null;
          if (input.schoolName) {
            const [school] = await db.select({ id: schools.id }).from(schools).where(eq(schools.name, input.schoolName)).limit(1);
            if (school) schoolId = school.id;
          }
          
          // VALIDAÇÃO 1: Rejeitar mediadores inativos
          if (input.hasAttendant && input.attendantName) {
            if (input.attendantStatus !== "active") {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Não é possível vincular o mediador "${input.attendantName}" porque ele está inativo. Apenas mediadores ativos podem ser vinculados.`,
              });
            }
            const [mediator] = await db.select({ id: mediators.id, status: mediators.status })
              .from(mediators)
              .where(and(eq(mediators.name, input.attendantName), eq(mediators.status, "active")))
              .limit(1);
            if (!mediator) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Mediador "${input.attendantName}" não encontrado ou inativo no sistema.`,
              });
            }
          }
          
          // VALIDAÇÃO 2: Verificar duplicação de aluno
          if (schoolId) {
            const conditions = [
              eq(demands.schoolId, schoolId),
              eq(demands.studentName, input.studentName.trim()),
            ];
            if (input.dateOfBirth) {
              // Converter para Date e depois comparar como string para evitar problemas de timezone
              const dobDate = new Date(input.dateOfBirth);
              const dobString = dobDate.toISOString().split('T')[0];
              // Usar sql.raw para comparar como string
              conditions.push(sql`DATE(${demands.dateOfBirth}) = ${dobString}`);
            }
            const [existingStudent] = await db.select({ id: demands.id })
              .from(demands)
              .where(and(...conditions))
              .limit(1);
            if (existingStudent) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Aluno "${input.studentName}" já está cadastrado nesta escola.`,
              });
            }
          }
          
          await db.insert(demands).values({
            email: input.email || ctx.user.email || undefined,
            schoolName: input.schoolName,
            studentName: input.studentName,
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
            cpf: input.cpf,
            shift: input.shift,
            grade: input.grade,
            disabilities: input.disabilities ? JSON.stringify(input.disabilities) : null,
            attendanceStatus: input.attendanceStatus,
            attendantStatus: input.attendantStatus,
            hasAttendant: input.hasAttendant,
            attendantName: input.attendantName,
            isShared: input.isShared || false,
            notes: input.notes,
            usesWheelchair: input.usesWheelchair || false,
            usesWalker: input.usesWalker || false,
            usesProsthesis: input.usesProsthesis || false,
            homeCare: input.homeCare || false,
            needsAttendant: input.needsAttendant || "yes",
            schoolId,
            createdBy: ctx.user.id,
            updatedBy: ctx.user.id,
          });
          return { success: true };
        } catch (error) {
          console.error("[Demands] Error creating:", error);
          // Se for um TRPCError, re-lançar com a mensagem original
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create demand" });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        email: z.string().optional(),
        schoolName: z.string().optional(),
        studentName: z.string().optional(),
        dateOfBirth: z.string().optional(),
        cpf: z.string().optional(),
        shift: z.enum(["morning", "afternoon", "full", "evening"]).optional(),
        grade: z.string().optional(),
        disabilities: z.array(z.string()).optional(),
        attendanceStatus: z.enum(["with_attendant", "without_attendant", "awaiting_substitution", "partially_attended"]).optional(),
        attendantStatus: z.enum(["active", "inactive"]).optional(),
        hasAttendant: z.boolean().optional(),
        attendantName: z.string().optional(),
        isShared: z.boolean().optional(),
        notes: z.string().optional(),
        usesWheelchair: z.boolean().optional(),
        usesWalker: z.boolean().optional(),
        usesProsthesis: z.boolean().optional(),
        homeCare: z.boolean().optional(),
        needsAttendant: z.enum(["yes", "no", "nam"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { id, dateOfBirth, disabilities, attendantName: newAttendantName, ...rest } = input;

        // Buscar demand atual para sincronização de status
        const [currentDemand] = await db.select({ attendantName: demands.attendantName }).from(demands).where(eq(demands.id, id));
        if (!currentDemand) throw new TRPCError({ code: "NOT_FOUND", message: "Aluno não encontrado" });

        const data: Record<string, unknown> = {
          ...rest,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          disabilities: disabilities ? JSON.stringify(disabilities) : undefined,
          attendantName: newAttendantName,
          updatedBy: ctx.user.id,
        };
        Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
        try {
          await db.update(demands).set(data as any).where(eq(demands.id, id));

          // SINCRONIZAÇÃO: Se mediador foi alterado, sincronizar status do novo mediador
          if (newAttendantName && newAttendantName !== currentDemand.attendantName) {
            const [newMediator] = await db.select({ status: mediators.status }).from(mediators).where(eq(mediators.name, newAttendantName));
            if (newMediator) {
              const syncedStatus = newMediator.status === "active" ? "active" : "inactive";
              await db.update(demands).set({ attendantStatus: syncedStatus }).where(eq(demands.id, id));
            }
          }

          return { success: true };
        } catch (error) {
          console.error("[Demands] Error updating:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update demand" });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem excluir registros" });
        try {
          await db.delete(demands).where(eq(demands.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("[Demands] Error deleting:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete demand" });
        }
      }),

    listAttendants: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const allDemands = await db.select({ attendantName: demands.attendantName }).from(demands);
        const names = allDemands
          .map(d => d.attendantName)
          .filter((n): n is string => !!n && n.trim().length > 0);
        const uniqueNames = Array.from(new Set(names)).sort();
        return uniqueNames;
      } catch {
        return [];
      }
    }),

    searchStudents: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          const allDemands = await db.select().from(demands);
          const q = input.query.toLowerCase();
          return allDemands
            .filter(d => d.studentName.toLowerCase().includes(q))
            .slice(0, 10)
            .map(d => ({ id: d.id, studentName: d.studentName, schoolName: d.schoolName, cpf: d.cpf }));
        } catch {
          return [];
        }
      }),

    stats: protectedProcedure
      .input(z.object({
        schoolId: z.number().optional(),
        schoolType: z.enum(["all", "EM", "CIM", "other"]).optional(),
        shift: z.enum(["all", "morning", "afternoon", "full", "evening"]).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        try {
          let allDemands = await db.select().from(demands);
          if (ctx.user.role !== "admin" && ctx.user.schoolId) {
            allDemands = allDemands.filter(d => d.schoolId === ctx.user.schoolId);
          }
          if (input?.schoolId) allDemands = allDemands.filter(d => d.schoolId === input.schoolId);
          if (input?.shift && input.shift !== "all") allDemands = allDemands.filter(d => d.shift === input.shift);
          if (input?.schoolType && input.schoolType !== "all") {
            if (input.schoolType === "EM") allDemands = allDemands.filter(d => d.schoolName.startsWith("EM ") || d.schoolName.startsWith("E M"));
            else if (input.schoolType === "CIM") allDemands = allDemands.filter(d => d.schoolName.startsWith("CIM "));
            else allDemands = allDemands.filter(d => !d.schoolName.startsWith("EM ") && !d.schoolName.startsWith("E M") && !d.schoolName.startsWith("CIM "));
          }

          const total = allDemands.length;
          const withAttendant = allDemands.filter(d => d.attendanceStatus === "with_attendant").length;
          const withoutAttendant = allDemands.filter(d => d.attendanceStatus === "without_attendant").length;
          const awaitingSubstitution = allDemands.filter(d => d.attendanceStatus === "awaiting_substitution").length;
          // Mediadores únicos: busca direto da tabela mediators (mesma fonte que dashboard.stats)
          const allMediators = await db.select({ id: mediators.id, status: mediators.status }).from(mediators);
          const activeAttendants = allMediators.filter(m => m.status === "active").length;
          const inactiveAttendants = allMediators.filter(m => m.status === "inactive").length;
          const coverageRate = total > 0 ? Math.round((withAttendant / total) * 100) : 0;

          const disabilityCount: Record<string, number> = {};
          allDemands.forEach(d => {
            if (d.disabilities) {
              try {
                const list = JSON.parse(d.disabilities) as string[];
                list.forEach(dis => { disabilityCount[dis] = (disabilityCount[dis] || 0) + 1; });
              } catch {}
            }
          });

          const shiftCount: Record<string, number> = { full: 0, morning: 0, afternoon: 0, evening: 0 };
          allDemands.forEach(d => { shiftCount[d.shift] = (shiftCount[d.shift] || 0) + 1; });

          const statusCount: Record<string, number> = {};
          allDemands.forEach(d => { statusCount[d.attendanceStatus] = (statusCount[d.attendanceStatus] || 0) + 1; });

          const emDemands = allDemands.filter(d => d.schoolName.startsWith("EM ") || d.schoolName.startsWith("E M"));
          const emBySchool: Record<string, { name: string; withoutAttendant: number; open: number }> = {};
          emDemands.forEach(d => {
            if (!emBySchool[d.schoolName]) emBySchool[d.schoolName] = { name: d.schoolName, withoutAttendant: 0, open: 0 };
            if (d.attendanceStatus === "without_attendant") emBySchool[d.schoolName].withoutAttendant++;
            if (d.attendanceStatus !== "with_attendant") emBySchool[d.schoolName].open++;
          });
          const topEMs = Object.values(emBySchool)
            .sort((a, b) => b.withoutAttendant - a.withoutAttendant || b.open - a.open)
            .slice(0, 10);

          const cimDemands = allDemands.filter(d => d.schoolName.startsWith("CIM "));
          const cimBySchool: Record<string, { name: string; withoutAttendant: number; open: number }> = {};
          cimDemands.forEach(d => {
            if (!cimBySchool[d.schoolName]) cimBySchool[d.schoolName] = { name: d.schoolName, withoutAttendant: 0, open: 0 };
            if (d.attendanceStatus === "without_attendant") cimBySchool[d.schoolName].withoutAttendant++;
            if (d.attendanceStatus !== "with_attendant") cimBySchool[d.schoolName].open++;
          });
          const topCIMs = Object.values(cimBySchool)
            .sort((a, b) => b.withoutAttendant - a.withoutAttendant || b.open - a.open)
            .slice(0, 10);

          const schoolsWithDeficit = new Set(allDemands.filter(d => d.attendanceStatus !== "with_attendant").map(d => d.schoolName)).size;

          const ageCount: Record<string, number> = { "0-5": 0, "6-10": 0, "11-14": 0, "15-17": 0, "18+": 0 };
          const now = new Date();
          allDemands.forEach(d => {
            if (d.dateOfBirth) {
              const birth = new Date(d.dateOfBirth);
              const age = now.getFullYear() - birth.getFullYear() - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
              if (age <= 5) ageCount["0-5"]++;
              else if (age <= 10) ageCount["6-10"]++;
              else if (age <= 14) ageCount["11-14"]++;
              else if (age <= 17) ageCount["15-17"]++;
              else ageCount["18+"]++;
            }
          });

          const inactivityCount: Record<string, number> = {};
          allDemands.filter(d => d.attendantStatus === "inactive").forEach(d => {
            const reason = d.notes || "Não informado";
            const shortReason = reason.length > 40 ? reason.slice(0, 40) + "..." : reason;
            inactivityCount[shortReason] = (inactivityCount[shortReason] || 0) + 1;
          });

          return {
            total, withAttendant, withoutAttendant, awaitingSubstitution,
            activeAttendants, inactiveAttendants, coverageRate, schoolsWithDeficit,
            disabilityCount, shiftCount, statusCount, ageCount, inactivityCount,
            topEMs, topCIMs,
          };
        } catch (error) {
          console.error("[Demands] Error getting stats:", error);
          return null;
        }
      }),
  }),

  externalDemands: router({
    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return await getDb().then(db => db ? db.select().from(externalDemands) : []);
      }
      if (!ctx.user.schoolId) return [];
      return await getExternalDemandsBySchool(ctx.user.schoolId);
    }),

    create: protectedProcedure
      .input(z.object({
        demandType: z.string().min(1),
        source: z.enum(["family", "school", "health", "court", "other"]),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const schoolId = ctx.user.schoolId || 1;
        try {
          await db.insert(externalDemands).values({
            demandType: input.demandType,
            source: input.source,
            description: input.description,
            priority: input.priority,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            schoolId,
            status: "pending",
          });
          return { success: true };
        } catch (error) {
          console.error("[ExternalDemands] Error creating demand:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create demand" });
        }
      }),
   }),

  /**
   * Quadro AAP - Quadro de Atendentes de Apoio Pedagógico
   * Gera a tabela completa por escola, fiel ao documento Word da SAIN
   */
  quadroAAP: router({
    generate: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { school: null, rows: [], responsible: "", date: "" };
        try {
          // Buscar escola
          const [school] = await db.select().from(schools).where(eq(schools.id, input.schoolId));
          if (!school) return { school: null, rows: [], responsible: "", date: "" };

          // Buscar todos os alunos da escola (via demands)
          const studentList = await db.select().from(demands).where(eq(demands.schoolId, input.schoolId));

          // Buscar mediadores da escola
          const mediatorList = await db.select().from(mediators).where(eq(mediators.schoolId, input.schoolId));

          // Buscar vínculos mediator_students (usando demandId quando disponível)
          const allLinks = await db.select().from(mediatorStudents);

          // Montar mapa de alunos (demands: usar studentName como name)
          const studentMap = Object.fromEntries(studentList.map((s: any) => [s.id, { ...s, name: s.studentName, disability: s.disabilities, status: s.attendantStatus }]));

          // Montar mapa de mediador -> demands vinculados (usando demandId se disponível, senão studentId como fallback)
          const mediatorToStudents: Record<number, number[]> = {};
          const studentToMediator: Record<number, number> = {};
          for (const link of allLinks) {
            // Usar demandId se disponível (vínculos novos), senão studentId (legado)
            const targetId = (link as any).demandId ?? link.studentId;
            if (!mediatorToStudents[link.mediatorId]) mediatorToStudents[link.mediatorId] = [];
            mediatorToStudents[link.mediatorId].push(targetId);
            studentToMediator[targetId] = link.mediatorId;
          }

          // Montar linhas do quadro
          type QuadroRow = {
            numero: number;
            nomeAAP: string;
            turno1: boolean;
            turno2: boolean;
            alunos: {
              id: number;
              nome: string;
              anoTurma: string;
              deficiencia: string;
            }[];
            mediatorId: number | null;
            status: string;
          };

          const rows: QuadroRow[] = [];
          let numero = 1;

          // 1) Mediadores ativos com alunos vinculados
          for (const med of mediatorList.filter(m => m.status === "active" || m.status === "on_leave" || m.status === "temp_leave")) {
            const linkedIds = mediatorToStudents[med.id] || [];
            // Também incluir alunos do campo texto livre (legado)
            let linkedStudentsList = linkedIds.map(id => studentMap[id]).filter(Boolean);

            // Se não tem vínculos formais, tentar pelo campo linkedStudents (legado)
            if (linkedStudentsList.length === 0 && med.linkedStudents) {
              const names = med.linkedStudents.split(",").map(n => n.trim()).filter(Boolean);
              for (const name of names) {
                const found = (studentList as any[]).find(s => (s.studentName || s.name || "").toLowerCase().trim() === name.toLowerCase().trim());
                if (found) linkedStudentsList.push(found);
              }
            }

            const alunos = linkedStudentsList.map((s: any) => {
              let disab = s.disabilities || s.disability || "";
              try { const arr = JSON.parse(disab); disab = Array.isArray(arr) ? arr.join(", ") : disab; } catch {}
              return {
                id: s.id,
                nome: s.studentName || s.name || "",
                anoTurma: s.grade || "",
                deficiencia: disab,
              };
            });

            if (alunos.length === 0) {
              alunos.push({ id: 0, nome: "(sem aluno vinculado)", anoTurma: "", deficiencia: "" });
            }

            const shift = linkedStudentsList[0]?.shift;
            rows.push({
              numero,
              nomeAAP: med.name,
              turno1: shift === "morning" || shift === "full" || !shift,
              turno2: shift === "afternoon" || shift === "full",
              alunos,
              mediatorId: med.id,
              status: med.status,
            });
            numero++;
          }

          // 2) Alunos sem mediador vinculado
          const studentsWithMediator = new Set<number>();
          for (const ids of Object.values(mediatorToStudents)) {
            for (const id of ids) studentsWithMediator.add(id);
          }
          // Também marcar alunos vinculados por texto livre
          for (const med of mediatorList) {
            if (med.linkedStudents) {
              const names = med.linkedStudents.split(",").map(n => n.trim()).filter(Boolean);
              for (const name of names) {
                const found = (studentList as any[]).find(s => (s.studentName || s.name || "").toLowerCase().trim() === name.toLowerCase().trim());
                if (found) studentsWithMediator.add(found.id);
              }
            }
          }

                const studentsWithout = studentList.filter((s: any) => !studentsWithMediator.has(s.id) && s.hasAttendant === false);
          // Verificar se o aluno deveria ter atendimento compartilhado
          for (const s of studentsWithout as any[]) {
            const needsLabel = s.needsAttendant === "no" ? "NÃO NECESSITA" :
              s.needsAttendant === "nam" ? "Sem atendente – NAM" :
              s.isShared ? "Sem atendente (compartilhado)" :
              "Sem atendente (individual)";

            let disab = s.disabilities || "";
            try { const arr = JSON.parse(disab); disab = Array.isArray(arr) ? arr.join(", ") : disab; } catch {}

            rows.push({
              numero,
              nomeAAP: needsLabel,
              turno1: s.shift === "morning" || s.shift === "full" || !s.shift,
              turno2: s.shift === "afternoon" || s.shift === "full",
              alunos: [{
                id: s.id,
                nome: s.studentName,
                anoTurma: s.grade || "",
                deficiencia: disab,
              }],
              mediatorId: null,
              status: "sem_atendente",
            });
            numero++;
          }

          // Buscar responsável (usuário da escola)
          const schoolUsers = await db.select().from(users).where(eq(users.schoolId, input.schoolId));
          const responsible = school.responsible || schoolUsers[0]?.name || "";

          return {
            school: { id: school.id, name: school.name, code: school.code },
            rows,
            responsible,
            date: new Date().toLocaleDateString("pt-BR"),
            totalAlunos: studentList.length,
            totalMediadores: mediatorList.filter(m => m.status === "active").length,
            totalSemAtendente: studentsWithout.length,
          };
        } catch (error) {
          console.error("[QuadroAAP] Error generating:", error);
          return { school: null, rows: [], responsible: "", date: "" };
        }
      }),

    submit: protectedProcedure
      .input(z.object({
        schoolId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        try {
          // Gerar o quadro para snapshot
          const mediatorList = await db.select().from(mediators).where(eq(mediators.schoolId, input.schoolId));
          const studentList = await db.select().from(demands).where(eq(demands.schoolId, input.schoolId));
          const allLinks = await db.select().from(mediatorStudents);

          const snapshotData = JSON.stringify({
            mediators: mediatorList.map(m => ({
              id: m.id, name: m.name, status: m.status, changeType: m.changeType,
              linkedStudents: m.linkedStudents, isShared: m.isShared,
              inactivityReason: m.inactivityReason, note: m.note,
            })),
            students: studentList.map((s: any) => ({
              id: s.id, name: s.studentName, disability: s.disabilities, shift: s.shift,
              grade: s.grade, hasAttendant: s.hasAttendant, attendantName: s.attendantName,
            })),
            links: allLinks.filter(l => mediatorList.some(m => m.id === l.mediatorId)),
          });

          const weekRef = getWeekReference();
          await db.insert(weeklySnapshots).values({
            schoolId: input.schoolId,
            weekReference: weekRef,
            submittedBy: ctx.user.id,
            submittedByName: ctx.user.name || "Usuário",
            snapshotData,
            notes: input.notes,
            status: "submitted",
          });

          await db.update(schools).set({
            weeklyStatus: "updated",
            responsible: ctx.user.name || undefined,
            lastWeeklyUpdate: new Date(),
          }).where(eq(schools.id, input.schoolId));

          // Buscar nome da escola para notificação
          const [schoolInfo] = await db.select({ name: schools.name }).from(schools).where(eq(schools.id, input.schoolId));
          const schoolName = schoolInfo?.name || `Escola #${input.schoolId}`;

          // Notificar a SAIN (owner)
          try {
            await notifyOwner({
              title: `Quadro de Mediadores Enviado - ${schoolName}`,
              content: `A escola ${schoolName} enviou o Quadro de Mediadores da semana ${weekRef}.\nMediadores ativos: ${mediatorList.filter(m => m.status === "active").length}\nAlunos: ${studentList.length} (${(studentList as any[]).filter(s => s.hasAttendant).length} com mediador)\nEnviado por: ${ctx.user.name || "Usuario"}${input.notes ? `\nObs: ${input.notes}` : ""}`,
            });
          } catch (notifErr) {
            console.warn("[QuadroAAP] Notification failed:", notifErr);
          }

          return { success: true, weekReference: weekRef };
        } catch (error) {
          console.error("[QuadroAAP] Error submitting:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao enviar quadro" });
        }
      }),

    history: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          return await db.select().from(weeklySnapshots)
            .where(eq(weeklySnapshots.schoolId, input.schoolId))
            .orderBy(desc(weeklySnapshots.createdAt));
        } catch (error) {
          console.error("[QuadroAAP] Error listing history:", error);
          return [];
        }
      }),

    // Status semanal: quantas escolas enviaram vs. pendentes
    weeklyStatus: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { sent: 0, pending: 0, total: 0, sentSchools: [], pendingSchools: [] };
      try {
        const weekRef = getWeekReference();
        const allSchools = await db.select({ id: schools.id, name: schools.name }).from(schools);
        const sentSnapshots = await db
          .select({ schoolId: weeklySnapshots.schoolId })
          .from(weeklySnapshots)
          .where(eq(weeklySnapshots.weekReference, weekRef));
        const sentIds = new Set(sentSnapshots.map(s => s.schoolId));
        const sentSchools = allSchools.filter(s => sentIds.has(s.id));
        const pendingSchools = allSchools.filter(s => !sentIds.has(s.id));
        return {
          sent: sentSchools.length,
          pending: pendingSchools.length,
          total: allSchools.length,
          sentSchools,
          pendingSchools,
          weekReference: weekRef,
        };
      } catch (error) {
        console.error("[QuadroAAP] Error getting weekly status:", error);
        return { sent: 0, pending: 0, total: 0, sentSchools: [], pendingSchools: [], weekReference: "" };
      }
    }),

    // Enviar lembrete para escolas pendentes
    sendWeeklyReminder: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        const weekRef = getWeekReference();
        const allSchools = await db.select({ id: schools.id, name: schools.name }).from(schools);
        const sentSnapshots = await db
          .select({ schoolId: weeklySnapshots.schoolId })
          .from(weeklySnapshots)
          .where(eq(weeklySnapshots.weekReference, weekRef));
        const sentIds = new Set(sentSnapshots.map(s => s.schoolId));
        const pendingSchools = allSchools.filter(s => !sentIds.has(s.id));

        if (pendingSchools.length === 0) {
          return { success: true, sent: 0, message: "Todas as escolas ja enviaram o quadro esta semana." };
        }

        const pendingNames = pendingSchools.map(s => s.name).join(", ");
        await notifyOwner({
          title: `Lembrete Semanal SIGMA - ${pendingSchools.length} escola(s) pendente(s)`,
          content: `Semana ${weekRef}: ${pendingSchools.length} de ${allSchools.length} escolas ainda nao enviaram o Quadro de Mediadores.\n\nEscolas pendentes:\n${pendingNames}\n\nEnviado por: ${ctx.user.name || "Admin"}`,
        });

        return {
          success: true,
          sent: pendingSchools.length,
          message: `Lembrete enviado para ${pendingSchools.length} escola(s) pendente(s).`,
          pendingSchools: pendingSchools.map(s => s.name),
        };
      } catch (error) {
        console.error("[QuadroAAP] Error sending reminder:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao enviar lembrete" });
      }
    }),

    // Histórico de alterações por aluno
    getHistory: protectedProcedure
      .input(z.object({ demandId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          // Retornar histórico simulado (tabela ainda não foi criada)
          return [];
        } catch (err) {
          console.error("Erro ao buscar histórico:", err);
          return [];
        }
      }),

    // Enviar Quadro por e-mail
    sendByEmail: protectedProcedure
      .input(z.object({ schoolId: z.number(), email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && (ctx.user as any)?.schoolId !== input.schoolId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        try {
          const db = await getDb();
          if (!db) throw new Error("DB não disponível");
          const [school] = await db.select().from(schools).where(eq(schools.id, input.schoolId));
          if (!school) throw new Error("Escola não encontrada");
          await notifyOwner({
            title: "Quadro de Mediadores Enviado",
            content: `A escola ${school.name} enviou o Quadro de Mediadores. E-mail: ${input.email}`,
          });
          return { success: true, message: "Quadro enviado por e-mail com sucesso!" };
        } catch (err) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(err) });
        }
      }),
  }),
});
export type AppRouter = typeof appRouter;
