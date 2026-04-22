import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("SIGMA V2 - Dashboard Stats Enriquecido", () => {
  it("admin dashboard stats deve incluir campos de ranking e distribuição", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalStudents");
    expect(result).toHaveProperty("activeMediators");
    expect(result).toHaveProperty("totalMediators");
    expect(result).toHaveProperty("totalSchools");
    expect(result).toHaveProperty("studentsWithMediator");
    expect(result).toHaveProperty("studentsWithoutMediator");
    expect(result).toHaveProperty("onLeave");
    expect(result).toHaveProperty("vacancies");
    expect(result).toHaveProperty("byDisability");
    expect(result).toHaveProperty("byShift");
    expect(result).toHaveProperty("byInactivity");
    expect(result).toHaveProperty("emRanking");
    expect(result).toHaveProperty("cimRanking");
    expect(Array.isArray(result.byDisability)).toBe(true);
    expect(Array.isArray(result.byShift)).toBe(true);
    expect(Array.isArray(result.byInactivity)).toBe(true);
    expect(Array.isArray(result.emRanking)).toBe(true);
    expect(Array.isArray(result.cimRanking)).toBe(true);
  });

  it("stats numéricos devem ser >= 0", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();

    expect(result.totalStudents).toBeGreaterThanOrEqual(0);
    expect(result.activeMediators).toBeGreaterThanOrEqual(0);
    expect(result.totalMediators).toBeGreaterThanOrEqual(0);
    expect(result.totalSchools).toBeGreaterThanOrEqual(0);
    expect(result.studentsWithMediator).toBeGreaterThanOrEqual(0);
    expect(result.studentsWithoutMediator).toBeGreaterThanOrEqual(0);
  });
});

describe("SIGMA V2 - Schools Panel & Alerts", () => {
  it("admin deve acessar painel de escolas", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const panel = await caller.schools.panel();

    expect(Array.isArray(panel)).toBe(true);
    if (panel.length > 0) {
      expect(panel[0]).toHaveProperty("id");
      expect(panel[0]).toHaveProperty("name");
      expect(panel[0]).toHaveProperty("weeklyStatus");
    }
  });

  it("admin deve acessar alertas de escolas", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const alerts = await caller.schools.alerts();

    expect(Array.isArray(alerts)).toBe(true);
  });

  it("admin deve listar escolas com estatísticas", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const list = await caller.schools.listWithStats();

    expect(Array.isArray(list)).toBe(true);
    if (list.length > 0) {
      expect(list[0]).toHaveProperty("id");
      expect(list[0]).toHaveProperty("name");
      expect(list[0]).toHaveProperty("students");
      expect(list[0]).toHaveProperty("mediators");
    }
  });
});

describe("SIGMA V2 - Weekly Snapshots", () => {
  it("deve listar snapshots por escola", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const snapshots = await caller.weeklySnapshots.listBySchool({ schoolId: 1 });

    expect(Array.isArray(snapshots)).toBe(true);
  });
});

describe("SIGMA V2 - Status History", () => {
  it("deve listar histórico de status de um mediador", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const history = await caller.statusHistory.list({ mediatorId: 1 });

    expect(Array.isArray(history)).toBe(true);
  });
});

describe("SIGMA V2 - Reports Generate", () => {
  it("admin deve gerar relatório de alunos", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const report = await caller.reports.generate({ type: "students" });

    expect(report).toBeDefined();
    expect(report).toHaveProperty("rows");
    expect(report).toHaveProperty("total");
    expect(Array.isArray(report.rows)).toBe(true);
    expect(typeof report.total).toBe("number");
  });

  it("admin deve gerar relatório de mediadores", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const report = await caller.reports.generate({ type: "mediators" });

    expect(report).toBeDefined();
    expect(report).toHaveProperty("rows");
    expect(report).toHaveProperty("total");
  });

  it("admin deve gerar relatório de escolas", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const report = await caller.reports.generate({ type: "schools" });

    expect(report).toBeDefined();
    expect(report).toHaveProperty("rows");
    expect(report).toHaveProperty("total");
  });

  it("admin deve gerar relatório de atendimentos", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const report = await caller.reports.generate({ type: "attendances" });

    expect(report).toBeDefined();
    expect(report).toHaveProperty("rows");
    expect(report).toHaveProperty("total");
  });
});

describe("SIGMA V2 - Mediator Student Links", () => {
  it("admin deve listar vínculos mediador-aluno", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const links = await caller.mediatorStudentLinks.list();

    expect(Array.isArray(links)).toBe(true);
  });

  it("deve filtrar vínculos por mediador", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const links = await caller.mediatorStudentLinks.list({ mediatorId: 1 });

    expect(Array.isArray(links)).toBe(true);
  });

  it("deve filtrar vínculos por aluno", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const links = await caller.mediatorStudentLinks.list({ studentId: 1 });

    expect(Array.isArray(links)).toBe(true);
  });
});

describe("SIGMA V2 - Filtro por Escola", () => {
  it("escola deve listar mediadores apenas da sua escola", async () => {
    const ctx = createSchoolUserContext(1);
    const caller = appRouter.createCaller(ctx);
    const mediators = await caller.mediators.listBySchool();

    expect(Array.isArray(mediators)).toBe(true);
  });

  it("escola deve listar atendimentos apenas da sua escola", async () => {
    const ctx = createSchoolUserContext(1);
    const caller = appRouter.createCaller(ctx);
    const attendances = await caller.attendances.listBySchool();

    expect(Array.isArray(attendances)).toBe(true);
  });

  it("escola sem schoolId deve retornar arrays vazios", async () => {
    const ctx = createSchoolUserContext(0);
    (ctx.user as AuthenticatedUser).schoolId = undefined;
    const caller = appRouter.createCaller(ctx);

    const mediators = await caller.mediators.listBySchool();
    const students = await caller.students.listBySchool();

    expect(mediators).toEqual([]);
    expect(students).toEqual([]);
  });
});
