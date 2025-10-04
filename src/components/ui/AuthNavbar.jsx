import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../../context/Firebase";

const AuthNavbar = () => {
  const { user, signOutUser } = useFirebase();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOutUser();
    navigate("/");
  };

  return (
    <div className="bg-background font-belfast h-16 md:h-21 w-full fixed top-0 left-0 text-black flex items-center justify-between z-50 px-4 md:px-8 lg:px-16 xl:px-40 shadow-xl backdrop-blur-sm">
      {/* Left side - Logo/Brand */}
      <div className="flex items-center">
        <Link
          to="/home"
          className="text-lg md:text-xl font-bold hover:text-amber-400 transition-colors"
        >
          Quiz Dashboard
        </Link>
      </div>

      {/* Center - Navigation Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        <Link
          to="/home"
          className="text-sm md:text-base hover:text-amber-400 cursor-pointer transition-colors"
        >
          HOME
        </Link>
        <Link
          to="/createquiz"
          className="text-sm md:text-base hover:text-amber-400 cursor-pointer transition-colors"
        >
          CREATE QUIZ
        </Link>
        <Link
          to="/myquizzes"
          className="text-sm md:text-base hover:text-amber-400 cursor-pointer transition-colors"
        >
          MY QUIZZES
        </Link>
      </div>

      {/* Right side - User Info & Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => {
              const menu = document.getElementById('mobile-menu');
              menu.classList.toggle('hidden');
            }}
            className="text-black hover:text-amber-400 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-gray-500 hover:bg-black text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu (Hidden by default) */}
      <div
        id="mobile-menu"
        className="hidden md:hidden absolute top-16 md:top-20 left-0 right-0 bg-white border-b shadow-lg"
      >
        <div className="px-4 py-2 space-y-2">
          <Link
            to="/home"
            className="block py-2 px-3 text-sm hover:bg-gray-100 rounded"
            onClick={() => document.getElementById('mobile-menu').classList.add('hidden')}
          >
            🏠 Home
          </Link>
          <Link
            to="/createquiz"
            className="block py-2 px-3 text-sm hover:bg-gray-100 rounded"
            onClick={() => document.getElementById('mobile-menu').classList.add('hidden')}
          >
            ➕ Create Quiz
          </Link>
          <Link
            to="/myquizzes"
            className="block py-2 px-3 text-sm hover:bg-gray-100 rounded"
            onClick={() => document.getElementById('mobile-menu').classList.add('hidden')}
          >
            📚 My Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthNavbar;