import { UseFormReturnType } from "@mantine/form";
import { UserProfile } from "@/types/users";

export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues {
  fullName: string;
  email: string;
  password: string;
}

export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: UserProfile;
}

export interface AuthState {
  loggedIn: boolean;
  token: string | null;
}

export interface UpdateProfileValues {
  fullName: string;
  role: "user" | "admin"; 
}

export interface LoginFormProps {
  form: UseFormReturnType<LoginValues>;
  handleSubmit: (values: LoginValues) => void;
  loading: boolean;
}

export interface RegisterFormProps {
  form: UseFormReturnType<RegisterValues>;
  handleSubmit: (values: RegisterValues) => void;
  loading: boolean;
}

export interface UpdateProfileFormProps {
  form: UseFormReturnType<UpdateProfileValues>;
  handleSubmit: (values: UpdateProfileValues) => void;
  loading: boolean;
}