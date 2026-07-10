export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin" | "guest";
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt?: string;
  isGuest?: boolean;
  guestId?: string | null;
}

export interface UpdateProfileValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  role: "user" | "admin";
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}
