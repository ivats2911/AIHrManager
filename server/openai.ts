import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY_NEW) {
  throw new Error("OPENAI_API_KEY_NEW is required but not found in environment variables");
}

// Log that we're initializing OpenAI client (but never log the actual key)
console.log("Initializing OpenAI client with new API key...");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_NEW });

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
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert HR analyst. Analyze the employee's performance evaluations and provide insights. Respond with JSON in this format:
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
}`
        },
        {
          role: "user",
          content: JSON.stringify({
            evaluations,
            employeeInfo,
          }),
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Performance analysis failed:", error);
    throw new Error(`Failed to analyze performance data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

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
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze the team composition for the project and suggest optimal teams. Respond with JSON in this format:
{
  "suggestedTeams": [
    {
      "members": [1, 2, 3],
      "compatibility": 85,
      "strengths": ["diverse skills", "complementary experience"],
      "challenges": ["different time zones"],
      "recommendations": "detailed recommendation"
    }
  ]
}`
        },
        {
          role: "user",
          content: JSON.stringify({
            employees,
            projectRequirements,
          }),
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Team analysis failed:", error);
    throw new Error(`Failed to analyze team compatibility: ${error instanceof Error ? error.message : "Unknown error"}`);
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
    console.log("Starting resume analysis with OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
    });

    console.log("Received response from OpenAI");
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
      console.error("Invalid response structure:", result);
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
    console.error("Resume analysis failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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
    console.log("Job Description:", jobDescription.substring(0, 100) + "...");
    console.log("Resume Text:", resumeText.substring(0, 100) + "...");

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert HR recruiter. Analyze the provided resume against the job description and provide a detailed analysis. Focus on:
1. Matching skills and experience
2. Educational background
3. Career progression
4. Technical expertise
5. Potential interview questions

Return a JSON response with exactly this format:
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
}`
        },
        {
          role: "user",
          content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}`,
        },
      ],
      temperature: 0.7,
    });

    console.log("Received response from OpenAI");
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    console.log("Attempting to parse OpenAI response...");
    const result = JSON.parse(content);
    console.log("Successfully parsed OpenAI response:", {
      score: result.score,
      matchScore: result.matchScore,
      feedbackLength: {
        strengths: result.feedback?.strengths?.length || 0,
        weaknesses: result.feedback?.weaknesses?.length || 0,
        skillsIdentified: result.feedback?.skillsIdentified?.length || 0
      },
      suggestedQuestionsCount: result.suggestedQuestions?.length || 0,
      experienceCount: result.experience?.length || 0,
      educationCount: result.education?.length || 0
    });

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
      console.error("Invalid response structure from OpenAI:", result);
      throw new Error("Invalid response structure from OpenAI");
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