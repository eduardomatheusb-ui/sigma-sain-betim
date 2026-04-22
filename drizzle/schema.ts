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
  role: mysqlEnum("role", ["admin", "school_user"]).default("school_user").notNull(),
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
  isShared: boolean("isshared").default(false),
  additionalStudents: text("additionalstudents"),
  // Campos de inatividade
  inactivityReason: varchar("inactivityreason", { length: 255 }),
  inactivityDate: date("inactivitydate"),
  returnDate: date("returndate"),
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
export const externalDemands = mysqlTable("externalDemands", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId"),
  schoolId: int("schoolId").notNull(),
  demandType: varchar("demandType", { length: 100 }),
  source: varchar("source", { length: 100 }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "resolved", "closed"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  assignedTo: int("assignedTo"),
  dueDate: date("dueDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExternalDemand = typeof externalDemands.$inferSelect;
export type InsertExternalDemand = typeof externalDemands.$inferInsert;

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
  // Metadados
  schoolId: int("schoolId"),
  createdBy: int("createdBy"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Demand = typeof demands.$inferSelect;
export type InsertDemand = typeof demands.$inferInsert;