import { useState } from "react";

type Difficulty = "easy" | "medium" | "hard" | "expert";

enum GameTypes {
  timeBased = "timeBased",
  completionBased = "completionBased",
}

type Options = {
  difficulty: Difficulty;
  gameType: GameTypes;
};

type CreateRoomModalProps = {
  onClose: () => void;
  onCreate: (options: Options) => void;
};

const CreateRoomModal = ({ onClose, onCreate }: CreateRoomModalProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameType, setGameType] = useState<GameTypes>(GameTypes.timeBased);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-white">
        <h2 className="text-xl font-semibold mb-4">Create Room</h2>

        <label className="block mb-2 text-sm font-medium">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="w-full p-2 border rounded mb-4 text-black"
        >
          {["easy", "medium", "hard", "expert"].map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-sm font-medium">Game Type</label>
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value as GameTypes)}
          className="w-full p-2 border rounded mb-4 text-black"
        >
          {Object.values(GameTypes).map((type) => (
            <option key={type} value={type}>
              {type === "timeBased" ? "Time-Based" : "Completion-Based"}
            </option>
          ))}
        </select>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-400 text-black"
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate({ difficulty, gameType })}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
