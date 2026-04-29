import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { caseEvolutions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const farolEvolutionRouter = router({
  /**
   * Add a new case evolution entry
   */
  addEvolution: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        numeroCaso: z.string(),
        date: z.string().or(z.date()),
        status: z.enum(["Progresso", "Estável", "Regressão", "Encerrado"]),
        description: z.string().min(1, "Descrição é obrigatória"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await db.insert(caseEvolutions).values({
          caseId: input.caseId,
          numeroCaso: input.numeroCaso,
          date: typeof input.date === "string" ? new Date(input.date) : input.date,
          status: input.status,
          description: input.description,
          createdBy: ctx.user.id,
          createdByName: ctx.user.name || "Usuário",
          createdByRole: ctx.user.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          success: true,
          message: "Evolução registrada com sucesso",
        };
      } catch (error) {
        console.error("[Evolution] Error adding evolution:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao registrar evolução",
        });
      }
    }),

  /**
   * List case evolutions
   */
  listEvolutions: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const evolutions = await db
          .select()
          .from(caseEvolutions)
          .where(eq(caseEvolutions.caseId, input.caseId))
          .orderBy((table) => [table.date, table.createdAt])
          .limit(input.limit)
          .offset(input.offset);

        const total = await db
          .select({ count: caseEvolutions.id })
          .from(caseEvolutions)
          .where(eq(caseEvolutions.caseId, input.caseId));

        return {
          evolutions,
          total: total[0]?.count || 0,
        };
      } catch (error) {
        console.error("[Evolution] Error listing evolutions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao carregar evolução",
        });
      }
    }),

  /**
   * Delete a case evolution entry
   */
  deleteEvolution: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        caseId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        // Verify the evolution exists and belongs to this case
        const evolution = await db
          .select()
          .from(caseEvolutions)
          .where(and(eq(caseEvolutions.id, input.id), eq(caseEvolutions.caseId, input.caseId)))
          .limit(1);

        if (!evolution.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Evolução não encontrada",
          });
        }

        // Only allow deletion by the creator or admin
        if (ctx.user.id !== evolution[0].createdBy && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para deletar esta evolução",
          });
        }

        await db.delete(caseEvolutions).where(eq(caseEvolutions.id, input.id));

        return {
          success: true,
          message: "Evolução removida com sucesso",
        };
      } catch (error) {
        console.error("[Evolution] Error deleting evolution:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao remover evolução",
        });
      }
    }),

  /**
   * Get evolution statistics for a case
   */
  getEvolutionStats: protectedProcedure
    .input(z.object({ caseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const evolutions = await db
          .select()
          .from(caseEvolutions)
          .where(eq(caseEvolutions.caseId, input.caseId));

        const stats = {
          total: evolutions.length,
          progresso: evolutions.filter((e) => e.status === "Progresso").length,
          estavel: evolutions.filter((e) => e.status === "Estável").length,
          regressao: evolutions.filter((e) => e.status === "Regressão").length,
          encerrado: evolutions.filter((e) => e.status === "Encerrado").length,
          lastUpdate: evolutions.length > 0 ? evolutions[evolutions.length - 1].createdAt : null,
        };

        return stats;
      } catch (error) {
        console.error("[Evolution] Error getting stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao carregar estatísticas",
        });
      }
    }),
});
