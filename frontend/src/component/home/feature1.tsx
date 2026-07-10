import { FC, useState, useEffect, useRef } from "react";
import { Stack, Text, Box } from "@mantine/core";
import { IconCircleCheckFilled, IconLoader4 } from "@tabler/icons-react";

const assessmentLogs = [
  { time: "12:20:35", text: "User successfully connects to the active quiz session", color: "dark-100" },
  { time: "12:20:36", text: "Carefully reading quiz instructions and baseline guidelines", color: "blue-200" }, 
  { time: "12:20:37", text: "Starts quiz: Initializing quiz questions and interactive assets", color: "dark-100" },
  { time: "12:20:38", text: "Completes all mandatory question fields and submits answers", color: "dark-100" },
  { time: "12:20:39", text: "Submission securely enters the queue for instant auto grading", color: "blue-200" }, 
  { time: "12:20:41", text: "Submitted answers verified against system keys and grading logic", color: "dark-100" },
  { time: "12:20:42", text: "User profile instantly updates with score and leaderboard rank", color: "dark-100" },
  { time: "12:20:43", text: "Generating detailed user feedback and performance metrics breakdown", color: "dark-100" },
  { time: "12:20:44", text: "Quiz data compiled for real time admin dashboard analytics review", color: "blue-200" }, 
];

const Feature1: FC = () => {
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [completed, setCompleted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let index = 0;
    let logInterval: ReturnType<typeof setInterval>;

    const runCycle = () => {
      setCompleted(false);
      setVisibleLogs(0);
      index = 0;

      logInterval = setInterval(() => {
        if (index < assessmentLogs.length) {
          index++; 
          setVisibleLogs(index); 
        }

        if (index === assessmentLogs.length) {
          clearInterval(logInterval);
          setCompleted(true);

          setTimeout(runCycle, 2000);
        }
      }, 1000);
    };

    runCycle();
    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [visibleLogs]);

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start", 
      textAlign: "left",
      width: "100%",
      height: 285,
      maxHeight: 285,
      overflow: "hidden"
    },
    step: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      width: "100%",
      height: "100%",
    },
    headers: {
      display: "flex",
      alignItems: "center",
      color: completed ? "var(--main-100)" : "var(--dark-100)",
      marginBottom: -4,
      gap: 8,
      flexShrink: 0 
    },
    header: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--blue-200)",
      textTransform: "uppercase",
    },
    icon2: {
      width: 14,
      height: 14,
      animation: "spin 1s linear infinite",
      color: "var(--blue-200)",
    },
    icon1: {
      width: 13,
      height: 13,
      color: "var(--blue-100)",
      marginBottom: 2,
    },
    logs: {
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      width: "100%",
      overflowY: "auto",
      flexGrow: 1,
      msOverflowStyle: "none",  
      scrollbarWidth: "none", 
    },
    log: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      fontSize: "clamp(9px, 0.7vw, 11px)",
      fontWeight: 450,
      lineHeight: 2.4,
      width: "100%",
      textTransform: "uppercase",
    },
    time: {
      color: "var(--dark-200)",
      minWidth: 20,
      fontVariantNumeric: "tabular-nums",
    },
    text: (color: string) => ({
      color: `var(--${color})`,
      flex: 1,
      wordBreak: "break-word" as const,
    }),
  } as const;

  return (
    <Stack style={styles.container}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          /* Hide scrollbar completely for Chrome, Safari and Opera */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <Box style={styles.step}>
        <Box style={styles.headers}>
          {completed ? (
            <IconCircleCheckFilled style={styles.icon1} />
          ) : (
            <IconLoader4 style={styles.icon2} />
          )}
          <Text style={styles.header}>
            {completed ? "Assessment Completed" : "Assessment Logs"}
          </Text>
        </Box>

        <Box ref={scrollContainerRef} className="no-scrollbar" style={styles.logs}>
          {assessmentLogs.slice(0, visibleLogs).map((log, idx) => (
            <Box key={idx} style={styles.log}>
              <span style={styles.time}>{log.time}</span>
              <span style={styles.text(log.color)}>{log.text}</span>
            </Box>
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

export default Feature1;