import { FC, useState, useEffect } from "react";
import { Box, Text, Image } from "@mantine/core";
import { motion } from "framer-motion";

import User1 from "@/assets/user1.jpg";
import User2 from "@/assets/user2.jpg";
import User3 from "@/assets/user3.jpg";
import User4 from "@/assets/user4.jpg";
import MedalIcon from "@/assets/icons/medal";
import CursorIcon from "@/assets/icons/cursor";

const testimonials = [
  { name: "Chidi Okafor", avatar: User1, score: "94%", color: "var(--red-100)" },
  { name: "Amina Bello", avatar: User2, score: "88%", color: "var(--blue-100)" },
  { name: "Tunde Bakare", avatar: User3, score: "91%", color: "var(--yellow-100)" },
  { name: "Oluchi Nwosu", avatar: User4, score: "85%", color: "var(--main-100)" },
];

const cursorTargets = {
  centerCell: { x: "50%", y: "50%" },
  bottomRightReset: { x: "75%", y: "88%" },
};

const Feature2: FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<"toCenter" | "toReset">("toCenter");

  useEffect(() => {
    const loop = () => {
      setPhase("toCenter");

      setTimeout(() => {
        setPhase("toReset");
      }, 1600);

      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 3200);
    };

    loop();
    const interval = window.setInterval(loop, 3400);
    return () => window.clearInterval(interval);
  }, []);

  const currentCenterItem = testimonials[activeIndex];
  const firstName = currentCenterItem.name.split(" ")[0]; 

  const cursorCoords = phase === "toCenter" ? cursorTargets.centerCell : cursorTargets.bottomRightReset;
  const isCenterFocused = phase === "toCenter";

  const getUserColor = (name: string) => {
    if (name.includes("Chidi")) {
      return {
        bg: "var(--red-100)",
        color: "var(--red-300)",
        border: "var(--red-200)",
      };
    }

    if (name.includes("Amina")) {
      return {
        bg: "var(--blue-100)",
        color: "var(--blue-300)",
        border: "var(--blue-200)",
      };
    }

    if (name.includes("Tunde")) {
      return {
        bg: "var(--yellow-100)",
        color: "var(--yellow-300)",
        border: "var(--yellow-200)",
      };
    }

    if (name.includes("Oluchi")) {
      return {
        bg: "var(--green-100)",
        color: "var(--green-300)",
        border: "var(--green-200)",
      };
    }

    return {
      bg: "var(--blue-100)",
      color: "var(--blue-300)",
      border: "var(--blue-200)",
    };
  };

  const themeColors = getUserColor(currentCenterItem.name);

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: 285,
      overflow: "hidden",
      position: "relative",
    },
    main: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "0.5fr 1.5fr 0.5fr", 
      gap: 8,
      width: "100%",
      height: "100%",
    },
    cell: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minWidth: 0,
      minHeight: 0,
      position: "relative",
      overflow: "hidden",
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      transition: "background-color 0.4s ease, border-color 0.4s ease",
    },
    fader: {
      position: "relative",
      width: "100%",
      height: "100%",
    },
    images: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      transition: "opacity 0.6s ease-in-out",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "top",
      borderRadius: 10,
    },
    infos: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minWidth: 0,
      width: "100%",
    },
    icon: (isLabelTarget: boolean) => ({
      width: 18,
      height: 18,
      color: isLabelTarget ? themeColors.border : "var(--dark-100)",
      transition: "color 0.4s ease",
    }),
    info: (isLabelTarget: boolean) => ({
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: isLabelTarget ? themeColors.border : "var(--dark-100)",
      transition: "color 0.4s ease",
    }),
    cursors: {
      position: "absolute",
      pointerEvents: "none",
      zIndex: 50,
      transform: "translate(-6px, -6px)", 
    },
    cursor: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    icona: {
      width: 16,
      height: 16,
      transform: "rotate(-20deg)",
      color: themeColors.color,
    },
    name: {
      borderRadius: 8,
      padding: "2.5px 8px",
      fontSize: "clamp(9px, 0.7vw, 11px)",
      fontWeight: 450,
      backdropFilter: "blur(6px)",
      backgroundColor: themeColors.bg,
      color: themeColors.color,
      border: `1px solid ${themeColors.border}`,
    },
  } as const;

  return (
    <Box style={styles.container}>
      <Box style={styles.main}>
        {[0, 1, 2].map((row) => {
          return [0, 1, 2].map((col) => {
            const isTopMiddle = row === 0 && col === 1;
            const isBottomMiddle = row === 2 && col === 1;
            const isMiddleLeft = row === 1 && col === 0;
            const isMiddleCenter = row === 1 && col === 1;
            const isMiddleRight = row === 1 && col === 2;
            const shouldDynamicColor = (isTopMiddle || isBottomMiddle) && isCenterFocused;

            return (
              <Box key={`${row}-${col}`} style={styles.cell}>
                {isTopMiddle && (
                  <Box style={styles.infos}>
                    <MedalIcon style={styles.icon(shouldDynamicColor)} />
                    <Text visibleFrom="md" style={styles.info(shouldDynamicColor)}>
                      {currentCenterItem.name}
                    </Text>

                    <Text hiddenFrom="md" style={styles.info(shouldDynamicColor)}>
                      {firstName}
                    </Text>
                  </Box>
                )}

                {isMiddleLeft && (
                  <Box style={styles.fader}>
                    {testimonials.map((item, index) => {
                      const isLeftActive = index === (activeIndex + testimonials.length - 1) % testimonials.length;
                      return (
                        <Box
                          key={`left-fade-${index}`}
                          style={{ ...styles.images, opacity: isLeftActive ? 1 : 0, zIndex: isLeftActive ? 2 : 1, }}
                        >
                          <Image src={item.avatar} alt={item.name} style={styles.image} />
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {isMiddleCenter && (
                  <Box style={styles.fader}>
                    {testimonials.map((item, index) => {
                      const isCenterActive = index === activeIndex;
                      return (
                        <Box key={`center-fade-${index}`} style={{ ...styles.images, opacity: isCenterActive ? 1 : 0, zIndex: isCenterActive ? 2 : 1 }}>
                          <Image src={item.avatar} alt={item.name} style={styles.image} />
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {isMiddleRight && (
                  <Box style={styles.fader}>
                    {testimonials.map((item, index) => {
                      const isRightActive = index === (activeIndex + 1) % testimonials.length;
                      return (
                        <Box key={`right-fade-${index}`} style={{ ...styles.images, opacity: isRightActive ? 1 : 0, zIndex: isRightActive ? 2 : 1, }}>
                          <Image src={item.avatar} alt={item.name} style={styles.image} />
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {isBottomMiddle && (
                  <Box style={styles.infos}>
                    <Text visibleFrom="md" style={styles.info(shouldDynamicColor)}>
                      Score Board - {currentCenterItem.score}
                    </Text>

                    <Text hiddenFrom="md" style={styles.info(shouldDynamicColor)}>
                      {currentCenterItem.score}
                    </Text>
                  </Box>
                )}
              </Box>
            );
          });
        })}
      </Box>

      <motion.div animate={{ left: cursorCoords.x, top: cursorCoords.y, }} transition={{ duration: 0.8, ease: "easeInOut" }} style={styles.cursors}>
        <Box style={styles.cursor}>
          <CursorIcon fillColor={themeColors.bg} strokeColor={themeColors.color} style={styles.icona} />
          <Box style={styles.name}>
            {firstName}
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Feature2;