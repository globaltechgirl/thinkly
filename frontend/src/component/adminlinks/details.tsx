import { FC, CSSProperties, useEffect, useState } from "react";

import { Box, Text } from "@mantine/core";

import Toast from "../layout/toast";
import LinkTag from "./tag";

import { useUsers } from "@/hooks/use-users";
import quizService from "@/services/quiz";
import type { Quiz, QuizWithQuestions } from "@/types/quiz";

import { IconX } from "@tabler/icons-react";
import { IconArrowsBoldOppositeDirection } from "nucleo-glass";
import Icon from "@/assets/icon.jpg";
import BookmarkIcon from "@/assets/icons/bookmark";
import BuildingIcon from "@/assets/icons/building";
import CalendarIcon from "@/assets/icons/calendar";
import CirclexIcon from "@/assets/icons/circlex";
import CirclesIcon from "@/assets/icons/circles";
import CopyIcon from "@/assets/icons/copy";
import EmailIcon from "@/assets/icons/email";
import GridIcon from "@/assets/icons/grid";
import LinkIcon from "@/assets/icons/link";
import PauseIcon from "@/assets/icons/pause";
import PeoplesIcon from "@/assets/icons/peoples";

import LinkQuiz from "@/component/adminlinks/quiz";

export const formatStatus = (value?: string) => {
  if (!value) return "-";
  return value.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
};

