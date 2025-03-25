import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi"; // Importing the Back Arrow Icon
import { useNavigate } from "react-router-dom";
import { CREATE_ROOM, ROOM_CREATED } from "../messages/messages";
import CreateRoomModal from "./CreateRoomModal";
import { open } from "../redux/websocket/websocketSlice";
import { useDispatch, useSelector } from "react-redux";

const Game = () => {
	const [modalOpened, setModalOpened] = useState(false);
	const dispatch = useDispatch();
	let socket: null | WebSocket;

	const navigate = useNavigate();

	useEffect(() => {
		dispatch(open());

		socket = useSelector((state: any) => state.socket);

		if (!socket) return; 

		const handleOpen = (event: Event) => {
			console.log(event);
		};

		const handleError = (err: Event) => {
			console.log(err);
		};

		const handleMessage = (event: MessageEvent) => {
			const message = JSON.parse(event.data).message;

			switch (message) {
				case ROOM_CREATED:
					const roomId = JSON.parse(event.data).roomId;
					if (roomId) {
						navigate("/game/game-room", {
							state: {
								roomId,
							},
						});
					}
					break;
				default:
					break;
			}
		};

		socket.addEventListener("open", handleOpen);
		socket.addEventListener("error", handleError);
		socket.addEventListener("message", handleMessage);
	}, [navigate]); 

	const back = () => {
		navigate("/");
	};

	const openModal = () => {
		setModalOpened(true);
	};

	const onClose = () => {
		setModalOpened(false);
	};

	const onCreate = ({
		difficulty,
		gameType,
	}: {
		difficulty: string;
		gameType: string;
	}) => {
		setModalOpened(false);

		if (socket) {
			socket.send(
				JSON.stringify({
					type: CREATE_ROOM,
					params: {
						difficulty,
						gameType,
					},
				})
			);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-900 p-4 relative">
			<button
				className="absolute top-6 left-6 flex items-center text-white hover:text-gray-400 transition-all duration-300"
				onClick={back}
			>
				<HiArrowLeft className="text-2xl mr-2" />
				<span className="text-lg font-medium">Back</span>
			</button>

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
						onClick={openModal}
					>
						Create Room
					</button>
					<button className="bg-gray-700 hover:bg-gray-600 transition-all duration-300 text-white font-semibold py-2 px-4 rounded-lg">
						Join Room
					</button>
				</div>
			</div>
			{modalOpened && (
				<CreateRoomModal onClose={onClose} onCreate={onCreate} />
			)}
		</div>
	);
};

export default Game;
