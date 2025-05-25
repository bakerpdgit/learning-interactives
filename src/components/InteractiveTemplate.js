import React, { useState } from "react";
import styles from "./InteractiveTemplate.module.css";
import MathComponent from "./MathComponent.js";

function InteractiveTemplate({ text }) {
  const [showCelebration, setShowCelebration] = useState(false);

  const lines = text.split("\n");

  // TODO: Add new game logic here

  // <GameArea will take up all of the screen after space for the title and contain the main interactivity
  return (
    <>
      <h1 className={styles.interactiveTitle}>Title of Interactive</h1>
      <p className={styles.instructions}>Instructions for the interactive</p>
      <div className={styles.GameArea}>
        {/* Render the game component items here, usually wrapped in MathComponent components to ensure maths renders*/}
        {lines.map((line, index) => (
          <div key={index} data-id={index}>
            <MathComponent text={line} />
          </div>
        ))}
        {showCelebration ? <div className={styles.celebration}>🎉</div> : ""}
      </div>
    </>
  );
}

export default InteractiveTemplate;
