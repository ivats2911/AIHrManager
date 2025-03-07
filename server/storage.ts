import {
  type Employee,
  type InsertEmployee,
  type Leave,
  type InsertLeave,
  type Evaluation,
  type InsertEvaluation,
  type Resume,
  type InsertResume,
  type Notification,
  type InsertNotification,
  type JobListing,
  type InsertJobListing,
  type User,
  employees,
  leaves,
  evaluations,
  resumes,
  notifications,
  jobListings,
  users,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee>;

  // Leave operations
  getLeaves(): Promise<Leave[]>;
  getLeavesByEmployee(employeeId: number): Promise<Leave[]>;
  createLeave(leave: InsertLeave): Promise<Leave>;
  updateLeaveStatus(id: number, status: string): Promise<Leave>;

  // Evaluation operations
  getEvaluations(): Promise<Evaluation[]>;
  getEvaluationsByEmployee(employeeId: number): Promise<Evaluation[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;

  // Resume operations
  getResumes(): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResumeAIAnalysis(
    id: number,
    score: number,
    feedback: unknown,
    experience: unknown,
    education: unknown,
    skills: string[],
    questions: string[]
  ): Promise<Resume>;

  // Job Listing operations
  getJobListings(): Promise<JobListing[]>;
  getJobListing(id: number): Promise<JobListing | undefined>;
  createJobListing(jobListing: InsertJobListing): Promise<JobListing>;
  updateJobListing(id: number, jobListing: Partial<JobListing>): Promise<JobListing>;

  // Notification operations
  getNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  deleteNotification(id: number): Promise<void>;

  // User operations
  getUserByEmail(email: string): Promise<User | undefined>;
}

export class PostgresStorage implements IStorage {
  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const results = await db.select().from(employees).where(eq(employees.id, id));
    return results[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [result] = await db.insert(employees).values(employee).returning();
    return result;
  }

  async updateEmployee(id: number, update: Partial<Employee>): Promise<Employee> {
    const [result] = await db
      .update(employees)
      .set(update)
      .where(eq(employees.id, id))
      .returning();
    return result;
  }

  // Leave operations
  async getLeaves(): Promise<Leave[]> {
    return await db.select().from(leaves);
  }

  async getLeavesByEmployee(employeeId: number): Promise<Leave[]> {
    return await db
      .select()
      .from(leaves)
      .where(eq(leaves.employeeId, employeeId));
  }

  async createLeave(leave: InsertLeave): Promise<Leave> {
    const [result] = await db.insert(leaves).values(leave).returning();
    return result;
  }

  async updateLeaveStatus(id: number, status: string): Promise<Leave> {
    const [result] = await db
      .update(leaves)
      .set({ status })
      .where(eq(leaves.id, id))
      .returning();
    return result;
  }

  // Evaluation operations
  async getEvaluations(): Promise<Evaluation[]> {
    return await db.select().from(evaluations);
  }

  async getEvaluationsByEmployee(employeeId: number): Promise<Evaluation[]> {
    return await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.employeeId, employeeId));
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const [result] = await db.insert(evaluations).values(evaluation).returning();
    return result;
  }

  // Resume operations
  async getResumes(): Promise<Resume[]> {
    return await db.select().from(resumes);
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const results = await db.select().from(resumes).where(eq(resumes.id, id));
    return results[0];
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [result] = await db.insert(resumes).values({
      ...resume,
      aiScore: null,
      aiFeedback: null,
      status: "pending",
    }).returning();
    return result;
  }

  async updateResumeAIAnalysis(
    id: number,
    score: number,
    feedback: unknown,
    experience: unknown,
    education: unknown,
    skills: string[],
    questions: string[]
  ): Promise<Resume> {
    const [result] = await db
      .update(resumes)
      .set({
        aiScore: score,
        aiFeedback: feedback,
        experience: experience,
        education: education,
        parsedSkills: skills,
        suggestedQuestions: questions,
        status: "processed",
      })
      .where(eq(resumes.id, id))
      .returning();
    return result;
  }

  // Job Listing operations
  async getJobListings(): Promise<JobListing[]> {
    return await db.select().from(jobListings);
  }

  async getJobListing(id: number): Promise<JobListing | undefined> {
    const results = await db.select().from(jobListings).where(eq(jobListings.id, id));
    return results[0];
  }

  async createJobListing(jobListing: InsertJobListing): Promise<JobListing> {
    const [result] = await db.insert(jobListings).values({
      ...jobListing,
      postedAt: new Date(),
      status: "active"
    }).returning();
    return result;
  }

  async updateJobListing(id: number, update: Partial<JobListing>): Promise<JobListing> {
    const [result] = await db
      .update(jobListings)
      .set(update)
      .where(eq(jobListings.id, id))
      .returning();
    return result;
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .orderBy(notifications.createdAt);
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.isRead, false))
      .orderBy(notifications.createdAt);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications).values({
      ...notification,
      isRead: false,
      createdAt: new Date(),
    }).returning();
    return result;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [result] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return result;
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // User operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results[0];
  }
}

// Export a single instance
export const storage = new PostgresStorage();