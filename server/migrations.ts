/**
 * Migration Helper - Execute raw SQL migrations via Drizzle
 * Used to apply Foreign Keys and other schema changes
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";

export async function applyForeignKeysMigration(): Promise<{
  success: boolean;
  message: string;
  errors?: string[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      message: "Database not available",
    };
  }

  const errors: string[] = [];
  const migrations = [
    // ============================================================================
    // FASE 2.1: Foreign Keys para Users
    // ============================================================================
    {
      name: "fk_users_schoolId",
      sql: sql`ALTER TABLE users ADD CONSTRAINT fk_users_schoolId FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_student_edit_history_editedBy",
      sql: sql`ALTER TABLE student_edit_history ADD CONSTRAINT fk_student_edit_history_editedBy FOREIGN KEY (editedBy) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_mediator_status_change_history_changedBy",
      sql: sql`ALTER TABLE mediator_status_change_history ADD CONSTRAINT fk_mediator_status_change_history_changedBy FOREIGN KEY (changedBy) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_status_history_changedBy",
      sql: sql`ALTER TABLE status_history ADD CONSTRAINT fk_status_history_changedBy FOREIGN KEY (changedBy) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_cases_createdBy",
      sql: sql`ALTER TABLE farol_cases ADD CONSTRAINT fk_farol_cases_createdBy FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_cases_updatedBy",
      sql: sql`ALTER TABLE farol_cases ADD CONSTRAINT fk_farol_cases_updatedBy FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_farol_cases_deletedBy",
      sql: sql`ALTER TABLE farol_cases ADD CONSTRAINT fk_farol_cases_deletedBy FOREIGN KEY (deletedBy) REFERENCES users(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_farol_case_history_createdBy",
      sql: sql`ALTER TABLE farol_case_history ADD CONSTRAINT fk_farol_case_history_createdBy FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_case_movements_actorId",
      sql: sql`ALTER TABLE farol_case_movements ADD CONSTRAINT fk_farol_case_movements_actorId FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_audit_userId",
      sql: sql`ALTER TABLE farol_audit ADD CONSTRAINT fk_farol_audit_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_advisors_createdBy",
      sql: sql`ALTER TABLE farol_advisors ADD CONSTRAINT fk_farol_advisors_createdBy FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_advisors_updatedBy",
      sql: sql`ALTER TABLE farol_advisors ADD CONSTRAINT fk_farol_advisors_updatedBy FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_farol_advisors_deletedBy",
      sql: sql`ALTER TABLE farol_advisors ADD CONSTRAINT fk_farol_advisors_deletedBy FOREIGN KEY (deletedBy) REFERENCES users(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_case_evolutions_createdBy",
      sql: sql`ALTER TABLE case_evolutions ADD CONSTRAINT fk_case_evolutions_createdBy FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_demands_createdBy",
      sql: sql`ALTER TABLE demands ADD CONSTRAINT fk_demands_createdBy FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_demands_updatedBy",
      sql: sql`ALTER TABLE demands ADD CONSTRAINT fk_demands_updatedBy FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL`,
    },

    // ============================================================================
    // FASE 2.2: Foreign Keys para Schools
    // ============================================================================
    {
      name: "fk_students_schoolId",
      sql: sql`ALTER TABLE students ADD CONSTRAINT fk_students_schoolId FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_mediators_schoolId",
      sql: sql`ALTER TABLE mediators ADD CONSTRAINT fk_mediators_schoolId FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_mediators_otherSchoolId",
      sql: sql`ALTER TABLE mediators ADD CONSTRAINT fk_mediators_otherSchoolId FOREIGN KEY (otherSchoolId) REFERENCES schools(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_attendances_schoolId",
      sql: sql`ALTER TABLE attendances ADD CONSTRAINT fk_attendances_schoolId FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_demands_schoolId",
      sql: sql`ALTER TABLE demands ADD CONSTRAINT fk_demands_schoolId FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_external_demands_schoolId",
      sql: sql`ALTER TABLE external_demands ADD CONSTRAINT fk_external_demands_schoolId FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_cases_schoolId",
      sql: sql`ALTER TABLE farol_cases ADD CONSTRAINT fk_farol_cases_schoolId FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_weekly_snapshots_schoolId",
      sql: sql`ALTER TABLE weekly_snapshots ADD CONSTRAINT fk_weekly_snapshots_schoolId FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT`,
    },

    // ============================================================================
    // FASE 2.3: Foreign Keys para Students
    // ============================================================================
    {
      name: "fk_attendances_studentId",
      sql: sql`ALTER TABLE attendances ADD CONSTRAINT fk_attendances_studentId FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_student_edit_history_studentId",
      sql: sql`ALTER TABLE student_edit_history ADD CONSTRAINT fk_student_edit_history_studentId FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_mediator_students_studentId",
      sql: sql`ALTER TABLE mediator_students ADD CONSTRAINT fk_mediator_students_studentId FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_external_demands_studentId",
      sql: sql`ALTER TABLE external_demands ADD CONSTRAINT fk_external_demands_studentId FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE SET NULL`,
    },

    // ============================================================================
    // FASE 2.4: Foreign Keys para Mediators
    // ============================================================================
    {
      name: "fk_attendances_mediatorId",
      sql: sql`ALTER TABLE attendances ADD CONSTRAINT fk_attendances_mediatorId FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_mediator_students_mediatorId",
      sql: sql`ALTER TABLE mediator_students ADD CONSTRAINT fk_mediator_students_mediatorId FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_mediator_status_change_history_mediatorId",
      sql: sql`ALTER TABLE mediator_status_change_history ADD CONSTRAINT fk_mediator_status_change_history_mediatorId FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_status_history_mediatorId",
      sql: sql`ALTER TABLE status_history ADD CONSTRAINT fk_status_history_mediatorId FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_shared_attendances_mediatorId",
      sql: sql`ALTER TABLE shared_attendances ADD CONSTRAINT fk_shared_attendances_mediatorId FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT`,
    },

    // ============================================================================
    // FASE 2.5: Foreign Keys para Attendances
    // ============================================================================
    {
      name: "fk_shared_attendances_attendanceId",
      sql: sql`ALTER TABLE shared_attendances ADD CONSTRAINT fk_shared_attendances_attendanceId FOREIGN KEY (attendanceId) REFERENCES attendances(id) ON DELETE RESTRICT`,
    },

    // ============================================================================
    // FASE 2.6: Foreign Keys para FarolCases
    // ============================================================================
    {
      name: "fk_farol_case_history_caseId",
      sql: sql`ALTER TABLE farol_case_history ADD CONSTRAINT fk_farol_case_history_caseId FOREIGN KEY (caseId) REFERENCES farol_cases(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_case_movements_caseId",
      sql: sql`ALTER TABLE farol_case_movements ADD CONSTRAINT fk_farol_case_movements_caseId FOREIGN KEY (caseId) REFERENCES farol_cases(id) ON DELETE RESTRICT`,
    },
    {
      name: "fk_farol_audit_caseId",
      sql: sql`ALTER TABLE farol_audit ADD CONSTRAINT fk_farol_audit_caseId FOREIGN KEY (caseId) REFERENCES farol_cases(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_case_evolutions_caseId",
      sql: sql`ALTER TABLE case_evolutions ADD CONSTRAINT fk_case_evolutions_caseId FOREIGN KEY (caseId) REFERENCES farol_cases(id) ON DELETE RESTRICT`,
    },

    // ============================================================================
    // FASE 2.7: Foreign Keys para Demands
    // ============================================================================
    {
      name: "fk_mediator_students_demandId",
      sql: sql`ALTER TABLE mediator_students ADD CONSTRAINT fk_mediator_students_demandId FOREIGN KEY (demandId) REFERENCES demands(id) ON DELETE SET NULL`,
    },

    // ============================================================================
    // FASE 2.8: Foreign Keys para External Demands
    // ============================================================================
    {
      name: "fk_external_demands_assignedTo",
      sql: sql`ALTER TABLE external_demands ADD CONSTRAINT fk_external_demands_assignedTo FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL`,
    },

    // ============================================================================
    // FASE 2.9: Foreign Keys para Weekly Snapshots
    // ============================================================================
    {
      name: "fk_weekly_snapshots_submittedBy",
      sql: sql`ALTER TABLE weekly_snapshots ADD CONSTRAINT fk_weekly_snapshots_submittedBy FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE SET NULL`,
    },

    // ============================================================================
    // FASE 2.10: Foreign Keys para FarolCases (profissionais responsáveis)
    // ============================================================================
    {
      name: "fk_farol_cases_profissionalResponsavelId",
      sql: sql`ALTER TABLE farol_cases ADD CONSTRAINT fk_farol_cases_profissionalResponsavelId FOREIGN KEY (profissionalResponsavelId) REFERENCES farol_advisors(id) ON DELETE SET NULL`,
    },
    {
      name: "fk_farol_cases_coordenadorResponsavelId",
      sql: sql`ALTER TABLE farol_cases ADD CONSTRAINT fk_farol_cases_coordenadorResponsavelId FOREIGN KEY (coordenadorResponsavelId) REFERENCES farol_advisors(id) ON DELETE SET NULL`,
    },
  ];

  let successCount = 0;

  for (const migration of migrations) {
    try {
      await db.execute(migration.sql);
      console.log(`[Migration] ✅ ${migration.name}`);
      successCount++;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      // Ignore "Constraint already exists" errors (idempotent)
      if (errorMsg.includes("already exists") || errorMsg.includes("Duplicate key name")) {
        console.log(`[Migration] ⚠️  ${migration.name} (already exists)`);
        successCount++;
      } else {
        console.error(`[Migration] ❌ ${migration.name}:`, errorMsg);
        errors.push(`${migration.name}: ${errorMsg}`);
      }
    }
  }

  return {
    success: errors.length === 0,
    message: `Applied ${successCount}/${migrations.length} migrations`,
    errors: errors.length > 0 ? errors : undefined,
  };
}
