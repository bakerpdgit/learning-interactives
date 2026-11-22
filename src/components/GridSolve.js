import Celebration from "./Celebration";
import React, { useState, useRef, useEffect } from "react";
import styles from "./GridSolve.module.css";
import MathComponent from "./MathComponent.js";

const Card = ({ text, answer, onCorrect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [incorrect, setIncorrect] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDivClick = () => {
    if (!isCorrect) {
      setIncorrect(false);
      setIsEditing(true);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);

      const sanitizedInput = inputValue.replace(/\s+/g, "").toLowerCase();
      const sanitizedAnswer = answer.replace(/\s+/g, "").toLowerCase();

      if (sanitizedInput === sanitizedAnswer) {
        setIsCorrect(true);
        onCorrect();
      } else {
        setIncorrect(true);
      }
    }
  };

  return (
    <div
      className={styles.Card}
      style={{
        fontSize: "1.4em",
        backgroundColor: isCorrect ? "var(--play-success)" : "transparent",
      }}
    >
      <button type="button" className={styles.text} onClick={handleDivClick} disabled={isCorrect}>
        <MathComponent text={text} renderNewLines={true} />
      </button>
      {isEditing && (
        <input
          ref={inputRef}
          className={styles.centered_input}
          type="text" aria-label="Answer"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={{ fontSize: "0.7em" }}
        />
      )}
      {incorrect && <span role="status">Try again.</span>}
      {isCorrect && <div className={styles.answer}>{answer}</div>}
    </div>
  );
};

const GridSolve = ({ text }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  // eslint-disable-next-line
  const [correctCount, setCorrectCount] = useState(0);

  const handleCorrect = () => {
    setCorrectCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount === originalPairs.length) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      return newCount;
    });
  };

  const originalPairs = text.split("\n\n").map((pair) => {
    const lines = pair.split("\n");
    const answer = lines.pop();
    const question = lines.join("\n");
    return { question, answer };
  });

  return (
    <>
      <div className={styles.GameAreaGrid}>
        {originalPairs.map((pair, index) => (
          <Card
            key={index}
            text={pair.question}
            answer={pair.answer}
            onCorrect={handleCorrect}
          />
        ))}
      </div>
      {showCelebration && <Celebration />}
    </>
  );
};

export default GridSolve;
