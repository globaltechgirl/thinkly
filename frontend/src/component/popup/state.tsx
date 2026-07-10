import { FC, CSSProperties, useState, useEffect } from "react";

import { Box, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

import { Quiz } from "@/types/quiz";

const State: FC<{ onClose: () => void; onConfirm: () => void; quiz: Quiz; loading?: boolean }> = ({ onClose, onConfirm, quiz, loading = false }) => {
  const [screenMode, setScreenMode] = useState<"small" | "medium" | "large">("large");

  useEffect(() => {
    const checkScreenMode = () => {
      setScreenMode(window.innerWidth < 768 ? "small" : window.innerWidth < 1024 ? "medium" : "large");
    };

    checkScreenMode();
    window.addEventListener("resize", checkScreenMode);
    return () => window.removeEventListener("resize", checkScreenMode);
  }, []);

  const styles: Record<string, CSSProperties> = {
    container: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(2px)",
      WebkitBackdropFilter: "blur(2px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: screenMode === "small" ? 18 : 0,
    },
    wrapper: {
      width: "100%",
      maxWidth: screenMode === "small" ? "none" : 360,
      maxHeight: "90vh",
      animation: "slideInTop 0.3s ease",
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      padding: 15
    },
    main: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      width: "100%",
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
    },
    header: {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: "clamp(12px, 1vw, 14px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    close: {
      width: 16,
      height: 16,
      color: "var(--dark-200)",
      cursor: "pointer",
    },
    content: {
      flex: 1,                 
      minHeight: 0,
      display: "flex",  
      flexDirection: "column",
      width: "100%",
      gap: 25,
      minWidth: 0,
      padding: "30px 0px 0px",
      textAlign: "center"
    },
    label: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6,
      padding: "0px 15px 0px",
    },
    bottom: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 10,
      width: "100%",
    },
    button: {
      flex: 0.2,
      padding: "0 12px",
      height: 42,
      minHeight: 42,
      cursor: "pointer",
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      borderRadius: 10,
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
    },
  };

  const [hovered, setHovered] = useState(false);
  
  const status = quiz.runtimeStatus ?? "INACTIVE";
  const effectiveStatus = status === "PUBLISHED" ? "INACTIVE" : status;

  const title =
    effectiveStatus === "INACTIVE" ? "Start Quiz"
      : effectiveStatus === "PAUSED" ? "Resume Quiz"
        : effectiveStatus === "ENDED" ? "Quiz Ended"
          : "Pause Quiz";

  const subtitle =
    effectiveStatus === "INACTIVE" ? "Are you sure you want to start this quiz?"
      : effectiveStatus === "PAUSED" ? "Are you sure you want to resume this quiz?"
        : effectiveStatus === "ENDED" ? "This quiz has ended. No further actions are allowed."
          : "Are you sure you want to pause this quiz?";

  const buttonText =
    effectiveStatus === "INACTIVE" ? "Start"
      : effectiveStatus === "PAUSED" ? "Resume"
        : effectiveStatus === "ENDED" ? "Closed"
          : "Pause";

  const loadingText =
    effectiveStatus === "INACTIVE" ? "Starting..."
      : effectiveStatus === "PAUSED" ? "Resuming..."
        : effectiveStatus === "ENDED" ? ""
          : "Pausing...";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <Box style={styles.container}>
      <Box onClick={(e) => e.stopPropagation()} style={styles.wrapper} className="scroll">
        <Box style={styles.main}>
          <Box style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <IconX style={styles.close} onClick={onClose} />
          </Box>

          <Box style={styles.content}>
            <Text style={styles.label}>{subtitle}</Text>

            <Box
              style={{ ...styles.button, backgroundColor: hovered ? "var(--light-400)" : "var(--light-200)", opacity: loading ? 0.7 : 1, pointerEvents: loading ? "none" : "auto" }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={onConfirm}
            >
              {loading ? loadingText : buttonText}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default State;