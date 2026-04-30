-- ============================================================================
-- Fase 2: Adicionar Foreign Keys para Integridade Referencial
-- ============================================================================
-- Objetivo: Garantir que todas as referências entre tabelas sejam válidas
-- Estratégia: Adicionar FKs com ON DELETE RESTRICT para prevenir exclusões acidentais
--
-- ORDEM DE EXECUÇÃO:
-- 1. Adicionar FKs em tabelas que referenciam users (createdBy, updatedBy, etc)
-- 2. Adicionar FKs em tabelas que referenciam schools
-- 3. Adicionar FKs em tabelas que referenciam students/mediators
-- 4. Adicionar FKs em tabelas que referenciam farol_cases
-- ============================================================================

-- ============================================================================
-- FASE 2.1: Foreign Keys para Users (createdBy, updatedBy, changedBy, etc)
-- ============================================================================

-- users.schoolId → schools.id
ALTER TABLE users 
ADD CONSTRAINT fk_users_schoolId 
FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE SET NULL;

-- student_edit_history.editedBy → users.id
ALTER TABLE student_edit_history 
ADD CONSTRAINT fk_student_edit_history_editedBy 
FOREIGN KEY (editedBy) REFERENCES users(id) ON DELETE RESTRICT;

-- mediator_status_change_history.changedBy → users.id
ALTER TABLE mediator_status_change_history 
ADD CONSTRAINT fk_mediator_status_change_history_changedBy 
FOREIGN KEY (changedBy) REFERENCES users(id) ON DELETE RESTRICT;

-- status_history.changedBy → users.id
ALTER TABLE status_history 
ADD CONSTRAINT fk_status_history_changedBy 
FOREIGN KEY (changedBy) REFERENCES users(id) ON DELETE RESTRICT;

-- farol_cases.createdBy → users.id
ALTER TABLE farol_cases 
ADD CONSTRAINT fk_farol_cases_createdBy 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT;

-- farol_cases.updatedBy → users.id
ALTER TABLE farol_cases 
ADD CONSTRAINT fk_farol_cases_updatedBy 
FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL;

-- farol_cases.deletedBy → users.id
ALTER TABLE farol_cases 
ADD CONSTRAINT fk_farol_cases_deletedBy 
FOREIGN KEY (deletedBy) REFERENCES users(id) ON DELETE SET NULL;

-- farol_case_history.createdBy → users.id
ALTER TABLE farol_case_history 
ADD CONSTRAINT fk_farol_case_history_createdBy 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT;

-- farol_case_movements.actorId → users.id
ALTER TABLE farol_case_movements 
ADD CONSTRAINT fk_farol_case_movements_actorId 
FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE RESTRICT;

-- farol_audit.userId → users.id
ALTER TABLE farol_audit 
ADD CONSTRAINT fk_farol_audit_userId 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT;

-- farol_advisors.createdBy → users.id
ALTER TABLE farol_advisors 
ADD CONSTRAINT fk_farol_advisors_createdBy 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT;

-- farol_advisors.updatedBy → users.id
ALTER TABLE farol_advisors 
ADD CONSTRAINT fk_farol_advisors_updatedBy 
FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL;

-- farol_advisors.deletedBy → users.id
ALTER TABLE farol_advisors 
ADD CONSTRAINT fk_farol_advisors_deletedBy 
FOREIGN KEY (deletedBy) REFERENCES users(id) ON DELETE SET NULL;

-- case_evolutions.createdBy → users.id
ALTER TABLE case_evolutions 
ADD CONSTRAINT fk_case_evolutions_createdBy 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT;

-- demands.createdBy → users.id
ALTER TABLE demands 
ADD CONSTRAINT fk_demands_createdBy 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL;

-- demands.updatedBy → users.id
ALTER TABLE demands 
ADD CONSTRAINT fk_demands_updatedBy 
FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- FASE 2.2: Foreign Keys para Schools
-- ============================================================================

-- students.schoolId → schools.id
ALTER TABLE students 
ADD CONSTRAINT fk_students_schoolId 
FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT;

-- mediators.schoolId → schools.id
ALTER TABLE mediators 
ADD CONSTRAINT fk_mediators_schoolId 
FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT;

-- mediators.otherSchoolId → schools.id (escola do outro turno)
ALTER TABLE mediators 
ADD CONSTRAINT fk_mediators_otherSchoolId 
FOREIGN KEY (otherSchoolId) REFERENCES schools(id) ON DELETE SET NULL;

-- attendances.schoolId → schools.id
ALTER TABLE attendances 
ADD CONSTRAINT fk_attendances_schoolId 
FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT;

-- demands.schoolId → schools.id
ALTER TABLE demands 
ADD CONSTRAINT fk_demands_schoolId 
FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT;

-- external_demands.schoolId → schools.id
ALTER TABLE external_demands 
ADD CONSTRAINT fk_external_demands_schoolId 
FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT;

-- farol_cases.schoolId → schools.id
ALTER TABLE farol_cases 
ADD CONSTRAINT fk_farol_cases_schoolId 
FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT;

-- weekly_snapshots.schoolId → schools.id
ALTER TABLE weekly_snapshots 
ADD CONSTRAINT fk_weekly_snapshots_schoolId 
FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT;

