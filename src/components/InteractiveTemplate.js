import React, { useState } from "react";
import "./InteractiveTemplate.css";

function InteractiveTemplate({ text }) {
  const [showCelebration, setShowCelebration] = useState(false);

  // TODO: Add new game logic here

  return (
    <>
      <h1>Category Match</h1>
      <div className="InteractiveTemplate">
        {/* Render the game components here */}
        {showCelebration ? "🎉" : ""}
      </div>
    </>
  );
}

export default InteractiveTemplate;
