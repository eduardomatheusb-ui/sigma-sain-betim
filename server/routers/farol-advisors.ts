import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, like, asc } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { farolAdvisors } from "../../drizzle/schema";

export const farolAdvisorsRouter = router({
  listAdvisors: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      regional: z.string().optional(),
      areaAtuacao: z.string().optional(),
      ativo: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        const conditions: any[] = [eq(farolAdvisors.isDeleted, false)];
        if (input?.search) {
          conditions.push(like(farolAdvisors.nome, `%${input.search}%`));
        }
        if (input?.regional) {
          conditions.push(eq(farolAdvisors.regional, input.regional));
        }
        if (input?.areaAtuacao) {
          conditions.push(eq(farolAdvisors.areaAtuacao, input.areaAtuacao));
        }
        if (input?.ativo !== undefined) {
          conditions.push(eq(farolAdvisors.active, input.ativo));
        }
        return await db.select().from(farolAdvisors)
          .where(and(...conditions))
          .orderBy(asc(farolAdvisors.nome));
      } catch (error) {
        console.error("[Farol] Error listing advisors:", error);
        return [];
      }
    }),

  getAdvisor: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        const [advisor] = await db.select().from(farolAdvisors)
          .where(and(eq(farolAdvisors.id, input.id), eq(farolAdvisors.isDeleted, false)));
        return advisor || null;
      } catch (error) {
        console.error("[Farol] Error getting advisor:", error);
        return null;
      }
    }),

  createAdvisor: protectedProcedure
    .input(z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      email: z.string().email("Email inválido"),
      telefone: z.string().min(1, "Telefone é obrigatório"),
      cargo: z.string().min(1, "Cargo é obrigatório"),
      areaAtuacao: z.string().min(1, "Área de atuação é obrigatória"),
      regional: z.string().min(1, "Regional é obrigatória"),
      schools: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        await db.insert(farolAdvisors).values({
          nome: input.nome.trim(),
          email: input.email.trim(),
          telefone: input.telefone.trim(),
          cargo: input.cargo.trim(),
          areaAtuacao: input.areaAtuacao.trim(),
          regional: input.regional.trim(),
          schools: input.schools ? JSON.stringify(input.schools) : null,
          createdBy: ctx.user.id,
          createdByName: ctx.user.name,
          active: true,
          isDeleted: false,
        });
        
        // Fetch the created advisor (get the last one created)
        const advisors = await db.select().from(farolAdvisors)
          .where(eq(farolAdvisors.email, input.email.trim()))
          .orderBy(asc(farolAdvisors.id))
          .limit(1);
        
        return advisors[0] || null;
      } catch (error) {
        console.error("[Farol] Error creating advisor:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar assessor" });
      }
    }),

  updateAdvisor: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
      cargo: z.string().optional(),
      areaAtuacao: z.string().optional(),
      regional: z.string().optional(),
      schools: z.array(z.string()).optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        const updateData: any = {
          updatedBy: ctx.user.id,
          updatedByName: ctx.user.name,
          updatedAt: new Date(),
        };
        
        if (input.nome !== undefined) updateData.nome = input.nome.trim();
        if (input.email !== undefined) updateData.email = input.email.trim();
        if (input.telefone !== undefined) updateData.telefone = input.telefone.trim();
        if (input.cargo !== undefined) updateData.cargo = input.cargo.trim();
        if (input.areaAtuacao !== undefined) updateData.areaAtuacao = input.areaAtuacao.trim();
        if (input.regional !== undefined) updateData.regional = input.regional.trim();
        if (input.schools !== undefined) updateData.schools = JSON.stringify(input.schools);
        if (input.active !== undefined) updateData.active = input.active;
        
        await db.update(farolAdvisors)
          .set(updateData)
          .where(and(eq(farolAdvisors.id, input.id), eq(farolAdvisors.isDeleted, false)));
        
        const [advisor] = await db.select().from(farolAdvisors)
          .where(eq(farolAdvisors.id, input.id));
        
        return advisor;
      } catch (error) {
        console.error("[Farol] Error updating advisor:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar assessor" });
      }
    }),

  deleteAdvisor: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        await db.update(farolAdvisors)
          .set({
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: ctx.user.id,
          })
          .where(eq(farolAdvisors.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("[Farol] Error deleting advisor:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao deletar assessor" });
      }
    }),
});
