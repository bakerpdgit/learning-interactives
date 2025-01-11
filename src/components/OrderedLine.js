import React, { useRef, useEffect, useState } from "react";
import InputModal from "./InputModal"; // <-- Adjust the import path to match your setup
import styles from "./OrderedLine.module.css";

function OrderedLineCanvas({ text }) {
  // ------------------ State ------------------
  // We store the 'items' (the draggable text boxes) in state so we can add new ones.
  const [items, setItems] = useState([]);
  const [labels, setLabels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ------------------ Refs for Canvas & Positions ------------------
  const canvasRef = useRef(null);
  const boxCoordinatesRef = useRef([]); // X positions of boxes
  const labelYPositionsRef = useRef([]); // Y positions of boxes
  const boxDimensionsRef = useRef([]); // [{ width, height }, ...] for each box
  const lineYRef = useRef(0); // The y-coordinate of the main timeline

  // ------------------ Refs for Drag/Resize Flags ------------------
  const isDraggingLabelRef = useRef(false);
  const draggedLabelIndexRef = useRef(null);

  const isDraggingMarkerRef = useRef(false);
  const draggedMarkerIndexRef = useRef(null);

  const isResizingTopRef = useRef(false);
  const isResizingRightRef = useRef(false);
  const resizingBoxIndexRef = useRef(null);

  // ------------------ Constants ------------------
  const textBoxDefaultHeight = 30;
  const textBoxDefaultWidthPad = 10;
  const markerSize = 10;
  const handleSize = 10;

  // ------------------ Parse Text (Once) ------------------
  //   1. The first line "labelLine" has something like:  "Start-End"
  //   2. The rest become items. We store them in React state.
  useEffect(() => {
    const lines = text.split("\n").filter((item) => item.trim());
    if (lines.length < 1) return;

    const [labelLine, ...rest] = lines;
    const [labelLeft, labelRight] = labelLine.split("-");

    setLabels([labelLeft, labelRight]);
    // Shuffle or randomize the item lines:
    const shuffled = rest.sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, [text]);

  /**
   * Wraps text into multiple lines based on the maximum width.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   * @param {string} text - The text to wrap.
   * @param {number} maxWidth - The maximum width of each line.
   * @returns {string[]} - An array of text lines.
   */
  function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const { width } = ctx.measureText(testLine);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  // ------------------ Initialize & Draw (Runs whenever items or labels change) ------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // On window resize, re-initialize & re-draw
    function handleResize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      lineYRef.current = (canvas.height * 0.92) / dpr;
      initializePositions(ctx, dpr, true);
      draw(ctx, dpr);
    }
    window.addEventListener("resize", handleResize);

    // First-time setup: set canvas size, then init/draw
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    lineYRef.current = (canvas.height * 0.92) / dpr;

    // ------------------ Initialize Positions ------------------
    function initializePositions(context, pixelRatio, forceReset = false) {
      // Clear any prior references
      const newBoxCoordinates = [];
      const newLabelYPositions = [];
      const newBoxDimensions = [];

      items.forEach((item, i) => {
        // retain current if present else set to spread out default

        // Spread them out horizontally
        let xPos = ((i + 1) * canvas.width) / (items.length + 1) / pixelRatio;

        if (boxCoordinatesRef.current[i] && !forceReset) {
          xPos = boxCoordinatesRef.current[i];
        }

        newBoxCoordinates.push(xPos);

        // Random or default vertical position
        const minY = textBoxDefaultHeight / 2 + 10;
        const maxY =
          lineYRef.current - markerSize - textBoxDefaultHeight / 2 - 10;
        let yPos = Math.random() * (maxY - minY) + minY;

        if (labelYPositionsRef.current[i] && !forceReset) {
          yPos = labelYPositionsRef.current[i];
        }

        newLabelYPositions.push(yPos);

        // Measure text width
        context.font = "16px Arial";
        let textWidth =
          context.measureText(item).width + textBoxDefaultWidthPad * 2;
        let textBoxHeight = textBoxDefaultHeight;

        if (boxDimensionsRef.current[i] && !forceReset) {
          textWidth = boxDimensionsRef.current[i].width;
          textBoxHeight = boxDimensionsRef.current[i].height;
        }

        newBoxDimensions.push({
          width: textWidth,
          height: textBoxHeight,
        });
      });

      // Update the refs
      boxCoordinatesRef.current = newBoxCoordinates;
      labelYPositionsRef.current = newLabelYPositions;
      boxDimensionsRef.current = newBoxDimensions;
    }

    initializePositions(ctx, dpr);

    // ------------------ Draw ------------------
    function draw(context, pixelRatio) {
      context.clearRect(
        0,
        0,
        canvas.width / pixelRatio,
        canvas.height / pixelRatio
      );

      // 1) Draw main line
      context.strokeStyle = "#000";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(10, lineYRef.current);
      context.lineTo(canvas.width / pixelRatio - 10, lineYRef.current);
      context.stroke();

      // 2) Draw labels
      if (labels.length === 2) {
        context.font = "16px Arial";
        context.textAlign = "left";
        context.fillText(labels[0], 10, lineYRef.current + 20);

        context.textAlign = "right";
        context.fillText(
          labels[1],
          canvas.width / pixelRatio - 10,
          lineYRef.current + 20
        );
      }

      // 3) Draw each item with wrapped text
      items.forEach((item, i) => {
        const x = boxCoordinatesRef.current[i];
        const yLabel = labelYPositionsRef.current[i];
        let { width: boxWidth, height: boxHeight } =
          boxDimensionsRef.current[i];

        // Wrap text
        context.font = "16px Arial";
        context.textAlign = "center";
        context.textBaseline = "top"; // Start from the top of the box
        context.fillStyle = "#000";

        const maxTextWidth = boxWidth - textBoxDefaultWidthPad * 2;
        const lines = wrapText(context, item, maxTextWidth);
        const padding = 6;

        const lineHeight = 18; // Adjust based on font size
        const totalTextHeight = lines.length * lineHeight;

        // Auto-calculate box height based on text lines with reduced bottom padding
        boxHeight = Math.max(
          textBoxDefaultHeight + padding,
          totalTextHeight + padding
        );
        boxDimensionsRef.current[i].height = boxHeight;

        // Calculate starting Y-coordinate for vertically centered text
        const textStartY = yLabel - totalTextHeight / 2;

        // Box background and border
        context.fillStyle = "#f0f0f0";
        context.fillRect(
          x - boxWidth / 2,
          yLabel - boxHeight / 2,
          boxWidth,
          boxHeight
        );
        context.strokeStyle = "#000";
        context.strokeRect(
          x - boxWidth / 2,
          yLabel - boxHeight / 2,
          boxWidth,
          boxHeight
        );

        // Set text properties
        context.font = "16px Arial";
        context.textAlign = "center";
        context.textBaseline = "top"; // Start from the top of the text block
        context.fillStyle = "#000"; // Ensure text color is black

        // Render each line of text, centered vertically
        lines.forEach((line, lineIndex) => {
          context.fillText(line, x, textStartY + lineIndex * lineHeight);
        });

        // Vertical line from box to main timeline
        context.beginPath();
        context.moveTo(x, yLabel + boxHeight / 2);
        context.lineTo(x, lineYRef.current - markerSize / 2);
        context.stroke();

        // Marker
        context.fillStyle = "#000";
        context.fillRect(
          x - markerSize / 2,
          lineYRef.current - markerSize / 2,
          markerSize,
          markerSize
        );

        // Right handle
        context.fillRect(
          x + boxWidth / 2 - handleSize / 4,
          yLabel - handleSize / 2,
          handleSize / 2,
          handleSize
        );
      });
    }

    // Perform initial draw
    draw(ctx, dpr);

    // ------------------ Utility for checking if point in rect ------------------
    function isPointInRect(px, py, rect) {
      return (
        px >= rect.x &&
        px <= rect.x + rect.width &&
        py >= rect.y &&
        py <= rect.y + rect.height
      );
    }

    // ------------------ MouseDown ------------------
    function handleMouseDown(e) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Reset all flags to false by default
      isDraggingMarkerRef.current = false;
      draggedMarkerIndexRef.current = null;
      isResizingTopRef.current = false;
      isResizingRightRef.current = false;
      resizingBoxIndexRef.current = null;
      isDraggingLabelRef.current = false;
      draggedLabelIndexRef.current = null;

      for (let i = 0; i < items.length; i++) {
        const x = boxCoordinatesRef.current[i];
        const yLabel = labelYPositionsRef.current[i];
        const { width: boxWidth, height: boxHeight } =
          boxDimensionsRef.current[i];

        // Marker rect
        const markerRect = {
          x: x - markerSize / 2,
          y: lineYRef.current - markerSize / 2,
          width: markerSize,
          height: markerSize,
        };
        // Box rect
        const boxRect = {
          x: x - boxWidth / 2,
          y: yLabel - boxHeight / 2,
          width: boxWidth,
          height: boxHeight,
        };

        // Right handle rect
        const rightHandleRect = {
          x: x + boxWidth / 2 - handleSize / 4,
          y: yLabel - handleSize / 2,
          width: handleSize / 2,
          height: handleSize,
        };

        // Check marker
        if (isPointInRect(mouseX, mouseY, markerRect)) {
          isDraggingMarkerRef.current = true;
          draggedMarkerIndexRef.current = i;
          break;
        }

        // Check right handle
        if (isPointInRect(mouseX, mouseY, rightHandleRect)) {
          isResizingRightRef.current = true;
          resizingBoxIndexRef.current = i;
          break;
        }
        // Check box
        if (isPointInRect(mouseX, mouseY, boxRect)) {
          isDraggingLabelRef.current = true;
          draggedLabelIndexRef.current = i;
          break;
        }
      }
    }

    // ------------------ MouseMove ------------------
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // First, handle cursor changes
      canvas.style.cursor = "default";

      for (let i = 0; i < items.length; i++) {
        const x = boxCoordinatesRef.current[i];
        const yLabel = labelYPositionsRef.current[i];
        const { width: boxWidth, height: boxHeight } =
          boxDimensionsRef.current[i];

        const markerRect = {
          x: x - markerSize / 2,
          y: lineYRef.current - markerSize / 2,
          width: markerSize,
          height: markerSize,
        };

        const rightHandleRect = {
          x: x + boxWidth / 2 - handleSize / 4,
          y: yLabel - handleSize / 2,
          width: handleSize / 2,
          height: handleSize,
        };
        const boxRect = {
          x: x - boxWidth / 2,
          y: yLabel - boxHeight / 2,
          width: boxWidth,
          height: boxHeight,
        };

        if (isPointInRect(mouseX, mouseY, markerRect)) {
          canvas.style.cursor = "ns-resize";
          break;
        } else if (isPointInRect(mouseX, mouseY, rightHandleRect)) {
          canvas.style.cursor = "ew-resize";
          break;
        } else if (isPointInRect(mouseX, mouseY, boxRect)) {
          canvas.style.cursor = "move";
          break;
        }
      }

      // Second, handle active dragging/resizing
      if (isDraggingLabelRef.current && draggedLabelIndexRef.current !== null) {
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        const renderedWidth = canvas.width / dpr;

        // Define boundaries
        const minX = 10;
        const maxX = renderedWidth - 10;

        // Clamp the mouseX within [minX, maxX]
        const clampedX = Math.min(Math.max(mouseX, minX), maxX);

        // Update the x-coordinate with the clamped value
        boxCoordinatesRef.current[draggedLabelIndexRef.current] = clampedX;
        draw(ctx, dpr);
      } else if (
        isDraggingMarkerRef.current &&
        draggedMarkerIndexRef.current !== null
      ) {
        // Move the text vertically (marker drags the text)
        const minY = textBoxDefaultHeight / 2 + 10;
        const maxY =
          lineYRef.current - markerSize - textBoxDefaultHeight / 2 - 50;
        const newY = Math.min(Math.max(mouseY, minY), maxY);
        labelYPositionsRef.current[draggedMarkerIndexRef.current] = newY;
        draw(ctx, dpr);
      } else if (
        isResizingTopRef.current &&
        resizingBoxIndexRef.current !== null
      ) {
        // Resize height
        const i = resizingBoxIndexRef.current;
        const yLabel = labelYPositionsRef.current[i];
        const currentHeight = boxDimensionsRef.current[i].height;
        const boxTop = yLabel - currentHeight / 2;
        const diff = boxTop - mouseY;
        const newHeight = currentHeight + diff;
        if (newHeight > 20) {
          boxDimensionsRef.current[i].height = newHeight;
        }
        draw(ctx, dpr);
      } else if (
        isResizingRightRef.current &&
        resizingBoxIndexRef.current !== null
      ) {
        // Resize width
        const i = resizingBoxIndexRef.current;
        const currentWidth = boxDimensionsRef.current[i].width;
        const x = boxCoordinatesRef.current[i];
        const boxRight = x + currentWidth / 2;
        const diff = mouseX - boxRight;
        const newWidth = currentWidth + diff;
        if (newWidth > 20) {
          boxDimensionsRef.current[i].width = newWidth;
        }
        draw(ctx, dpr);
      }
    }

    // ------------------ MouseUp ------------------
    function handleMouseUp() {
      // Release everything
      isDraggingMarkerRef.current = false;
      draggedMarkerIndexRef.current = null;
      isResizingTopRef.current = false;
      isResizingRightRef.current = false;
      resizingBoxIndexRef.current = null;
      isDraggingLabelRef.current = false;
      draggedLabelIndexRef.current = null;
    }

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [items, labels]);

  // ------------------ Modal and "Add Item" Logic ------------------
  const openAddItemModal = () => {
    setIsModalOpen(true);
  };

  const handleAddItemSubmit = (userInput) => {
    if (userInput.trim()) {
      // Insert new item at the end (or in the middle, if desired)
      setItems((prev) => [...prev, userInput.trim()]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className={styles.orderedLineContainer}>
      {/* (1) "Add Item" button */}
      <div className={styles.addItemBar}>
        <button className={styles.addItem} onClick={openAddItemModal}>
          Add Item
        </button>
      </div>

      {/* (2) The InputModal (single-line) */}
      {isModalOpen && (
        <InputModal
          title="Add a New Item"
          placeholder="Type your item here..."
          value=""
          onSubmit={handleAddItemSubmit}
          onClose={() => setIsModalOpen(false)}
          multiLine={false}
        />
      )}

      {/* (3) The Canvas */}
      <div className={styles.orderedLineCanvasContainer}>
        <canvas ref={canvasRef} className={styles.orderedLineCanvas}></canvas>
      </div>
    </div>
  );
}

export default OrderedLineCanvas;
