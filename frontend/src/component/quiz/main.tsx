import { FC, useEffect, useState } from "react";

import { Box } from "@mantine/core";
import { useParams } from "react-router-dom";
import { IconMenu2Filled, IconX } from "@tabler/icons-react";

import QuizSide from "./side";
import QuizContent from "./content";
import QuizResult from "./result";
import QuizLeaderboard from "./leaderboard";

import { useQuiz } from "@/hooks/use-quiz";
import quizService from "@/services/quiz";
import type { Quiz, QuizQuestion } from "@/types/quiz";

type ScreenMode = "desktop" | "medium" | "small";

const getScreenMode = (width: number): ScreenMode => {
  if (width <= 640) return "small";
  if (width <= 1024) return "medium";
  return "desktop";
};

const styles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    overflow: "hidden",
  },
  desktop: {
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    overflow: "hidden",
  },
  mobiles: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  mobile: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  actions: {
    padding: 8.5,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    border: "2px solid var(--border-100)",
    backgroundColor: "var(--light-400)",
    boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
    marginLeft: "auto",
  },
  action: {
    width: 12,
    height: 12,
    color: "var(--dark-300)",
  },
  side: {
    flex: 0.35, 
    height: "100%",
    minHeight: 0,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 9998,
    transition: "background-color 250ms ease",
  },
  panels: {
    position: "absolute",
    top: 10,
    left: 8,
    bottom: 10,
    boxSizing: "border-box", 
    maxWidth: "100%",
    transition: "transform 250ms ease",
    borderRadius: 12,
    backgroundColor: "var(--light-400)",
    border: "2px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
    overflowY: "auto",
    pointerEvents: "auto",
    zIndex: 9999,
  },
  panel: {
    display: "flex",
    justifyContent: "flex-end",
    padding: 12,
    flexShrink: 0,
  },
  contents: {
    flex: 1,
    height: "100%",
    display: "flex",       
    justifyContent: "center", 
    alignItems: "center",   
    minHeight: 0,
    overflowY: "auto",
  },
  content: {
    flex: 1,
    height: "100%",
    display: "flex",       
    justifyContent: "center", 
    alignItems: "center",   
    minHeight: 0,
    overflowY: "auto",
  }
} as const;

const Main: FC = () => {
  const { id } = useParams();
  const { submitQuiz } = useQuiz();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attempt, setAttempt] = useState<any>(null);

  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState<"quiz" | "result" | "leaderboard">("quiz");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [screenMode, setScreenMode] = useState<ScreenMode>("desktop");
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const isMobile = screenMode !== "desktop";

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await quizService.play(id);

        setQuestions(res.questions || []);
        setQuiz(res.quiz || null);

        setAttempt(res.attempt || null);
        setHasSubmitted(res.hasSubmitted || false);

        if (res.hasSubmitted) {
          setStep("result"); 
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      setScreenMode(getScreenMode(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setOpenMobileMenu(false);
    }
  }, [isMobile]);

  if (!isMobile) {
    return (
      <Box style={styles.desktop}>
        <Box style={styles.side}>
          <QuizSide
            questions={questions}
            current={current}
            quiz={quiz}
            hasSubmitted={hasSubmitted}
            attempt={attempt}
            isMobile={isMobile}
          />
        </Box>

        <Box style={styles.contents}>
          {step === "quiz" && quiz && (
            <QuizContent
              questions={questions}
              current={current}
              setCurrent={setCurrent}
              setStep={setStep}
              quizId={quiz?.id ?? ""}
              submitQuiz={submitQuiz}
              onSubmitted={() => setStep("result")}
              hasSubmitted={hasSubmitted}
              setAttempt={setAttempt}
              setHasSubmitted={setHasSubmitted}
            />
          )}

          {step === "result" && <QuizResult attempt={attempt} setStep={setStep} />}

          {step === "leaderboard" && <QuizLeaderboard />}
        </Box>
      </Box>
    );
  }

  return (
    <Box style={styles.mobiles}>
      <Box style={styles.mobile}>
        <Box
          style={styles.actions}
          onClick={() => setOpenMobileMenu(true)}
        >
          <IconMenu2Filled style={styles.action} />
        </Box>
      </Box>

      <Box style={styles.content}>
        {step === "quiz" && quiz && (
          <QuizContent
            questions={questions}
            current={current}
            setCurrent={setCurrent}
            setStep={setStep}
            quizId={quiz?.id ?? ""}
            submitQuiz={submitQuiz}
            onSubmitted={() => setStep("result")}
            hasSubmitted={hasSubmitted}
            setAttempt={setAttempt}
            setHasSubmitted={setHasSubmitted}
          />
        )}

        {step === "result" && <QuizResult attempt={attempt} setStep={setStep} />}

        {step === "leaderboard" && <QuizLeaderboard />}
      </Box>

      <Box
        style={{
          ...styles.overlay,
          backgroundColor: openMobileMenu
            ? "rgba(0,0,0,0.3)"
            : "transparent",
          pointerEvents: openMobileMenu ? "auto" : "none",
        }}
        onClick={() => setOpenMobileMenu(false)}
      >
        <Box
          style={{
            ...styles.panels,
            left: openMobileMenu ? 8 : 0,
            width: screenMode === "small" ? "calc(100% - 15px)" : "calc(60vw - 15px)",
            transform: openMobileMenu ? "translateX(0)" : "translateX(-100%)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <Box style={styles.panel}>
            <Box
              style={styles.actions}
              onClick={() => setOpenMobileMenu(false)}
            >
              <IconX style={styles.action} />
            </Box>
          </Box>
          <QuizSide
            questions={questions}
            current={current}
            quiz={quiz}
            hasSubmitted={hasSubmitted}
            attempt={attempt}
            isMobile={isMobile}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Main;