import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where,
  serverTimestamp,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  increment
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0A7OIi8TN53p6lHoM-MGmVkGgdnRZyHA",
  authDomain: "quiz-gen-ai-app.firebaseapp.com",
  projectId: "quiz-gen-ai-app",
  storageBucket: "quiz-gen-ai-app.firebasestorage.app",
  messagingSenderId: "922833641774",
  appId: "1:922833641774:web:a3b50db1749beee9b11abf",
  databaseURL:
    "https://quiz-gen-ai-app-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const FirebaseContext = createContext(null);

export const useFirebase = () => useContext(FirebaseContext);

export const FireBaseProvider = (props) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });
  }, []);

  // Auth functions
  const signupUserWEmailAndPass = (email, password) =>
    createUserWithEmailAndPassword(firebaseAuth, email, password);

  const signInUserWEmailAndPass = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);

  const signupWGoogle = () => signInWithPopup(firebaseAuth, googleProvider);

  const signOutUser = () => signOut(firebaseAuth);

  // Quiz functions
  const saveQuizWithQuestions = async (title, difficulty, questions) => {
    if (!user) {
      throw new Error('Please log in to create a quiz');
    }

    try {
      // Generate unique access code
      const accessCode = await generateUniqueAccessCode();
      
      const quizData = {
        title: title,
        difficulty: difficulty,
        questions: questions,
        totalQuestions: questions.length,
        accessCode: accessCode,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        isActive: true,
        attemptCount: 0
      };

      const docRef = await addDoc(collection(firestore, "quizzes"), quizData);
      
      return {
        id: docRef.id,
        title: title,
        accessCode: accessCode,
        ...quizData
      };
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw new Error('Failed to save quiz: ' + error.message);
    }
  };

  const generateUniqueAccessCode = async () => {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let isUnique = false;
    let code;

    while (!isUnique) {
      code = generateCode();
      const existingQuiz = await findQuizByAccessCode(code);
      if (!existingQuiz) {
        isUnique = true;
      }
    }

    return code;
  };

  const findQuizByAccessCode = async (accessCode) => {
    try {
      const q = query(
        collection(firestore, "quizzes"),
        where("accessCode", "==", accessCode.toUpperCase()),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error finding quiz:', error);
      throw new Error('Failed to find quiz');
    }
  };

  const getQuizDetails = async (quizId) => {
    try {
      const quizRef = doc(firestore, "quizzes", quizId);
      const quizSnap = await getDoc(quizRef);
      
      if (quizSnap.exists()) {
        return {
          id: quizSnap.id,
          ...quizSnap.data()
        };
      } else {
        throw new Error('Quiz not found');
      }
    } catch (error) {
      console.error('Error getting quiz details:', error);
      throw error;
    }
  };

  const getUserQuizzes = async () => {
    if (!user) {
      throw new Error('Please log in to view your quizzes');
    }

    try {
      const q = query(
        collection(firestore, "quizzes"),
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const quizzes = [];
      
      querySnapshot.forEach((doc) => {
        quizzes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return quizzes;
    } catch (error) {
      console.error('Error fetching user quizzes:', error);
      throw new Error('Failed to fetch your quizzes');
    }
  };

  const listAllQuizzes = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "quizzes"));
      const quizzes = [];
      
      querySnapshot.forEach((doc) => {
        const quizData = doc.data();
        quizzes.push({
          id: doc.id,
          title: quizData.title,
          description: quizData.description,
          difficulty: quizData.difficulty,
          category: quizData.category,
          totalQuestions: quizData.totalQuestions,
          createdAt: quizData.createdAt,
          accessCode: quizData.accessCode,
          isActive: quizData.isActive
        });
      });
      
      return quizzes;
    } catch (error) {
      console.error('Error fetching all quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  };

  const updateQuiz = async (quizId, updatedData) => {
    if (!user) {
      throw new Error('Please log in to update a quiz');
    }

    try {
      console.log('Updating quiz with ID:', quizId);
      console.log('Update data:', updatedData);

      const quizRef = doc(firestore, "quizzes", quizId);
      const quizSnap = await getDoc(quizRef);
      
      if (!quizSnap.exists()) {
        throw new Error('Quiz not found');
      }

      const quizData = quizSnap.data();
      if (quizData.createdBy !== user.uid) {
        throw new Error('You can only update your own quizzes');
      }

      // Explicitly structure the update payload to ensure proper Firestore update
      const updatePayload = {
        title: updatedData.title,
        difficulty: updatedData.difficulty,
        questions: updatedData.questions || [],
        totalQuestions: updatedData.questions ? updatedData.questions.length : 0,
        updatedAt: serverTimestamp()
      };

      console.log('Final update payload:', updatePayload);

      await updateDoc(quizRef, updatePayload);
      
      console.log('Quiz updated successfully in Firestore');

      // Return the updated quiz data
      return {
        id: quizId,
        ...quizData,
        ...updatePayload,
        updatedAt: new Date() // For immediate UI update
      };

    } catch (error) {
      console.error('Error updating quiz:', error);
      throw new Error('Failed to update quiz: ' + error.message);
    }
  };

  // Add a function to verify quiz data after update (for debugging)
  const debugQuizData = async (quizId) => {
    try {
      const quizRef = doc(firestore, "quizzes", quizId);
      const quizSnap = await getDoc(quizRef);
      
      if (quizSnap.exists()) {
        const data = {
          id: quizSnap.id,
          ...quizSnap.data()
        };
        console.log('Current quiz data in Firestore:', data);
        return data;
      } else {
        console.log('Quiz not found in Firestore');
        return null;
      }
    } catch (error) {
      console.error('Error fetching quiz for debugging:', error);
      return null;
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!user) {
      throw new Error('Please log in to delete a quiz');
    }

    try {
      const quizRef = doc(firestore, "quizzes", quizId);
      const quizSnap = await getDoc(quizRef);
      
      if (!quizSnap.exists()) {
        throw new Error('Quiz not found');
      }

      const quizData = quizSnap.data();
      if (quizData.createdBy !== user.uid) {
        throw new Error('You can only delete your own quizzes');
      }

      await deleteDoc(quizRef);
      return true;

    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw new Error('Failed to delete quiz: ' + error.message);
    }
  };

  const getQuizById = async (quizId) => {
    if (!user) {
      throw new Error('Please log in to view quiz details');
    }

    try {
      const quizRef = doc(firestore, "quizzes", quizId);
      const quizSnap = await getDoc(quizRef);
      
      if (!quizSnap.exists()) {
        throw new Error('Quiz not found');
      }

      const quizData = quizSnap.data();
      
      // Check if user owns this quiz
      if (quizData.createdBy !== user.uid) {
        throw new Error('You can only view analytics for your own quizzes');
      }

      return {
        id: quizSnap.id,
        ...quizData
      };

    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw new Error('Failed to fetch quiz: ' + error.message);
    }
  };

  const getQuizAttempts = async (quizId) => {
    if (!user) {
      throw new Error('Please log in to view quiz attempts');
    }

    try {
      console.log('Fetching attempts for quiz:', quizId);

      // First verify the user owns this quiz
      const quizRef = doc(firestore, "quizzes", quizId);
      const quizSnap = await getDoc(quizRef);
      
      if (!quizSnap.exists()) {
        throw new Error('Quiz not found');
      }

      const quizData = quizSnap.data();
      if (quizData.createdBy !== user.uid) {
        throw new Error('You can only view attempts for your own quizzes');
      }

      // Fetch quiz attempts
      const attemptsQuery = query(
        collection(firestore, "quizAttempts"),
        where("quizId", "==", quizId),
        orderBy("submittedAt", "desc")
      );

      const attemptsSnapshot = await getDocs(attemptsQuery);
      const attempts = attemptsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw attempt data:', data);
        
        return {
          id: doc.id,
          ...data,
          completedAt: data.submittedAt || data.completedAt || new Date(),
          completed: data.completed !== false,
        };
      });

      console.log('Processed attempts:', attempts);
      return attempts;

    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      throw new Error('Failed to fetch quiz attempts: ' + error.message);
    }
  };

  const saveQuizAttempt = async (attemptData) => {
    try {
      const attemptWithTimestamp = {
        ...attemptData,
        submittedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        completed: true
      };

      // Save the attempt
      const docRef = await addDoc(collection(firestore, "quizAttempts"), attemptWithTimestamp);
      
      // Update the quiz's attempt count
      const quizRef = doc(firestore, "quizzes", attemptData.quizId);
      await updateDoc(quizRef, {
        attemptCount: increment(1),
        lastAttemptAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      throw new Error('Failed to save quiz attempt: ' + error.message);
    }
  };

  // Add hello world function as requested
  const helloWorld = () => {
    console.log("Hello World from Firebase!");
    return "Hello World from Firebase!";
  };

  const value = {
    // Auth functions
    signupUserWEmailAndPass,
    signupWGoogle,
    signInUserWEmailAndPass,
    signOutUser,
    user,
    
    // Quiz functions
    saveQuizWithQuestions,
    generateUniqueAccessCode,
    findQuizByAccessCode,
    getQuizDetails,
    getUserQuizzes,
    listAllQuizzes,
    updateQuiz,
    deleteQuiz,
    getQuizById,
    debugQuizData, // Add for debugging
    
    // Quiz attempt functions
    saveQuizAttempt,
    getQuizAttempts,
    
    // Hello world function
    helloWorld,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {props.children}
    </FirebaseContext.Provider>
  );
};
