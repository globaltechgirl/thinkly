import { CSSProperties, FC, useEffect, useState } from "react";

import { Box, Image, Text } from "@mantine/core";
import { IconUserCircle, IconX } from "@tabler/icons-react";
/* import { IconUser } from 'nucleo-glass'; */

import Logo from "@/assets/logo.svg";
import LinkIcon from "@/assets/icons/link";

import { Quiz } from "@/types/quiz";

import Toast from "../layout/toast";

const Share: FC<{ onClose: () => void; quiz: Quiz }> = ({ onClose, quiz }) => {
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
      maxWidth: screenMode === "small" ? "none" : 420,
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
      padding: 25,
      textAlign: "center"
    },
    label: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6
    },
    icons: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      position: "relative",
    },
    icon: {
      width: 50,
      height: 50,
      borderRadius: 10,
      border: "2px solid var(--border-100)",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
      position: "relative",
      padding: 1.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    icon1: {
      width: 25, 
      height: 25,
      color: "var(--dark-200)",
    },
    icon2: {
      position: "absolute", 
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)", 
      width: 18,
      height: 18,
      color: "var(--dark-200)",
      border: "2px solid var(--border-100)",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
      borderRadius: "50%",
      padding: 4,
      zIndex: 10,
    },
    bottom: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 8,
      width: "100%",
    },
    input: {
      flex: 1,
      padding: "9px 12px",
      height: 42,
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      borderRadius: 10,
      backgroundColor: "var(--light-400)",
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      display: "block",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      outline: "none",
    },
    button: {
      flex: 0.2,
      padding: "0 12px",
      height: 42,
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
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; status: "success" | "error"; } | null>(null);

  const quizLink = quiz?.quizLink ?? "";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); };
  }, [onClose]);

  const copyDomain = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);
      setToast({
        message: "Domain copied successfully!",
        status: "success",
      });

      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast({
        message: "Copy failed",
        status: "error",
      });

      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <>
      <Box style={styles.container}>
        <Box onClick={(e) => e.stopPropagation()} style={styles.wrapper} className="scroll">
          <Box style={styles.main}>
            <Box style={styles.header}>
              <Text style={styles.title}>Share Quiz</Text>
              <IconX style={styles.close} onClick={onClose} />
            </Box>

            <Box style={styles.content}>
              <Box style={styles.icons}>
                <Box style={styles.icon}><Image src={Logo} style={styles.icon1} /></Box>
                <LinkIcon style={styles.icon2} />
                <Box style={styles.icon}><IconUserCircle style={styles.icon1} /></Box>
              </Box>

              <Text style={styles.label}>Anyone with this link can access the quiz instantly</Text>
            </Box>

            <Box style={styles.bottom}>
              <Box style={styles.input}>{quizLink}</Box>

              <Box
                style={{ ...styles.button, backgroundColor: hovered ? "var(--light-400)" : "var(--light-200)", opacity: copied ? 0.7 : 1, pointerEvents: copied ? "none" : "auto" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => { if (quizLink) copyDomain(quizLink); }}
              >
                {copied ? "Copied" : "Copy"}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {toast && <Toast message={toast.message} status={toast.status} />}
    </>
  );
};

export default Share;