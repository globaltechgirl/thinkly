import { FC, CSSProperties } from "react";
import { Box, Text } from "@mantine/core";

interface ToastProps {
  message: string;
  status: "success" | "error";
}

const styles: Record<string, CSSProperties> = {
  outer: {
    position: "fixed",
    bottom: 20,
    right: 25,
    width: 250,
    cursor: "pointer",
    zIndex: 9999,
  },
  inner: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "var(--light-400)",
    border: "2px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
    padding: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",   
  },
  text: {
    textAlign: "center",
    width: "100%",
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
  },
};

const Toast: FC<ToastProps> = ({ message }) => {
  return (
    <Box style={styles.outer}>
      <Box style={styles.inner}>
        <Text style={styles.text}>{message}</Text>
      </Box>
    </Box>
  );
};

export default Toast;