import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSchools, getStudentsBySchool, getMediatorsBySchool, getAttendancesBySchool, getExternalDemandsBySchool } from "./db";
import { getDb } from "./db";
import { students, mediators, attendances, externalDemands } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Dashboard - Indicadores gerenciais
   */
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      
      if (!db) {
        return {
          totalStudents: 0,
          activeMediators: 0,
          pendingAttendances: 0,
          externalDemands: 0,
        };
      }

      try {
        // Contar alunos
        const studentCount = await db.select().from(students);
        
        // Contar mediadores
        const mediatorCount = await db.select().from(mediators);
        
        // Contar atendimentos pendentes
        const pendingCount = await db.select().from(attendances).where(eq(attendances.status, "pending"));
        
        // Contar demandas externas
        const demandCount = await db.select().from(externalDemands);

        return {
          totalStudents: studentCount.length,
          activeMediators: mediatorCount.length,
          pendingAttendances: pendingCount.length,
          externalDemands: demandCount.length,
        };
      } catch (error) {
        console.error("[Dashboard] Error fetching stats:", error);
        return {
          totalStudents: 0,
          activeMediators: 0,
          pendingAttendances: 0,
          externalDemands: 0,
        };
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
   * Mediators - Gestão de mediadores
   */
  mediators: router({
    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return await getDb().then(db => db ? db.select().from(mediators) : []);
      }
      if (!ctx.user.schoolId) return [];
      return await getMediatorsBySchool(ctx.user.schoolId);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cpf: z.string().optional(),
        professionalLicense: z.string().optional(),
        specialization: z.string().optional(),
        maxAttendances: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const schoolId = ctx.user.schoolId || 1;

        try {
          await db.insert(mediators).values({
            name: input.name,
            cpf: input.cpf,
            professionalLicense: input.professionalLicense,
            specialization: input.specialization,
            maxAttendances: input.maxAttendances || 20,
            schoolId,
            status: "active",
          });

          return { success: true };
        } catch (error) {
          console.error("[Mediators] Error creating mediator:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create mediator" });
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
