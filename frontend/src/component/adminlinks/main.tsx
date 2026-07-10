import { FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Box, Button, Image, Text } from "@mantine/core";

import { useQuiz } from "@/hooks/use-quiz";
import quizService, { setQuizRefetchHandler } from "@/services/quiz";
import type { Quiz, QuizWithQuestions } from "@/types/quiz";

import { notifySuccess } from "@/api/notify";

import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  IconCircleInfoOutlineDuo18,
  IconPenSparkleOutlineDuo18,
  IconHalfDottedCirclePlayOutlineDuo18,
  IconSitemap4OutlineDuo18,
  IconTrashOutlineDuo18,
  IconPaperPlane2OutlineDuo18,
} from "nucleo-ui-essential-outline-duo-18";
import Icon from "@/assets/icon.jpg";

import DetailsPopup from "./details";
import SharePopup from "../popup/share";
import DeletePopup from "../popup/delete";
import StatePopup from "../popup/state";
import UpdatePopup from "../popup/update";
import PublishPopup from "../popup/publish";
import { useTheme } from "../layout/themeContext";

export const formatStatus = (value?: string) => {
  if (!value) return "-";
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

type Props = {
  initialQuiz?: Quiz;
};

const List: FC<Props> = ({ initialQuiz }) => {
  const styles = {
    container: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 15,
    },
    table: {
      width: "100%",
      height: "100%",
      overflowX: "auto",
      overflowY: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    },
    cell1: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      padding: "8px 12px 8px 16px",
      minWidth: 0,
      width: "100%",
    },
    cell2: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      padding: "12px 12px 12px 16px",
      minWidth: 0,
      width: "100%",
    },
    headers: {
      display: "grid",
      gridTemplateColumns:
        "0.05fr minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 0.8fr)",
      minWidth: 920,
      borderRadius: 10,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      alignItems: "center",
      padding: "0 12px",
      marginBottom: 2,
    },
    header: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
    },
    rows: {
      display: "flex",
      flexDirection: "column",
    },
    row: {
      display: "grid",
      gridTemplateColumns:
        "0.05fr minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 0.8fr)",
      minWidth: 920,
      alignItems: "center",
      padding: "0 12px",
      borderBottom: "1.5px solid var(--border-100)",
      boxShadow: "0 0.5px 0 0 var(--border-300)",
    },
    text: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "100%",
    },
    checks: {
      width: 16,
      height: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      border: "1px solid var(--border-100)",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 0.5px 1px var(--shadow-100)",
      cursor: "pointer",
    },
    checked: {
      width: 16,
      height: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      border: "1px solid var(--border-100)",
      background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
      boxShadow: `inset 0 0 6px 1px rgba(191, 219, 254, 0.45)`,
      cursor: "pointer",
    },
    check: {
      width: 10,
      height: 10,
      color: "#ffffff",
    },
    menus: {
      position: "absolute",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%) translateY(10px)",
      opacity: 0,
      animation: "menuSlideUp 240ms cubic-bezier(0.23, 1, 0.320, 1) forwards",
      width: "max-content",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backgroundColor: "var(--light-300)",
      padding: 4,
      borderRadius: 10,
      gap: 4,
    },
    menu1: {
      fontSize: "clamp(10px, 0.8vw, 12px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      backgroundColor: "var(--light-400)",
      borderRadius: 8,
      padding: "6px 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      transition: "all 200ms cubic-bezier(0.23, 1, 0.320, 1)",
      boxShadow: "inset 0 0 4px 1px var(--shadow-100)",
    },
    menu2: {
      color: "var(--dark-200)",
    },
    compacts: {
      padding: 8,
      minWidth: 38,
      transition: "all 240ms cubic-bezier(0.23, 1, 0.320, 1)",
    },
    closed: {
      padding: "8px 6px",
      minWidth: 36,
      paddingRight: 0,
      transition: "all 240ms cubic-bezier(0.23, 1, 0.320, 1)",
    },
    labels: {
      display: "inline-block",
      maxWidth: "100%",
      opacity: 1,
      overflow: "hidden",
      whiteSpace: "nowrap",
      transition:
        "max-width 240ms cubic-bezier(0.23, 1, 0.320, 1), opacity 240ms cubic-bezier(0.23, 1, 0.320, 1), margin-left 240ms cubic-bezier(0.23, 1, 0.320, 1)",
    },
    compact: {
      maxWidth: 0,
      opacity: 0,
      marginLeft: 0,
    },
    expanded: {
      maxWidth: 140,
      opacity: 1,
      marginLeft: 6,
    },
    domain: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      textDecoration: "underline",
      cursor: "pointer",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "100%",
    },
    avatars: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
      width: "100%",
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
    extras: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "var(--light-300)",
      border: "1px solid var(--border-100)",
    },
    extra: {
      fontSize: "clamp(8px, 0.6vw, 10px)",
      fontWeight: 450,
      color: "var(--dark-200)",
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
    position: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
      width: "100%",
    },
    iconb: {
      width: 18,
      height: 18,
    },
    progress: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
      width: "100%",
    },
    bars: {
      display: "flex",
      alignItems: "flex-end",
      gap: 3,
    },
    bar: {
      width: 2.5,
      height: 14,
      backgroundColor: "var(--light-300)",
      borderRadius: 1,
    },
    fill: {
      height: 20,
    },
    filled: {
      backgroundColor: "var(--dark-300)",
    },
    loading: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: 40,
      textAlign: "center",
    },
    pagination: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      width: "100%",
      gap: 6,
    },
    span: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      border: "2px solid var(--border-100)",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
      borderRadius: 8,
      padding: "1.5px 9px",
      height: 26,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      border: "2px solid var(--border-100)",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
      borderRadius: 8,
      padding: "1.5px 3.4px",
      color: "var(--dark-200)",
    },
  } as const;

  const { quizzes, fetchAdminQuizzes, loading, error, fetchAdminQuiz } =
    useQuiz();
  const quizData = quizzes;

  const menuRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(quizData.length / itemsPerPage);
  const paginatedLinks = quizData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [checkedRow, setCheckedRow] = useState<string | null>(null);
  const [isCompactMenu, setIsCompactMenu] = useState(false);

  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const [openStatePopup, setOpenStatePopup] = useState(false);
  const [quizForState, setQuizForState] = useState<Quiz | null>(null);

  const [openPublishPopup, setOpenPublishPopup] = useState(false);
  const [quizToPublish, setQuizToPublish] = useState<Quiz | null>(null);

  const [openShareQuiz, setOpenShareQuiz] = useState(false);
  const [openUpdatePopup, setOpenUpdatePopup] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const [updateQuizData, setUpdateQuizData] =
    useState<QuizWithQuestions | null>(null);

  useEffect(() => {
    fetchAdminQuizzes();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsCompactMenu(event.matches);
      if (!event.matches) {
        setActiveMenuItem(null);
      }
    };

    onChange(mediaQuery);
    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsCompactMenu(event.matches);
      if (!event.matches) {
        setActiveMenuItem(null);
      }
    };

    onChange(mediaQuery);
    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    setQuizRefetchHandler(fetchAdminQuizzes);
  }, [fetchAdminQuizzes]);
  useEffect(() => {
    if (initialQuiz) {
      setSelectedQuiz(initialQuiz);
      setShowDetails(true);
    }
  }, [initialQuiz]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveRowMenu(null);
        setCheckedRow(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  type ActionType =
    | "start"
    | "pause"
    | "resume"
    | "delete"
    | "publish"
    | "state"
    | null;
  const [actionLoading, setActionLoading] = useState<{
    id: string | null;
    type: ActionType;
  }>({ id: null, type: null });

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

    if (status === "PAUSED")
      return {
        bg: "var(--yellow-100)",
        color: "var(--yellow-300)",
        border: "var(--yellow-200)",
      };

    if (status === "ENDED")
      return {
        bg: "var(--red-100)",
        color: "var(--red-300)",
        border: "var(--red-200)",
      };

    return {
      bg: "var(--dark-100)",
      color: "var(--dark-300)",
      border: "var(--dark-200)",
    };
  };

  const getProgressColor = (progress: number) => {
    if (progress > 60) {
      return {
        bg: "var(--green-100)",
        color: "var(--green-300)",
        border: "var(--green-200)",
      };
    }

    if (progress >= 30) {
      return {
        bg: "var(--yellow-100)",
        color: "var(--yellow-300)",
        border: "var(--yellow-200)",
      };
    }

    return {
      bg: "var(--red-100)",
      color: "var(--red-300)",
      border: "var(--red-200)",
    };
  };

  const getActionLabel = (user: Quiz) => {
    switch (user.runtimeStatus) {
      case "INACTIVE":
      case "PUBLISHED":
        return "Start";
      case "ACTIVE":
        return "Pause";
      case "PAUSED":
        return "Resume";
      case "ENDED":
        return "Ended";
      default:
        return "Start";
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

  const handleAction = async (
    id: string,
    type: ActionType,
    action: () => Promise<any>,
  ) => {
    try {
      setActionLoading({ id, type });
      await action();
      await fetchAdminQuizzes();
    } finally {
      setActionLoading({ id: null, type: null });
      setActiveRowMenu(null);
    }
  };

  const handleStartPauseResume = async (quiz: Quiz) => {
    const id = quiz.id;
    const status = quiz.runtimeStatus;

    await handleAction(id, "state", async () => {
      switch (status) {
        case "INACTIVE":
        case "PUBLISHED":
          await quizService.start(id);
          notifySuccess("Quiz started successfully");
          break;
        case "PAUSED":
          await quizService.resume(id);
          notifySuccess("Quiz resumed successfully");
          break;
        case "ACTIVE":
          await quizService.pause(id);
          notifySuccess("Quiz paused successfully");
          break;
        default:
          throw new Error("Invalid quiz status");
      }
    });
  };

  const confirmStateAction = async () => {
    if (!quizForState) return;
    await handleStartPauseResume(quizForState);
    setOpenStatePopup(false);
    setQuizForState(null);
  };

  const openState = (quiz: Quiz) => {
    setQuizForState(quiz);
    setOpenStatePopup(true);
    setActiveRowMenu(null);
  };

  const openDelete = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setOpenDeletePopup(true);
    setActiveRowMenu(null);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    await handleAction(quizToDelete.id, "delete", () =>
      quizService.remove(quizToDelete.id),
    );
    notifySuccess("Quiz deleted successfully");
    setOpenDeletePopup(false);
    setQuizToDelete(null);
  };

  const confirmPublish = async () => {
    if (!quizToPublish) return;
    await handleAction(quizToPublish.id, "publish", async () => {
      await quizService.publish(quizToPublish.id);
      notifySuccess("Quiz published successfully");
    });
    setOpenPublishPopup(false);
    setQuizToPublish(null);
  };

  const refreshQuizzes = async () => {
    await fetchAdminQuizzes();
  };

  const handleUpdateQuiz = async (quiz: Quiz) => {
    try {
      const fullQuiz = await fetchAdminQuiz(quiz.id);
      setUpdateQuizData(fullQuiz);
      setOpenUpdatePopup(true);
      setActiveRowMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTimeProgress = (
    endTime?: string | null,
    runtimeStatus?: string,
    activeDuration?: number,
    updatedAt?: string | null,
  ) => {
    if (!endTime) return 0;
    const end = new Date(endTime).getTime();
    const now = Date.now();
    let elapsed = activeDuration || 0;
    if (runtimeStatus === "ACTIVE" && updatedAt) {
      elapsed += now - new Date(updatedAt).getTime();
    }
    const total = end - (now - elapsed);
    const progress = (elapsed / total) * 100;
    return Math.min(100, Math.max(0, Number(progress.toFixed(2))));
  };

  const handleRowMenuClick = (
    e: React.MouseEvent<HTMLDivElement>,
    userId: string,
  ) => {
    e.stopPropagation();

    setCheckedRow((prev) => {
      const isSame = prev === userId;
      setActiveMenuItem(null);
      if (isSame) {
        setActiveRowMenu(null);
        return null;
      }
      setActiveRowMenu(userId);
      return userId;
    });
  };

  const RowMenuItem: FC<{
    itemId: string;
    icon: React.ReactNode;
    label: string;
    isExpanded: boolean;
    onToggle?: () => void;
    onClick?: () => void;
  }> = ({ itemId, icon, label, isExpanded, onToggle, onClick }) => {
    const [hover, setHover] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!isCompactMenu) {
        onClick?.();
        return;
      }

      if (isExpanded) {
        onToggle?.();
        onClick?.();
        return;
      }

      onToggle?.();
    };

    return (
      <Box
        data-item-id={itemId}
        style={{
          ...styles.menu1,
          ...(hover ? styles.menu2 : {}),
          ...(isCompactMenu
            ? isExpanded
              ? styles.compacts
              : styles.closed
            : {}),
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleClick}
      >
        {icon}
        <Box
          style={{
            ...styles.labels,
            ...(isCompactMenu ? styles.compact : {}),
            ...(isExpanded ? styles.expanded : {}),
          }}
        >
          {label}
        </Box>
      </Box>
    );
  };

  const PaginationControls = ({
    page,
    totalPages,
    setPage,
  }: {
    page: number;
    totalPages: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
  }) => (
    <Box style={styles.pagination}>
      <Button
        size="26"
        variant="outline"
        disabled={page === 1}
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        styles={{ root: styles.button }}
      >
        <IconChevronLeft size={16} />
      </Button>
      <Text style={styles.span}>{page}</Text>
      <Button
        size="26"
        variant="outline"
        disabled={page === totalPages}
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        styles={{ root: styles.button }}
      >
        <IconChevronRight size={16} />
      </Button>
    </Box>
  );

  const activeQuizData = paginatedLinks.find((q) => q.id === activeRowMenu);

  return (
    <>
      <Box style={styles.container}>
        <Box style={styles.table} className="scrollbar-hidden-sm-md">
          <Box style={styles.headers}>
            <Text style={{ ...styles.header, marginRight: -8 }}>
              <Box style={{ ...styles.checks, cursor: "default" }} />
            </Text>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Quiz Name</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Company</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Participants</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Status</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Progress</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>End Date</Text>
            </Box>
          </Box>

          <Box style={styles.rows}>
            {loading ? (
              <Text style={styles.loading}>Loading quizzes...</Text>
            ) : error ? (
              <Text style={styles.loading}>{error}</Text>
            ) : quizData.length === 0 ? (
              <Text style={styles.loading}>No quizzes found</Text>
            ) : (
              paginatedLinks.map((user, idx) => {
                const runtimeStatusColor = getRuntimeStatusColor(
                  user.runtimeStatus ?? "INACTIVE",
                );
                const timeProgress = calculateTimeProgress(
                  user.endTime,
                  user.runtimeStatus,
                  user.activeDuration,
                  user.updatedAt,
                );
                const filledBars = Math.round(timeProgress / 10);
                const progressColor = getProgressColor(timeProgress);
                const isLastRow = idx === paginatedLinks.length - 1;
                const { theme } = useTheme();
                const isLightTheme = theme === "light";

                return (
                  <Box
                    key={user.id}
                    style={{
                      ...styles.row,
                      borderBottom: isLastRow
                        ? "none"
                        : styles.row.borderBottom,
                      boxShadow: isLastRow ? "none" : styles.row.boxShadow,
                    }}
                  >
                    <Box>
                      {checkedRow === user.id ? (
                        <Box
                          style={styles.checked}
                          onClick={(e) => handleRowMenuClick(e, user.id)}
                        >
                          <IconCheck strokeWidth={2.5} style={styles.check} />
                        </Box>
                      ) : (
                        <Box
                          style={styles.checks}
                          onClick={(e) => handleRowMenuClick(e, user.id)}
                        />
                      )}
                    </Box>

                    <Box style={styles.cell2}>
                      <Text style={styles.text}>{user.quizName ?? ""}</Text>
                    </Box>

                    <Box style={styles.cell2}>
                      <Text style={styles.text}>{user.companyName ?? ""}</Text>
                    </Box>

                    <Box style={styles.cell2}>
                      <Box style={styles.avatars}>
                        {(user.participants ?? [])
                          .filter((p) => p?.id)
                          .slice(0, 4)
                          .map((p, index) => (
                            <Image
                              key={p.id}
                              src={p.avatar || Icon}
                              alt={p.name || "participant"}
                              style={{
                                ...styles.avatar,
                                marginLeft: index === 0 ? 0 : -14,
                                zIndex: 10 - index,
                              }}
                            />
                          ))}

                        {(user.participants ?? []).length > 4 && (
                          <Box
                            style={{
                              ...styles.avatar,
                              ...styles.extras,
                              marginLeft: -14,
                              zIndex: 0,
                            }}
                          >
                            <Text style={styles.extra}>
                              +{(user.participants ?? []).length - 4}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Box style={styles.cell2}>
                      <Text
                        style={{
                          ...styles.status,
                          backgroundColor: runtimeStatusColor.color,
                          color: runtimeStatusColor.bg,
                        }}
                      >
                        {formatStatus(user.runtimeStatus)}
                      </Text>
                    </Box>

                    <Box style={styles.cell2}>
                      <Box style={styles.progress}>
                        <Box style={styles.bars}>
                          {[...Array(10)].map((_, i) => {
                            return (
                              <Box
                                key={i}
                                style={{
                                  ...styles.bar,
                                  ...(i === 0 ? styles.fill : {}),
                                  backgroundColor: filledBars
                                    ? progressColor.color
                                    : isLightTheme
                                      ? progressColor.border
                                      : progressColor.bg,
                                }}
                              />
                            );
                          })}
                        </Box>

                        <Text
                          style={{
                            ...styles.text,
                            color: isLightTheme
                              ? progressColor.color
                              : progressColor.border,
                            marginBottom: -8,
                          }}
                        >
                          {timeProgress}%
                        </Text>
                      </Box>
                    </Box>

                    <Box style={styles.cell2}>
                      <Text style={styles.text}>
                        {formatDate(user.endTime)}
                      </Text>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          {activeRowMenu && activeQuizData && (
            <Box ref={menuRef} style={styles.menus}>
              <RowMenuItem
                itemId="info"
                icon={<IconCircleInfoOutlineDuo18 width={12} height={12} />}
                label="Info"
                isExpanded={activeMenuItem === "info"}
                onToggle={() => setActiveMenuItem((prev) => (prev === "info" ? null : "info"))}
                onClick={() => {
                  setSelectedQuiz(activeQuizData);
                  setShowDetails(true);
                  setActiveRowMenu(null);
                }}
              />

              <RowMenuItem
                itemId="update"
                icon={<IconPenSparkleOutlineDuo18 width={12} height={12} />}
                label="Update"
                isExpanded={activeMenuItem === "update"}
                onToggle={() => setActiveMenuItem((prev) => (prev === "update" ? null : "update"))}
                onClick={() => handleUpdateQuiz(activeQuizData)}
              />

              <RowMenuItem
                itemId="publish"
                icon={<IconPaperPlane2OutlineDuo18 width={12} height={12} />}
                label="Publish"
                isExpanded={activeMenuItem === "publish"}
                onToggle={() => setActiveMenuItem((prev) => (prev === "publish" ? null : "publish"))}
                onClick={() => {
                  setQuizToPublish(activeQuizData);
                  setOpenPublishPopup(true);
                  setActiveRowMenu(null);
                }}
              />

              <RowMenuItem
                itemId="state"
                icon={
                  <IconHalfDottedCirclePlayOutlineDuo18
                    width={12}
                    height={12}
                  />
                }
                label={
                  actionLoading.id === activeQuizData.id &&
                  actionLoading.type === "state"
                    ? "Processing"
                    : getActionLabel(activeQuizData)
                }
                isExpanded={activeMenuItem === "state"}
                onToggle={() => setActiveMenuItem((prev) => (prev === "state" ? null : "state"))}
                onClick={() => openState(activeQuizData)}
              />

              <RowMenuItem
                itemId="share"
                icon={
                  <Box style={{ transform: "rotate(-90deg)" }}>
                    <IconSitemap4OutlineDuo18 width={12} height={12} />
                  </Box>
                }
                label="Share"
                isExpanded={activeMenuItem === "share"}
                onToggle={() => setActiveMenuItem((prev) => (prev === "share" ? null : "share"))}
                onClick={() => {
                  setSelectedQuiz(activeQuizData);
                  setOpenShareQuiz(true);
                  setActiveRowMenu(null);
                }}
              />

              <RowMenuItem
                itemId="delete"
                icon={<IconTrashOutlineDuo18 width={12} height={12} />}
                label={
                  actionLoading.id === activeQuizData.id &&
                  actionLoading.type === "delete"
                    ? "Deleting"
                    : "Delete"
                }
                isExpanded={activeMenuItem === "delete"}
                onToggle={() => setActiveMenuItem((prev) => (prev === "delete" ? null : "delete"))}
                onClick={() => openDelete(activeQuizData)}
              />
            </Box>
          )}
        </Box>
      </Box>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

      {showDetails && selectedQuiz && (
        <DetailsPopup
          quizId={selectedQuiz.id}
          onClose={() => {
            setShowDetails(false);
            setSelectedQuiz(null);
          }}
        />
      )}
      {openShareQuiz &&
        selectedQuiz &&
        createPortal(
          <SharePopup
            onClose={() => setOpenShareQuiz(false)}
            quiz={selectedQuiz}
          />,
          document.body,
        )}
      {openUpdatePopup &&
        updateQuizData &&
        createPortal(
          <UpdatePopup
            quizData={updateQuizData}
            onClose={() => setOpenUpdatePopup(false)}
            onSuccess={refreshQuizzes}
          />,
          document.body,
        )}
      {openDeletePopup &&
        quizToDelete &&
        createPortal(
          <DeletePopup
            quiz={quizToDelete}
            onClose={() => {
              setOpenDeletePopup(false);
              setQuizToDelete(null);
            }}
            onConfirm={confirmDeleteQuiz}
            loading={
              actionLoading.id === quizToDelete?.id &&
              actionLoading.type === "delete"
            }
          />,
          document.body,
        )}
      {openStatePopup &&
        quizForState &&
        createPortal(
          <StatePopup
            quiz={quizForState}
            onClose={() => {
              setOpenStatePopup(false);
              setQuizForState(null);
            }}
            onConfirm={confirmStateAction}
            loading={
              actionLoading.id === quizForState?.id &&
              actionLoading.type === "state"
            }
          />,
          document.body,
        )}
      {openPublishPopup &&
        quizToPublish &&
        createPortal(
          <PublishPopup
            mode="publish"
            onClose={() => {
              setOpenPublishPopup(false);
              setQuizToPublish(null);
            }}
            onConfirm={confirmPublish}
            loading={
              actionLoading.id === quizToPublish.id &&
              actionLoading.type === "publish"
            }
          />,
          document.body,
        )}
    </>
  );
};

export default List;
