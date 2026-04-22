import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSchools, getStudentsBySchool, getMediatorsBySchool, getAttendancesBySchool, getExternalDemandsBySchool } from "./db";
import { getDb } from "./db";
import { students, mediators, attendances, externalDemands, schools, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

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

export const appRouter = router({
  system: systemRouter,

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
    stats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { totalStudents: 0, activeMediators: 0, pendingAttendances: 0, externalDemands: 0, onLeave: 0, vacancies: 0, totalSchools: 0, totalMediators: 0, studentsWithMediator: 0, studentsWithoutMediator: 0 };

      try {
        const [studentList, mediatorList, pendingList, demandList, schoolList] = await Promise.all([
          db.select().from(students),
          db.select().from(mediators),
          db.select().from(attendances).where(eq(attendances.status, "pending")),
          db.select().from(externalDemands).where(eq(externalDemands.status, "pending")),
          db.select().from(schools),
        ]);

        const activeMediators = mediatorList.filter(m => m.status === "active").length;
        const onLeave = mediatorList.filter(m => m.status === "on_leave" || m.status === "temp_leave").length;
        const vacancies = mediatorList.filter(m => m.status === "vacancy").length;

        // Alunos com e sem atendente (baseado em linkedStudents dos mediadores ativos)
        const linkedStudentNames = new Set<string>();
        mediatorList.filter(m => m.status === "active").forEach(m => {
          if (m.linkedStudents) {
            m.linkedStudents.split(",").map(s => s.trim()).filter(Boolean).forEach(s => linkedStudentNames.add(s.toLowerCase()));
          }
        });
        const studentsWithMediator = studentList.filter(s => linkedStudentNames.has(s.name.toLowerCase())).length;
        const studentsWithoutMediator = studentList.length - studentsWithMediator;

        // Ranking de escolas por demanda (mediadores com status vacancy ou on_leave)
        const schoolDemandMap = new Map<number, number>();
        mediatorList.filter(m => m.status === "vacancy" || m.status === "on_leave" || m.status === "temp_leave").forEach(m => {
          schoolDemandMap.set(m.schoolId, (schoolDemandMap.get(m.schoolId) || 0) + 1);
        });
        const schoolRanking = schoolList
          .map(s => ({ id: s.id, name: s.name, demand: schoolDemandMap.get(s.id) || 0 }))
          .filter(s => s.demand > 0)
          .sort((a, b) => b.demand - a.demand);
        const emRanking = schoolRanking.filter(s => s.name.startsWith("E M")).slice(0, 10);
        const cimRanking = schoolRanking.filter(s => s.name.startsWith("CIM")).slice(0, 10);

        // Gráfico por deficiência
        const disabilityMap = new Map<string, number>();
        studentList.forEach(s => {
          const key = s.disability || "Não informado";
          disabilityMap.set(key, (disabilityMap.get(key) || 0) + 1);
        });
        const byDisability = Array.from(disabilityMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        // Gráfico por turno
        const shiftMap = new Map<string, number>();
        studentList.forEach(s => {
          const key = s.shift === "morning" ? "Manhã" : s.shift === "afternoon" ? "Tarde" : s.shift === "full" ? "Integral" : "Não informado";
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
          totalStudents: studentList.length,
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
    }),
  }),

  /**
   * Schools - Gestão de escolas
   */
  schools: router({
    list: protectedProcedure.query(async () => {
      return await getSchools();
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

        const onLeave = mediatorList.filter(m => m.status === "on_leave");
        if (onLeave.length > 0) {
          alerts.push(`${onLeave.length} atendente${onLeave.length > 1 ? "s estão" : " está"} em licença médica com necessidade de substituição`);
        }

        const linkChange = mediatorList.filter(m => m.changeType === "Alteração de vínculo com aluno");
        if (linkChange.length > 0) {
          alerts.push(`${linkChange.length} escola${linkChange.length > 1 ? "s" : ""} registraram alteração de vínculo nesta semana`);
        }

        const vacancies = mediatorList.filter(m => m.status === "vacancy");
        if (vacancies.length > 0) {
          alerts.push(`${vacancies.length} vaga${vacancies.length > 1 ? "s em aberto" : " em aberto"} aguardando preenchimento`);
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
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar escola" });
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
  }),

  /**
   * Students - Gestão de alunos
   */
  students: router({
    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return await getDb().then(db => db ? db.select().from(students) : []);
      }
      if (!ctx.user.schoolId) return [];
      return await getStudentsBySchool(ctx.user.schoolId);
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
        shift: z.enum(["morning", "afternoon", "full"]).optional(),
        grade: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        // Admin pode cadastrar sem escola vinculada (schoolId = 0 = sem escola)
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
  }),

  /**
   * Mediators - Quadro de Atendentes (integrado com MVP)
   * Inclui: create, update, delete, listWithSchool
   */
  mediators: router({
    // Lista todos os mediadores com nome da escola (visão consolidada do MVP)
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
        if (ctx.user.role === "admin") {
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
        }
        if (!ctx.user.schoolId) return [];
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
          .leftJoin(schools, eq(mediators.schoolId, schools.id))
          .where(eq(mediators.schoolId, ctx.user.schoolId));
        return rows;
      } catch (error) {
        console.error("[Mediators] Error listing by school:", error);
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
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { id, inactivityDate, returnDate, ...rest } = input;
        const data = {
          ...rest,
          inactivityDate: inactivityDate ? new Date(inactivityDate) : undefined,
          returnDate: returnDate ? new Date(returnDate) : undefined,
        };
        try {
          await db.update(mediators).set(data).where(eq(mediators.id, id));
          return { success: true };
        } catch (error) {
          console.error("[Mediators] Error updating mediator:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update mediator" });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        try {
          await db.delete(mediators).where(eq(mediators.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("[Mediators] Error deleting mediator:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete mediator" });
        }
      }),
  }),

  /**
   * Attendances - Gestão de atendimentos
   */
  attendances: router({
    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return await getDb().then(db => db ? db.select().from(attendances) : []);
      }
      if (!ctx.user.schoolId) return [];
      return await getAttendancesBySchool(ctx.user.schoolId);
    }),

    create: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        mediatorId: z.number(),
        attendanceDate: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["individual", "shared"]),
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
            type: input.type,
            schoolId,
            status: "completed",
          });
          return { success: true };
        } catch (error) {
          console.error("[Attendances] Error creating attendance:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create attendance" });
        }
      }),
  }),

  /**
   * ExternalDemands - Gestão de demandas externas
   */
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
});

export type AppRouter = typeof appRouter;
