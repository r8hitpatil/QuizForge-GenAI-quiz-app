import React from "react";
import { Link } from "react-router-dom";
import { ShinyButton } from "@/components/ui/shiny-button";

const LandingNavbar = () => {
  return (
    <div className="bg-background font-belfast h-16 md:h-20 w-full fixed top-0 left-0 text-black flex items-center justify-between z-50 px-4 md:px-8 lg:px-16 xl:px-40 shadow-xl backdrop-blur-sm">
      <ul className="flex">
        <li>
          <Link
            to="/"
            className="text-sm md:text-base hover:text-amber-400"
          >
            HOME
          </Link>
        </li>
      </ul>
      <ul className="flex gap-4 md:gap-6 lg:gap-10 items-center">
        <li>
          <Link
            to="/takequiz"
            className="text-sm md:text-base hover:text-amber-400 cursor-pointer"
          >
            TAKE QUIZ
          </Link>
        </li>
        <li>
          <Link
            to="/login"
            className="text-sm md:text-base hover:text-amber-400 cursor-pointer"
          >
            LOGIN
          </Link>
        </li>
        <li className="flex items-center">
          <Link to="/signup">
            <ShinyButton className="text-sm md:text-base font-belfast">
              SIGNUP
            </ShinyButton>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default LandingNavbar;