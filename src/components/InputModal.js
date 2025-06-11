import React, { useState, useEffect } from "react";
import styles from "./InputModal.module.css";

const InputModal = ({
  title,
  placeholder,
  value = "",
  onSubmit,
  onClose,
  multiLine = false,
  onDelete,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiLine) {
      handleSubmit();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{title}</h2>
        {multiLine ? (
          <textarea
            type="text"
            className={styles.inputArea}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <input
            type="text"
            className={styles.inputField}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.submitButton} onClick={handleSubmit}>
            Submit
          </button>
          {onDelete && (
            <button
              className={styles.deleteButton}
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              Delete
            </button>
          )}
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
