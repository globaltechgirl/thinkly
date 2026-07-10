import { Stack } from "@mantine/core";

import HomeMain from "@/component/home/main";

function Home() {
  return (
    <Stack
      style={{
        width: "100%",
        flex: 1,
      }}
    >
      <HomeMain />
    </Stack>
  );
}

export default Home;