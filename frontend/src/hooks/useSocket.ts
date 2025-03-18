const useSocket = ()  => {
    let socket = new WebSocket(import.meta.env.VITE_WS_URL);

    return socket;
}

export default useSocket;