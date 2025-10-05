import React from "react";
import { Link } from "react-router-dom";
import { ShinyButton } from "@/components/ui/shiny-button";

const LandingNavbar = () => {
  return (
    <>
      <div className="bg-background font-belfast h-16 md:h-20 w-full fixed top-0 left-0 text-black flex items-center justify-between z-50 px-4 md:px-8 lg:px-16 xl:px-40 shadow-xl backdrop-blur-sm">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
            />
          </svg>
          <Link
            to="/"
            className="text-lg md:text-xl font-bold hover:text-amber-400 transition-colors font-belfast"
          >
            QUIZFORGE
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 md:gap-6 lg:gap-10 items-center font-belfast">
          <Link
            to="/"
            className="text-sm md:text-base hover:text-amber-400 cursor-pointer transition-colors font-belfast"
          >HOME
          </Link>
          <Link
            to="/takequiz"
            className="text-sm md:text-base hover:text-amber-400 cursor-pointer transition-colors font-belfast"
          >
            TAKE QUIZ
          </Link>
          <Link
            to="/login"
            className="text-sm md:text-base hover:text-amber-400 cursor-pointer transition-colors font-belfast"
          >
            LOGIN
          </Link>
          <Link to="/signup">
            <ShinyButton className="text-sm md:text-base font-belfast">
              SIGNUP
            </ShinyButton>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => {
              const menu = document.getElementById("landing-mobile-menu");
              menu.classList.toggle("hidden");
            }}
            className="text-black hover:text-amber-400 focus:outline-none transition-colors"
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
      </div>

      {/* Mobile Menu (Hidden by default) */}
      <div
        id="landing-mobile-menu"
        className="hidden md:hidden fixed top-16 md:top-20 left-0 right-0 bg-white/95 backdrop-blur-sm border-b shadow-lg z-40"
      >
        <div className="px-4 py-3 space-y-2 font-belfast">
          <Link
            to="/"
            className="block py-3 px-3 text-sm font-medium hover:bg-gray-100 rounded transition-colors font-belfast"
            onClick={() =>
              document.getElementById("landing-mobile-menu").classList.add("hidden")
            }
          >
            HOME
          </Link>
          <Link
            to="/takequiz"
            className="block py-3 px-3 text-sm font-medium hover:bg-gray-100 rounded transition-colors font-belfast"
            onClick={() =>
              document.getElementById("landing-mobile-menu").classList.add("hidden")
            }
          >
            TAKE QUIZ
          </Link>
          <Link
            to="/login"
            className="block py-3 px-3 text-sm font-medium hover:bg-gray-100 rounded transition-colors font-belfast"
            onClick={() =>
              document.getElementById("landing-mobile-menu").classList.add("hidden")
            }
          >
            LOGIN
          </Link>
          <div className="py-2 px-3">
            <Link 
              to="/signup"
              onClick={() =>
                document.getElementById("landing-mobile-menu").classList.add("hidden")
              }
            >
              <ShinyButton className="text-sm font-belfast w-full">
                SIGNUP
              </ShinyButton>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingNavbar;
