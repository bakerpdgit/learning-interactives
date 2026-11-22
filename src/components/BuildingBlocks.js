import React, { useState, useEffect, useRef } from "react";
import "./BuildingBlocks.css";
import MathComponent from "./MathComponent.js";
import { DraggableCore } from "react-draggable";
import InputModal from "./InputModal";

const SNAP_DISTANCE = 10;

function nearest(value, candidates) {
  return candidates.reduce((best, candidate) =>
    Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best, value + SNAP_DISTANCE + 1);
}

function snap(value, candidates) {
  const target = nearest(value, candidates);
  return Math.abs(target - value) <= SNAP_DISTANCE ? target : value;
}

function nearRanges(start, end, otherStart, otherEnd) {
  return Math.max(start, otherStart) <= Math.min(end, otherEnd) + SNAP_DISTANCE;
}

function nearEdges(start, end, otherStart, otherEnd) {
  return Math.min(Math.abs(end - otherStart), Math.abs(start - otherEnd)) <= SNAP_DISTANCE;
}

function neighbours(box) {
  return Array.from(box.parentElement.querySelectorAll(".draggableBox")).filter((other) => other !== box)
    .map((other) => ({
      left: other.offsetLeft, right: other.offsetLeft + other.offsetWidth,
      top: other.offsetTop, bottom: other.offsetTop + other.offsetHeight,
      height: other.offsetHeight,
    }));
}

function snapPosition(box, x, y) {
  const width = box.offsetWidth;
  const height = box.offsetHeight;
  const xTargets = [];
  const yTargets = [];
  for (const other of neighbours(box)) {
    if (nearRanges(y, y + height, other.top, other.bottom)) xTargets.push(other.left - width, other.right);
    if (nearRanges(x, x + width, other.left, other.right)) yTargets.push(other.top - height, other.bottom);
    if (nearEdges(y, y + height, other.top, other.bottom)) xTargets.push(other.left, other.right - width);
    if (nearEdges(x, x + width, other.left, other.right)) yTargets.push(other.top, other.bottom - height);
  }
  box.style.left = snap(x, xTargets) + "px";
  box.style.top = snap(y, yTargets) + "px";
}

function InteractiveTemplate({ text }) {
  const [lines, setLines] = useState(text.split("\n")); // Convert lines to state
  const [highestZIndex, setHighestZIndex] = useState(0);
  const board = useRef(null);
  const placed = useRef(new WeakSet());
  const [inputMessage, setInputMessage] = useState({});

  const handleDoubleClick = () => {
    setHighestZIndex(highestZIndex + 1);
    return highestZIndex + 1;
  };

  const dragPosition = useRef(null);
  const resize = useRef(null);

  function startResize(event) {
    if (event.button !== 0 || !event.isPrimary) return;
    const box = event.currentTarget.parentElement;
    resize.current = { box, x: event.clientX, y: event.clientY, width: box.offsetWidth, height: box.offsetHeight };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resizeBox(event, vertical) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !resize.current) return;
    const {box, x, y, width, height} = resize.current;
    const left = box.offsetLeft;
    const top = box.offsetTop;
    const nearby = neighbours(box);
    if (vertical) {
      const proposed = Math.max(24, height + event.clientY - y);
      const heights = nearby.filter((other) => nearEdges(left, left + width, other.left, other.right) &&
        nearRanges(top, top + proposed, other.top, other.bottom)).map((other) => other.height);
      box.style.height = snap(proposed, heights) + "px";
    } else {
      const proposed = Math.max(24, width + event.clientX - x);
      const widths = nearby.filter((other) => other.left > left &&
        nearRanges(top, top + height, other.top, other.bottom)).map((other) => other.left - left);
      box.style.width = snap(proposed, widths) + "px";
    }
  }

  function resizerProps(vertical) {
    return {
      onPointerDown: startResize,
      onPointerMove: (event) => resizeBox(event, vertical),
      onLostPointerCapture: () => { resize.current = null; },
    };
  }

  // Function to place boxes randomly with no overlap
  const placeBoxesRandomly = useRef((gameArea, boxes, existing) => {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const top = gameArea.querySelector(".addItem").offsetHeight + 12;
    boxes.forEach((box) => {
      let overlap = true;
      for (let attempt = 0; overlap && attempt < 80; attempt++) {
        const randomX = Math.random() * Math.max(0, gameAreaRect.width - box.offsetWidth);
        const randomY =
          top + Math.random() * Math.max(0, gameAreaRect.height - box.offsetHeight - top);
        box.style.left = randomX + "px";
        box.style.top = randomY + "px";
        overlap = checkOverlap(box, existing);
      }
      placed.current.add(box);
      existing.push(box);
      if (overlap) {
        box.style.left = Math.min(30, gameAreaRect.width / 8) + "px";
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
    const gameArea = board.current;
    const boxes = [...gameArea.querySelectorAll(".draggableBox")];
    const existing = boxes.filter((box) => placed.current.has(box));
    placeBoxesRandomly.current(gameArea, boxes.filter((box) => !placed.current.has(box)), existing);
  }, [lines]);

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

      <div className="interactiveContainer buildingBlocks" ref={board}>
        <button onClick={handleAddItem} className="addItem">
          Add item
        </button>
        {lines.map(
          (line, index) =>
            line !== "" && (
              <DraggableCore key={index} cancel=".resize-icon"
                onStart={(_, {node}) => { dragPosition.current = {x: node.offsetLeft, y: node.offsetTop}; }}
                onDrag={(_, {node, deltaX, deltaY}) => {
                  const position = dragPosition.current;
                  position.x += deltaX;
                  position.y += deltaY;
                  snapPosition(node, position.x, position.y);
                }}
                onStop={() => { dragPosition.current = null; }}>
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
                  <div className="resize-icon resize-bottom" {...resizerProps(true)} />
                  <div className="resize-icon resize-right" {...resizerProps(false)} />
                  <MathComponent text={line} renderNewLines={true} />
                </div>
              </DraggableCore>
            )
        )}
      </div>
    </>
  );
}

export default InteractiveTemplate;
