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
  goals: jsonb("goals").$type<string[]>().notNull(), 
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  candidateName: text("candidate_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  position: text("position").notNull(),
  resumeText: text("resume_text").notNull(),
  parsedSkills: jsonb("parsed_skills").$type<string[]>(),
  education: jsonb("education").$type<{ degree: string; institution: string; year: number }[]>(),
  experience: jsonb("experience").$type<{ title: string; company: string; years: number }[]>(),
  aiScore: integer("ai_score"),
  aiFeedback: jsonb("ai_feedback"),
  suggestedQuestions: jsonb("suggested_questions").$type<string[]>(),
  status: text("status").notNull().default("pending"),
  jobListingId: integer("job_listing_id").references(() => jobListings.id),
  submittedAt: timestamp("submitted_at").notNull(),
});

export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements").$type<string[]>().notNull(),
  preferredSkills: jsonb("preferred_skills").$type<string[]>(),
  status: text("status").notNull().default("active"),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: text("priority").notNull().default("normal"),
  category: text("category").notNull(),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertLeaveSchema = createInsertSchema(leaves).omit({ id: true });
export const insertEvaluationSchema = createInsertSchema(evaluations).omit({ id: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ 
  id: true, 
  aiScore: true, 
  aiFeedback: true,
  parsedSkills: true,
  suggestedQuestions: true,
  status: true
}).extend({
  submittedAt: z.coerce.date()
});

export const insertJobListingSchema = createInsertSchema(jobListings).omit({ 
  id: true,
  postedAt: true,
  status: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type JobListing = typeof jobListings.$inferSelect;
export type InsertJobListing = z.infer<typeof insertJobListingSchema>;