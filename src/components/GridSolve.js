import React, { useState, useRef, useEffect } from "react";
import styles from "./GridSolve.module.css";
import MathComponent from "./MathComponent.js";

const Card = ({ text, answer, onCorrect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDivClick = () => {
    if (!isCorrect) {
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
      }
    }
  };

  return (
    <div
      onClick={handleDivClick}
      className={styles.Card}
      style={{
        fontSize: "1.4em",
        backgroundColor: isCorrect ? "lightgreen" : "transparent",
      }}
    >
      <div className={styles.text}>
        <MathComponent text={text} renderNewLines={true} />
      </div>
      {isEditing && (
        <input
          ref={inputRef}
          className={styles.centered_input}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={{ fontSize: "0.7em" }}
        />
      )}
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
      <h1 className="interactiveTitle">Grid Solve</h1>
      <p className="instructions">
        Click a square to complete an answer - press enter to check it!
      </p>
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
      {showCelebration && <div className={styles.celebrationGrid}>🎉</div>}
    </>
  );
};

export default GridSolve;
