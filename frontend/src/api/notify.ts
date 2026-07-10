import { notifications } from "@mantine/notifications";

import { getErrorMessage } from "@/api/error";

const shownErrors = new Map<string, number>();

export function notifyErrorOnce(error: unknown) {
  const message = getErrorMessage(error);

  const now = Date.now();
  const lastShown = shownErrors.get(message);

  if (lastShown && now - lastShown < 5000) return;

  shownErrors.set(message, now);

  notifications.show({
    title: "Error",
    message,
    color: "red",
  });

  setTimeout(() => {
    shownErrors.delete(message);
  }, 5000);
}

export function notifySuccess(message: string) {
  notifications.show({
    title: "Success",
    message,
    color: "#636363",
  });
}