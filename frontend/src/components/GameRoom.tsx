import { useEffect, useState } from "react";
import { closeSocket, connectSocket, getSocket } from "../config/socket.config";
import { FiCopy } from "react-icons/fi";
import { MdCheckCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import PlayerJoinSound from "../assets/sounds/PlayerJoinSound.wav";

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
import { FriendListModal, Loader, LoaderModal } from "./";

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
				const opponentJoinedSound = new Audio(PlayerJoinSound);
				opponentJoinedSound.play();
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
		<Loader />
	) : (
		<div className="min-h-screen text-white">
			{/* Loader / Invite Modal */}
			{gameInitiated && <LoaderModal text="Waiting for opponent..." />}
			{openFriendList && (
				<FriendListModal
					setOpenFriendList={setOpenFriendList}
					user={me}
					gameId={gameId}
				/>
			)}

			{/* Header */}
			<div className="py-6 bg-gray-900/70 backdrop-blur-md shadow-lg border-b border-red-500/30">
				<h1 className="p-4 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 tracking-wider drop-shadow-lg">
					{type === "creator" ? me?.name : opponent?.name}'s GAME ROOM
				</h1>
			</div>

			{/* Room ID + Copy */}
			<div className="mt-6">
				<div className="bg-gray-900/60 backdrop-blur-lg border border-gray-700/50 p-4 rounded-2xl flex items-center space-x-2 shadow-lg w-11/12 md:w-3/5 lg:w-2/5 mx-auto">
					<input
						type="text"
						value={gameId}
						readOnly
						className="bg-transparent text-white px-4 py-2 rounded-xl w-full focus:outline-none cursor-default tracking-wider"
					/>
					{type === "creator" && (
						<button
							onClick={handleCopy}
							className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-200 flex items-center gap-1 active:scale-95"
						>
							{copied ? (
								<MdCheckCircle className="w-5 h-5" />
							) : (
								<FiCopy className="w-5 h-5" />
							)}
							{copied ? "Copied!" : "Copy"}
						</button>
					)}
				</div>
				{type === "creator" && (
					<p className="text-center p-2 text-gray-400 text-sm italic">
						Share this Room ID with your friends to invite them
					</p>
				)}
			</div>

			{/* Player Cards */}
			<div className="bg-gray-900/60 backdrop-blur-xl grid grid-cols-5 w-11/12 md:w-4/5 lg:w-1/2 my-8 mx-auto p-6 rounded-2xl border border-gray-700/50 shadow-lg">
				{/* Me */}
				<div className="col-span-2 flex flex-col items-center gap-3 bg-gray-800/50 rounded-2xl p-4 shadow-md">
					<div className="relative">
						<img
							src={me?.avatarUrl}
							alt="User Avatar"
							className="h-28 w-28 rounded-full border-4 border-red-500 shadow-lg"
						/>
						{gameInitiated && (
							<span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
								<MdCheckCircle /> Ready
							</span>
						)}
					</div>
					<p className="text-xl font-bold text-center">{me?.name}</p>
				</div>

				{/* VS */}
				<div className="col-span-1 flex flex-col justify-center items-center">
					<div className="text-2xl font-extrabold text-gray-400">
						VS
					</div>
				</div>

				{/* Opponent */}
				<div className="col-span-2 flex flex-col items-center justify-center gap-3 bg-gray-800/50 rounded-2xl p-4 shadow-md">
					{!opponent ? (
						<>
							<div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin"></div>
							<p className="text-gray-400 text-center">
								Waiting for opponent...
							</p>
						</>
					) : (
						<>
							<div className="relative">
								<img
									src={opponent?.avatarUrl}
									alt="User Avatar"
									className="h-28 w-28 rounded-full border-4 border-blue-500 shadow-lg"
								/>
								{opponentGameInitiated && (
									<span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
										<MdCheckCircle /> Ready
									</span>
								)}
							</div>
							<p className="text-xl font-bold text-center">
								{opponent?.name}
							</p>
						</>
					)}
				</div>
			</div>

			{/* Action Buttons */}
			<div className="text-center pb-8">
				{opponent && me && (
					<button
						className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg text-lg font-bold text-white shadow-lg transition-transform transform hover:scale-105 active:scale-95"
						onClick={initGame}
					>
						Start Game
					</button>
				)}

				{me && !opponent && type === "creator" && (
					<button
						className="bg-blue-600 hover:bg-blue-800 px-6 py-3 rounded-lg text-lg font-bold text-white shadow-lg transition-transform transform hover:scale-105 active:scale-95"
						onClick={() => setOpenFriendList(true)}
					>
						Invite Friend
					</button>
				)}
			</div>
		</div>
	);
};

export default GameRoom;
