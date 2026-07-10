import { Stack } from "@mantine/core";

import PlayMain from "@/component/play/main";

function Play() {
  return (
    <Stack
      style={{
        width: "100%",
        height: "100%", 
        flex: 1,
      }}
    >
      <PlayMain />
    </Stack>
  );
}

export default Play;