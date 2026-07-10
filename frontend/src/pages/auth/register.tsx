import { CSSProperties, FC, useEffect, useState } from "react";
import { Box, Image, Text } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Logo from "@/assets/logo.svg?react";
import Image1 from "@/assets/main1.png";
import Image2 from "@/assets/main2.png";
import Image3 from "@/assets/main3.png";

import authService from "@/services/auth";
import { notifyErrorOnce, notifySuccess } from "@/api/notify";

import EyeIcon from "@/assets/icons/eye";
import EyesIcon from "@/assets/icons/eyes";

import { ROUTES } from "@/utils/constants";

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
  body: {
    width: "70%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 40,
  },
  main: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  logo: {
    width: 30,
    height: 30,
    marginBottom: 8
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
  inputs: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: 20,
  },
  label: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    marginBottom: "-10px",
  },
  input: {
    flexShrink: 0,
    padding: "0 12px",
    height: 42,
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    borderRadius: 10,
    backgroundColor: "var(--light-400)",
    border: "1.5px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    outline: "none",
  },
  icon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "var(--dark-200)",
    width: 14,
    height: 14,
  },
  button: {
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

interface FormData {
  fullName: string;
  email: string;
  password: string;
}

const Register: FC = () => {
  const navigate = useNavigate();

  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRightBox, setShowRightBox] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setTimeout(() => setVisible(true), 80);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setShowRightBox(width >= 1024);
      setIsSmallScreen(width < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleHover = (key: string) => ({
    onMouseEnter: () => setHovered(key),
    onMouseLeave: () => setHovered(null),
  });

  const handleFormChange = (field: keyof FormData, value: string) => {
    if (value.length > 300) return;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const baseAnim = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(28px)",
    transition: `
      opacity 1.05s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s,
      transform 1.05s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s
    `,
    willChange: "transform, opacity",
  });

  const handleRegister = async () => {
    try {
      setLoading(true);
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      notifySuccess("Account created successfully");
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      notifyErrorOnce(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={styles.container}>
      <Box style={styles.wrapper}>
        <motion.div
          style={styles.left}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box style={{ ...styles.body, width: isSmallScreen ? "85%" : "70%" }}>
            <Box style={styles.main}>
              <Logo style={{ ...styles.logo, ...baseAnim(0.05) }} />

              <Text style={{ ...styles.title, ...baseAnim(0.10) }}>
                Welcome to Thinkly
              </Text>
              
              <Text style={{ ...styles.subtitle, ...baseAnim(0.15) }}>
                Please enter your details to create your Thinkly account
              </Text>
            </Box>

            <Box style={styles.inputs}>
              <label style={{ ...styles.label, ...baseAnim(0.25) }}>
                Full Name
              </label>
              <input
                type="text"
                style={{ ...styles.input, ...baseAnim(0.28) }}
                value={formData.fullName}
                onChange={(e) => handleFormChange("fullName", e.target.value)}
                placeholder="John Doe"
              />

              <label style={{ ...styles.label, ...baseAnim(0.35) }}>
                Email Address
              </label>
              <input
                type="email"
                style={{ ...styles.input, ...baseAnim(0.38) }}
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                placeholder="example@gmail.com"
              />

              <label style={{ ...styles.label, ...baseAnim(0.45) }}>Password</label>
              <Box style={{ ...styles.input, ...baseAnim(0.48) }}>
                <input
                  type={showPassword ? "text" : "password"}
                  style={{
                    fontSize: "clamp(12px, 1vw, 14px)",
                    fontWeight: 400,
                    color: "var(--dark-100)",
                    outline: "none",
                    width: "100%",
                    background: "transparent",
                    border: "none",
                  }}
                  value={formData.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  placeholder="••••••••"
                />

                {showPassword ? (
                  <EyesIcon
                    style={styles.icon}
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <EyeIcon
                    style={styles.icon}
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </Box>

              <Box
                style={{
                  ...styles.button,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  ...baseAnim(0.58),
                }}
                onClick={!loading ? handleRegister : undefined}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "var(--light-200)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "var(--light-400)";
                  }
                }}
              >
                {loading ? "Authenticating..." : "Sign Up"}
              </Box>
            </Box>
          </Box>

          <Box style={{ ...styles.bottom, ...baseAnim(0.68) }}>
            <Text style={styles.text}>© 2026 Thinkly</Text>
            <Text style={styles.text}>
              Already have an account? {" "}
              <span 
                {...handleHover("link")}
                onClick={() => navigate(ROUTES.LOGIN)}
                style={{ 
                  cursor: "pointer",
                  color: "var(--dark-100)",
                  textDecoration: hovered === "link" ? "underline" : "none",
                  textUnderlineOffset: "2px", 
                }}
              >
                Sign In
              </span>
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

export default Register;