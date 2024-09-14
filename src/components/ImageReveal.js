import React, { useState, useEffect, useRef } from "react";
import "./ImageReveal.css";

import { handleImageFileChange } from "../ImageUploads";
import { useEditContext } from "../EditContext";
import { LOCAL_MARKER } from "./TextInput";

function ImageReveal({ text }) {
  const [revealedBoxes, setRevealedBoxes] = useState([]);
  const [showInstruction, setShowInstruction] = useState(true);
  const [gridSize, setGridSize] = useState(5);
  const [imageScale, setImageScale] = useState(1.0);
  const [url, setUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const imgRef = useRef(null);
  const { imageData, setImageData } = useEditContext();

  const toggleBox = (index) => {
    if (!revealedBoxes.includes(index)) {
      setRevealedBoxes((prev) => [...prev, index]);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      // reload on window resize to recalculate image dimensions
      window.location.reload();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [originalWidth, originalHeight, imageScale]);

  useEffect(() => {
    // Check if first line starts with OPTIONS:
    const optionsSet = text.startsWith("OPTIONS:") ? text.split("\n")[0] : null;
    const parsedOptions = optionsSet
      ? Object.fromEntries(
          optionsSet
            .slice(8)
            .split(",")
            .map((opt) => opt.split("=").map((s) => s.trim()))
        )
      : {};

    if (parsedOptions.gridsize) {
      setGridSize(parseInt(parsedOptions.gridsize, 10));
    }

    if (parsedOptions.scale) {
      // Add parsed scale as a float
      setImageScale(parseFloat(parsedOptions.scale));
    }

    // Extract the last line as the URL
    const lines = text.split("\n").filter((line) => line.trim());
    setUrl(lines[lines.length - 1]);
  }, [text]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle image load to get original dimensions
  const handleImageLoad = () => {
    if (imgRef.current) {
      setOriginalWidth(imgRef.current.naturalWidth);
      setOriginalHeight(imgRef.current.naturalHeight);
    }
  };

  // Update image dimensions when scale or original dimensions change
  useEffect(() => {
    if (originalWidth && originalHeight) {
      // Desired dimensions based on scale
      let desiredWidth = originalWidth * imageScale;
      let desiredHeight = originalHeight * imageScale;

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Define maximum allowed dimensions (subtracting margins/padding if any)
      const maxAllowedWidth = viewportWidth - 40; // Adjust as needed
      const maxAllowedHeight = viewportHeight - 150; // Adjust as needed

      // Calculate scaling factors to fit within viewport
      const widthScaleFactor = maxAllowedWidth / desiredWidth;
      const heightScaleFactor = maxAllowedHeight / desiredHeight;

      // Use the smaller scale factor to maintain aspect ratio
      let finalScaleFactor = Math.min(widthScaleFactor, heightScaleFactor, 1);

      // Adjust dimensions if they exceed maximum allowed dimensions
      if (finalScaleFactor < 1) {
        desiredWidth *= finalScaleFactor;
        desiredHeight *= finalScaleFactor;
      }

      setImageWidth(desiredWidth);
      setImageHeight(desiredHeight);
    }
  }, [imageScale, originalWidth, originalHeight]);

  const updateImageData = (data) => {
    setImageData(data);
  };

  return (
    <div className="image-reveal-container">
      <div
        style={{
          position: "relative",
          display: "inline-block",
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
        }}
      >
        {(!url.includes(LOCAL_MARKER) || imageData) && (
          <img
            ref={imgRef}
            src={url && !url.includes(LOCAL_MARKER) ? url : imageData}
            className="image-reveal-image"
            alt="Reveal"
            onLoad={handleImageLoad}
            style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
          />
        )}

        {url.includes(LOCAL_MARKER) && !imageData && (
          <div>
            The local image will need to be provided...
            <br />
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
          <p>Click boxes to reveal</p>
        </div>
      )}
    </div>
  );
}

export default ImageReveal;
