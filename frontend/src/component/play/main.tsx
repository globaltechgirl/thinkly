import { CSSProperties, FC, useEffect, useState } from "react";

import { Box, Text } from "@mantine/core";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import { useQuiz } from "@/hooks/use-quiz";
import { ROUTES } from "@/utils/constants";

import Toast from "../layout/toast";

import Icon from "@/assets/icon.jpg";
import Logo from "@/assets/logo.svg?react";

import BookmarkIcon from "@/assets/icons/bookmark";
import BuildingIcon from "@/assets/icons/building";
import CalendarIcon from "@/assets/icons/calendar";
import CopyIcon from "@/assets/icons/copy";
import EmailIcon from "@/assets/icons/email";
import PeoplesIcon from "@/assets/icons/peoples";

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    height: "100vh",
    overflow: "hidden",
  },
  wrapper: {
    display: "flex",
    width: "100%",
    height: "100vh",
    position: "relative",
    padding: "8px 0px"
  },
  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    paddingBottom: 60, 
  },
  body: {
    width: "40%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 40,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  logo: {
    width: 30,
    height: 30,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 25,
  },
  infos: {
    flex: 1,                 
    minHeight: 0,
    minWidth: 0,
    flexShrink: 0,
    display: "flex",  
    flexDirection: "column",
    width: "100%",
    gap: 25,
    position: "relative",
    padding: "30px 25px",
    borderRadius: 10,
    backgroundColor: "var(--light-400)",
    border: "1.5px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
  },
  info: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
  },
  left1: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    width: 180,
  },
  icon: {
    width: 14,
    height: 14,
    color: "var(--dark-200)",
  },
  label: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
  },
  right1: {
    flex: 1,
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-00)",
    lineHeight: 1.6,
    textAlign: "justify",
    overflowWrap: "break-word",
    wordBreak: "break-word",
    whiteSpace: "normal",
  },
  rights: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    objectFit: "cover",
    objectPosition: "top",
    border: "1px solid var(--border-100)",
    borderRadius: "50%",
    flexShrink: 0,
  },
  button: {
    padding: "0 12px",
    height: 42,
    cursor: "pointer",
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    borderRadius: 10,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid var(--blue-300)",
    boxShadow: `inset 0 0 8px 1px rgba(255, 255, 255, 0.12)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  bottom: {
    position: "absolute",
    bottom: 15,         
    left: "3%",       
    right: "3%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-200)",
  },
  loading: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-200)",
    padding: 40,
    textAlign: "center",
  },
};

type ScreenMode = "desktop" | "medium" | "small";

const getScreenMode = (width: number): ScreenMode => {
  if (width <= 640) return "small";
  if (width <= 1024) return "medium";
  return "desktop";
};

const Main: FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const { currentQuiz, playQuizBySlug, loadingRef, error } = useQuiz();
  const loading = loadingRef.current.fetchOne;

  const quiz = currentQuiz?.quiz;
  const creatorImage = quiz?.creatorImage || Icon;

  const [toast, setToast] = useState<{ message: string; status: "success" | "error"; } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [screenMode, setScreenMode] = useState<ScreenMode>("desktop");

  useEffect(() => {
    if (!slug) return;

    const loadQuiz = async () => {
      try {
        await playQuizBySlug(slug);
      } catch (err) {
        console.error("Failed to load quiz:", err);
      }
    };

    loadQuiz();
  }, [slug, playQuizBySlug]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setTimeout(() => setVisible(true), 80);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const update = () => setScreenMode(getScreenMode(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleHover = (key: string) => ({
    onMouseEnter: () => setHovered(key),
    onMouseLeave: () => setHovered(null),
  });

  const baseAnim = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(20px)",
    transition: `
      opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s,
      transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s
    `,
    willChange: "transform, opacity",
  });

  const handleConnect = () => {
    if (loading) return;

    navigate(ROUTES.GUEST, {
      state: { mode: "guest", quiz },
    });
  };

  const copyEmail = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ message: "Email copied successfully!", status: "success", });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ message: "Copy failed", status: "error", });
      setTimeout(() => setToast(null), 2000);
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Box style={styles.main}><Text style={styles.loading}>Loading quiz...</Text></Box>
    );
  }

  if (error) {
    return (
      <Box style={styles.main}><Text style={styles.loading}>{error}</Text></Box>
    );
  }

  if (!quiz) {
    return (
      <Box style={styles.main}><Text style={styles.loading}>No quiz found</Text></Box>
    );
  }

  return (
    <>
      <Box style={styles.container}>
        <Box style={styles.wrapper}>
          <motion.div
            style={styles.left}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box style={{ ...styles.body, width: screenMode === "small" ? "85%" : screenMode === "medium" ? "70%" : styles.body.width }}>
              <Box style={styles.main}>
                <Logo style={{ ...styles.logo, ...baseAnim(0.05) }} />
              </Box>

              <Box style={styles.content}>
                <Box style={{ ...styles.infos, ...baseAnim(0.10) }}>
                  <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                    <Box style={styles.left1}>
                      <BookmarkIcon style={styles.icon} />
                      <Text style={styles.label}>Quiz Name</Text>
                    </Box>
                    <Text style={styles.right1}>{quiz.quizName}</Text>
                  </Box>

                  <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                    <Box style={styles.left1}>
                      <BuildingIcon style={styles.icon} />
                      <Text style={styles.label}>Company</Text>
                    </Box>
                    <Text style={styles.right1}>{quiz.companyName}</Text>
                  </Box>

                  <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                    <Box style={styles.left1}>
                      <PeoplesIcon style={styles.icon} />
                      <Text style={styles.label}>Contact Name</Text>
                    </Box>

                    <Box style={styles.rights}>
                      <img src={creatorImage} alt="creator" style={styles.avatar}/>
                      <Box style={styles.right1}>{quiz.contactName}</Box>
                    </Box>
                  </Box>

                  <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                    <Box style={styles.left1}>
                      <EmailIcon style={{...styles.icon, width: 15, height: 15}} />
                      <Text style={styles.label}>Contact Email</Text>
                    </Box>
                    <Box style={styles.rights}>
                      <Text style={styles.right1}>{quiz.contactEmail}</Text>
                      <CopyIcon style={{ ...styles.icon, cursor: "pointer" }} onClick={() => { if (quiz.contactEmail) copyEmail(quiz.contactEmail); }} />
                    </Box>
                  </Box>

                  <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                    <Box style={styles.left1}>
                      <CalendarIcon style={styles.icon} />
                      <Text style={styles.label}>End Date</Text>
                    </Box>
                    <Text style={styles.right1}>{formatDate(quiz.endTime)}</Text>
                  </Box>
                </Box>

                <Box
                  style={{ ...styles.button, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer", ...baseAnim(0.18) }}
                  onClick={!loading ? handleConnect : undefined}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "var(--light-400)"; } }}
                  onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "var(--light-200)"; } }}
                >
                  {loading ? "Connecting..." : "Connect"}
                </Box>
              </Box>
            </Box>

            <Box style={{ ...styles.bottom, ...baseAnim(0.15) }}>
              <Text style={styles.text}>© 2026 Thinkly</Text>
              <Text style={styles.text}>
                Don't have an account? {" "}
                <span 
                  {...handleHover("link")}
                  onClick={() => navigate(ROUTES.REGISTER)}
                  style={{ 
                    cursor: "pointer",
                    color: "var(--dark-100)",
                    textDecoration: hovered === "link" ? "underline" : "none",
                    textUnderlineOffset: "2px", 
                  }}
                >
                  Sign Up
                </span>
              </Text>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {toast && <Toast message={toast.message} status={toast.status} />}
    </>
  );
};

export default Main;