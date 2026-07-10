import { FC, useEffect, useRef, useState } from "react";

import { Box, Text, Button, Image, RingProgress } from "@mantine/core";

import { useAnalytics } from "@/hooks/use-analytics";

import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  IconCircleInfoOutlineDuo18,
  IconTasks2OutlineDuo18,
} from "nucleo-ui-essential-outline-duo-18";
import Icon from "@/assets/icon.jpg";
import { useTheme } from "../layout/themeContext";

const Lists: FC = () => {
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

  const { admin, fetchAdminAnalytics, loading, error } = useAnalytics();

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveRowMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const mapAttemptStatus = (status: string) => {
    if (status === "submitted") return "completed";
    if (status === "in_progress") return "ongoing";
    return "pending";
  };

  const formatPosition = (num: number | null) => {
    if (!num) return "—";
    const last = num % 10;
    const lastTwo = num % 100;
    if (last === 1 && lastTwo !== 11) return `${num}st`;
    if (last === 2 && lastTwo !== 12) return `${num}nd`;
    if (last === 3 && lastTwo !== 13) return `${num}rd`;
    return `${num}th`;
  };

  const getScorePercentage = (participant: any) => {
    const score = Number(participant.score ?? 0);
    const responses = Number(participant.responsesSubmitted ?? 0);
    if (responses > 0 && score === responses) {
      return 100;
    }
    if (responses > 0) {
      return (score / responses) * 100;
    }
    return 0;
  };

  const quizData = (admin?.participantList || []).map((participant: any) => {
    const totalResponses =
      participant.responsesSubmitted > 0 ? participant.responsesSubmitted : 1;
    const scorePercentage = getScorePercentage(participant);

    return {
      id: participant.id,
      userImg: participant.avatar || Icon,
      userName: participant.userName || "Unknown User",
      quizName: participant.quizName || "Untitled Quiz",
      log: mapAttemptStatus(participant.status),
      score: Math.round(Math.min(100, Math.max(0, scorePercentage))),
      submitDate: formatDate(participant.submittedAt),
      userResponses: participant.responsesSubmitted || 0,
      totalResponses,
      leaderboard: formatPosition(participant.position),
    };
  });

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const setCompact = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsCompactMenu(event.matches);
    };

    setCompact(mediaQuery);
    mediaQuery.addEventListener("change", setCompact);

    return () => {
      mediaQuery.removeEventListener("change", setCompact);
    };
  }, []);

  const getLogColor = (log: string) => {
    if (log === "completed") {
      return {
        bg: "var(--blue-100)",
        color: "var(--blue-300)",
        border: "var(--blue-200)",
      };
    }

    if (log === "ongoing") {
      return {
        bg: "var(--yellow-100)",
        color: "var(--yellow-300)",
        border: "var(--yellow-200)",
      };
    }

    if (log === "pending") {
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

  const handleRowMenuClick = (
    e: React.MouseEvent<HTMLDivElement>,
    userId: string,
  ) => {
    e.stopPropagation();

    setCheckedRow((prev) => {
      const isSame = prev === userId;
      if (isSame) {
        setActiveRowMenu(null);
        setActiveMenuItem(null);
        return null;
      }
      setActiveRowMenu(userId);
      setActiveMenuItem(null);
      return userId;
    });
  };

  const toggleMenuItem = (itemId: string) => {
    setActiveMenuItem((prev) => (prev === itemId ? null : itemId));
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
              <Text style={styles.header}>User Name</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Quiz Name</Text>
            </Box>
            <Box style={styles.cell1}>
              <Text style={styles.header}>Status</Text>
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
            ) : quizData.length === 0 ? (
              <Text style={styles.loading}>No participants found</Text>
            ) : (
              paginatedLinks.map((user, idx) => {
                const logColor = getLogColor(user.log);
                const progressColor = getProgressColor(user.score);
                const responseProgress =
                  (user.userResponses / user.totalResponses) * 100;
                const responseColor = getProgressColor(responseProgress);
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
                      <Box style={styles.avatars}>
                        <Image src={user.userImg} style={styles.avatar} />
                        <Text style={styles.text}>{user.userName}</Text>
                      </Box>
                    </Box>

                    <Box style={styles.cell2}>
                      <Text style={styles.text}>{user.quizName}</Text>
                    </Box>

                    <Box style={styles.cell2}>
                      <Text
                        style={{
                          ...styles.status,
                          backgroundColor: logColor.color,
                          color: logColor.bg,
                        }}
                      >
                        {user.log}
                      </Text>
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
                        <Text
                          style={{
                            ...styles.text,
                            color: isLightTheme
                              ? responseColor.color
                              : responseColor.border,
                          }}
                        >
                          {" "}
                          {user.userResponses} / {user.totalResponses}
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
                onToggle={() => toggleMenuItem("info")}
              />

              <RowMenuItem
                itemId="activate"
                icon={<IconTasks2OutlineDuo18 width={12} height={12} />}
                label="Activate"
                isExpanded={activeMenuItem === "activate"}
                onToggle={() => toggleMenuItem("activate")}
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
    </>
  );
};

export default Lists;
