import React, { useState, useRef, useEffect } from "react";
import InputModal from "./InputModal";
import styles from "./Fishbone.module.css";

function Fishbone({ text }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [coords, setCoords] = useState({});
  const [headCoords, setHeadCoords] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [branches, setBranches] = useState([]);
  const [fontSize, setFontSize] = useState(1);
  const [spacing, setSpacing] = useState(100);
  const [modalData, setModalData] = useState({ show: false, title: "", callback: null });

  const title = text.split("\n")[0];

  const drawDiagram = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerY = canvas.height / 2;
    const headWidth = 120;
    const headHeight = 50;
    const headX = canvas.width - headWidth - 10;
    const headY = centerY - headHeight / 2;

    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.moveTo(10, centerY);
    ctx.lineTo(headX, centerY);
    ctx.stroke();

    ctx.fillStyle = "#add8e6";
    ctx.fillRect(headX, headY, headWidth, headHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(headX, headY, headWidth, headHeight);

    // branches
    const branchSpacing = spacing;
    const branchLength = canvas.height * 0.35;
    const dx = branchLength * Math.SQRT1_2; // cos 45deg
    const dy = branchLength * Math.SQRT1_2; // sin 45deg
    const newCoords = {};

    ctx.lineWidth = 2;
    branches.forEach((br, index) => {
      const pairIndex = Math.floor(index / 2);
      const startX = headX - (pairIndex + 1) * branchSpacing;
      const startY = centerY;
      const endX = startX - dx;
      const endY = startY + (br.side === "top" ? -dy : dy);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      newCoords[br.id] = {
        startX,
        startY,
        endX,
        endY,
        midX: (startX + endX) / 2,
        midY: (startY + endY) / 2,
      };
    });
    setCoords(newCoords);
    setHeadCoords({ x: headX, y: headY, w: headWidth, h: headHeight });
  };

  // handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = window.innerHeight * 0.6;
        drawDiagram();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    drawDiagram();
  }, [branches, fontSize, spacing]);

  const openModal = (title, callback) => {
    setModalData({ show: true, title, callback });
  };

  const handleAddBranch = () => {
    openModal("Branch title", (value) => {
      if (!value.trim()) return;
      const side = branches.length % 2 === 0 ? "top" : "bottom";
      setBranches((prev) => [...prev, { id: Date.now(), title: value, side, labels: [] }]);
    });
  };

  const handleAddLabel = (branchId) => {
    openModal("Label", (value) => {
      if (!value.trim()) return;
      setBranches((prev) =>
        prev.map((b) =>
          b.id === branchId ? { ...b, labels: [...b.labels, { id: Date.now(), text: value }] } : b
        )
      );
    });
  };

  const removeBranch = (branchId) => {
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
  };

  const removeLabel = (branchId, labelId) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId ? { ...b, labels: b.labels.filter((l) => l.id !== labelId) } : b
      )
    );
  };

  const increaseFont = () => setFontSize((f) => f + 0.1);
  const decreaseFont = () => setFontSize((f) => Math.max(0.5, f - 0.1));

  const titleFont = fontSize + 0.2;
  const branchFont = fontSize + 0.1;

  return (
    <div ref={containerRef} className={styles.container}>
      {modalData.show && (
        <InputModal
          title={modalData.title}
          value=""
          onSubmit={modalData.callback}
          onClose={() => setModalData({ show: false })}
        />
      )}
      <div className={styles.controls}>
        <button onClick={handleAddBranch}>Add Branch</button>
        <button onClick={() => setSpacing((s) => s + 20)}>space up</button>
        <button onClick={() => setSpacing((s) => Math.max(40, s - 20))}>space down</button>
        <button onClick={increaseFont}>increase font-size</button>
        <button onClick={decreaseFont}>decrease font-size</button>
      </div>
      <canvas ref={canvasRef} className={styles.canvas}></canvas>
      {headCoords.w > 0 && (
        <div
          className={styles.headTitle}
          style={{
            fontSize: `${titleFont}em`,
            left: headCoords.x + headCoords.w / 2,
            top: headCoords.y + headCoords.h / 2,
          }}
        >
          {title}
        </div>
      )}
      {branches.map((br) => {
        const c = coords[br.id] || {};
        const labels = br.labels || [];
        return (
          <React.Fragment key={br.id}>
            <div
              className={styles.branchTitle}
              style={{
                left: c.endX,
                top: c.endY,
                fontSize: `${branchFont}em`,
                transform: "translate(-50%, -50%)",
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                removeBranch(br.id);
              }}
            >
              {br.title}
            </div>
            <div
              className={styles.addLabel}
              style={{
                left: c.endX,
                top: br.side === "top" ? c.endY - 20 : c.endY + 20,
                fontSize: `${branchFont}em`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => handleAddLabel(br.id)}
            >
              [+]
            </div>
            {labels.map((lab, idx) => {
              const t = (idx + 1) / (labels.length + 1);
              const lx = c.startX - (c.startX - c.endX) * t + 10;
              const ly = c.startY + (c.endY - c.startY) * t;
              return (
                <div
                  key={lab.id}
                  className={styles.label}
                  style={{
                    left: lx,
                    top: ly,
                    fontSize: `${fontSize}em`,
                    transform: "translate(0, -50%)",
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    removeLabel(br.id, lab.id);
                  }}
                >
                  {lab.text}
                  <div
                    className={styles.labelLine}
                    style={{
                      left: -10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 10,
                    }}
                  />
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Fishbone;

