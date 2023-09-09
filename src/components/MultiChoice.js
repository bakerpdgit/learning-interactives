import React, { useState, useEffect, useCallback } from "react";
import "./MultiChoice.css";
import MathComponent from "./MathComponent.js";

function MultiChoice({ text }) {
  // Parsing the options
  const [optionsLine, ...rest] = text.split("\n\n");
  const optionsSet = optionsLine.startsWith("OPTIONS:") ? optionsLine : null;
  const questionTexts = optionsSet ? rest.join("\n\n") : text;
  const parsedOptions =
    optionsSet && optionsSet.startsWith("OPTIONS:")
      ? Object.fromEntries(
          optionsSet
            .slice(8)
            .split(",")
            .map((opt) => opt.split("="))
        )
      : {};
  const defaultOptions = { time: "unlimited", scroll: "yes", immediate: "no" };
  const finalOptions = { ...defaultOptions, ...parsedOptions };

  // Helper function to shuffle an array
  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }

  const renderWithNewLines = (text) => {
    return text.replace(/\\n/g, "\n");
  };

  // Parsing the questions and answers

  const [questions] = useState(() => {
    return questionTexts.split("\n\n").map((qText) => {
      const [question, ...options] = qText.split("\n");
      const answers = options.map((opt) => ({
        text: opt.replace("*", ""),
        correct: opt.startsWith("*"),
      }));
      return { question, answers: shuffle(answers) };
    });
  });

  // State variables
  const [timeLeft, setTimeLeft] = useState(
    finalOptions.time && !isNaN(finalOptions.time)
      ? parseInt(finalOptions.time)
      : null
  );
  const [userAnswers, setUserAnswers] = useState(
    Array(questions.length).fill(null)
  );
  const [score, setScore] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleSubmit = useCallback(() => {
    const correctCount = userAnswers.reduce((acc, answer, idx) => {
      if (
        questions[idx].answers[answer] &&
        questions[idx].answers[answer].correct
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);
    const totalCorrectQuestions = questions.filter((q) =>
      q.answers.some((a) => a.correct)
    ).length;
    setScore({ correct: correctCount, total: totalCorrectQuestions });
    setTimeLeft(null);
  }, [userAnswers, questions]);

  // Handle time countdown
  useEffect(() => {
    if (score !== null) return; // <-- Add this line to stop the timer after submission

    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, handleSubmit, score]); // <-- Add score to the dependency array

  // Function to handle answer selection
  const handleAnswerSelection = (questionIdx, answerIdx) => {
    if (score !== null) return; // If the quiz has been marked, return early
    if (finalOptions.immediate === "yes" && userAnswers[questionIdx] !== null) {
      // Prevent further changes if immediate mode is on and an answer was already selected
      return;
    }
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIdx] = answerIdx;
    setUserAnswers(updatedAnswers);
  };

  // Navigation functions for single-question view
  const goToFirstQuestion = () => setCurrentQuestionIndex(0);
  const goToPreviousQuestion = () =>
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  const goToNextQuestion = () =>
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  const goToLastQuestion = () => setCurrentQuestionIndex(questions.length - 1);

  // JSX rendering
  return (
    <>
      <h1 className="interactiveTitle">Multi-Choice Quiz</h1>
      <div className="submissionInfo">
        {score == null && (
          <button
            className="handleSubmit"
            onClick={handleSubmit}
            disabled={score !== null}
          >
            Submit Answers{timeLeft !== null ? ` (${timeLeft}s)` : ""}
          </button>
        )}
        {score !== null && (
          <div className="score">
            Score: {score.correct}/{score.total}
          </div>
        )}
      </div>
      <div className="multiChoiceContainer">
        <div className="gameArea">
          {finalOptions.scroll === "yes" ? (
            questions.map((q, qIdx) => (
              <div key={qIdx} className="questionBox">
                <div
                  className="questionText"
                  style={{
                    whiteSpace: q.question.includes("\\n")
                      ? "pre-wrap"
                      : "normal",
                  }}
                >
                  {qIdx + 1}.{" "}
                  <MathComponent text={renderWithNewLines(q.question)} />
                </div>
                {q.answers.map((a, aIdx) => (
                  <button
                    key={aIdx}
                    className={`answerOption ${
                      userAnswers[qIdx] === aIdx
                        ? score !== null
                          ? !a.correct &&
                            q.answers.some((answer) => answer.correct)
                            ? "incorrectAnswer"
                            : "selected"
                          : "selected"
                        : ""
                    } ${
                      (score !== null || finalOptions.immediate === "yes") &&
                      a.correct &&
                      userAnswers[qIdx] !== null
                        ? "correctAnswer"
                        : ""
                    }`}
                    onClick={() => handleAnswerSelection(qIdx, aIdx)}
                  >
                    <div
                      style={{
                        whiteSpace: questions[
                          currentQuestionIndex
                        ].question.includes("\\n")
                          ? "pre-wrap"
                          : "normal",
                      }}
                    >
                      <MathComponent text={renderWithNewLines(a.text)} />
                    </div>
                  </button>
                ))}
              </div>
            ))
          ) : (
            // Adjusted logic for single question view also
            <div className="questionBox">
              <div
                className="questionText"
                style={{
                  whiteSpace: questions[currentQuestionIndex].question.includes(
                    "\\n"
                  )
                    ? "pre-wrap"
                    : "normal",
                }}
              >
                {currentQuestionIndex + 1}.{" "}
                <MathComponent
                  text={renderWithNewLines(
                    questions[currentQuestionIndex].question
                  )}
                />
              </div>

              {questions[currentQuestionIndex].answers.map((a, aIdx) => (
                <button
                  key={aIdx}
                  className={`answerOption ${
                    userAnswers[currentQuestionIndex] === aIdx
                      ? score !== null
                        ? !a.correct &&
                          questions[currentQuestionIndex].answers.some(
                            (answer) => answer.correct
                          )
                          ? "incorrectAnswer"
                          : "selected"
                        : "selected"
                      : ""
                  } ${
                    (score !== null || finalOptions.immediate === "yes") &&
                    a.correct &&
                    userAnswers[currentQuestionIndex] !== null
                      ? "correctAnswer"
                      : ""
                  }`}
                  onClick={() =>
                    handleAnswerSelection(currentQuestionIndex, aIdx)
                  }
                >
                  <div
                    style={{
                      whiteSpace: questions[
                        currentQuestionIndex
                      ].question.includes("\\n")
                        ? "pre-wrap"
                        : "normal",
                    }}
                  >
                    <MathComponent text={renderWithNewLines(a.text)} />
                  </div>
                </button>
              ))}

              <div className="navigationButtons">
                <button
                  onClick={goToFirstQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  {"<< First"}
                </button>
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  {"< Previous"}
                </button>
                <button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  {"> Next"}
                </button>
                <button
                  onClick={goToLastQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  {">> Last"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MultiChoice;
