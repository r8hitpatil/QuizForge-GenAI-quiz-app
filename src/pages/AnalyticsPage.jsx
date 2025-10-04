import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../context/Firebase';
import { useQuery } from '@tanstack/react-query';
import AuthNavbar from '../components/ui/AuthNavbar';
import NavbarSpacer from '../components/ui/NavbarSpacer';
import EditQuiz from '../components/EditQuiz'; // Import the new component
import { useEditQuiz } from '../hooks/useEditQuiz'; // Import the custom hook
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { 
    ChartBarIcon, 
    UserGroupIcon,
    ClockIcon,
    TrophyIcon,
    ShareIcon,
    ArrowLeftIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    PencilSquareIcon // Add this for edit button
} from '@heroicons/react/24/outline';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const Analytics = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user, getQuizById, getQuizAttempts, updateQuiz } = useFirebase();
    const [currentPage, setCurrentPage] = useState(1);
    const ATTEMPTS_PER_PAGE = 20;

    // Use the custom hook for edit functionality
    const { editingQuiz, isEditModalOpen, openEditModal, closeEditModal } = useEditQuiz();

    // Authentication check - MOVED TO TOP
    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }
    }, [user, navigate]);

    // Fetch quiz data
    const {
        data: quiz,
        isLoading: quizLoading,
        error: quizError
    } = useQuery({
        queryKey: ['quiz', quizId],
        queryFn: () => getQuizById(quizId),
        enabled: !!quizId && !!user,
    });

    // Fetch quiz attempts
    const {
        data: attempts = [],
        isLoading: attemptsLoading,
        error: attemptsError
    } = useQuery({
        queryKey: ['quizAttempts', quizId],
        queryFn: () => getQuizAttempts(quizId),
        enabled: !!quizId && !!user,
    });

    // Helper functions for enhanced analytics - MOVED BEFORE useMemo
    const calculateDiscriminationIndex = (attempts, questionIndex, correctAnswer) => {
        if (attempts.length < 6) return 0; // Need minimum attempts for reliable calculation
        
        // Sort attempts by total score
        const sortedAttempts = [...attempts].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
        
        // Take top and bottom 27% (or minimum 3 if less than 11 attempts)
        const groupSize = Math.max(3, Math.floor(attempts.length * 0.27));
        const topGroup = sortedAttempts.slice(0, groupSize);
        const bottomGroup = sortedAttempts.slice(-groupSize);
        
        // Calculate correct responses in each group
        const topCorrect = topGroup.filter(attempt => 
            parseInt(attempt.answers[questionIndex]) === parseInt(correctAnswer)
        ).length;
        
        const bottomCorrect = bottomGroup.filter(attempt => 
            parseInt(attempt.answers[questionIndex]) === parseInt(correctAnswer)  
        ).length;
        
        // Discrimination index formula
        const discriminationIndex = (topCorrect - bottomCorrect) / groupSize;
        return Math.round(discriminationIndex * 100) / 100; // Round to 2 decimal places
    };

    const calculateDistractorEffectiveness = (optionAnalytics) => {
        const distractors = optionAnalytics.filter(opt => !opt.isCorrect && opt.count > 0);
        const totalDistractors = optionAnalytics.filter(opt => !opt.isCorrect).length;
        
        if (totalDistractors === 0) return 100;
        
        const effectiveDistractors = distractors.length;
        return Math.round((effectiveDistractors / totalDistractors) * 100);
    };

    const getPerformanceInsight = (correctPercentage, effectiveness) => {
        if (correctPercentage >= 90) {
            return {
                level: 'excellent',
                message: 'Very high success rate - consider making it slightly more challenging',
                color: 'text-green-600'
            };
        } else if (correctPercentage >= 80) {
            return {
                level: 'good',
                message: 'Good performance - well-balanced question',
                color: 'text-green-600'
            };
        } else if (correctPercentage >= 60) {
            return {
                level: 'moderate',
                message: 'Moderate difficulty - review if content was covered adequately',
                color: 'text-yellow-600'
            };
        } else if (correctPercentage >= 40) {
            return {
                level: 'challenging',
                message: 'Challenging question - ensure content clarity and distractors',
                color: 'text-orange-600'
            };
        } else {
            return {
                level: 'difficult',
                message: 'Very challenging - review question clarity and teaching material',
                color: 'text-red-600'
            };
        }
    };

    const getQuestionRecommendations = (correctPercentage, optionAnalytics, effectiveness) => {
        const recommendations = [];
        
        if (correctPercentage < 40) {
            recommendations.push('Consider revising question wording for clarity');
            recommendations.push('Review if this topic was adequately covered in learning materials');
        }
        
        if (correctPercentage > 90) {
            recommendations.push('Question may be too easy - consider adding complexity');
        }
        
        const ineffectiveDistractors = optionAnalytics.filter(opt => !opt.isCorrect && opt.count === 0);
        if (ineffectiveDistractors.length > 0) {
            recommendations.push(`${ineffectiveDistractors.length} distractor(s) were never selected - consider revising`);
        }
        
        if (effectiveness.discriminationIndex < 0.2) {
            recommendations.push('Low discrimination - question may not effectively distinguish between high/low performers');
        }
        
        return recommendations;
    };

    // Calculate analytics from attempts - NOW HELPER FUNCTIONS ARE AVAILABLE
    const analytics = React.useMemo(() => {
        console.log('Computing analytics with:', { attemptsLength: attempts.length, quiz: quiz?.id });

        if (!attempts.length || !quiz) return {
            totalAttempts: 0,
            averagePercentage: 0,
            highestScore: 0,
            lowestScore: 0,
            questionAnalytics: [],
            performanceMetrics: {},
            quizTitle: quiz?.title || 'Unknown Quiz'
        };

        const completedAttempts = attempts.filter(attempt => 
            attempt.completed === true && 
            attempt.score !== undefined && 
            attempt.percentage !== undefined &&
            Array.isArray(attempt.answers) &&
            attempt.answers.length > 0
        );
        
        console.log('Completed attempts for analytics:', completedAttempts);
        
        if (completedAttempts.length === 0) {
            return {
                totalAttempts: 0,
                averagePercentage: 0,
                highestScore: 0,
                lowestScore: 0,
                questionAnalytics: [],
                performanceMetrics: {},
                quizTitle: quiz?.title || 'Unknown Quiz'
            };
        }

        const scores = completedAttempts.map(a => a.percentage || 0);
        
        const averagePercentage = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);

        // Enhanced performance metrics calculation
        const performanceMetrics = {
            totalQuestions: quiz.questions?.length || 0,
            passRate: Math.round((completedAttempts.filter(a => a.percentage >= 60).length / completedAttempts.length) * 100),
            excellentRate: Math.round((completedAttempts.filter(a => a.percentage >= 80).length / completedAttempts.length) * 100),
            averageTimePerQuestion: 0, // Can be calculated if time tracking is added
            difficultyDistribution: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            questionEffectiveness: []
        };

        // Enhanced question analytics with performance insights
        const questionAnalytics = [];
        if (quiz.questions && quiz.questions.length > 0) {
            quiz.questions.forEach((question, questionIndex) => {
                console.log(`Processing question ${questionIndex + 1}:`, question);

                // Get all responses for this specific question
                const questionResponses = completedAttempts
                    .map(attempt => {
                        const answer = attempt.answers[questionIndex];
                        return answer;
                    })
                    .filter(answer => answer !== undefined && answer !== null && answer !== '');

                const totalResponses = questionResponses.length;
                const correctCount = questionResponses.filter(
                    answer => parseInt(answer) === parseInt(question.correct)
                ).length;
                
                const correctPercentage = totalResponses > 0 
                    ? Math.round((correctCount / totalResponses) * 100) 
                    : 0;

                // Enhanced difficulty classification
                let difficultyLevel = 'hard';
                let difficultyScore = 0;
                
                if (correctPercentage >= 80) {
                    difficultyLevel = 'easy';
                    difficultyScore = 1;
                    performanceMetrics.difficultyDistribution.easy++;
                } else if (correctPercentage >= 60) {
                    difficultyLevel = 'medium'; 
                    difficultyScore = 2;
                    performanceMetrics.difficultyDistribution.medium++;
                } else {
                    difficultyLevel = 'hard';
                    difficultyScore = 3;
                    performanceMetrics.difficultyDistribution.hard++;
                }

                // Count responses for each option with enhanced analytics
                const optionStats = new Array(question.options.length).fill(0);
                const optionAnalytics = question.options.map((option, optionIndex) => {
                    const optionCount = questionResponses.filter(
                        answer => parseInt(answer) === optionIndex
                    ).length;
                    
                    optionStats[optionIndex] = optionCount;
                    
                    return {
                        text: option,
                        count: optionCount,
                        percentage: totalResponses > 0 ? Math.round((optionCount / totalResponses) * 100) : 0,
                        isCorrect: optionIndex === parseInt(question.correct),
                        isDistractor: optionIndex !== parseInt(question.correct) && optionCount > 0
                    };
                });

                // Calculate question effectiveness metrics
                const effectiveness = {
                    discriminationIndex: calculateDiscriminationIndex(completedAttempts, questionIndex, question.correct),
                    distractorEffectiveness: calculateDistractorEffectiveness(optionAnalytics),
                    questionReliability: correctPercentage >= 20 && correctPercentage <= 90 ? 'Good' : 
                                       correctPercentage < 20 ? 'Too Hard' : 'Too Easy'
                };

                performanceMetrics.questionEffectiveness.push({
                    questionNumber: questionIndex + 1,
                    difficulty: difficultyLevel,
                    effectiveness: effectiveness.questionReliability,
                    discriminationIndex: effectiveness.discriminationIndex
                });

                questionAnalytics.push({
                    questionNumber: questionIndex + 1,
                    question: question.question,
                    options: question.options,
                    correctAnswer: parseInt(question.correct),
                    correctAnswerText: question.options[question.correct],
                    correctCount,
                    totalResponses,
                    correctPercentage,
                    difficultyLevel,
                    difficultyScore,
                    optionStats,
                    optionAnalytics,
                    effectiveness,
                    unattemptedCount: completedAttempts.length - totalResponses,
                    // Performance insights
                    performanceInsight: getPerformanceInsight(correctPercentage, effectiveness),
                    recommendations: getQuestionRecommendations(correctPercentage, optionAnalytics, effectiveness)
                });
            });
        }

        return {
            totalAttempts: completedAttempts.length,
            averagePercentage,
            highestScore,
            lowestScore,
            questionAnalytics,
            performanceMetrics,
            quizTitle: quiz.title
        };
    }, [attempts, quiz, calculateDiscriminationIndex, calculateDistractorEffectiveness, getPerformanceInsight, getQuestionRecommendations]);

    // Pagination for attempts
    const paginatedAttempts = React.useMemo(() => {
        const startIndex = (currentPage - 1) * ATTEMPTS_PER_PAGE;
        const endIndex = startIndex + ATTEMPTS_PER_PAGE;
        return attempts.slice(startIndex, endIndex);
    }, [attempts, currentPage]);

    // Debugging info - MOVED TO TOP WITH ALL OTHER HOOKS
    useEffect(() => {
        console.log('Analytics Debug Info:', {
            quizId,
            user: user?.uid,
            quiz: quiz?.id,
            attemptsCount: attempts?.length,
            quizLoading,
            attemptsLoading,
            quizError,
            attemptsError
        });
    }, [quizId, user, quiz, attempts, quizLoading, attemptsLoading, quizError, attemptsError]);

    const totalPages = Math.ceil(attempts.length / ATTEMPTS_PER_PAGE);

    const copyAccessCode = () => {
        if (quiz?.accessCode) {
            navigator.clipboard.writeText(quiz.accessCode);
            alert('Access code copied to clipboard!');
        }
    };

    const scrollToAttempts = () => {
        const attemptsSection = document.getElementById('recent-attempts-section');
        if (attemptsSection) {
            setTimeout(() => {
                const elementRect = attemptsSection.getBoundingClientRect();
                const absoluteElementTop = elementRect.top + window.pageYOffset;
                const headerOffset = 100;
                const offsetPosition = absoluteElementTop - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 50);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Unknown";

        try {
            if (timestamp.toDate && typeof timestamp.toDate === "function") {
                return timestamp.toDate();
            }
            if (timestamp instanceof Date) {
                return timestamp;
            }
            return new Date(timestamp);
        } catch (error) {
            console.error("Error formatting date:", error);
            return new Date();
        }
    };

    const isLoading = quizLoading || attemptsLoading;
    const error = quizError || attemptsError;

    // NOW ALL CONDITIONAL RETURNS ARE AFTER ALL HOOKS
    if (isLoading || !user) {
        return (
            <>
                <AuthNavbar />
                <NavbarSpacer />
                <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center">
                    <BlurFade delay={0.25} inView>
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h1 className="text-xl font-semibold text-gray-900 font-belfast">
                                Loading Analytics...
                            </h1>
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
                                    Error Loading Analytics
                                </h2>
                                <p className="text-red-600 mb-4 font-extended">
                                    Unable to load analytics data
                                </p>
                                <RainbowButton
                                    onClick={() => navigate('/myquizzes')}
                                    size="lg"
                                    className="px-6 py-3"
                                >
                                    <span className="font-medium">Back to Quizzes</span>
                                </RainbowButton>
                            </div>
                        </MagicCard>
                    </BlurFade>
                </div>
            </>
        );
    }

    if (!quiz) {
        return (
            <>
                <AuthNavbar />
                <NavbarSpacer />
                <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
                    <BlurFade delay={0.25} inView>
                        <MagicCard
                            gradientColor="#D9D9D955"
                            className="p-6 rounded-2xl max-w-md text-center"
                        >
                            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-gray-900 mb-2 font-belfast">
                                Quiz Not Found
                            </h2>
                            <p className="text-gray-600 mb-4 font-extended">
                                The requested quiz could not be found
                            </p>
                            <RainbowButton
                                onClick={() => navigate('/myquizzes')}
                                size="lg"
                                className="px-6 py-3"
                            >
                                <span className="font-medium">Back to Quizzes</span>
                            </RainbowButton>
                        </MagicCard>
                    </BlurFade>
                </div>
            </>
        );
    }

    // Custom update handler for this page
    const handleUpdateQuiz = async (updatedQuizData) => {
        try {
            await updateQuiz(editingQuiz.id, updatedQuizData);
            closeEditModal();
            alert('Quiz updated successfully!');
            window.location.reload(); // Refresh the data
        } catch (error) {
            console.error('Error updating quiz:', error);
            alert('Failed to update quiz: ' + error.message);
            throw error;
        }
    };

    return (
        <>
            <AuthNavbar />
            <NavbarSpacer />
            <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] px-3 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-3 w-full max-w-7xl mx-auto">
                
                {/* Header with Edit Button */}
                <BlurFade delay={0.25} inView>
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center space-x-4 mb-4">
                            <button
                                onClick={() => navigate('/myquizzes')}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-belfast pb-2 text-gray-900">
                                    {analytics?.quizTitle || quiz?.title}
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base md:text-lg font-extended">
                                    Quiz Analytics & Performance
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                                <div className="text-center sm:text-right">
                                    <p className="text-sm text-gray-600 font-extended">Access Code</p>
                                    <p className="font-mono text-lg font-bold text-blue-600 font-belfast">
                                        {quiz.accessCode}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                    <ShimmerButton
                                        onClick={copyAccessCode}
                                        className="px-4 py-2 text-sm"
                                    >
                                        <ShareIcon className="h-4 w-4 mr-1" />
                                        Copy Code
                                    </ShimmerButton>
                                    <ShinyButton
                                        onClick={() => openEditModal(quiz)}
                                        className="px-4 py-2 text-sm"
                                    >
                                        <PencilSquareIcon className="h-4 w-4 mr-1" />
                                        Edit Quiz
                                    </ShinyButton>
                                    <ShinyButton
                                        onClick={scrollToAttempts}
                                        className="px-4 py-2 text-sm"
                                    >
                                        <UserGroupIcon className="h-4 w-4 mr-1" />
                                        <span className="hidden sm:inline">See Attempts</span>
                                        <span className="sm:hidden">Attempts</span>
                                    </ShinyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </BlurFade>

                {analytics && (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <BlurFade delay={0.35} inView>
                                <MagicCard
                                    gradientColor="#3B82F655"
                                    className="p-4 sm:p-6 rounded-xl text-center"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 font-belfast">
                                        {analytics.totalAttempts}
                                    </h3>
                                    <p className="text-gray-600 font-extended text-sm">Total Attempts</p>
                                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 rounded-full px-3 py-1 inline-block">
                                        {analytics.totalAttempts > 0 ? '+' + analytics.totalAttempts : '0'} participants
                                    </div>
                                </MagicCard>
                            </BlurFade>

                            <BlurFade delay={0.45} inView>
                                <MagicCard
                                    gradientColor="#10B98155"
                                    className="p-4 sm:p-6 rounded-xl text-center"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <TrophyIcon className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 font-belfast">
                                        {analytics.averagePercentage}% 
                                    </h3>
                                    <p className="text-gray-600 font-extended text-sm">Average Score</p>
                                    <div className={`mt-2 text-xs rounded-full px-3 py-1 inline-block ${
                                        analytics.averagePercentage >= 80 ? 'text-green-600 bg-green-50' :
                                        analytics.averagePercentage >= 60 ? 'text-yellow-600 bg-yellow-50' :
                                        'text-red-600 bg-red-50'
                                    }`}>
                                        {analytics.averagePercentage >= 80 ? 'Excellent' :
                                         analytics.averagePercentage >= 60 ? 'Good' : 'Needs Improvement'}
                                    </div>
                                </MagicCard>
                            </BlurFade>

                            <BlurFade delay={0.55} inView>
                                <MagicCard
                                    gradientColor="#8B5CF655"
                                    className="p-4 sm:p-6 rounded-xl text-center"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 font-belfast">
                                        {analytics.highestScore}/{analytics.lowestScore}
                                    </h3>
                                    <p className="text-gray-600 font-extended text-sm">High/Low Score</p>
                                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded-full px-3 py-1 inline-block">
                                        Range: {analytics.highestScore - analytics.lowestScore} pts
                                    </div>
                                </MagicCard>
                            </BlurFade>
                        </div>

                        {/* Score Distribution Chart - FIXED ORDER */}
                        {attempts.length > 0 && (
                            <BlurFade delay={0.75} inView>
                                <MagicCard
                                    gradientColor="#F8FAFC55"
                                    className="p-4 sm:p-6 rounded-xl mb-6 sm:mb-8"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 font-belfast">Score Distribution</h2>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={attempts.slice().reverse().slice(0, 20).map((attempt, index) => ({
                                                attempt: `Attempt ${index + 1}`,
                                                score: attempt.score || 0,
                                                percentage: attempt.percentage || 0,
                                                participant: attempt.participantName || 'Anonymous'
                                            }))}>
                                                <defs>
                                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="attempt" />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip 
                                                    formatter={(value, name) => [
                                                        name === 'percentage' ? `${value}%` : value,
                                                        name === 'percentage' ? 'Score' : 'Points'
                                                    ]}
                                                    labelFormatter={(label, payload) => {
                                                        if (payload && payload[0]) {
                                                            return `${label} - ${payload[0].payload.participant}`;
                                                        }
                                                        return label;
                                                    }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="percentage" 
                                                    stroke="#10b981" 
                                                    strokeWidth={2}
                                                    fillOpacity={1} 
                                                    fill="url(#colorScore)" 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </MagicCard>
                            </BlurFade>
                        )}

                        {/* Question Analytics */}
                        {analytics.questionAnalytics.length > 0 && (
                            <BlurFade delay={0.85} inView>
                                <MagicCard
                                    gradientColor="#F8FAFC55"
                                    className="p-4 sm:p-6 rounded-xl mb-6 sm:mb-8"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 font-belfast">Question Performance Analytics</h2>
                                    

                                    {/* Individual Question Analysis */}
                                    <div className="space-y-8">
                                        {analytics.questionAnalytics.map((question, index) => {
                                            const getDifficultyColor = (percentage) => {
                                                if (percentage >= 80) return 'text-green-600 bg-green-100';
                                                if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
                                                return 'text-red-600 bg-red-100';
                                            };

                                            const getDifficultyLabel = (percentage) => {
                                                if (percentage >= 80) return 'Easy';
                                                if (percentage >= 60) return 'Medium';
                                                return 'Hard';
                                            };

                                            return (
                                                <BlurFade key={index} delay={0.1 * (index + 1)} inView>
                                                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                                        {/* Question Header */}
                                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1 pr-6">
                                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-belfast">
                                                                        Question {question.questionNumber}: {question.question}
                                                                    </h3>
                                                                    <div className="flex items-center text-sm font-extended">
                                                                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                                                                        <span className="text-green-600 font-medium mr-2">Correct Answer:</span>
                                                                        <span className="text-gray-900 font-medium">{question.correctAnswerText}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Question Content */}
                                                        <div className="p-6">
                                                            <div className="grid lg:grid-cols-2 gap-8">
                                                                {/* Response Distribution Chart */}
                                                                <div>
                                                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 font-belfast">Response Distribution</h4>
                                                                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                                                                        <ResponsiveContainer width="100%" height="100%">
                                                                            <BarChart data={question.optionStats.map((count, optionIndex) => ({
                                                                                option: String.fromCharCode(65 + optionIndex),
                                                                                responses: count,
                                                                                percentage: question.totalResponses > 0 
                                                                                    ? Math.round((count / question.totalResponses) * 100) 
                                                                                    : 0,
                                                                                isCorrect: optionIndex === question.correctAnswer
                                                                            }))}>
                                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                                <XAxis 
                                                                                    dataKey="option" 
                                                                                    tick={{ fontSize: 12 }}
                                                                                    axisLine={{ stroke: '#d1d5db' }}
                                                                                />
                                                                                <YAxis 
                                                                                    tick={{ fontSize: 12 }}
                                                                                    axisLine={{ stroke: '#d1d5db' }}
                                                                                />
                                                                                <Tooltip 
                                                                                    formatter={(value, name) => [
                                                                                        name === 'responses' ? `${value} responses` : `${value}%`,
                                                                                        name === 'responses' ? 'Count' : 'Percentage'
                                                                                    ]}
                                                                                    contentStyle={{
                                                                                        backgroundColor: '#f9fafb',
                                                                                        border: '1px solid #e5e7eb',
                                                                                        borderRadius: '8px'
                                                                                    }}
                                                                                />
                                                                                <Bar 
                                                                                    dataKey="responses" 
                                                                                    fill="#3b82f6"
                                                                                    radius={[4, 4, 0, 0]}
                                                                                />
                                                                            </BarChart>
                                                                        </ResponsiveContainer>
                                                                    </div>
                                                                </div>

                                                                {/* Response Breakdown Pie Chart */}
                                                                <div>
                                                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 font-belfast">Response Breakdown</h4>
                                                                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                                                                        <ResponsiveContainer width="100%" height="100%">
                                                                            <PieChart>
                                                                                <Pie
                                                                                    data={question.optionStats.map((count, optionIndex) => ({
                                                                                        name: `Option ${String.fromCharCode(65 + optionIndex)}`,
                                                                                        value: count,
                                                                                        percentage: question.totalResponses > 0 
                                                                                            ? Math.round((count / question.totalResponses) * 100) 
                                                                                            : 0,
                                                                                        isCorrect: optionIndex === question.correctAnswer
                                                                                    }))}
                                                                                    cx="50%"
                                                                                    cy="50%"
                                                                                    outerRadius={80}
                                                                                    dataKey="value"
                                                                                    label={({name, percentage}) => percentage > 0 ? `${name}: ${percentage}%` : ''}
                                                                                >
                                                                                    {question.optionStats.map((count, optionIndex) => (
                                                                                        <Cell 
                                                                                            key={`cell-${optionIndex}`} 
                                                                                            fill={optionIndex === question.correctAnswer ? '#10b981' : 
                                                                                                  ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][optionIndex % 4]} 
                                                                                        />
                                                                                    ))}
                                                                                </Pie>
                                                                                <Tooltip 
                                                                                    formatter={(value) => [`${value} responses`, 'Count']}
                                                                                    contentStyle={{
                                                                                        backgroundColor: '#f9fafb',
                                                                                        border: '1px solid #e5e7eb',
                                                                                        borderRadius: '8px'
                                                                                    }}
                                                                                />
                                                                            </PieChart>
                                                                        </ResponsiveContainer>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Detailed Option Statistics */}
                                                            <div className="mt-8">
                                                                <h4 className="text-lg font-semibold text-gray-800 mb-4 font-belfast">Detailed Breakdown</h4>
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                    {question.optionStats.map((count, optionIndex) => {
                                                                        const percentage = question.totalResponses > 0 
                                                                            ? Math.round((count / question.totalResponses) * 100) 
                                                                            : 0;
                                                                        const isCorrect = optionIndex === question.correctAnswer;
                                                                        
                                                                        return (
                                                                            <div
                                                                                key={optionIndex}
                                                                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                                                                    isCorrect 
                                                                                        ? 'bg-green-50 border-green-200 shadow-lg' 
                                                                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                                                }`}
                                                                            >
                                                                                {isCorrect && (
                                                                                    <div className="absolute -top-2 -right-2 rounded-full flex items-center justify-center">
                                                                                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex justify-between items-center mb-3">
                                                                                    <span className="text-lg font-bold text-gray-900 font-belfast">
                                                                                        Option {String.fromCharCode(65 + optionIndex)}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="text-3xl font-bold text-gray-900 mb-1 font-belfast">
                                                                                    {percentage}%
                                                                                </div>
                                                                                <div className="text-sm text-gray-600 mb-4 font-extended">
                                                                                    {count} responses
                                                                                </div>
                                                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                                                    <div
                                                                                        className={`h-3 rounded-full transition-all duration-700 ${
                                                                                            isCorrect ? 'bg-green-500' : 'bg-blue-500'
                                                                                        }`}
                                                                                        style={{ width: `${percentage}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Additional Statistics */}
                                                            {question.unattemptedCount > 0 && (
                                                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <div className="flex items-center">
                                                                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                                                                            <span className="text-white font-bold text-sm">!</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium text-yellow-800 font-extended">
                                                                                {question.unattemptedCount} participants did not attempt this question
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </BlurFade>
                                            );
                                        })}
                                    </div>
                                </MagicCard>
                            </BlurFade>
                        )}

                        {/* Recent Attempts */}
                        <div className="mt-12 pt-4" id="recent-attempts-section">
                            <BlurFade delay={0.95} inView>
                                <MagicCard
                                    gradientColor="#F8FAFC55"
                                    className="p-4 sm:p-6 rounded-xl"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 font-belfast">Recent Attempts</h2>
                                        {totalPages > 1 && (
                                            <div className="flex items-center space-x-2">
                                                <ShinyButton
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1 text-sm"
                                                >
                                                    Previous
                                                </ShinyButton>
                                                <span className="text-sm text-gray-600 font-extended">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <ShinyButton
                                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                                    disabled={currentPage >= totalPages}
                                                    className="px-3 py-1 text-sm"
                                                >
                                                    Next
                                                </ShinyButton>
                                            </div>
                                        )}
                                    </div>

                                    {attempts.length === 0 ? (
                                        <div className="text-center py-12">
                                            <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2 font-belfast">No attempts yet</h3>
                                            <p className="text-gray-600 font-extended">
                                                Share your quiz access code to start receiving attempts.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-extended">
                                                            Participant
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-extended">
                                                            Score
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-extended">
                                                            Completed At
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {paginatedAttempts.map((attempt, index) => (
                                                        <tr key={attempt.id || index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 font-belfast">
                                                                        {attempt.participantName || 'Anonymous'}
                                                                    </div>
                                                                    {attempt.participantEmail && (
                                                                        <div className="text-sm text-gray-500 font-extended">
                                                                            {attempt.participantEmail}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className={`text-sm font-medium font-belfast ${
                                                                        (attempt.percentage || 0) >= 80 ? 'text-green-600' :
                                                                        (attempt.percentage || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                                    }`}>
                                                                        {attempt.percentage || 0}%
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 ml-2 font-extended">
                                                                        ({attempt.score || 0}/{quiz.questions?.length || 0})
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-extended">
                                                                {(() => {
                                                                    const date = formatDate(attempt.completedAt);
                                                                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                                                                })()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </MagicCard>
                            </BlurFade>
                        </div>

                        {/* Edit Quiz Modal */}
                        <EditQuiz
                            quiz={editingQuiz}
                            isOpen={isEditModalOpen}
                            onUpdate={handleUpdateQuiz}
                            onCancel={closeEditModal}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default Analytics;