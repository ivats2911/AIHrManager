import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function analyzeTeamCompatibility(
  employees: Array<{
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    skills: string[];
  }>,
  projectRequirements: string
): Promise<{
  suggestedTeams: Array<{
    members: number[];
    compatibility: number;
    strengths: string[];
    challenges: string[];
    recommendations: string;
  }>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert team formation analyst. Analyze the provided employees and project requirements to suggest optimal team compositions. Provide a JSON response with exactly this format:
{
  "suggestedTeams": [
    {
      "members": [<array of employee IDs>],
      "compatibility": <number between 0-100>,
      "strengths": ["strength1", "strength2", ...],
      "challenges": ["challenge1", "challenge2", ...],
      "recommendations": "team optimization recommendation"
    }
  ]
}
Do not include any other text before or after the JSON.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            employees,
            projectRequirements,
          }),
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);

    // Validate the response structure
    if (
      !Array.isArray(result.suggestedTeams) ||
      !result.suggestedTeams.every(
        (team: any) =>
          Array.isArray(team.members) &&
          typeof team.compatibility === "number" &&
          Array.isArray(team.strengths) &&
          Array.isArray(team.challenges) &&
          typeof team.recommendations === "string"
      )
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Team analysis failed:", errorMessage);
    throw new Error("Failed to analyze team compatibility: " + errorMessage);
  }
}

export async function analyzePerformanceData(
  evaluations: Array<{
    employeeId: number;
    performance: number;
    feedback: string;
    goals: string[];
    evaluationDate: string;
  }>,
  employeeInfo: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
  }
): Promise<{
  trends: {
    overall: string;
    strengths: string[];
    areasForImprovement: string[];
  };
  recommendations: {
    personal: string[];
    manager: string[];
    training: string[];
  };
  predictiveInsights: {
    potentialPath: string;
    riskFactors: string[];
    opportunities: string[];
  };
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert HR analyst. Analyze the employee's performance evaluations and provide insights. Return a JSON response with exactly this format:
{
  "trends": {
    "overall": "summary of performance trend",
    "strengths": ["key strength 1", "key strength 2"],
    "areasForImprovement": ["area 1", "area 2"]
  },
  "recommendations": {
    "personal": ["recommendation 1", "recommendation 2"],
    "manager": ["suggestion 1", "suggestion 2"],
    "training": ["training 1", "training 2"]
  },
  "predictiveInsights": {
    "potentialPath": "career progression prediction",
    "riskFactors": ["risk 1", "risk 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  }
}
Do not include any other text before or after the JSON.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            evaluations,
            employeeInfo,
          }),
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);

    // Validate the response structure
    if (
      !result.trends ||
      !result.recommendations ||
      !result.predictiveInsights ||
      !Array.isArray(result.trends.strengths) ||
      !Array.isArray(result.recommendations.personal) ||
      !Array.isArray(result.predictiveInsights.opportunities)
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Performance analysis failed:", errorMessage);
    throw new Error("Failed to analyze performance data: " + errorMessage);
  }
}

export async function analyzeResume(resumeText: string, position: string): Promise<{
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  };
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert HR recruiter. Analyze the provided resume for the specified position and provide a JSON response with exactly this format:
{
  "score": <number between 1-100>,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendation": "your hiring recommendation"
}
Do not include any other text before or after the JSON.`
        },
        {
          role: "user",
          content: `Position: ${position}\n\nResume:\n${resumeText}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);

    // Validate the response structure
    if (
      typeof result.score !== 'number' || 
      !Array.isArray(result.strengths) || 
      !Array.isArray(result.weaknesses) || 
      typeof result.recommendation !== 'string'
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return {
      score: Math.min(100, Math.max(1, result.score)),
      feedback: {
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendation: result.recommendation,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Resume analysis failed:", errorMessage);
    throw new Error("Failed to analyze resume: " + errorMessage);
  }
}

export async function analyzeResumeEnhanced(
  resumeText: string, 
  jobDescription: string
): Promise<{
  score: number;
  matchScore: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    skillsIdentified: string[];
    recommendation: string;
  };
  suggestedQuestions: string[];
  experience: Array<{ title: string; company: string; years: number }>;
  education: Array<{ degree: string; institution: string; year: number }>;
}> {
  try {
    console.log("Starting resume analysis with OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert HR recruiter. Analyze the provided resume against the job description and provide a detailed analysis. Focus on:
1. Matching skills and experience
2. Educational background
3. Career progression
4. Technical expertise
5. Potential interview questions

Provide a JSON response with exactly this format:
{
  "score": <overall score 1-100>,
  "matchScore": <job match score 1-100>,
  "feedback": {
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "skillsIdentified": ["skill1", "skill2", ...],
    "recommendation": "detailed hiring recommendation"
  },
  "suggestedQuestions": ["question1", "question2", ...],
  "experience": [{"title": "job title", "company": "company name", "years": number}, ...],
  "education": [{"degree": "degree name", "institution": "school name", "year": number}, ...]
}
Do not include any other text before or after the JSON.`
        },
        {
          role: "user",
          content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    console.log("Received OpenAI response, parsing result...");
    const result = JSON.parse(content);

    // Validate the response structure
    if (
      typeof result.score !== 'number' || 
      typeof result.matchScore !== 'number' ||
      !Array.isArray(result.feedback?.strengths) ||
      !Array.isArray(result.feedback?.weaknesses) ||
      !Array.isArray(result.feedback?.skillsIdentified) ||
      !Array.isArray(result.suggestedQuestions) ||
      !Array.isArray(result.experience) ||
      !Array.isArray(result.education)
    ) {
      console.error("Invalid response structure:", result);
      throw new Error("Invalid response structure from AI");
    }

    // Ensure scores are within bounds
    result.score = Math.min(100, Math.max(1, result.score));
    result.matchScore = Math.min(100, Math.max(1, result.matchScore));

    console.log("Successfully analyzed resume");
    return result;
  } catch (error: unknown) {
    console.error("Resume analysis failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to analyze resume: " + errorMessage);
  }
}