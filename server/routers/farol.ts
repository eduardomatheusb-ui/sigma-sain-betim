import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { farolCases, farolCaseHistory, farolCaseMovements } from "../../drizzle/schema";
import { eq, like, desc, and } from "drizzle-orm";

/**
 * Farol da Gestao Router
 * Modulo de gerenciamento de casos intersetoriais
 * Acesso restrito a administradores
 */
export const farolRouter = router({
  listCases: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      situacao: z.string().optional(),
      status: z.string().optional(),
      classificacao: z.string().optional(),
      schoolId: z.number().optional(),
      regional: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) return [];
      try {
        let conditions: any[] = [eq(farolCases.isDeleted, false)];
        if (input?.search) {
          conditions.push(like(farolCases.nome, `%${input.search}%`));
        }
        if (input?.situacao) {
          conditions.push(eq(farolCases.situacao, input.situacao as any));
        }
        if (input?.status) {
          conditions.push(eq(farolCases.status, input.status as any));
        }
        if (input?.classificacao) {
          conditions.push(eq(farolCases.classificacao, input.classificacao));
        }
        if (input?.schoolId) {
          conditions.push(eq(farolCases.schoolId, input.schoolId));
        }
        if (input?.regional) {
          conditions.push(eq(farolCases.regional, input.regional));
        }
        const cases = await db.select().from(farolCases).where(and(...conditions)).orderBy(desc(farolCases.createdAt));
        return cases;
      } catch (error) {
        console.error("[Farol] Error listing cases:", error);
        return [];
      }
    }),

  getCase: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) return null;
      try {
        const [caseData] = await db.select().from(farolCases).where(eq(farolCases.id, input.id));
        if (!caseData || caseData.isDeleted) return null;
        const history = await db.select().from(farolCaseHistory).where(eq(farolCaseHistory.caseId, input.id));
        const movements = await db.select().from(farolCaseMovements).where(eq(farolCaseMovements.caseId, input.id));
        return { ...caseData, history, movements };
      } catch (error) {
        console.error("[Farol] Error getting case:", error);
        return null;
      }
    }),

  createCase: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      escola: z.string().optional(),
      schoolId: z.number().optional(),
      regional: z.string().optional(),
      segmento: z.string().optional(),
      responsavel: z.string().optional(),
      tipoDemanda: z.string().min(1),
      origem: z.string().min(1),
      situacao: z.enum(["Ativo", "Inativo", "Arquivado", "Suspenso"]).default("Ativo"),
      status: z.enum(["Novo", "Em acompanhamento", "Aguardando retorno", "Encaminhado", "Resolvido", "Encerrado"]).default("Novo"),
      classificacao: z.string().optional(),
      descricao: z.string().optional(),
      encaminhamentos: z.string().optional(),
      dataEntrada: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        // Gerar numero do caso: CRAEIRV-YYYY-NNNN
        const year = new Date().getFullYear();
        const lastCase = await db.select({ numeroCaso: farolCases.numeroCaso })
          .from(farolCases)
          .where(like(farolCases.numeroCaso, `CRAEIRV-${year}-%`))
          .orderBy(desc(farolCases.id))
          .limit(1);
        
        let nextSeq = 1;
        if (lastCase.length > 0) {
          const match = lastCase[0].numeroCaso.match(/-(\d{4})$/);
          if (match) nextSeq = parseInt(match[1]) + 1;
        }
        const numeroCaso = `CRAEIRV-${year}-${String(nextSeq).padStart(4, "0")}`;

        await db.insert(farolCases).values({
          numeroCaso,
          nome: input.nome,
          escola: input.escola,
          schoolId: input.schoolId,
          regional: input.regional,
          segmento: input.segmento,
          responsavel: input.responsavel,
          tipoDemanda: input.tipoDemanda,
          origem: input.origem,
          situacao: input.situacao,
          status: input.status,
          classificacao: input.classificacao,
          descricao: input.descricao,
          encaminhamentos: input.encaminhamentos,
          dataEntrada: input.dataEntrada ? new Date(input.dataEntrada) : new Date(),
          createdBy: ctx.user.id,
          createdByName: ctx.user.name || "Usuario",
        });

        // Registrar no historico
        const [newCase] = await db.select().from(farolCases).where(eq(farolCases.numeroCaso, numeroCaso));
        if (newCase) {
          await db.insert(farolCaseHistory).values({
            caseId: newCase.id,
            numeroCaso,
            tipoAcao: "Caso criado",
            descricao: `Caso criado com situacao ${input.situacao} e status ${input.status}`,
            createdBy: ctx.user.id,
            createdByName: ctx.user.name || "Usuario",
          });
        }

        return { success: true, numeroCaso };
      } catch (error) {
        console.error("[Farol] Error creating case:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar caso" });
      }
    }),

  updateCase: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      situacao: z.enum(["Ativo", "Inativo", "Arquivado", "Suspenso"]).optional(),
      status: z.enum(["Novo", "Em acompanhamento", "Aguardando retorno", "Encaminhado", "Resolvido", "Encerrado"]).optional(),
      classificacao: z.string().optional(),
      descricao: z.string().optional(),
      encaminhamentos: z.string().optional(),
      assignedTo: z.number().optional(),
      assignedToName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        const [caseData] = await db.select().from(farolCases).where(eq(farolCases.id, input.id));
        if (!caseData) throw new TRPCError({ code: "NOT_FOUND" });

        await db.update(farolCases).set({
          nome: input.nome ?? caseData.nome,
          situacao: input.situacao ?? caseData.situacao,
          status: input.status ?? caseData.status,
          classificacao: input.classificacao ?? caseData.classificacao,
          descricao: input.descricao ?? caseData.descricao,
          encaminhamentos: input.encaminhamentos ?? caseData.encaminhamentos,
          assignedTo: input.assignedTo ?? caseData.assignedTo,
          assignedToName: input.assignedToName ?? caseData.assignedToName,
          updatedAt: new Date(),
        }).where(eq(farolCases.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[Farol] Error updating case:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar caso" });
      }
    }),

  deleteCase: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        const [caseData] = await db.select().from(farolCases).where(eq(farolCases.id, input.id));
        if (!caseData) throw new TRPCError({ code: "NOT_FOUND" });

        // Exclusao logica
        await db.update(farolCases).set({
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: ctx.user.id,
          deletionReason: input.reason,
        }).where(eq(farolCases.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[Farol] Error deleting case:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao excluir caso" });
      }
    }),

  addHistory: protectedProcedure
    .input(z.object({
      caseId: z.number(),
      tipoAcao: z.string().min(1),
      descricao: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      try {
        const [caseData] = await db.select().from(farolCases).where(eq(farolCases.id, input.caseId));
        if (!caseData) throw new TRPCError({ code: "NOT_FOUND" });

        await db.insert(farolCaseHistory).values({
          caseId: input.caseId,
          numeroCaso: caseData.numeroCaso,
          tipoAcao: input.tipoAcao,
          descricao: input.descricao,
          createdBy: ctx.user.id,
          createdByName: ctx.user.name || "Usuario",
        });

        return { success: true };
      } catch (error) {
        console.error("[Farol] Error adding history:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao adicionar historico" });
      }
    }),

  listHistory: protectedProcedure
    .input(z.object({ caseId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) return [];
      try {
        const history = await db.select().from(farolCaseHistory)
          .where(eq(farolCaseHistory.caseId, input.caseId))
          .orderBy(desc(farolCaseHistory.createdAt));
        return history;
      } catch (error) {
        console.error("[Farol] Error listing history:", error);
        return [];
      }
    }),

  metrics: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) return { total: 0, active: 0, urgent: 0, pending: 0, resolved: 0 };
      try {
        const allCases = await db.select().from(farolCases).where(eq(farolCases.isDeleted, false));
        const total = allCases.length;
        const active = allCases.filter(c => c.situacao === "Ativo").length;
        const urgent = allCases.filter(c => c.classificacao === "Urgente").length;
        const pending = allCases.filter(c => c.status === "Aguardando retorno").length;
        const resolved = allCases.filter(c => c.status === "Resolvido").length;
        return { total, active, urgent, pending, resolved };
      } catch (error) {
        console.error("[Farol] Error calculating metrics:", error);
        return { total: 0, active: 0, urgent: 0, pending: 0, resolved: 0 };
      }
    }),
});
