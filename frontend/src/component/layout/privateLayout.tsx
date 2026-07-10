import { createPortal } from "react-dom";
import { type FC, type CSSProperties, useEffect, useState } from "react";

import { AppShell, Box, Text } from "@mantine/core";
import { IconUpload, IconX } from "@tabler/icons-react";
import {
  IconCalendarOutlineDuo18,
  IconPlusOutlineDuo18,
} from "nucleo-ui-essential-outline-duo-18";
import { Outlet, useLocation } from "react-router-dom";

import BlueIcon from "@/assets/icons/blue";

import { useUsers } from "@/hooks/use-auth";

import Sidebar from "@/component/layout/sidebar";

import ConnectPopup from "../popup/connect";
import CreatePopup from "../popup/create";
import Topbar from "./topbar";

import { ROUTES } from "@/utils/constants";
import { useTheme } from "./themeContext";

const TOPBAR_HEIGHT = 70;
const SIDEBAR_WIDTH = 270;

const layoutHeights = {
  full: "100vh",
  withTopbar: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
};

type ScreenMode = "desktop" | "medium" | "small";

const getScreenMode = (width: number): ScreenMode => {
  if (width <= 640) return "small";
  if (width <= 1024) return "medium";
  return "desktop";
};

const styles: Record<string, CSSProperties> = {
  appshell: {
    backgroundColor: "var(--light-100)",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100vh",
  },
  topbar: {
    width: "100%",
    height: `${TOPBAR_HEIGHT}px`,
    flexShrink: 0,
    backgroundColor: "var(--light-100)",
    position: "relative",
    zIndex: 10,
    borderBottom: "2px solid var(--border-100)",
    boxShadow: "0 1px 0 0 var(--border-200)",
  },
  body: {
    display: "flex",
    width: "100%",
    overflow: "hidden",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: "100%",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
  },
  outlets: {
    flex: 1,
    overflowY: "auto",
    padding: 15,
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  info: {
    padding: "12px 18px",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    backgroundColor: "var(--blue-400)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid var(--blue-300)",
    boxShadow: `inset 0 0 8px 1px rgba(255, 255, 255, 0.12), 0 4px 12px var(--shadow-200)`,
    overflow: "hidden",
  },
  tickers: {
    width: "100%",
    overflow: "hidden",
    display: "flex",
  },
  ticker: {
    display: "flex",
    whiteSpace: "nowrap",
    width: "200%",
  },
  icon: {
    width: 16,
    height: 16,
  },
  text: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
  },
  outlet: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--light-200)",
    borderRadius: 14,
    border: "2px solid var(--border-100)",
    boxShadow: "inset 0 0 0 2px var(--border-200)",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 18,
    gap: 30,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
  },
  active: {
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
    boxShadow: `inset 0 0 4px 1px rgba(191, 219, 254, 0.45)`,
    fontSize: "clamp(10px, 0.8vw, 12px)",
    fontWeight: 450,
    color: "#ffffff",
  },
  items: {
    backgroundColor: "var(--light-400)",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxShadow: "inset 0 0 4px 1px var(--shadow-100)",
    fontSize: "clamp(10px, 0.8vw, 12px)",
    fontWeight: 450,
  },
  icona: {
    width: 12,
    height: 12,
  },
  item1: {
    fontSize: "clamp(10px, 0.8vw, 12px)",
    fontWeight: 450,
    color: "#ffffff",
  },
  item2: {
    fontSize: "clamp(10px, 0.8vw, 12px)",
    fontWeight: 450,
    color: "var(--dark-100)", 
  },
  tickerText: {
    display: "inline-block",
    whiteSpace: "nowrap",
  },
  span: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--blue-100)",
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
  },
  overlays: {
    display: "flex",
    justifyContent: "flex-end",
    padding: 12,
  },
  overlay: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backgroundColor: "var(--light-400)",
    borderRadius: 8,
    padding: 8,
    boxShadow: "inset 0 0 4px 1px var(--shadow-100)",
  },
};

