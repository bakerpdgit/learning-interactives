import React, { useState, useEffect, useCallback } from "react";
import "./MultiChoice.css";
import Celebration from "./Celebration";
import { multiSelectQuestions } from "../activityMarking";
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

  // Parsing the questions and answers

  const [questions] = useState(() => {
    const multiSelect = multiSelectQuestions(parsedOptions.selectall);
    return questionTexts.split("\n\n").map((qText, index) => {
      const [question, ...options] = qText.split("\n");
      const answers = options.map((opt) => ({
        text: opt.replace("*", ""),
        correct: opt.startsWith("*"),
      }));
      return { question, answers: shuffle(answers), selectAll: multiSelect.has(index + 1) };
    });
  });

  // State variables
  const [timeLeft, setTimeLeft] = useState(
    finalOptions.time && !isNaN(finalOptions.time)
      ? parseInt(finalOptions.time)
      : null
  );
  const [userAnswers, setUserAnswers] = useState(() => questions.map(() => []));
  const [checked, setChecked] = useState({});
  const [score, setScore] = useState(null);
  const [paused, setPaused] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const immediate = finalOptions.immediate === "yes";
  const showAll = finalOptions.scroll === "yes";

  function isCorrect(question, selected) {
    if (!selected.length) return false;
    return question.selectAll
      ? question.answers.every((answer, index) => answer.correct === selected.includes(index))
      : question.answers[selected[0]]?.correct;
  }

  const handleSubmit = useCallback(() => {
    const correct = questions.filter((question, index) => isCorrect(question, userAnswers[index])).length;
    const total = questions.filter((question) => question.answers.some((answer) => answer.correct)).length;
    setScore({ correct, total });
    setTimeLeft(null);
  }, [userAnswers, questions]);

  // Handle time countdown
  useEffect(() => {
    if (score !== null || paused) return;

    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, handleSubmit, score, paused]);

  function handleAnswerSelection(questionIndex, answerIndex) {
    if (score !== null || checked[questionIndex]) return;
    const { selectAll } = questions[questionIndex];
    setUserAnswers((previous) => previous.map((selected, index) => {
      if (index !== questionIndex) return selected;
      if (!selectAll) return [answerIndex];
      return selected.includes(answerIndex) ? selected.filter((answer) => answer !== answerIndex) : [...selected, answerIndex];
    }));
    if (immediate && !selectAll) setChecked((previous) => ({...previous, [questionIndex]: true}));
  }

  function renderQuestion(index) {
    const question = questions[index];
    const selected = userAnswers[index];
    const marked = score !== null || Boolean(checked[index]);
    const hasAnswer = question.answers.some((answer) => answer.correct);
    return <section key={index} className="questionBox" aria-label={"Question " + (index + 1)}>
      <div className="questionText">
        {index + 1}. <MathComponent text={question.question} renderNewLines />
      </div>
      {question.selectAll && <p className="choiceInstruction">Select all correct answers.</p>}
      {question.answers.map((answer, answerIndex) => {
        const chosen = selected.includes(answerIndex);
        const style = marked && hasAnswer && selected.length && answer.correct ? "correctAnswer" :
          chosen && marked && hasAnswer ? "incorrectAnswer" : chosen ? "selected" : "";
        return <button key={answerIndex} className={"answerOption " + style} aria-pressed={chosen}
          aria-disabled={marked} onClick={() => handleAnswerSelection(index, answerIndex)}>
          <MathComponent text={answer.text} renderNewLines />
        </button>;
      })}
      {question.selectAll && immediate && !marked && <button type="button" className="checkChoices"
        disabled={!selected.length} onClick={() => setChecked((previous) => ({...previous, [index]: true}))}>
        Check answers
      </button>}
      {marked && hasAnswer && selected.length > 0 && <p className="choiceInstruction" role="status">
        {isCorrect(question, selected) ? "Correct." : "Incorrect."}
      </p>}
    </section>;
  }

  return (
    <>
      <div className="submissionInfo">
        {score == null && (
          <button onClick={handleSubmit} disabled={score !== null}>
            Submit Answers{timeLeft !== null ? ` (${timeLeft}s)` : ""}
          </button>
        )}
        {score == null && timeLeft !== null && <button type="button" onClick={() => setPaused(!paused)}>
          {paused ? "Resume timer" : "Pause timer"}
        </button>}
        {score !== null && (
          <div className="score">
            Score: {score.correct}/{score.total}
          </div>
        )}
      </div>
      {score && <Celebration label={score.total > 0 && score.correct === score.total ? "Well done!" : "Quiz complete."} />}
      <div className="multiChoiceContainer">
        <div className="gameArea">
          {showAll ? questions.map((_, index) => renderQuestion(index)) : <>
            {renderQuestion(currentQuestionIndex)}
            <div className="navigationButtons">
              <button onClick={() => setCurrentQuestionIndex(0)} disabled={currentQuestionIndex === 0}>{"<< First"}</button>
              <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>{"< Previous"}</button>
              <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} disabled={currentQuestionIndex === questions.length - 1}>{"> Next"}</button>
              <button onClick={() => setCurrentQuestionIndex(questions.length - 1)} disabled={currentQuestionIndex === questions.length - 1}>{">> Last"}</button>
            </div>
          </>}
        </div>
      </div>
    </>
  );
}

export default MultiChoice;
