import { FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useNavigate } from "react-router-dom";
import { Box, Button, Text } from "@mantine/core";
import { ROUTES } from "@/utils/constants";

import { useQuiz } from "@/hooks/use-quiz";
import quizService, { setQuizRefetchHandler } from "@/services/quiz";
import type { Quiz } from "@/types/quiz";

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
} from "nucleo-ui-essential-outline-duo-18";
import Icon from "@/assets/icon.jpg";
import MedalIcon from "@/assets/icons/medal";

import Toast from "@/component/layout/toast";
import SharePopup from "@/component/popup/share";
import StatesPopup from "@/component/popup/states";
import DetailsPopup from "@/component/popup/details";
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

const Lists: FC<Props> = ({ initialQuiz }) => {
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

  const navigate = useNavigate();

  const { quizzes, fetchUserQuizzes, loading, error } = useQuiz();
  const quizData = quizzes;

  const menuRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(quizData.length / itemsPerPage);
  const paginatedLinks = quizData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const [openStatePopup, setOpenStatePopup] = useState(false);
  const [openShareQuiz, setOpenShareQuiz] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizForState, setQuizForState] = useState<Quiz | null>(null);

  const [popupMode, setPopupMode] = useState<"start">("start");
  const [popupLoading, setPopupLoading] = useState(false);

  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [checkedRow, setCheckedRow] = useState<string | null>(null);
  const [isCompactMenu, setIsCompactMenu] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    status: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchUserQuizzes();
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
    setQuizRefetchHandler(fetchUserQuizzes);
  }, [fetchUserQuizzes]);
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

  const formatPosition = (pos?: number | null) => {
    if (!pos || pos <= 0) return "No rank";
    const suffix =
      pos === 1 ? "st" : pos === 2 ? "nd" : pos === 3 ? "rd" : "th";
    return `${pos}${suffix} rank`;
  };

  const getAttemptStatusColor = (status: string = "PENDING") => {
    const normalized = status?.toUpperCase?.();

    if (normalized === "SUBMITTED" || normalized === "COMPLETED") {
      return {
        bg: "var(--blue-100)",
        color: "var(--blue-300)",
        border: "var(--blue-200)",
      };
    }

    if (normalized === "ONGOING" || normalized === "STARTED") {
      return {
        bg: "var(--yellow-100)",
        color: "var(--yellow-300)",
        border: "var(--yellow-200)",
      };
    }

    if (normalized === "PENDING" || !normalized) {
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

  const getPositionColor = (position: number = 0) => {
    if (position === 1) {
      return {
        bg: "var(--green-100)",
        color: "var(--green-300)",
        border: "var(--green-200)",
      };
    }

    if (position === 2) {
      return {
        bg: "var(--yellow-100)",
        color: "var(--yellow-300)",
        border: "var(--yellow-200)",
      };
    }

    if (position === 3) {
      return {
        bg: "var(--red-100)",
        color: "var(--red-300)",
        border: "var(--red-200)",
      };
    }

    return {
      bg: "var(--blue-100)",
      color: "var(--blue-300)",
      border: "var(--blue-200)",
    };
  };

  const openState = (quiz: Quiz) => {
    setQuizForState(quiz);
    setPopupMode("start");
    setOpenStatePopup(true);
    setActiveRowMenu(null);
  };

  const confirmStateAction = async () => {
    if (!quizForState) return;
    setPopupLoading(true);

    try {
      const res = await quizService.play(quizForState.id);
      navigate(`${ROUTES.QUIZ}/${quizForState.id}`, { state: res });
    } catch (err: any) {
    } finally {
      setPopupLoading(false);
      setOpenStatePopup(false);
      setQuizForState(null);
    }
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

  const copyDomain = async (domain: string) => {
    try {
      await navigator.clipboard.writeText(domain);
      setToast({ message: "Domain copied successfully!", status: "success" });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ message: "Failed to copy", status: "error" });
      setTimeout(() => setToast(null), 2000);
    }
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

  const attempt = activeQuizData?.attempt ?? null;
  const attemptStatusPopup = (attempt?.status ?? "PENDING").toUpperCase();
  const isCompleted =
    attemptStatusPopup === "COMPLETED" || attemptStatusPopup === "SUBMITTED";

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
              <Text style={styles.header}>Domain</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Created By</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Status</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Position</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Percentage</Text>
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
                const attempt = user.attempt ?? null;
                const attemptStatus = attempt?.status ?? "PENDING";
                const attemptStatusColor = getAttemptStatusColor(attemptStatus);
                const progress =
                  typeof user.progress === "number"
                    ? user.progress
                    : typeof attempt?.percentage === "number"
                      ? attempt.percentage
                      : 0;
                const progressColor = getProgressColor(progress);
                const position = Number(user.position ?? 0);
                const positionColor =
                  position > 0
                    ? getPositionColor(position)
                    : getPositionColor(999);
                const hasRank = user.position != null;
                const creatorImage = user.creatorImage || null;
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
                      <Text
                        style={styles.domain}
                        onClick={() => copyDomain(user.quizLink)}
                      >
                        {user.quizLink ?? ""}
                      </Text>
                    </Box>

                    <Box style={styles.cell2}>
                      <Box style={styles.avatars}>
                        {creatorImage ? (
                          <img
                            src={creatorImage}
                            alt="userimg"
                            style={styles.avatar}
                          />
                        ) : (
                          <img src={Icon} alt="icon" style={styles.avatar} />
                        )}
                        <Text style={styles.text}>
                          {user.creatorName ?? ""}
                        </Text>
                      </Box>
                    </Box>

                    <Box style={styles.cell2}>
                      <Text
                        style={{
                          ...styles.status,
                          backgroundColor: attemptStatusColor.color,
                          color: attemptStatusColor.bg,
                        }}
                      >
                        {formatStatus(attemptStatus)}
                      </Text>
                    </Box>

                    <Box style={styles.cell2}>
                      <Box style={styles.position}>
                        {hasRank ? (
                          <>
                            <MedalIcon
                              style={{
                                ...styles.iconb,
                                color: isLightTheme
                                  ? positionColor.color
                                  : positionColor.border,
                              }}
                            />
                            <Text
                              style={{
                                ...styles.text,
                                color: isLightTheme
                                  ? positionColor.color
                                  : positionColor.border,
                              }}
                            >
                              {formatPosition(user.position)}
                            </Text>
                          </>
                        ) : (
                          <>
                            <MedalIcon
                              style={{
                                ...styles.iconb,
                                color: isLightTheme
                                  ? positionColor.color
                                  : positionColor.border,
                              }}
                            />
                            <Text style={styles.text}>No rank</Text>
                          </>
                        )}
                      </Box>
                    </Box>

                    <Box style={styles.cell2}>
                      <Box style={styles.progress}>
                        <Box style={styles.bars}>
                          {[...Array(10)].map((_, i) => {
                            const filled = i < Math.round(progress / 10);

                            return (
                              <Box
                                key={i}
                                style={{
                                  ...styles.bar,
                                  ...(i === 0 ? styles.fill : {}),
                                  backgroundColor: filled
                                    ? progressColor.color
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
                          {progress}%
                        </Text>
                      </Box>
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
                onToggle={() =>
                  setActiveMenuItem((prev) => (prev === "info" ? null : "info"))
                }
                onClick={() => {
                  setSelectedQuiz(activeQuizData);
                  setShowDetails(true);
                  setActiveRowMenu(null);
                  setCheckedRow(null);
                }}
              />

              <RowMenuItem
                itemId="state"
                icon={
                  isCompleted ? (
                    <IconPenSparkleOutlineDuo18 width={12} height={12} />
                  ) : (
                    <IconHalfDottedCirclePlayOutlineDuo18
                      width={12}
                      height={12}
                    />
                  )
                }
                label={isCompleted ? "View" : "Play"}
                isExpanded={activeMenuItem === "state"}
                onToggle={() =>
                  setActiveMenuItem((prev) => (prev === "state" ? null : "state"))
                }
                onClick={() => {
                  setActiveRowMenu(null);
                  setCheckedRow(null);

                  if (isCompleted) {
                    navigate(`${ROUTES.QUIZ}/${activeQuizData.id}`, {
                      state: {
                        attemptId: attempt?.id || null,
                        attempt: attempt || null,
                        hasSubmitted: isCompleted,
                      },
                    });
                    return;
                  }

                  openState(activeQuizData);
                }}
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
                onToggle={() =>
                  setActiveMenuItem((prev) => (prev === "share" ? null : "share"))
                }
                onClick={() => {
                  setSelectedQuiz(activeQuizData);
                  setOpenShareQuiz(true);
                  setActiveRowMenu(null);
                  setCheckedRow(null);
                }}
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

      {toast && <Toast message={toast.message} status={toast.status} />}
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
      {openStatePopup &&
        quizForState &&
        createPortal(
          <StatesPopup
            mode={popupMode}
            onClose={() => {
              setOpenStatePopup(false);
              setQuizForState(null);
            }}
            onConfirm={confirmStateAction}
            loading={popupLoading}
          />,
          document.body,
        )}
    </>
  );
};

export default Lists;