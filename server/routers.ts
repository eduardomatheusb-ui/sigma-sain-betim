import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getSchools, getStudentsBySchool, getMediatorsBySchool, getAttendancesBySchool, getExternalDemandsBySchool } from "./db";

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
      // Retorna estatísticas básicas
      // TODO: Implementar queries reais quando o banco estiver populado
      return {
        totalStudents: 0,
        activeMediators: 0,
        pendingAttendances: 0,
        externalDemands: 0,
      };
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
        // Admin vê todos os alunos
        return [];
      }
      // Usuário de escola vê apenas alunos da sua escola
      if (!ctx.user.schoolId) return [];
      return await getStudentsBySchool(ctx.user.schoolId);
    }),
  }),

  /**
   * Mediators - Gestão de mediadores
   */
  mediators: router({
    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return [];
      }
      if (!ctx.user.schoolId) return [];
      return await getMediatorsBySchool(ctx.user.schoolId);
    }),
  }),

  /**
   * Attendances - Gestão de atendimentos
   */
  attendances: router({
    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return [];
      }
      if (!ctx.user.schoolId) return [];
      return await getAttendancesBySchool(ctx.user.schoolId);
    }),
  }),

  /**
   * ExternalDemands - Gestão de demandas externas
   */
  externalDemands: router({
    listBySchool: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return [];
      }
      if (!ctx.user.schoolId) return [];
      return await getExternalDemandsBySchool(ctx.user.schoolId);
    }),
  }),
});

export type AppRouter = typeof appRouter;
