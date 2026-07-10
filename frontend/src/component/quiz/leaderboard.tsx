import { FC, useState, useEffect, useMemo } from "react";

import { Box, Text, Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useParams } from "react-router-dom";

import { useQuiz } from "@/hooks/use-quiz";

import Icon from "@/assets/icon.jpg";
import Badge1 from "@/assets/badge1.svg";
import Badge2 from "@/assets/badge2.svg";
import Badge3 from "@/assets/badge3.svg";
import LeftsIcon from "@/assets/icons/lefts";
import RightsIcon from "@/assets/icons/rights";

const Leaderboard: FC = () => {
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  const styles = {
    container: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 30,
      maxWidth: 900,
      marginTop: 35,
      maxHeight: "100%",
      overflowY: "auto",
      boxSizing: "border-box"
    },
    wrapper: {
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative"
    },
    main: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      gap: isSmallScreen ? 10 : 80,
      marginBottom: 10,
    },
    avatars1: {
      width: isSmallScreen ? 120 : 180,
      height: isSmallScreen ? 120 : 180,
      borderRadius: "50%",
      padding: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--light-400)",
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    avatar1: {
      width: isSmallScreen ? 55 : 110,
      height: isSmallScreen ? 55 : 110,
      objectFit: "cover",
      objectPosition: "top",
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid var(--border-100)",
    },
    avatars2: {
      width: isSmallScreen ? 100 : 160,
      height: isSmallScreen ? 100 : 160,
      borderRadius: "50%",
      padding: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--light-400)",
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
    },
    avatar2: {
      width: isSmallScreen ? 45 : 100,
      height: isSmallScreen ? 45 : 100,
      objectFit: "cover",
      objectPosition: "top",
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid var(--border-100)",
    },
    badges: {
      position: "absolute",
      bottom: -4,
      left: "50%",
      transform: "translateX(-50%)",
      width: isSmallScreen ? 30 : 36,
      height: isSmallScreen ? 30 : 36,
    },
    boards: {
      flex: 1,
      width: "100%",
      display: "grid",
      gridTemplateColumns: isSmallScreen ? "repeat(1, 1fr)" : "repeat(2, 1fr)",
      columnGap: 30,
      rowGap: 20,
      marginTop: 30,
    },
    board: {
      width: "100%",
      backgroundColor: "var(--light-400)",
      border: "1.5px solid var(--border-100)",
      boxShadow: "inset 0 0 0 1px var(--border-300)",
      borderRadius: 10,
      padding: "12px 14px 18px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10
    },
    avatars: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: {
      width: 36,
      height: 36,
      objectFit: "cover",
      objectPosition: "top",
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid var(--border-100)",
    },
    badge: {
      position: "absolute",
      bottom: -10,
      left: "50%",
      transform: "translateX(-50%)",
      width: 20,
      height: 20,
    },
    span: {
      position: "absolute",
      bottom: -8,
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "clamp(9px, 0.7vw, 11px)",
      fontWeight: 450,
      color: "var(--dark-100)",
      backgroundColor: "var(--light-200)",
      border: "1px solid var(--border-100)",
      width: 18,
      height: 18,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    flex: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-100)",
    },
    value: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
    },
    pagination: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      width: "100%",
      gap: 6,
    },
    icons: {
      border: "2px solid var(--border-100)",
      backgroundColor: "var(--light-400)",
      boxShadow: "inset 0 0 1px 1px var(--shadow-100)",
      padding: "0 6.5px",
      height: 26,
      color: "var(--dark-200)",
      borderRadius: 8,
    },
    icon: {
      width: 12,
      height: 12,
    },
    loading: {
      fontSize: "clamp(11px, 0.9vw, 13px)",
      fontWeight: 450,
      color: "var(--dark-200)",
      padding: 40,
      textAlign: "center",
    },
  } as const;
  
  const { results, fetchResults, loading } = useQuiz();
  const { id: quizId } = useParams<{ id: string }>();

  const [page, setPage] = useState(1);

  const badges: Record<number, string> = {
    1: Badge1,
    2: Badge2,
    3: Badge3,
  };

  const firstPageCount = 6;
  const otherPageCount = 10;

  const sortedUsers = results;
  const top3 = sortedUsers.slice(0, 3);

  const totalPages = useMemo(() => {
    return (
      1 +
      Math.ceil(
        Math.max(sortedUsers.length - firstPageCount, 0) / otherPageCount
      )
    );
  }, [sortedUsers.length]);

  useEffect(() => {
    if (!quizId) return;
    fetchResults(quizId);
  }, [quizId]);
  
  const paginatedUsers = useMemo(() => {
    if (page === 1) {
      return sortedUsers.slice(0, firstPageCount);
    }

    const startIndex = firstPageCount + (page - 2) * otherPageCount;
    const endIndex = startIndex + otherPageCount;

    return sortedUsers.slice(startIndex, endIndex);
  }, [page, sortedUsers]);

  const PodiumCard = ({
    user,
    rank,
  }: {
    user?: any;
    rank: number;
  }) => {
    if (!user) return null;

    return (
      <Box
        style={{
          ...styles.wrapper,
          transform: rank === 2 || rank === 3 ? "translateY(20px)" : "translateY(0)",
        }}
      >
        <Box style={styles.main}>
          <Box style={rank === 1 ? styles.avatars1 : styles.avatars2}>
            <img
              src={user?.image || Icon}
              alt={user?.name || "Icon"}
              style={rank === 1 ? styles.avatar1 : styles.avatar2}
            />
          </Box>

          {badges[rank] ? (
            <img src={badges[rank]} style={styles.badges} />
          ) : (
            <Text style={styles.span}>{rank}</Text>
          )}
        </Box>
      </Box>
    );
  };
  
  const PaginationControls = ({
    page,
    totalPages,
    setPage,
  }: {
    page: number;
    totalPages: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
  }) => (
    <Box style={styles.pagination}>
      <Button
        size="24"
        variant="outline"
        disabled={page === 1}
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        styles={{ root: styles.icons }}
      >
        <LeftsIcon style={styles.icon} />
      </Button>

      <Button
        size="24"
        variant="outline"
        disabled={page === totalPages}
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        styles={{ root: styles.icons }}
      >
        <RightsIcon style={styles.icon} />
      </Button>
    </Box>
  );

  if (loading) {
    return ( <Text style={styles.loading}>Loading results...</Text> );
  }

  if (!loading && results.length === 0) {
    return ( <Text style={styles.loading}>No results found</Text> );
  }

  return (
    <Box style={styles.container}>
      {page === 1 && (
        <Box style={styles.main}>
          <PodiumCard user={top3[1]} rank={2} />
          <PodiumCard user={top3[0]} rank={1} />
          <PodiumCard user={top3[2]} rank={3} />
        </Box>
      )}

      <Box style={styles.boards}>
        {paginatedUsers.map((user) => {
          const rank = user.position;
          
          return (
            <Box key={user.id} style={styles.board}>
              <Box style={styles.avatars}>
                <img src={user.image || Icon} alt={user.name} style={styles.avatar} />

                {badges[rank] ? (
                  <img src={badges[rank]} alt={`badge-${rank}`} style={styles.badge} />
                ) : (
                  <Text style={styles.span}>{rank}</Text>
                )}
              </Box>

              <Box style={styles.flex}>
                <Text style={styles.label}>{user.name}</Text>
                <Text style={styles.value}>{user.score} points</Text>
              </Box>
            </Box>
          ); 
        })}
      </Box>

      <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
    </Box>
  );
};

export default Leaderboard;