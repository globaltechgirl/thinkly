import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

import App from "@/App.tsx";
import "@/index.css";
import { ThemeProvider } from "@/component/layout/themeContext";
import { AuthProvider } from "@/component/layout/authContext";

const stripUrlQuery = () => {
  const { pathname } = window.location;
  if (window.location.search) {
    window.history.replaceState({}, "", pathname);
  }
};

const originalPushState = window.history.pushState;
window.history.pushState = function (...args) {
  const [state, title, url] = args;
  if (typeof url === "string") {
    const cleanUrl = url.split("?")[0];
    return originalPushState.call(this, state, title, cleanUrl);
  }
  return originalPushState.apply(this, args);
};

const originalReplaceState = window.history.replaceState;
window.history.replaceState = function (...args) {
  const [state, title, url] = args;
  if (typeof url === "string") {
    const cleanUrl = url.split("?")[0];
    return originalReplaceState.call(this, state, title, cleanUrl);
  }
  return originalReplaceState.apply(this, args);
};

window.addEventListener("popstate", stripUrlQuery);

stripUrlQuery();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);

