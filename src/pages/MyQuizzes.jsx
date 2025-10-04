import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from '../context/Firebase';
import { useQuery } from '@tanstack/react-query';
import AuthNavbar from '../components/ui/AuthNavbar';
import NavbarSpacer from '../components/ui/NavbarSpacer';
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { 
    PlusIcon, 
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    TrashIcon,
    PencilIcon,
    ClipboardDocumentIcon,
    ShareIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import EditQuiz from '../components/EditQuiz';
import { useEditQuiz } from '../hooks/useEditQuiz';

const MyQuizzes = () => {
    const { user, getUserQuizzes, deleteQuiz, updateQuiz, debugQuizData } = useFirebase();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);
    
    // Initialize currentPage from location state if available
    const [currentPage, setCurrentPage] = useState(() => {
        return location.state?.page || 1;
    });
    
    const ITEMS_PER_PAGE = 8;

    // Fetch user quizzes
    const {
        isLoading,
        error,
        data: allQuizzes = [],
        refetch,
    } = useQuery({
        queryKey: ["userQuizzes", user?.uid],
        queryFn: async () => {
            if (!user) throw new Error('User not authenticated');
            return await getUserQuizzes();
        },
        enabled: !!user,
        retry: 2,
        retryDelay: 1000,
    });

    // Authentication check
    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }
    }, [user, navigate]);

    // Calculate pagination data
    const paginationData = useMemo(() => {
        const totalItems = allQuizzes.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentQuizzes = allQuizzes.slice(startIndex, endIndex);
        
        return {
            currentQuizzes,
            totalPages,
            totalItems,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
            startIndex: startIndex + 1,
            endIndex: Math.min(endIndex, totalItems)
        };
    }, [allQuizzes, currentPage]);

    // Reset to first page when quizzes data changes, but preserve page from navigation
    useEffect(() => {
        if (!location.state?.fromEdit) {
            setCurrentPage(1);
        }
    }, [allQuizzes.length, location.state?.fromEdit]);

    const handleDeleteClick = (quiz) => {
        setQuizToDelete(quiz);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (quizToDelete && deleteQuiz) {
            try {
                await deleteQuiz(quizToDelete.id);
                refetch(); // Refresh the list
                setShowDeleteModal(false);
                setQuizToDelete(null);
            } catch (error) {
                console.error('Delete quiz error:', error);
                alert('Failed to delete quiz: ' + error.message);
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setQuizToDelete(null);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    // Use the custom hook for edit functionality
    const { editingQuiz, isEditModalOpen, openEditModal, closeEditModal } = useEditQuiz();

    // Custom update handler for this page
    const handleUpdateQuiz = async (updatedQuizData) => {
        try {
            console.log('MyQuizzes: Starting quiz update');
            console.log('MyQuizzes: Quiz ID:', editingQuiz.id);
            console.log('MyQuizzes: Update data:', updatedQuizData);
            
            const result = await updateQuiz(editingQuiz.id, updatedQuizData);
            console.log('MyQuizzes: Update result:', result);
            
            // Debug: Verify the update in Firestore
            await debugQuizData(editingQuiz.id);
            
            closeEditModal();
            
            // Show success message
            alert('Quiz updated successfully!');
            
            // Force refetch data to show updated information
            await refetch();
            
            console.log('MyQuizzes: Quiz update completed successfully');
            
        } catch (error) {
            console.error('MyQuizzes: Error updating quiz:', error);
            alert('Failed to update quiz: ' + error.message);
            throw error;
        }
    };

    // Debug function to check quiz data
    const handleEditClick = (quiz) => {
        console.log('Editing quiz:', quiz); // Debug log
        openEditModal(quiz);
    };

    const { currentQuizzes, totalPages, totalItems, hasNext, hasPrev, startIndex, endIndex } = paginationData;

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
                                Loading Your Quizzes...
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
                                    Error Loading Quizzes
                                </h2>
                                <p className="text-red-600 mb-4 font-extended">
                                    Unable to load your quizzes
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-belfast pb-2 text-gray-900">
                                My Quizzes
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base md:text-lg font-extended">
                                Manage all your created quizzes
                                {totalItems > 0 && (
                                    <span className="ml-2">
                                        ({totalItems} total, showing {startIndex}-{endIndex})
                                    </span>
                                )}
                            </p>
                        </div>
                        <Link to="/createquiz">
                            <RainbowButton size="lg" className="px-6 py-3 w-full sm:w-auto">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                <span className="font-medium">Create New Quiz</span>
                            </RainbowButton>
                        </Link>
                    </div>
                </BlurFade>

                {/* Quizzes Grid */}
                {allQuizzes.length === 0 ? (
                    <BlurFade delay={0.35} inView>
                        <MagicCard
                            gradientColor="#D9D9D955"
                            className="p-8 sm:p-12 rounded-2xl text-center"
                        >
                            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2 font-belfast">
                                No quizzes found
                            </h3>
                            <p className="text-gray-600 mb-6 font-extended">
                                You haven't created any quizzes yet. Create your first quiz to get started!
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
                    <div className="flex flex-col min-h-[calc(100vh-300px)]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 flex-grow">
                            {currentQuizzes.map((quiz, index) => (
                                <BlurFade key={quiz.id} delay={0.1 * (index + 1) + 0.3} inView>
                                    <MagicCard
                                        gradientColor="#F8FAFC55"
                                        className="p-4 sm:p-6 rounded-xl hover:shadow-lg transition-all h-full flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-lg mb-1 sm:mb-2 truncate font-belfast">
                                                    {quiz.title}
                                                </h3>
                                                <div className="h-8 sm:h-10 mb-2 sm:mb-3">
                                                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 overflow-hidden font-extended">
                                                        Quiz with {quiz.totalQuestions || (quiz.questions?.length || 0)} questions
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                                                quiz.isActive !== false
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-400'
                                            }`}>
                                                {quiz.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 flex-grow font-extended">
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span className="text-gray-600">Access Code:</span>
                                                <span className="font-mono font-bold text-blue-600">
                                                    {quiz.accessCode}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span className="text-gray-600">Questions:</span>
                                                <span className="text-gray-900">
                                                    {quiz.totalQuestions || (quiz.questions?.length || 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span className="text-gray-600">Difficulty:</span>
                                                <span className="text-gray-900 capitalize">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                        quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {quiz.difficulty}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span className="text-gray-600">Created:</span>
                                                <span className="text-gray-900">
                                                    {formatDate(quiz.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col space-y-3 pt-3 sm:pt-4 border-t mt-auto">
                                            {/* Action buttons row 1 - Quick Actions */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex space-x-2">
                                                    <ShimmerButton
                                                        onClick={() => copyAccessCode(quiz.accessCode)}
                                                        className="px-2 py-1 text-xs"
                                                        title="Copy Access Code"
                                                    >
                                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                                    </ShimmerButton>
                                                    <ShinyButton
                                                        onClick={() => shareQuiz(quiz)}
                                                        className="px-2 py-1 text-xs"
                                                        title="Share Quiz"
                                                    >
                                                        <ShareIcon className="h-4 w-4" />
                                                    </ShinyButton>
                                                </div>
                                                
                                                <div className="flex space-x-2">
                                                    <button
                                                        // onClick={() => toggleQuizStatus(quiz.id)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:cursor-pointer"
                                                        title={quiz.isActive !== false ? 'Deactivate Quiz' : 'Activate Quiz'}
                                                    >
                                                        {quiz.isActive !== false ? (
                                                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <XCircleIcon className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(quiz)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:cursor-pointer"
                                                        title="Delete Quiz"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Action buttons row 2 - Main Actions (Fixed alignment) */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleEditClick(quiz)} // Use the debug function
                                                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 h-10 font-medium"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <Link
                                                    to={`/analytics/${quiz.id}`}
                                                    className="w-full"
                                                >
                                                    <button className="w-full px-3 py-2.5 text-sm bg-white text-black rounded-lg hover:bg-black hover:text-white outline-1 transition-colors flex items-center justify-center space-x-2 h-10 font-medium">
                                                        <ChartBarIcon className="h-4 w-4" />
                                                        <span>Analytics</span>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </MagicCard>
                                </BlurFade>
                            ))}
                        </div>

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <BlurFade delay={0.8} inView>
                                <div className="mt-auto pt-6 sm:pt-8">
                                    <div className="flex flex-col items-center space-y-4">
                                        {/* Page info */}
                                        <div className="text-sm text-gray-600 text-center font-extended">
                                            Showing {startIndex} to {endIndex} of {totalItems} quizzes
                                        </div>
                                        
                                        {/* Pagination controls */}
                                        <div className="flex flex-wrap justify-center items-center gap-2">
                                            {/* Previous button */}
                                            <ShinyButton
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={!hasPrev}
                                                className="w-20 h-10 text-sm"
                                            >
                                                Previous
                                            </ShinyButton>

                                            {/* Page numbers */}
                                            <div className="flex gap-1">
                                                {Array.from({ length: totalPages }, (_, index) => {
                                                    const pageNum = index + 1;
                                                    const isCurrentPage = pageNum === currentPage;
                                                    
                                                    const shouldShow = 
                                                        pageNum === 1 || 
                                                        pageNum === totalPages || 
                                                        Math.abs(pageNum - currentPage) <= 1;
                                                    
                                                    if (!shouldShow) {
                                                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                            return <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-gray-500 font-extended">...</span>;
                                                        }
                                                        return null;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`w-10 h-10 text-sm rounded transition-colors flex items-center justify-center font-extended ${
                                                                isCurrentPage
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-white text-gray-700 border hover:cursor-pointer border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Next button */}
                                            <ShinyButton
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={!hasNext}
                                                className="w-16 h-10 text-sm"
                                            >
                                                Next
                                            </ShinyButton>
                                        </div>

                                        {/* Quick jump to first/last */}
                                        {totalPages > 5 && (
                                            <div className="flex gap-2 text-sm font-extended">
                                                {currentPage > 3 && (
                                                    <button
                                                        onClick={() => handlePageChange(1)}
                                                        className="text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        Go to first page
                                                    </button>
                                                )}
                                                {currentPage < totalPages - 2 && (
                                                    <button
                                                        onClick={() => handlePageChange(totalPages)}
                                                        className="text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        Go to last page
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </BlurFade>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleDeleteCancel}
                    />

                    <BlurFade delay={0.1} inView>
                        <MagicCard
                            gradientColor="#EF444455"
                            className="relative rounded-2xl max-w-md w-full mx-auto p-6"
                        >
                            <div className="text-center flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <TrashIcon className="h-6 w-6 text-red-600" />
                                </div>
                                
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-belfast">
                                    Delete Quiz
                                </h3>

                                <p className="text-md text-gray-600 mb-6 font-extended">
                                    Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone.
                                </p>

                                <div className="flex gap-3 w-full">
                                    <ShinyButton
                                        onClick={handleDeleteCancel}
                                        className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    >
                                        Cancel
                                    </ShinyButton>
                                    <ShimmerButton
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Delete Quiz
                                    </ShimmerButton>
                                </div>
                            </div>
                        </MagicCard>
                    </BlurFade>
                </div>
            )}

            {/* Edit Quiz Modal */}
            <EditQuiz
                quiz={editingQuiz}
                isOpen={isEditModalOpen}
                onUpdate={handleUpdateQuiz}
                onCancel={closeEditModal}
            />
        </>
    );
};

export default MyQuizzes;