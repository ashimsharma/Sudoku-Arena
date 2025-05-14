import { createSlice } from '@reduxjs/toolkit';

interface InitialState {
    gameId: null | string
    me: null | Object
    opponent: null | Object
    meType: null | string
    initialGameState: (number | null)[]
    currentGameState: (number | null)[]
}

const initialState: InitialState = {
    gameId: null,
    me: null,
    opponent: null,
    meType: '',
    initialGameState: [],
    currentGameState: []
}

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGameId: (state, action) => {
            state.gameId = action.payload.gameId;
        },
        setMe: (state, action) => {
            state.me = action.payload.me;
        },
        setOpponent: (state, action) => {
            state.opponent = action.payload.opponent;
        },
        setMeType: (state, action) => {
            state.meType = action.payload.meType;
        },
        setInitialGameState: (state, action) => {
            state.initialGameState = action.payload.initialGameState;
        },
        setCurrentGameState: (state, action) => {
            state.currentGameState = action.payload.currentGameState;
        }
    },
});

export const { setGameId, setMe, setOpponent, setMeType, setInitialGameState, setCurrentGameState } = gameSlice.actions;
export default gameSlice.reducer;