import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, schools, students, mediators, attendances, externalDemands, mediatorStudents, statusHistory, weeklySnapshots, demands, userSchools } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Verificar se existe usuário pré-cadastrado com o mesmo e-mail (reconciliação no primeiro login)
    if (user.email) {
      const existing = await db.select({ id: users.id, openId: users.openId })
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);
      if (existing.length > 0 && existing[0].openId !== user.openId && existing[0].openId.startsWith('pre_')) {
        // Atualizar o registro pré-cadastrado com o openId real do Manus
        await db.update(users)
          .set({
            openId: user.openId,
            name: user.name ?? undefined,
            loginMethod: user.loginMethod ?? undefined,
            lastSignedIn: new Date(),
          })
          .where(eq(users.id, existing[0].id));
        return;
      }
    }

    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Query helpers para o SIGMA
 */

export async function getSchools() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schools);
}

export async function getStudentsBySchool(schoolId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(students).where(eq(students.schoolId, schoolId));
}

export async function getMediatorsBySchool(schoolId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediators).where(eq(mediators.schoolId, schoolId));
}

export async function getAttendancesBySchool(schoolId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendances).where(eq(attendances.schoolId, schoolId));
}

export async function getExternalDemandsBySchool(schoolId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(externalDemands).where(eq(externalDemands.schoolId, schoolId));
}

/**
 * Retorna a lista de schoolIds vinculados ao usuário via tabela user_schools.
 * Para school_user com schoolId legado, inclui também o campo schoolId direto.
 * Esta é a fonte de verdade para filtros de escopo por usuário.
 */
export async function getUserSchoolIds(userId: number, legacySchoolId?: number | null): Promise<number[]> {
  const db = await getDb();
  if (!db) return legacySchoolId ? [legacySchoolId] : [];
  try {
    const rows = await db.select({ schoolId: userSchools.schoolId })
      .from(userSchools)
      .where(eq(userSchools.userId, userId));
    const ids = rows.map(r => r.schoolId);
    // Incluir schoolId legado se ainda não estiver na lista
    if (legacySchoolId && !ids.includes(legacySchoolId)) ids.push(legacySchoolId);
    return ids;
  } catch {
    return legacySchoolId ? [legacySchoolId] : [];
  }
}

/**
 * Fonte oficial de contagem de alunos: tabela demands.
 * Usar em dashboards, relatórios e exports para evitar divergência.
 */
export async function getStudentCount(schoolId?: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const rows = schoolId
      ? await db.select({ id: demands.id }).from(demands).where(eq(demands.schoolId, schoolId))
      : await db.select({ id: demands.id }).from(demands);
    return rows.length;
  } catch {
    return 0;
  }
}
