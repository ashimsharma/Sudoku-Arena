import { FaCircleUser } from "react-icons/fa6";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

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
					<div className="items-center justify-center inline-flex text-white hover:text-red-500 h-full cursor-pointer" onClick={() => navigate("/profile")}>
						<FaCircleUser size={35} />
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
