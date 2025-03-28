import { configureStore } from '@reduxjs/toolkit';
import userReducer from './gameSlice.ts';

const store = configureStore({
    reducer: {
        userType: userReducer,
    },
});

export default store;