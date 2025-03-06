import OpenAI from "openai";
import { storage } from "./storage";
import type { Employee, Leave, Evaluation, Resume, InsertNotification } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface InsightGeneratorParams {
  employees?: Employee[];
  leaves?: Leave[];
  evaluations?: Evaluation[];
  resumes?: Resume[];
}

async function generateInsights({
  employees = [],
  leaves = [],
  evaluations = [],
  resumes = [],
}: InsightGeneratorParams): Promise<InsertNotification[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert HR analyst. Analyze the provided HR data and generate important insights and notifications. Focus on:
            - Employee performance trends
            - Leave patterns and potential issues
            - Recruitment pipeline health
            - Team composition and department balance
            Provide insights in JSON format with title, message, priority, and category.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            employeeCount: employees.length,
            departmentDistribution: employees.reduce((acc, emp) => {
              acc[emp.department] = (acc[emp.department] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            activeLeaves: leaves.filter(l => l.status === "pending").length,
            averagePerformance: evaluations.reduce((sum, evaluation) => sum + evaluation.performance, 0) / evaluations.length || 0,
            recruitmentPipeline: resumes.length,
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const insights = JSON.parse(content) as {
      insights: Array<{
        title: string;
        message: string;
        priority: "high" | "normal" | "low";
        category: "performance" | "leave" | "recruitment" | "general";
      }>;
    };

    return insights.insights.map(insight => ({
      type: "insight",
      ...insight,
      metadata: {},
    }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to generate insights: " + errorMessage);
  }
}

export async function generateAndStoreInsights(): Promise<void> {
  try {
    const [employees, leaves, evaluations, resumes] = await Promise.all([
      storage.getEmployees(),
      storage.getLeaves(),
      storage.getEvaluations(),
      storage.getResumes(),
    ]);

    const insights = await generateInsights({
      employees,
      leaves,
      evaluations,
      resumes,
    });

    await Promise.all(
      insights.map(insight => storage.createNotification(insight))
    );
  } catch (error) {
    console.error("Failed to generate and store insights:", error);
  }
}