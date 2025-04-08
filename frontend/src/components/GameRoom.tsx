import { useEffect, useState } from "react";
import { getSocket } from "../config/socket.config";
import { FiCopy } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const GameRoom = () => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const gameId = useSelector((state: any) => state.game).gameId;
	const me = useSelector((state: any) => state.game).me;
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (location.state === null || location.state?.from !== "/game") {
			navigate("/");
			return;
		}

		setSocket(getSocket());
	}, []);

	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(gameId);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return !socket ? (
		<p>Loading...</p>
	) : (
		<div className="bg-gray-800 text-white">
            <h1 className="p-4 text-center text-3xl font-bold text-red-500">{me.name}'s GAME ROOM</h1>
			<div className="mt-4">
				<div className="bg-gray-900 p-4 rounded-2xl flex items-center space-x-2 shadow-md w-1/3 mx-auto">
					<input
						type="text"
						value={gameId}
						readOnly
						className="bg-gray-800 text-white px-4 py-2 rounded-xl w-full focus:outline-none cursor-default"
					/>
					<button
						onClick={handleCopy}
						className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl transition flex items-center"
					>
						<FiCopy className="w-4 h-4 mr-1" />
						{copied ? "Copied!" : "Copy"}
					</button>
				</div>
                <p className="text-center p-1 text-gray-300">
					*Use this GameId to invite your friends
				</p>
			</div>

			<div className="bg-gray-900 grid grid-cols-5 w-1/2 m-4 mx-auto p-4 rounded-2xl">
				<div className="col-span-2 flex flex-col justify-center items-center bg-gray-800 p-4 rounded-2xl">
					<img
						src={me.avatarUrl}
						alt="User Avatar"
						className="h-28 w-28 rounded-full"
					/>
					<p className="text-center text-2xl">{me.name}</p>
				</div>
				<div className="col-span-1 flex justify-center items-center text-2xl font-bold">
					VS
				</div>
				<div className="col-span-2 flex flex-col justify-center gap-2 items-center bg-gray-800 rounded-2xl">
					<div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
					<p className="font-medium">
						Waiting for opponent...
					</p>
				</div>
			</div>
		</div>
	);
};

export default GameRoom;
