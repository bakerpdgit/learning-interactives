import React, { useState, useEffect } from "react";
import "./QuizBoard.css";
import MathComponent from "./MathComponent.js";

function QuizBoard({ text }) {
  const [state, setState] = useState([]);
  const [columns, setColumns] = useState(4);

  const processQuestionText = (qText) => {
    const isAlignedTopLeft = qText.startsWith("*");
    const processedQuestion = isAlignedTopLeft ? qText.slice(1) : qText;
    return { isAlignedTopLeft, content: processedQuestion };
  };

  const extractQuestionAndAnswer = (qText) => {
    const regex = /^(.*?)(?:@([\s\S]*))?$/;
    const match = regex.exec(qText);
    return {
      question: match[1].trim(),
      answer: match[2] ? match[2].trim() : null,
    };
  };

  useEffect(() => {
    let updatedQuestions = [];
    let columnsValue = 4; // default

    if (text) {
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines[0].startsWith("OPTIONS:")) {
        const optionsLine = lines[0].slice(8).trim(); // Remove 'OPTIONS:' prefix
        const optionsArray = optionsLine.split(",").map((opt) => opt.trim());

        optionsArray.forEach((opt) => {
          const [key, value] = opt.split("=").map((s) => s.trim());
          if (key.toLowerCase() === "columns") {
            columnsValue = parseInt(value, 10);
          }
        });

        // Remove the OPTIONS line from the questions
        updatedQuestions = lines.slice(1);
      } else {
        updatedQuestions = lines;
      }
    }

    setColumns(Number.isFinite(columnsValue) && columnsValue > 0 ? columnsValue : 4);

    setState(
      updatedQuestions.map((q) => {
        const { question, answer } = extractQuestionAndAnswer(q);
        const processedText = processQuestionText(question);
        return {
          question,
          answer,
          isAlignedTopLeft: processedText.isAlignedTopLeft,
          content: processedText.content,
          shown: 0,
        };
      })
    );
  }, [text]);

  const handleClick = (index) => {
    const newState = [...state];
    newState[index].shown = (newState[index].shown + 1) % 6;
    if (newState[index].shown === 2 && newState[index].answer === null) {
      newState[index].shown += 1;
    }
    setState(newState);
  };

  return (
    <>
      <div className="quizBoardContainer">
        <div
          className="board"
          style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(columns, state.length))}, minmax(0, 1fr))` }}
        >
          {state.map((item, index) => (
            <button type="button"
              key={index}
              aria-label={"Question " + (index + 1) + ", " + (["hidden", "question visible", "answer visible", "blue team", "red team", "closed"][item.shown] || "hidden")}
              className={
                "question " +
                (item.shown === 3
                  ? "blue"
                  : item.shown === 4
                  ? "red"
                  : item.shown === 5
                  ? "grey"
                  : "")
              }
              onClick={() => handleClick(index)}
            >
              <div
                className={`qtext ${
                  item.isAlignedTopLeft && item.shown > 0 ? "top-left" : ""
                }`}
              >
                {item.shown === 0 ? (
                  "Q" + (index + 1)
                ) : item.shown === 1 ? (
                  <MathComponent text={item.content} renderNewLines={true} />
                ) : item.shown === 2 ? (
                  <MathComponent text={item.answer} renderNewLines={true} />
                ) : (
                  ""
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default QuizBoard;
