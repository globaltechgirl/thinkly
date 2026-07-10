import { FC, CSSProperties, useMemo, useEffect, useRef } from "react";

import { Box, Text } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { IconDotsVertical } from "@tabler/icons-react";

import { useAnalytics, MonthlySeries } from "@/hooks/use-analytics";

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 15,
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
  charts: {
    display: "flex",
    alignItems: "flex-start",
    position: "relative",
    height: 320,
    zIndex: 2,
    overflowX: "auto",
    overflowY: "hidden",
  },
  chart: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    width: "100%",
    minWidth: "640px",
  },
  inner: {
    flex: 1,
    height: 340,
    position: "relative",
    paddingTop: 6,
    zIndex: 2,
    minWidth: "640px",
  },
  lines: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "93.5%",
    pointerEvents: "none",
    zIndex: 0,
  },
  line: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderLeft: "1px solid var(--border-100)",
    boxShadow: "1px 0 0 0 var(--border-300)",
  },
  tooltips: {
    position: "relative",
    padding: "6px 8px 6px 17px",
    width: 145,
    whiteSpace: "nowrap",
    borderRadius: 10,
    backgroundColor: "var(--light-200)",
    border: "1.5px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-200)",
  },
  bar: {
    position: "absolute",
    left: 6,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: "var(--blue-300)",
  },
  tooltip: {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
  },
  label: {
    fontSize: "clamp(9px, 0.7vw, 11px)",
    fontWeight: 450,
    color: "var(--dark-100)",
  },
  value: {
    fontSize: "clamp(11px, 1vw, 12px)",
    fontWeight: 450,
    color: "var(--dark-200)",
  },
};

type TrendData = {
  label: string;
  total: number;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CustomTooltip: FC<{ payload?: any; label?: string }> = ({
  payload,
  label,
}) => {
  if (!payload?.length) return null;

  return (
    <Box style={styles.tooltips}>
      <Box style={styles.bar} />

      <Box style={styles.tooltip}>
        <Text style={styles.label}>{label}</Text>
        {payload.map((p: any, index: number) => (
          <Text key={index} style={styles.value}>
            Total Quizzes : {p.value}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

const CustomBar = (props: any) => {
  const { x, width, value, maxValue = 5, fill } = props;
  
  const chartHeight = 280; 
  const paddingBottom = -22;
  const paddingTop = 30; 
  const availableHeight = chartHeight - paddingTop - paddingBottom;
  
  const safeValue = value ?? 0;
  
  const barHeight = maxValue > 0 
    ? Math.max((safeValue / maxValue) * availableHeight, 6) 
    : 6;

  const barY = chartHeight - paddingBottom - barHeight;
  
  const bgX = x - 3;
  const bgWidth = width + 6;
  const bgY = barY - 12; 
  const bgHeight = barHeight + 15;
  
  const textGap = 8;
  const textColor = safeValue > 0 ? "var(--dark-100)" : "var(--dark-200)";

  return (
    <>
      <g>
        <rect
          x={bgX}
          y={bgY}
          width={bgWidth}
          height={bgHeight}
          fill="var(--light-200)"
          rx={8}
          stroke="var(--border-100)"
          strokeWidth={1.5}
        />
        <rect
          x={bgX + 1}
          y={bgY + 1}
          width={bgWidth - 2}
          height={bgHeight - 2}
          fill="none"
          rx={7}
          stroke="var(--border-300)"
          strokeWidth={1}
        />
      </g>
      <text
        x={x + width / 2}
        y={bgY - textGap}
        textAnchor="middle"
        fontSize={13}
        fill={textColor}
        fontWeight={safeValue > 0 ? 500 : 450}
      >
        {safeValue}
      </text>
      <rect
        x={x}
        y={barY}
        width={width}
        height={barHeight}
        fill={fill}
        rx={6}
      />
    </>
  );
};

const Bars: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const { user, fetchUserAnalytics } = useAnalytics();
  useEffect(() => {
    fetchUserAnalytics();
  }, [fetchUserAnalytics]);

  const trend: TrendData[] = useMemo(() => {
    const apiData: MonthlySeries[] = user?.monthlyActivities ?? [];

    const map = new Map<number, MonthlySeries>();

    apiData.forEach((item) => {
      const month = item.month ?? item._id?.month;
      if (month) map.set(month, item);
    });

    return MONTHS.map((m, index) => {
      const monthNumber = index + 1;
      const item = map.get(monthNumber);

      const year = item?.year ?? new Date().getFullYear();

      return {
        label: item?.monthName ?? `${m} ${year}`,
        total: item?.total ?? 0,
      };
    });
  }, [user]);

  const currentMonth = useMemo(
    () => new Date().toLocaleString("en-US", { month: "short" }).toUpperCase(),
    [],
  );

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || trend.length === 0) return;

    const activeIndex = trend.findIndex((item) =>
      item.label.toUpperCase().startsWith(currentMonth),
    );
    if (activeIndex < 0) return;

    const scrollWidth = container.scrollWidth;
    const containerWidth = container.clientWidth;
    if (scrollWidth <= containerWidth) return;

    const targetScrollLeft = Math.max(
      0,
      Math.min(
        scrollWidth - containerWidth,
        ((activeIndex + 0.5) / trend.length) * scrollWidth - containerWidth / 2,
      ),
    );

    container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  }, [trend, currentMonth]);

  return (
    <Box style={styles.container}>
      <Box style={styles.top}>
        <Text style={styles.title}>Quiz Engagements</Text>
        <Box style={styles.icons}>
          <IconDotsVertical style={styles.icon} />
        </Box>
      </Box>

      <Box style={styles.charts} className="scrollbar-hidden-sm-md" ref={chartContainerRef}>
        <Box style={styles.chart}>
          <Box style={styles.inner}>
            {trend.length > 0 && (
              <Box style={styles.lines}>
                {trend.map((_, i) => {
                  const step = 100 / trend.length;
                  if (i === 0) return null;

                  return (
                    <Box
                      key={i}
                      style={{ ...styles.line, left: `${i * step}%` }}
                    />
                  );
                })}
              </Box>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trend}
                barSize={28}
                barGap={8}
                barCategoryGap="0%"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <pattern
                    id="quizStripes"
                    patternUnits="userSpaceOnUse"
                    width={6}
                    height={6}
                    patternTransform="rotate(-45)"
                  >
                    <rect width="100%" height="100%" fill="var(--blue-300)" />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="12"
                      stroke="var(--blue-200)"
                      strokeWidth={5}
                    />
                  </pattern>
                </defs>

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                  interval={0}
                />

                <Tooltip cursor={false} content={<CustomTooltip />} />

                <Bar
                  dataKey="total"
                  shape={<CustomBar />}
                  name="Total Activities"
                >
                  {trend.map((entry, index) => (
                    <Cell
                      key={`quiz-${index}`}
                      fill={
                        entry.label === currentMonth
                          ? "url(#activeQuizStripes)"
                          : "url(#quizStripes)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Bars;