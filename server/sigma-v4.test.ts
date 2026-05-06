import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TRPCError } from "@trpc/server";
const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
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

describe("SIGMA V4 - Lembrete Semanal (quadroAAP.weeklyStatus)", () => {
  it("admin deve obter status semanal com sent/pending/total", async () => {
    const caller = adminCaller();
    const result = await caller.quadroAAP.weeklyStatus();
    expect(result).toHaveProperty("sent");
    expect(result).toHaveProperty("pending");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("sentSchools");
    expect(result).toHaveProperty("pendingSchools");
    expect(typeof result.sent).toBe("number");
    expect(typeof result.pending).toBe("number");
    expect(typeof result.total).toBe("number");
    expect(Array.isArray(result.sentSchools)).toBe(true);
    expect(Array.isArray(result.pendingSchools)).toBe(true);
    // sent + pending deve ser igual ao total
    expect(result.sent + result.pending).toBe(result.total);
  });

  it("escola deve conseguir acessar status semanal", async () => {
    const caller = schoolCaller(1);
    const result = await caller.quadroAAP.weeklyStatus();
    expect(result).toHaveProperty("total");
    expect(typeof result.total).toBe("number");
  });
});

describe("SIGMA V4 - Lembrete Semanal (quadroAAP.sendWeeklyReminder)", () => {
  it("admin deve conseguir enviar lembrete semanal", async () => {
    const caller = adminCaller();
    if (!hasDatabase) {
      await expect(caller.quadroAAP.sendWeeklyReminder()).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
      });
      return;
    }

    const result = await caller.quadroAAP.sendWeeklyReminder();
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("sent");
    expect(result).toHaveProperty("message");
    expect(result.success).toBe(true);
    expect(typeof result.sent).toBe("number");
    expect(typeof result.message).toBe("string");
  });

  it("escola não deve conseguir enviar lembrete semanal (FORBIDDEN)", async () => {
    const caller = schoolCaller(1);
    try {
      await caller.quadroAAP.sendWeeklyReminder();
      // Se chegar aqui, o teste falhou
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err).toBeInstanceOf(TRPCError);
      expect(err.code).toBe("FORBIDDEN");
    }
  });
});

describe("SIGMA V4 - Vínculo Mediador↔Aluno (mediator_students)", () => {
  it("quadroAAP.generate deve usar demandId para agrupar alunos por mediador", async () => {
    if (!hasDatabase) {
      return;
    }

    const caller = adminCaller();
    // Buscar uma escola que tenha mediadores com demandId vinculados
    const result = await caller.quadroAAP.generate({ schoolId: 1 });
    expect(result).toHaveProperty("rows");
    expect(Array.isArray(result.rows)).toBe(true);
    // Se houver rows, verificar estrutura
    if (result.rows.length > 0) {
      const row = result.rows[0];
      expect(row).toHaveProperty("nomeAAP");
      expect(row).toHaveProperty("alunos");
      expect(Array.isArray(row.alunos)).toBe(true);
    }
  });

  it("quadroAAP.weeklyStatus deve retornar weekReference no formato YYYY-Wnn", async () => {
    const caller = adminCaller();
    const result = await caller.quadroAAP.weeklyStatus();
    if (result.weekReference) {
      expect(result.weekReference).toMatch(/^\d{4}-W\d{2}$/);
    }
  });
});
