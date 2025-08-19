import React, { useEffect, useRef, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ErrorMessage } from "./";
import { motion } from "framer-motion";
import { FaCircleUser } from "react-icons/fa6";
import { MdElectricBolt } from "react-icons/md";

export default function Login() {
	const [searchParams] = useSearchParams();
	const [errorVisible, setErrorVisible] = useState(
		searchParams.get("error") ? true : false
	);
	const navigate = useNavigate();
	const [animationComplete, setAnimationComplete] = useState(false);
	const [displayLogo, setDisplayLogo] = useState(false);

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

	const parentRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});

	useEffect(() => {
		if (!parentRef.current) return;

		// Set initial size
		const { width, height } = parentRef.current.getBoundingClientRect();
		setSize({ width, height });

		// Watch for resize
		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const { width, height } = entry.contentRect;
				setSize({ width, height });
			}
		});
		observer.observe(parentRef.current);

		return () => observer.disconnect();
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center relative overflow-hidden">
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
				className={`absolute top-3 z-10 w-full max-w-md p-8 sm:p-12 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex justify-between gap-10 max-h-24 items-center ${
					displayLogo && "!justify-center !flex-col gap-0"
				}`}
				ref={parentRef}
			>
				{displayLogo ? (
					<div className="flex-col items-center justify-center">
						<motion.h1
							className="text-4xl font-bold tracking-wide text-red-500 cursor-pointer text-center"
							initial={{ scale: 1.3, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.7, delay: 0.2 }}
							style={{ fontFamily: "'Bebas Neue', sans-serif" }}
						>
							SUDOKU <span className="text-white">ARENA</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, scale: 1.3 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: 1 }}
							style={{ fontFamily: "'Bebas Neue', sans-serif" }}
							className="text-gray-200"
						>
							Compete with millions of players around the world!!
						</motion.p>
					</div>
				) : (
					<>
						<motion.span
							initial={{ x: 0 }}
							animate={{ x: size.width / 2 - 45.5 }}
							transition={{ duration: 1.5, delay: 0.4 }}
							onAnimationComplete={() =>
								setAnimationComplete(true)
							}
						>
							<FaCircleUser size={45} color="gray" />
						</motion.span>

						{animationComplete ? (
							<motion.div
								className="text-gray-200 flex items-center z-10"
								initial={{ scale: 1.5, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.9, delay: 0.3 }}
								onAnimationComplete={() => setDisplayLogo(true)}
							>
								<MdElectricBolt
									color="yellow"
									size={50}
									className="z-10"
								/>
							</motion.div>
						) : (
							<div className="text-gray-200">VS</div>
						)}

						<motion.span
							initial={{ x: 0 }}
							animate={{ x: -(size.width / 2) + 45.5 }}
							transition={{ duration: 1.5, delay: 0.4 }}
							onAnimationComplete={() =>
								setAnimationComplete(true)
							}
						>
							<FaCircleUser size={45} color="gray" />
						</motion.span>
					</>
				)}
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 18, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.45 }}
				className="relative z-10 w-full max-w-md p-8 sm:p-12 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700"
			>
				<header className="mb-6 text-center">
					<p className="mt-2 text-sm text-gray-300">
						Sign in to compete with other users in real-time Sudoku
						games.
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
						message={
							"Failed to login using Google. Try again later."
						}
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
						<span className="font-medium">
							Continue with GitHub
						</span>
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.99 }}
						onClick={loginWithGoogle}
						className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400/30 transition-shadow shadow-sm"
						aria-label="Login with Google"
					>
						<FaGoogle size={18} />
						<span className="font-medium">
							Continue with Google
						</span>
					</motion.button>
				</main>
			</motion.div>
		</div>
	);
}
