import { CSSProperties, useState } from "react";
import { Box, Text, Image, SimpleGrid } from "@mantine/core";

import Logo from "@/assets/logo.svg";
import StarIcon from "@/assets/icons/star";
import Feature1 from "./feature1";
import Feature2 from "./feature2";
import Feature3 from "./feature3";
import Feature4 from "./feature4";

const Features = () => {
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
    grids: {
      position: "relative", 
      width: "100%",
      maxWidth: 1200,
      margin: "0 auto",
    },
    grid: {
      width: "100%",
    },
    centers: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 10,
      width: 80,
      height: 80,
      borderRadius: "50%",
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-300)",
      boxShadow: "0 0 16px var(--blue-300), inset 0 0 8px var(--blue-400)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
    },
    center: {
      width: 35,
      height: 35,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
    content: {
      width: "100%",
      height: "100%",
      backgroundColor: "var(--light-200)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      borderRadius: 10,
      padding: 15,
      maxHeight: 385,
      overflow: "hidden",
    },
    labels: {
      display: "flex", 
      flexDirection: "column", 
      gap: 12,
      textAlign: "left"
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

  const featureList = [
    {
      label: "Live Assessment Tracking",
      value: "Monitor real time participant activity, system logs, and live completion statuses with an intuitive dashboard that tracks every stage from connection to final grading.",
      file: Feature1
    },
    {
      label: "Active Participant Monitoring",
      value: "Track and manage users in real time with a dynamic user grid dashboard designed to verify identities, oversee live sessions, and keep profiles organized.",
      file: Feature2
    },
    {
      label: "Performance Metrics Breakdown",
      value: "Review structural users statistics and class average percentages using dynamic progress graphs that track score distributions seamlessly.",
      file: Feature3
    },
    {
      label: "Dynamic Activity Stream",
      value: "Review global platform events as they happen with an automated activity feed that logs quiz creations, status updates, and user submissions instantly.",
      file: Feature4
    }
  ];

  return (
    <Box style={styles.container}>
      <Box style={styles.top}>
        <Box style={styles.badges}>
          <StarIcon style={styles.icona} />
          Our Features
        </Box>

        <Box style={styles.titles}>
          <Text style={styles.title}>
            Discover the Power of Thinkly Features
          </Text>

          <Text style={styles.subtitle}>
            Thinkly makes quiz assessments effortless with intuitive tools for smart quiz creation and auto-grading, designed to streamline the entire evaluation process.
          </Text>
        </Box>
      </Box>

      <Box style={styles.grid}>
        <Box style={styles.grids}>
          <Box visibleFrom="sm" style={styles.centers}>
            <Box style={styles.center}>
              <Image src={Logo} style={styles.logo} />
            </Box>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={12} verticalSpacing={12} style={styles.grid}>
            {featureList.map((feature, index) => {
              const isTextTop = index === 0 || index === 1;
              const FeatureContent = feature.file;
              
              return (
                <Box key={index} style={styles.card}>
                  <Box style={{ ...styles.labels, order: isTextTop ? 1 : 2, padding: isTextTop ? "15px 15px 18px" : "18px 15px 15px" }}>
                    <Text style={styles.label}>{feature.label}</Text>
                    <Text style={styles.value}>{feature.value}</Text>
                  </Box>

                  <Box style={{ ...styles.content, order: isTextTop ? 2 : 1 }}>
                    <FeatureContent />
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
}

export default Features;