import React, { useState, useRef, useEffect, useCallback } from "react";
import InputModal from "./InputModal";
import styles from "./Fishbone.module.css";

function Fishbone({ text }) {
  const canvasRef = useRef(null);
  const [coords, setCoords] = useState({});
  const [headCoords, setHeadCoords] = useState({ x: 0, w: 0 });

  // Initialize branches state from the text prop
  const [branches, setBranches] = useState(() => {
    const lines = text.split("\n");
    const branchTitles = lines.slice(1); // Get all lines after the first for branch titles
    return branchTitles
      .filter((bt) => bt.trim() !== "") // Filter out any empty lines intended as branches
      .map((branchTitle, index) => ({
        id: Date.now() + index, // Generate a simple unique ID
        title: branchTitle.trim(),
        labels: [],
        labelShift: 0,
      }));
  });
  const [fontSize, setFontSize] = useState(1);
  const [spacing, setSpacing] = useState(160);
  const [modalData, setModalData] = useState({
    show: false,
    title: "",
    callback: null,
    value: "",
    deleteCallback: null,
  });

  const title = text.split("\n")[0];

  const drawDiagram = useCallback(() => {
    // add slight delay on the redraw to ensure canvas is ready

    window.setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return; // Guard clause if canvas is not yet available
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;

      // Calculate adaptive headWidth
      const calculatedHeadWidth = Math.max(170, canvas.width / 5);

      // headX is the x-coordinate of the left edge of the head box
      const headX = canvas.width - calculatedHeadWidth - 10; // 10px padding from the right edge

      ctx.lineWidth = 4;
      ctx.strokeStyle = "#4c7062";

      ctx.beginPath();
      ctx.moveTo(10, centerY);
      // Draw spine up to the left edge of the head box area
      ctx.lineTo(headX, centerY);
      ctx.stroke();

      // branches
      const branchSpacing = spacing;
      const branchLength = canvas.height * 0.45;
      const dx = branchLength * Math.SQRT1_2; // cos 45deg
      const dy = branchLength * Math.SQRT1_2; // sin 45deg
      const newCoords = {};

      ctx.lineWidth = 2;
      branches.forEach((br, index) => {
        const pairIndex = Math.floor(index / 2);
        // Branches start relative to headX, which is the left edge of the head box
        const side = index % 2 === 0 ? "top" : "bottom"; // Alternate sides for branches
        const startX = headX - (pairIndex + 1) * branchSpacing;
        const startY = centerY;
        const endX = startX - dx;
        const endY = startY + (side === "top" ? -dy : dy);

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
      // Update headCoords with the new adaptive width and calculated positions
      setHeadCoords({
        x: headX,
        w: calculatedHeadWidth,
      });
    }, 0); // Delay to ensure canvas is ready
  }, [branches, spacing, canvasRef, setCoords, setHeadCoords]);

  // handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (canvas) {
        // Set canvas drawing surface size to match its CSS-defined element size
        // Ensure the parent container and canvas CSS are set up for flex-grow or specific height.
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawDiagram();
      }
    };
    // Initial call to set size
    handleResize();

    const observer = new ResizeObserver(handleResize);
    if (canvas) observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawDiagram, fontSize]);

  const openModal = (title, callback, value = "", deleteCallback = null) => {
    setModalData({ show: true, title, callback, value, deleteCallback });
  };

  const handleAddBranch = () => {
    openModal("Branch title", (value) => {
      if (!value.trim()) return;
      setBranches((prev) => [
        ...prev,
        { id: Date.now(), title: value, labels: [], labelShift: 0 }, // Initialize labelShift
      ]);
    });
  };

  const handleAddLabel = (branchId) => {
    openModal("Label", (value) => {
      if (!value.trim()) return;
      setBranches((prev) =>
        prev.map((b) =>
          b.id === branchId
            ? {
                ...b,
                labels: [...b.labels, { id: Date.now(), text: value }],
                labelShift: 0, // Reset labelShift to 0
              }
            : b
        )
      );
    });
  };

  const handleShiftLabels = (branchId) => {
    const dy = (canvasRef.current.height * Math.SQRT1_2) / 16;
    setBranches((prevBranches) =>
      prevBranches.map((branch) =>
        branch.id === branchId
          ? { ...branch, labelShift: branch.labelShift + dy }
          : branch
      )
    );
  };

  const handleEditBranch = (branchId, currentTitle) => {
    openModal(
      "Edit branch",
      (value) => {
        if (!value.trim()) return;
        setBranches((prev) =>
          prev.map((b) => (b.id === branchId ? { ...b, title: value } : b))
        );
      },
      currentTitle,
      () => removeBranch(branchId)
    );
  };

  const handleEditLabel = (branchId, labelId, currentText) => {
    openModal(
      "Edit label",
      (value) => {
        if (!value.trim()) return;
        setBranches((prev) =>
          prev.map((b) =>
            b.id === branchId
              ? {
                  ...b,
                  labels: b.labels.map((l) =>
                    l.id === labelId ? { ...l, text: value } : l
                  ),
                }
              : b
          )
        );
      },
      currentText,
      () => removeLabel(branchId, labelId)
    );
  };

  const removeBranch = (branchId) => {
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
  };

  const removeLabel = (branchId, labelId) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? { ...b, labels: b.labels.filter((l) => l.id !== labelId) }
          : b
      )
    );
  };

  const increaseFont = () => setFontSize((f) => f + 0.1);
  const decreaseFont = () => setFontSize((f) => Math.max(0.5, f - 0.1));

  const titleFont = fontSize + 0.2;
  const branchFont = fontSize + 0.1;

  return (
    <div className={styles.container}>
      {modalData.show && (
        <InputModal
          title={modalData.title}
          value={modalData.value}
          onSubmit={modalData.callback}
          onDelete={modalData.deleteCallback}
          onClose={() => setModalData({ ...modalData, show: false })}
        />
      )}
      <div className={styles.controls}>
        <button onClick={handleAddBranch}>Add Branch</button>
        <button onClick={() => setSpacing((s) => s + 20)}>Space ↑</button>
        <button onClick={() => setSpacing((s) => Math.max(40, s - 20))}>
          Space ↓
        </button>
        <button onClick={increaseFont}>Font ↑</button>
        <button onClick={decreaseFont}>Font ↓</button>
      </div>
      <div className={styles.canvasScroll} tabIndex={0} role="region" aria-label="Fishbone diagram canvas">
        <div className={styles.canvasWrapper}
          style={{ minWidth: Math.max(420, Math.ceil(branches.length / 2) * spacing + 410),
            minHeight: Math.ceil(400 * Math.max(1, fontSize)) }}>
          <canvas ref={canvasRef} className={styles.canvas}></canvas>
          {headCoords.w > 0 && (
            <div
              className={styles.headTitle}
              style={{
                fontSize: `${titleFont}em`,
                left: headCoords.x,
                width: headCoords.w,
              }}
            >
              {title}
            </div>
          )}
          {branches.map((br, idx) => {
            const c = coords[br.id];
            if (!c) {
              return null;
            }
            const side = idx % 2 === 0 ? "top" : "bottom"; // Alternate sides for branches
            const labels = br.labels || [];

            const branchLength = canvasRef.current
              ? canvasRef.current.offsetHeight * 0.45
              : 100; // Default to avoid NaN

            return (
              <React.Fragment key={br.id}>
                <div className={side === "top" ? styles.branchTop : styles.branchBottom}
                  style={{ left: c.endX, top: c.endY, fontSize: `${branchFont}em` }}>
                  <button type="button" className={styles.branchTitle}
                    aria-label={"Edit branch " + br.title}
                    onClick={() => handleEditBranch(br.id, br.title)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      handleEditBranch(br.id, br.title);
                    }}>
                    {br.title}
                  </button>
                  <div className={styles.branchButtons}>
                    <button type="button" aria-label={"Add label to " + br.title}
                      onClick={() => handleAddLabel(br.id)}>+</button>
                    <button type="button" aria-label={"Shift labels on " + br.title}
                      onClick={() => handleShiftLabels(br.id)}>{side === "bottom" ? "↓" : "↑"}</button>
                  </div>
                </div>
                {labels.map((lab, labelIdx) => {
                  const numLabels = labels.length;
                  // Ensure numLabels is not zero before division, though map shouldn't run for empty array.
                  const t_original =
                    numLabels > 0 ? (labelIdx + 0.5) / numLabels : 0;

                  const pixelShift = br.labelShift || 0;
                  // Ensure positive result for modulo, then ensure it's within [0, branchLength)
                  const effectivePixelOffsetOnBranch =
                    ((pixelShift % branchLength) + branchLength) % branchLength;
                  const t_offset_due_to_shift =
                    branchLength > 0
                      ? effectivePixelOffsetOnBranch / branchLength
                      : 0;

                  let effective_t = t_original + t_offset_due_to_shift;
                  effective_t = effective_t - Math.floor(effective_t); // Ensure t is in [0, 1)

                  const lx_on_line = c.startX + (c.endX - c.startX) * effective_t;
                  const ly_on_line = c.startY + (c.endY - c.startY) * effective_t;

                  return (
                    <button type="button"
                      key={lab.id}
                      aria-label={"Edit label " + lab.text}
                      onClick={() => handleEditLabel(br.id, lab.id, lab.text)}
                      className={
                        side === "top" ? styles.labelUp : styles.labelDown
                      }
                      style={{
                        left: lx_on_line,
                        top: ly_on_line,
                        fontSize: `${fontSize}em`,
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleEditLabel(br.id, lab.id, lab.text);
                      }}
                    >
                      {lab.text}
                      <span
                        className={styles.labelLine}
                        style={{
                          left: -20,
                          top: "50%",
                          width: 20,
                        }}
                      />
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Fishbone;
