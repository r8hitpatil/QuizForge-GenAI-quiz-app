import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";
import { MagicCard } from "@/components/ui/magic-card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShinyButton } from "@/components/ui/shiny-button";
import LandingNavbar from "@/components/ui/LandingNavbar";
import NavbarSpacer from "@/components/ui/NavbarSpacer";

const TakeQuiz = () => {
  const { findQuizByAccessCode, getQuizDetails } = useFirebase();
  const [accessCode, setAccessCode] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccessCode = async (e) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      setError("Please enter an access code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const foundQuiz = await findQuizByAccessCode(accessCode);
      setQuiz(foundQuiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Make sure to refetch quiz data if it seems stale
  const refreshQuizData = async () => {
    if (quiz?.id) {
      try {
        const freshQuiz = await getQuizDetails(quiz.id);
        console.log('Refreshed quiz data:', freshQuiz);
        // Update your quiz state with fresh data
        setQuiz(freshQuiz);
      } catch (error) {
        console.error('Error refreshing quiz data:', error);
      }
    }
  };

  // Call this when the component mounts or when needed
  useEffect(() => {
    refreshQuizData();
  }, [quiz?.id]);

  if (quiz) {
    return (
      <>
        <LandingNavbar />
        <NavbarSpacer />
        <QuizInterface quiz={quiz} />
      </>
    );
  }

  return (
    <>
      <LandingNavbar />
      <NavbarSpacer />
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 w-full max-w-[600px] mx-auto">
        <BlurFade delay={0.25} inView>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-belfast pb-5 text-center">
            Take A Quiz
          </h1>
        </BlurFade>
        
        <BlurFade delay={0.25 * 2} inView>
          <MagicCard
            gradientColor="#D9D9D955"
            className="p-4 sm:p-6 lg:p-8 rounded-2xl font-belfast w-full"
          >
            <BlurFade delay={0.25 * 2} inView>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl mb-4 sm:mb-6">
                Enter Quiz Access Code
              </h1>
            </BlurFade>
            
            <form onSubmit={handleAccessCode} className="space-y-4 sm:space-y-6">
              <div>
                <BlurFade delay={0.25 * 3} inView>
                  <input
                    type="text"
                    placeholder="ABC123"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full max-w-sm sm:max-w-md mx-auto block px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl text-center tracking-wider font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black font-extended"
                  />
                </BlurFade>
                
                <BlurFade delay={0.25 * 4} inView>
                  <p className="font-extended text-gray-400 text-sm sm:text-base mt-2 text-center">
                    Enter the 6-character code (letters and numbers)
                  </p>
                </BlurFade>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base max-w-sm sm:max-w-md mx-auto">
                  {error}
                </div>
              )}
              
              <BlurFade delay={0.25 * 5} inView>
                <RainbowButton
                  type="submit"
                  disabled={loading || accessCode.length !== 6}
                  size="lg"
                  className="w-full max-w-sm sm:max-w-md mx-auto flex items-center justify-center"
                >
                  <span className="text-sm sm:text-base lg:text-lg font-medium">
                    {loading ? "Searching..." : "Access Quiz"}
                  </span>
                </RainbowButton>
              </BlurFade>
            </form>
          </MagicCard>
        </BlurFade>
        
        <BlurFade delay={0.25 * 6} inView>
          <div className="mt-6 pt-6 border-t font-belfast w-full">
            <div className="text-center">
              <p className="text-sm sm:text-base lg:text-lg text-gray-800 mb-4">
                Don't have an access code? Ask your quiz creator for one.
              </p>
              
              <div className="relative bg-gray-100 rounded-lg p-4 sm:p-6 font-extended">
                <BorderBeam />
                <div>
                  <h3 className="font-medium text-gray-700 mb-2 text-sm sm:text-base lg:text-lg">
                    How it works:
                  </h3>
                  <ul className="text-xs sm:text-sm lg:text-base text-gray-800 space-y-1 text-left">
                    <li>• Enter the 6-character access code</li>
                    <li>• Provide your name to get started</li>
                    <li>• Complete the quiz at your own pace</li>
                    <li>• See your results immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </>
  );
};

