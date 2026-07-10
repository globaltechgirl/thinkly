import { FC, useEffect, useState } from "react";
import { Grid, Box, Text } from "@mantine/core";
import { useAnalytics } from "@/hooks/use-analytics";

import { useTheme } from "../layout/themeContext";

import { IconDotsVertical, IconCircleCheckFilled, IconBookmarksFilled, IconHourglassFilled, IconTrophyFilled} from "@tabler/icons-react";
/* import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; */

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 15,
    width: "100%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "var(--light-400)",
    border: "2px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 5
  },
  logos: {
    width: "fit-content",
    padding: "10px 10.5px",
    borderRadius: 12,
  },
  logo: {
    width: 18,
    height: 18,
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
  column: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  label: {
    fontSize: "clamp(12px, 1vw, 14px)",
    fontWeight: 450,
    color: "var(--dark-100)",
  },
  value: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-200)",
  },
  spans: {
    width: "100%",
    /* padding: "6px 12px", */
    /* borderRadius: 10, */
    /* backgroundColor: "var(--light-200)", */
    /* border: "2px solid var(--border-100)", */
    /* boxShadow: "inset 0 0 0 1px var(--border-300)", */
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-200)",
  },
} as const;

const Grids: FC = () => {
  const { user, fetchUserAnalytics, loading } = useAnalytics();

  const [colSpan, setColSpan] = useState<number>(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 640) setColSpan(12);
      else if (w <= 1024) setColSpan(6);
      else setColSpan(3);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0 && current > 0) {
      return {
        value: "+100%",
        color: "var(--green-200)",
        border: "var(--green-300)",
      };
    }

    if (previous === 0 && current === 0) {
      return {
        value: "0%",
        color: "var(--red-200)",
        border: "var(--red-300)",
      };
    }

    const change = ((current - previous) / previous) * 100;

    const isPositive = change >= 0;

    return {
      value: `${isPositive ? "+" : ""}${change.toFixed(1)}%`,
      color: isPositive ? "var(--green-200)" : "var(--red-200)",
      border: isPositive ? "var(--green-300)" : "var(--red-300)",
    };
  };

  const getLatestAndPrevious = (data: any[] = []) => {
    const sorted = [...data].sort((a, b) => {
      const aYear = a?.year ?? a?._id?.year ?? 0;
      const aMonth = a?.month ?? a?._id?.month ?? 0;
      const bYear = b?.year ?? b?._id?.year ?? 0;
      const bMonth = b?.month ?? b?._id?.month ?? 0;

      return (
        new Date(bYear, bMonth - 1).getTime() -
        new Date(aYear, aMonth - 1).getTime()
      );
    });

    return {
      latest: sorted[0]?.total ?? 0,
      previous: sorted[1]?.total ?? 0,
    };
  };

  const attemptsStats = getLatestAndPrevious(user?.monthlyAttempts);
  const activeStats = getLatestAndPrevious(user?.monthlyQuizzes);
  const pendingStats = getLatestAndPrevious(user?.monthlyPendingQuizzes);
  const wonStats = getLatestAndPrevious(user?.monthlyWonQuizzes);

  const { theme } = useTheme();
  const isLightTheme = theme === "light";

  const pastelColors = [
    {
      lit: isLightTheme
        ? "linear-gradient(to bottom, var(--red-100), var(--red-100))"
        : "linear-gradient(to bottom, var(--red-100), var(--red-200))",
      border: "var(--red-200)",
      color: "var(--red-300)",
    },
    {
      lit: isLightTheme
        ? "linear-gradient(to bottom, var(--blue-100), var(--blue-100))"
        : "linear-gradient(to bottom, var(--blue-100), var(--blue-200))",
      border: "var(--blue-200)",
      color: "var(--blue-300)",
    },
    {
      lit: isLightTheme
        ? "linear-gradient(to bottom, var(--yellow-100), var(--yellow-100))"
        : "linear-gradient(to bottom, var(--yellow-100), var(--yellow-200))",
      border: "var(--yellow-200)",
      color: "var(--yellow-300)",
    },
    {
      lit: isLightTheme
        ? "linear-gradient(to bottom, var(--purple-100), var(--purple-100))"
        : "linear-gradient(to bottom, var(--purple-100), var(--purple-200))",
      border: "var(--purple-200)",
      color: "var(--purple-300)",
    },
  ];
  
  const cards = [
    {
      label: "Total Attempts",
      value: user?.totalAttempts ?? 0,
      status: "quiz attempts",
      colorIndex: 0,
      Icon: IconCircleCheckFilled,
      change: calculatePercentageChange(
        attemptsStats.latest,
        attemptsStats.previous,
      ),
    },
    {
      label: "Total Quizzes",
      value: user?.totalActiveQuizzes ?? 0,
      status: "currently active",
      colorIndex: 1,
      Icon: IconBookmarksFilled,
      change: calculatePercentageChange(
        activeStats.latest,
        activeStats.previous,
      ),
    },
    {
      label: "Pending Quizzes",
      value: user?.totalPendingQuizzes ?? 0,
      status: "not started yet",
      colorIndex: 2,
      Icon: IconHourglassFilled,
      change: calculatePercentageChange(
        pendingStats.latest,
        pendingStats.previous,
      ),
    },
    {
      label: "Won Quizzes",
      value: user?.totalWonQuizzes ?? 0,
      status: "won successfully",
      colorIndex: 3,
      Icon: IconTrophyFilled,
      change: calculatePercentageChange(wonStats.latest, wonStats.previous),
    },
  ];

  return (
    <Grid gutter={12}>
      {cards.map((card, idx) => {
        const color = pastelColors[card.colorIndex];
        const LogoIcon = card.Icon;
        const { theme } = useTheme();
        const isLightTheme = theme === "light";
        const changeColor = isLightTheme ? card.change.border : card.change.color;

        return (
          <Grid.Col span={colSpan} key={idx}>
            <Box style={styles.card}>
              <Box style={styles.row}>
                <Box 
                  style={{ 
                    ...styles.logos, 
                    background: color.lit,
                    border: `2.5px solid ${color.border}`,
                  }}
                >
                  <LogoIcon strokeWidth={2.2} style={{ ...styles.logo, color: color.color }} />
                </Box>
                <Box style={styles.icons}>
                  <IconDotsVertical style={styles.icon} />
                </Box>
              </Box>

              <Box style={styles.column}>
                <Text style={styles.label}>{card.label}</Text>
                <Text style={styles.value}>
                  {loading ? "0" : card.value} quizzes
                </Text>
              </Box>

              <Text style={styles.spans}>
                <span style={{ color: changeColor }}>
                  {card.change.value}
                </span>{" "}
                vs. previous 30 days
              </Text>
            </Box>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default Grids;
