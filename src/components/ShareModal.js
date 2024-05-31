// ShareModal.js
import React from "react";
import styles from "./ShareModal.module.css";

const ShareModal = ({ url, onClose }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Share URL</h2>
        <textarea
          readOnly
          value={url}
          className={styles.shareTextArea}
        ></textarea>
        <div>
          <button className={styles.copyButton} onClick={handleCopy}>
            Copy
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
