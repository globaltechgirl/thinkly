import { Stack } from "@mantine/core";

import QuizMain from "@/component/quiz/main";

function Quiz() {
  return (
    <Stack
      style={{
        width: "100%",
        height: "100%", 
        flex: 1,
      }}
    >
      <QuizMain />
    </Stack>
  );
}

export default Quiz;