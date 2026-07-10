import { FC, useEffect, useState } from "react";
import { Grid } from "@mantine/core";
import Grids from "@/component/admindashboard/grid";
import Bars from "@/component/admindashboard/bar";
import Notifications from "@/component/admindashboard/notification";
import Lists from "@/component/admindashboard/list";

const styles = {
  container: {
    width: "100%",
    height: "100%",
    gap: 15,
  },
} as const;

const Dashboard: FC = () => {
  const [colSpan, setColSpan] = useState<number>(6);

  useEffect(() => {
    const update = () => setColSpan(window.innerWidth <= 1024 ? 12 : 6);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <Grid style={styles.container}>
      <Grid.Col span={12}>
        <Grids />
      </Grid.Col>

      <Grid.Col span={colSpan}>
        <Bars />
      </Grid.Col>

      <Grid.Col span={colSpan}>
        <Notifications />
      </Grid.Col>

      <Grid.Col span={12}>
        <Lists />
      </Grid.Col>
    </Grid>
  );
};

export default Dashboard;
