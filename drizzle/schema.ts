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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Mediators table - Profissionais que realizam atendimentos
 */
export const mediators = mysqlTable("mediators", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 20 }),
  professionalLicense: varchar("professionalLicense", { length: 100 }),
  specialization: varchar("specialization", { length: 255 }),
  schoolId: int("schoolId").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "on_leave"]).default("active").notNull(),
  maxAttendances: int("maxAttendances").default(0),
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
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = typeof attendances.$inferInsert;

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