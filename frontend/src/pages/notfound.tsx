import { CSSProperties, FC, useEffect, useState } from "react";

import { Box, Image, Text } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/utils/constants";

import Logo from "@/assets/logo.svg?react";
import Image1 from "@/assets/main1.png";
import Image2 from "@/assets/main2.png";
import Image3 from "@/assets/main3.png";
import { IconArrowLeft } from "@tabler/icons-react";

interface Slide {
  id: number;
  image: string;
}

const slides: Slide[] = [
  { id: 1, image: Image1 },
  { id: 2, image: Image2 },
  { id: 3, image: Image3 },
];

const dotStyle = (active: boolean): CSSProperties => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  border: "2px solid var(--border-100)",
  backgroundColor: "var(--light-400)",
  boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
  background: active ? "var(--dark-300)" : "var(--light-400)",
  cursor: "pointer",
});

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    height: "100vh",
    overflow: "hidden",
  },
  wrapper: {
    display: "flex",
    width: "100%",
    height: "100vh",
    position: "relative",
    padding: "8px 0px"
  },
  left: {
    flex: 1,
    flexBasis: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    paddingBottom: 60, 
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  logo: {
    width: 30,
    height: 30,
  },
  texts: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: "clamp(16px, 1.4vw, 18px)",
    fontWeight: 450,
    color: "var(--dark-100)",
  },
  subtitle: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-200)",
    lineHeight: 1.6
  },
  spans: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 5
  },
  icon: {
    width: 14,
    height: 14,
  },
  span: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    cursor: "pointer"
  },
  bottom: {
    position: "absolute",
    bottom: 15,         
    left: "3%",       
    right: "3%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-200)",
  },
  right: {
    flex: 1,
    flexBasis: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "var(--light-400)",
    border: "2px solid var(--border-100)",
    boxShadow: "inset 0 0 0 2px var(--border-300)",
  },
  images: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 40,
    padding: "40px 0 40px 40px",
    borderRadius: 12,
  },
  image: {
    width: "100%",
    height: "80vh",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "left",
    borderRadius: 12,
  },
  dots: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    marginTop: "auto",
  },
};

const NotFound: FC = () => {
  const navigate = useNavigate();

  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showRightBox, setShowRightBox] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setTimeout(() => setVisible(true), 80);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setShowRightBox(width >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleHover = (key: string) => ({
    onMouseEnter: () => setHovered(key),
    onMouseLeave: () => setHovered(null),
  });

  const baseAnim = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(28px)",
    transition: `
      opacity 1.05s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s,
      transform 1.05s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s
    `,
    willChange: "transform, opacity",
  });

  return (
    <Box style={styles.container}>
      <Box style={styles.wrapper}>
        <motion.div style={styles.left} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <Box style={styles.content}>
            <Logo style={{ ...styles.logo, ...baseAnim(0.05) }} />

            <Box style={{ ...styles.texts, ...baseAnim(0.10) }}>
              <Text style={styles.title}>Page Not Found</Text>
              <Text style={styles.subtitle}>Sorry, we couldn't find the page you're looking for.</Text>
            </Box>

            <Text 
              {...handleHover("home")} 
              onClick={() => navigate(ROUTES.REGISTER)}
              style={{ ...styles.spans, ...baseAnim(0.15), textDecoration: hovered === "home" ? "underline" : "none", textUnderlineOffset: "2px" }}
            >
              <IconArrowLeft style={styles.icon} /> 
              <Text style={styles.span}>Back to Home</Text>
            </Text>
          </Box>

          <Box style={{ ...styles.bottom, ...baseAnim(0.20) }}>
            <Text style={styles.text}>© 2026 Thinkly</Text>
            <Text {...handleHover("privacy")} style={{ ...styles.text, cursor: "pointer", color: hovered === "privacy" ? "var(--dark-100)" : "var(--dark-200)" }}>
              Privacy Policy
            </Text>
          </Box>
        </motion.div>

        {showRightBox && (
          <motion.div
            style={styles.right}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box style={styles.images}>
              <AnimatePresence initial={false} mode="wait">
                {slides.map(
                  (item, index) =>
                    index === activeIndex && (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.5 }}
                        style={{ width: "100%" }}
                      >
                        <Box style={styles.image}>
                          <Image src={item.image} style={styles.img} />
                        </Box>
                      </motion.div>
                    )
                )}
              </AnimatePresence>

              <Box style={styles.dots}>
                {slides.map((_, idx) => (
                  <Box
                    key={idx}
                    style={dotStyle(idx === activeIndex)}
                    onClick={() => setActiveIndex(idx)}
                  />
                ))}
              </Box>
            </Box>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default NotFound;