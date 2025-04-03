import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice.ts';
import userReducer from './userSlice.ts';

const store = configureStore({
    reducer: {
        game: gameReducer,
        user: userReducer
    },
});

export default store;