import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeResume(resumeText: string, position: string): Promise<{
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    skills: string[];
    recommendation: string;
  };
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR recruiter. Analyze the provided resume for the specified position and provide detailed feedback. Include a score from 1-100, key strengths, weaknesses, relevant skills, and a hiring recommendation.",
        },
        {
          role: "user",
          content: `Position: ${position}\n\nResume:\n${resumeText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content) as {
      score: number;
      strengths: string[];
      weaknesses: string[];
      skills: string[];
      recommendation: string;
    };

    return {
      score: Math.min(100, Math.max(1, result.score)),
      feedback: {
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        skills: result.skills,
        recommendation: result.recommendation,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to analyze resume: " + errorMessage);
  }
}