// Quiz Interface Component - Updated padding
const QuizInterface = ({ quiz }) => {
  const { saveQuizAttempt, user } = useFirebase();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const handleAnswer = (selectedOption) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      if (!user) {
        setShowNameInput(true);
      } else {
        finishQuiz();
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishQuiz = async (anonymousName = "") => {
    let correct = 0;
    const answersWithCorrectness = answers.map((answer, index) => {
      const isCorrect = answer === quiz.questions[index].correctAnswer;
      if (isCorrect) correct++;
      return {
        questionIndex: index,
        selectedAnswer: answer,
        correctAnswer: quiz.questions[index].correctAnswer,
        isCorrect,
      };
    });

    const percentage = Math.round((correct / quiz.questions.length) * 100);

    // Create attempt data object that matches what saveQuizAttempt expects
    const attemptData = {
      quizId: quiz.id,
      participantName: anonymousName || (user ? user.displayName || user.email : 'Anonymous'),
      participantEmail: user ? user.email : null,
      userId: user ? user.uid : null,
      answers: answers, // Store the raw answers array
      answersWithCorrectness: answersWithCorrectness, // Store detailed answer analysis
      score: correct,
      percentage: percentage,
      totalQuestions: quiz.questions.length,
      completed: true,
      timeSpent: null // You can add time tracking if needed
    };

    try {
      await saveQuizAttempt(attemptData);
      console.log('Quiz attempt saved successfully:', attemptData);
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      // Continue to show results even if saving fails
    }

    setQuizComplete({
      correct,
      total: quiz.questions.length,
      percentage,
      answers: answersWithCorrectness,
    });
    setShowResult(true);
    setShowNameInput(false);
  };

  // Name input modal
  if (showNameInput) {
    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 font-belfast max-w-md mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 text-center w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 font-belfast">Almost Done! 🎉</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Enter your name to save your quiz results (optional):
          </p>

          <input
            type="text"
            placeholder="Your name (optional)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg mb-6 focus:outline-none focus:border-gray-500"
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <ShinyButton
              onClick={() => finishQuiz(userName.trim())}
              className="w-full sm:w-auto px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors border-black"
            >
              {userName.trim() ? "Submit with Name" : "Submit Anonymously"}
            </ShinyButton>

            <button
              onClick={() => setShowNameInput(false)}
              className="w-full sm:w-auto px-4 py-3 bg-gray-700 hover:bg-black text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
            >
              Back to Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results page
  if (showResult) {
    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 font-belfast max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6">
          Quiz Complete! 🎉
        </h1>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8 mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-4">
            Your Score: {quizComplete.correct}/{quizComplete.total} ({quizComplete.percentage}%)
          </h2>
          {!user && (
            <p className="text-sm sm:text-base text-gray-600">
              <strong>Tip:</strong> Sign up to track your quiz history and create your own quizzes!
            </p>
          )}
        </div>

        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-6 text-center">Review Your Answers:</h3>
        
        <div className="space-y-6 max-w-3xl mx-auto">
          {quiz.questions.map((question, index) => {
            const userAnswer = quizComplete.answers[index];
            return (
              <div
                key={index}
                className={`p-4 sm:p-6 border rounded-lg w-full ${
                  userAnswer.isCorrect ? "bg-green-50 border-green-100" : "bg-red-50 border-red-200"
                }`}
              >
                <h4 className="text-base sm:text-lg lg:text-xl font-semibold mb-4">
                  Question {index + 1}: {question.question}
                </h4>

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 sm:p-3 text-sm sm:text-base tighter-widest ${
                        optionIndex === question.correctAnswer ? "font-bold" : ""
                      }`}
                      style={{
                        color:
                          optionIndex === userAnswer.selectedAnswer
                            ? userAnswer.isCorrect ? "#16a34a" : "#dc2626"
                            : optionIndex === question.correctAnswer ? "#16a34a" : "#374151",
                      }}
                    >
                      {String.fromCharCode(65 + optionIndex)}: {option}
                      {optionIndex === userAnswer.selectedAnswer && " ← Your Answer"}
                      {optionIndex === question.correctAnswer && " ✓ Correct"}
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-gray-100 rounded text-sm sm:text-base font-extended">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 max-w-lg mx-auto">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-black text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
          >
            Take Another Quiz
          </button>

          {!user && (
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-black text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
            >
              Sign Up to Create Quizzes
            </button>
          )}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  // Quiz taking interface
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 font-belfast max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8 max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{quiz.title}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-2 tracking-widest">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
        {!user && (
          <p className="text-xs sm:text-sm text-gray-500 font-extended">
            Taking quiz as guest •{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>{" "}
            to track your progress
          </p>
        )}
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mt-4">
          <div
            className="bg-black h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mb-8 max-w-3xl mx-auto">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6">
          {question.question}
        </h3>

        <div className="space-y-3 sm:space-y-4">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`block p-4 sm:p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 w-full font-extended ${
                answers[currentQuestion] === index
                  ? "bg-gray-50 border-black"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={index}
                checked={answers[currentQuestion] === index}
                onChange={() => handleAnswer(index)}
                className="mr-3 sm:mr-4"
              />
              <span className="text-sm sm:text-base lg:text-lg">
                <strong>{String.fromCharCode(65 + index)}:</strong> {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 max-w-3xl mx-auto">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            currentQuestion === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-600 hover:bg-black text-white cursor-pointer"
          }`}
        >
          Previous
        </button>

        <button
          onClick={nextQuestion}
          disabled={answers[currentQuestion] === null}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            answers[currentQuestion] !== null
              ? "bg-gray-800 hover:bg-black text-white cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {currentQuestion === quiz.questions.length - 1 ? "Finish Quiz" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default TakeQuiz;
