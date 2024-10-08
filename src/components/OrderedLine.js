import React, { useRef, useEffect } from "react";
import "./OrderedLine.css";

function OrderedLineCanvas({ text }) {
  const canvasRef = useRef(null);
  const boxCoordinatesRef = useRef([]);
  const labelYPositionsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let isDraggingLabel = false;
    let isDraggingMarker = false;
    let draggedLabelIndex = null;
    let draggedMarkerIndex = null;

    const setup = () => {
      const items = text.split("\n").filter((item) => item);
      const labels = items[0].split("-");
      items.shift();

      // Sort items randomly
      items.sort(() => Math.random() - 0.5);

      // Handle window resize
      const handleResize = () => {
        // Update canvas size
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);

        // Recalculate positions
        initializePositions();
        draw();
      };

      window.addEventListener("resize", handleResize);

      const textBoxHeight = 60;
      const padding = 5;
      const markerSize = 10;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);

      const lineY = (canvas.height * 0.92) / dpr;

      const initializePositions = () => {
        boxCoordinatesRef.current = items.map(
          (_, i) => ((i + 1) * canvas.width) / (items.length + 1) / dpr
        );
        // Initialize label y-positions
        labelYPositionsRef.current = items.map((_, i) => {
          const minY = textBoxHeight / 2 + 10;
          const maxY = lineY - markerSize - textBoxHeight / 2 - 10;
          return Math.random() * (maxY - minY) + minY;
        });
      };

      initializePositions();

      // Function to check if a point is inside a rectangle
      function isPointInRect(x, y, rect) {
        return (
          x >= rect.x &&
          x <= rect.x + rect.width &&
          y >= rect.y &&
          y <= rect.y + rect.height
        );
      }

      function draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        // Draw ordered line
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, lineY);
        ctx.lineTo(canvas.width / dpr - 10, lineY);
        ctx.stroke();

        // Draw line labels
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText(labels[0], 10, lineY + 20);
        ctx.textAlign = "right";
        ctx.fillText(labels[1], canvas.width / dpr - 10, lineY + 20);

        // Draw textboxes and vertical lines
        for (let i = 0; i < items.length; i++) {
          ctx.font = "16px Arial";
          const textWidth = ctx.measureText(items[i]).width;
          const boxWidth = textWidth + 2 * padding;

          const x = boxCoordinatesRef.current[i];
          const yLabel = labelYPositionsRef.current[i];

          // Draw the draggable box (label)
          ctx.fillStyle = "#f0f0f0";
          ctx.fillRect(
            x - boxWidth / 2,
            yLabel - textBoxHeight / 2,
            boxWidth,
            textBoxHeight
          );
          ctx.strokeRect(
            x - boxWidth / 2,
            yLabel - textBoxHeight / 2,
            boxWidth,
            textBoxHeight
          );
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          ctx.fillText(items[i], x, yLabel);

          // Draw the vertical line
          ctx.beginPath();
          ctx.moveTo(x, yLabel + textBoxHeight / 2);
          ctx.lineTo(x, lineY - markerSize / 2);
          ctx.stroke();

          // Draw the marker at the end of the vertical line (marker stays on the ordered line)
          ctx.fillStyle = "#000";
          ctx.fillRect(
            x - markerSize / 2,
            lineY - markerSize / 2,
            markerSize,
            markerSize
          );
        }
      }

      function handleMouseDown(e) {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        for (let i = 0; i < items.length; i++) {
          const x = boxCoordinatesRef.current[i];
          const yLabel = labelYPositionsRef.current[i];

          // Check if mouse is over marker
          const markerRect = {
            x: x - markerSize / 2,
            y: lineY - markerSize / 2,
            width: markerSize,
            height: markerSize,
          };

          if (isPointInRect(mouseX, mouseY, markerRect)) {
            isDraggingMarker = true;
            draggedMarkerIndex = i;
            break;
          }

          // Check if mouse is over label
          ctx.font = "16px Arial";
          const textWidth = ctx.measureText(items[i]).width;
          const boxWidth = textWidth + 2 * padding;

          const rect = {
            x: x - boxWidth / 2,
            y: yLabel - textBoxHeight / 2,
            width: boxWidth,
            height: textBoxHeight,
          };

          if (isPointInRect(mouseX, mouseY, rect)) {
            isDraggingLabel = true;
            draggedLabelIndex = i;
            break;
          }
        }
      }

      function handleMouseMove(e) {
        if (isDraggingLabel && draggedLabelIndex !== null) {
          const mouseX = e.clientX - canvas.getBoundingClientRect().left;
          boxCoordinatesRef.current[draggedLabelIndex] = mouseX;
          draw();
        } else if (isDraggingMarker && draggedMarkerIndex !== null) {
          const mouseY = e.clientY - canvas.getBoundingClientRect().top;

          // Constrain the label y-position between minY and maxY
          const minY = textBoxHeight / 2 + 10;
          const maxY = lineY - markerSize - textBoxHeight / 2 - 50;

          const newY = Math.min(
            Math.max(mouseY - textBoxHeight / 2, minY),
            maxY
          );

          labelYPositionsRef.current[draggedMarkerIndex] =
            newY + textBoxHeight / 2;

          draw();
        }
      }

      function handleMouseUp() {
        isDraggingLabel = false;
        draggedLabelIndex = null;
        isDraggingMarker = false;
        draggedMarkerIndex = null;
      }

      draw();

      canvas.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("resize", handleResize);
      };
    };

    const cleanup = setup();

    return () => {
      cleanup();
    };
  }, [text]);

  return (
    <div className="orderedLineCanvasContainer">
      <canvas ref={canvasRef} id="orderedLineCanvas"></canvas>
    </div>
  );
}

export default OrderedLineCanvas;
