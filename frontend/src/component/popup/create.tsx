import { useEffect, useState, FC, CSSProperties, useRef, memo, Dispatch, SetStateAction } from "react";

import { Box, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

import { notifyErrorOnce, notifySuccess } from "@/api/notify";

import { useQuiz } from "@/hooks/use-quiz";

type QuizStatus = "DRAFT" | "PUBLISHED";

interface QuestionInput {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  correctOption: number | null;
}

type OptionKey = "option1" | "option2" | "option3" | "option4" | "option5";

const styles: Record<string, CSSProperties> = {
  container: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "flex-end",
    zIndex: 9999,
    padding: "10px 0px 10px 10px",
  },
  wrapper: {
    width: 680,
    height: "100%",
    overflowY: "auto",
    animation: "slideInRight 0.3s ease",
    borderRadius: 12,
    backgroundColor: "var(--light-400)",
    border: "2px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
    padding: 15
  },
  main: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 35
  },
  header: {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "clamp(13px, 1.1vw, 15px)",
    fontWeight: 450,
    color: "var(--dark-100)",
  },
  close: {
    width: 16,
    height: 16,
    color: "var(--dark-200)",
    cursor: "pointer",
  },
  content: {
    flex: 1,                 
    minHeight: 0,
    display: "flex",  
    flexDirection: "column",
    width: "100%",
    gap: 25,
    minWidth: 0,
  },
  inputs: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    width: "100%",
  },
  label: {
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    marginTop: 2,
    width: 120,
  },
  input: {
    flex: 1,
    padding: "0 12px",
    minHeight: 42,
    height: 42,          
    lineHeight: "40px",    
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    borderRadius: 10,
    backgroundColor: "var(--light-400)",
    border: "1.5px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    outline: "none",
  },
  box: {
    flex: 1,                 
    minHeight: 0,
    height: "100%",
    display: "flex",  
    flexDirection: "column",
    width: "100%",
    gap: 15,
    minWidth: 0,
  },
  check: {
    flex: 1,
    width: "100%",
    height: 38,
    display: "flex",  
    alignItems: "center",
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    outline: "none",
  },
  inactive: {
    width: 14,
    height: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    border: "1px solid var(--border-300)",
    backgroundColor: "var(--light-100)",
    backgroundImage: "none",
    cursor: "pointer",
  },
  active: {
    border: "1px solid var(--border-100)",
    backgroundColor: "transparent", 
    backgroundImage: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
    boxShadow: `inset 0 0 6px 1px rgba(191, 219, 254, 0.45)`,
  },
  icon: {
    width: 10,
    height: 10,
    color: "var(--light-100)",
  },
  buttons: {
    display: "flex",
    alignItems: "center", 
    justifyContent: "flex-end", 
    gap: 8,
    marginLeft: "auto",
  },
  button1: {
    padding: "0 12px",
    height: 42,
    cursor: "pointer",
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    borderRadius: 10,
    border: "1.5px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  button2: {
    padding: "0 12px",
    height: 42,
    cursor: "pointer",
    fontSize: "clamp(11px, 0.9vw, 13px)",
    fontWeight: 450,
    color: "var(--dark-100)",
    borderRadius: 10,
    border: "1.5px solid var(--border-100)",
    boxShadow: "inset 0 0 0 1px var(--border-300)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
};

