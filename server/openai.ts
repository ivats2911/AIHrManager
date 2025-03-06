import OpenAI from "openai";

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

    const content = response.choices[0].message.content;
    if (!content) {
      console.error("No content received from OpenAI");
      throw new Error("No content received from OpenAI");
    }

    console.log("Raw OpenAI response:", content);

    try {
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