import { FaCircleUser } from "react-icons/fa6";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

const Navbar = () => {
	const navigate = useNavigate();
	const [noOfFriendRequests, setNoOfFriendRequests] = useState(0);

	useEffect(() => {
		(async () => {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/user/get-friend-requests`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				setNoOfFriendRequests(response.data.data.friendRequests.length);
			}
		})();
	}, []);

	useEffect(() => {

	}, []);

	return (
		<nav className="bg-gray-900 py-6 shadow-lg">
			<div className="container mx-auto flex justify-between items-center px-6">
				<h1
					className="text-5xl font-bold tracking-wide text-red-500"
					style={{ fontFamily: "'Bebas Neue', sans-serif" }}
				>
					SUDOKU <span className="text-white">ARENA</span>
				</h1>
				<div className="space-x-4 text-lg flex">
					<div className="flex items-center">
						<NavLink
							to="/"
							className={({ isActive }) =>
								`hover:text-red-500 ${
									isActive ? "text-red-500" : "text-gray-300"
								}`
							}
						>
							Home
						</NavLink>
					</div>

					<div className="flex items-center">
						<NavLink
							to="/leaderboard"
							className={({ isActive }) =>
								`hover:text-red-500 ${
									isActive ? "text-red-500" : "text-gray-300"
								}`
							}
						>
							Leaderboard
						</NavLink>
					</div>
					<div
						className="items-center justify-center inline-flex text-white hover:text-red-500 h-full cursor-pointer relative"
						onClick={() => navigate("/friend-requests")}
					>
						<FaUserFriends size={35} />
						{noOfFriendRequests !== 0 && (
							<div className="absolute -top-1 -right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
								{noOfFriendRequests}
							</div>
						)}
					</div>
					<div
						className="items-center justify-center inline-flex text-white hover:text-red-500 h-full cursor-pointer"
						onClick={() => navigate("/profile")}
					>
						<FaCircleUser size={35} />
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
