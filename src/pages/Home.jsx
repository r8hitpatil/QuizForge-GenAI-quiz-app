import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../context/Firebase";
import { useQuery } from "@tanstack/react-query";
import AuthNavbar from "../components/ui/AuthNavbar";
import NavbarSpacer from "../components/ui/NavbarSpacer";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  BookOpenIcon,
  PencilIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const { user, signOutUser, getUserQuizzes, getQuizAttempts } = useFirebase(); // Add getQuizAttempts
  const navigate = useNavigate();

  const fetchUserQuizzes = async () => {
    try {
      const quizzes = await getUserQuizzes();
      console.log("Fetched quizzes:", quizzes);
      return quizzes || [];
    } catch (error) {
      console.error("Error in fetchUserQuizzes:", error);
      throw error;
    }
  };

  // Fetch quiz attempts for all quizzes
  const fetchAllQuizAttempts = async () => {
    try {
      const quizzes = await getUserQuizzes();
      if (!quizzes || quizzes.length === 0) return [];

      const allAttempts = [];

      // Fetch attempts for each quiz
      for (const quiz of quizzes) {
        try {
          const attempts = await getQuizAttempts(quiz.id);
          if (attempts && attempts.length > 0) {
            // Add quiz info to each attempt for easier processing
            const attemptsWithQuizInfo = attempts.map((attempt) => ({
              ...attempt,
              quizId: quiz.id,
              quizTitle: quiz.title,
            }));
            allAttempts.push(...attemptsWithQuizInfo);
          }
        } catch (error) {
          console.error(`Error fetching attempts for quiz ${quiz.id}:`, error);
        }
      }

      console.log("All attempts fetched:", allAttempts);
      return allAttempts;
    } catch (error) {
      console.error("Error in fetchAllQuizAttempts:", error);
      return [];
    }
  };

  const {
    isLoading,
    error,
    data: quizzes = [],
    refetch,
  } = useQuery({
    queryKey: ["userQuizzes", user?.uid],
    queryFn: fetchUserQuizzes,
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
  });

  // Separate query for attempts
  const { isLoading: attemptsLoading, data: allAttempts = [] } = useQuery({
    queryKey: ["allQuizAttempts", user?.uid],
    queryFn: fetchAllQuizAttempts,
    enabled: !!user && quizzes.length > 0,
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  const copyAccessCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Access code ${code} copied to clipboard!`);
  };

  const shareQuiz = (quiz) => {
    const shareText = `🎯 Take my "${quiz.title}" quiz!\n\n🔑 Access Code: ${quiz.accessCode}\n📊 ${quiz.totalQuestions} questions\n⚡ Difficulty: ${quiz.difficulty}\n\nJoin now and test your knowledge!`;

    if (navigator.share) {
      navigator.share({
        title: `Take my "${quiz.title}" quiz!`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Quiz details copied to clipboard! Share it with your friends.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";

    try {
      if (timestamp.toDate && typeof timestamp.toDate === "function") {
        return timestamp.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      return "Unknown";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown";
    }
  };

  // Calculate stats from the actual attempts data
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const safeAttempts = Array.isArray(allAttempts) ? allAttempts : [];

  // Total attempts count
  const totalAttempts = safeAttempts.length;

  // Recent attempts (last 30 days)
  const recentAttempts = safeAttempts.filter((attempt) => {
    if (!attempt.completedAt) return false;

    try {
      const attemptDate = attempt.completedAt.toDate
        ? attempt.completedAt.toDate()
        : new Date(attempt.completedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return attemptDate > thirtyDaysAgo;
    } catch (error) {
      console.error("Error parsing attempt date:", error);
      return false;
    }
  }).length;

  // Calculate average score from all attempts
  const averageScore =
    safeAttempts.length > 0
      ? safeAttempts.reduce((total, attempt) => {
          const score = attempt.percentage || attempt.score || 0;
          return total + score;
        }, 0) / safeAttempts.length
      : 0;

  // Calculate attempt counts per quiz and find most popular
  const quizAttemptCounts = safeQuizzes.map((quiz) => {
    const quizAttempts = safeAttempts.filter(
      (attempt) => attempt.quizId === quiz.id
    );
    return {
      ...quiz,
      attemptCount: quizAttempts.length,
      attempts: quizAttempts,
    };
  });

  const mostPopularQuiz = quizAttemptCounts.reduce(
    (popular, quiz) =>
      (quiz.attemptCount || 0) > (popular.attemptCount || 0) ? quiz : popular,
    quizAttemptCounts[0] || null
  );

  // Loading state - include attempts loading
  if (isLoading || attemptsLoading || !user) {
    return (
      <>
        <AuthNavbar />
        <NavbarSpacer />
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center">
          <BlurFade delay={0.25} inView>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900 font-belfast">
                Loading Dashboard...
              </h1>
              <p className="text-sm text-gray-600 font-extended mt-2">
                {isLoading && "Fetching quizzes..."}
                {attemptsLoading && "Loading attempt data..."}
              </p>
            </div>
          </BlurFade>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AuthNavbar />
        <NavbarSpacer />
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
          <BlurFade delay={0.25} inView>
            <MagicCard
              gradientColor="#EF444455"
              className="p-6 rounded-2xl max-w-md"
            >
              <div className="text-center">
                <h2 className="text-lg font-semibold text-red-800 mb-2 font-belfast">
                  Error Loading Dashboard
                </h2>
                <p className="text-red-600 mb-4 font-extended">
                  Unable to load your dashboard data
                </p>
                <RainbowButton
                  onClick={() => refetch()}
                  size="lg"
                  className="px-6 py-3"
                >
                  <span className="font-medium">Try Again</span>
                </RainbowButton>
              </div>
            </MagicCard>
          </BlurFade>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthNavbar />
      <NavbarSpacer />
      <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] px-3 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-3 w-full max-w-7xl mx-auto">
        {/* Header */}
        <BlurFade delay={0.25} inView>
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-belfast pb-2 text-gray-900">
              Welcome back, {user.displayName?.split(" ")[0] || "user"}!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg font-extended">
              Manage your quizzes and track performance here.
            </p>
          </div>
        </BlurFade>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <BlurFade delay={0.35} inView>
            <MagicCard
              gradientColor="#3B82F655"
              className="p-4 sm:p-6 rounded-xl text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-belfast">
                {safeQuizzes.length}
              </h3>
              <p className="text-gray-600 font-extended text-sm">
                Total Quizzes
              </p>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.45} inView>
            <MagicCard
              gradientColor="#10B98155"
              className="p-4 sm:p-6 rounded-xl text-center"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <UserGroupIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-belfast">
                {totalAttempts}
              </h3>
              <p className="text-gray-600 font-extended text-sm">
                Total Attempts
              </p>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.55} inView>
            <MagicCard
              gradientColor="#F59E0B55"
              className="p-4 sm:p-6 rounded-xl text-center"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-belfast">
                {recentAttempts}
              </h3>
              <p className="text-gray-600 font-extended text-sm">
                Recent (30d)
              </p>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.65} inView>
            <MagicCard
              gradientColor="#8B5CF655"
              className="p-4 sm:p-6 rounded-xl text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrophyIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-belfast">
                {averageScore.toFixed(1)}%
              </h3>
              <p className="text-gray-600 font-extended text-sm">
                Average Score
              </p>
            </MagicCard>
          </BlurFade>
        </div>

        {/* Most Popular Quiz */}
        {mostPopularQuiz && mostPopularQuiz.attemptCount > 0 && (
          <BlurFade delay={0.75} inView>
            <MagicCard
              gradientColor="#6366F155"
              className="p-4 sm:p-6 rounded-xl mb-6 sm:mb-8"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrophyIcon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-belfast">
                    Most Popular Quiz
                  </h3>
                  <p className="text-indigo-600 font-medium font-extended truncate text-sm sm:text-base">
                    {mostPopularQuiz.title}
                  </p>
                  <p className="text-sm text-gray-600 font-extended">
                    {mostPopularQuiz.attemptCount} attempts •{" "}
                    {mostPopularQuiz.attempts.length > 0
                      ? `${(
                          mostPopularQuiz.attempts.reduce(
                            (sum, attempt) =>
                              sum + (attempt.percentage || attempt.score || 0),
                            0
                          ) / mostPopularQuiz.attempts.length
                        ).toFixed(1)}% avg score`
                      : "No scores yet"}
                  </p>
                </div>
              </div>
            </MagicCard>
          </BlurFade>
        )}

        {/* Recent Quizzes - Fixed layout */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <BlurFade delay={0.5} inView>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 font-belfast">
                  Recent Quizzes
                </h2>
                <Link to="/myquizzes">
                  <ShinyButton className="px-4 py-2 text-sm">
                    <span className="font-belfast">View All</span>
                  </ShinyButton>
                </Link>
              </div>
            </BlurFade>

            {safeQuizzes.length === 0 ? (
              <BlurFade delay={0.6} inView>
                <MagicCard
                  gradientColor="#D9D9D955"
                  className="p-8 sm:p-12 rounded-2xl text-center"
                >
                  <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2 font-belfast">
                    No quizzes yet
                  </h3>
                  <p className="text-gray-600 mb-6 font-extended">
                    Create your first quiz to get started!
                  </p>
                  <Link to="/createquiz">
                    <RainbowButton size="lg" className="px-6 py-3">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium">Create Your First Quiz</span>
                    </RainbowButton>
                  </Link>
                </MagicCard>
              </BlurFade>
            ) : (
              <div className="space-y-4">
                {quizAttemptCounts.slice(0, 5).map((quiz, index) => (
                  <BlurFade
                    key={quiz.id || index}
                    delay={0.05 * (index + 1) + 0.6}
                    inView
                  >
                    <MagicCard
                      gradientColor="#F8FAFC55"
                      className="p-4 sm:p-6 rounded-xl hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-3">
                            <h3 className="font-semibold text-gray-900 truncate flex-1 font-belfast text-sm sm:text-base">
                              {quiz.title}
                            </h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-green-100 text-green-800 font-extended">
                              Active
                            </span>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm text-gray-500 font-extended">
                            <div>
                              <span className="text-gray-700 font-medium block">Code:</span>
                              <div className="font-mono text-blue-600 font-medium">
                                {quiz.accessCode}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-700 font-medium block">Questions:</span>
                              <div>
                                {quiz.totalQuestions ||
                                  (quiz.questions && quiz.questions.length) ||
                                  0}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-700 font-medium block">Attempts:</span>
                              <div className="text-blue-600 font-medium">
                                {quiz.attemptCount || 0}
                              </div>
                            </div>
                            <div className="hidden lg:block">
                              <span className="text-gray-700 font-medium block">Avg Score:</span>
                              <div className="text-green-600 font-medium">
                                {quiz.attempts && quiz.attempts.length > 0
                                  ? `${(
                                      quiz.attempts.reduce(
                                        (sum, attempt) =>
                                          sum + (attempt.percentage || attempt.score || 0),
                                        0
                                      ) / quiz.attempts.length
                                    ).toFixed(1)}%`
                                  : "No data"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0">
                          <ShimmerButton
                            onClick={() => copyAccessCode(quiz.accessCode)}
                            className="px-3 py-2 text-xs font-extended"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                            Copy
                          </ShimmerButton>
                          <ShinyButton
                            onClick={() => shareQuiz(quiz)}
                            className="px-3 py-2 text-xs"
                          >
                            <ShareIcon className="h-4 w-4 mr-1" />
                          </ShinyButton>
                        </div>
                      </div>
                    </MagicCard>
                  </BlurFade>
                ))}

                {/* Show "View All" button at bottom if there are more than 5 quizzes */}
                {safeQuizzes.length > 5 && (
                  <BlurFade delay={0.9} inView>
                    <div className="text-center pt-4">
                      <Link to="/myquizzes">
                        <ShinyButton className="px-6 py-3">
                          <span className="font-belfast">View All {safeQuizzes.length} Quizzes</span>
                        </ShinyButton>
                      </Link>
                    </div>
                  </BlurFade>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions - Keep existing */}
          <div>
            <BlurFade delay={0.5} inView>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 font-belfast">
                Quick Actions
              </h2>
            </BlurFade>

            <div className="space-y-4">
              <BlurFade delay={0.6} inView>
                <Link to="/createquiz">
                  <MagicCard
                    gradientColor="#3B82F655"
                    className="p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <PlusIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 font-belfast">
                          Create New Quiz
                        </h3>
                        <p className="text-sm text-gray-600 font-extended">
                          Generate AI-powered questions
                        </p>
                      </div>
                    </div>
                  </MagicCard>
                </Link>
              </BlurFade>

              <BlurFade delay={0.7} inView>
                <Link to="/myquizzes">
                  <MagicCard
                    gradientColor="#10B98155"
                    className="p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpenIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 font-belfast">
                          Manage Quizzes
                        </h3>
                        <p className="text-sm text-gray-600 font-extended">
                          View and edit your quizzes
                        </p>
                      </div>
                    </div>
                  </MagicCard>
                </Link>
              </BlurFade>

              <BlurFade delay={0.8} inView>
                <Link to="/takequiz">
                  <MagicCard
                    gradientColor="#F59E0B55"
                    className="p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <PencilIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 font-belfast">
                          Take a Quiz
                        </h3>
                        <p className="text-sm text-gray-600 font-extended">
                          Enter an access code to start
                        </p>
                      </div>
                    </div>
                  </MagicCard>
                </Link>
              </BlurFade>

              <BlurFade delay={0.9} inView>
                <MagicCard gradientColor="#6B728055" className="p-4 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-2 font-belfast">
                    Share Quiz
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 font-extended">
                    Share your quiz access code with participants
                  </p>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      Example: ABC123
                    </span>
                  </div>
                </MagicCard>
              </BlurFade>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
