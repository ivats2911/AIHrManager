import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
          content:
            "You are an expert HR recruiter. Analyze the provided resume for the specified position and provide detailed feedback in JSON format with the following structure:\n{\n  'score': number (1-100),\n  'strengths': string[],\n  'weaknesses': string[],\n  'recommendation': string\n}",
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
      console.error("No content received from OpenAI");
      throw new Error("No content received from OpenAI");
    }

    console.log("Raw OpenAI response:", content);

    try {
      const result = JSON.parse(content);

      // Validate the response structure
      if (!result.score || !Array.isArray(result.strengths) || !Array.isArray(result.weaknesses) || !result.recommendation) {
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
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Failed to parse AI response");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Resume analysis failed:", errorMessage);
    throw new Error("Failed to analyze resume: " + errorMessage);
  }
}