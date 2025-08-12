import axios from "axios";
import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

const FriendListModal = ({ setOpenFriendList, gameId, user }: any) => {
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [inviteStatus, setInviteStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/get-friends`,
          { withCredentials: true }
        );

        if (response) {
          setFriends(response.data.data.friends || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const inviteFriend = async (e: any, friendId: string) => {
    e.stopPropagation();
    try {
      setInviteStatus((prev) => ({ ...prev, [friendId]: "Inviting..." }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/invite`,
        { friendId, gameId },
        { withCredentials: true }
      );

      if (response) {
        setInviteStatus((prev) => ({ ...prev, [friendId]: "Invited ✅" }));
        setTimeout(() => setOpenFriendList(false), 1000);
      }
    } catch (error) {
      console.log(error);
      setInviteStatus((prev) => ({ ...prev, [friendId]: "Failed ❌" }));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-800 p-6 rounded-xl shadow-2xl w-11/12 sm:w-3/5 md:w-2/5 max-h-[80vh] text-white overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Invite Friends</h2>
          <button
            onClick={() => setOpenFriendList(false)}
            className="p-2 rounded-full hover:bg-gray-700 transition"
          >
            <IoMdClose size={22} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Fetching friends...</p>
          </div>
        )}

        {/* Friends List */}
        {!loading && friends.length === 0 && (
          <p className="text-center text-gray-400 py-10">No friends found</p>
        )}

        {!loading && friends.length > 0 && (
          <AnimatePresence>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
              className="space-y-3"
            >
              {friends.map((friend: any) => {
                const avatar =
                  friend.requester.id !== user?.id
                    ? friend.requester.avatarUrl
                    : friend.receiver.avatarUrl;

                const name =
                  friend.requester.id !== user?.id
                    ? friend.requester.name
                    : friend.receiver.name;

                const id =
                  friend.requester.id !== user?.id
                    ? friend.requester.id
                    : friend.receiver.id;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4 bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition"
                  >
                    {/* Avatar */}
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center font-bold">
                        {name[0].toUpperCase()}
                      </div>
                    )}

                    {/* Name */}
                    <span className="font-medium">{name}</span>

                    {/* Invite Button */}
                    <button
                      onClick={(e) => inviteFriend(e, id)}
                      disabled={inviteStatus[id] === "Invited ✅"}
                      className={`ml-auto px-3 py-1 rounded text-sm transition ${
                        inviteStatus[id] === "Invited ✅"
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {inviteStatus[id] || "Invite"}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default FriendListModal;
