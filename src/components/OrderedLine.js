import React, { useRef, useEffect } from "react";
import "./OrderedLine.css";

function OrderedLineCanvas({ text }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let setup = () => {
      window.addEventListener("resize", () => setup());
      const items = text.split("\n").filter((item) => item);
      const labels = items[0].split("-");
      items.shift();
      // sort items randomly
      items.sort(() => Math.random() - 0.5);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const textBoxHeight = 60;
      const padding = 10;
      const markerSize = 10;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const lineY = (canvas.height * 0.85) / dpr;
      ctx.scale(dpr, dpr);

      let boxCoordinates = items.map(
        (_, i) => ((i + 1) * canvas.width) / (items.length + 1) / dpr
      );

      let isDragging = false;
      let draggedBoxIndex = null;

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
        const boxVerticalSpacing =
          (lineY - textBoxHeight - markerSize) / (items.length + 1);
        for (let i = 0; i < items.length; i++) {
          ctx.font = "16px Arial";
          const textWidth = ctx.measureText(items[i]).width;
          const boxWidth = textWidth + 2 * padding;

          const x = boxCoordinates[i];
          const y = (i + 1) * boxVerticalSpacing;

          // Draw the draggable box
          ctx.fillStyle = "#f0f0f0";
          ctx.fillRect(
            x - boxWidth / 2,
            y - textBoxHeight / 2,
            boxWidth,
            textBoxHeight
          );
          ctx.strokeRect(
            x - boxWidth / 2,
            y - textBoxHeight / 2,
            boxWidth,
            textBoxHeight
          );
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          ctx.fillText(items[i], x, y);

          // Draw the vertical line
          ctx.beginPath();
          ctx.moveTo(x, y + textBoxHeight / 2);
          ctx.lineTo(x, lineY - markerSize);
          ctx.stroke();

          // Draw the marker at the end of the vertical line
          ctx.fillStyle = "#000";
          ctx.fillRect(
            x - markerSize / 2,
            lineY - markerSize,
            markerSize,
            markerSize
          );

          // Draw the marker at the end of the vertical line
          ctx.fillStyle = "#000";
          ctx.fillRect(
            x - markerSize / 2,
            lineY - markerSize,
            markerSize,
            markerSize
          );
        }
      }

      function handleMouseDown(e) {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        const boxVerticalSpacing =
          (lineY - textBoxHeight - markerSize) / (items.length + 1);
        for (let i = 0; i < items.length; i++) {
          ctx.font = "16px Arial";
          const textWidth = ctx.measureText(items[i]).width;
          const boxWidth = textWidth + 2 * padding;

          const x = boxCoordinates[i];
          const y = (i + 1) * boxVerticalSpacing;
          const rect = {
            x: x - boxWidth / 2,
            y: y - textBoxHeight / 2,
            width: boxWidth,
            height: textBoxHeight,
          };

          if (isPointInRect(mouseX, mouseY, rect)) {
            isDragging = true;
            draggedBoxIndex = i;
            break;
          }
        }
      }

      function handleMouseMove(e) {
        if (!isDragging || draggedBoxIndex === null) return;

        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        boxCoordinates[draggedBoxIndex] = mouseX;

        draw();
      }

      function handleMouseUp() {
        isDragging = false;
        draggedBoxIndex = null;
      }

      draw();

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
      };
    };

    return setup();
  }, [text]);

  return (
    <div className="orderedLineCanvasContainer">
      <h1>Ordered Line</h1>
      <canvas ref={canvasRef} id="orderedLineCanvas"></canvas>
    </div>
  );
}

export default OrderedLineCanvas;
