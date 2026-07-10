import { FC } from "react";
import { Stack, Box } from "@mantine/core";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

import User1 from "@/assets/user1.jpg";
import User2 from "@/assets/user2.jpg";
import User3 from "@/assets/user3.jpg";
import User4 from "@/assets/user4.jpg";
import User5 from "@/assets/user5.jpg";

const tools = [
  { id: 1, src: User1, alt: "User 1" },
  { id: 2, src: User2, alt: "User 2" },
  { id: 3, src: User3, alt: "User 3" },
  { id: 4, src: User4, alt: "User 4" },
  { id: 5, src: User5, alt: "User 5" },
  { id: 6, src: User2, alt: "User 6" },
  { id: 7, src: User3, alt: "User 7" },
  { id: 8, src: User4, alt: "User 8" },
];

const cells = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
];

const moveMap = [4, 0, 1, 2, 5, 6, 7, 3];

const Feature2: FC = () => {
  const toolsRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState([0, 1, 2, 3, 4, 5, 6, 7]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) => moveMap.map((i) => prev[i]));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const styles = {
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    },
    grid: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      position: "relative",
      width: "100%",
    },
    tools: {
      position: "relative",
      width: "94%",
      height: 285, 
    },
    tool: {
      width: 115,
      height: 130,
      position: "absolute",
      padding: 3,
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "1px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "top",
      borderRadius: 10,
    },
  } as const;

  return (
    <Stack style={styles.container}>
      <Box style={styles.grid}>
        <Box ref={toolsRef} style={styles.tools}>
          {tools.map((tool, index) => {
            const targetCell = cells[positions[index]];

            return (
              <motion.div
                key={tool.id}
                animate={{ left: `${targetCell.x * 28}%`, top: targetCell.y === 0 ? "0%" : "100%", y: targetCell.y === 0 ? 0 : "-100%", }}
                transition={{ duration: 1.1, ease: [0.45, 0, 0.15, 1] }}
                style={styles.tool}
              >
                <img src={tool.src} alt={tool.alt} style={styles.image} />
              </motion.div>
            );
          })}
        </Box>
      </Box>
    </Stack>
  );
};

export default Feature2;