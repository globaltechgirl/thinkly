import { useState, useEffect, useRef, CSSProperties } from "react";

import { Box, Text, Image } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";

import Logo from "@/assets/logo.svg";
import Home from "@/assets/home.png";
import StarIcon from "@/assets/icons/star";
import Tools from "./tools";
import Features from "./features";
import Testimonials from "./testimonials";
import Footer from "./footer";
import { IconMenu2Filled, IconX } from "@tabler/icons-react";
import { createPortal } from "react-dom";

class Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;

    this.r = Math.random() * 1.8 + 0.2;
    this.opacity = Math.random() * 0.8 + 0.2;
  }

  update(w: number, h: number) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > w) this.vx *= -1;
    if (this.y < 0 || this.y > h) this.vy *= -1;

    this.opacity += (Math.random() - 0.5) * 0.02;

    if (this.opacity < 0.2) this.opacity = 0.2;
    if (this.opacity > 1) this.opacity = 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;

    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255,255,255,0.6)";

    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const Main = () => {
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const homeRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const handleScrollToSection = (item: string) => {
    setOpenMobileMenu(false);

    if (item === "Home" && homeRef.current) {
      homeRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (item === "Tools" && toolsRef.current) {
      toolsRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (item === "Features" && featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (item === "Testimonials" && testimonialsRef.current) {
      testimonialsRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (item === "Footer" && footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setWindowWidth(window.innerWidth);
    };

    resize();

    const stars = Array.from(
      { length: 120 },
      () => new Star(canvas.width, canvas.height),
    );

    const connect = () => {
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);

            ctx.strokeStyle = `rgba(255,255,255,${
              (1 - dist / 110) * 0.08
            })`;

            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      connect();

      for (const star of stars) {
        star.update(canvas.width, canvas.height);
        star.draw(ctx);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const isMobile = windowWidth <= 768;

  useEffect(() => {
    if (!isMobile) {
      setOpenMobileMenu(false);
    }
  }, [isMobile]);

  const styles: Record<string, CSSProperties> = {
    container: {
      background: "var(--light-100)",
      minHeight: "100vh",
      overflowY: "auto", 
      overflowX: "hidden",
      position: "relative",
    },
    canvas: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 0,
    },
    nav: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "20px 20px" : "30px 40px",
      position: "relative",
      zIndex: 10,
    },
    logos: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    logo: {
      width: 28,
      height: 28,
      objectFit: "contain",
      objectPosition: "center",
    },
    icon: {
      width: 16,
      height: 16,
    },
    label: {
      fontSize: "clamp(15px, 1.3vw, 17px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    links: {
      display: isMobile ? "none" : "flex",
      alignItems: "center",
      gap: windowWidth <= 1024 ? 20 : 40,
      listStyle: "none",
      margin: 0,
      padding: 0,
    },
    link: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      textDecoration: "none",
      cursor: "pointer",
    },
    cta: {
      borderRadius: 8,
      padding: "6px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
      boxShadow: `inset 0 0 4px 1px rgba(191, 219, 254, 0.45)`,
      cursor: "pointer",
      fontSize: "clamp(10px, 0.8vw, 12px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    hero: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      zIndex: 10,
      overflow: "hidden",
    },
    main: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 30,
      padding: isMobile ? "60px 20px 40px" : "120px 40px 70px",
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
      fontSize: "clamp(28px, 4vw, 72px)",
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
      maxWidth: isMobile ? "100%" : windowWidth <= 1024 ? "85%" : "65%",
    },
    button: {
      borderRadius: 8,
      padding: "6px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
      boxShadow: `inset 0 0 4px 1px rgba(191, 219, 254, 0.45)`,
      cursor: "pointer",
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      marginTop: 10,
    },
    clouds: {
      position: "relative",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    cloud: {
      position: "absolute",
      top: "10%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "70%",
      height: "65%",
      background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
      boxShadow: `inset 0 0 4px 1px rgba(191, 219, 254, 0.45)`,
      borderRadius: 100,
      filter: "blur(90px)",
      opacity: 0.35,     
      zIndex: 1,
      pointerEvents: "none",
      mixBlendMode: "screen",
    },
    images: {
      display: "flex",
      alignItems: "center",
      padding: isMobile ? 6 : 10,
      maxWidth: isMobile ? "95%" : "85%",
      borderRadius: 12,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid rgba(191, 219, 254, 0.45)`,
      position: "relative",
      zIndex: 2, 
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
      borderRadius: 12,
    },
    demarcates: {
      position: "relative",
      width: "100%",
      marginTop: isMobile ? -50 : -100,
      paddingTop: isMobile ? 80 : 120,
      zIndex: 5,
    },
    demarcate: {
      position: "absolute",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "140%",
      height: isMobile ? 200 : 250,
      background: "linear-gradient(to bottom, var(--light-100), var(--light-200), transparent)",
      borderRadius: "30% 30% 0 0 / 70% 70% 0 0", 
      filter: "blur(20px)",
      zIndex: 0,
    },  
    content: {
      position: "relative",
      zIndex: 1,
    },
    menus: {
      position: "fixed",
      inset: 0,
      transition: "background-color 250ms ease",
      zIndex: 9998,
    },
    menu: {
      position: "absolute",
      top: 0,
      right: 0,
      height: "100%",
      maxWidth: "100%",
      backgroundColor: "var(--light-100)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 2px var(--border-200)",
      transition: "transform 250ms ease",
      overflowY: "auto",
      pointerEvents: "auto",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 24,
    },
    overlays: {
      display: "flex",
      justifyContent: "flex-end",
      padding: 12,
    },
    overlay: {
      borderRadius: 8,
      padding: 8.5,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 4px 1px var(--shadow-100)",
    },
    icon1: {
      width: 12,
      height: 12,
    },
    links1: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      listStyle: "none",
      margin: "0 30px",
    },
    cta1: {
      borderRadius: 8,
      padding: "8px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
      boxShadow: `inset 0 0 4px 1px rgba(191, 219, 254, 0.45)`,
      cursor: "pointer",
      fontSize: "clamp(10px, 0.8vw, 12px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      margin: "0 30px",
    },
  } as const;

  return (
    <Box style={styles.container} className="scroll" ref={homeRef}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <Box style={styles.nav}>
        <Box style={styles.logos}>
          <Image src={Logo} style={styles.logo} />
          <Text style={styles.label}>Thinkly</Text>
        </Box>

        <ul style={styles.links}>
          {["Home", "Tools", "Features", "Testimonials", "Contact"].map((item) => (
            <li key={item}>
              <a
                style={{ ...styles.link, color: hoveredLink === item ? "var(--dark-200)" : "var(--dark-100)" }}
                onMouseEnter={() => setHoveredLink(item)}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={() => handleScrollToSection(item)} 
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {isMobile ? (
          <Box style={styles.overlay} onClick={() => setOpenMobileMenu(true)}>
            <IconMenu2Filled style={styles.icon1} />
          </Box>
        ) : (
          <Box style={styles.cta} onClick={() => navigate(ROUTES.REGISTER)}>Sign Up</Box>
        )}
      </Box>

      <Box style={styles.hero}>
        <Box style={styles.main}>
          <Box style={styles.badges}>
            <StarIcon style={styles.icona} />
            Secure Assessments, Trusted by Thousands
          </Box>

          <Box style={styles.titles}>
            <Text style={styles.title}>
              The evolution of interactive assessments
            </Text>

            <Text style={styles.subtitle}>
              A new era of knowledge testing begins with tools that adapt to you. 
              {!isMobile} {" "}
              Experience a workspace where every assessment and insight works seamlessly.
            </Text>
          </Box>

          <button style={styles.button}>Watch Demo Video</button>
        </Box>

        <Box style={styles.clouds}>
          <div style={styles.cloud} />
          <Box style={styles.images}>
            <Image src={Home} style={styles.image} />
          </Box>
        </Box>

        <Box style={styles.demarcates}>
          <Box style={styles.demarcate} />
          <Box style={styles.content}>
            <Box ref={toolsRef}><Tools /></Box>
            <Box ref={featuresRef}><Features /></Box>
            <Box ref={testimonialsRef}><Testimonials /></Box>
            <Box ref={footerRef}><Footer /></Box>
          </Box>
        </Box>
      </Box>

      {isMobile && 
        createPortal(
          <Box
            style={{ 
              ...styles.menus,
              backgroundColor: openMobileMenu ? "rgba(0,0,0,0.3)" : "transparent",
              pointerEvents: openMobileMenu ? "auto" : "none",
            }}
            onClick={() => setOpenMobileMenu(false)}
          >
            <Box
              style={{
                ...styles.menu,
                width: windowWidth <= 640 ? "100%" : 360,
                transform: openMobileMenu ? "translateX(0)" : "translateX(100%)",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <Box style={styles.overlays}>
                <Box style={styles.overlay} onClick={() => setOpenMobileMenu(false)}>
                  <IconX style={styles.icon1} />
                </Box>
              </Box>

              <ul style={styles.links1}>
                {["Home", "Tools", "Features", "Testimonials", "Contact"].map((item) => (
                  <li key={item}>
                    <a style={styles.link} onClick={() => handleScrollToSection(item)}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>

              <Box style={styles.cta1} onClick={() => { setOpenMobileMenu(false); navigate(ROUTES.REGISTER); }}>
                Sign Up
              </Box>
            </Box>
          </Box>,
          document.body
        )
      }
    </Box>
  );
}

export default Main;