import { useEffect, useState } from "react";
import { closeSocket, connectSocket, getSocket } from "../config/socket.config";
import { FiCopy } from "react-icons/fi";
import { MdCheckCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
	BOTH_USERS_GAME_INITIATED,
	DATA_FETCHED,
	FETCH_DATA,
	GAME_ALREADY_ENDED,
	GAME_ALREADY_STARTED,
	GAME_INITIATED,
	GAME_NOT_FOUND,
	INIT_GAME,
	OPPONENT_GAME_INITIATED,
	OPPONENT_JOINED,
} from "../messages/messages";
import {
	setInitialGameState,
	setOpponent,
	setCurrentGameState,
	setStartTime,
	setGameDuration,
	setEmojiReactions,
	setMe,
	setGameId,
	setMeType,
} from "../redux/gameSlice";
import { setUser } from "../redux/userSlice";
import checkAuth from "../utils/authentication";
import axios from "axios";
import {FriendListModal, LoaderModal} from "./";

const GameRoom = () => {
	const [loading, setLoading] = useState(true);
	const [inviteButton, setInviteButton] = useState("Invite");
	const [openFriendList, setOpenFriendList] = useState(false);

	const dispatch = useDispatch();

	useEffect(() => {
		if (!localStorage.getItem("activeGameId")) {
			closeSocket();
			navigate("/");
			return;
		}
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
				dispatch(setMe({ me: response.data.data.user }));
			} else {
				navigate("/login");
			}
		})();
	}, []);

	useEffect(() => {
		if (!localStorage.getItem("activeGameId")) {
			closeSocket();
			navigate("/");
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

	const gameId = useSelector((state: any) => state.game).gameId;
	const me = useSelector((state: any) => state.game).me;
	const opponent = useSelector((state: any) => state.game).opponent;
	const type = useSelector((state: any) => state.game).meType;

	useEffect(() => {
		if (!localStorage.getItem("activeGameId")) {
			closeSocket();
			navigate("/");
			return;
		}

		(async () => {
			if (gameId && type) {
				setLoading(false);
				return;
			}

			let socket = getSocket();

			if (!socket || socket.readyState !== WebSocket.OPEN) {
				socket = await connectSocket();
			}

			socket?.send(
				JSON.stringify({
					type: FETCH_DATA,
					params: {
						page: "game_room",
						roomId: localStorage.getItem("activeGameId"),
					},
				})
			);
		})();
	}, []);

	const [opponentJoined, setOpponentJoined] = useState(false);
	const [gameInitiated, setGameInitiated] = useState(false);
	const [opponentGameInitiated, setOpponentGameInitiated] = useState(false);

	const navigate = useNavigate();

	const handleMessages = (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		const type = data.type;

		switch (type) {
			case OPPONENT_JOINED:
				const name = data.data.joinerName;
				const avatarUrl = data.data.avatarUrl;
				const id = data.data.joinerId;
				dispatch(setOpponent({ opponent: { name, avatarUrl, id } }));
				setOpponentJoined(true);
				break;
			case GAME_INITIATED:
				setGameInitiated(true);
				break;
			case OPPONENT_GAME_INITIATED:
				setOpponentGameInitiated(true);
				break;
			case BOTH_USERS_GAME_INITIATED:
				navigate("/game/game-room/game-board", {
					state: {
						from: "/game/game-room",
					},
				});
				dispatch(
					setInitialGameState({
						initialGameState: data.data.initialGameState,
					})
				);
				dispatch(
					setCurrentGameState({
						currentGameState: data.data.currentGameState,
					})
				);
				dispatch(
					setStartTime({
						startTime: data.data.startTime,
					})
				);
				dispatch(
					setGameDuration({
						gameDuration: data.data.gameDuration,
					})
				);
				dispatch(
					setEmojiReactions({
						emojiReactions: data.data.reactions,
					})
				);
				break;
			case DATA_FETCHED:
				dispatch(setGameId({ gameId: data.data.roomId }));
				dispatch(setMeType({ meType: data.data.type }));
				if (data.data.opponent.id) {
					dispatch(setOpponent({ opponent: data.data.opponent }));
				}
				setGameInitiated(data.data.gameInitiated);
				setOpponentGameInitiated(data.data.opponent.gameInitiated);
				setLoading(false);
				break;
			case GAME_ALREADY_STARTED:
				navigate("/game/game-room/game-board");
				break;
			case GAME_ALREADY_ENDED:
				localStorage.clear();
				navigate("/game");
				break;
			case GAME_NOT_FOUND:
				localStorage.clear();
				navigate("/game");
				break;
		}
	};

	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(gameId);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const initGame = async () => {
		let socket = getSocket();

		if (!socket || socket.readyState !== WebSocket.OPEN) {
			socket = await connectSocket();
		}
		socket?.send(
			JSON.stringify({
				type: INIT_GAME,
				params: {
					roomId: gameId,
				},
			})
		);
	};

	return loading ? (
		<div className="text-white">Loading...</div>
	) : (
		<div className="bg-gray-800 text-white">
			{gameInitiated && <LoaderModal text="Waiting for opponent..." />}
			{openFriendList && <FriendListModal setOpenFriendList={setOpenFriendList} user={me} gameId={gameId}/>}
			<div className="py-6 bg-gray-900 shadow-lg">
				<h1 className="p-4 text-center text-3xl font-bold text-red-500">
					{type === "creator" ? me?.name : opponent?.name}'s GAME ROOM
				</h1>
			</div>
			<div className="mt-4">
				<div className="bg-gray-900 p-4 rounded-2xl flex items-center space-x-2 shadow-md w-1/3 lg:w-3/5 md:w-4/5 mx-auto">
					<input
						type="text"
						value={gameId}
						readOnly
						className="bg-gray-800 text-white px-4 py-2 rounded-xl w-full focus:outline-none cursor-default"
					/>
					{type === "creator" && (
						<button
							onClick={handleCopy}
							className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl transition flex items-center"
						>
							<FiCopy className="w-4 h-4 mr-1" />
							{copied ? "Copied!" : "Copy"}
						</button>
					)}
				</div>
				{type === "creator" && (
					<p className="text-center p-1 text-gray-300">
						*Use this RoomId to invite your friends
					</p>
				)}
			</div>

			<div className="bg-gray-900 grid grid-cols-5 w-1/2 m-4 mx-auto p-4 rounded-2xl lg:w-3/5 md:w-4/5">
				<div className="col-span-2 flex flex-col justify-center gap-2 items-center bg-gray-800 p-4 rounded-2xl">
					<img
						src={me?.avatarUrl}
						alt="User Avatar"
						className="h-28 w-28 rounded-full"
					/>
					<p className="text-center text-2xl">{me?.name}</p>
					<div className="h-6">
						{gameInitiated && (
							<div className="text-white bg-green-500 flex items-center px-2 py-1 rounded-full gap-1">
								<div className="bg-white rounded-full w-fit inline-block">
									<MdCheckCircle
										style={{
											color: "green",
											fontSize: "24px",
										}}
									/>
								</div>{" "}
								Ready
							</div>
						)}
					</div>
				</div>
				<div className="col-span-1 flex justify-center items-center text-2xl font-bold">
					VS
				</div>
				<div className="col-span-2 flex flex-col justify-center gap-2 items-center bg-gray-800 p-4 rounded-2xl">
					{!opponent ? (
						<>
							<div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
							<p className="font-medium text-center">
								Waiting for opponent
							</p>
						</>
					) : (
						<>
							<img
								src={opponent?.avatarUrl}
								alt="User Avatar"
								className="h-28 w-28 rounded-full"
							/>
							<p className="text-center text-2xl">
								{opponent?.name}
							</p>
							<div className="h-6">
								{opponentGameInitiated && (
									<div className="text-white bg-green-400 flex items-center px-2 py-1 rounded-full gap-1">
										<div className="bg-white rounded-full w-fit inline-block">
											<MdCheckCircle
												style={{
													color: "green",
													fontSize: "24px",
												}}
											/>
										</div>{" "}
										Ready
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</div>
			{opponent && me && (
				<div className="text-center">
					<button
						className="bg-red-500 hover:bg-red-600 transition-all duration-300 text-white font-semibold py-2 px-4 rounded-lg"
						onClick={initGame}
					>
						Start Game
					</button>
				</div>
			)}

			{me && !opponent && type === "creator" && (
				<div className="text-center">
					<button
						className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white font-semibold py-2 px-4 rounded-lg"
						onClick={() => setOpenFriendList(true)}
					>
						Invite Friend
					</button>
				</div>
			)}
		</div>
	);
};

export default GameRoom;
