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

        <div className={styles.noteBox}>
          <div className={styles.noteIcon}>📝</div>
          <div className={styles.noteContent}>
            <p>
              Note: If you download the activity file and host it on a public
              GitHub then you can link students to it directly via a jsDelivr
              link:
              <br />
              https://www.classinteractives.co.uk?id=&lt;IDNUMBER&gt;
              <br />
              &txt=https%3a%2fcdn.jsdelivr.net%2fgh%2f&lt;GITUSERNAME&gt;/&lt;REPO@BRANCH&gt;&lt;ESCAPEDPATH/TO/FILE&gt;
              <br />
              Here is a working example:
              <br />
              <a href="http://www.classinteractives.co.uk?id=19&txt=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fbakerpdgit%2Flearning-interactives%40main%2Fsrc%2Fexamples%2FExampleInteractiveFile.txt">
                http://www.classinteractives.co.uk?id=19&txt=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fbakerpdgit%2Flearning-interactives%40main%2Fsrc%2Fexamples%2FExampleInteractiveFile.txt
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
