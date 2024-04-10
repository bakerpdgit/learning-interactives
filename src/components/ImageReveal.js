import React, { useState, useEffect, useRef } from "react";
import "./ImageReveal.css";

import { handleImageFileChange } from "../ImageUploads";
import { useEditContext } from "../EditContext";

const LOCAL_MARKER = "[local]";

function ImageReveal({ text }) {
  const [revealedBoxes, setRevealedBoxes] = useState([]);
  const [showInstruction, setShowInstruction] = useState(true);
  const imgRef = useRef(null);
  const { textData, setTextData } = useEditContext();

  const toggleBox = (index) => {
    if (!revealedBoxes.includes(index)) {
      setRevealedBoxes((prev) => [...prev, index]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const updateImageData = (data) => {
    setTextData(data);
  };

  return (
    <div className="image-reveal-container">
      <div style={{ position: "relative", display: "inline-block" }}>
        {(!text.includes(LOCAL_MARKER) || textData) && (
          <img
            ref={imgRef}
            src={text && !text.includes(LOCAL_MARKER) ? text : textData}
            className="image-reveal-image"
            alt="Reveal"
          />
        )}

        {text.includes(LOCAL_MARKER) && !textData && (
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

        {[...Array(25)].map((_, index) => (
          <div
            key={index}
            className={`image-box ${
              revealedBoxes.includes(index) ? "image-box-reveal" : "image-box"
            }`}
            style={{
              width: `${
                imgRef.current ? imgRef.current.clientWidth * 0.2 : "20%"
              }`,
              height: `${
                imgRef.current ? imgRef.current.clientHeight * 0.2 : "20%"
              }`,
              top: `${Math.floor(index / 5) * 20}%`,
              left: `${(index % 5) * 20}%`,
            }}
            onClick={
              revealedBoxes.includes(index) ? null : () => toggleBox(index)
            }
          >
            {"ABCDEFGHIJKLMNOPQRSTUVWXY"[index]}
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
