import { configureStore } from '@reduxjs/toolkit';
import userReducer from './websocketSlice.ts';

const store = configureStore({
    reducer: {
        userType: userReducer,
    },
});

export default store;