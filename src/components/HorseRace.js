import Celebration from "./Celebration";
import React, { useState, useEffect, useRef } from "react";
import styles from "./HorseRace.module.css";

function HorseRace({ text }) {
  const horses = text.split("\n").filter((horse) => horse);
  const [positions, setPositions] = useState(horses.map(() => 0));
  const [celebrate, setCelebrate] = useState(false);
  const canvasRef = useRef(null);

  const handleClick = (index) => {
    const newPositions = [...positions];
    newPositions[index] = Math.min(10, positions[index] + 1);
    setPositions(newPositions);
    if (newPositions.some((position) => position >= 10)) {
      // Celebration logic goes here (similar to MatchDragDrop)
      setCelebrate(true); // Placeholder for now
    }
  };

  const handleRandomMove = () => {
    const randomHorse = Math.floor(Math.random() * horses.length);
    handleClick(randomHorse);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#55796c";
    ctx.lineWidth = 1;

    // Draw start line
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(10, canvas.height);
    ctx.stroke();

    // Draw finish line
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.8, 0); // 80% of the canvas width
    ctx.lineTo(canvas.width * 0.8, canvas.height);
    ctx.stroke();
  }, []);

  return (
    <>
      <div className={styles.horseNames}>
        {horses.map((horse, index) => (
          <span
            key={index}
            style={{
              color: `hsl(${(360 / horses.length) * index}, 64%, 37%)`,
            }}
          >
            {horse}
          </span>
        ))}
      </div>
      <div className={styles.horseRaceContainer}>
        {celebrate && <Celebration />}

        <canvas ref={canvasRef} className={styles.raceCanvas}></canvas>
        {horses.map((horse, index) => (
          <button type="button" aria-label={"Move " + horse}
            key={index}
            className={styles.horse}
            style={{
              top: `${(95 / horses.length) * index}%`,
              left: `${positions[index] * 8}%`,
              borderBottom: `5px solid hsl(${
                (360 / horses.length) * index
              }, 64%, 37%)`,
            }}
            onClick={() => handleClick(index)}
          >
            🐎
          </button>
        ))}
        <button className={styles.randomMoveButton} onClick={handleRandomMove}>
          Random Move
        </button>
      </div>
    </>
  );
}

export default HorseRace;
