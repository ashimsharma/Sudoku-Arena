let socket: WebSocket | null = null;

export const getSocket = () => {
	if (!socket) {
		try {
			socket = new WebSocket(import.meta.env.VITE_WS_URL);

			socket.addEventListener("error", () => {
				console.log("Connection Failed.")
			});

			socket.addEventListener("close", () => {
				socket = null;
				console.log("Websocket closed.")
			});
		} catch (error) {
			throw new Error("Connection Failed.");
		}
	}
	addListeners(socket);
	return socket;
};

export const closeSocket = () => {
	if (socket) {
		socket.close();
		socket = null;
	}
};

const addListeners = (socket: WebSocket) => {
	socket.addEventListener('open', () => {
		
	})

	socket.addEventListener('message', () => {
		
	})
}
