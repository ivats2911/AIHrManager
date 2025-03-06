import { pgTable, text, serial, integer, date, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  joinDate: date("join_date").notNull(),
  status: text("status").notNull().default("active"),
  profileImage: text("profile_image"),
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  reason: text("reason").notNull(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  evaluationDate: date("evaluation_date").notNull(),
  performance: integer("performance").notNull(),
  feedback: text("feedback").notNull(),
  goals: jsonb("goals").notNull(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  candidateName: text("candidate_name").notNull(),
  position: text("position").notNull(),
  resumeText: text("resume_text").notNull(),
  aiScore: integer("ai_score"),
  aiFeedback: jsonb("ai_feedback"),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertLeaveSchema = createInsertSchema(leaves).omit({ id: true });
export const insertEvaluationSchema = createInsertSchema(evaluations).omit({ id: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, aiScore: true, aiFeedback: true });

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
