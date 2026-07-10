import { Outlet, useLocation } from "react-router-dom";
import { useEffect, type CSSProperties } from "react";
import { Box } from "@mantine/core";
import { ROUTES } from "@/utils/constants";

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "var(--light-200)",
  },
};

const PublicLayout = () => {
  const location = useLocation();

  const DARK_ROUTES = [
    ROUTES.REGISTER,
    ROUTES.LOGIN,
    ROUTES.GUEST,
    ROUTES.NOT_FOUND,
    ROUTES.HOME,
  ];

  const isPlayRoute = location.pathname.startsWith(ROUTES.PLAY);

  useEffect(() => {
    const isDarkRoute =
      DARK_ROUTES.includes(location.pathname) || isPlayRoute;

    document.documentElement.setAttribute(
      "data-theme",
      isDarkRoute ? "dark" : "light"
    );
  }, [location.pathname, isPlayRoute]);

  return (
    <Box style={styles.container}>
      <Outlet />
    </Box>
  );
};

export default PublicLayout;