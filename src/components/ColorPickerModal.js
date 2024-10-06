import React, { useState } from "react";
import styles from "./ColorPickerModal.module.css";

function ColorPickerModal({ title, initialColor, onSubmit, onClose }) {
  const [colorValue, setColorValue] = useState(initialColor || "#FFFFFF");

  const handleSubmit = () => {
    onSubmit(colorValue);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <input
          type="color"
          value={colorValue}
          onChange={(e) => setColorValue(e.target.value)}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.submitButton} onClick={handleSubmit}>
            Submit
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ColorPickerModal;
