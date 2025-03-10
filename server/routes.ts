import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeResumeEnhanced, analyzeTeamCompatibility, analyzePerformanceData } from "./openai";
import { insertEmployeeSchema, insertLeaveSchema, insertEvaluationSchema, insertResumeSchema, insertJobListingSchema } from "@shared/schema";
import { ZodError } from "zod";
import { generateAndStoreInsights } from "./notifications";

export async function registerRoutes(app: Express) {
  // Error handling middleware for validation errors
  app.use((err: Error, req: any, res: any, next: any) => {
    console.error("Request error:", err);

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
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employee = insertEmployeeSchema.parse(req.body);
      const created = await storage.createEmployee(employee);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Failed to create employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });


  // Performance Analysis Route
  app.get("/api/employees/:id/performance-insights", async (req, res) => {
    try {
      const employeeId = Number(req.params.id);
      const employee = await storage.getEmployee(employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const evaluations = await storage.getEvaluationsByEmployee(employeeId);

      if (!evaluations.length) {
        return res.status(404).json({ message: "No evaluations found for employee" });
      }

      const processedEvaluations = evaluations.map(evaluation => ({
        employeeId: evaluation.employeeId,
        performance: evaluation.performance,
        feedback: evaluation.feedback,
        goals: (evaluation.goals as any[]).map(g => String(g)), // Ensure goals are strings
        evaluationDate: evaluation.evaluationDate
      }));

      const insights = await analyzePerformanceData(processedEvaluations, {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.position,
        department: employee.department
      });

      res.json(insights);
    } catch (error) {
      console.error("Failed to analyze performance:", error);
      res.status(500).json({
        message: "Failed to analyze performance data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
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
    try {
      const resumes = await storage.getResumes();
      res.json(resumes);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  // Job Listings routes
  app.get("/api/job-listings", async (req, res) => {
    try {
      const jobListings = await storage.getJobListings();
      res.json(jobListings);
    } catch (error) {
      console.error("Failed to fetch job listings:", error);
      res.status(500).json({ message: "Failed to fetch job listings" });
    }
  });

  app.post("/api/job-listings", async (req, res) => {
    try {
      const jobListing = insertJobListingSchema.parse(req.body);
      const created = await storage.createJobListing(jobListing);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create job listing:", error);
      res.status(500).json({ message: "Failed to create job listing" });
    }
  });

  // Enhanced Resume Analysis Route
  app.post("/api/resumes/analyze", async (req, res) => {
    try {
      const { resumeText, jobListingId } = req.body;

      if (!resumeText || !jobListingId) {
        return res.status(400).json({ message: "Resume text and job listing ID are required" });
      }

      // Get job listing details
      const jobListing = await storage.getJobListing(jobListingId);
      if (!jobListing) {
        return res.status(404).json({ message: "Job listing not found" });
      }

      // Create job description from listing
      const jobDescription = `
        Position: ${jobListing.title}
        Department: ${jobListing.department}
        Description: ${jobListing.description}
        Requirements: ${jobListing.requirements.join(", ")}
        Preferred Skills: ${jobListing.preferredSkills?.join(", ") || ""}
      `;

      console.log("Starting OpenAI analysis for resume with job matching");
      const analysis = await analyzeResumeEnhanced(resumeText, jobDescription);
      console.log("OpenAI analysis completed");

      res.json({
        analysis,
        jobListing
      });
    } catch (error) {
      console.error("Resume analysis failed:", error);
      res.status(500).json({
        message: "Failed to analyze resume",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update the resume submission endpoint
  app.post("/api/resumes", async (req, res) => {
    try {
      console.log("Starting resume submission process", {
        body: { ...req.body, resumeText: req.body.resumeText?.substring(0, 100) + "..." }
      });

      // Validate the request body
      const resume = insertResumeSchema.parse(req.body);

      // Create the initial resume entry
      console.log("Creating resume entry...");
      const created = await storage.createResume(resume);
      console.log("Resume created:", created.id);

      try {
        // Get job listing if provided
        let jobDescription = "";
        if (resume.jobListingId) {
          const jobListing = await storage.getJobListing(resume.jobListingId);
          if (jobListing) {
            jobDescription = `
              Position: ${jobListing.title}
              Department: ${jobListing.department}
              Description: ${jobListing.description}
              Requirements: ${jobListing.requirements.join(", ")}
              Preferred Skills: ${jobListing.preferredSkills?.join(", ") || ""}
            `;
          }
        }

        // Use the position as fallback if no job listing found
        if (!jobDescription) {
          jobDescription = resume.position;
        }

        console.log("Starting OpenAI analysis for resume:", created.id);
        const analysis = await analyzeResumeEnhanced(resume.resumeText, jobDescription);
        console.log("OpenAI analysis completed for resume:", created.id);

        // Update resume with AI analysis results
        const updated = await storage.updateResumeAIAnalysis(
          created.id,
          analysis.score,
          {
            strengths: analysis.feedback.strengths,
            weaknesses: analysis.feedback.weaknesses,
            skillsIdentified: analysis.feedback.skillsIdentified,
            recommendation: analysis.feedback.recommendation
          },
          analysis.experience,
          analysis.education,
          analysis.feedback.skillsIdentified,
          analysis.suggestedQuestions
        );

        console.log("Resume updated with analysis:", updated.id);
        res.status(201).json(updated);
      } catch (analysisError) {
        console.error("OpenAI analysis failed for resume:", created.id, analysisError);

        // Return the created resume even if analysis fails
        res.status(201).json({
          ...created,
          aiScore: null,
          aiFeedback: {
            error: "Analysis is being processed, please check back later",
            retryable: true
          },
          status: "processing"
        });
      }
    } catch (error) {
      console.error("Resume creation failed:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: "Failed to process resume",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    const notifications = await storage.getNotifications();
    res.json(notifications);
  });

  app.get("/api/notifications/unread", async (req, res) => {
    const notifications = await storage.getUnreadNotifications();
    res.json(notifications);
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    const notification = await storage.markNotificationAsRead(Number(req.params.id));
    res.json(notification);
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    await storage.deleteNotification(Number(req.params.id));
    res.status(204).end();
  });

  app.post("/api/notifications/generate-insights", async (req, res) => {
    try {
      await generateAndStoreInsights();
      res.status(201).json({ message: "Insights generated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // Team Matching Route
  app.post("/api/teams/match", async (req, res) => {
    try {
      const { projectRequirements } = req.body;

      if (typeof projectRequirements !== "string") {
        return res.status(400).json({ message: "Project requirements must be a string" });
      }

      const employees = await storage.getEmployees();

      if (!employees.length) {
        return res.status(404).json({ message: "No employees found" });
      }

      const teamSuggestions = await analyzeTeamCompatibility(
        employees.map(emp => ({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.position,
          department: emp.department,
          skills: [] // Add skills from employee profile when available
        })),
        projectRequirements
      );

      res.json(teamSuggestions);
    } catch (error) {
      console.error("Team matching failed:", error);
      res.status(500).json({
        message: "Failed to analyze team compatibility",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}