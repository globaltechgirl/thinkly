import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AuthState } from "@/types/auth";
import { ReduxSlices } from "@/types/enums";

export const initialAuthState: AuthState = {
    loggedIn: false,
    token: null,
};

export const authSlice = createSlice({
  name: ReduxSlices.Auth,
  initialState: initialAuthState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },

    loginUser: (state, action: PayloadAction<string>) => {
      state.loggedIn = true;
      state.token = action.payload;
    },
  },
});

export const { setToken, loginUser } = authSlice.actions;

export default authSlice.reducer;