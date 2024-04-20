import React, { useState } from "react";
import "./ScoreChart.css";

function ScoreChart({ text }) {
  // eslint-disable-next-line
  const [showCelebration, setShowCelebration] = useState(false);
  const lines = text.split("\n");
  const scoresData = lines.map((line) => {
    const parts = line.split(":");
    return {
      label: parts[0],
      score: parts.length > 1 ? parseInt(parts[1], 10) : 0,
    };
  });
  const [scores, setScores] = useState(scoresData.map((data) => data.score));
  const [starFontSize, setStarFontSize] = useState(1.5);

  const ScoreBar = ({ label, score, index }) => {
    const style = {
      flex: 1,
      padding: "10px",
      margin: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      border: "1px solid black",
    };
    return (
      <div style={style} className="ScoreBar">
        <button className="buttonSCLeft" onClick={() => handleDecrease(index)}>
          -
        </button>
        <button className="buttonSCRight" onClick={() => handleIncrease(index)}>
          +
        </button>
        {label}
        <span style={{ fontSize: `${starFontSize}em` }}>
          {"⭐".repeat(score)}
        </span>
      </div>
    );
  };

  const handleIncrease = (index) => {
    const newScores = [...scores];
    newScores[index] += 1;
    setScores(newScores);
  };

  const handleDecrease = (index) => {
    const newScores = [...scores];
    newScores[index] = Math.max(0, newScores[index] - 1);
    setScores(newScores);
  };

  const decreaseStarSize = () => {
    setStarFontSize(Math.max(0.1, starFontSize - 0.1));
  };

  const increaseStarSize = () => {
    setStarFontSize(starFontSize + 0.1);
  };

  const scoreBars = scoresData.map((data, index) => (
    <ScoreBar
      key={index}
      label={data.label}
      score={scores[index]}
      index={index}
    />
  ));

  return (
    <>
      <div align="center">
        <button className="buttonSCLeft" onClick={decreaseStarSize}>
          -
        </button>
        <button className="buttonSCRight" onClick={increaseStarSize}>
          +
        </button>
      </div>
      <div className="GameAreaSC">{scoreBars}</div>
      {showCelebration && <div className="celebration">🎉</div>}
    </>
  );
}

export default ScoreChart;
