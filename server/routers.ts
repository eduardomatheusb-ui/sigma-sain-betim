import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSchools, getStudentsBySchool, getMediatorsBySchool, getAttendancesBySchool, getExternalDemandsBySchool } from "./db";
import { getDb } from "./db";
import { students, mediators, attendances, externalDemands, schools } from "../drizzle/schema";
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
      if (!db) return { totalStudents: 0, activeMediators: 0, pendingAttendances: 0, externalDemands: 0, onLeave: 0, vacancies: 0, totalSchools: 0 };

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

        return {
          totalStudents: studentList.length,
          activeMediators,
          pendingAttendances: pendingList.length,
          externalDemands: demandList.length,
          onLeave,
          vacancies,
          totalSchools: schoolList.length,
          totalMediators: mediatorList.length,
        };
      } catch (error) {
        console.error("[Dashboard] Error fetching stats:", error);
        return { totalStudents: 0, activeMediators: 0, pendingAttendances: 0, externalDemands: 0, onLeave: 0, vacancies: 0, totalSchools: 0, totalMediators: 0 };
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
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const schoolId = ctx.user.schoolId || 1;
        try {
          await db.insert(students).values({
            name: input.name,
            cpf: input.cpf,
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
            enrollmentNumber: input.enrollmentNumber,
            specialNeeds: input.specialNeeds,
            guardianName: input.guardianName,
            guardianPhone: input.guardianPhone,
            schoolId,
            status: "active",
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
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { id, ...data } = input;
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
