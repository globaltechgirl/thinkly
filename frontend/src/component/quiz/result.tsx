import { FC, useEffect, useState } from "react";
import { Box, Text, Image } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Confetti from "@/assets/confetti.svg";
import { Attempt } from "@/types/quiz";

interface Props {
  attempt: Attempt | null;
  setStep: React.Dispatch<
    React.SetStateAction<"quiz" | "result" | "leaderboard">
  >;
}

const QuizResult: FC<Props> = ({ attempt, setStep }) => {
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  const styles = {
    container: {
      width: "100%",
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      justifyContent: "flex-start",
      maxWidth: 750,
      gap: 20,
      padding: isSmallScreen ? 10 : 40,
    },
    confetti: {
      width: 90,
      height: 90,
      objectFit: "contain",
      objectPosition: "center",
      marginBottom: -10
    },
    title: {
      fontSize: "clamp(18px, 1.6vw, 20px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    subtitle: {
      fontSize: "clamp(13px, 1.1vw, 15px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      opacity: 0.8,
      marginTop: -5,
    },
    text: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      lineHeight: 1.6,
      textAlign: "justify",
      maxWidth: 600,
      marginTop: -5,
    },
    button: {
      width: "100%",
      padding: "0 12px",
      height: 42,
      cursor: "pointer",
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      borderRadius: 10,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "2px solid var(--blue-300)",
      boxShadow: `inset 0 0 8px 1px rgba(255, 255, 255, 0.12)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
      marginTop: 15
    },
  } as const;

  const isSubmitted = !!attempt;
  const [processing, setProcessing] = useState(!isSubmitted);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  useEffect(() => {
    if (isSubmitted) {
      setProcessing(false);
      return;
    }

    const timer = setTimeout(() => {
      setProcessing(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isSubmitted]);

  return (
    <Box style={styles.container}>
      <Image src={Confetti} style={styles.confetti} />

      <Text style={styles.title}>Congratulations!</Text>

      <Text style={styles.subtitle}>
        {attempt
          ? "Based on your submission, you have qualified for placement on the leaderboard."
          : "Based on your responses, you may qualify for placement on the leaderboard."}
      </Text>

      <Text style={styles.text}>
        {attempt
          ? "Your responses have been successfully recorded, verified, and finalized. Your results are now available, and you may proceed to view your official leaderboard placement."
          : "Our next step is to conduct a detailed evaluation of your responses to determine your final leaderboard placement and performance score. This process ensures that all results are accurately validated, fairly assessed, and reliably presented once processing is complete."}
      </Text>

      {!attempt && (
        processing ? (
          <Text style={styles.text}>Your responses are being evaluated.</Text>
        ) : (
          <Text style={styles.text}>Click the button below to continue.</Text>
        )
      )}

      <Box
        style={{
          ...styles.button,
          backgroundColor: isButtonHovered ? "var(--light-200)" : "var(--light-400)",
          opacity: !attempt && processing ? 0.5 : 1,
          cursor: !attempt && processing ? "not-allowed" : "pointer",
        }}
        onClick={() => { if (attempt || !processing) { setStep("leaderboard"); } }}
        onMouseEnter={() => setIsButtonHovered(true)} 
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        {attempt ? "View Leaderboard" : processing ? "Processing" : "Leaderboard"}
      </Box>
    </Box>
  );
};

export default QuizResult;