import axios from "axios";
import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../config/socket.config";
import { JOIN_ROOM, ROOM_JOINED } from "../messages/messages";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setGameId, setMeType, setOpponent } from "../redux/gameSlice";
import { motion, AnimatePresence } from "framer-motion";

const Invites = () => {
  const [invites, setInvites] = useState<any>([]);
  const [invitesChanged, setInvitesChanged] = useState(false);
  const [acceptedGameId, setAcceptedGameId] = useState<string>("");

  const [loadingStates, setLoadingStates] = useState<{ [key: string]: "idle" | "accepting" | "accepted" | "rejecting" | "rejected" }>({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/get-invites`,
        { withCredentials: true }
      );
      if (response) {
        setInvites(response.data.data.invites);
      }
    })();
  }, [invitesChanged]);

  const joinGame = async (gameId: string) => {
    let socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      socket = await connectSocket();
    }
    socket?.addEventListener("message", handleMessages);
    socket?.send(
      JSON.stringify({
        type: JOIN_ROOM,
        params: { roomId: gameId },
      })
    );
  };

  const handleMessages = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.type === ROOM_JOINED) {
      const { creatorName: name, avatarUrl, creatorId: id, roomId } = data.data;
      dispatch(setOpponent({ opponent: { name, avatarUrl, id } }));
      dispatch(setGameId({ gameId: roomId }));
      localStorage.setItem("activeGameId", roomId);
      dispatch(setMeType({ meType: "joiner" }));
      navigate("/game/game-room", { state: { from: "/" } });
    }
  };

  const acceptInvite = async (inviteId: string) => {
    if (acceptedGameId) return;
    setLoadingStates((prev) => ({ ...prev, [inviteId]: "accepting" }));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/accept-invite`,
        { inviteId },
        { withCredentials: true }
      );
      if (response) {
        setLoadingStates((prev) => ({ ...prev, [inviteId]: "accepted" }));
        setAcceptedGameId(response.data.data.gameId);
        await joinGame(response.data.data.gameId);
      }
    } catch {
      setLoadingStates((prev) => ({ ...prev, [inviteId]: "idle" }));
    }
  };

  const rejectInvite = async (inviteId: string) => {
    setLoadingStates((prev) => ({ ...prev, [inviteId]: "rejecting" }));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/reject-invite`,
        { inviteId },
        { withCredentials: true }
      );
      if (response) {
        setLoadingStates((prev) => ({ ...prev, [inviteId]: "rejected" }));
        setTimeout(() => {
          setInvitesChanged((prev) => !prev);
        }, 500);
      }
    } catch {
      setLoadingStates((prev) => ({ ...prev, [inviteId]: "idle" }));
    }
  };

  return (
    <div className="w-full">
      {invites.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          Nothing to show here for now.
        </p>
      )}

      <AnimatePresence>
        {invites.map((invite: any) => {
          const state = loadingStates[invite.id] || "idle";

          return (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition-all p-3 rounded-lg max-w-lg mx-auto mb-3 shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {invite.inviter.avatarUrl ? (
                    <img
                      src={invite.inviter.avatarUrl}
                      alt={invite.inviter.name}
                      className="w-full h-full object-cover"
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
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    state === "accepted"
                      ? "bg-green-600 cursor-default"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                  onClick={() => acceptInvite(invite.id)}
                  disabled={state !== "idle"}
                >
                  {state === "accepting"
                    ? "Accepting..."
                    : state === "accepted"
                    ? "Accepted"
                    : "Accept"}
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    state === "rejected"
                      ? "bg-red-600 cursor-default"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                  onClick={() => rejectInvite(invite.id)}
                  disabled={state !== "idle"}
                >
                  {state === "rejecting"
                    ? "Rejecting..."
                    : state === "rejected"
                    ? "Rejected"
                    : "Reject"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Invites;
