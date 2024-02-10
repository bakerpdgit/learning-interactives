import React, { useState } from "react";
import styles from "./GridSolve.module.css";
import "./InteractiveTemplate.css";
import MathComponent from "./MathComponent.js";

function InteractiveTemplate({ text }) {
  const [showCelebration, setShowCelebration] = useState(false);

  const lines = text.split("\n");

  // TODO: Add new game logic here

  // <GameArea will take up all of the screen after space for the title and contain the main interactivity
  return (
    <>
      <h1>Title of Interactive</h1>
      <div className={styles.GameArea}>
        {/* Render the game component items here wrapped in MathComponent components to ensure maths renders*/}
        {lines.map((line, index) => (
          <div key={index} data-id={index}>
            <MathComponent text={line} />
          </div>
        ))}
        {showCelebration ? "🎉" : ""}
      </div>
    </>
  );
}

export default InteractiveTemplate;
