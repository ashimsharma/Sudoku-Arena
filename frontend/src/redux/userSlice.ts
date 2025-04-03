import { createSlice } from '@reduxjs/toolkit';

interface User {
    id: string
    name: string
    avatarUrl: string
    email: string
}

interface InitialState {
    user: null | User
}

const initialState: InitialState = {
    user: null
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user
        }
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;