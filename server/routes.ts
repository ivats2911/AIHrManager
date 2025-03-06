import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeResume } from "./openai";
import { insertEmployeeSchema, insertLeaveSchema, insertEvaluationSchema, insertResumeSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express) {
  // Error handling middleware
  app.use((err: Error, req: any, res: any, next: any) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    next(err);
  });

  // Employee routes
  app.get("/api/employees", async (req, res) => {
    const employees = await storage.getEmployees();
    res.json(employees);
  });

  app.post("/api/employees", async (req, res) => {
    const employee = insertEmployeeSchema.parse(req.body);
    const created = await storage.createEmployee(employee);
    res.status(201).json(created);
  });

  app.get("/api/employees/:id", async (req, res) => {
    const employee = await storage.getEmployee(Number(req.params.id));
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  });

  // Leave routes
  app.get("/api/leaves", async (req, res) => {
    const leaves = await storage.getLeaves();
    res.json(leaves);
  });

  app.post("/api/leaves", async (req, res) => {
    const leave = insertLeaveSchema.parse(req.body);
    const created = await storage.createLeave(leave);
    res.status(201).json(created);
  });

  app.patch("/api/leaves/:id/status", async (req, res) => {
    const { status } = req.body;
    const updated = await storage.updateLeaveStatus(Number(req.params.id), status);
    res.json(updated);
  });

  // Evaluation routes
  app.get("/api/evaluations", async (req, res) => {
    const evaluations = await storage.getEvaluations();
    res.json(evaluations);
  });

  app.get("/api/employees/:id/evaluations", async (req, res) => {
    const evaluations = await storage.getEvaluationsByEmployee(Number(req.params.id));
    res.json(evaluations);
  });

  app.post("/api/evaluations", async (req, res) => {
    const evaluation = insertEvaluationSchema.parse(req.body);
    const created = await storage.createEvaluation(evaluation);
    res.status(201).json(created);
  });

  // Resume routes
  app.get("/api/resumes", async (req, res) => {
    const resumes = await storage.getResumes();
    res.json(resumes);
  });

  app.post("/api/resumes", async (req, res) => {
    const resume = insertResumeSchema.parse(req.body);
    const created = await storage.createResume(resume);
    
    try {
      const analysis = await analyzeResume(resume.resumeText, resume.position);
      const updated = await storage.updateResumeAIAnalysis(
        created.id,
        analysis.score,
        analysis.feedback
      );
      res.status(201).json(updated);
    } catch (error) {
      // Still return the created resume even if AI analysis fails
      res.status(201).json(created);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
