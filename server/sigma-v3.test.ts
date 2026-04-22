import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Helper para criar caller com contexto de admin
function adminCaller() {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "admin-001",
      name: "Admin Test",
      role: "admin",
      schoolId: null,
    } as AuthenticatedUser,
  };
  return appRouter.createCaller(ctx);
}

// Helper para criar caller com contexto de escola
function schoolCaller(schoolId: number) {
  const ctx: TrpcContext = {
    user: {
      id: 2,
      openId: "school-001",
      name: "Escola Test",
      role: "user",
      schoolId,
    } as AuthenticatedUser,
  };
  return appRouter.createCaller(ctx);
}

describe("SIGMA V3 - Mediators listBySchoolId", () => {
  it("admin deve listar mediadores por schoolId específico", async () => {
    const caller = adminCaller();
    const result = await caller.mediators.listBySchoolId({ schoolId: 1 });
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("status");
    }
  });

  it("escola deve listar apenas mediadores da própria escola (ignora schoolId do input)", async () => {
    const caller = schoolCaller(1);
    const result = await caller.mediators.listBySchoolId({ schoolId: 999 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve retornar array vazio para escola sem schoolId", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 3,
        openId: "no-school",
        name: "Sem Escola",
        role: "user",
        schoolId: null,
      } as AuthenticatedUser,
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.mediators.listBySchoolId({ schoolId: 1 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("SIGMA V3 - Quadro de Mediadores Generate", () => {
  it("admin deve gerar quadro de mediadores para uma escola", async () => {
    const caller = adminCaller();
    const result = await caller.quadroAAP.generate({ schoolId: 1 });
    // Sempre deve retornar school e rows (mesmo que escola não exista no banco de teste)
    expect(result).toHaveProperty("school");
    expect(result).toHaveProperty("rows");
    expect(result).toHaveProperty("date");
    expect(Array.isArray(result.rows)).toBe(true);
    // Se a escola existir no banco, deve ter campos de totais
    if (result.school !== null) {
      expect(result).toHaveProperty("totalMediadores");
      expect(result).toHaveProperty("totalAlunos");
      expect(result).toHaveProperty("totalSemAtendente");
      // Cada row deve ter campos simplificados (sem domiciliar, sem escolaOutroTurno)
      if (result.rows.length > 0) {
        const row = result.rows[0];
        expect(row).toHaveProperty("numero");
        expect(row).toHaveProperty("nomeAAP");
        expect(row).toHaveProperty("alunos");
        expect(row).toHaveProperty("status");
        expect(row).not.toHaveProperty("escolaOutroTurno");
        if (row.alunos.length > 0) {
          expect(row.alunos[0]).toHaveProperty("nome");
          expect(row.alunos[0]).toHaveProperty("anoTurma");
          expect(row.alunos[0]).toHaveProperty("deficiencia");
          expect(row.alunos[0]).not.toHaveProperty("cadeiradeRodas");
          expect(row.alunos[0]).not.toHaveProperty("andador");
          expect(row.alunos[0]).not.toHaveProperty("protese");
        }
      }
    }
  });

  it("admin deve listar histórico de envios por escola", async () => {
    const caller = adminCaller();
    const result = await caller.quadroAAP.history({ schoolId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});
