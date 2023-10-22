import React, { useState, useEffect } from "react";
import "./BuildingBlocks.css";
import MathComponent from "./MathComponent.js";
import Draggable from "react-draggable";

function InteractiveTemplate({ text }) {
  const [lines, setLines] = useState(text.split("\n")); // Convert lines to state
  const [configured, setConfigured] = useState(false);
  const [highestZIndex, setHighestZIndex] = useState(0);

  const handleDoubleClick = () => {
    setHighestZIndex(highestZIndex + 1);
    return highestZIndex + 1;
  };

  // Function to make a box resizable
  const makeBoxResizable = (boxId) => {
    const box = document.getElementById(boxId);
    const resizers = box.querySelectorAll(".resize-icon");
    let currentResizer;

    // Handle resizing
    resizers.forEach((resizer) => {
      resizer.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        e.preventDefault();
        currentResizer = e.target;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", () => {
          document.removeEventListener("mousemove", handleMouseMove);
        });
      });
    });

    const handleMouseMove = (e) => {
      const rect = box.getBoundingClientRect();
      let newWidth = e.clientX - rect.x;
      let newHeight = e.clientY - rect.y;
      if (currentResizer.classList.contains("resize-bottom")) {
        box.style.height = newHeight + "px";
      } else if (currentResizer.classList.contains("resize-right")) {
        box.style.width = newWidth + "px";
      }
    };
  };

  // Function to place boxes randomly with no overlap
  const placeBoxesRandomly = (gameArea, boxes) => {
    const gameAreaRect = gameArea.getBoundingClientRect();
    boxes.forEach((box) => {
      makeBoxResizable(box.id);
      let overlap = true;
      while (overlap) {
        const randomX = Math.random() * (gameAreaRect.width - box.offsetWidth);
        const randomY =
          Math.random() * (gameAreaRect.height - box.offsetHeight);
        box.style.left = randomX + "px";
        box.style.top = randomY + "px";
        overlap = checkOverlap(box, boxes);
      }
    });
  };

  // Function to check if a box overlaps with any other boxes
  const checkOverlap = (box, boxes) => {
    const rect1 = box.getBoundingClientRect();
    for (const otherBox of boxes) {
      if (box === otherBox) continue;
      const rect2 = otherBox.getBoundingClientRect();
      if (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      ) {
        return true;
      }
    }
    return false;
  };

  const handleAddItem = () => {
    const userInput = window.prompt("Please enter text for the new item:");
    // Check if user provided a value and didn't cancel the prompt
    if (userInput) {
      setLines((prevLines) => [...prevLines, userInput]); // Add new line to lines state
    }
  };

  // <GameArea will take up all of the screen after space for the title and contain the main interactivity
  useEffect(() => {
    const gameArea = document.querySelector(".GameArea");
    const boxes = document.querySelectorAll(".draggableBox");
    if (configured) {
      placeBoxesRandomly(gameArea, [boxes[boxes.length - 1]]);
    } else {
      placeBoxesRandomly(gameArea, boxes);
      setConfigured(true);
    }

    // eslint-disable-next-line
  }, [lines]);

  return (
    <>
      <h1 className="interactiveTitle">Building Blocks</h1>
      <p className="instructions">
        Double-click a block to bring-it in front of any other blocks.
      </p>
      <button onClick={handleAddItem} className="addItemBtn">
        Add item
      </button>
      <div className="GameArea">
        {lines.map((line, index) => (
          <Draggable key={index}>
            <div
              className="draggableBox"
              id={`box-${index}`}
              onDoubleClick={() => {
                const newZIndex = handleDoubleClick();
                document.getElementById(`box-${index}`).style.zIndex =
                  newZIndex;
              }}
            >
              <div className="resize-icon resize-bottom"></div>
              <div className="resize-icon resize-right"></div>
              <MathComponent text={line} />
            </div>
          </Draggable>
        ))}
      </div>
    </>
  );
}

export default InteractiveTemplate;
