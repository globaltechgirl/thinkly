import { FC, useEffect, useState } from "react";

import { Box, Text } from "@mantine/core";

import { IconCircleCheck } from "nucleo-glass";

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
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: "clamp(12px, 1vw, 14px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    lineHeight: 1.6,
  },
  main: {
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",   
  },
  flex: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-100)",
    boxShadow: "0 1px 0 0 var(--border-300)",
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
} as const;

type QuestionWithSelection = {
  id: string;
  question: string;
  options: string[];
  correctOption?: number;
};

type Props = {
  questionsFromApi: {
    id: string;
    question: string;
    options: string[];
    correctOption?: number;
  }[];
  isAdmin?: boolean;
};

const Quiz: FC<Props> = ({ questionsFromApi, isAdmin = false }) => {
  const [questions, setQuestions] = useState<QuestionWithSelection[]>([]);

  useEffect(() => {
    if (!questionsFromApi?.length) { setQuestions([]); return; }
    const formatted: QuestionWithSelection[] = questionsFromApi.map(
      (q, index) => {
        const rawCorrect = (q as any).correctOption;
        const correctOption = typeof rawCorrect === "number" ? rawCorrect : undefined;

        return {
          id: q.id ?? `temp-${index}`,
          question: q.question ?? "",
          options: Array.isArray(q.options) ? q.options : [],
          correctOption,
        };
      }
    );

    setQuestions(formatted);
  }, [questionsFromApi]);

  return (
    <Box style={styles.container}>
      {questions.map((question) => (
       <Box key={question.id} style={styles.wrapper}>
          <Box style={styles.top}>
            <Box style={styles.row}>
              <Text style={styles.title}>{question.question}</Text>
            </Box>
          </Box>

            <Box style={styles.main}>
              {question.options.map((reply, index) => {
                const isCorrect = isAdmin && index === question.correctOption;
                const isLast = index === question.options.length - 1;

                return (
                  <Box key={index} style={{ ...styles.flex, borderBottom: isLast ? "none" : styles.flex.borderBottom, boxShadow: isLast ? "none" : styles.flex.boxShadow }}>
                    {isCorrect && <IconCircleCheck style={styles.icon} />}
                    <Text style={styles.text}>{reply}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
      ))}
    </Box>
  );
};

export default Quiz;