import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./RandomWheel.module.css";

function RandomWheel({ text }) {
  const [items, setItems] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [spinCompleted, setSpinCompleted] = useState(false);
  const [spinTime, setSpinTime] = useState(12); // Default spin time of 12 seconds

  const canvasRef = useRef(null);
  const gameWheelRef = useRef(null);
  const animationRef = useRef(null);

  const unifiedEasing = (t) => {
    return 0.5 * (1 - Math.cos(Math.PI * t));
  };

  const shuffleItems = (itemList) => {
    const shuffledItems = [...itemList];
    for (let i = shuffledItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledItems[i], shuffledItems[j]] = [
        shuffledItems[j],
        shuffledItems[i],
      ];
    }

    return shuffledItems;
  };

  const spinWheel = () => {
    let startTime = null;
    let duration = spinTime * 1000; // Convert seconds to milliseconds
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
        setSpinCompleted(true);
        return;
      }

      setRotationAngle(
        (prevAngle) => (prevAngle + speed * speedAdjuster) % (2 * Math.PI)
      );
      animationRef.current = requestAnimationFrame(spin);
    };

    animationRef.current = requestAnimationFrame(spin);
  };

  useEffect(() => {
    const lines = text.split("\n");
    let options = lines[0].startsWith("OPTIONS:") ? lines.shift() : "";
    let spinTimeLocal = 12; // Default spin time

    const expandItems = (line) => {
      const [item, count] = line.split(":");
      const trimmedItem = item.trim();
      // Apply the max length check to each item
      const truncatedItem =
        trimmedItem.length > 20
          ? trimmedItem.substring(0, 20) + "..."
          : trimmedItem;
      return isNaN(count) ? [line] : Array(parseInt(count)).fill(truncatedItem);
    };

    // Parse the OPTIONS line for spin time
    if (options) {
      const optionsParts = options.split(":");
      if (optionsParts[1]) {
        const settings = optionsParts[1].split(",");
        settings.forEach((setting) => {
          const [key, value] = setting.split("=");
          if (key === "time" && !isNaN(value)) {
            spinTimeLocal = parseFloat(value);
          }
        });
      }
    }

    setSpinTime(spinTimeLocal);

    const parsedItems = lines.flatMap((line) => {
      // Handle the expansion and truncation in expandItems function
      if (line.includes(":") && !isNaN(line.split(":")[1])) {
        return expandItems(line);
      } else {
        const trimmedLine = line.trim();
        return [
          trimmedLine.length > 20
            ? trimmedLine.substring(0, 20) + "..."
            : trimmedLine,
        ];
      }
    });

    setItems(shuffleItems(parsedItems));
  }, [text]);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = gameWheelRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    // Adjust centerY to move the wheel down slightly, making space for the marker
    const centerY = canvas.height / 2 + 10; // Adjusted to add space for the marker at the top
    // Reduce the radius slightly to ensure the wheel is smaller and there is space for the marker
    const radius = Math.min(centerX, centerY) - 30; // Reduced radius to make space for marker

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "lightpink";
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "1.3em Arial";

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
      ctx.fillText(items[i], radius - 10, 0); // Adjust if needed to fit the text
      ctx.restore();
    }

    ctx.restore();

    // Draw the marker at the top center of the canvas, outside of the rotating context
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(centerX - 10, 10); // Start point of triangle
    ctx.lineTo(centerX + 10, 10); // Right side of triangle
    ctx.lineTo(centerX, 25); // Tip of triangle pointing down
    ctx.closePath();
    ctx.fill();
  }, [items, rotationAngle]);

  useEffect(() => {
    const handleResize = () => {
      drawWheel(); // Redraw when window resizes
    };

    window.addEventListener("resize", handleResize);
    drawWheel(); // Initial draw

    return () => window.removeEventListener("resize", handleResize);
  }, [items, rotationAngle, drawWheel]); // Ensuring drawWheel reacts to state changes

  const handleItemClick = (item) => {
    // Remove the first instance of the item
    setItems((currentItems) => {
      const index = currentItems.indexOf(item);
      if (index > -1) {
        return [
          ...currentItems.slice(0, index),
          ...currentItems.slice(index + 1),
        ];
      }
      return currentItems;
    });
  };

  const handleItemRightClick = (event, item) => {
    event.preventDefault(); // Prevent the default context menu
    // Remove all instances of the item
    setItems((currentItems) =>
      currentItems.filter((currentItem) => currentItem !== item)
    );
  };

  // Create a list of unique items for display
  const uniqueItems = Array.from(new Set(items));

  return (
    <>
      <div className={styles.GameArea}>
        <div className={styles.GameWheel} ref={gameWheelRef}>
          <button
            onClick={() => {
              setSpinCompleted(false);
              spinWheel();
            }}
            style={{ display: "block", margin: "0 auto" }}
          >
            Spin Wheel
          </button>
          <canvas ref={canvasRef}></canvas>
        </div>
        <div className={styles.ItemsList}>
          {uniqueItems.map((item, index) => (
            <div
              key={index}
              className={styles.Item}
              onClick={() => handleItemClick(item)}
              onContextMenu={(event) => handleItemRightClick(event, item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      {spinCompleted && <div className={styles.celebration}>🎉</div>}
    </>
  );
}

export default RandomWheel;
