import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Simple cache to avoid repeated API calls for same prompts
const promptCache = new Map();

// Rate limiting - track last API call time
let lastApiCall = 0;
const MIN_DELAY_BETWEEN_CALLS = 2000; // 2 seconds between calls

export const main = async (numberOfQuestions, prompt) => {
  // Check cache first
  const cacheKey = `${prompt}_${numberOfQuestions}`;
  if (promptCache.has(cacheKey)) {
    console.log("Returning cached questions for prompt:", prompt);
    return promptCache.get(cacheKey);
  }

  // Rate limiting - ensure minimum delay between API calls
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < MIN_DELAY_BETWEEN_CALLS) {
    const waitTime = MIN_DELAY_BETWEEN_CALLS - timeSinceLastCall;
    console.log(`Rate limiting: waiting ${waitTime}ms before API call`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

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
            ]

            Guidelines:
            - Make questions challenging but fair
            - Ensure options are plausible but only one is correct
            - Cover different aspects of the topic
            - Use clear, professional language
            - Avoid trick questions
            - Make explanations educational and concise

            Return ONLY the JSON array, no additional text.`;

  try {
    console.log("Making API call to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: advPrompt,
    });

    let text = response.candidates[0].content.parts[0].text;
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsedQuestions = JSON.parse(text);

    // Validate the structure
    if (!Array.isArray(parsedQuestions)) {
      throw new Error("Response is not an array");
    }

    // Validate each question
    parsedQuestions.forEach((q, index) => {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
    });

    console.log("Successfully generated questions");
    lastApiCall = Date.now(); // Update last API call time

    const result = parsedQuestions.slice(0, numberOfQuestions);

    // Cache the result for 1 hour
    promptCache.set(cacheKey, result);
    setTimeout(() => promptCache.delete(cacheKey), 60 * 60 * 1000);

    return result;
  } catch (error) {
    console.error("Error parsing JSON :", error);

    // Return fallback questions if parsing fails
    console.error("Returning fallback questions due to error");
    const fallbackQuestions = [
      {
        question: `What is the main topic of "${prompt}"?`,
        options: [
          "A comprehensive subject area",
          "A simple concept",
          "An advanced topic",
          "A basic principle",
        ],
        correctAnswer: 0,
        explanation: "This is a fallback question generated due to AI service error.",
      },
    ];

    return fallbackQuestions.slice(0, numberOfQuestions);
  }
};

// Additional utility functions
export const generateAccessCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const calculateScore = (answers, questions) => {
  let correct = 0;
  const totalQuestions = questions.length;

  answers.forEach((answer, index) => {
    // Handle null/undefined answers (unattempted questions)
    if (answer.selectedAnswer === null || answer.selectedAnswer === undefined) {
      answer.isCorrect = false;
    } else if (
      questions[index] &&
      answer.selectedAnswer === questions[index].correctAnswer
    ) {
      correct++;
      answer.isCorrect = true;
    } else {
      answer.isCorrect = false;
    }
  });

  const percentage =
    totalQuestions > 0
      ? Math.round((correct / totalQuestions) * 100)
      : 0;

  return {
    score: correct,
    totalQuestions,
    percentage,
    answersWithCorrectness: answers,
  };
};
