import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const main = async (numberOfQuestions, prompt) => {
  const advPrompt = `Create exactly ${numberOfQuestions} multiple choice quiz questions based on the following topic: "${prompt}"

            For each question, provide:
            1. A clear, well-structured question
            2. Exactly 4 multiple choice options (A, B, C, D)
            3. The correct answer (indicate which option: 0 for A, 1 for B, 2 for C, 3 for D)
            4. A brief explanation of why the answer is correct

            Format your response as a valid JSON array with this exact structure:
            [
                {
                    "question": "Question text here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0,
                    "explanation": "Brief explanation of why this answer is correct"
                }
            ]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: advPrompt,
    });
    let text = response.candidates[0].content.parts[0].text;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedQuestions = JSON.parse(text);
    return parsedQuestions;
  } catch (error) {
    console.error("Error parsing JSON :", error);
    throw new Error("Failed AI response");
  }
};
