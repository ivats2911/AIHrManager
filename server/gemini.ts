import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required but not found in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeResumeWithGemini(resumeText: string, jobDescription: string) {
  try {
    console.log("Starting Gemini resume analysis...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this resume for the specified job position and provide a detailed evaluation.

Job Description:
${jobDescription}

Resume:
${resumeText}

Provide a JSON response with exactly this format:
{
  "score": <number between 1-100>,
  "matchScore": <number between 1-100>,
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
Only respond with the JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("Received Gemini response");

    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Invalid response format from Gemini");
    }

    // Validate the response structure
    if (
      typeof parsedResult.score !== 'number' || 
      typeof parsedResult.matchScore !== 'number' ||
      !Array.isArray(parsedResult.feedback?.strengths) ||
      !Array.isArray(parsedResult.feedback?.weaknesses) ||
      !Array.isArray(parsedResult.feedback?.skillsIdentified) ||
      !Array.isArray(parsedResult.suggestedQuestions) ||
      !Array.isArray(parsedResult.experience) ||
      !Array.isArray(parsedResult.education)
    ) {
      console.error("Invalid response structure:", parsedResult);
      throw new Error("Invalid response structure from Gemini");
    }

    // Ensure scores are within bounds
    parsedResult.score = Math.min(100, Math.max(1, parsedResult.score));
    parsedResult.matchScore = Math.min(100, Math.max(1, parsedResult.matchScore));

    console.log("Successfully analyzed resume with Gemini");
    return parsedResult;
  } catch (error: any) {
    console.error("Resume analysis failed:", error);
    throw new Error(`Failed to analyze resume with Gemini: ${error.message}`);
  }
}