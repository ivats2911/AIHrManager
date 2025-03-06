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
} from "@shared/schema";

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
  updateResumeAIAnalysis(id: number, score: number, feedback: any): Promise<Resume>;

  // Notification operations
  getNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  deleteNotification(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee> = new Map();
  private leaves: Map<number, Leave> = new Map();
  private evaluations: Map<number, Evaluation> = new Map();
  private resumes: Map<number, Resume> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private currentIds = {
    employees: 1,
    leaves: 1,
    evaluations: 1,
    resumes: 1,
    notifications: 1,
  };

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentIds.employees++;
    const newEmployee: Employee = {
      ...employee,
      id,
      status: employee.status || "active",
      profileImage: employee.profileImage || null,
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, update: Partial<Employee>): Promise<Employee> {
    const employee = await this.getEmployee(id);
    if (!employee) throw new Error("Employee not found");
    const updated = { ...employee, ...update };
    this.employees.set(id, updated);
    return updated;
  }

  // Leave operations
  async getLeaves(): Promise<Leave[]> {
    return Array.from(this.leaves.values());
  }

  async getLeavesByEmployee(employeeId: number): Promise<Leave[]> {
    return Array.from(this.leaves.values()).filter(
      (leave) => leave.employeeId === employeeId
    );
  }

  async createLeave(leave: InsertLeave): Promise<Leave> {
    const id = this.currentIds.leaves++;
    const newLeave: Leave = {
      ...leave,
      id,
      status: leave.status || "pending",
    };
    this.leaves.set(id, newLeave);
    return newLeave;
  }

  async updateLeaveStatus(id: number, status: string): Promise<Leave> {
    const leave = this.leaves.get(id);
    if (!leave) throw new Error("Leave request not found");
    const updated = { ...leave, status };
    this.leaves.set(id, updated);
    return updated;
  }

  // Evaluation operations
  async getEvaluations(): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values());
  }

  async getEvaluationsByEmployee(employeeId: number): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values()).filter(
      (evaluation) => evaluation.employeeId === employeeId
    );
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const id = this.currentIds.evaluations++;
    const newEvaluation = { ...evaluation, id };
    this.evaluations.set(id, newEvaluation);
    return newEvaluation;
  }

  // Resume operations
  async getResumes(): Promise<Resume[]> {
    return Array.from(this.resumes.values());
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const id = this.currentIds.resumes++;
    const newResume: Resume = {
      ...resume,
      id,
      aiScore: null,
      aiFeedback: null,
      status: "pending",
      submittedAt: new Date(),
    };
    this.resumes.set(id, newResume);
    return newResume;
  }

  async updateResumeAIAnalysis(
    id: number,
    score: number,
    feedback: unknown
  ): Promise<Resume> {
    const resume = await this.getResume(id);
    if (!resume) throw new Error("Resume not found");
    const updated = { ...resume, aiScore: score, aiFeedback: feedback };
    this.resumes.set(id, updated);
    return updated;
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => !notification.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentIds.notifications++;
    const newNotification: Notification = {
      ...notification,
      id,
      isRead: false,
      createdAt: new Date(),
      metadata: notification.metadata || {},
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    const updated = { ...notification, isRead: true };
    this.notifications.set(id, updated);
    return updated;
  }

  async deleteNotification(id: number): Promise<void> {
    if (!this.notifications.has(id)) {
      throw new Error("Notification not found");
    }
    this.notifications.delete(id);
  }
}

export const storage = new MemStorage();