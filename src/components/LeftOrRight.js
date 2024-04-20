import React, { useState } from "react";
import { InlineMath } from "react-katex";
import styles from "./LeftOrRight.module.css";

function parseInput(text) {
  const pairs = text.split("\n\n");
  return pairs.map((pair) => {
    const parts = pair.split("\n---\n");
    const left = parts[0] ? parts[0].replace("*", "") : "";
    const right = parts[1] ? parts[1].replace("*", "") : "";
    return {
      left: { text: left, correct: parts[0] && parts[0].startsWith("*") },
      right: { text: right, correct: parts[1] && parts[1].startsWith("*") },
    };
  });
}

function LeftOrRight({ text }) {
  const pairs = parseInput(text);
  const [selections, setSelections] = useState(Array(pairs.length).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  if (!text || typeof text !== "string") {
    return <div>Error: Invalid input provided.</div>;
  }

  const handleBoxClick = (pairIndex, side) => {
    if (isSubmitted) return;
    const newSelections = [...selections];
    newSelections[pairIndex] = side;
    setSelections(newSelections);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (getScore() === pairs.length) {
      setShowCelebration(true);
    }
  };

  const getScore = () => {
    return pairs.reduce((score, pair, index) => {
      const selectedSide = selections[index];
      if (selectedSide && pair[selectedSide].correct) {
        score += 1;
      }
      return score;
    }, 0);
  };

  return (
    <>
      {showCelebration && (
        <div className={styles.celebration}>
          <span>🏆</span>
        </div>
      )}
      <div className={`interactiveContainer ${styles.lorContainer}`}>
        {pairs.map((pair, index) => (
          <div key={index} className={styles.lorPair}>
            <div
              className={[
                styles.lorBox,
                selections[index] === "left" && styles.selected,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleBoxClick(index, "left")}
            >
              {<MathComponent text={pair.left.text} />}
            </div>
            <div className={styles.lorResult}>
              {isSubmitted &&
                selections[index] &&
                (pair[selections[index]].correct ? "✅" : "❌")}
            </div>
            <div
              className={[
                styles.lorBox,
                selections[index] === "right" && styles.selected,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleBoxClick(index, "right")}
            >
              {<MathComponent text={pair.right.text} />}
            </div>
          </div>
        ))}
        {pairs.some((pair) => pair.left.correct || pair.right.correct) && (
          <button onClick={handleSubmit} className={styles.SubmitButton}>
            Submit
          </button>
        )}
        {isSubmitted && (
          <div className={styles.score}>You scored {getScore()}</div>
        )}
      </div>
    </>
  );
}

function parseAndRenderMath(text) {
  // Split the text based on $$ delimiters
  const segments = text.split("$$");
  const elements = [];

  segments.forEach((segment, index) => {
    if (index % 2 === 1) {
      // Odd-indexed segments are LaTeX (since they are enclosed between $$ delimiters)
      elements.push(<InlineMath math={segment} />);
    } else {
      elements.push(<span>{segment}</span>);
    }
  });

  return elements;
}

function MathComponent({ text }) {
  return <>{parseAndRenderMath(text)}</>;
}

export default LeftOrRight;
