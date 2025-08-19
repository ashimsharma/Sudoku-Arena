import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { CreateRoomModal, JoinRoomModal, Loader, ErrorMessage } from "./";
import { closeSocket, connectSocket, getSocket } from "../config/socket.config";
import { useDispatch, useSelector } from "react-redux";
import { setGameId, setMe, setMeType, setOpponent } from "../redux/gameSlice";
import {
	CREATE_ROOM,
	JOIN_ROOM,
	ROOM_CREATED,
	ROOM_JOINED,
	GAME_NOT_FOUND
} from "../messages/messages";
import { setUser } from "../redux/userSlice";
import checkAuth from "../utils/authentication";
import { motion } from "framer-motion";

const Game = () => {
	const [createRoomModalOpened, setCreateRoomModalOpened] = useState(false);
	const [joinRoomModalOpened, setJoinRoomModalOpened] = useState(false);
	const [loading, setLoading] = useState(true);
	const me = useSelector((state: any) => state.user).user;

	const [error, setError] = useState({ visible: false, message: "" });

	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();

	const handleMessages = (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		const type = data.type;

		switch (type) {
			case ROOM_CREATED: {
				const roomId = data.roomId;
				dispatch(setGameId({ gameId: roomId }));
				localStorage.setItem("activeGameId", roomId);
				dispatch(setMeType({ meType: "creator" }));
				navigate("/game/game-room", { state: { from: "/game" } });
				break;
			}
			case ROOM_JOINED: {
				const {
					creatorName: name,
					avatarUrl,
					creatorId: id,
					roomId,
				} = data.data;
				dispatch(setOpponent({ opponent: { name, avatarUrl, id } }));
				dispatch(setGameId({ gameId: roomId }));
				localStorage.setItem("activeGameId", roomId);
				dispatch(setMeType({ meType: "joiner" }));
				navigate("/game/game-room", { state: { from: "/game" } });
				break;
			}
			case GAME_NOT_FOUND:
				setError({visible: true, message: "Game Not Found!"})
				break;
		}
	};

	useEffect(() => {
		if (localStorage.getItem("activeGameId")) {
			navigate("/game/game-room");
		}

		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
				dispatch(setMe({ me: response.data.data.user }));
				setLoading(false);
			} else {
				closeSocket();
				navigate("/login");
			}
		})();
	}, []);

	const handleWebsocketError = () => {
		setError({ visible: true, message: "Failed to connect to the server" });
	};

	useEffect(() => {
		if (localStorage.getItem("activeGameId")) {
			navigate("/game/game-room");
			return;
		}

		(async () => {
			let socket: WebSocket | null;

			try {
				socket = getSocket();

				if (!socket || socket.readyState !== WebSocket.OPEN) {
					socket = await connectSocket();
				}

				socket?.addEventListener("message", handleMessages);
			} catch (error) {
				handleWebsocketError();
			}

			return () => {
				socket?.removeEventListener("message", handleMessages);
			};
		})();
	}, []);

	const back = () => {
		closeSocket();
		navigate("/");
	};

	const openCreateRoomModal = () => setCreateRoomModalOpened(true);
	const openJoinRoomModal = () => setJoinRoomModalOpened(true);
	const onClose = () => {
		if (createRoomModalOpened) setCreateRoomModalOpened(false);
		if (joinRoomModalOpened) setJoinRoomModalOpened(false);
	};

	const onCreate = async ({
		difficulty,
		gameTime,
	}: {
		difficulty: string;
		gameTime: number;
	}) => {
		setCreateRoomModalOpened(false);

		let socket = getSocket();

		if (!socket || socket.readyState !== WebSocket.OPEN) {
			socket = await connectSocket();
		}

		socket?.send(
			JSON.stringify({
				type: CREATE_ROOM,
				params: {
					difficulty,
					gameTime,
				},
			})
		);
	};

	const onJoin = async (roomId: string) => {
		setJoinRoomModalOpened(false);
		let socket = getSocket();

		if (!socket || socket.readyState !== WebSocket.OPEN) {
			socket = await connectSocket();
		}

		socket?.send(
			JSON.stringify({
				type: JOIN_ROOM,
				params: {
					roomId,
				},
			})
		);
	};

	const onErrorClose = () => {
		setError({visible: false, message: ""})
	}

	if (loading) return <Loader />;

	return (
		<div className="min-h-screen p-4">
			{/* Back Button */}
			{<ErrorMessage visible={error.visible} message={error.message} onClose={onErrorClose}/>}
			<div className="w-full flex justify-start mb-6">
				<motion.button
					className="flex items-center text-white hover:text-indigo-400 transition-colors duration-300"
					onClick={back}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					aria-label="Go back"
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</motion.button>
			</div>

			<motion.div
				className="flex flex-col items-center gap-6 p-6 w-full"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<motion.div
					className="flex flex-col md:flex-row items-center gap-6 bg-gray-800 p-6 rounded-xl shadow-lg max-w-4xl w-full"
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<img
						src={me.avatarUrl}
						alt={`${me.name} Avatar`}
						className="h-28 w-28 rounded-full object-cover"
					/>
					<p className="text-3xl text-white font-semibold text-center md:text-left">
						{me.name}
					</p>
				</motion.div>

				{/* Action Panel */}
				<motion.div
					className="bg-gray-800 bg-opacity-60 backdrop-blur-md p-8 rounded-3xl shadow-lg mt-8 max-w-sm w-full text-white"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.3 }}
				>
					<h2 className="text-3xl font-bold text-red-500 text-center mb-2">
						SUDOKU ARENA
					</h2>
					<p className="text-gray-300 text-center mb-6">
						Create your own room!
					</p>

					<div className="flex flex-col gap-4">
						<motion.button
							className="bg-red-500 hover:bg-red-600 transition-colors duration-300 font-semibold py-3 rounded-lg shadow-md"
							onClick={openCreateRoomModal}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Create Room
						</motion.button>
						<motion.button
							className="bg-gray-700 hover:bg-gray-600 transition-colors duration-300 font-semibold py-3 rounded-lg shadow-md"
							onClick={openJoinRoomModal}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Join Room
						</motion.button>
					</div>
				</motion.div>

				{/* Modals */}
				{createRoomModalOpened && (
					<CreateRoomModal onClose={onClose} onCreate={onCreate} />
				)}
				{joinRoomModalOpened && (
					<JoinRoomModal onClose={onClose} onJoin={onJoin} />
				)}
			</motion.div>
		</div>
	);
};

export default Game;
