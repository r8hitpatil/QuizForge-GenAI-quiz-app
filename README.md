# QuizForge - AI-Powered Quiz Application

A modern web application that allows users to create AI-generated quizzes and share them with others using access codes. Built with React, Firebase, and integrated AI capabilities.

## 🚀 Features

- **AI-Generated Quizzes**: Create comprehensive quiz questions using AI with just a topic or prompt
- **Manual Quiz Creation**: Create custom quizzes manually for full control
- **Access Code System**: Share quizzes easily with unique 6-character codes
- **Real-time Analytics**: Track quiz performance and participant statistics
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Anonymous Participation**: Users can take quizzes without registration
- **Timed Sessions**: Set time limits for quiz completion
- **Interactive UI**: Modern animations and smooth user experience

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Authentication)
- **AI Integration**: Google Gemini AI
- **UI Components**: Custom components with shadcn/ui
- **Icons**: Heroicons, Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **State Management**: React Context + TanStack Query
- **Animations**: Framer Motion

## 📁 Project Structure

```
Firebase Gen AI app/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── EditQuiz.jsx
│   │   └── ui/
│   ├── pages/
│   │   ├── AnalyticsPage.jsx
│   │   ├── CreateQuizAI.jsx
│   │   ├── Home.jsx
│   │   ├── LandingPage.jsx
│   │   ├── MyQuizzes.jsx
│   │   ├── TakeQuiz.jsx
│   │   └── Auth/
│   │       ├── Login.jsx
│   │       └── Signup.jsx
│   ├── context/
│   │   └── Firebase.jsx
│   ├── hooks/
│   │   └── useEditQuiz.js
│   ├── lib/
│   │   └── utils.js
│   ├── services/
│   │   └── quizService.js
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.local
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase account
- Google Cloud Console account (for Gemini AI)

```
quizzes/
├── {quizId}/
│   ├── title: string
│   ├── description: string
│   ├── accessCode: string (6 characters)
│   ├── createdBy: string (user ID)
│   ├── createdAt: timestamp
│   ├── isActive: boolean
│   ├── timeLimit: number (minutes)
│   ├── difficulty: string
│   ├── category: string
│   └── questions: array[
│       ├── question: string
│       ├── options: array[string]
│       ├── correctAnswer: number (index)
│       └── explanation: string (optional)
│   ]

quiz_attempts/
├── {attemptId}/
│   ├── quizId: string
│   ├── participantName: string
│   ├── participantId: string (optional)
│   ├── answers: array[number]
│   ├── score: number
│   ├── totalQuestions: number
│   ├── completedAt: timestamp
│   ├── timeSpent: number (seconds)
│   └── accessCode: string

users/
├── {userId}/
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string (optional)
│   ├── createdAt: timestamp
│   └── quizzesCreated: array[string]
```

## 🎯 Key Components Overview

### Core Pages

1. **LandingPage** (`src/pages/LandingPage.jsx`)
   - Hero section with animated text
   - Feature showcase cards
   - Call-to-action buttons
   - Responsive design with dot patterns

2. **Home Dashboard** (`src/pages/Home.jsx`)
   - User statistics overview
   - Quick action buttons
   - Recent quiz activity
   - Responsive grid layout

3. **CreateQuizAI** (`src/pages/CreateQuizAI.jsx`)
   - AI-powered quiz generation form
   - Topic input and difficulty selection
   - Real-time quiz preview
   - Integration with Gemini AI service

4. **TakeQuiz** (`src/pages/TakeQuiz.jsx`)
   - Access code validation
   - Question navigation system
   - Progress tracking
   - Anonymous participation support

5. **AnalyticsPage** (`src/pages/AnalyticsPage.jsx`)
   - Comprehensive quiz statistics
   - Participant performance analysis
   - Question-wise breakdown
   - Export capabilities

6. **MyQuizzes** (`src/pages/MyQuizzes.jsx`)
   - Quiz management interface
   - Edit/Delete functionality
   - Quick sharing options
   - Analytics access

### Authentication System

- **Login** (`src/pages/Auth/Login.jsx`)
  - Email/password authentication
  - Google Sign-in integration
  - Password reset functionality
  - Responsive form design

- **Signup** (`src/pages/Auth/Signup.jsx`)
  - User registration form
  - Email verification
  - Profile setup
  - Terms acceptance

### AI Generation Flow

1. User inputs topic and preferences
2. System constructs optimized prompt
3. Gemini AI generates structured questions
4. Response validation and formatting
5. Quiz creation and storage in Firestore

## 🚀 Deployment Guide

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```


#### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy to Firebase
firebase deploy
```