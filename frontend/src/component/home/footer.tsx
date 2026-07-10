import { CSSProperties, useState } from "react";
import { Box, Text } from "@mantine/core";

const footerLinks = [
  { id: "terms", href: "/terms", label: "Terms of Service" },
  { id: "privacy", href: "/privacy", label: "Privacy Policy" },
  { id: "cookies", href: "/cookies", label: "Cookie Policy" },
];

const Footer = () => {
  const [windowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobile = windowWidth <= 768;

  const styles: Record<string, CSSProperties> = {
    container: {
      position: "relative",
      width: "100%",
      backgroundColor: "var(--light-100)",
      padding: isMobile ? "20px 20px 20px" : "40px 40px 30px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxSizing: "border-box",
    },
    main: {
      position: "relative",
      zIndex: 2, 
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      margin: "0 auto",
      marginTop: "auto",
      flexWrap: "wrap",
      gap: 15,
    },
    copyright: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6,
    },
    links: {
      display: "flex",
      alignItems: "center",
      gap: 20,
    },
    link: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      lineHeight: 1.6,
      transition: "color 0.2s ease",
      cursor: "pointer",
    }
  } as const;
  
  const currentYear = new Date().getFullYear();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <Box component="footer" style={styles.container}>
      <Box style={styles.main}>
        <Text style={styles.copyright}>
          &copy; {currentYear} Thinkly. All rights reserved.
        </Text>

        <Box style={styles.links}>
          {footerLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              style={{ ...styles.link, color: hoveredLink === link.id ? "var(--dark-200)" : "var(--dark-100)" }}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.label}
            </a>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;