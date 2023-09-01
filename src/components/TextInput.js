import React, { useState } from "react";
import { useHistory, useLocation } from "react-router";
import LZString from "lz-string";

const compressText = (text) => {
  return LZString.compressToEncodedURIComponent(text);
};

const decompressText = (compressedText) => {
  return LZString.decompressFromEncodedURIComponent(compressedText);
};

function TextInput({ interactiveId, instructions, defaultval }) {
  const history = useHistory();
  const location = useLocation();
  const [text, setText] = useState(defaultval || "");

  const handleCompressAndNavigate = () => {
    const compressedText = compressText(text);
    const params = new URLSearchParams({
      id: interactiveId,
      txt: compressedText,
    });
    history.replace({ pathname: location.pathname, search: params.toString() });
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
