import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { schools, students } from "../../drizzle/schema";
import { like, and, eq } from "drizzle-orm";

/**
 * Search procedures for Farol module
 * Provides autocomplete search for schools and students
 */

export const searchSchools = protectedProcedure
  .input(
    z.object({
      query: z.string().min(1).max(100),
      limit: z.number().int().min(1).max(50).default(10),
      offset: z.number().int().min(0).default(0),
    })
  )
  .query(async ({ input }: { input: { query: string; limit: number; offset: number } }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const searchPattern = `%${input.query}%`;

    const results = await db
      .select({
        id: schools.id,
        name: schools.name,
        code: schools.code,
        type: schools.type,
        address: schools.address,
      })
      .from(schools)
      .where(
        and(
          like(schools.name, searchPattern),
          eq(schools.isActive, true)
        )
      )
      .limit(input.limit)
      .offset(input.offset);

    const total = await db
      .select({ count: schools.id })
      .from(schools)
      .where(
        and(
          like(schools.name, searchPattern),
          eq(schools.isActive, true)
        )
      );

    return {
      schools: results,
      total: total.length,
    };
  });

export const searchStudents = protectedProcedure
  .input(
    z.object({
      query: z.string().min(1).max(100),
      schoolId: z.number().int(), // obrigatório: busca sempre filtrada por escola
      limit: z.number().int().min(1).max(50).default(10),
      offset: z.number().int().min(0).default(0),
    })
  )
  .query(async ({ input }: { input: { query: string; schoolId: number; limit: number; offset: number } }) => {
    console.log('[searchStudents] Buscando aluno:', input.query, '| Escola ID:', input.schoolId);
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const searchPattern = `%${input.query}%`;

    const whereConditions = [
      like(students.name, searchPattern),
      eq(students.status, "active"),
      eq(students.schoolId, input.schoolId), // sempre filtra pela escola
    ];

    const results = await db
      .select({
        id: students.id,
        name: students.name,
        schoolId: students.schoolId,
        enrollmentNumber: students.enrollmentNumber,
        disability: students.disability,
        shift: students.shift,
        grade: students.grade,
        dateOfBirth: students.dateOfBirth,
      })
      .from(students)
      .where(and(...whereConditions))
      .limit(input.limit)
      .offset(input.offset);

    const total = await db
      .select({ count: students.id })
      .from(students)
      .where(and(...whereConditions));

    return {
      students: results,
      total: total.length,
    };
  });

export const getSchoolById = protectedProcedure
  .input(z.object({ id: z.number().int() }))
  .query(async ({ input }: { input: { id: number } }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const school = await db
      .select()
      .from(schools)
      .where(eq(schools.id, input.id))
      .limit(1);

    return school[0] || null;
  });

export const getStudentById = protectedProcedure
  .input(z.object({ id: z.number().int() }))
  .query(async ({ input }: { input: { id: number } }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const student = await db
      .select()
      .from(students)
      .where(eq(students.id, input.id))
      .limit(1);

    return student[0] || null;
  });
