import { FC, useEffect, useState } from "react";
import { Box, Text } from "@mantine/core";
import DotIcon from "@/assets/icons/dot";

const data = [
  { subtitle: "JavaScript Syntax & Scope Quiz", percentage: 84 },
  { subtitle: "React State Management Challenge", percentage: 62 },
  { subtitle: "CSS Grid & Flexbox Layout Blitz", percentage: 95 },
];

const Feature3: FC = () => {
  const styles = {
    container: {
      width: "100%",
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    column: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: "20px 6px",
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
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
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
  } as const;

  const pastelColors = [
    {
      lit: "linear-gradient(to bottom, var(--red-100), var(--red-200))",
      unlit: "color-mix(in srgb, var(--red-200) 8%, transparent)",
      border: "var(--red-300)",
    },
    {
      lit: "linear-gradient(to bottom, var(--blue-100), var(--blue-200))",
      unlit: "color-mix(in srgb, var(--blue-200) 8%, transparent)",
      border: "var(--blue-300)",
    },
    {
      lit: "linear-gradient(to bottom, var(--yellow-100), var(--yellow-200))",
      unlit: "color-mix(in srgb, var(--yellow-200) 8%, transparent)",
      border: "var(--yellow-300)",
    },
  ];

  const [totalSegments, setTotalSegments] = useState(50);
  const [filledPercentage, setFilledPercentage] = useState(0);

  useEffect(() => {
    const getSegmentCount = () => (window.innerWidth <= 1024 ? 25 : 50);
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

  useEffect(() => {
    const duration = 1500; 
    const intervals = 30; 
    const step = 100 / (duration / intervals);
    
    let timeoutId: ReturnType<typeof setTimeout>;

    const timer = setInterval(() => {
      setFilledPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(timer);

          timeoutId = setTimeout(() => {
            setFilledPercentage(0);
          }, 1500);

          return 100;
        }
        return prev + step;
      });
    }, intervals);

    return () => {
      clearInterval(timer);
      clearTimeout(timeoutId);
    };
  }, [filledPercentage === 0]); 

  return (
    <Box style={styles.container}>
      {data.map((item, idx) => {
        const color = pastelColors[idx % pastelColors.length];
        const currentProgress = Math.min(filledPercentage, item.percentage);
        const activeSegmentsCount = Math.round((currentProgress / 100) * totalSegments);

        return (
          <Box
            key={idx}
            style={{  ...styles.column, ...(idx === data.length - 1 ? { borderBottom: "none", boxShadow: "none" } : {}),  }}
          >
            <Box style={styles.flex}>
              <DotIcon style={{ ...styles.dot, color: color.border }} />
              <Box style={styles.left}>
                <Text style={styles.text}>{item.subtitle}</Text>
                <Text style={styles.span}>{item.percentage}%</Text>
              </Box>
            </Box>

            <Box style={styles.progress}>
              {Array.from({ length: totalSegments }).map((_, segmentIdx) => {
                const isLit = segmentIdx < activeSegmentsCount;

                return (
                  <Box
                    key={segmentIdx}
                    style={{
                      ...styles.segment,
                      background: isLit ? color.lit : color.unlit,
                      boxShadow: isLit ? `inset 0 0 0 1px rgba(255, 255, 255, 0.4)` : "inset 0 0 0 1px var(--border-300)",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default Feature3;