import { CSSProperties, useState } from "react";

import { Box, Text, Image, SimpleGrid } from "@mantine/core";

import StarIcon from "@/assets/icons/star";
import Tools1 from "@/assets/tools1.png";
import Tools2 from "@/assets/tools2.png";
import Tools3 from "@/assets/tools3.png";

const Tools = () => {
  const [windowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobile = windowWidth <= 768;

  const styles: Record<string, CSSProperties> = {
    container: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: isMobile ? 40 : 80,
      padding: isMobile ? "40px 20px" : "80px 40px",
    },
    top: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 30,
    },
    badges: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      backgroundColor: "var(--blue-400)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid var(--blue-300)",
      boxShadow: `inset 0 0 8px 1px rgba(255, 255, 255, 0.12), 0 4px 12px var(--shadow-200)`,
      fontSize: "clamp(9px, 0.7vw, 11px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      borderRadius: "20px",
      padding: "6px 14px",
    },
    icona: {
      width: 10,
      height: 10,
    },
    titles: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
    },
    title: {
      fontSize: "clamp(24px, 3.5vw, 40px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: isMobile ? 1.3 : 1.6,
      fontFamily: "'Instrument Serif', serif",
      transform: "scaleY(1.35)",
    },
    subtitle: {
      fontSize: "clamp(14px, 1.2vw, 16px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      lineHeight: 1.6,
      maxWidth: isMobile ? "100%" : windowWidth <= 1024 ? "85%" : "60%",
    },
    grid: {
      width: "100%",
      maxWidth: 1200,
      margin: "0 auto",
    },
    card: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      padding: 8,
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    images: {
      width: "100%",
      aspectRatio: "16 / 10", 
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center", 
      overflow: "hidden",
    },
    image: {
      width: "100%", 
      height: "100%", 
      objectFit: "cover",
      objectPosition: "left 15%",
      transform: "scale(1.05)",
      transformOrigin: "left top",
    },
    labels: {
      display: "flex", 
      flexDirection: "column", 
      gap: 12,
      padding: "18px 15px 15px"
    },
    label: {
      fontSize: "clamp(14px, 1.2vw, 16px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6,
    },
    value: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      lineHeight: 1.6,
    },
  } as const;

  return (
    <Box style={styles.container}>
      <Box style={styles.top}>
        <Box style={styles.badges}>
          <StarIcon style={styles.icona} />
          Why Choose Us
        </Box>

        <Box style={styles.titles}>
          <Text style={styles.title}>
            Simplify Your Knowledge Testing with Smart Tools
          </Text>

          <Text style={styles.subtitle}>
            Thinkly makes quiz assessments effortless with intuitive tools for smart quiz creation and auto-grading, designed to streamline the entire evaluation process.
          </Text>
        </Box>
      </Box>

      <Box style={styles.main}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 16, sm: 24, md: 32 }} style={styles.grid}>
          {[
            {
              label: "Sleek and Intuitive Interface",
              value: "Thinkly features a clean UI with vibrant accents and smooth navigation, allowing admins and users to create and take interactive quizzes seamlessly.",
              img: Tools1
            },
            {
              label: "Effortless Live Quiz Creation",
              value: "Quick-access templates streamline instant quiz building, scheduling, and live hosting, ensuring a highly optimized workflow that boosts engagement.",
              img: Tools2
            },
            {
              label: "Smart & Real-Time Analytics",
              value: "Intelligent performance tracking and visual metrics simplify data assessment, helping admins instantly monitor user progress and evaluate quiz results.",
              img: Tools3
            }
          ].map((feature, index) => (
            <Box key={index} style={styles.card}>
              <Box style={styles.images}>
                <Image src={feature.img} alt={feature.label} style={styles.image} /> 
              </Box>

              <Box style={styles.labels}>
                <Text style={styles.label}>{feature.label}</Text>
                <Text style={styles.value}>{feature.value}</Text>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default Tools;