-- ============================================================================
-- FASE 2.3: Foreign Keys para Students
-- ============================================================================

-- attendances.studentId → students.id
ALTER TABLE attendances 
ADD CONSTRAINT fk_attendances_studentId 
FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE RESTRICT;

-- student_edit_history.studentId → students.id
ALTER TABLE student_edit_history 
ADD CONSTRAINT fk_student_edit_history_studentId 
FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE RESTRICT;

-- mediator_students.studentId → students.id
ALTER TABLE mediator_students 
ADD CONSTRAINT fk_mediator_students_studentId 
FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE RESTRICT;

-- external_demands.studentId → students.id (nullable)
ALTER TABLE external_demands 
ADD CONSTRAINT fk_external_demands_studentId 
FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE SET NULL;

-- ============================================================================
-- FASE 2.4: Foreign Keys para Mediators
-- ============================================================================

-- attendances.mediatorId → mediators.id
ALTER TABLE attendances 
ADD CONSTRAINT fk_attendances_mediatorId 
FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT;

-- mediator_students.mediatorId → mediators.id
ALTER TABLE mediator_students 
ADD CONSTRAINT fk_mediator_students_mediatorId 
FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT;

-- mediator_status_change_history.mediatorId → mediators.id
ALTER TABLE mediator_status_change_history 
ADD CONSTRAINT fk_mediator_status_change_history_mediatorId 
FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT;

-- status_history.mediatorId → mediators.id
ALTER TABLE status_history 
ADD CONSTRAINT fk_status_history_mediatorId 
FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT;

-- shared_attendances.mediatorId → mediators.id
ALTER TABLE shared_attendances 
ADD CONSTRAINT fk_shared_attendances_mediatorId 
FOREIGN KEY (mediatorId) REFERENCES mediators(id) ON DELETE RESTRICT;

-- ============================================================================
-- FASE 2.5: Foreign Keys para Attendances
-- ============================================================================

-- shared_attendances.attendanceId → attendances.id
ALTER TABLE shared_attendances 
ADD CONSTRAINT fk_shared_attendances_attendanceId 
FOREIGN KEY (attendanceId) REFERENCES attendances(id) ON DELETE RESTRICT;

-- ============================================================================
-- FASE 2.6: Foreign Keys para FarolCases
-- ============================================================================

-- farol_case_history.caseId → farol_cases.id
ALTER TABLE farol_case_history 
ADD CONSTRAINT fk_farol_case_history_caseId 
FOREIGN KEY (caseId) REFERENCES farol_cases(id) ON DELETE RESTRICT;

-- farol_case_movements.caseId → farol_cases.id
ALTER TABLE farol_case_movements 
ADD CONSTRAINT fk_farol_case_movements_caseId 
FOREIGN KEY (caseId) REFERENCES farol_cases(id) ON DELETE RESTRICT;

-- farol_audit.caseId → farol_cases.id (nullable)
ALTER TABLE farol_audit 
ADD CONSTRAINT fk_farol_audit_caseId 
FOREIGN KEY (caseId) REFERENCES farol_cases(id) ON DELETE SET NULL;

-- case_evolutions.caseId → farol_cases.id
ALTER TABLE case_evolutions 
ADD CONSTRAINT fk_case_evolutions_caseId 
FOREIGN KEY (caseId) REFERENCES farol_cases(id) ON DELETE RESTRICT;

-- ============================================================================
-- FASE 2.7: Foreign Keys para Demands
-- ============================================================================

-- mediator_students.demandId → demands.id (nullable)
ALTER TABLE mediator_students 
ADD CONSTRAINT fk_mediator_students_demandId 
FOREIGN KEY (demandId) REFERENCES demands(id) ON DELETE SET NULL;

-- ============================================================================
-- FASE 2.8: Foreign Keys para External Demands
-- ============================================================================

-- external_demands.assignedTo → users.id (nullable)
ALTER TABLE external_demands 
ADD CONSTRAINT fk_external_demands_assignedTo 
FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- FASE 2.9: Foreign Keys para Weekly Snapshots
-- ============================================================================

-- weekly_snapshots.submittedBy → users.id (nullable)
ALTER TABLE weekly_snapshots 
ADD CONSTRAINT fk_weekly_snapshots_submittedBy 
FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- FASE 2.10: Foreign Keys para FarolCases (profissionais responsáveis)
-- ============================================================================

-- farol_cases.profissionalResponsavelId → farol_advisors.id (nullable)
ALTER TABLE farol_cases 
ADD CONSTRAINT fk_farol_cases_profissionalResponsavelId 
FOREIGN KEY (profissionalResponsavelId) REFERENCES farol_advisors(id) ON DELETE SET NULL;

-- farol_cases.coordenadorResponsavelId → farol_advisors.id (nullable)
ALTER TABLE farol_cases 
ADD CONSTRAINT fk_farol_cases_coordenadorResponsavelId 
FOREIGN KEY (coordenadorResponsavelId) REFERENCES farol_advisors(id) ON DELETE SET NULL;

-- ============================================================================
-- Fim da Fase 2: Foreign Keys Adicionadas com Sucesso
-- ============================================================================
