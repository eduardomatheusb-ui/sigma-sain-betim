import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { demands, mediators, schools } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const describeIfDatabase = process.env.DATABASE_URL?.trim()
  ? describe
  : describe.skip;

// Contextos de teste
const createAdminContext = () => ({
  user: { id: 1, email: "admin@test.com", role: "admin" as const, schoolId: null },
  req: { headers: {} },
  res: { clearCookie: () => {} },
});

const createSchoolContext = (schoolId: number) => ({
  user: { id: 2, email: "school@test.com", role: "school_user" as const, schoolId },
  req: { headers: {} },
  res: { clearCookie: () => {} },
});

describeIfDatabase("SIGMA Phase 28 - Validacoes Criticas", () => {
  let db: any;
  let testSchoolId: number;
  let testMediatorId: number;
  let testDemandId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Criar escola de teste
    const [school] = await db
      .insert(schools)
      .values({
        name: "Escola Teste Fase 28",
        code: "TESTE-FASE28",
        type: "EM",
        isActive: true,
      })
      .$returningId();
    testSchoolId = school.id;

    // Criar mediador de teste (ativo)
    const [mediator] = await db
      .insert(mediators)
      .values({
        name: "Mediador Teste Fase 28",
        cpf: "12345678901",
        schoolId: testSchoolId,
        status: "active",
        changeType: "Sem alteracao",
        maxAttendances: 20,
      })
      .$returningId();
    testMediatorId = mediator.id;

    // Criar demand de teste
    const [demand] = await db
      .insert(demands)
      .values({
        schoolName: "Escola Teste Fase 28",
        studentName: "Aluno Teste Fase 28",
        dateOfBirth: new Date("2010-01-15"),
        shift: "morning",
        attendanceStatus: "with_attendant",
        attendantStatus: "active",
        hasAttendant: true,
        attendantName: "Mediador Teste Fase 28",
        schoolId: testSchoolId,
        createdBy: 1,
        updatedBy: 1,
      })
      .$returningId();
    testDemandId = demand.id;
  });

  afterAll(async () => {
    if (!db) return;
    // Limpar dados de teste
    await db.delete(demands).where(eq(demands.schoolId, testSchoolId));
    await db.delete(mediators).where(eq(mediators.schoolId, testSchoolId));
    await db.delete(schools).where(eq(schools.id, testSchoolId));
  });

  describe("1. Deteccao de Duplicacao de Alunos (Implementada na Fase 23)", () => {
    it("deve permitir criar alunos com dados diferentes", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.demands.create({
        schoolName: "Escola Teste Fase 28",
        studentName: "Aluno Diferente Teste",
        dateOfBirth: "2011-02-20",
        shift: "afternoon",
        attendanceStatus: "with_attendant",
        attendantStatus: "active",
        hasAttendant: true,
        attendantName: "Mediador Teste Fase 28",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("2. Sincronizacao de Status de Mediadores", () => {
    it("deve sincronizar status quando mediador e alterado de ativo para inativo", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Alterar status do mediador para inativo
      await caller.mediators.update({
        id: testMediatorId,
        status: "on_leave",
        inactivityReason: "Licenca medica",
        inactivityDate: new Date().toISOString().split("T")[0],
      });

      // Verificar se o status foi sincronizado em demands
      const [updatedDemand] = await db
        .select({ attendantStatus: demands.attendantStatus })
        .from(demands)
        .where(eq(demands.id, testDemandId));

      expect(updatedDemand.attendantStatus).toBe("inactive");
    });

    it("deve sincronizar status quando mediador retorna ao ativo", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Alterar status do mediador para ativo
      await caller.mediators.update({
        id: testMediatorId,
        status: "active",
        returnDate: new Date().toISOString().split("T")[0],
      });

      // Verificar se o status foi sincronizado em demands
      const [updatedDemand] = await db
        .select({ attendantStatus: demands.attendantStatus })
        .from(demands)
        .where(eq(demands.id, testDemandId));

      expect(updatedDemand.attendantStatus).toBe("active");
    });
  });

  describe("3. Movimentacao de Mediadores com Validacao de Status", () => {
    it("deve rejeitar movimentacao para outra escola sem alterar status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Criar segunda escola
      const [school2] = await db
        .insert(schools)
        .values({
          name: "Escola Teste 2 Fase 28",
          code: "TESTE2-FASE28",
          type: "EM",
          isActive: true,
        })
        .$returningId();

      let errorThrown = false;
      try {
        await caller.mediators.update({
          id: testMediatorId,
          schoolId: school2.id,
          // Nao alterar status - deveria falhar
        });
      } catch (error: any) {
        errorThrown = true;
        expect(error.message).toContain("obrigatorio alterar seu status");
      }
      expect(errorThrown).toBe(true);

      // Limpar
      await db.delete(schools).where(eq(schools.id, school2.id));
    });

    it("deve permitir movimentacao para outra escola com alteracao de status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Criar segunda escola
      const [school2] = await db
        .insert(schools)
        .values({
          name: "Escola Teste 3 Fase 28",
          code: "TESTE3-FASE28",
          type: "EM",
          isActive: true,
        })
        .$returningId();

      // Movimentar com alteracao de status
      const result = await caller.mediators.update({
        id: testMediatorId,
        schoolId: school2.id,
        status: "substituted",
        changeType: "Troca de escola",
      });

      expect(result.success).toBe(true);

      // Verificar se a escola foi alterada
      const [updatedMediator] = await db
        .select({ schoolId: mediators.schoolId, status: mediators.status })
        .from(mediators)
        .where(eq(mediators.id, testMediatorId));

      expect(updatedMediator.schoolId).toBe(school2.id);
      expect(updatedMediator.status).toBe("substituted");

      // Limpar
      await db.delete(schools).where(eq(schools.id, school2.id));
    });
  });

  describe("4. Rejeicao de Mediadores Inativos ao Vincular", () => {
    it("deve rejeitar vinculacao de mediador inativo ao criar demand", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Criar mediador inativo
      const [inactiveMediator] = await db
        .insert(mediators)
        .values({
          name: "Mediador Inativo Teste",
          cpf: "98765432101",
          schoolId: testSchoolId,
          status: "on_leave",
          changeType: "Licenca medica",
          maxAttendances: 20,
        })
        .$returningId();

      let errorThrown = false;
      try {
        await caller.demands.create({
          schoolName: "Escola Teste Fase 28",
          studentName: "Aluno Com Mediador Inativo",
          dateOfBirth: "2012-03-10",
          shift: "afternoon",
          attendanceStatus: "with_attendant",
          attendantStatus: "inactive",
          hasAttendant: true,
          attendantName: "Mediador Inativo Teste",
        });
      } catch (error: any) {
        errorThrown = true;
        expect(error.message).toContain("inativo");
      }
      expect(errorThrown).toBe(true);

      // Limpar
      await db.delete(mediators).where(eq(mediators.id, inactiveMediator.id));
    });
  });
});