const PrivateLayout: FC = () => {
  const location = useLocation();

  const { profile } = useUsers();

  const [openConnectQuiz, setOpenConnectQuiz] = useState(false);
  const [openCreatePopup, setOpenCreatePopup] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [screenMode, setScreenMode] = useState<ScreenMode>("desktop");

  const isMobile = screenMode !== "desktop";

  const role = profile?.role ?? "user";
  const isUserRole = role === "user";

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isHome = location.pathname === ROUTES.HOME;

  const path = location.pathname;

  const isQuiz =
    path.startsWith("/quiz/") ||
    location.pathname.startsWith(ROUTES.PLAY) ||
    location.pathname.startsWith(ROUTES.GUEST);

  const hideLayout = isHome || isQuiz;

  useEffect(() => {
    const handleResize = () => {
      setScreenMode(getScreenMode(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setOpenMobileMenu(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, [location.pathname]);

  const { theme } = useTheme();
  const isLightTheme = theme === "light";

  return (
    <>
      <AppShell style={styles.appshell} padding={0}>
        <Box style={styles.container}>
          {!hideLayout && (
            <Box style={styles.topbar}>
              <Topbar
                screenMode={screenMode}
                mobileMenuOpen={openMobileMenu}
                setMobileMenuOpen={setOpenMobileMenu}
              />
            </Box>
          )}

          <Box
            style={{
              ...styles.body,
              height: hideLayout
                ? layoutHeights.full
                : layoutHeights.withTopbar,
            }}
          >
            {!hideLayout && !isMobile && (
              <Box style={styles.sidebar}>
                <Sidebar />
              </Box>
            )}

            <Box
              style={{ ...styles.outlets, padding: isQuiz ? 0 : 15 }}
              className="scroll"
            >
              {!hideLayout && isMobile && (
                <Box style={styles.info}>
                  <BlueIcon style={styles.icon} />
                  <Box style={styles.tickers}>
                    <Box className="ticker" style={styles.ticker}>
                      <Text style={styles.text}>
                        Maximize your Thinkly experience
                        <span style={{ ...styles.span, marginLeft: 4 }}>
                          check out our premium features!
                        </span>
                      </Text>

                      <Text style={styles.text} aria-hidden="true">
                        Maximize your Thinkly experience
                        <span style={{ ...styles.span, marginLeft: 4 }}>
                          check out our premium features!
                        </span>
                      </Text>

                    </Box>
                  </Box>
                </Box>
              )}

              {!hideLayout && !isMobile && (
                <Box style={styles.info}>
                  <BlueIcon style={styles.icon} />
                  <Text style={styles.text}>
                    Maximize your Thinkly experience
                    <span
                      style={{
                        ...styles.span,
                        color: isLightTheme ? "var(--blue-300)" : "var(--blue-100)",
                        marginLeft: 4,
                      }}
                    >
                      check out our premium features!
                    </span>
                  </Text>
                </Box>
              )}

              <Box
                style={{
                  ...styles.outlet,
                  borderRadius: isQuiz ? 0 : 14,
                  border: isQuiz ? "none" : styles.outlet.border,
                  boxShadow: isQuiz ? "none" : styles.outlet.boxShadow,
                }}
              >
                <Box style={styles.main}>
                  {!hideLayout && (
                    <Box style={styles.nav}>
                      {isUserRole ? (
                        <>
                          <Box
                            style={styles.active}
                            onClick={() => setOpenConnectQuiz(true)}
                          >
                            <IconUpload style={styles.icona} />
                            <Text style={styles.item}>Connect</Text>
                          </Box>

                          <Box
                            style={styles.items}
                            onClick={() => setOpenCreatePopup(true)}
                          >
                            <IconPlusOutlineDuo18 style={styles.icona} />
                            <Text style={styles.item}>Create</Text>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            style={styles.active}
                            onClick={() => setOpenCreatePopup(true)}
                          >
                            <IconPlusOutlineDuo18 style={styles.icona} />
                            <Text style={styles.item1}>Create</Text>
                          </Box>

                          <Box
                            style={styles.items}
                            onClick={() => setOpenConnectQuiz(true)}
                          >
                            <IconUpload style={styles.icona} />
                            <Text style={styles.item2}>Connect</Text>
                          </Box>
                        </>
                      )}

                      <Box style={styles.items}>
                        <IconCalendarOutlineDuo18 style={styles.icona} />
                        <Text style={styles.item2}>{currentDate}</Text>
                      </Box>
                    </Box>
                  )}
                  <Outlet />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </AppShell>

      {openConnectQuiz &&
        createPortal(
          <ConnectPopup onClose={() => setOpenConnectQuiz(false)} />,
          document.body,
        )}
      {openCreatePopup &&
        createPortal(
          <CreatePopup onClose={() => setOpenCreatePopup(false)} />,
          document.body,
        )}

      {isMobile && (
        <Box
          style={{ 
            ...styles.menus,
            backgroundColor: openMobileMenu
              ? "rgba(0,0,0,0.3)"
              : "transparent",
            pointerEvents: openMobileMenu ? "auto" : "none",
          }}
          onClick={() => setOpenMobileMenu(false)}
        >
          <Box
            style={{
              ...styles.menu,
              width: screenMode === "small" ? "100%" : 360,
              transform: openMobileMenu ? "translateX(0)" : "translateX(100%)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Box style={styles.overlays}>
              <Box
                style={styles.overlay}
                onClick={() => setOpenMobileMenu(false)}
              >
                <IconX style={styles.icona} />
              </Box>
            </Box>
            <Sidebar />
          </Box>
        </Box>
      )}
    </>
  );
};

export default PrivateLayout;
