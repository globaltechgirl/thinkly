import { FC, useEffect, useMemo } from "react";

import { Box, Text } from "@mantine/core";

import { useAnalytics } from "@/hooks/use-analytics";

import { IconDotsVertical } from "@tabler/icons-react";
import {
  IconStarOutlineDuo18,
  IconTicket4OutlineDuo18,
  IconUsersOutlineDuo18,
  IconTriangleWarningOutlineDuo18,
} from "nucleo-ui-essential-outline-duo-18";

const Notifications: FC = () => {
  const styles = {
    container: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: "15px 15px 0px",
      borderRadius: 12,
      backgroundColor: "var(--light-400)",
      border: "2px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    top: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      width: "100%",
    },
    title: {
      fontSize: "clamp(12px, 1vw, 14px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    icons: {
      width: "fit-content",
      padding: 5,
      borderRadius: 8,
      border: "2px solid var(--border-100)",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
      cursor: "pointer",
    },
    icon: {
      width: 13,
      height: 13,
      color: "var(--dark-300)",
    },
    main: {
      width: "100%",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      height: 320,
      overflowX: "auto",
      minWidth: 0,
    },
    flex: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 6px",
      borderBottom: "1px solid var(--border-100)",
      boxShadow: "0 1px 0 0 var(--border-300)",
      minWidth: 420,
    },
    circle: {
      borderRadius: "50%",
      padding: 5,
      marginRight: -2,
    },
    left: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      width: "100%",
      minWidth: 0,
    },
    side: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: 1,
      minWidth: 0,
    },
    text: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    span: {
      fontSize: "clamp(10px, 0.8vw, 12px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    loading: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: 40,
      textAlign: "center",
    },
  } as const;

  const { admin, fetchAdminAnalytics, loading } = useAnalytics();

  useEffect(() => {
    fetchAdminAnalytics();
  }, [fetchAdminAnalytics]);

  const pastelColors = [
    { bg: "var(--red-100)", color: "var(--red-300)", border: "var(--red-200)" },
    {
      bg: "var(--green-100)",
      color: "var(--green-300)",
      border: "var(--green-200)",
    },
    {
      bg: "var(--blue-100)",
      color: "var(--blue-300)",
      border: "var(--blue-200)",
    },
    {
      bg: "var(--yellow-100)",
      color: "var(--yellow-300)",
      border: "var(--yellow-200)",
    },
    {
      bg: "var(--purple-100)",
      color: "var(--purple-300)",
      border: "var(--purple-200)",
    },
  ];

  const timelineData = useMemo(() => {
    return (admin?.notifications || [])
      .slice()
      .sort(
        (a, b) =>
          new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime(),
      )
      .map((item) => {
        const message = item?.text || "Activity";
        const lower = (item?.title || message).toLowerCase();
        let tag = "user";
        let title = item?.title || "Activity";

        if (lower.includes("published")) {
          tag = "published";
          title = "Published";
        } else if (lower.includes("submitted")) {
          tag = "submitted";
          title = "Submitted";
        } else if (lower.includes("deleted")) {
          tag = "deleted";
          title = "Deleted";
        } else if (lower.includes("updated")) {
          tag = "updated";
          title = "Updated";
        } else if (lower.includes("started")) {
          tag = "started";
          title = "Started";
        }

        return {
          timestamp: new Date(item?.time || Date.now()).getTime(),
          title,
          subtitle: message,
          tags: [tag],
        };
      });
  }, [admin]);

  const notifications = timelineData.slice(0, 6);

  const getIcon = (tag: string, color?: any) => {
    const iconStyle = {
      width: 11,
      height: 11,
      color: color?.color || "var(--dark-300)",
    };

    switch (tag) {
      case "started":
        return <IconStarOutlineDuo18 style={iconStyle} />;
      case "submitted":
        return <IconUsersOutlineDuo18 style={iconStyle} />;
      case "deleted":
        return <IconTriangleWarningOutlineDuo18 style={iconStyle} />;
      case "updated":
        return <IconTicket4OutlineDuo18 style={iconStyle} />;
      case "published":
        return <IconTicket4OutlineDuo18 style={iconStyle} />;
      default:
        return null;
    }
  };

  const formatTime = (value: string | number) => {
    const now = Date.now();
    const past = new Date(value).getTime();
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMins < 1) {
      return "0 min";
    }
    if (diffInMins < 60) {
      return `${diffInMins} min${diffInMins > 1 ? "s" : ""}`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
  };

  return (
    <Box style={styles.container}>
      <Box style={styles.top}>
        <Text style={styles.title}>Quiz Notifications</Text>
        <Box style={styles.icons}>
          <IconDotsVertical style={styles.icon} />
        </Box>
      </Box>

      <Box style={styles.main} className="scrollbar-hidden-sm-md">
        {loading && <Text style={styles.loading}>Loading activities...</Text>}

        {!loading && notifications.length === 0 && (
          <Text style={styles.loading}>No activities found.</Text>
        )}

        {!loading &&
          notifications.map((item, idx) => {
            const color = pastelColors[idx % pastelColors.length];

            return (
              <Box
                key={idx}
                style={{
                  ...styles.flex,
                  ...(idx === notifications.length - 1
                    ? { borderBottom: "none", boxShadow: "none" }
                    : {}),
                }}
              >
                <IconDotsVertical style={{ ...styles.icon, transform: "rotate(90deg)" }} />
                <Box style={{ ...styles.circle, backgroundColor: color.bg }}>
                  {getIcon(item.tags[0], color)}
                </Box>
                <Box style={styles.left}>
                  <Box style={styles.side}>
                    <Text style={{ ...styles.text, color: "var(--dark-100)" }}>
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        ...styles.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.subtitle}
                    </Text>
                 </Box>

                  <Text style={styles.span}>
                    {formatTime(item.timestamp)} ago
                  </Text>
                </Box>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

export default Notifications;