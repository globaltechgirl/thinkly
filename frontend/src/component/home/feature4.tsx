import { FC, useEffect, useState } from "react";
import { Stack, Box, Text } from "@mantine/core";
import { IconStarOutlineDuo18, IconTicket4OutlineDuo18, IconTriangleWarningOutlineDuo18, IconUsersOutlineDuo18 } from "nucleo-ui-essential-outline-duo-18";

const submissions = [
  { name: "Emma", task: "Fifthlab User submitted New Create Quiz", tag: "submitted", colorIdx: 1 },
  { name: "Daniel", task: "Fifthlab Admin started Production Quiz", tag: "started", colorIdx: 3 },
  { name: "Aisha", task: "New Create Quiz was updated yesterday", tag: "updated", colorIdx: 2 },
  { name: "Noah", task: "New Create Quiz was published yesterday", tag: "published", colorIdx: 4 },
  { name: "Liam", task: "New Create Quiz was deleted today", tag: "deleted", colorIdx: 0 },
];

const CARD_HEIGHT = 64; 
const GAP = 10;
const VISIBLE_CARDS = 4;
const DURATION = 700;

const Feature4: FC = () => {
  const [cards, setCards] = useState(submissions.slice(0, VISIBLE_CARDS));
  const [offsets, setOffsets] = useState(cards.map((_, i) => i * (CARD_HEIGHT + GAP)));
  const [nextIndex, setNextIndex] = useState(VISIBLE_CARDS);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextCard = submissions[nextIndex % submissions.length];
      setCards((prev) => [nextCard, ...prev]);
      setAnimating(true);
      setOffsets((prev) => prev.map((o) => o + CARD_HEIGHT + GAP));
      const timeout = setTimeout(() => {
        setCards((prev) => prev.slice(0, VISIBLE_CARDS)); 
        setOffsets(Array(VISIBLE_CARDS).fill(0).map((_, i) => i * (CARD_HEIGHT + GAP)));
        setAnimating(false);
      }, DURATION);

      setNextIndex((prev) => prev + 1);

      return () => clearTimeout(timeout);
    }, 2000);

    return () => clearInterval(interval);
  }, [nextIndex]);

  const pastelColors = [
    { bg: "var(--red-100)", color: "var(--red-300)", border: "var(--red-200)" },
    { bg: "var(--green-100)", color: "var(--green-300)", border: "var(--green-200)" },
    { bg: "var(--blue-100)", color: "var(--blue-300)", border: "var(--blue-200)" },
    { bg: "var(--yellow-100)", color: "var(--yellow-300)", border: "var(--yellow-200)" },
    { bg: "var(--purple-100)", color: "var(--purple-300)", border: "var(--purple-200)" },
  ];

  const getIcon = (tag: string, colorScheme: typeof pastelColors[0]) => {
    const iconStyle = {
      width: 12,
      height: 12,
      color: colorScheme.color,
    };

    switch (tag) {
      case "started":
        return <IconStarOutlineDuo18 style={iconStyle} />;
      case "submitted":
        return <IconUsersOutlineDuo18 style={iconStyle} />;
      case "deleted":
        return <IconTriangleWarningOutlineDuo18 style={iconStyle} />;
      case "updated":
      case "published":
        return <IconTicket4OutlineDuo18 style={iconStyle} />;
      default:
        return null;
    }
  };

  const styles = {
    container: { 
      display: "flex", 
      justify: "center", 
      width: "100%" 
    },
    stack: {
      display: "flex",
      flexDirection: "column",
      height: CARD_HEIGHT * VISIBLE_CARDS + GAP * (VISIBLE_CARDS - 1),
      position: "relative",
      overflow: "hidden",
      width: "100%",
    },
    cards: (i: number) => ({
      position: "absolute" as const,
      width: "100%",
      top: 0,
      transform: `translateY(${offsets[i]}px)`,
      transition: animating ? `transform ${DURATION}ms cubic-bezier(.22,1,.36,1)` : "none",
    }),
    card: {
      display: "flex",
      alignItems: "center",
      padding: "8px 14px",
      gap: 14,
      minHeight: CARD_HEIGHT,
      width: "100%",
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "1px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    circle: {
      borderRadius: "50%",
      padding: 5,
      marginRight: -2,
    },
    text: { 
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6,
      textAlign: "left",
    },
    span: {
      color: "var(--dark-200)",
      marginLeft: 6
    },
  } as const;

  return (
    <Stack style={styles.container}>
      <Box style={styles.stack}>
        {cards.map((item, i) => {
          const colorTheme = pastelColors[item.colorIdx ?? 0];

          return (
            <Box key={i} style={styles.cards(i)}>
              <Box style={styles.card}>
                <Box style={{ ...styles.circle, backgroundColor: colorTheme.bg, border: `1px solid ${colorTheme.border}` }}>
                  {getIcon(item.tag, colorTheme)}
                </Box>

                <Text style={styles.text}>
                  {item.name}
                  <span style={styles.span}>{item.tag} {item.task}</span>
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default Feature4;