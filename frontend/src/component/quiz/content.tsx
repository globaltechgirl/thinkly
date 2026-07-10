import { FC, useEffect, useState } from "react";

import { Box, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCircleCheck } from "nucleo-glass";

import { QuizQuestion } from "@/types/quiz";

import { notifyErrorOnce, notifySuccess } from "@/api/notify";

interface Props {
  questions: QuizQuestion[];
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  setStep: React.Dispatch<
    React.SetStateAction<"quiz" | "result" | "leaderboard">
  >;
  quizId: string;
  submitQuiz: (id: string, payload: any) => Promise<any>;
  onSubmitted: () => void;
  hasSubmitted?: boolean;
  setAttempt: React.Dispatch<React.SetStateAction<any>>;
  setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

const Content: FC<Props> = ({
  questions,
  current,
  setCurrent,
  quizId,
  submitQuiz,
  onSubmitted,
  hasSubmitted,
  setAttempt,
  setHasSubmitted,
}) => {
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  const styles = {
    container: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      maxWidth: 900,
      gap: 40,
      padding: isSmallScreen ? 10 : 40,
    },
    title: {
      fontSize: "clamp(16px, 1.4vw, 18px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      textTransform: "capitalize",
      lineHeight: 1.6,
      marginRight: "auto",
    },
    answers: {
      flex: 1,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 15,
      marginTop: -10,
    },
    answer: {
      width: "100%",
      cursor: "pointer",
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "14px 16px",
      borderRadius: 12,
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    text: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6,
    },
    icon: {
      width: 12,
      height: 12,
      marginTop: 3,
    },
    buttons: {
      display: "flex",
      gap: 8,
      marginLeft: "auto",
    },
    button1: {
      padding: "0 20px",
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
    button2: {
      padding: "0 16px",
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
      transition: "background-color 0.2s ease, border 0.2s ease, box-shadow 0.2s ease",
    },
    loading: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: 40,
      textAlign: "center",
    },
  } as const;

  const [hoveredButton, setHoveredButton] = useState<"back" | "next" | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const disabled = hasSubmitted;

  const currentQuestion =
    Array.isArray(questions) && questions.length > 0
      ? questions[current]
      : null;

  useEffect(() => {
    setCurrent(0);
  }, [questions]);

  if (!Array.isArray(questions)) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  if (questions.length === 0) {
    return <Text style={styles.loading}>No questions found</Text>;
  }

  if (!currentQuestion) {
    return <Text style={styles.loading}>Loading question...</Text>;
  }

  const isLastQuestion = current === questions.length - 1;

  const handleNext = async () => {
    if (isCompleting || disabled) return;

    if (isLastQuestion) {
      try {
        setIsCompleting(true);

        const res = await submitQuiz(quizId, { answers });
        notifySuccess("Quiz submitted successfully");
        const attempt = res?.data || res;

        setAttempt(attempt);
        setHasSubmitted(true);
        onSubmitted();
      } catch (err) {
        console.error(err);
        notifyErrorOnce?.("Submission failed. Please try again");
      } finally {
        setIsCompleting(false);
      }
    } else {
      setCurrent((prev) => Math.min(prev + 1, questions.length - 1));
    }
  };

  return (
    <Box style={styles.container}>
      <Text style={styles.title}>{currentQuestion.question}</Text>

      <Box style={styles.answers}>
        {currentQuestion.options?.map((ans, i) => {
          const isSelected = answers[current] === i;

          return (
            <Box
              key={i}
              style={{
                ...styles.answer,
                backgroundColor: isSelected
                  ? "var(--light-200)"
                  : "var(--light-400)",
              }}
              onClick={() => {
                if (disabled) return;
                setAnswers((prev) => ({ ...prev, [current]: i }));
              }}
            >
              {isSelected && <IconCircleCheck style={styles.icon} />}
              <Text style={styles.text}>{ans}</Text>
            </Box>
          );
        })}
      </Box>

      <Box style={styles.buttons}>
        <Box
          style={{ 
            ...styles.button1, 
            backgroundColor: hoveredButton === "back" ? "var(--light-400)" : "var(--light-200)", 
          }}
          onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
          onMouseEnter={() => setHoveredButton("back")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Back
        </Box>

        <Box
          style={{
            ...styles.button2,
            opacity: isCompleting ? 0.6 : 1,
            pointerEvents: isCompleting ? "none" : "auto",
            cursor: isCompleting ? "not-allowed" : "pointer",
            backgroundColor: hoveredButton === "next" ? "var(--light-400)" : "var(--light-200)",
            ...(isLastQuestion ? {
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "2px solid var(--blue-300)",
              boxShadow: `inset 0 0 8px 1px rgba(255, 255, 255, 0.12)`,
              height: 38,
            } : {}),
          }}
          onClick={handleNext}
          onMouseEnter={() => setHoveredButton("next")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          {isCompleting
            ? "Completing..."
            : isLastQuestion
              ? "Complete"
              : "Continue"}
        </Box>
      </Box>
    </Box>
  );
};

export default Content;
