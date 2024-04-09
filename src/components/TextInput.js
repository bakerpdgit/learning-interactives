import "./TextInput.css";
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { useEditContext } from "../EditContext";
import LZString from "lz-string";

const compressText = (text) => {
  return LZString.compressToEncodedURIComponent(text);
};

const decompressText = (compressedText) => {
  return LZString.decompressFromEncodedURIComponent(compressedText);
};

function TextInput({
  interactiveId,
  instructions,
  defaultval,
  invalidTxt,
  disabled,
}) {
  const history = useHistory();
  const location = useLocation();
  const [text, setText] = useState(defaultval || "");
  const { enableEdit } = useEditContext();

  const handleCompressAndNavigate = () => {
    const compressedText = compressText(text);
    enableEdit();
    const params = new URLSearchParams({
      id: interactiveId,
      txt: compressedText,
    });
    history.replace({ pathname: location.pathname, search: params.toString() });
  };

  useEffect(() => {
    setText(defaultval);
  }, [defaultval]); // Update internal state when defaultval changes

  const errorMessage = invalidTxt ? (
    <div className="error-message">
      The provided text is in an invalid format for this interactive, please
      correct below or return to this interactive via the homepage to start
      again with example input...
    </div>
  ) : null;
  return (
    <>
      {errorMessage}
      <div className="textInputContainer">
        <div className="interactiveBox">
          <p>{instructions || "Provide some text for this interactive"}</p>
          <textarea
            disabled={disabled}
            className="interactiveTextArea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: "100%", height: "60%", padding: "20px" }}
            maxLength="21000"
          ></textarea>
          <button onClick={handleCompressAndNavigate} disabled={disabled}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default TextInput;
export { decompressText };
