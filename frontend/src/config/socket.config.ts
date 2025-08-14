let socket: WebSocket | null = null;

export const connectSocket = (): Promise<WebSocket> => {
	return new Promise((resolve, reject) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			return resolve(socket);
		}

		if (socket && socket.readyState === WebSocket.CONNECTING) {
			socket.addEventListener("open", () => resolve(socket!));
			socket.addEventListener("error", () =>
				reject({type: "error", message: "WebSocket connection error"})
			);
			return;
		}

		if (socket && socket.readyState !== WebSocket.CLOSED) {
			socket.close();
		}

		try {
			socket = new WebSocket(import.meta.env.VITE_WS_URL);

			socket.addEventListener("open", () => {
				resolve(socket!);
			});

			socket.addEventListener("error", (e) => {
				socket = null;
				reject({type: "error", messsage:"Connection Failed"});
			});

			socket.addEventListener("close", () => {
				socket = null;
			});
		} catch (error) {
			socket = null;
			reject({type: "error", message: "Failed to create WebSocket"});
		}
	});
};

export const getSocket = (): WebSocket | null => {
	return socket;
};

export const closeSocket = () => {
	if (socket) {
		socket.close();
		socket = null;
	}
};
