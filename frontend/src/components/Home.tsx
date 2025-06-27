import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { FaCircleUser } from "react-icons/fa6";

export default function Home() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch();

	useEffect(() => {
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
				setLoading(false);
			} else {
				navigate("/login");
			}
		})();
	}, []);

	const startGame = () => {
		navigate("/game", { state: { from: "/" } });
	};

	return loading ? (
		<p>Loading... </p>
	) : (
		<div className="min-h-screen mx-5 text-white my-4">
			<div className="grid grid-cols-3 gap-10 min-h-full">
				<div className="rounded-md min-h-full flex justify-center items-center">
					No Active Games
				</div>
				<div className="flex flex-col items-center justify-center">
					<button
						className="bg-red-500 hover:bg-red-600 flex justify-center items-center rounded px-4 p-2 w-full"
						onClick={startGame}
					>
						New Game
					</button>
					<div className="mt-10">
						<div className="flex justify-between animate-slide-in">
							<FaCircleUser/>
							<FaCircleUser/>
						</div>
					</div>
				</div>
				<div className="border rounded-md min-h-full flex justify-center items-center">
					News to Share
				</div>
			</div>
		</div>
	);
}
