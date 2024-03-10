import React, { useState, useEffect } from "react";
import styles from "./DecompressText.module.css";
// Ensure decompressText is correctly imported
import { decompressText } from "./TextInput";

function DecompressText({ text }) {
  const [txt, setTxt] = useState("");

  useEffect(() => {
    // Extract 'txt' query parameter from the URL
    const url = new URL(text);
    const txtParam = url.searchParams.get("txt");

    if (txtParam) {
      // Decompress the extracted text
      const decompressedText = decompressText(txtParam);
      setTxt(decompressedText);
    }
  }, [text]); // Re-run this effect if the 'text' prop changes

  return (
    <>
      <h1 className={styles.interactiveTitle}>Decompress Text</h1>
      <p className={styles.instructions}>
        Here is the text you entered ready to paste back into your choice of
        interactive for further editing.
      </p>
      <div className={styles.textInputContainer}>
        <textarea
          className={styles.interactiveText}
          value={txt}
          readOnly
        ></textarea>
      </div>
    </>
  );
}

export default DecompressText;
