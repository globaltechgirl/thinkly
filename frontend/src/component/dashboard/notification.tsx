import { FC, useEffect, useMemo, useState } from "react";

import { Box, Text } from "@mantine/core";

import { useAnalytics } from "@/hooks/use-analytics";

import { IconDotsVertical } from "@tabler/icons-react";
import DotIcon from "@/assets/icons/dot";
import { useTheme } from "../layout/themeContext";

const Notifications: FC = () => {
  const styles = {
    container: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 6,
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
    title: {
      fontSize: "clamp(12px, 1vw, 14px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    icons: {
      width: "fit-content",
      padding: 5,
      borderRadius: 8,
      border: "2px solid var(--border-100)",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
      cursor: "pointer",
    },
    icon: {
      width: 13,
      height: 13,
      color: "var(--dark-300)",
    },
    main: {
      width: "100%",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      height: 320,
    },
    column: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      padding: "16px 6px",
      borderBottom: "1px solid var(--border-100)",
      boxShadow: "0 1px 0 0 var(--border-300)",
    },
    flex: {
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    dot: {
      width: 15,
      height: 15,
    },
    left: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      width: "100%",
      minWidth: 0,
    },
    text: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    span: {
      fontSize: "clamp(10px, 0.8vw, 12px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    progress: {
      width: "100%",
      height: 24,
      display: "flex",
      alignItems: "center",
      gap: 3.5,
    },
    segment: {
      flex: 1,
      height: "100%",
      borderRadius: 3,
      border: "1px solid var(--border-100)",
      transition: "all 0.25s ease-in-out",
    },
    loading: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: 40,
      textAlign: "center",
    },
  } as const;

  const { user, fetchUserAnalytics, loading } = useAnalytics();

  useEffect(() => {
    fetchUserAnalytics();
  }, [fetchUserAnalytics]);

  const { theme } = useTheme();
  const isLightTheme = theme === "light";

  const pastelColors = [
    {
      lit: isLightTheme
        ? "linear-gradient(to bottom, var(--red-200), var(--red-300))"
        : "linear-gradient(to bottom, var(--red-100), var(--red-200))",
      unlit: "color-mix(in srgb, var(--red-200) 8%, transparent)",
      border: "var(--red-300)",
    },
    {
      lit: isLightTheme
        ? "linear-gradient(to bottom, var(--blue-200), var(--blue-300))"
        : "linear-gradient(to bottom, var(--blue-100), var(--blue-200))",
      unlit: "color-mix(in srgb, var(--blue-200) 8%, transparent)",
      border: "var(--blue-300)",
    },
    {
      lit: isLightTheme
        ? "linear-gradient(to bottom, var(--yellow-200), var(--yellow-300))"
        : "linear-gradient(to bottom, var(--yellow-100), var(--yellow-200))",
      unlit: "color-mix(in srgb, var(--yellow-200) 8%, transparent)",
      border: "var(--yellow-300)",
    },
    {
      lit: isLightTheme
        ? "linear-gradient(to bottom, var(--purple-200), var(--purple-300))"
        : "linear-gradient(to bottom, var(--purple-100), var(--purple-200))",
      unlit: "color-mix(in srgb, var(--purple-200) 8%, transparent)",
      border: "var(--purple-300)",
    },
  ];

  const formatTime = (value: string | number | Date | null) => {
    if (!value) return "0 min";

    const now = Date.now();
    const past = new Date(value).getTime();
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMins < 1) {
      return "0 min";
    }
    if (diffInMins < 60) {
      return `${diffInMins} min${diffInMins > 1 ? "s" : ""}`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
  };

  const timelineData = useMemo(() => {
    return (user?.notifications || [])
      .slice()
      .sort((a, b) => {
        const aTime = new Date(
          a.attemptSubmittedAt || a.quizStartTime || 0,
        ).getTime();
        const bTime = new Date(
          b.attemptSubmittedAt || b.quizStartTime || 0,
        ).getTime();
        return bTime - aTime;
      })
      .map((item) => {
        const attemptResponses = item.attemptResponses ?? 0;
        const attemptScore = item.attemptScore ?? 0;
        const percentage =
          attemptResponses > 0
            ? Math.round((attemptScore / attemptResponses) * 100)
            : 0;

        return {
          quizTitle: item.quizName,
          subtitle: item.quizName,
          adminName: item.creatorName,
          adminAvatar: item.creatorAvatar,
          formattedCreated: item.attemptSubmittedAt
            ? `${formatTime(item.attemptSubmittedAt)} ago`
            : "-",
          percentage,
        };
      });
  }, [user]);

  const notifications = timelineData.slice(0, 4);
  const [totalSegments, setTotalSegments] = useState(50);

  useEffect(() => {
    const getSegmentCount = () => (window.innerWidth <= 768 ? 25 : 50);
    setTotalSegments(getSegmentCount());

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setTotalSegments(event.matches ? 25 : 50);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  return (
    <Box style={styles.container}>
      <Box style={styles.top}>
        <Text style={styles.title}>Quiz Notifications</Text>
        <Box style={styles.icons}>
          <IconDotsVertical style={styles.icon} />
        </Box>
      </Box>

      <Box style={styles.main}>
        {loading && <Text style={styles.loading}>Loading activities...</Text>}

        {!loading && notifications.length === 0 && (
          <Text style={styles.loading}>No activities found.</Text>
        )}

        {!loading &&
          notifications.map((item, idx) => {
            const color = pastelColors[idx % pastelColors.length];
            const activeSegmentsCount = Math.round(
              (item.percentage / 100) * totalSegments,
            );

            return (
              <Box
                key={idx}
                style={{
                  ...styles.column,
                  ...(idx === notifications.length - 1
                    ? { borderBottom: "none", boxShadow: "none" }
                    : {}),
                }}
              >
                <Box style={styles.flex}>
                  <DotIcon style={{ ...styles.dot, color: color.border }} />
                  <Box style={styles.left}>
                    <Text
                      style={{
                        ...styles.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.subtitle}
                    </Text>
                    <Text style={styles.span}>{item.percentage}%</Text>
                  </Box>
                </Box>

                <Box style={styles.progress}>
                  {Array.from({ length: totalSegments }).map(
                    (_, segmentIdx) => {
                      const isLit = segmentIdx < activeSegmentsCount;

                      return (
                        <Box
                          key={segmentIdx}
                          style={{
                            ...styles.segment,
                            background: isLit ? color.lit : color.unlit,
                            boxShadow: isLit
                              ? `inset 0 0 0 1px rgba(255, 255, 255, 0.4)`
                              : "inset 0 0 0 1px var(--border-300)",
                          }}
                        />
                      );
                    },
                  )}
                </Box>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

export default Notifications;