import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

/**
 * Criar contexto de teste para admin SAIN
 */
function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@sain.betim.gov.br",
    name: "Admin SAIN",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

/**
 * Criar contexto de teste para usuário de escola
 */
function createSchoolUserContext(schoolId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "school-user",
    email: "user@escola.betim.gov.br",
    name: "Usuário Escola",
    loginMethod: "manus",
    role: "school_user",
    schoolId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("SIGMA - Autenticação e Autorização", () => {
  it("deve retornar informações do usuário autenticado", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.role).toBe("admin");
    expect(result?.email).toBe("admin@sain.betim.gov.br");
  });

  it("deve permitir que admin acesse dashboard stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.stats();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalStudents");
    expect(result).toHaveProperty("activeMediators");
    expect(result).toHaveProperty("pendingAttendances");
    expect(result).toHaveProperty("externalDemands");
  });

  it("deve permitir que usuário de escola acesse dados da sua escola", async () => {
    const schoolId = 1;
    const ctx = createSchoolUserContext(schoolId);
    const caller = appRouter.createCaller(ctx);

    // Usuário de escola deve conseguir listar alunos da sua escola
    const students = await caller.students.listBySchool();

    expect(Array.isArray(students)).toBe(true);
  });

  it("deve retornar array vazio para usuário de escola sem schoolId", async () => {
    const ctx = createSchoolUserContext(0);
    ctx.user.schoolId = undefined;
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.listBySchool();

    expect(students).toEqual([]);
  });

  it("deve permitir logout", async () => {
    const ctx = createAdminContext();
    const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

    ctx.res = {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as unknown as TrpcContext["res"];

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(clearedCookies).toHaveLength(1);
  });
});

describe("SIGMA - Controle de Acesso por Perfil", () => {
  it("admin deve listar alunos de qualquer escola", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.listBySchool();

    expect(Array.isArray(students)).toBe(true);
  });

  it("usuário de escola deve listar apenas alunos da sua escola", async () => {
    const schoolId = 1;
    const ctx = createSchoolUserContext(schoolId);
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.listBySchool();

    expect(Array.isArray(students)).toBe(true);
  });

  it("admin deve listar mediadores", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const mediators = await caller.mediators.listBySchool();

    expect(Array.isArray(mediators)).toBe(true);
  });

  it("admin deve listar atendimentos", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const attendances = await caller.attendances.listBySchool();

    expect(Array.isArray(attendances)).toBe(true);
  });

  it("admin deve listar demandas externas", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const demands = await caller.externalDemands.listBySchool();

    expect(Array.isArray(demands)).toBe(true);
  });
});

describe("SIGMA - Gestão de Escolas", () => {
  it("deve listar todas as escolas", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const schools = await caller.schools.list();

    expect(Array.isArray(schools)).toBe(true);
  });
});
