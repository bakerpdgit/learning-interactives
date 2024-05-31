import React, { useState, useEffect, useRef } from "react";
import "./ImageReveal.css";

import { handleImageFileChange } from "../ImageUploads";
import { useEditContext } from "../EditContext";
import { LOCAL_MARKER } from "./TextInput";

function ImageReveal({ text }) {
  const [revealedBoxes, setRevealedBoxes] = useState([]);
  const [showInstruction, setShowInstruction] = useState(true);
  const [gridSize, setGridSize] = useState(5);
  const [url, setUrl] = useState("");
  const imgRef = useRef(null);
  const { imageData, setImageData } = useEditContext();

  const toggleBox = (index) => {
    if (!revealedBoxes.includes(index)) {
      setRevealedBoxes((prev) => [...prev, index]);
    }
  };

  useEffect(() => {
    // check if first line starts with OPTIONS:
    // if so parse the gridsize name=val option if present
    // and set the number of boxes to the gridsize
    const optionsSet = text.startsWith("OPTIONS:") ? text.split("\n")[0] : null;
    const parsedOptions = optionsSet
      ? Object.fromEntries(
          optionsSet
            .slice(8)
            .split(",")
            .map((opt) => opt.split("="))
        )
      : {};

    if (parsedOptions.gridsize) {
      setGridSize(parsedOptions.gridsize);
    }

    // extract the last line as the url
    const lines = text.split("\n");
    setUrl(lines[lines.length - 1]);
  }, [text]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const updateImageData = (data) => {
    setImageData(data);
  };

  return (
    <div className="image-reveal-container">
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {(!url.includes(LOCAL_MARKER) || imageData) && (
          <img
            ref={imgRef}
            src={url && !url.includes(LOCAL_MARKER) ? url : imageData}
            className="image-reveal-image"
            alt="Reveal"
          />
        )}

        {url.includes(LOCAL_MARKER) && !imageData && (
          <div>
            The local image will need to be provided...
            <br />{" "}
            <input
              type="file"
              className="fileUpload"
              accept="image/*"
              onChange={(event) =>
                handleImageFileChange(event.target.files[0], updateImageData)
              }
            />
          </div>
        )}

        {[...Array(gridSize ** 2)].map((_, index) => (
          <div
            key={index}
            className={`image-box ${
              revealedBoxes.includes(index) ? "image-box-reveal" : "image-box"
            }`}
            style={{
              width: `${100 / gridSize + 0.1}%`,
              height: `${100 / gridSize + 0.1}%`,
              top: `${Math.floor(index / gridSize) * (100 / gridSize)}%`,
              left: `${(index % gridSize) * (100 / gridSize)}%`,
            }}
            onClick={
              revealedBoxes.includes(index) ? null : () => toggleBox(index)
            }
          >
            {index + 1}
          </div>
        ))}
      </div>
      {showInstruction && (
        <div className="image-reveal-instruction">
          <h1>Image Reveal</h1>
          <p>click boxes to reveal</p>
        </div>
      )}
    </div>
  );
}

export default ImageReveal;
