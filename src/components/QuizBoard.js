import React, { useState } from "react";
import "./QuizBoard.css";
import MathComponent from "./MathComponent.js";

function QuizBoard({ text }) {
  let questions = [];

  if (text) {
    questions = text.split("\n").filter((q) => q.trim());
  }

  const renderWithNewLines = (text) => {
    return text.replace(/\\n/g, "\n");
  };

  const processQuestionText = (qText) => {
    const isAlignedTopLeft = qText.startsWith("*");
    const processedQuestion = isAlignedTopLeft ? qText.slice(1) : qText;
    return { isAlignedTopLeft, content: renderWithNewLines(processedQuestion) };
  };

  const extractQuestionAndAnswer = (qText) => {
    const regex = /^(.*?)(?:@([^)]+))?$/;
    const match = regex.exec(qText);
    return {
      question: match[1].trim(),
      answer: match[2] ? match[2].trim() : null,
    };
  };

  const [state, setState] = useState(
    questions.map((q) => {
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
      <h1 className="interactiveTitle">Quiz Board</h1>
      <div className="quizBoardContainer">
        <div className="board">
          {state.map((item, index) => (
            <div
              key={index}
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
                  <div
                    style={{
                      whiteSpace: item.question.includes("\\n")
                        ? "pre-wrap"
                        : "normal",
                    }}
                  >
                    <MathComponent text={renderWithNewLines(item.content)} />
                  </div>
                ) : item.shown === 2 ? (
                  <div
                    style={{
                      whiteSpace: item.answer.includes("\\n")
                        ? "pre-wrap"
                        : "normal",
                    }}
                  >
                    <MathComponent text={renderWithNewLines(item.answer)} />
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default QuizBoard;
