import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../../context/Firebase";

const AuthNavbar = () => {
  const { user, signOutUser } = useFirebase();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    signOutUser();
    navigate("/");
    setShowLogoutConfirm(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <div className="bg-background font-belfast h-16 md:h-21 w-full fixed top-0 left-0 text-black flex items-center justify-between z-50 px-4 md:px-8 lg:px-16 xl:px-40 shadow-xl backdrop-blur-sm">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
            />
          </svg>
          <Link
            to="/home"
            className="text-lg md:text-xl font-bold hover:text-amber-400 transition-colors"
          >
            QUIZFORGE
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
                const menu = document.getElementById("mobile-menu");
                menu.classList.toggle("hidden");
              }}
              className="text-black hover:text-amber-400 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="bg-black hover:bg-red-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
          >
            LOGOUT
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
              onClick={() =>
                document.getElementById("mobile-menu").classList.add("hidden")
              }
            >
              HOME
            </Link>
            <Link
              to="/createquiz"
              className="block py-2 px-3 text-sm hover:bg-gray-100 rounded"
              onClick={() =>
                document.getElementById("mobile-menu").classList.add("hidden")
              }
            >
              CREATE QUIZ
            </Link>
            <Link
              to="/myquizzes"
              className="block py-2 px-3 text-sm hover:bg-gray-100 rounded"
              onClick={() =>
                document.getElementById("mobile-menu").classList.add("hidden")
              }
            >
              MY QUIZZES
            </Link>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-[100] transition-all duration-300 ease-in-out font-belfast">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 max-w-sm mx-4 shadow-2xl border border-white/30 transform transition-all duration-300 ease-out scale-100 animate-in fade-in-0 zoom-in-95">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-600 mb-6 font-extended">
                Are you sure you want to logout? You will need to sign in again
                to access your account.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200/80 hover:bg-gray-300/80 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600/90 hover:bg-red-700/90 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthNavbar;
