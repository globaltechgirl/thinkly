import { Stack } from "@mantine/core";
import Main from "@/component/participants/main";

function Participants() {
  return (
    <Stack
      style={{
        width: "100%",
        height: "100%", 
        gap: 15
      }}
    >
      <Main />
    </Stack>
  );
}

export default Participants;