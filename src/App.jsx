import React from 'react'
import Signup from './pages/Auth/Signup'
import { BrowserRouter, Route , Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import CreateQuizAI from './pages/CreateQuizAI'
import TakeQuiz from './pages/TakeQuiz'
import {LandingPage} from './pages/LandingPage'
import MyQuizzes from './pages/MyQuizzes'
import Analytics from './pages/AnalyticsPage'

const App = () => {

  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route>
          <Route path='/signup' element={<Signup/>}/>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/home' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/createquiz' element={<CreateQuizAI/>} />
          <Route path='/takequiz' element={<TakeQuiz/>} />
          <Route path='/myquizzes' element={<MyQuizzes/>} />
          <Route path="/analytics/:quizId" element={<Analytics />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App