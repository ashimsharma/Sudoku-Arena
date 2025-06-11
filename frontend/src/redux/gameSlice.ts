import { createSlice } from '@reduxjs/toolkit';

type CurrentGameStateData = {
	digit: number | null;
	isOnCorrectPosition: boolean;
	canBeTyped: boolean;
}

interface InitialState {
    gameId: null | string
    me: null | Object
    opponent: null | Object
    meType: null | string
    initialGameState: (CurrentGameStateData)[]
    currentGameState: (CurrentGameStateData)[]
    meProgress: number
    opponentProgress: number
    totalMistakes: number
    opponentMistakes: number
    startTime: number
}

const initialState: InitialState = {
    gameId: null,
    me: null,
    opponent: null,
    meType: '',
    initialGameState: [],
    currentGameState: [],
    meProgress: 0,
    opponentProgress: 0,
    totalMistakes: 0,
    opponentMistakes: 0,
    startTime: 0
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
        },
        setMeProgress: (state, action) => {
            state.meProgress = action.payload.meProgress;
        },
        setOpponentProgress: (state, action) => {
            state.opponentProgress = action.payload.opponentProgress;
        },
        setTotalMistakes: (state, action) => {
            state.totalMistakes = action.payload.totalMistakes;
        },
        setOpponentMistakes: (state, action) => {
            state.opponentMistakes = action.payload.opponentMistakes;
        },
        setStartTime: (state, action) => {
            state.startTime = action.payload.startTime;
        }
    },
});

export const { setGameId, setMe, setOpponent, setMeType, setInitialGameState, setCurrentGameState, setMeProgress, setOpponentProgress, setTotalMistakes, setOpponentMistakes, setStartTime } = gameSlice.actions;
export default gameSlice.reducer;