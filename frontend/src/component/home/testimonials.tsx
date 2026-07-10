import { CSSProperties, useState } from "react";
import { Box, Text, Image } from "@mantine/core";
import StarIcon from "@/assets/icons/star";

import QuoteIcon from "@/assets/icons/quote";
import Avatar1 from "@/assets/user1.jpg"; 
import Avatar2 from "@/assets/user2.jpg"; 
import Avatar3 from "@/assets/user3.jpg";

const testimonialsData = [
  {
    name: "Alex Rivera",
    role: "DevNova Solutions",
    date: "14th May, 2026",
    quote: "Was looking for an evaluation platform that balances deep analytics and user simplicity. Thinkly exceeded my expectations with its intuitive creation interface and immediate grading turnaround.",
    img: Avatar1,
    icon: QuoteIcon,
  },
  {
    name: "Jessica M.",
    role: "Product Manager",
    date: "8th June, 2026",
    quote: "Thinkly has completely transformed how we build and execute user training checkpoints. The anti-cheating security is top-notch, and I love the seamless progress tracking across entire learning pathways!",
    img: Avatar2,
    icon: QuoteIcon,
  },
  {
    name: "Michael T.",
    role: "TechHub",
    date: "3rd April, 2026",
    quote: "The automated quiz modules completely altered how we approach skills validation. It's user-driven, and has saved our instructors hours. Our team can now observe performance analytics visually.",
    img: Avatar3,
    icon: QuoteIcon,
  },
];

const Testimonials = () => {
  const [isPaused, setIsPaused] = useState(false);
  const infiniteTestimonials = [...testimonialsData, ...testimonialsData, ...testimonialsData];

  const [windowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

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
    tracks: {
      width: "100%",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      maskImage: "linear-gradient(to right, transparent, var(--light-100) 15%, var(--light-100) 85%, transparent)",
      WebkitMaskImage: "linear-gradient(to right, transparent, var(--light-100) 15%, var(--light-100) 85%, transparent)",
    },
    track: {
      display: "flex",
      width: "max-content",
      gap: isMobile ? 16 : isTablet ? 24 : 30,
      animationPlayState: isPaused ? "paused" : "running",
      animation: "marqueeSlide 25s linear infinite",
    },
    card: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: "stretch",
      width: isMobile ? "calc(100vw - 40px)" : isTablet ? "420px" : "clamp(450px, 40vw, 520px)",
      height: isMobile ? "auto" : 300,
      padding: 15,
      textAlign: "left",
      gap: isMobile ? 15 : 20,
      flexShrink: 0,
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    images: {
      width: isMobile ? "100%" : "38%",
      height: isMobile ? 220 : "100%",
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "var(--light-400)",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "top",
      borderRadius: 10,
    },
    content: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      marginTop: isMobile ? 0 : 10,
      gap: isMobile ? 20 : 0,
    },
    quotes: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    iconb: {
      width: 20,
      height: 20,
    },
    quote: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6,
      display: "-webkit-box",
      WebkitLineClamp: 5,
      WebkitBoxOrient: "vertical",
      textAlign: "justify",
      overflow: "hidden",
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "flex-end",
      gap: isMobile ? 8 : 0,
      marginTop: "auto",
    },
    meta: {
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? 4 : 0,
    },
    name: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    role: {
      fontSize: "clamp(10px, 0.8vw, 12px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      marginTop: 2,
    },
    date: {
      fontSize: "clamp(9px, 0.7vw, 11px)",
      fontWeight: 450,
      color: "var(--dark-200)",
    },
  } as const;

  return (
    <Box style={styles.container}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marqueeSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-33.333% - 8px)); }
        }
      `}} />

      <Box style={styles.top}>
         <Box style={styles.badges}>
          <StarIcon style={styles.icona} />
          Testimonials
        </Box>

        <Box style={styles.titles}>
          <Text style={styles.title}>
            Trusted by Educators, Loved by Learners
          </Text>

          <Text style={styles.subtitle}>
            Hear from the dedicated instructors and candidates who rely on Thinkly for secure and automated quiz assessments. Their experiences speak for themselves!
          </Text>
        </Box>
      </Box>

      <Box style={styles.tracks} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <Box style={styles.track}>
          {infiniteTestimonials.map((item, index) => {
            const ActiveIcon = item.icon;

            return (
              <Box key={index} style={styles.card}>
                <Box style={styles.images}>
                  <Image src={item.img} alt={item.name} style={styles.image} />
                </Box>

                <Box style={styles.content}>
                  <Box style={styles.quotes}>
                    {ActiveIcon && <ActiveIcon style={styles.iconb} />}
                    <Text style={styles.quote}>{item.quote}</Text>
                  </Box>

                  <Box style={styles.footer}>
                    <Box style={styles.meta}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.role}>{item.role}</Text>
                    </Box>
                    <Text style={styles.date}>{item.date}</Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Testimonials;