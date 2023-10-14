import React, { useState, useEffect, useRef } from "react";
import "./RandomWheel.css";

function RandomWheel({ text }) {
  const [items, setItems] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const canvasRef = useRef(null);
  const gameAreaRef = useRef(null);
  const animationRef = useRef(null);

  const unifiedEasing = (t) => {
    return 0.5 * (1 - Math.cos(Math.PI * t));
  };

  const spinWheel = () => {
    let startTime = null;
    let duration = 12000; // 1 seconds
    let speedAdjuster = 0.6 + Math.random() * 0.4;

    const spin = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      let elapsed = timestamp - startTime;
      let speed;

      if (elapsed < duration / 2) {
        speed = unifiedEasing(elapsed / duration);
      } else if (elapsed < duration) {
        speed = 1 - unifiedEasing(elapsed / duration);
      } else {
        cancelAnimationFrame(animationRef.current);
        return;
      }

      // Increased the speed multiplier to 0.2 for faster full speed
      setRotationAngle(
        (prevAngle) => (prevAngle + speed * speedAdjuster) % (2 * Math.PI)
      );
      animationRef.current = requestAnimationFrame(spin);
    };

    animationRef.current = requestAnimationFrame(spin);
  };

  useEffect(() => {
    const parsedItems = text.split("\n");
    setItems(parsedItems);
  }, [text]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gameArea = gameAreaRef.current;
    const ctx = canvas.getContext("2d");

    const rect = gameArea.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.font = "24px Arial";

    const numItems = items.length;
    const angleStep = (2 * Math.PI) / numItems;

    const offsetAngle = angleStep / 2;
    for (let i = 0; i < numItems; i++) {
      const angle = i * angleStep + offsetAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
      ctx.stroke();
    }

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i < numItems; i++) {
      const angle = i * angleStep;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillText(items[i], radius - 10, 0);
      ctx.restore();
    }

    ctx.restore();
  }, [items, rotationAngle]);

  return (
    <>
      <h1>Random Wheel</h1>
      <button
        onClick={spinWheel}
        style={{ display: "block", margin: "0 auto" }}
      >
        Spin Wheel
        <br /> v
      </button>
      <div ref={gameAreaRef} className="GameArea">
        <canvas ref={canvasRef}></canvas>
      </div>
    </>
  );
}

export default RandomWheel;
