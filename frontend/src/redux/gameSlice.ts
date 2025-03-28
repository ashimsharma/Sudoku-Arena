import { createSlice } from '@reduxjs/toolkit';

interface InitialState {
    gameId: null | string
    me: null | Object
    opponent: null | Object
}

const initialState: InitialState = {
    gameId: null,
    me: null,
    opponent: null
}

const gameSlice = createSlice({
    name: 'userType',
    initialState,
    reducers: {
        setGameId: (state, action) => {
            state.gameId = action.payload.gameId;
        },
        setMe: (state, action) => {
            state.me = action.payload.me;
        }
    },
});

export const { setGameId } = gameSlice.actions;
export default gameSlice.reducer;