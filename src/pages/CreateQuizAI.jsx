import React, { useState, useEffect } from "react";
import { useFirebase } from '../context/Firebase';
import { useQueryClient } from "@tanstack/react-query";
import { main } from "../services/quizService";
import { useNavigate } from 'react-router-dom';
import AuthNavbar from "../components/ui/AuthNavbar";
import NavbarSpacer from "../components/ui/NavbarSpacer";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  PlusIcon,
  PencilSquareIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import EditQuiz from '../components/EditQuiz';
import { useEditQuiz } from '../hooks/useEditQuiz';

const CreateQuizAI = () => {
  const { user, signOutUser, saveQuizWithQuestions, getUserQuizzes, updateQuiz } = useFirebase();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    difficulty: "medium",
    numberOfQuestions: 10,
    prompt: ""
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [savedQuiz, setSavedQuiz] = useState(null);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [showEditMode, setShowEditMode] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Use the custom hook for edit functionality
  const { editingQuiz, isEditModalOpen, openEditModal, closeEditModal } = useEditQuiz();

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Load user quizzes
  useEffect(() => {
    const loadUserQuizzes = async () => {
      if (!user) return;
      
      setLoadingQuizzes(true);
      try {
        const quizzes = await getUserQuizzes();
        setUserQuizzes(quizzes || []);
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    loadUserQuizzes();
  }, [user, getUserQuizzes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a quiz title');
      return;
    }
    
    if (!formData.prompt.trim()) {
      alert('Please enter a topic for question generation');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Generating questions...');
      const questions = await main(formData.numberOfQuestions, formData.prompt);
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions were generated. Please try a different topic.');
      }
      
      console.log('Saving quiz...');
      // Fixed: Pass individual parameters as expected by saveQuizWithQuestions
      const result = await saveQuizWithQuestions(
        formData.title, 
        formData.difficulty, 
        questions
      );
      
      setSavedQuiz(result);
      
      setFormData({
        title: "",
        difficulty: "medium",
        numberOfQuestions: 10,
        prompt: ""
      });
      
      const updatedQuizzes = await getUserQuizzes();
      setUserQuizzes(updatedQuizzes || []);
      
      queryClient.invalidateQueries(['data']);
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert(`Error creating quiz: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditQuiz = (quiz) => {
    openEditModal(quiz);
  };

  // Fix loadUserQuizzes function reference issue
  const loadUserQuizzes = async () => {
    if (!user) return;
    
    setLoadingQuizzes(true);
    try {
      const quizzes = await getUserQuizzes();
      setUserQuizzes(quizzes || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Custom update handler for this page
  const handleUpdateQuiz = async (updatedQuizData) => {
    try {
      await updateQuiz(editingQuiz.id, updatedQuizData);
      closeEditModal();
      alert('Quiz updated successfully!');
      await loadUserQuizzes(); // Refresh the quiz list
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Failed to update quiz: ' + error.message);
      throw error;
    }
  };

  const handleCreateAnother = () => {
    setSavedQuiz(null);
    setShowEditMode(false);
    setEditingQuiz(null);
  };

  const copyAccessCode = (accessCode) => {
    navigator.clipboard.writeText(accessCode);
    alert('Access code copied to clipboard!');
  };

  if (!user) {
    return (
      <>
        <AuthNavbar />
        <NavbarSpacer />
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthNavbar />
      <NavbarSpacer />
      <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] px-3 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-3 w-full max-w-4xl mx-auto">
        
        {/* Header */}
        <BlurFade delay={0.25} inView>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-belfast pb-3 sm:pb-4 text-center">
            {showEditMode && !editingQuiz ? 'Manage Quizzes' : editingQuiz ? 'Edit Quiz' : savedQuiz ? 'Quiz Created!' : 'Create AI Quiz'}
          </h1>
        </BlurFade>

        {/* Navigation Tabs */}
        {!savedQuiz && !editingQuiz && (
          <BlurFade delay={0.35} inView>
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => {
                    setShowEditMode(false);
                    setSavedQuiz(null);
                    setEditingQuiz(null);
                  }}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    !showEditMode
                      ? 'bg-white shadow-sm text-black-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PlusIcon className="h-4 w-4 inline mr-2" />
                  Create New
                </button>
                <button
                  onClick={() => {
                    setShowEditMode(true);
                    setSavedQuiz(null);
                    setEditingQuiz(null);
                  }}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    showEditMode
                      ? 'bg-white shadow-sm text-black'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PencilSquareIcon className="h-4 w-4 inline mr-2" />
                  Manage Existing
                </button>
              </div>
            </div>
          </BlurFade>
        )}

        {/* Create New Quiz Mode */}
        {!showEditMode && !savedQuiz && !editingQuiz && (
          <BlurFade delay={0.5} inView>
            <MagicCard
              gradientColor="#D9D9D955"
              className="p-6 lg:p-8 rounded-2xl font-belfast w-full max-w-3xl mx-auto"
            >
              <form onSubmit={handleCreateQuiz} className="space-y-5">
                
                {/* Quiz Title */}
                <BlurFade delay={0.6} inView>
                  <div>
                    <label className="block text-base font-semibold text-black mb-2 font-belfast">
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter quiz title (e.g., 'JavaScript Fundamentals')"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all font-extended"
                    />
                  </div>
                </BlurFade>

                {/* Difficulty and Questions Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <BlurFade delay={0.7} inView>
                    <div>
                      <label className="block text-base font-semibold text-black mb-2 font-belfast">
                        Difficulty Level
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all font-extended bg-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </BlurFade>

                  <BlurFade delay={0.8} inView>
                    <div>
                      <label className="block text-base font-semibold text-black mb-2 font-belfast">
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        name="numberOfQuestions"
                        value={formData.numberOfQuestions}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                        required
                        className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all font-extended"
                      />
                    </div>
                  </BlurFade>
                </div>

                {/* Topic/Prompt */}
                <BlurFade delay={0.9} inView>
                  <div>
                    <label className="block text-base font-semibold text-black mb-2 font-belfast">
                      Quiz Topic & Description
                    </label>
                    <textarea
                      name="prompt"
                      placeholder="Describe the topic for your quiz questions (e.g., 'JavaScript basics including variables, functions, and arrays')"
                      value={formData.prompt}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all font-extended resize-none"
                    />
                  </div>
                </BlurFade>

                {/* Submit Button */}
                <BlurFade delay={1.0} inView>
                  <div className="pt-2">
                    <RainbowButton
                      type="submit"
                      size="lg"
                      disabled={isProcessing || !formData.title.trim() || !formData.prompt.trim()}
                      className="w-full flex items-center justify-center py-4 text-base"
                    >
                      {isProcessing ? (
                        <>
                          <SparklesIcon className="h-5 w-5 mr-2 animate-spin" />
                          <span className="font-semibold">Creating Quiz...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          <span className="font-semibold">Generate & Save Quiz</span>
                        </>
                      )}
                    </RainbowButton>
                  </div>
                </BlurFade>
              </form>
            </MagicCard>
          </BlurFade>
        )}

        {/* Edit Quiz Mode - Quiz List - Compact Version */}
        {showEditMode && !editingQuiz && (
          <BlurFade delay={0.5} inView>
            <MagicCard
              gradientColor="#D9D9D955"
              className="p-6 rounded-2xl font-belfast w-full max-w-4xl mx-auto max-h-[calc(100vh-280px)]"
            >
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-6 font-belfast">Your Quizzes</h2>
              
              {loadingQuizzes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="font-extended text-sm text-gray-600">Loading your quizzes...</p>
                </div>
              ) : userQuizzes.length === 0 ? (
                <div className="text-center py-12">
                  <PlusIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black mb-2 font-belfast">No quizzes found</h3>
                  <p className="text-gray-500 font-extended mb-6">Create your first quiz to get started!</p>
                  <ShinyButton
                    onClick={() => setShowEditMode(false)}
                    className="px-6 py-3"
                  >
                    Create First Quiz
                  </ShinyButton>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {userQuizzes.map((quiz, index) => (
                    <BlurFade key={quiz.id || index} delay={0.1 * (index + 1)} inView>
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-800 mb-2 truncate font-belfast">{quiz.title}</h3>
                            <div className="flex flex-wrap gap-3 text-sm font-extended text-gray-600">
                              <span className="flex items-center">
                                <span className="font-medium mr-1">Difficulty:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {quiz.difficulty}
                                </span>
                              </span>
                              <span><span className="font-medium">Questions:</span> {quiz.questions?.length || 0}</span>
                              <span><span className="font-medium">Access Code:</span> 
                                <span className="font-mono bg-blue-50 px-2 py-1 rounded text-blue-700 text-xs ml-1">{quiz.accessCode}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <ShimmerButton
                              onClick={() => copyAccessCode(quiz.accessCode)}
                              className="px-4 py-2 text-sm"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                              Copy
                            </ShimmerButton>
                            <ShinyButton
                              onClick={() => handleEditQuiz(quiz)}
                              className="px-4 py-2 text-sm"
                            >
                              <PencilSquareIcon className="h-4 w-4 mr-1" />
                              Edit
                            </ShinyButton>
                          </div>
                        </div>
                      </div>
                    </BlurFade>
                  ))}
                </div>
              )}
            </MagicCard>
          </BlurFade>
        )}

        {/* Success Message - Compact Version */}
        {savedQuiz && (
          <BlurFade delay={0.5} inView>
            <MagicCard
              gradientColor="#10B98155"
              className="p-6 rounded-2xl font-belfast w-full max-w-2xl mx-auto text-center"
            >
              <BlurFade delay={0.6} inView>
                <div className="mb-6">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold font-belfast mb-3 text-green-800">
                    Quiz Created Successfully!
                  </h2>
                  
                  <p className="text-lg font-semibold font-belfast mb-2 text-gray-800">"{savedQuiz.title}"</p>
                  
                  <p className="text-sm font-extended mb-4 text-green-700">
                    Your quiz access code is:
                  </p>
                  
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border-2 border-green-300 mb-4">
                    <div className="text-2xl font-mono font-bold text-green-800 tracking-widest">
                      {savedQuiz.accessCode}
                    </div>
                  </div>
                  
                  <p className="text-sm font-extended text-green-600">
                    Share this code with others so they can take your quiz!
                  </p>
                </div>
              </BlurFade>

              <BlurFade delay={0.8} inView>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <ShimmerButton
                    onClick={() => copyAccessCode(savedQuiz.accessCode)}
                    className="px-6 py-3 text-sm"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                    Copy Access Code
                  </ShimmerButton>
                  
                  <RainbowButton
                    onClick={handleCreateAnother}
                    size="lg"
                    className="px-6 py-3"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Create Another Quiz</span>
                  </RainbowButton>
                </div>
              </BlurFade>
            </MagicCard>
          </BlurFade>
        )}

        {/* Edit Quiz Modal - Only this one should remain */}
        <EditQuiz
          quiz={editingQuiz}
          isOpen={isEditModalOpen}
          onUpdate={handleUpdateQuiz}
          onCancel={closeEditModal}
        />
      </div>
    </>
  );
};

export default CreateQuizAI;
