import React, { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ErrorMessage } from "./";
import { motion } from "framer-motion";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [errorVisible, setErrorVisible] = useState(
    searchParams.get("error") ? true : false
  );
  const navigate = useNavigate();

  const loginWithGithub = async () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/github`, "_self");
  };

  const loginWithGoogle = async () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/google`, "_self");
  };

  const closeError = () => {
    setErrorVisible(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient ring for intrigue */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[500px] h-[500px] rounded-full border-4 border-red-500/20 animate-spin-slow"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-12 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700"
      >
        <header className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            Sudoku Arena
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Sign in to compete with other users in real-time Sudoku games.
          </p>
        </header>

        {searchParams.get("error") === "github-oauth-failed" && (
          <ErrorMessage
            visible={errorVisible}
            message={
              "Failed to login using Github. Try making your Email public on Github or login using another method."
            }
            onClose={closeError}
          />
        )}
        {searchParams.get("error") === "google-oauth-failed" && (
          <ErrorMessage
            visible={errorVisible}
            message={"Failed to login using Google. Try again later."}
            onClose={closeError}
          />
        )}

        <main className="flex flex-col gap-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            onClick={loginWithGithub}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400/30 transition-shadow shadow-sm"
            aria-label="Login with GitHub"
          >
            <FaGithub size={18} />
            <span className="font-medium">Continue with GitHub</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400/30 transition-shadow shadow-sm"
            aria-label="Login with Google"
          >
            <FaGoogle size={18} />
            <span className="font-medium">Continue with Google</span>
          </motion.button>
        </main>
      </motion.div>
    </div>
  );
}
