import axios from "axios";

export function getErrorMessage(error: unknown): string {
  // Axios error
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;

    if (error.message) return error.message;

    return "Request failed";
  }

  // JS runtime error
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error occurred";
}