import { useEffect, useState } from "react";
import { getSocket } from "../config/socket.config";

const GameRoom = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        setSocket(getSocket());
    }, [])

    return (
        socket ? <p>Loading...</p> : 
        <div className="bg-gray-900 text-white">
            GameRoom {socket}
        </div>
    )
}

export default GameRoom;