const QuestionBox = memo(({ qIdx, questions, setQuestions, inputsStyle }: { qIdx: number; questions: QuestionInput[]; setQuestions: Dispatch<SetStateAction<QuestionInput[]>>; inputsStyle: CSSProperties; }) => {
  const item = questions[qIdx];
  if (!item) return null;

  return (
    <Box style={inputsStyle}>
      <label style={styles.label}>{`Question ${qIdx + 1}`}</label>

      <Box style={styles.box}>
        <Box style={inputsStyle} >
          <input
            type="text"
            style={styles.input}
            value={item.question}
            onChange={(e) => { const value = e.target.value;  setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, question: value } : q ) ); }}
            placeholder={`Enter question ${qIdx + 1}`}
          />
        </Box>

        {[1, 2, 3, 4, 5].map((aNum) => {
          const key = `option${aNum}` as OptionKey;
          return (
            <Box key={aNum} style={{ ...styles.input, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <input
                style={styles.check}
                value={item[key] || ""}
                onChange={(e) => { const value = e.target.value; setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, [key]: value } : q ) );  }}
                placeholder={`Option ${aNum}`}
              />

              <Box
                style={item.correctOption === aNum ? { ...styles.inactive, ...styles.active } : styles.inactive}
                onClick={() => { setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, correctOption: q.correctOption === aNum ? null : aNum } : q ) ); }}
              >
                {item.correctOption === aNum && (
                  <IconCheck stroke={2.5} style={styles.icon} />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

QuestionBox.displayName = "QuestionBox";

const Create: FC<{ onClose: () => void }> = ({ onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const responsiveInputsStyle: CSSProperties = {
    ...styles.inputs,
    flexDirection: isSmallScreen ? "column" : "row",
  };

  const { createQuiz, loading} = useQuiz();

  interface FormData {
    quizName: string;
    description: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
    endTime: string;
  }

  const [formData, setFormData] = useState<FormData>({
    quizName: "",
    description: "",
    companyName: "",
    contactName: "",
    contactEmail: "",
    endTime: "",
  });

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  interface QuestionInput {
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5: string;
    correctOption: number | null;
  }

  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      option5: "",
      correctOption: null,
    },
    {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      option5: "",
      correctOption: null,
    },
  ]);

  const mapQuestionsToPayload = (questions: QuestionInput[]) => {
    return questions.map((q) => {
      const options = [
        q.option1,
        q.option2,
        q.option3,
        q.option4,
        q.option5,
      ]
        .map(o => (o ?? "").trim())
        .filter(o => o.length > 0);

      if (q.correctOption == null) {
        throw new Error(`Please select a correct option for question`);
      }

      const correctOptionIndex = q.correctOption - 1;

      return {
        question: q.question.trim(),
        options,
        correctOption: correctOptionIndex,
      };
    });
  };

  const handleCreateQuiz = async (status: QuizStatus) => {
    try {
      const payloadQuestions = mapQuestionsToPayload(questions);

      for (let i = 0; i < payloadQuestions.length; i++) {
        if (payloadQuestions[i].options.length < 2) {
          throw new Error(`Question ${i + 1} must have at least 2 options`);
        }
      }

      if (!formData.quizName.trim()) {
        throw new Error("Quiz name is required");
      }

      if (!formData.contactEmail.trim()) {
        throw new Error("Contact email is required");
      }

      const payload = {
        quizName: formData.quizName.trim(),
        description: formData.description.trim(),
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim(),
        contactEmail: formData.contactEmail.trim(),
        endTime: formData.endTime,
        questions: payloadQuestions,
        status,
      };

      await createQuiz(payload);

      if (status === "DRAFT") {
        notifySuccess("Draft created successfully");
      } else {
        notifySuccess("Quiz published successfully");
      }

      onClose();
    } catch (err) {
      notifyErrorOnce(err);
    }
  };

  const [hoveredButton, setHoveredButton] = useState<"add" | "save" | null>(null);

  return (
    <Box style={styles.container}>
      <Box ref={scrollRef} onClick={(e) => e.stopPropagation()} style={styles.wrapper} className="scroll">
        <Box style={styles.main}>
          <Box style={styles.header}>
            <Text style={styles.title}>Create Quiz</Text>
            <IconX style={styles.close} onClick={onClose} />
          </Box>

          <Box style={styles.content}>
            <Box style={responsiveInputsStyle}>
              <label style={styles.label}>Quiz Name</label>
              <input
                type="text"
                style={styles.input}
                value={formData.quizName}
                onChange={(e) => handleFormChange("quizName", e.target.value) }
                placeholder="Enter quiz name"
              />
            </Box>

            <Box style={responsiveInputsStyle}>
              <label style={styles.label}>Description</label>
              <input
                type="text"
                style={styles.input}
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value) }
                placeholder="Enter description"
              />
            </Box>

             <Box style={responsiveInputsStyle}>
              <label style={styles.label}>Contact Name</label>
              <input
                type="text"
                style={styles.input}
                value={formData.contactName}
                onChange={(e) => handleFormChange("contactName", e.target.value) }
                placeholder="Enter Contact Name"
              />
            </Box>

            <Box style={responsiveInputsStyle}>
              <label style={styles.label}>Company Name</label>
              <input
                type="text"
                style={styles.input}
                value={formData.companyName}
                onChange={(e) => handleFormChange("companyName", e.target.value) }
                placeholder="Enter Company Name"
              />
            </Box>

            <Box style={responsiveInputsStyle}>
              <label style={styles.label}>Contact Email</label>
              <input
                type="email"
                style={styles.input}
                value={formData.contactEmail}
                onChange={(e) => handleFormChange("contactEmail", e.target.value) }
                placeholder="Enter Contact Email"
              />
            </Box>

            <Box style={responsiveInputsStyle}>
              <label style={styles.label}>End Time</label>
              <input
                type="datetime-local"
                style={styles.input}
                value={formData.endTime}
                onChange={(e) => handleFormChange("endTime", e.target.value) }
                placeholder="Enter Contact Email"
              />
            </Box>
          </Box>

          <Box style={{ ...styles.content, marginTop: -15 }}>
            {questions.map((_, qIdx) => ( <QuestionBox key={qIdx} qIdx={qIdx} questions={questions} setQuestions={setQuestions} inputsStyle={responsiveInputsStyle} /> ))}
          </Box>

          <Box style={styles.buttons}>
            <Box
              style={{ ...styles.button1, backgroundColor: hoveredButton === "add" ? "var(--light-400)" : "var(--light-200)" }}
              onClick={() =>
                setQuestions((prev) => [
                  ...prev,
                  {
                    question: "",
                    option1: "",
                    option2: "",
                    option3: "",
                    option4: "",
                    option5: "",
                    correctOption: null,
                  },
                ])
              }
              onMouseEnter={() => setHoveredButton("add")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Add Question Block
            </Box>

            <Box 
              style={{ ...styles.button2, backgroundColor: hoveredButton === "save" ? "var(--light-400)" : "var(--light-200)", opacity: loading ? 0.6 : 1, pointerEvents: loading ? "none" : "auto" }} onClick={() => handleCreateQuiz("DRAFT")}
              onMouseEnter={() => setHoveredButton("save")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {loading ? "Saving..." : "Save Draft"}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Create;