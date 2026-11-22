import React, { useRef, useEffect, useState } from "react";
import InputModal from "./InputModal";
import { readOrderedLine, validRanks } from "../activityMarking";
import ColorPickerModal from "./ColorPickerModal";
import styles from "./OrderedLine.module.css";

function OrderedLineCanvas({ text }) {
  // ------------------ State ------------------
  // We store the 'items' (the draggable text boxes) in state so we can add new ones.
  const [items, setItems] = useState([]);
  const [axes, body] = readOrderedLine(text);
  const [, ...configuredItems] = body.split("\n").filter((item) => item.trim());
  const itemCount = configuredItems.length;
  const xLabel = axes.x || "";
  const yLabel = axes.y || "";
  const [feedback, setFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLabel, setActiveLabel] = useState(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  
  // Font size and color state
  const [fontSize, setFontSize] = useState(16); // Default font size
  const [boxColors, setBoxColors] = useState({}); // Store colors for each box by index
  
  // Color picker modal state
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);

  // ------------------ Refs for Canvas & Positions ------------------
  const canvasRef = useRef(null);
  const boxCoordinatesRef = useRef([]); // X positions of boxes
  const labelYPositionsRef = useRef([]); // Y positions of boxes
  const boxDimensionsRef = useRef([]); // [{ width, height }, ...] for each box
  const canvasSize = useRef({width: 0, lineY: 0});
  const lineYRef = useRef(0); // The y-coordinate of the main timeline

  // ------------------ Refs for Drag/Resize Flags ------------------
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDraggingLabelRef = useRef(false);
  const draggedLabelIndexRef = useRef(null);

  const isDraggingMarkerRef = useRef(false);
  const draggedMarkerIndexRef = useRef(null);

  const isResizingTopRef = useRef(false);
  const isResizingRightRef = useRef(false);
  const resizingBoxIndexRef = useRef(null);

  // ------------------ Color Selection ------------------  
  const handleRightClick = (e, boxIndex) => {
    e?.preventDefault();
    setSelectedBoxIndex(boxIndex);
    setColorModalOpen(true);
  };

  const handleColorSubmit = (color) => {
    if (selectedBoxIndex !== null) {
      setBoxColors(prev => ({
        ...prev,
        [selectedBoxIndex]: color
      }));
    }
    setColorModalOpen(false);
    setSelectedBoxIndex(null);
  };

  // ------------------ Font Size Controls ------------------
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32)); // Max 32px
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 10)); // Min 10px

  // ------------------ Constants ------------------
  const textBoxDefaultHeight = 30;
  const textBoxDefaultWidthPad = 10;
  const markerSize = 10;
  const handleSize = 10;

  // Read the authored ranks before shuffling, including when labels repeat.
  useEffect(() => {
    const [, body] = readOrderedLine(text);
    const [, ...labels] = body.split("\n").filter((item) => item.trim());
    const shuffled = labels.map((label, index) => ({label, index}));
    for (let index = shuffled.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
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

    const dpr = window.devicePixelRatio || 1;
    function resizeAndDraw() {
      const { clientWidth: width, clientHeight: height } = canvas;
      const lineY = height - (xLabel ? 49 : 29);
      if (canvasSize.current.width && (width !== canvasSize.current.width || lineY !== canvasSize.current.lineY)) {
        boxCoordinatesRef.current = boxCoordinatesRef.current.map((x) => x * width / canvasSize.current.width);
        labelYPositionsRef.current = labelYPositionsRef.current.map((y) => y * lineY / canvasSize.current.lineY);
      }
      canvasSize.current = { width, lineY };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      lineYRef.current = lineY;
      initializePositions(ctx, dpr);
      draw(ctx, dpr);
    }

    // ------------------ Initialize Positions ------------------
    function initializePositions(context, pixelRatio) {
      // Clear any prior references
      const newBoxCoordinates = [];
      const newLabelYPositions = [];
      const newBoxDimensions = [];

      items.forEach(({label: item}, i) => {
        // retain current if present else set to spread out default

        // Spread them out horizontally
        let xPos = ((i + 1) * canvas.width) / (items.length + 1) / pixelRatio;

        if (boxCoordinatesRef.current[i]) {
          xPos = boxCoordinatesRef.current[i];
        }

        newBoxCoordinates.push(xPos);

        // Random or default vertical position
        const minY = textBoxDefaultHeight / 2 + 10;
        const maxY =
          lineYRef.current - markerSize - textBoxDefaultHeight / 2 - 10;
        let yPos = Math.random() * (maxY - minY) + minY;

        if (labelYPositionsRef.current[i]) {
          yPos = labelYPositionsRef.current[i];
        }

        newLabelYPositions.push(yPos);

        // Measure text width using dynamic font size
        context.font = `${fontSize}px Arial`;
        let textWidth =
          context.measureText(item).width + textBoxDefaultWidthPad * 2;
        let textBoxHeight = textBoxDefaultHeight;

        if (boxDimensionsRef.current[i]) {
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
      context.moveTo(yLabel ? 34 : 10, lineYRef.current);
      context.lineTo(canvas.width / pixelRatio - 10, lineYRef.current);
      context.stroke();

      const width = canvas.width / pixelRatio;
      context.font = `${fontSize}px Arial`;
      context.fillStyle = "#000";
      context.textBaseline = "alphabetic";
      const [labelLeft, labelRight] = (readOrderedLine(text)[1].split("\n").find((line) => line.trim()) || "").split("-");
      context.textAlign = "left";
      if (labelLeft) context.fillText(labelLeft, yLabel ? 34 : 10, lineYRef.current + 22, width / 2 - 35);
      context.textAlign = "right";
      if (labelRight) context.fillText(labelRight, width - 10, lineYRef.current + 22, width / 2 - 12);
      context.textAlign = "center";
      if (xLabel) context.fillText(xLabel, width / 2, lineYRef.current + 43, width - 20);
      if (yLabel) {
        context.beginPath();
        context.moveTo(34, 10);
        context.lineTo(34, lineYRef.current);
        context.stroke();
        context.save();
        context.translate(22, lineYRef.current / 2);
        context.rotate(-Math.PI / 2);
        context.fillText(yLabel, 0, 0, lineYRef.current - 16);
        context.restore();
      }

      // 3) Draw each item with wrapped text
      items.forEach(({label: item}, i) => {
        const x = boxCoordinatesRef.current[i];
        const yLabel = labelYPositionsRef.current[i];
        let { width: boxWidth, height: boxHeight } =
          boxDimensionsRef.current[i];

        // Wrap text using dynamic font size
        context.font = `${fontSize}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "top"; // Start from the top of the box
        context.fillStyle = "#000";

        const maxTextWidth = boxWidth - textBoxDefaultWidthPad * 2;
        const lines = wrapText(context, item, maxTextWidth);
        const padding = 6;

        const lineHeight = fontSize + 2; // Adjust line height based on font size
        const totalTextHeight = lines.length * lineHeight;

        // Auto-calculate box height based on text lines with reduced bottom padding
        boxHeight = Math.max(
          textBoxDefaultHeight + padding,
          totalTextHeight + padding
        );
        boxDimensionsRef.current[i].height = boxHeight;

        // Calculate starting Y-coordinate for vertically centered text
        const textStartY = yLabel - totalTextHeight / 2;

        // Box background and border - use custom color or default
        const boxColor = boxColors[i] || "#f0f0f0";
        context.fillStyle = boxColor;
        context.fillRect(
          x - boxWidth / 2,
          yLabel - boxHeight / 2,
          boxWidth,
          boxHeight
        );
        context.strokeStyle = i === activeLabel ? "#00665c" : "#000";
        context.lineWidth = i === activeLabel ? 3 : 1;
        context.strokeRect(
          x - boxWidth / 2,
          yLabel - boxHeight / 2,
          boxWidth,
          boxHeight
        );

        // Set text properties with dynamic font size
        context.font = `${fontSize}px Arial`;
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

    resizeAndDraw();
    const observer = new ResizeObserver(resizeAndDraw);
    observer.observe(canvas);

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
      if (e.button !== 0) return;
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

      for (let i = items.length - 1; i >= 0; i--) {
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
          setActiveLabel(i);
          isDraggingMarkerRef.current = true;
          draggedMarkerIndexRef.current = i;
          break;
        }

        // Check right handle
        if (isPointInRect(mouseX, mouseY, rightHandleRect)) {
          setActiveLabel(i);
          isResizingRightRef.current = true;
          resizingBoxIndexRef.current = i;
          break;
        }
        // Check box
        if (isPointInRect(mouseX, mouseY, boxRect)) {
          setActiveLabel(i);
          dragOffset.current = {x: mouseX - x, y: mouseY - yLabel};
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

      for (let i = items.length - 1; i >= 0; i--) {
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
        const index = draggedLabelIndexRef.current;
        const {width, height} = boxDimensionsRef.current[index];
        const minX = Math.min(width / 2 + (yLabel ? 34 : 0), renderedWidth / 2);
        const maxX = Math.max(minX, renderedWidth - width / 2);

        // Clamp the mouseX within [minX, maxX]
        const clampedX = Math.min(Math.max(mouseX - dragOffset.current.x, minX), maxX);

        // Update the x-coordinate with the clamped value
        boxCoordinatesRef.current[index] = clampedX;
        if (yLabel) {
          labelYPositionsRef.current[index] = Math.max(height / 2,
            Math.min(lineYRef.current - markerSize - height / 2, mouseY - dragOffset.current.y));
        }
        setFeedback("");
        draw(ctx, dpr);
      } else if (
        isDraggingMarkerRef.current &&
        draggedMarkerIndexRef.current !== null
      ) {
        // Move the text vertically (marker drags the text)
        const minY = textBoxDefaultHeight / 2 + 10;
        const maxY =
          lineYRef.current - markerSize - textBoxDefaultHeight / 2;
        const newY = Math.min(Math.max(mouseY, minY), maxY);
        labelYPositionsRef.current[draggedMarkerIndexRef.current] = newY;
        setFeedback("");
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

    // ------------------ Right Click Handler ------------------
    function handleContextMenu(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check which box was right-clicked
      for (let i = items.length - 1; i >= 0; i--) {
        const x = boxCoordinatesRef.current[i];
        const yLabel = labelYPositionsRef.current[i];
        const { width: boxWidth, height: boxHeight } =
          boxDimensionsRef.current[i];

        const boxRect = {
          x: x - boxWidth / 2,
          y: yLabel - boxHeight / 2,
          width: boxWidth,
          height: boxHeight,
        };

        if (isPointInRect(mouseX, mouseY, boxRect)) {
          handleRightClick(e, i);
          break;
        }
      }
    }

    // Add listeners
    canvas.addEventListener("pointerdown", handleMouseDown);
    canvas.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp);
    window.addEventListener("pointercancel", handleMouseUp);

    return () => {
      canvas.removeEventListener("pointerdown", handleMouseDown);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
      window.removeEventListener("pointercancel", handleMouseUp);
      observer.disconnect();
    };
  }, [items, text, xLabel, yLabel, fontSize, boxColors, layoutVersion, activeLabel]);

  // ------------------ Modal and "Add Item" Logic ------------------
  function moveLabel(x, y) {
    const oldX = boxCoordinatesRef.current[activeLabel];
    const oldY = labelYPositionsRef.current[activeLabel];
    if (oldX == null || oldY == null) return;
    const halfWidth = Math.min(boxDimensionsRef.current[activeLabel].width / 2, canvasRef.current.clientWidth / 2);
    const halfHeight = boxDimensionsRef.current[activeLabel].height / 2;
    boxCoordinatesRef.current[activeLabel] = Math.max(halfWidth,
      Math.min(canvasRef.current.clientWidth - halfWidth, oldX + x));
    labelYPositionsRef.current[activeLabel] = Math.max(halfHeight,
      Math.min(lineYRef.current - markerSize - halfHeight, oldY + y));
    setFeedback("");
    setLayoutVersion((previous) => previous + 1);
  }

  const openAddItemModal = () => {
    setIsModalOpen(true);
  };

  const handleAddItemSubmit = (userInput) => {
    if (userInput.trim()) {
      // Insert new item at the end (or in the middle, if desired)
      setItems((prev) => [...prev, {label: userInput.trim(), index: null}]);
    }
    setIsModalOpen(false);
  };

  const marking = [
    { name: "X-axis", label: xLabel, expected: axes.xRanks, positions: boxCoordinatesRef, direction: 1 },
    { name: "Y-axis", label: yLabel, expected: yLabel ? axes.yRanks : null, positions: labelYPositionsRef, direction: -1 },
  ].filter(({expected}) => itemCount > 0 && validRanks(expected, itemCount));

  function checkOrder() {
    setFeedback(marking.map(({name, label, expected, positions, direction}) => {
      const ranked = items.flatMap(({index}, i) => index === null ? [] : [{index, position: positions.current[i] * direction}])
        .sort((a, b) => a.position - b.position);
      const hasTies = ranked.some((item, i) => i > 0 && Math.abs(item.position - ranked[i - 1].position) < 1);
      const correct = ranked.filter(({index}, i) => expected[index] === i + 1).length;
      const result = hasTies ? "Separate labels at the same position, then check again." :
        `${correct} of ${expected.length} ranks correct.`;
      return `${label ? name + " (" + label + ")" : name} — ${result}`;
    }).join(" "));
  }

  return (
    <div className={styles.orderedLineContainer}>
      <div className={styles.addItemBar}>
        <button aria-label="Decrease font size" onClick={decreaseFontSize}>Font−</button>
        <button aria-label="Increase font size" onClick={increaseFontSize}>Font+</button>
        <button onClick={openAddItemModal}>Add Item</button>
        {items.length > 0 && <>
          <label>Timeline label{" "}<select value={activeLabel} onChange={(event) => setActiveLabel(Number(event.target.value))}>
            {items.map(({label}, index) => <option key={index} value={index}>{label}</option>)}
          </select></label>
          {[["left", -18, 0], ["right", 18, 0], ["up", 0, -18], ["down", 0, 18]].map(([name, x, y]) =>
            <button type="button" key={name} onClick={() => moveLabel(x, y)}>Move {name}</button>)}
          <button type="button" onClick={() => handleRightClick(null, activeLabel)}>Label colour</button>
          {marking.length > 0 && <button type="button" onClick={checkOrder}>Check ranks</button>}
        </>}
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

      {/* (3) The ColorPickerModal */}
      {colorModalOpen && (
        <ColorPickerModal
          title="Choose Background Color"
          initialColor={boxColors[selectedBoxIndex] || "#f0f0f0"}
          onSubmit={handleColorSubmit}
          onClose={() => {
            setColorModalOpen(false);
            setSelectedBoxIndex(null);
          }}
        />
      )}

      {/* (4) The Canvas */}
      <div className={styles.orderedLineCanvasContainer}>
        <canvas ref={canvasRef} className={styles.orderedLineCanvas} role="img"
          aria-label={[xLabel, yLabel].filter(Boolean).join(" by ") || "Timeline diagram"} />
      </div>
      {marking.length > 0 && <p role="status" className={styles.feedback}>{feedback}</p>}
    </div>
  );
}

export default OrderedLineCanvas;
