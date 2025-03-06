import {
  type Employee,
  type InsertEmployee,
  type Leave,
  type InsertLeave,
  type Evaluation,
  type InsertEvaluation,
  type Resume,
  type InsertResume,
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
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee> = new Map();
  private leaves: Map<number, Leave> = new Map();
  private evaluations: Map<number, Evaluation> = new Map();
  private resumes: Map<number, Resume> = new Map();
  private currentIds = {
    employees: 1,
    leaves: 1,
    evaluations: 1,
    resumes: 1,
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
}

export const storage = new MemStorage();