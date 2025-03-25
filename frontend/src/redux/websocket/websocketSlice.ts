import { createSlice } from '@reduxjs/toolkit';

interface WebSocketState {
    socket: null | WebSocket
}

const initialState: WebSocketState = {
    socket: null
}

const userSlice = createSlice({
    name: 'websocketConnection',
    initialState,
    reducers: {
        open: (state) => {
            state.socket = new WebSocket(import.meta.env.VITE_WS_URL);
        }
    },
});

export const { open } = userSlice.actions;
export default userSlice.reducer;