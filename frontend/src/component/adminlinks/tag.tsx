import { FC, useEffect, useRef, useState } from "react";

import { Box, Text, Image, RingProgress } from "@mantine/core";

import quizService from "@/services/quiz";

import { IconCheck } from "@tabler/icons-react";
import {
  IconCircleInfoOutlineDuo18,
  IconTasks2OutlineDuo18,
} from "nucleo-ui-essential-outline-duo-18";
import Icon from "@/assets/icon.jpg";
import { useTheme } from "../layout/themeContext";

const Tag: FC<{ quizId?: string }> = ({ quizId }) => {
  const styles = {
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
    wrapper: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 15,
      padding: "15px 15px 0px",
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    top: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      width: "100%",
    },
    flex: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    line: {
      width: 5,
      height: 16,
      borderRadius: 3,
      border: "1px solid var(--border-100)",
    },
    title: {
      fontSize: "clamp(12px, 1vw, 14px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    number: {
      borderRadius: "50%",
      width: 19,
      height: 19,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "clamp(9px, 0.7vw, 11px)",
      fontWeight: 450,
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
        "0.05fr minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.8fr)",
      minWidth: 800,
      borderRadius: 10,
      backgroundColor: "var(--light-200)",
      border: "1.5px solid var(--border-100)",
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
        "0.05fr minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.8fr)",
      minWidth: 800,
      alignItems: "center",
      padding: "0 12px",
      borderBottom: "1px solid var(--border-100)",
      boxShadow: "0 1px 0 0 var(--border-300)",
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
  } as const;

  type QuizRow = {
    id: string;
    userImg: string;
    userName: string;
    userId: string;
    status: string;
    log: "completed" | "ongoing" | "pending";
    score: number;
    userResponses: number;
    totalResponses: number;
    leaderboard: string;
  };

  const [quiz, setQuiz] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState({
    completed: true,
    ongoing: true,
    pending: true,
  });

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        setLoadingState({ completed: true, ongoing: true, pending: true });
        setError(null);

        const res = await quizService.getAdminOne(quizId);

        setQuiz(res?.quiz ?? null);
        setAttempts(Array.isArray(res?.attempts) ? res.attempts : []);
        setLoadingState({ completed: false, ongoing: false, pending: false });
      } catch (err: any) {
        setQuiz(null);
        setAttempts([]);
        setError(err?.message);

        setLoadingState({ completed: false, ongoing: false, pending: false });
      }
    };

    fetchQuiz();
  }, [quizId]);

  const menuRef = useRef<HTMLDivElement>(null);

  const mapAttemptStatus = (
    status: string,
  ): "completed" | "ongoing" | "pending" => {
    if (!status) return "pending";
    const cleanStatus = String(status).toLowerCase().trim();
    if (
      cleanStatus === "submitted" ||
      cleanStatus === "completed" ||
      cleanStatus === "finish"
    ) {
      return "completed";
    }
    if (
      cleanStatus === "in_progress" ||
      cleanStatus === "in-progress" ||
      cleanStatus === "ongoing"
    ) {
      return "ongoing";
    }
    return "pending";
  };

  const quizData: QuizRow[] = (attempts ?? []).map((a: any) => {
    const id = a?.id ?? a?._id ?? "";
    const responses =
      a?.totalScore > 0 ? Math.round((a?.score / a?.totalScore) * 100) : 0;

    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return {
      id,
      userImg: a?.user?.image || Icon,
      userName: a?.user?.name || "Unknown User",
      userId: `#${String(id).slice(-4)}`,
      status: quiz?.runtimeStatus ?? "INACTIVE",
      log: mapAttemptStatus(a?.status),
      score: responses,
      userResponses: a?.score ?? 0,
      totalResponses: a?.totalScore ?? 0,
      leaderboard: a?.position ? getOrdinal(a.position) : "-",
    };
  });

  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [checkedRow, setCheckedRow] = useState<string | null>(null);
  const [isCompactMenu, setIsCompactMenu] = useState(false);

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

  const getLogColor = (log: string) => {
    if (log === "completed") {
      return {
        lit: "linear-gradient(to bottom, var(--blue-100), var(--blue-200))",
        unlit: "color-mix(in srgb, var(--blue-200) 8%, transparent)",
        bg: "var(--blue-100)",
        color: "var(--blue-300)",
        border: "var(--blue-200)",
      };
    }

    if (log === "ongoing") {
      return {
        lit: "linear-gradient(to bottom, var(--yellow-100), var(--yellow-200))",
        unlit: "color-mix(in srgb, var(--yellow-200) 8%, transparent)",
        bg: "var(--yellow-100)",
        color: "var(--yellow-300)",
        border: "var(--yellow-200)",
      };
    }

    if (log === "pending") {
      return {
        lit: "linear-gradient(to bottom, var(--red-100), var(--red-200))",
        unlit: "color-mix(in srgb, var(--red-200) 8%, transparent)",
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

  const activeQuizData = quizData.find((q: QuizRow) => q.id === activeRowMenu);

  const completed = quizData.filter((q) => q.log === "completed");
  const ongoing = quizData.filter((q) => q.log === "ongoing");
  const pending = quizData.filter((q) => q.log === "pending");

  const Section: FC<{
    title: string;
    data: QuizRow[];
    logType: "completed" | "ongoing" | "pending";
    loading: boolean;
  }> = ({ title, data, logType, loading }) => {
    const logColor = getLogColor(logType);

    return (
      <Box style={styles.container}>
        <Box style={styles.wrapper}>
          <Box style={styles.top}>
            <Box style={styles.flex}>
              <Box
                style={{
                  ...styles.line,
                  background: logColor.lit,
                  boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.4)`,
                }}
              />
              <Text style={styles.title}>{title}</Text>
            </Box>
            <Box
              style={{
                ...styles.number,
                background: logColor.bg,
                color: logColor.color,
                boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.4)`,
              }}
            >
              {loading ? "0" : data.length}
            </Box>
          </Box>

          <Box style={styles.table} className="scrollbar-hidden-sm-md">
            <Box style={styles.headers}>
              <Text style={{ ...styles.header, marginRight: -8 }}>
                <Box style={{ ...styles.checks, cursor: "default" }} />
              </Text>
              <Box style={styles.cell1}>
                <Text style={styles.header}>User Name</Text>
              </Box>
              <Box style={styles.cell1}>
                <Text style={styles.header}>Score</Text>
              </Box>
              <Box style={styles.cell1}>
                <Text style={styles.header}>Leaderboard</Text>
              </Box>
              <Box style={styles.cell1}>
                <Text style={styles.header}>Responses</Text>
              </Box>
            </Box>

            <Box style={styles.rows}>
              {loading ? (
                <Text style={styles.loading}>Loading participants...</Text>
              ) : error ? (
                <Text style={styles.loading}>{error}</Text>
              ) : data.length === 0 ? (
                <Text style={styles.loading}>No participants found</Text>
              ) : (
                data.map((user, idx) => {
                  const progressColor = getProgressColor(user.score);
                  const responseProgress =
                    (user.userResponses / user.totalResponses) * 100;
                  const responseColor = getProgressColor(responseProgress);
                  const isLastRow = idx === data.length - 1;
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
                        <Box style={styles.avatars}>
                          <Image src={user.userImg} style={styles.avatar} />
                          <Text style={styles.text}>{user.userName}</Text>
                        </Box>
                      </Box>

                      <Box style={styles.cell2}>
                        <Box style={styles.progress}>
                          <Box style={styles.bars}>
                            {[...Array(10)].map((_, i) => {
                              const filled = i < Math.round(user.score / 10);

                              return (
                                <Box
                                  key={i}
                                  style={{
                                    ...styles.bar,
                                    ...(i === 0 ? styles.fill : {}),
                                    backgroundColor: filled
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
                            {user.score}%
                          </Text>
                        </Box>
                      </Box>

                      <Box style={styles.cell2}>
                        <Text style={styles.text}>
                          {user.leaderboard} position
                        </Text>
                      </Box>

                      <Box style={styles.cell2}>
                        <Box style={styles.progress}>
                          <RingProgress
                            size={20}
                            thickness={2.5}
                            roundCaps
                            rootColor={responseColor.bg}
                            sections={[
                              {
                                value: responseProgress,
                                color: responseColor.color,
                              },
                            ]}
                          />
                          <Text style={styles.text}>
                            {" "}
                            {user.userResponses} / {user.totalResponses}
                          </Text>
                        </Box>
                      </Box>

                      {activeRowMenu === user.id && activeQuizData && (
                        <Box ref={menuRef} style={styles.menus}>
                          <RowMenuItem
                            itemId="info"
                            icon={
                              <IconCircleInfoOutlineDuo18
                                width={12}
                                height={12}
                              />
                            }
                            label="Info"
                            isExpanded={activeMenuItem === "info"}
                            onToggle={() =>
                              setActiveMenuItem((prev) =>
                                prev === "info" ? null : "info",
                              )
                            }
                          />

                          <RowMenuItem
                            itemId="activate"
                            icon={
                              <IconTasks2OutlineDuo18 width={12} height={12} />
                            }
                            label="Activate"
                            isExpanded={activeMenuItem === "activate"}
                            onToggle={() =>
                              setActiveMenuItem((prev) =>
                                prev === "activate" ? null : "activate",
                              )
                            }
                          />
                        </Box>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box style={styles.container}>
      <Section
        title="Completed"
        logType="completed"
        data={completed}
        loading={loadingState.completed}
      />
      <Section
        title="Ongoing"
        logType="ongoing"
        data={ongoing}
        loading={loadingState.ongoing}
      />
      <Section
        title="Pending"
        logType="pending"
        data={pending}
        loading={loadingState.pending}
      />
    </Box>
  );
};

export default Tag;
