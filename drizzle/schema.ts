import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date, time, foreignKey } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with SIGMA-specific fields for role-based access control.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "sain_assessor", "coordinator", "external_professional", "school_user"]).default("school_user").notNull(),
  schoolId: int("schoolId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Schools table - Unidades escolares da rede municipal
 */
export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  principal: varchar("principal", { length: 255 }),
  responsible: varchar("responsible", { length: 255 }),
  weeklyStatus: mysqlEnum("weeklyStatus", ["updated", "pending", "with_vacancy", "with_leave"]).default("pending"),
  lastWeeklyUpdate: timestamp("lastWeeklyUpdate"),
  isActive: boolean("isActive").default(true).notNull(),
  type: varchar("type", { length: 50 }).default("EM"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;

/**
 * Students table - Alunos com necessidades especiais
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  dateOfBirth: date("dateOfBirth"),
  cpf: varchar("cpf", { length: 20 }),
  schoolId: int("schoolId").notNull(),
  specialNeeds: text("specialNeeds"),
  status: mysqlEnum("status", ["active", "inactive", "transferred"]).default("active").notNull(),
  enrollmentNumber: varchar("enrollmentNumber", { length: 50 }),
  guardianName: varchar("guardianName", { length: 255 }),
  guardianPhone: varchar("guardianPhone", { length: 20 }),
  notes: text("notes"),
  // Campos adicionais para dashboard e relatórios
  disability: varchar("disability", { length: 255 }),
  shift: mysqlEnum("shift", ["morning", "afternoon", "full", "evening"]),
  grade: varchar("grade", { length: 50 }),
  // Mobilidade (Quadro AAP)
  usesWheelchair: boolean("usesWheelchair").default(false),
  usesWalker: boolean("usesWalker").default(false),
  usesProsthesis: boolean("usesProsthesis").default(false),
  // Atendimento domiciliar
  homeCare: boolean("homeCare").default(false),
  // Necessita de atendente?
  needsAttendant: mysqlEnum("needsAttendant", ["yes", "no", "nam"]).default("yes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Mediators table - Profissionais que realizam atendimentos (Quadro de Atendentes)
 * Status expandido para refletir o MVP: active, inactive, on_leave, dismissed, substituted, vacancy
 */
export const mediators = mysqlTable("mediators", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 20 }),
  registration: varchar("registration", { length: 100 }),
  professionalLicense: varchar("professionalLicense", { length: 100 }),
  specialization: varchar("specialization", { length: 255 }),
  schoolId: int("schoolId").notNull(),
  responsible: varchar("responsible", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "on_leave", "dismissed", "substituted", "vacancy", "temp_leave"]).default("active").notNull(),
  changeType: varchar("changeType", { length: 100 }).default("Sem alteração"),
  linkedStudents: text("linkedStudents"),
  note: text("note"),
  maxAttendances: int("maxAttendances").default(0),
  // Campos de atendente compartilhado
  isShared: boolean("isShared").default(false),
  additionalStudents: text("additionalStudents"),
  // Campos de inatividade
  inactivityReason: varchar("inactivityReason", { length: 255 }),
  inactivityDate: date("inactivityDate"),
  returnDate: date("returnDate"),
  // Escola do outro turno (para mediadores que trabalham em 2 turnos)
  otherSchoolId: int("otherSchoolId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mediator = typeof mediators.$inferSelect;
export type InsertMediator = typeof mediators.$inferInsert;

/**
 * Attendances table - Registro de atendimentos
 */
export const attendances = mysqlTable("attendances", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  mediatorId: int("mediatorId").notNull(),
  schoolId: int("schoolId").notNull(),
  attendanceDate: date("attendanceDate").notNull(),
  startTime: time("startTime"),
  endTime: time("endTime"),
  description: text("description"),
  status: mysqlEnum("status", ["completed", "pending", "cancelled"]).default("pending").notNull(),
  type: mysqlEnum("type", ["individual", "shared"]).default("individual").notNull(),
  result: text("result"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = typeof attendances.$inferInsert;

/**
 * MediatorStudents - Vínculo formal N:N entre mediador e aluno
 */
export const mediatorStudents = mysqlTable("mediator_students", {
  id: int("id").autoincrement().primaryKey(),
  mediatorId: int("mediatorId").notNull(),
  studentId: int("studentId").notNull(),
  demandId: int("demandId"),
  isPrimary: boolean("isPrimary").default(true).notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediatorStudent = typeof mediatorStudents.$inferSelect;
export type InsertMediatorStudent = typeof mediatorStudents.$inferInsert;

/**
 * StatusHistory - Log de mudanças de status dos mediadores
 */
export const statusHistory = mysqlTable("status_history", {
  id: int("id").autoincrement().primaryKey(),
  mediatorId: int("mediatorId").notNull(),
  previousStatus: varchar("previousStatus", { length: 50 }).notNull(),
  newStatus: varchar("newStatus", { length: 50 }).notNull(),
  reason: text("reason"),
  changedBy: int("changedBy"),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
});

export type StatusHistoryRow = typeof statusHistory.$inferSelect;
export type InsertStatusHistory = typeof statusHistory.$inferInsert;

/**
 * WeeklySnapshots - Registro do quadro semanal com semana de referência
 */
export const weeklySnapshots = mysqlTable("weekly_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull(),
  weekReference: varchar("weekReference", { length: 20 }).notNull(),
  submittedBy: int("submittedBy"),
  submittedByName: varchar("submittedByName", { length: 255 }),
  snapshotData: text("snapshotData"),
  status: mysqlEnum("status", ["submitted", "validated", "rejected"]).default("submitted").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});  

export type WeeklySnapshot = typeof weeklySnapshots.$inferSelect;
export type InsertWeeklySnapshot = typeof weeklySnapshots.$inferInsert;

/**
 * SharedAttendances table - Vinculação de múltiplos mediadores a um atendimento
 */
export const sharedAttendances = mysqlTable("sharedAttendances", {
  id: int("id").autoincrement().primaryKey(),
  attendanceId: int("attendanceId").notNull(),
  mediatorId: int("mediatorId").notNull(),
  role: varchar("role", { length: 50 }).default("support"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SharedAttendance = typeof sharedAttendances.$inferSelect;
export type InsertSharedAttendance = typeof sharedAttendances.$inferInsert;

/**
 * ExternalDemands table - Solicitações vindas de fora da rede
 */
/**
 * Demandas Externas — expedientes institucionais recebidos pela Secretaria Adjunta de Inclusão.
 * Fonte: MP, Conselho Tutelar, Ouvidoria, Gabinete, SEMED, Justiça e outros órgãos.
 */
export const externalDemands = mysqlTable("externalDemands", {
  id: int("id").autoincrement().primaryKey(),
  // Identificação
  protocolo: varchar("protocolo", { length: 100 }),
  origem: varchar("origem", { length: 255 }).notNull(),           // órgão/setor demandante
  orgaoSetor: varchar("orgaoSetor", { length: 255 }),             // detalhamento do órgão
  tipoDocumento: mysqlEnum("tipoDocumento", [
    "oficio", "notificacao", "recomendacao", "requisicao",
    "encaminhamento", "solicitacao", "denuncia", "outros"
  ]).default("oficio").notNull(),
  // Datas e prazos
  dataRecebimento: date("dataRecebimento").notNull(),
  prazoResposta: date("prazoResposta"),
  dataEncaminhamento: date("dataEncaminhamento"),
  // Prioridade e status
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  status: mysqlEnum("status", [
    "Recebida",
    "Triagem/Protocolo",
    "Em instrução técnica",
    "Devolvida para complementação",
    "Em validação do gabinete",
    "Aguardando assinatura",
    "Assinada",
    "Encaminhada à SEMED",
    "Arquivada"
  ]).default("Recebida").notNull(),
  // Responsável e vínculos
  responsavelId: int("responsavelId"),                           // FK → users
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  schoolId: int("schoolId"),                                     // escola relacionada (opcional)
  studentId: int("studentId"),                                   // aluno relacionado (opcional)
  studentName: varchar("studentName", { length: 255 }),
  // Conteúdo
  resumo: text("resumo").notNull(),
  descricaoCompleta: text("descricaoCompleta"),
  documentosLinks: text("documentosLinks"),                      // JSON array de links/anexos
  respostaElaborada: text("respostaElaborada"),
  situacaoFinal: text("situacaoFinal"),
  // Legado (mantido para compatibilidade)
  demandType: varchar("demandType", { length: 100 }),
  source: varchar("source", { length: 100 }),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  assignedTo: int("assignedTo"),
  dueDate: date("dueDate"),
  notes: text("notes"),
  // Auditoria
  createdBy: int("createdBy"),
  createdByName: varchar("createdByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ExternalDemand = typeof externalDemands.$inferSelect;
export type InsertExternalDemand = typeof externalDemands.$inferInsert;

/**
 * Histórico de movimentações de cada demanda externa.
 * Registra cada mudança de status com observação e responsável.
 */
export const externalDemandMovements = mysqlTable("externalDemandMovements", {
  id: int("id").autoincrement().primaryKey(),
  demandId: int("demandId").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 100 }),
  statusNovo: varchar("statusNovo", { length: 100 }).notNull(),
  observacao: text("observacao"),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userRole: varchar("userRole", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ExternalDemandMovement = typeof externalDemandMovements.$inferSelect;

/**
 * Trilha de auditoria completa de demandas externas.
 * Registra criação, edição de campos, mudanças de status.
 */
export const externalDemandAudit = mysqlTable("externalDemandAudit", {
  id: int("id").autoincrement().primaryKey(),
  demandId: int("demandId").notNull(),
  acao: mysqlEnum("acao", ["criacao", "edicao", "mudanca_status", "exclusao"]).notNull(),
  campoAlterado: varchar("campoAlterado", { length: 100 }),
  valorAnterior: text("valorAnterior"),
  valorNovo: text("valorNovo"),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userRole: varchar("userRole", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ExternalDemandAudit = typeof externalDemandAudit.$inferSelect;;

/**
 * Demands table - Quadro de Atendentes (registro fiel ao sistema Netlify)
 * Armazena o registro completo: aluno + deficiências + situação + atendente
 */
export const demands = mysqlTable("demands", {
  id: int("id").autoincrement().primaryKey(),
  // Dados do aluno
  email: varchar("email", { length: 320 }),
  schoolName: varchar("schoolName", { length: 255 }).notNull(),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  dateOfBirth: date("dateOfBirth"),
  cpf: varchar("cpf", { length: 30 }),
  shift: mysqlEnum("shift", ["morning", "afternoon", "full", "evening"]).notNull(),
  grade: varchar("grade", { length: 50 }),
  // Deficiências/Transtornos (JSON array)
  disabilities: text("disabilities"),
  // Situação
  attendanceStatus: mysqlEnum("attendanceStatus", ["with_attendant", "without_attendant", "awaiting_substitution", "partially_attended"]).notNull(),
  attendantStatus: mysqlEnum("attendantStatus", ["active", "inactive"]).notNull(),
  hasAttendant: boolean("hasAttendant").default(false).notNull(),
  attendantName: varchar("attendantName", { length: 255 }),
  isShared: boolean("isShared").default(false).notNull(),
  notes: text("notes"),
  // Mobilidade e atendimento domiciliar (para Quadro AAP)
  usesWheelchair: boolean("usesWheelchair").default(false),
  usesWalker: boolean("usesWalker").default(false),
  usesProsthesis: boolean("usesProsthesis").default(false),
  homeCare: boolean("homeCare").default(false),
  needsAttendant: mysqlEnum("needsAttendant", ["yes", "no", "nam"]).default("yes"),
  // Metadados
  schoolId: int("schoolId"),
  createdBy: int("createdBy"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Demand = typeof demands.$inferSelect;
export type InsertDemand = typeof demands.$inferInsert;
/**
 * StudentEditHistory - Log de alterações de alunos (para auditoria)
 */
export const studentEditHistory = mysqlTable("student_edit_history", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  editedBy: int("editedBy").notNull(),
  editedByName: varchar("editedByName", { length: 255 }),
  fieldChanged: varchar("fieldChanged", { length: 100 }).notNull(),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  reason: text("reason"),
  editedAt: timestamp("editedAt").defaultNow().notNull(),
});

export type StudentEditHistory = typeof studentEditHistory.$inferSelect;
export type InsertStudentEditHistory = typeof studentEditHistory.$inferInsert;

/**
 * MediatorStatusChangeHistory - Log detalhado de mudanças de situação de mediadores
 */
export const mediatorStatusChangeHistory = mysqlTable("mediator_status_change_history", {
  id: int("id").autoincrement().primaryKey(),
  mediatorId: int("mediatorId").notNull(),
  previousStatus: varchar("previousStatus", { length: 50 }).notNull(),
  newStatus: varchar("newStatus", { length: 50 }).notNull(),
  reason: text("reason"),
  inactivityReason: varchar("inactivityReason", { length: 255 }),
  returnDate: date("returnDate"),
  changedBy: int("changedBy").notNull(),
  changedByName: varchar("changedByName", { length: 255 }),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
});

export type MediatorStatusChangeHistory = typeof mediatorStatusChangeHistory.$inferSelect;
export type InsertMediatorStatusChangeHistory = typeof mediatorStatusChangeHistory.$inferInsert;

/**
 * Schools - Adicionar campos isActive e type (para filtros avançados)
 * Nota: Estes campos serão adicionados via migration
 */

/**
 * Farol da Gestao - Tabelas para gerenciamento de casos intersetoriais
 */

/**
 * FarolCases - Casos/protocolos gerenciados pelo Farol da Gestao
 */
export const farolCases = mysqlTable("farol_cases", {
  id: int("id").autoincrement().primaryKey(),
  numeroCaso: varchar("numeroCaso", { length: 50 }).notNull().unique(),
  dataEntrada: date("dataEntrada").notNull(),
  nomeEstudante: varchar("nomeEstudante", { length: 255 }).notNull(),
  diagnostico: text("diagnostico"),
  responsavel: varchar("responsavel", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  escola: varchar("escola", { length: 255 }),
  schoolId: int("schoolId"),
  studentId: int("studentId"),                    // FK → students.id (opcional)
  regional: varchar("regional", { length: 100 }),
  segmento: varchar("segmento", { length: 100 }),
  tipoDemanda: varchar("tipoDemanda", { length: 100 }),
  origem: varchar("origem", { length: 100 }),
  analiseConjunta: text("analiseConjunta"),
  setorCraei: varchar("setorCraei", { length: 255 }),
  profissionalResponsavelId: int("profissionalResponsavelId"),
  coordenadorResponsavelId: int("coordenadorResponsavelId"),
  situacao: mysqlEnum("situacao", ["Ativo", "Inativo", "Arquivado", "Suspenso"]).default("Ativo").notNull(),
  status: mysqlEnum("status", ["Novo", "Em acompanhamento", "Aguardando retorno", "Encaminhado", "Resolvido", "Encerrado"]).default("Novo").notNull(),
  classificacaoCaso: varchar("classificacaoCaso", { length: 100 }),
  alerta: boolean("alerta").default(false),
  observacaoGeral: text("observacaoGeral"),
  driveFolderUrl: varchar("driveFolderUrl", { length: 500 }),
  active: boolean("active").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdByName: varchar("createdByName", { length: 255 }).notNull(),
  updatedBy: int("updatedBy"),
  updatedByName: varchar("updatedByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
  deletedBy: int("deletedBy"),
  deletionReason: text("deletionReason"),
});

export type FarolCase = typeof farolCases.$inferSelect;
export type InsertFarolCase = typeof farolCases.$inferInsert;

/**
 * FarolCaseHistory - Historico de acoes em cada caso
 */
export const farolCaseHistory = mysqlTable("farol_case_history", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  numeroCaso: varchar("numeroCaso", { length: 50 }).notNull(),
  actionType: varchar("actionType", { length: 100 }).notNull(),
  description: text("description"),
  forwarding: text("forwarding"),
  internalNote: text("internalNote"),
  createdBy: int("createdBy").notNull(),
  createdByName: varchar("createdByName", { length: 255 }).notNull(),
  createdByRole: varchar("createdByRole", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FarolCaseHistory = typeof farolCaseHistory.$inferSelect;
export type InsertFarolCaseHistory = typeof farolCaseHistory.$inferInsert;

/**
 * FarolCaseMovements - Trilha de auditoria de movimentacoes
 */
export const farolCaseMovements = mysqlTable("farol_case_movements", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  numeroCaso: varchar("numeroCaso", { length: 50 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  metadata: text("metadata"),
  actorId: int("actorId").notNull(),
  actorName: varchar("actorName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FarolCaseMovement = typeof farolCaseMovements.$inferSelect;
export type InsertFarolCaseMovement = typeof farolCaseMovements.$inferInsert;

/**
 * FarolAudit - Trilha de auditoria completa do Farol
 */
export const farolAudit = mysqlTable("farol_audit", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId"),
  numeroCaso: varchar("numeroCaso", { length: 50 }),
  actionType: varchar("actionType", { length: 100 }).notNull(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userRole: varchar("userRole", { length: 50 }).notNull(),
  targetField: varchar("targetField", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FarolAudit = typeof farolAudit.$inferSelect;
export type InsertFarolAudit = typeof farolAudit.$inferInsert;

/**
 * FarolAdvisors - Assessores do Farol
 */


export const farolAdvisors = mysqlTable("farol_advisors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),  // Vinculo com users.id (opcional - para profissionais com login)
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).default(""),
  cargo: varchar("cargo", { length: 100 }).default(""),
  areaAtuacao: varchar("areaAtuacao", { length: 100 }).default(""),
  regional: varchar("regional", { length: 100 }).default(""),
  schools: text("schools"),
  role: mysqlEnum("role", ["admin", "coordinator", "advisor", "childhood_coordination", "viewer"]).default("advisor").notNull(),
  active: boolean("active").default(true).notNull(),
  createdBy: int("createdBy").default(0),
  createdByName: varchar("createdByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedBy: int("updatedBy"),
  updatedByName: varchar("updatedByName", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
  deletedBy: int("deletedBy"),
});

export type FarolAdvisor = typeof farolAdvisors.$inferSelect;
export type InsertFarolAdvisor = typeof farolAdvisors.$inferInsert;


/**
 * CaseEvolutions - Histórico de evolução dos casos (Progresso, Estável, Regressão, Encerrado)
 */
export const caseEvolutions = mysqlTable("case_evolutions", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  numeroCaso: varchar("numeroCaso", { length: 50 }).notNull(),
  date: date("date").notNull(),
  status: mysqlEnum("status", ["Progresso", "Estável", "Regressão", "Encerrado"]).notNull(),
  description: text("description").notNull(),
  createdBy: int("createdBy").notNull(),
  createdByName: varchar("createdByName", { length: 255 }).notNull(),
  createdByRole: varchar("createdByRole", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CaseEvolution = typeof caseEvolutions.$inferSelect;
export type InsertCaseEvolution = typeof caseEvolutions.$inferInsert;

/**
 * User-School many-to-many relationship table.
 * Source of truth for which schools a user is linked to.
 * The schoolId field in users is kept for backward compatibility only.
 */
export const userSchools = mysqlTable("user_schools", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  schoolId: int("schoolId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserSchool = typeof userSchools.$inferSelect;
export type InsertUserSchool = typeof userSchools.$inferInsert;
