import React, { useState, useEffect, useRef } from "react";
import "./BuildingBlocks.css";
import MathComponent from "./MathComponent.js";
import Draggable from "react-draggable";
import InputModal from "./InputModal";

function InteractiveTemplate({ text }) {
  const [lines, setLines] = useState(text.split("\n")); // Convert lines to state
  const [highestZIndex, setHighestZIndex] = useState(0);
  const [configured, setConfigured] = useState(false);
  const [inputMessage, setInputMessage] = useState({});

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
  const placeBoxesRandomly = useRef((gameArea, boxes) => {
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
  });

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
    setInputMessage({
      prompt: "Please enter text for the new item:",
      value: "",
    });
  };

  const handleInputSubmit = (userInput) => {
    if (userInput) {
      setLines((prevLines) => [...prevLines, userInput]);
    }
    setInputMessage({}); // Clear inputMessage to close the modal
  };

  const handleRightClick = (index, e) => {
    e.preventDefault(); // Prevent the default context menu from showing
    setLines((prevLines) =>
      prevLines.map((line, i) => (i === index ? "" : line))
    );
  };

  useEffect(() => {
    // Add event listener for window resize
    const handleResize = () => {
      const gameArea = document.querySelector(".interactiveContainer");
      const boxes = document.querySelectorAll(".draggableBox");

      if (!gameArea || !boxes.length) return; // Ensure elements exist

      // Re-randomize the position of all blocks on resize
      placeBoxesRandomly.current(gameArea, boxes);
    };

    const gameArea = document.querySelector(".interactiveContainer");
    const boxes = document.querySelectorAll(".draggableBox");

    if (configured) {
      if (boxes.length) {
        placeBoxesRandomly.current(gameArea, [boxes[boxes.length - 1]]);
      }
    } else {
      placeBoxesRandomly.current(gameArea, boxes);
      setConfigured(true);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [configured]); // Make sure the dependencies are correctly set

  return (
    <>
      {inputMessage.prompt && (
        <InputModal
          title={inputMessage.prompt}
          placeholder="Type here..."
          value={inputMessage.value}
          onSubmit={handleInputSubmit}
          onClose={() => setInputMessage({})}
        />
      )}

      <div className="interactiveContainer">
        <button onClick={handleAddItem} className="addItem">
          Add item
        </button>
        {lines.map(
          (line, index) =>
            line !== "" && (
              <Draggable key={index}>
                <div
                  className="draggableBox"
                  id={`box-${index}`}
                  onContextMenu={(e) => handleRightClick(index, e)}
                  onDoubleClick={() => {
                    const newZIndex = handleDoubleClick();
                    document.getElementById(`box-${index}`).style.zIndex =
                      newZIndex;
                  }}
                >
                  <div className="resize-icon resize-bottom"></div>
                  <div className="resize-icon resize-right"></div>
                  <MathComponent text={line} renderNewLines={true} />
                </div>
              </Draggable>
            )
        )}
      </div>
    </>
  );
}

export default InteractiveTemplate;
