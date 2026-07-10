import { createPortal } from "react-dom";
import { type FC, useEffect, useState } from "react";

import { Box, Text } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";

import { BottomLinks, NavLinks, ROUTES } from "@/utils/constants";

import { useUsers } from "@/hooks/use-users";
import { useQuiz } from "@/hooks/use-quiz";

import authService from "@/services/auth";

import Icon from "@/assets/icon.jpg";

import ProfilePopup from "../popup/profile";
import { useTheme } from "./themeContext";

const styles = {
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "15px 15px 25px 15px",
    gap: 30,
  },
  top: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  preview: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    gap: 8,
    padding: 5,
    borderRadius: 10,
    backgroundColor: "var(--light-400)",
    boxShadow: "inset 0 0 4px 1px var(--shadow-100)",
  },
  images: {
    width: 36,
    height: 36,
    overflow: "hidden",
    borderRadius: 8,
    border: "1px solid var(--border-100)",
    objectFit: "cover",
    objectPosition: "top",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "top",
  },
  texts: {
    display: "flex",
    flexDirection: "column",
  },
  text: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    marginBottom: -1,
  },
  span: {
    fontSize: "clamp(10px, 0.8vw, 12px)",
    fontWeight: 450,
    color: "var(--dark-200)",
  },
  navs: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  titles: {
    position: "relative",
    zIndex: 10,
    borderBottom: "2px solid var(--border-100)",
    boxShadow: "0 1px 0 0 var(--border-200)",
    marginBottom: 6,
  },
  title: {
    fontSize: "clamp(9px, 0.7vw, 11px)",
    fontWeight: 450,
    color: "var(--dark-300)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    borderRadius: 8,
    padding: "7px 11.5px",
  },
  flex: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 17,
    height: 17,
  },
  label: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    marginTop: 1,
  },
  bottom: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
} as const;

const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme } = useTheme(); 
  const isLightTheme = theme === "light";

  const { getProfile } = useUsers();
  const { fetchAdminQuizzes } = useQuiz();

  const [user, setUser] = useState<any>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [openProfile, setOpenProfile] = useState(false);

  const userName = user?.fullName || "User";
  const emailAddress = user?.email || "User";
  const profileImage = user?.profilePicture || null;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    authService.logout();
    navigate(ROUTES.LOGIN);
  };

  const handleBottomNavClick = (label: string) => {
    switch (label) {
      case "Settings":
        setOpenProfile(true);
        break;
      case "Log out":
        handleLogout();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    const handleProfileUpdated = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    loadProfile();

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [getProfile]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      if (user.role !== "admin") return;
      await fetchAdminQuizzes();
    };

    load();
  }, [user]);

  return (
    <>
      <Box style={styles.container}>
        <Box style={styles.top}>
          <Box style={styles.preview}>
            <Box style={styles.images}>
              <img
                src={profileImage || Icon}
                style={styles.image}
                alt="profile"
              />
            </Box>

            <Box style={styles.texts}>
              <Text style={styles.text}>{userName}</Text>
              <Text style={styles.span}>{emailAddress}</Text>
            </Box>
          </Box>
        </Box>

        <Box style={styles.navs}>
          <Box style={styles.titles}>
            <Text style={styles.title}>Main Menu</Text>
          </Box>
          
          {NavLinks.map((item) => {
            const { link, icon: IconComponent, activeIcon, label } = item;
            const active = link ? isActive(link) : false;

            const IconToRender = active ? activeIcon : IconComponent;

            return (
              <Box
                key={label}
                style={{
                  ...styles.nav,
                  backgroundColor: active ? "var(--light-400)" : "transparent",
                  color: active ? (isLightTheme ? "var(--blue-300)" : "var(--blue-200)") : "var(--dark-200)",
                  boxShadow: active ? "inset 0 0 4px 1px rgba(255,255,255,0.05)" : "none",
                }}
                onClick={() => navigate(link)}
              >
                <Box style={styles.flex}>
                  <IconToRender style={styles.icon} />
                  <Text style={styles.label}>{label}</Text>
                </Box>
              </Box>
            );
          })} 
        </Box>

        <Box style={{ flex: 1 }} />

        <Box style={styles.bottom}>
          <Box style={styles.titles}>
            <Text style={styles.title}>Support</Text>
          </Box>

          {BottomLinks.map((item) => {
            const { icon: IconComponent, label } = item;
            const hovered = hoveredNav === label;

            return (
              <Box
                key={label}
                onMouseEnter={() => setHoveredNav(label)}
                onMouseLeave={() => setHoveredNav(null)}
                onClick={() => handleBottomNavClick(label)}
                style={{
                  ...styles.nav,
                  color: hovered ? "var(--dark-100)" : "var(--dark-200)",
                }}
              >
                <Box style={styles.flex}>
                  <IconComponent style={styles.icon} />
                  <Text style={styles.label}>{label}</Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {openProfile &&
        createPortal(
          <ProfilePopup onClose={() => setOpenProfile(false)} />,
          document.body,
        )}
    </>
  );
};

export default Sidebar;