const Details: FC<{ onClose: () => void; quizId?: string }> = ({ onClose, quizId }) => {
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
      alignItems: "stretch",
      justifyContent: "flex-end",
      zIndex: 9999,
      padding: "10px 0px 10px 10px",
    },
    wrapper: {
      width: 680,
      height: "100%",
      overflowY: "auto",
      animation: "slideInRight 0.3s ease",
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
      gap: 35
    },
    header: {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: "clamp(13px, 1.1vw, 15px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    close: {
      width: 16,
      height: 16,
      color: "var(--dark-200)",
      cursor: "pointer",
    },
    infos: {
      flex: 1,                 
      minHeight: 0,
      display: "flex",  
      flexDirection: "column",
      width: "100%",
      gap: 25,
      minWidth: 0,
    },
    info: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      width: "100%",
    },
    left: {
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
    right: {
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
      justifyContent: "flex-start",
      gap: 8,
    },
    avatar: {
      width: 20,
      height: 20,
      objectFit: "cover",
      objectPosition: "top",
      border: "1px solid var(--border-100)",
      borderRadius: "50%",
      flexShrink: 0,
    },
    status: {    
      padding: "2.5px 10px",
      display: "inline-block",
      borderRadius: 10,
      fontSize: "clamp(9.5px, 0.75vw, 11.5px)",
      fontWeight: 450,
      textTransform: "capitalize",
      width: "100%",
      maxWidth: "fit-content",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      textAlign: "center",
    },
    toggle: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "4.5px 10px",
      fontSize: "clamp(9.5px, 0.75vw, 11.5px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      textTransform: "capitalize",
      borderRadius: 12,
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      width: "100%",
      maxWidth: "fit-content",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      textAlign: "center",
    },
    icona: {
      width: 13,
      height: 13,
    },
    loading: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: 40,
      textAlign: "center",
    },
  };

  const [data, setData] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"quiz" | "list">("quiz");

  const [toast, setToast] = useState<{ message: string; status: "success" | "error"; } | null>(null);
  const [isToggleHovered, setIsToggleHovered] = useState(false);

  const [user, setUser] = useState<any>(null);
  const { getProfile } = useUsers();

  const name = user?.fullName || "User";
  const profileImage = user?.profilePicture || null;

  const safeQuestions =
    data?.questions?.map((q) => ({
      id: q.id ?? "",
      question: q.question ?? "",
      options: q.options ?? [],
      correctOption: typeof q.correctOption === "number" ? q.correctOption : undefined,
    })) ?? [];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {}
    };

    loadUser();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); };
  }, [onClose]);

  useEffect(() => {
    if (!quizId) return;
    let isMounted = true;
    
    const fetchQuiz = async () => {
      try {
        setLoading(true); setError(null);
        const res = await quizService.getAdminOne(quizId);
        if (!isMounted) return;

        if (!res?.quiz) {
          setError("Quiz not found");
          setData(null);
          return;
        }

        setData({
          quiz: res.quiz,
          questions: Array.isArray(res.questions)
            ? res.questions
            : [],
          attempts: Array.isArray(res.attempts)
            ? res.attempts
            : [],
        });
      } catch (err) {
        if (!isMounted) return;

        setError("Failed to load quiz");
        setData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();

    return () => {
      isMounted = false;
    };
  }, [quizId]);

  const getRuntimeStatusColor = (
    status: NonNullable<Quiz["runtimeStatus"]> = "INACTIVE",
  ) => {
    if (status === "ACTIVE" || status === "PUBLISHED") {
      return {
        bg: "var(--blue-100)",
        color: "var(--blue-300)",
        border: "var(--blue-200)",
      };
    }

    if (status === "PAUSED") {
      return {
        bg: "var(--yellow-100)",
        color: "var(--yellow-300)",
        border: "var(--yellow-200)",
      };
    }

    if (status === "ENDED") {
      return {
        bg: "var(--red-100)",
        color: "var(--red-300)",
        border: "var(--red-200)",
      };
    }

    return {
      bg: "var(--dark-100)",
      color: "var(--dark-300)",
      border: "var(--dark-200)",
    };
  };

  const runtimeStatusColor = getRuntimeStatusColor(
    data?.quiz?.runtimeStatus,
  );

  const getStatusIcon = (
    status: Quiz["runtimeStatus"] = "INACTIVE",
  ) => {
    if (status === "ACTIVE") {
      return <PauseIcon style={styles.icon} />;
    }

    if (status === "PAUSED") {
      return <CirclexIcon style={styles.icon} />;
    }

    if (status === "ENDED") {
      return <CirclesIcon style={styles.icon} />;
    }

    return <PauseIcon style={styles.icon} />;
  };

  const copyDomain = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ message: "Domain copied successfully!", status: "success", });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ message: "Copy failed", status: "error", });
      setTimeout(() => setToast(null), 2000);
    }
  };

  const copyEmail = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ message: "Email copied successfully!", status: "success" });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ message: "Copy failed", status: "error" });
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

  return (
    <>
      <Box style={styles.container} onClick={onClose}>
        <Box onClick={(e) => e.stopPropagation()} style={styles.wrapper} className="scroll">
          {loading && ( <Text style={styles.loading}>Loading quiz...</Text> )}

          {!loading && error && ( <Text style={styles.loading}>{error}</Text> )}

          {!loading && !error && !data && ( <Text style={styles.loading}>No quiz found</Text> )}

          {!loading && !error && data && (
            <Box style={styles.main}>
              <Box style={styles.header}>
                <Text style={styles.title}>{data?.quiz?.quizName}</Text>
                <IconX style={styles.close} onClick={onClose} />
              </Box>

              <Box style={styles.infos}>
                <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                  <Box style={styles.left}>
                    <BuildingIcon style={styles.icon} />
                    <Text style={styles.label}>Company</Text>
                  </Box>
                  <Text style={styles.right}>{data?.quiz?.companyName}</Text>
                </Box>

                <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                  <Box style={styles.left}>
                    <LinkIcon style={styles.icon} />
                    <Text style={styles.label}>Domain</Text>
                  </Box>
                  <Box style={styles.rights}>
                    <Text style={{ ...styles.right, textDecoration: "underline" }}>{data?.quiz?.quizLink}</Text>
                    <CopyIcon style={{ ...styles.icon, cursor: "pointer" }} onClick={() => { if (data?.quiz?.quizLink) copyDomain(data.quiz.quizLink); }} />
                  </Box>
                </Box>

                <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                  <Box style={styles.left}>
                    <BookmarkIcon style={{...styles.icon, width: 15, height: 15}} />
                    <Text style={styles.label}>Created By</Text>
                  </Box>
                  <Box style={{...styles.rights, ...styles.right}}>
                    {profileImage ? ( <img src={profileImage} alt="icon" style={styles.avatar} /> ) : ( <img src={Icon} alt="icon" style={styles.avatar} /> )}
                    <Text style={styles.right}>{name}</Text>
                  </Box>
                </Box>

                <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                  <Box style={styles.left}>
                    <PeoplesIcon style={styles.icon} />
                    <Text style={styles.label}>Contact Name</Text>
                  </Box>
                  <Box style={styles.right}>
                    <Text style={styles.right}>{data?.quiz?.contactName}</Text>
                  </Box>
                </Box>

                <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                  <Box style={styles.left}>
                    <EmailIcon style={{...styles.icon, width: 15, height: 15}} />
                    <Text style={styles.label}>Contact Email</Text>
                  </Box>
                  <Box style={styles.rights}>
                    <Text style={styles.right}>{data?.quiz?.contactEmail}</Text>
                    <CopyIcon style={{ ...styles.icon, cursor: "pointer" }} onClick={() => { if (data?.quiz?.contactEmail) copyEmail(data?.quiz?.contactEmail); }} />
                  </Box>
                </Box>

                <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                  <Box style={styles.left}>
                    {getStatusIcon(data?.quiz?.runtimeStatus)}
                    <Text style={styles.label}>Status</Text>
                  </Box>
                  <Text style={{ ...styles.status, backgroundColor: runtimeStatusColor.bg, color: runtimeStatusColor.color }}>
                    {formatStatus(data?.quiz?.runtimeStatus)}
                  </Text>
                </Box>

                <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                  <Box style={styles.left}>
                    <CalendarIcon style={styles.icon} />
                    <Text style={styles.label}>End Date</Text>
                  </Box>
                  <Text style={styles.right}>{formatDate(data?.quiz?.endTime)}</Text>
                </Box>

                <Box style={{ ...styles.info, flexDirection: screenMode === "small" ? "column" : "row", gap: screenMode === "small" ? 12 : 0 }}>
                  <Box style={styles.left}>
                    <GridIcon style={styles.icon} />
                    <Text style={styles.label}>View</Text>
                  </Box>
                  <Box 
                    style={{ ...styles.toggle, backgroundColor: isToggleHovered ? "var(--light-400)" : "var(--light-200)" }} 
                    onClick={() => setActiveTab((prev) => (prev === "quiz" ? "list" : "quiz"))}
                    onMouseEnter={() => setIsToggleHovered(true)} 
                    onMouseLeave={() => setIsToggleHovered(false)}
                  >
                    <IconArrowsBoldOppositeDirection style={styles.icona} />
                    {activeTab === "quiz" ? "Quiz View" : "List View"}
                  </Box>
                </Box>
              </Box>

              {activeTab === "quiz" && data?.questions && (<LinkQuiz questionsFromApi={safeQuestions} isAdmin={user?.role === "admin"}  />)}
              {activeTab === "list" && quizId && (<LinkTag quizId={quizId} />)}
            </Box>
          )}
        </Box>
      </Box>

      {toast && <Toast message={toast.message} status={toast.status} />}
    </>
  );
};

export default Details;