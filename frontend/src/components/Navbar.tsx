import { FaCircleUser } from "react-icons/fa6";
import { FaUserFriends, FaBars, FaTimes } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { RiLogoutBoxRLine } from "react-icons/ri";
import ErrorMessage from "./ErrorMessage";

const Navbar = () => {
	const navigate = useNavigate();
	const [noOfFriendRequests, setNoOfFriendRequests] = useState(0);
	const [menuOpen, setMenuOpen] = useState(false);
	const location = useLocation();
	const [showErrorMessage, setShowErrorMessage] = useState(false);

	const logout = async () => {
		try {
			const response = await axios.put(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {withCredentials: true})
			if(response){
				navigate("/login");
			}
		} catch (error) {
			setShowErrorMessage(true)
		}
	}
	useEffect(() => {
		(async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_API_URL}/user/get-friend-requests`,
					{ withCredentials: true }
				);
				if (response) {
					setNoOfFriendRequests(
						response.data.data.friendRequests.length
					);
				}
			} catch (err) {
				console.error(err);
			}
		})();
	}, []);

	const navLinks = [
		{ name: "Home", path: "/" },
		{ name: "Leaderboard", path: "/leaderboard" },
	];

	return (
		<nav className="bg-gray-900 bg-opacity-80 backdrop-blur-md py-4 shadow-lg w-full z-50">
			<ErrorMessage message="Logout Failed" visible={showErrorMessage} onClose={() => setShowErrorMessage(false)}/>
			<div className="container mx-auto flex justify-between items-center px-6">
				{/* Logo */}
				
				<motion.h1
					className="text-4xl font-bold tracking-wide text-red-500 cursor-pointer"
					style={{ fontFamily: "'Bebas Neue', sans-serif" }}
					onClick={() => navigate("/")}
				>
					SUDOKU <span className="text-white">ARENA</span>
				</motion.h1>

				{/* Desktop Links */}
				<div className="md:hidden flex space-x-6 text-lg items-center">
					{navLinks.map((link) => (
						<NavLink
							key={link.name}
							to={link.path}
							className={({ isActive }) =>
								`transition-colors duration-300 hover:text-red-500 ${
									isActive ? "text-red-500" : "text-gray-300"
								}`
							}
						>
							{link.name}
						</NavLink>
					))}

					{/* Friend Requests */}
					<motion.div
						className="relative text-white hover:text-red-500 cursor-pointer"
						onClick={() =>
							navigate("/friend-requests", {
								state: { from: location.pathname },
							})
						}
						whileHover={{ scale: 1.1 }}
					>
						<FaUserFriends size={28} />
						{noOfFriendRequests > 0 && (
							<div className="absolute -top-1 -right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
								{noOfFriendRequests}
							</div>
						)}
					</motion.div>

					{/* Profile */}
					<motion.div
						className="text-white hover:text-red-500 cursor-pointer"
						onClick={() =>
							navigate("/profile", {
								state: { from: location.pathname },
							})
						}
						whileHover={{ scale: 1.1 }}
					>
						<FaCircleUser size={28} />
					</motion.div>

					<motion.div
						className="text-white hover:text-red-500 cursor-pointer"
						onClick={logout}
						whileHover={{ scale: 1.1 }}
					>
						<RiLogoutBoxRLine size={28} />
					</motion.div>
				</div>

				{/* Mobile Menu Toggle */}
				<div
					className="hidden md:block text-white cursor-pointer"
					onClick={() => setMenuOpen(!menuOpen)}
				>
					{menuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
				</div>
			</div>

			{/* Mobile Menu */}
			{menuOpen && (
				<motion.div
					initial={{ maxHeight: 0, opacity: 0 }}
					animate={{ maxHeight: 500, opacity: 1 }}
					exit={{ maxHeight: 0, opacity: 0 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
					style={{ overflow: "hidden" }}
					className="hidden md:flex flex-col items-center bg-gray-900 pb-4 space-y-4"
				>
					{navLinks.map((link) => (
						<NavLink
							key={link.name}
							to={link.path}
							onClick={() => setMenuOpen(false)}
							className={({ isActive }) =>
								`transition-colors duration-300 hover:text-red-500 ${
									isActive ? "text-red-500" : "text-gray-300"
								}`
							}
						>
							{link.name}
						</NavLink>
					))}

					{/* Friend Requests */}
					<div
						className="relative text-white hover:text-red-500 cursor-pointer"
						onClick={() => {
							navigate("/friend-requests", {
								state: { from: location.pathname },
							});
							setMenuOpen(false);
						}}
					>
						Friend Requests
						{noOfFriendRequests > 0 && (
							<div className="absolute -top-1 -right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
								{noOfFriendRequests}
							</div>
						)}
					</div>

					{/* Profile */}
					<div
						className="text-white hover:text-red-500 cursor-pointer"
						onClick={() => {
							navigate("/profile", {
								state: { from: location.pathname },
							});
							setMenuOpen(false);
						}}
					>
						Profile
					</div>

					<div
						className="text-white hover:text-red-500 cursor-pointer"
						onClick={logout}
					>
						Logout
					</div>
				</motion.div>
			)}
		</nav>
	);
};

export default Navbar;
