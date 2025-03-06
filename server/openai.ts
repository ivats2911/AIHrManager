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
      console.error("No content received from OpenAI");
      throw new Error("No content received from OpenAI");
    }

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