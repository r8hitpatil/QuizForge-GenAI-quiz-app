import React, { useEffect, useState } from "react";
import { useFirebase } from "../../context/Firebase";
import { Link, useNavigate } from "react-router-dom";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import LandingNavbar from "@/components/ui/LandingNavbar";
import NavbarSpacer from "@/components/ui/NavbarSpacer";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signupUserWEmailAndPass, signupWGoogle, user } = useFirebase();
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      nav("/Home");
    }
  }, [user, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await signupUserWEmailAndPass(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <LandingNavbar />
      <NavbarSpacer />
      <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] px-3 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-3 w-full max-w-[500px] mx-auto">
        <BlurFade delay={0.25} inView>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-belfast pb-3 sm:pb-4 text-center">
            Sign Up
          </h1>
        </BlurFade>

        <BlurFade delay={0.5} inView>
          <MagicCard
            gradientColor="#D9D9D955"
            className="p-4 sm:p-6 lg:p-8 rounded-2xl font-belfast w-full"
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email */}
              <BlurFade delay={0.75} inView>
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 text-center">
                    Enter Email Address
                  </h2>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full max-w-xs sm:max-w-sm mx-auto block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-center font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 font-belfast"
                    required
                  />
                </div>
              </BlurFade>

              {/* Password */}
              <BlurFade delay={1.0} inView>
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 text-center">
                    Create a Password
                  </h2>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full max-w-xs sm:max-w-sm mx-auto block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-center font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 font-belfast"
                    minLength={6}
                    required
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center">
                    Minimum 6 characters
                  </p>
                </div>
              </BlurFade>

              {/* Error */}
              {error && (
                <BlurFade delay={1.25} inView>
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm max-w-xs sm:max-w-sm mx-auto text-center">
                    {error}
                  </div>
                </BlurFade>
              )}

              {/* Buttons */}
              <BlurFade delay={1.5} inView>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1">
                  <RainbowButton
                    type="submit"
                    size="lg"
                    className="w-full sm:w-1/2 flex items-center justify-center"
                  >
                    <span className="text-sm sm:text-base font-medium">
                      Sign Up
                    </span>
                  </RainbowButton>
                  <RainbowButton
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-1/2 flex items-center justify-center"
                    onClick={signupWGoogle}
                  >
                    <span className="text-sm sm:text-base font-medium">
                      Google Signup
                    </span>
                  </RainbowButton>
                </div>
              </BlurFade>
            </form>

            {/* Divider and actions */}
            <BlurFade delay={1.75} inView>
              <div className="mt-4 sm:mt-5 pt-0">
                <div className="relative flex items-center justify-center my-3 sm:my-4">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="px-3 sm:px-4 text-sm sm:text-base text-gray-600 bg-white font-medium">
                    or
                  </span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>

                <div className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-4">
                  <Link to="/login" className="w-full">
                    <ShinyButton
                      type="button"
                      className="w-full max-w-sm mx-auto block border border-gray-400 rounded-lg py-2 sm:py-3 text-sm sm:text-base font-medium hover:border-gray-600 transition-colors"
                    >
                      Already have an account? Login
                    </ShinyButton>
                  </Link>
                  <Link to="/takequiz" className="w-full">
                    <ShimmerButton className="w-full max-w-sm mx-auto block text-sm sm:text-base">
                      Take Quiz (No Login Required)
                    </ShimmerButton>
                  </Link>
                </div>
              </div>
            </BlurFade>
          </MagicCard>
        </BlurFade>
      </div>
    </>
  );
};

export default Signup;