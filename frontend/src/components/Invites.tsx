import axios from "axios";
import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../config/socket.config";
import { JOIN_ROOM, ROOM_CREATED, ROOM_JOINED } from "../messages/messages";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setGameId, setMeType, setOpponent } from "../redux/gameSlice";

const Invites = () => {
	const [invites, setInvites] = useState<any>([]);
	const [invitesChanged, setInvitesChanged] = useState(false);
	const [acceptButton, setAcceptButton] = useState("Accept");
	const [rejectButton, setRejectButton] = useState("Reject");
	const [acceptedGameId, setAcceptedGameId] = useState<string>("");

	useEffect(() => {
		(async () => {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/user/get-invites`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				setInvites(response.data.data.invites);
			}
		})();
	}, [invitesChanged]);

	const joinGame = async (gameId: string) => {
		try {
			let socket = getSocket();

			if (!socket || socket.readyState !== WebSocket.OPEN) {
				socket = await connectSocket();
			}

			socket?.addEventListener("message", handleMessages);

			socket?.send(
				JSON.stringify({
					type: JOIN_ROOM,
					params: {
						roomId: gameId,
					},
				})
			);
		} catch (error) {
			console.log(error);
		}
	};

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleMessages = (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		const type = data.type;

		switch (type) {
			case ROOM_JOINED:
				const name = data.data.creatorName;
				const avatarUrl = data.data.avatarUrl;
				const id = data.data.creatorId;

				dispatch(setOpponent({ opponent: { name, avatarUrl, id } }));
				const joinerRoomId = data.data.roomId;
				dispatch(setGameId({ gameId: joinerRoomId }));

				localStorage.setItem("activeGameId", joinerRoomId);

				dispatch(setMeType({ meType: "joiner" }));
				navigate("/game/game-room", { state: { from: "/" } });
				break;
		}
	};

	const acceptInvite = async (inviteId: string) => {
		if (acceptedGameId) {
			return;
		}
		try {
			setAcceptButton("Accepting...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/accept-invite`,
				{
					inviteId: inviteId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setAcceptButton("Accepted");
				setAcceptedGameId(response.data.data.gameId);
				await joinGame(response.data.data.gameId);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const rejectInvite = async (inviteId: string) => {
		try {
			setRejectButton("Rejecting...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/reject-invite`,
				{
					inviteId: inviteId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setRejectButton("Rejected");
				setInvitesChanged(!invitesChanged);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			{invites.length === 0 && (
				<p className="text-sm text-gray-100 flex items-center justify-center">
					Nothing to show here for now.
				</p>
			)}
			{invites.length !== 0 && (
				<h2 className="text-center text-xl p-2">Game Invites</h2>
			)}
			{invites.length !== 0 &&
				invites.map((invite: any) => (
					<div
						key={invite.id}
						className="flex items-center justify-between bg-gray-700 p-3 rounded-lg max-w-lg mx-auto hover:bg-gray-700 gap-4"
					>
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
								{invite.inviter.avatarUrl ? (
									<img
										src={invite.inviter.avatarUrl}
										alt={invite.inviter.name}
										className="w-10 h-10 rounded-full object-cover"
									/>
								) : (
									invite.inviter.name[0].toUpperCase()
								)}
							</div>
							<span className="text-white font-medium hover:underline">
								{invite.inviter.name}
							</span>
						</div>
						<div className="flex space-x-2">
							<button
								className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600"
								onClick={() => acceptInvite(invite.id)}
							>
								{acceptButton}
							</button>
							<button
								className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
								onClick={() => rejectInvite(invite.id)}
							>
								{rejectButton}
							</button>
						</div>
					</div>
				))}
		</div>
	);
};

export default Invites;
