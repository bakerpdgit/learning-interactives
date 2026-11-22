import React, { useState } from "react";
import "./ScoreChart.css";

export default function ScoreChart({ text }) {
  const teams = text.split("\n").map((line) => line.split(":"));
  const [scores, setScores] = useState(() => teams.map(([, score]) => Math.max(0, parseInt(score, 10) || 0)));
  const [starFontSize, setStarFontSize] = useState(1.5);

  function changeScore(team, difference) {
    setScores((current) => current.map((score, index) => index === team ? Math.max(0, score + difference) : score));
  }

  return <>
    <div className="scoreChartControls">
      <button type="button" aria-label="Smaller stars" onClick={() => setStarFontSize((size) => Math.max(.1, size - .1))}>−</button>
      <button type="button" aria-label="Larger stars" onClick={() => setStarFontSize((size) => size + .1)}>+</button>
    </div>
    <div className="GameAreaSC">
      {teams.map(([label], index) => <div className="ScoreBar" key={index}>
        <button type="button" className="buttonSCLeft" aria-label={"Remove star from " + label}
          onClick={() => changeScore(index, -1)}>−</button>
        <button type="button" className="buttonSCRight" aria-label={"Add star to " + label}
          onClick={() => changeScore(index, 1)}>+</button>
        {label}
        <span style={{ fontSize: starFontSize + "em" }} aria-label={scores[index] + " stars"}>
          {"⭐".repeat(scores[index])}
        </span>
      </div>)}
    </div>
  </>;
}
