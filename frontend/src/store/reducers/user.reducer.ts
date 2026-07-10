import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ReduxSlices } from "@/types/enums";
import { UserProfile } from "@/types/users";

export const initialUserState: UserProfile = {
  _id: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  role: "user",
  profilePicture: "",
  createdAt: ""
};

export const userSlice = createSlice({
  name: ReduxSlices.User,
  initialState: initialUserState,
  reducers: {
    setUser: (_, action: PayloadAction<UserProfile>) => {
      return action.payload;
    },

    updateUser: (state, action: PayloadAction<Partial<UserProfile>>) => {
      return { ...state, ...action.payload };
    },

    logoutUser: () => initialUserState,
  },
});

export const { setUser, updateUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;