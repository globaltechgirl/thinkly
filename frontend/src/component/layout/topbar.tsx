import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useEffect,
  useState,
} from "react";

import { Box, Text, Image } from "@mantine/core";
import { IconMenu2Filled, IconMoon, IconSearch, IconSun } from "@tabler/icons-react";
import { IconBellOutlineDuo18 } from "nucleo-ui-essential-outline-duo-18";
import { useNavigate } from "react-router-dom"; 

import Logo from "@/assets/logo.svg";
import RedIcon from "@/assets/icons/red";
import GreenIcon from "@/assets/icons/green";

import { ROUTES } from "@/utils/constants"; 
import authService from "@/services/auth"; 
import { useTheme } from "./themeContext";

interface TopbarProps {
  screenMode: "desktop" | "medium" | "small";
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

const Topbar: FC<TopbarProps> = ({
  screenMode,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : false,
  );

  const StatusIcon = isOnline ? GreenIcon : RedIcon;

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleLogoClick = () => {
    authService.logout();
    navigate(ROUTES.HOME);
  };

  const styles = {
    container: {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 18,
    },
    left: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer", 
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
    right: {
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    actions: {
      borderRadius: 8,
      padding: 8.5,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 4px 1px var(--shadow-100)",
    },
    action: {
      width: 12,
      height: 12,
    },
    search: {
      position: "absolute",
      left: 10,
      width: 11,
      height: 11,
      color: "var(--dark-200)",
    },
    input: {
      width: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: "clamp(9px, 0.7vw, 11px)",
      color: "var(--dark-100)",
    },
    value: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: isOnline ? "var(--green-300)" : "var(--red-300)",
      color: isOnline ? "var(--green-100)" : "var(--red-100)",
      boxShadow: isOnline
        ? "inset 0 0 4px 1px rgba(74, 222, 128, 0.5)"
        : "inset 0 0 4px 1px rgba(248, 113, 113, 0.5)",
    },
  } as const;

  const showSearchWrapper = screenMode !== "small";

  return (
    <Box style={styles.container}>
      <Box style={styles.left} onClick={handleLogoClick}>
        <Image src={Logo} style={styles.logo} />
        <Text style={styles.label}>Thinkly</Text>
      </Box>

      <Box style={styles.right}>
        {showSearchWrapper && (
          <Box
            style={{
              ...styles.actions,
              position: "relative",
              padding: 6,
              paddingLeft: 30,
              width: 230,
            }}
          >
            <IconSearch style={styles.search} />
            <input
              type="text"
              placeholder="Search for quizzes"
              style={styles.input}
            />
          </Box>
        )}

        <Box style={styles.actions} onClick={toggleTheme}>
          {theme === "dark" ? (
            <IconSun style={styles.action} />
          ) : (
            <IconMoon style={styles.action} />
          )}
        </Box>

        <Box style={styles.actions}>
          <IconBellOutlineDuo18 style={styles.action} />
        </Box>

        {screenMode !== "desktop" && (
          <Box
            style={styles.actions}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <IconMenu2Filled style={styles.action} />
          </Box>
        )}

        <Box style={styles.value}>
          <StatusIcon style={styles.action} />
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;