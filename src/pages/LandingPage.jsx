import React from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";
import { SparklesText } from "@/components/ui/sparkles-text";
import FeatureCard from "../components/ui/FeatureCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import LandingNavbar from "../components/ui/LandingNavbar";
import {
  PlusCircleIcon,
  PlayIcon,
  ChartBarIcon,
  LightBulbIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const LandingPage = () => {
  const features = [
    {
      icon: <LightBulbIcon className="h-8 w-8 text-black" />,
      title: "AI-Generated Questions",
      description:
        "Simply provide a topic or prompt, and our AI creates comprehensive quiz questions with multiple choice answers.",
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-black" />,
      title: "Create Quiz Manually",
      description:
        "Along with AI-generated questions, you can also create quizzes manually to customize them to your needs.",
    },
    {
      icon: <ClockIcon className="h-8 w-8 text-black" />,
      title: "Timed Quiz Sessions",
      description:
        "Set time limits for each quiz session to create a more dynamic and engaging testing environment.",
    },
    {
      icon: <ChartBarIcon className="h-8 w-8 text-black" />,
      title: "Performance Analytics",
      description:
        "Gain insights into quiz performance with detailed analytics and reporting useful features.",
    },
    {
      icon: <PlusCircleIcon className="h-8 w-8 text-black" />,
      title: "Easy Quiz Creation",
      description:
        "Create quizzes effortlessly with our user-friendly interface and intuitive design, also you can edit your quizzes anytime.",
    },
    {
      icon: <PlayIcon className="h-8 w-8 text-black" />,
      title: "Interactive Learning",
      description:
        "Engage learners with interactive quizzes that adapt to their knowledge level, skillset and understanding.",
    },
  ];

  return (
    <div className="flex-row">
      {/* Use the LandingNavbar component */}
      <LandingNavbar />

      <div>
        {/* Hero Section with enhanced motion animations */}
        <motion.section
          id="home"
          className="min-h-screen relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            className="bg-background relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg border pt-20 md:pt-24"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            >
              <DotPattern
                className={cn(
                  "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
                  "absolute inset-0 z-[-1]"
                )}
              />
            </motion.div>

            <motion.div
              className="flex flex-col relative z-20 max-w-5xl mx-auto px-4"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <motion.div
                className="flex flex-wrap justify-center items-center mb-6 md:mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: "backOut" }}
              >
                <SparklesText className="font-belfast font-normal">
                  <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-belfast">
                    AI&nbsp;
                  </span>
                </SparklesText>
                <motion.h1
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-belfast"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                >
                  Quiz Builder
                </motion.h1>
              </motion.div>

              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed font-extended text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
              >
                Create engaging quizzes instantly with AI. Just provide a prompt
                & get comprehensive quiz questions. Perfect for students.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex w-full max-w-md mx-auto flex-col gap-4 sm:max-w-2xl sm:flex-row sm:justify-center sm:gap-6 relative z-20 px-4"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 1.3,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <div className="flex flex-col sm:flex-row justify-center items-center relative gap-3 sm:gap-4 md:gap-6 w-full">
                <motion.div
                  className="w-full sm:w-auto"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link to="/login">
                    <ShimmerButton className="font-extended w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg whitespace-nowrap">
                      Create an interesting Quiz
                    </ShimmerButton>
                  </Link>
                </motion.div>
                <motion.div
                  className="w-full sm:w-auto"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link to="/takequiz">
                    <InteractiveHoverButton className="font-extended w-full sm:w-auto border-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg whitespace-nowrap">
                      Take a Quiz
                    </InteractiveHoverButton>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Features section with proper padding */}
        <section
          id="features"
          className="min-h-screen pt-20 md:pt-24 flex justify-center items-center text-center px-4 flex-col"
        >
          <div className="container mx-auto">
            <BlurFade delay={0.25} inView>
              <h2 className="text-3xl md:text-5xl font-belfast mb-12">
                Powerful Features
              </h2>
            </BlurFade>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <BlurFade key={index} delay={0.25 * 2} inView>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        <section className="2ndlast">
          <motion.div
            className="pt-12 pb-24 bg-gray-50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <motion.h2
                  className="text-3xl md:text-4xl font-semibold text-black mb-4 font-belfast"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Simple 3-Step Process
                </motion.h2>
                <motion.p
                  className="text-xl text-gray-600 font-extended"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Create and share quizzes in three simple steps
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 font-extended">
                {[
                  {
                    number: 1,
                    title: "Create Your Quiz",
                    description:
                      "Sign up and provide a topic or prompt. Our AI will generate comprehensive quiz questions for you.",
                  },
                  {
                    number: 2,
                    title: "Share Access Code",
                    description:
                      "Get a unique access code for your quiz and share it with participants. No registration needed for them.",
                  },
                  {
                    number: 3,
                    title: "Analyze Results",
                    description:
                      "View detailed analytics, track participant performance, and see question-wise statistics.",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                      viewport={{ once: true }}
                    >
                      {step.number}
                    </motion.div>
                    <h3 className="text-2xl font-belfast mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
        
        <section className="last">
          <motion.div
            className="py-20 bg-black"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 font-belfast">
              <motion.h2
                className="text-3xl md:text-4xl font-semibold text-white mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Start Your Quiz Journey Today
              </motion.h2>
              <motion.p
                className="text-xl text-blue-100 mb-8 font-extended"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Perfect for educators, trainers, and content creators looking to
                engage their audience.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className="bg-white text-black px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors shadow-lg inline-block font-belfast"
                >
                  Get Started Free
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};
