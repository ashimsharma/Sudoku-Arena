import { useEffect, useRef, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { CreateRoomModal, JoinRoomModal } from "./";
import { closeSocket, connectSocket, getSocket } from "../config/socket.config";
import { connect, useDispatch, useSelector } from "react-redux";
import { setGameId, setMe, setMeType, setOpponent } from "../redux/gameSlice";
import {
	CREATE_ROOM,
	JOIN_ROOM,
	ROOM_CREATED,
	ROOM_JOINED,
} from "../messages/messages";
import { setUser } from "../redux/userSlice";
import checkAuth from "../utils/authentication";

interface User {
	id: string;
	name: string;
	avatarUrl: string;
	email: string;
}

const Game = () => {
	const [createRoomModalOpened, setCreateRoomModalOpened] = useState(false);
	const [joinRoomModalOpened, setJoinRoomModalOpened] = useState(false);
	const [loading, setLoading] = useState(true);
	let me = useSelector((state: any) => state.user).user;

	const navigate = useNavigate();

	const location = useLocation();
	const dispatch = useDispatch();

	const handleMessages = (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		const type = data.type;

		switch (type) {
			case ROOM_CREATED:
				const roomId = data.roomId;
				dispatch(setGameId({ gameId: roomId }));

				localStorage.setItem("activeGameId", roomId);

				dispatch(setMeType({ meType: "creator" }));
				navigate("/game/game-room", { state: { from: "/game" } });
				break;
			case ROOM_JOINED:
				const name = data.data.creatorName;
				const avatarUrl = data.data.avatarUrl;
				const id = data.data.creatorId;

				dispatch(setOpponent({ opponent: { name, avatarUrl, id } }));
				const joinerRoomId = data.data.roomId;
				dispatch(setGameId({ gameId: joinerRoomId }));

				localStorage.setItem("activeGameId", joinerRoomId);

				dispatch(setMeType({ meType: "joiner" }));
				navigate("/game/game-room", { state: { from: "/game" } });
				break;
		}
	};

	useEffect(() => {
		if(localStorage.getItem("activeGameId")){
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

	useEffect(() => {
		if (localStorage.getItem("activeGameId")) {
			navigate("/game/game-room")
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
				console.log(error);
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

	const openCreateRoomModal = () => {
		setCreateRoomModalOpened(true);
	};

	const openJoinRoomModal = () => {
		setJoinRoomModalOpened(true);
	};

	const onClose = () => {
		createRoomModalOpened && setCreateRoomModalOpened(false);
		joinRoomModalOpened && setJoinRoomModalOpened(false);
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

	return loading ? (
		<div className="text-white">Loading...</div>
	) : (
		<div className="min-h-screen bg-gray-900 p-4">
			<div className="flex mb-4">
				<button
					className="flex items-center text-white hover:text-gray-400 transition-all duration-300"
					onClick={back}
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</button>
			</div>

			<div className="flex flex-col items-center gap-4">
				<div className="flex w-fit bg-gray-800 p-4 text-white rounded-lg justify-center items-center gap-4">
					<img
						src={me.avatarUrl}
						alt="User Avatar"
						className="h-28 w-28 rounded-full"
					/>
					<p className="text-center text-2xl">{me.name}</p>
				</div>

				<div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-6 rounded-2xl shadow-lg text-white w-full max-w-sm">
					<h2 className="text-3xl font-bold text-red-500 text-center">
						SUDOKU ARENA
					</h2>
					<p className="text-gray-300 text-center mt-2">
						Create your own room!
					</p>

					<div className="mt-6 flex flex-col gap-4">
						<button
							className="bg-red-500 hover:bg-red-600 transition-all duration-300 text-white font-semibold py-2 px-4 rounded-lg"
							onClick={openCreateRoomModal}
						>
							Create Room
						</button>
						<button
							className="bg-gray-700 hover:bg-gray-600 transition-all duration-300 text-white font-semibold py-2 px-4 rounded-lg"
							onClick={openJoinRoomModal}
						>
							Join Room
						</button>
					</div>
				</div>
			</div>
			{createRoomModalOpened && (
				<CreateRoomModal onClose={onClose} onCreate={onCreate} />
			)}
			{joinRoomModalOpened && (
				<JoinRoomModal onClose={onClose} onJoin={onJoin} />
			)}
		</div>
	);
};

export default Game;
