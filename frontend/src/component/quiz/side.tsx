import { FC, useEffect, useState } from "react";

import { Box, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { QuizQuestion } from "@/types/quiz";
import { useUsers } from "@/hooks/use-auth";

import { ROUTES } from "@/utils/constants";

import Logo from "@/assets/logo.svg?react";
import Icon from "@/assets/icon.jpg";

import CheckIcon from "@/assets/icons/circles";
import CircleIcon from "@/assets/icons/circle";
import PauseIcon from "@/assets/icons/pause";

export const truncate = (text: string, maxLength: number = 70): string => {
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
};

interface Props {
  questions: QuizQuestion[];
  current: number;
  quiz?: {
    quizName?: string;
    companyName?: string;
    creatorName?: string;
    creatorImage?: string | null;
    endTime?: string | null;
  } | null;
  hasSubmitted?: boolean;
  attempt?: { startedAt?: string; submittedAt?: string } | null;
  isMobile?: boolean;
}

const Side: FC<Props> = ({
  questions,
  current,
  quiz,
  hasSubmitted,
  attempt,
  isMobile,
}) => {
  const styles = {
    container: {
      width: "100%",
      height: "100%",
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 20,
      overflow: "auto",
    },
    top: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
    logo: {
      width: 30,
      height: 30,
    },
    info: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    title: {
      fontSize: "clamp(16px, 1.4vw, 18px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      textTransform: "capitalize",
      lineHeight: 1.6,
    },
    avatars: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 10,
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
    subtitle: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6,
    },
    time: {
      display: "flex",
      gap: 2,
      fontSize: 45,
      fontWeight: 600,
      color: "var(--dark-100)",
      fontFamily: "Digital-7",
      marginTop: -5,
    },
    middle: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
    row: {
      display: "flex",
      alignItems: "flex-start",
      gap: 15,
    },
    icons: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100%",
    },
    line: {
      width: 2,
      height: "100%",
      borderLeft: "1.2px dashed var(--dark-300)",
      marginTop: 2,
      marginBottom: 2,
    },
    box: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginTop: -3,
    },
    label: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    value: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      lineHeight: 1.6,
      marginBottom: 30,
    },
    bottom: {
      width: "100%",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    flex: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
    },
    icon: {
      width: 20,
      height: 20,
      color: "var(--dark-200)",
      marginTop: 2,
    },
    text: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
    },
    span: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      textDecoration: "underline",
      textUnderlineOffset: "2px",
    },
  } as const;

  const navigate = useNavigate();
  const { isAuthenticated, isGuest } = useUsers();

  const [timeLeft, setTimeLeft] = useState("00:00:00");

  const isSubmitted = !!attempt?.submittedAt || hasSubmitted;
  const creatorImage = quiz?.creatorImage || null;

  const startIndex = Math.floor(current / 3) * 3;

  const visibleQuestions = questions.slice(startIndex, startIndex + 3);

  const containerStyle = {
    ...styles.container,
    ...(isMobile
      ? {
          borderRadius: 0,
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
        }
      : {}),
  };

  const getIcon = (_q: QuizQuestion, index: number) => {
    const iconStyle1 = {
      width: 20,
      height: 20,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--dark-200)",
    };

    const iconStyle2 = {
      width: 14,
      height: 14,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--dark-200)",
      marginLeft: 2.5,
    };

    if (index === current) return <CheckIcon style={iconStyle1} />;
    if (index === current) return <PauseIcon style={iconStyle1} />;
    return <CircleIcon style={iconStyle2} />;
  };

  const formatYear = (date?: string | null) => {
    if (!date) return "";
    return new Date(date).getFullYear();
  };

  const formatDuration = (diff: number) => {
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getFinalTime = () => {
    if (!attempt?.startedAt || !attempt?.submittedAt) return "00:00:00";

    const start = new Date(attempt.startedAt).getTime();
    const end = new Date(attempt.submittedAt).getTime();

    return formatDuration(end - start);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isSubmitted) {
      setTimeLeft(getFinalTime());
      return;
    }
    if (!quiz?.endTime) return;

    const endTime = new Date(quiz.endTime).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        if (interval) clearInterval(interval);
        return;
      }

      setTimeLeft(formatDuration(diff));
    };

    tick();
    interval = setInterval(tick, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quiz?.endTime, attempt?.submittedAt, attempt?.startedAt, hasSubmitted]);

  return (
    <Box style={containerStyle} className="scroll">
      <Box style={styles.top}>
        <Logo style={{ ...styles.logo }} />

        <Box style={styles.info}>
          <Text style={styles.title}>{quiz?.quizName}</Text>

          <Box style={styles.avatars}>
            {creatorImage ? (
              <img src={creatorImage} style={styles.avatar} />
            ) : (
              <img src={Icon} style={styles.avatar} />
            )}
            <Text style={styles.subtitle}>{quiz?.creatorName}</Text>
          </Box>
        </Box>

        <Box style={styles.time}>
          {timeLeft.split("").map((char, i) => (
            <Box key={i} component="span">
              {char}
            </Box>
          ))}
        </Box>
      </Box>

      <Box style={styles.middle}>
        {visibleQuestions.map((q, idx) => {
          const realIndex = questions.findIndex((item) => item.id === q.id);
          const isLast = idx === visibleQuestions.length - 1;

          return (
            <Box key={q.id} style={styles.row}>
              <Box style={styles.icons}>
                {getIcon(q, realIndex)}
                {!isLast && <Box style={styles.line} />}
              </Box>

              <Box style={styles.box}>
                <Text style={styles.label}>Question {realIndex + 1}</Text>
                <Text style={styles.value}>{truncate(q.question, 70)}</Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box style={styles.bottom}>
        <Box
          style={styles.flex}
          onClick={() =>
            navigate(
              !isAuthenticated || isGuest ? ROUTES.REGISTER : ROUTES.QUIZZES,
            )
          }
        >
          <Text
            style={styles.span}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--dark-100)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--dark-200)";
            }}
          >
            {!isAuthenticated || isGuest ? "Sign Up" : "Go Back"}
          </Text>
        </Box>

        <Text style={styles.text}>{formatYear(quiz?.endTime)}</Text>
      </Box>
    </Box>
  );
};

export default Side;
