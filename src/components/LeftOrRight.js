import Celebration from "./Celebration";
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
  const gradedCount = pairs.filter((pair) => pair.left.correct || pair.right.correct).length;

  if (!text || typeof text !== "string") {
    return <div>Error: Invalid input provided.</div>;
  }

  const handleBoxClick = (pairIndex, side) => {
    if (isSubmitted) return;
    const newSelections = [...selections];
    newSelections[pairIndex] = side;
    setSelections(newSelections);
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
      {isSubmitted && (
        <Celebration label={getScore() === gradedCount ? "Well done!" : "Quiz complete."} />
      )}
      <div className={`interactiveContainer ${styles.lorContainer}`}>
        {pairs.map((pair, index) => (
          <div key={index} className={styles.lorPair}>
            <button type="button"
              className={[
                styles.lorBox,
                selections[index] === "left" && styles.selected,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selections[index] === "left"}
              onClick={() => handleBoxClick(index, "left")}
            >
              {<MathComponent text={pair.left.text} />}
            </button>
            <div className={styles.lorResult}>
              {isSubmitted &&
                selections[index] &&
                (pair[selections[index]].correct ? "✅" : "❌")}
            </div>
            <button type="button"
              className={[
                styles.lorBox,
                selections[index] === "right" && styles.selected,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selections[index] === "right"}
              onClick={() => handleBoxClick(index, "right")}
            >
              {<MathComponent text={pair.right.text} />}
            </button>
          </div>
        ))}
        {gradedCount > 0 && (
          <button onClick={() => setIsSubmitted(true)} className={styles.SubmitButton}>
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
