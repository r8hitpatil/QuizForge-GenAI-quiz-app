import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/Firebase';
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const EditQuiz = ({ quiz, onUpdate, onCancel, isOpen = false }) => {
    const { updateQuiz, debugQuizData } = useFirebase();
    const [editData, setEditData] = useState({
        title: '',
        difficulty: 'medium',
        questions: []
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Update editData when quiz prop changes
    useEffect(() => {
        if (quiz) {
            console.log('Quiz prop received:', quiz);
            setEditData({
                title: quiz.title || '',
                difficulty: quiz.difficulty || 'medium',
                questions: quiz.questions || []
            });
        }
    }, [quiz]);

    const handleQuizDataChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuestionChange = (questionIndex, field, value) => {
        setEditData(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) => 
                idx === questionIndex 
                ? { ...q, [field]: value }
                : q
            )
        }));
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        setEditData(prev => ({
            ...prev,
            questions: prev.questions.map((q, qIdx) => 
                qIdx === questionIndex 
                ? {
                    ...q,
                    options: q.options.map((opt, oIdx) => 
                        oIdx === optionIndex ? value : opt
                    )
                }
                : q
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        
        try {
            console.log('=== STARTING QUIZ UPDATE ===');
            console.log('Quiz ID:', quiz.id);
            console.log('Original quiz data:', quiz);
            console.log('Edit data to submit:', editData);
            
            // Validate data before sending
            if (!editData.title.trim()) {
                throw new Error('Quiz title is required');
            }
            
            if (!editData.questions || editData.questions.length === 0) {
                throw new Error('At least one question is required');
            }

            // Validate each question and ensure proper structure
            const validatedQuestions = editData.questions.map((question, index) => {
                if (!question.question || !question.question.trim()) {
                    throw new Error(`Question ${index + 1} text is required`);
                }
                if (!question.options || question.options.length < 2) {
                    throw new Error(`Question ${index + 1} must have at least 2 options`);
                }
                if (question.correct === undefined || question.correct === null) {
                    throw new Error(`Question ${index + 1} must have a correct answer selected`);
                }

                // Ensure all options are strings and not empty
                const validatedOptions = question.options.map(option => 
                    typeof option === 'string' ? option.trim() : String(option).trim()
                ).filter(option => option.length > 0);

                if (validatedOptions.length < 2) {
                    throw new Error(`Question ${index + 1} must have at least 2 non-empty options`);
                }

                return {
                    question: question.question.trim(),
                    options: validatedOptions,
                    correct: parseInt(question.correct)
                };
            });

            const finalUpdateData = {
                title: editData.title.trim(),
                difficulty: editData.difficulty,
                questions: validatedQuestions
            };

            console.log('Final validated data:', finalUpdateData);

            if (onUpdate) {
                // Use custom update handler if provided
                await onUpdate(finalUpdateData);
            } else {
                // Use default Firebase update
                const result = await updateQuiz(quiz.id, finalUpdateData);
                console.log('Update result:', result);
                
                // Debug: Check what's actually in Firestore now
                await debugQuizData(quiz.id);
                
                alert('Quiz updated successfully!');
                if (onCancel) onCancel();
            }

            console.log('=== QUIZ UPDATE COMPLETED ===');
            
        } catch (error) {
            console.error('=== QUIZ UPDATE FAILED ===');
            console.error('Error updating quiz:', error);
            alert('Failed to update quiz: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && onCancel) {
            onCancel();
        }
    };

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && onCancel) {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCancel]);

    if (!isOpen || !quiz) return null;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <BlurFade delay={0.1} inView>
                <MagicCard
                    gradientColor="#D9D9D955"
                    className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 lg:p-8 space-y-8">
                        <div className="flex justify-between items-center pb-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 font-belfast truncate mr-4">
                                Edit Quiz: {quiz.title}
                            </h2>
                            <button
                                onClick={onCancel}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Quiz Basic Info */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 font-belfast">
                                    Quiz Information
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-base font-semibold text-gray-700 mb-3 font-belfast">
                                            Quiz Title
                                        </label>
                                        <input 
                                            type="text" 
                                            name="title"
                                            value={editData.title} 
                                            onChange={handleQuizDataChange}
                                            required
                                            className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-extended"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-base font-semibold text-gray-700 mb-3 font-belfast">
                                            Difficulty Level
                                        </label>
                                        <select 
                                            name="difficulty" 
                                            value={editData.difficulty} 
                                            onChange={handleQuizDataChange}
                                            className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-extended bg-white"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Questions Section */}
                            {editData.questions && editData.questions.length > 0 && (
                                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-6 font-belfast">
                                        Questions ({editData.questions.length})
                                    </h3>
                                    
                                    <div className="space-y-8">
                                        {editData.questions.map((question, qIndex) => (
                                            <div key={qIndex} className="bg-gray-50/90 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
                                                <h4 className="text-lg font-semibold text-gray-700 mb-6 font-belfast">
                                                    Question {qIndex + 1}
                                                </h4>
                                                
                                                {/* Question Text */}
                                                <div className="mb-6">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-3 font-belfast">
                                                        Question Text
                                                    </label>
                                                    <textarea
                                                        value={question.question || ''}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                                        className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-extended resize-none"
                                                        rows="3"
                                                        placeholder="Enter question text..."
                                                    />
                                                </div>
                                                
                                                {/* Answer Options */}
                                                {question.options && question.options.length > 0 && (
                                                    <div className="mb-6">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-3 font-belfast">
                                                            Answer Options
                                                        </label>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {question.options.map((option, oIndex) => (
                                                                <div key={oIndex} className="space-y-2">
                                                                    <label className="block text-xs font-medium text-gray-600 font-belfast">
                                                                        Option {String.fromCharCode(65 + oIndex)}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder={`Enter option ${String.fromCharCode(65 + oIndex)}`}
                                                                        value={option || ''}
                                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                        className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-extended"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Correct Answer Selection */}
                                                {question.options && question.options.length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-3 font-belfast">
                                                            Correct Answer
                                                        </label>
                                                        <select
                                                            value={question.correct || 0}
                                                            onChange={(e) => handleQuestionChange(qIndex, 'correct', parseInt(e.target.value))}
                                                            className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-extended bg-white"
                                                        >
                                                            {question.options.map((option, idx) => (
                                                                <option key={idx} value={idx}>
                                                                    Option {String.fromCharCode(65 + idx)}: {option && option.length > 50 ? option.substring(0, 50) + '...' : option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Submit Button */}
                            <div className="flex justify-center pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
                                <RainbowButton
                                    type="submit"
                                    size="lg"
                                    disabled={isUpdating}
                                    className="px-8 py-4 text-base"
                                >
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    <span className="font-semibold">
                                        {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                                    </span>
                                </RainbowButton>
                            </div>
                        </form>
                    </div>
                </MagicCard>
            </BlurFade>
        </div>
    );
};

export default EditQuiz;