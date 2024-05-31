import "./TextInput.css";
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { useEditContext } from "../EditContext";
import LZString from "lz-string";
import { handleImageFileChange } from "../ImageUploads";

export const LOCAL_MARKER = "[local]";

const compressText = (text) => {
  return LZString.compressToEncodedURIComponent(text);
};

const decompressText = (compressedText) => {
  return LZString.decompressFromEncodedURIComponent(compressedText);
};

function TextInput({
  interactiveId,
  instructions,
  defaultVal,
  invalidTxt,
  showUpload,
}) {
  const history = useHistory();
  const location = useLocation();
  const [text, setText] = useState(defaultVal || "");
  const [url, setUrl] = useState("");
  const { enableEdit, setTextData, imageData, setImageData } = useEditContext();
  const [updating, setUpdating] = useState(false);

  const handleCompressAndNavigate = () => {
    // strip any whitespace from text
    let txtSubmitted = text.trim();

    // add on the url if it is present
    if (showUpload && url) {
      txtSubmitted += "\n" + url;
    }

    if (!txtSubmitted) {
      return;
    }

    setTextData(txtSubmitted);

    enableEdit();
    const params = new URLSearchParams({
      id: interactiveId,
      txt: compressText("localrun"),
    });
    history.replace({ pathname: location.pathname, search: params.toString() });
  };

  useEffect(() => {
    // if last line is [local] or begins with http:, https:, data: or file: then remove this line for the url
    const lines = defaultVal.split("\n");
    const lastLine = lines[lines.length - 1];
    if (
      lastLine === LOCAL_MARKER ||
      lastLine.startsWith("http:") ||
      lastLine.startsWith("https:") ||
      lastLine.startsWith("data:") ||
      lastLine.startsWith("file:")
    ) {
      lines.pop();
      setText(lines.join("\n"));
      setUrl(lastLine);
    } else {
      setText(defaultVal);
    }
  }, [defaultVal]); // Update internal state when defaultval changes

  const errorMessage = invalidTxt ? (
    <div className="error-message">
      The provided text is in an invalid format for this interactive, please
      correct below or return to this interactive via the homepage to start
      again with example input...
    </div>
  ) : null;

  // uploader requires a component to be rendered
  const updateImageData = (imageData) => {
    setImageData(imageData);
    setUrl(LOCAL_MARKER);
    setUpdating(false);
  };

  return (
    <>
      {errorMessage}
      <div className="textInputContainer">
        <div className="interactiveBox">
          <p>{instructions || "Provide some text for this interactive"}</p>
          <textarea
            disabled={updating}
            className="interactiveTextArea"
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          {showUpload && (
            <div className="imageUploadContainer">
              <div>Enter an image URL or browse to a local image file:</div>
              <input
                type="text"
                placeholder="Image URL"
                disabled={updating}
                className="imageTextArea"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              ></input>
              <input
                type="file"
                className="fileUpload"
                accept="image/*"
                onChange={(event) => {
                  setUpdating(true);
                  handleImageFileChange(event.target.files[0], updateImageData);
                }}
              />
              {url && (
                <img
                  src={url === "[local]" ? imageData : url}
                  alt="Thumbnail"
                  style={{ width: "100px", height: "auto" }}
                />
              )}
            </div>
          )}
          <button onClick={handleCompressAndNavigate} disabled={updating}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default TextInput;
export { compressText, decompressText };
