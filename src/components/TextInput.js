import React, { useState } from "react";
import LZString from "lz-string";

const compressText = (text) => {
  return LZString.compressToEncodedURIComponent(text);
};

const decompressText = (compressedText) => {
  return LZString.decompressFromEncodedURIComponent(compressedText);
};

function TextInput({ interactiveId, instructions, defaultval }) {
  const [text, setText] = useState(defaultval || "");

  const handleCompressAndNavigate = () => {
    const compressedText = compressText(text);
    window.location.href = `/interactive/${interactiveId}?txt=${compressedText}`;
  };

  return (
    <div className="interactiveContainer">
      <div className="interactiveBox">
        <p>{instructions || "Provide some text for this interactive"}</p>
        <textarea
          className="interactiveTextArea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", height: "150px", padding: "20px" }}
        ></textarea>
        <button onClick={handleCompressAndNavigate}>Submit</button>
      </div>
    </div>
  );
}

export default TextInput;
export { decompressText };
