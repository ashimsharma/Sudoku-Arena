import { useState } from "react";

const JoinRoomModal = ({ onClose, onJoin }: any) => {
  const [roomId, setRoomId] = useState("");

  const handleJoin = () => {
    if (roomId.trim()) {
      onJoin(roomId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md text-white">
        <h2 className="text-xl font-semibold mb-4">Join a Room</h2>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 text-white bg-gray-700"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-black rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
