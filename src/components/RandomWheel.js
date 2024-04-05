import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./RandomWheel.module.css";

function RandomWheel({ text }) {
  const [items, setItems] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(0);
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
    let duration = 12000; // 12 seconds
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

      setRotationAngle(
        (prevAngle) => (prevAngle + speed * speedAdjuster) % (2 * Math.PI)
      );
      animationRef.current = requestAnimationFrame(spin);
    };

    animationRef.current = requestAnimationFrame(spin);
  };

  useEffect(() => {
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

    const parsedItems = text.split("\n").flatMap((line) => {
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

  // Encapsulated draw logic
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = gameWheelRef.current.getBoundingClientRect();
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
      ctx.fillText(items[i], radius - 10, 0);
      ctx.restore();
    }

    ctx.restore();
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
      <p className="instructions">
        Click an item in the list to remove it. Right-click to remove all
        instances of it.
      </p>

      <div className={styles.GameArea}>
        <div className={styles.GameWheel} ref={gameWheelRef}>
          <button
            onClick={spinWheel}
            style={{ display: "block", margin: "0 auto" }}
          >
            Spin Wheel
            <br /> v
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
    </>
  );
}

export default RandomWheel;
