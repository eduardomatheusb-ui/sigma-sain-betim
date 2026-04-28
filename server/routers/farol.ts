import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { farolCases, farolCaseHistory, farolAudit, farolAdvisors } from "../../drizzle/schema";
import { eq, like, desc, and, sql, asc } from "drizzle-orm";

/**
 * Farol da Gestao Router
 * Modulo de gerenciamento de casos intersetoriais
 * Com suporte a multiplos perfis: admin, coordinator, advisor, childhood_coordination, viewer
 */
export const farolRouter = router({
  listCases: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      protocolo: z.string().optional(),
      situacao: z.string().optional(),
      status: z.string().optional(),
      regional: z.string().optional(),
      schoolId: z.number().optional(),
      classificacao: z.string().optional(),
      advisorId: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      ordenacao: z.string().optional(),
      ordem: z.enum(["asc", "desc"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        let conditions: any[] = [eq(farolCases.isDeleted, false)];
        
        // Filtro por perfil e escopo
        if (ctx.user.role === "school_user") {
          // School_user vê apenas casos da sua escola
          if (ctx.user.schoolId) {
            conditions.push(eq(farolCases.schoolId, ctx.user.schoolId));
          }
        }
        
        // Filtros opcionais
        if (input?.search) {
          conditions.push(like(farolCases.nomeEstudante, `%${input.search}%`));
        }
        if (input?.protocolo) {
          conditions.push(like(farolCases.numeroCaso, `%${input.protocolo}%`));
        }
        if (input?.situacao && input.situacao !== "todos") {
          conditions.push(eq(farolCases.situacao, input.situacao as any));
        }
        if (input?.status && input.status !== "todos") {
          conditions.push(eq(farolCases.status, input.status as any));
        }
        if (input?.regional && input.regional !== "todos") {
          conditions.push(eq(farolCases.regional, input.regional));
        }
        if (input?.schoolId && input.schoolId > 0) {
          conditions.push(eq(farolCases.schoolId, input.schoolId));
        }
        if (input?.classificacao && input.classificacao !== "todos") {
          conditions.push(eq(farolCases.classificacaoCaso, input.classificacao));
        }
        if (input?.dataInicio) {
          const startDate = new Date(input.dataInicio);
          conditions.push(sql`${farolCases.dataEntrada} >= ${startDate}`);
        }
        if (input?.dataFim) {
          const endDate = new Date(input.dataFim);
          endDate.setHours(23, 59, 59, 999);
          conditions.push(sql`${farolCases.dataEntrada} <= ${endDate}`);
        }
        
        // Definir ordenacao
        let orderByClause: any = desc(farolCases.updatedAt);
        if (input?.ordenacao) {
          const fieldMap: Record<string, any> = {
            updatedAt: farolCases.updatedAt,
            createdAt: farolCases.createdAt,
            nomeEstudante: farolCases.nomeEstudante,
            numeroCaso: farolCases.numeroCaso,
            classificacaoCaso: farolCases.classificacaoCaso,
            status: farolCases.status,
          };
          const field = fieldMap[input.ordenacao];
          if (field) {
            orderByClause = input.ordem === "asc" ? asc(field) : desc(field);
          }
        }
        
        const cases = await db.select().from(farolCases)
          .where(and(...conditions))
          .orderBy(orderByClause);
        
        return cases;
      } catch (error) {
        console.error("[Farol] Error listing cases:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao listar casos" });
      }
    }),

  getCase: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      
      try {
        const [caseData] = await db.select().from(farolCases)
          .where(eq(farolCases.id, input.id));
        
        if (!caseData || caseData.isDeleted) return null;
        
        // Validar acesso por escopo
        if (ctx.user.role === "school_user" && caseData.schoolId !== ctx.user.schoolId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado a este caso" });
        }
        
        const history = await db.select().from(farolCaseHistory)
          .where(eq(farolCaseHistory.caseId, input.id));
        
        return { ...caseData, history };
      } catch (error) {
        console.error("[Farol] Error getting case:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao obter caso" });
      }
    }),

  createCase: protectedProcedure
    .input(z.object({
      dataEntrada: z.string(),
      nomeEstudante: z.string().min(1),
      diagnostico: z.string().optional(),
      responsavel: z.string().optional(),
      telefone: z.string().optional(),
      escola: z.string().optional(),
      schoolId: z.number().optional(),
      regional: z.string().optional(),
      segmento: z.string().optional(),
      tipoDemanda: z.string().min(1),
      origem: z.string().min(1),
      analiseConjunta: z.string().optional(),
      setorCraei: z.string().optional(),
      profissionalResponsavelId: z.number().optional(),
      coordenadorResponsavelId: z.number().optional(),
      situacao: z.enum(["Ativo", "Inativo", "Arquivado", "Suspenso"]).default("Ativo"),
      status: z.enum(["Novo", "Em acompanhamento", "Aguardando retorno", "Encaminhado", "Resolvido", "Encerrado"]).default("Novo"),
      classificacaoCaso: z.string().optional(),
      alerta: z.boolean().optional(),
      observacaoGeral: z.string().optional(),
      driveFolderUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Apenas admin pode criar
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Permissão negada" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      try {
        // Gerar protocolo CRAEIRV-YYYY-NNNN
        const year = new Date().getFullYear();
        const lastCase = await db.select({ id: farolCases.id })
          .from(farolCases)
          .where(like(farolCases.numeroCaso, `CRAEIRV-${year}-%`))
          .orderBy(desc(farolCases.id))
          .limit(1);
        
        const sequence = lastCase.length > 0 ? 
          parseInt(lastCase[0].id.toString().slice(-4)) + 1 : 1;
        const numeroCaso = `CRAEIRV-${year}-${String(sequence).padStart(4, '0')}`;
        
           const insertData = {
          numeroCaso,
          dataEntrada: input.dataEntrada,
          nome: input.nomeEstudante,
          nomeEstudante: input.nomeEstudante,
          tipoDemanda: input.tipoDemanda,
          origem: input.origem,
          situacao: input.situacao,
          status: input.status,
          diagnostico: input.diagnostico,
          responsavel: input.responsavel,
          telefone: input.telefone,
          escola: input.escola,
          schoolId: input.schoolId,
          regional: input.regional,
          segmento: input.segmento,
          analiseConjunta: input.analiseConjunta,
          setorCraei: input.setorCraei,
          profissionalResponsavelId: input.profissionalResponsavelId,
          coordenadorResponsavelId: input.coordenadorResponsavelId,
          classificacaoCaso: input.classificacaoCaso,
          alerta: input.alerta,
          observacaoGeral: input.observacaoGeral,
          driveFolderUrl: input.driveFolderUrl,
          active: true,
          createdBy: ctx.user.id,
          createdByName: ctx.user.name || "Sistema",
          updatedBy: ctx.user.id,
          updatedByName: ctx.user.name || "Sistema",
        };
        
        const result = await db.insert(farolCases).values(insertData as any);
        
        await db.insert(farolAudit).values({
          numeroCaso,
          actionType: "CREATE",
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          userRole: ctx.user.role,
          newValue: JSON.stringify(input),
        });
        
        return { numeroCaso, id: 0 };
      } catch (error) {
        console.error("[Farol] Error creating case:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar caso" });
      }
    }),

  updateCase: protectedProcedure
    .input(z.object({
      id: z.number(),
      dataEntrada: z.string().optional(),
      nomeEstudante: z.string().optional(),
      diagnostico: z.string().optional(),
      responsavel: z.string().optional(),
      telefone: z.string().optional(),
      regional: z.string().optional(),
      segmento: z.string().optional(),
      tipoDemanda: z.string().optional(),
      origem: z.string().optional(),
      analiseConjunta: z.string().optional(),
      setorCraei: z.string().optional(),
      situacao: z.enum(["Ativo", "Inativo", "Arquivado", "Suspenso"]).optional(),
      status: z.enum(["Novo", "Em acompanhamento", "Aguardando retorno", "Encaminhado", "Resolvido", "Encerrado"]).optional(),
      classificacaoCaso: z.string().optional(),
      alerta: z.boolean().optional(),
      observacaoGeral: z.string().optional(),
      driveFolderUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      try {
        const [caseData] = await db.select().from(farolCases)
          .where(eq(farolCases.id, input.id));
        
        if (!caseData) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Caso não encontrado" });
        }
        
        // Validar acesso
        if (ctx.user.role === "school_user" && caseData.schoolId !== ctx.user.schoolId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        
        // Preparar update
        const updateData: any = {
          updatedBy: ctx.user.id,
          updatedByName: ctx.user.name || "Sistema",
          updatedAt: new Date(),
        };
        
        if (input.dataEntrada) updateData.dataEntrada = new Date(input.dataEntrada);
        if (input.nomeEstudante) updateData.nomeEstudante = input.nomeEstudante;
        if (input.diagnostico !== undefined) updateData.diagnostico = input.diagnostico;
        if (input.responsavel !== undefined) updateData.responsavel = input.responsavel;
        if (input.telefone !== undefined) updateData.telefone = input.telefone;
        if (input.regional !== undefined) updateData.regional = input.regional;
        if (input.segmento !== undefined) updateData.segmento = input.segmento;
        if (input.tipoDemanda !== undefined) updateData.tipoDemanda = input.tipoDemanda;
        if (input.origem !== undefined) updateData.origem = input.origem;
        if (input.analiseConjunta !== undefined) updateData.analiseConjunta = input.analiseConjunta;
        if (input.setorCraei !== undefined) updateData.setorCraei = input.setorCraei;
        if (input.situacao !== undefined) updateData.situacao = input.situacao;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.classificacaoCaso !== undefined) updateData.classificacaoCaso = input.classificacaoCaso;
        if (input.alerta !== undefined) updateData.alerta = input.alerta;
        if (input.observacaoGeral !== undefined) updateData.observacaoGeral = input.observacaoGeral;
        if (input.driveFolderUrl !== undefined) updateData.driveFolderUrl = input.driveFolderUrl;
        
        await db.update(farolCases).set(updateData).where(eq(farolCases.id, input.id));
        
        // Registrar auditoria
        await db.insert(farolAudit).values({
          caseId: input.id,
          numeroCaso: caseData.numeroCaso,
          actionType: "UPDATE",
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          userRole: ctx.user.role,
          newValue: JSON.stringify(updateData),
        });
        
        return { success: true };
      } catch (error) {
        console.error("[Farol] Error updating case:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar caso" });
      }
    }),

  deleteCase: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Apenas admin pode deletar
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Permissão negada" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      try {
        const [caseData] = await db.select().from(farolCases)
          .where(eq(farolCases.id, input.id));
        
        if (!caseData) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Caso não encontrado" });
        }
        
        // Exclusão lógica
        await db.update(farolCases).set({
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: ctx.user.id,
          deletionReason: input.reason,
        }).where(eq(farolCases.id, input.id));
        
        // Registrar auditoria
        await db.insert(farolAudit).values({
          caseId: input.id,
          numeroCaso: caseData.numeroCaso,
          actionType: "DELETE",
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          userRole: ctx.user.role,
          newValue: input.reason || "Deletado",
        });
        
        return { success: true };
      } catch (error) {
        console.error("[Farol] Error deleting case:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao deletar caso" });
      }
    }),

  addHistory: protectedProcedure
    .input(z.object({
      caseId: z.number(),
      actionType: z.string(),
      description: z.string().optional(),
      forwarding: z.string().optional(),
      internalNote: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      try {
        const [caseData] = await db.select().from(farolCases)
          .where(eq(farolCases.id, input.caseId));
        
        if (!caseData) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Caso não encontrado" });
        }
        
        // Validar acesso
        if (ctx.user.role === "school_user" && caseData.schoolId !== ctx.user.schoolId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        
        await db.insert(farolCaseHistory).values({
          caseId: input.caseId,
          numeroCaso: caseData.numeroCaso,
          actionType: input.actionType,
          description: input.description,
          forwarding: input.forwarding,
          internalNote: input.internalNote,
          createdBy: ctx.user.id,
          createdByName: ctx.user.name || "Sistema",
          createdByRole: ctx.user.role,
        });
        
        return { success: true };
      } catch (error) {
        console.error("[Farol] Error adding history:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao adicionar histórico" });
      }
    }),

  metrics: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      try {
        let conditions: any[] = [eq(farolCases.isDeleted, false)];
        
        // Filtro por perfil
        if (ctx.user.role === "school_user" && ctx.user.schoolId) {
          conditions.push(eq(farolCases.schoolId, ctx.user.schoolId));
        }
        
        const allCases = await db.select().from(farolCases)
          .where(and(...conditions));
        
        const total = allCases.length;
        const ativo = allCases.filter(c => c.situacao === "Ativo").length;
        const urgentes = allCases.filter(c => c.alerta).length;
        const aguardando = allCases.filter(c => c.status === "Aguardando retorno").length;
        
        return {
          total,
          ativo,
          urgentes,
          aguardando,
          resolvidos: allCases.filter(c => c.status === "Resolvido").length,
        };
      } catch (error) {
        console.error("[Farol] Error calculating metrics:", error);
        return null;
      }
    }),

  getAuditTrail: protectedProcedure
    .input(z.object({ caseId: z.number().optional(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Permissão negada" });
      }
      
      const db = await getDb();
      if (!db) return [];
      
      try {
        let conditions: any[] = [];
        if (input.caseId) {
          conditions.push(eq(farolAudit.caseId, input.caseId));
        }
        
        const audit = await db.select().from(farolAudit)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(farolAudit.createdAt))
          .limit(input.limit);
        
        return audit;
      } catch (error) {
        console.error("[Farol] Error getting audit trail:", error);
        return [];
      }
    }),

  // Advisor procedures
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
      if (!db) return [];
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
        return db.select().from(farolAdvisors)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
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
      if (!db) return null;
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
        const result = await db.insert(farolAdvisors).values({
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
        return result[0] || null;
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
        const result = await db.update(farolAdvisors)
          .set({
            nome: input.nome?.trim(),
            email: input.email?.trim(),
            telefone: input.telefone?.trim(),
            cargo: input.cargo?.trim(),
            areaAtuacao: input.areaAtuacao?.trim(),
            regional: input.regional?.trim(),
            schools: input.schools ? JSON.stringify(input.schools) : undefined,
            active: input.active,
            updatedBy: ctx.user.id,
            updatedByName: ctx.user.name,
            updatedAt: new Date(),
          })
          .where(and(eq(farolAdvisors.id, input.id), eq(farolAdvisors.isDeleted, false)))
          ;
        return result[0] || null;
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
