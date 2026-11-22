import Celebration from "./Celebration";
import React, { useState, useEffect, useRef } from "react";
import styles from "./HorseRace.module.css";

const finish = 10;
const advance = (positions, index) => positions.map((position, horse) =>
  horse === index && position < finish ? position + 1 : position);

function HorseRace({ text }) {
  const horses = text.split("\n").filter((horse) => horse);
  const [positions, setPositions] = useState(horses.map(() => 0));
  const canvasRef = useRef(null);
  const allFinished = positions.every((position) => position === finish);

  const handleClick = (index) => {
    setPositions((previous) => previous[index] < finish ? advance(previous, index) : previous);
  };

  const handleRandomMove = () => {
    const roll = Math.random();
    setPositions((previous) => {
      const eligible = previous.flatMap((position, index) => position < finish ? [index] : []);
      return eligible.length ? advance(previous, eligible[Math.floor(roll * eligible.length)]) : previous;
    });
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
        {positions.includes(finish) && <Celebration />}

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
            disabled={positions[index] === finish}
          >
            🐎
          </button>
        ))}
        <button className={styles.randomMoveButton} onClick={handleRandomMove} disabled={allFinished}>
          Random Move
        </button>
      </div>
    </>
  );
}

export default HorseRace;
