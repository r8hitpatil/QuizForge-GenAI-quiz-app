import { useState } from 'react';

export const useEditQuiz = () => {
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const openEditModal = (quiz) => {
        console.log('Opening edit modal with quiz:', quiz); // Debug log
        setEditingQuiz(quiz);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingQuiz(null);
        setIsEditModalOpen(false);
    };

    return {
        editingQuiz,
        isEditModalOpen,
        openEditModal,
        closeEditModal,
    };
};