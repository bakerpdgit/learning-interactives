import React, { useState, useRef, useEffect } from "react";
import "./ImagePins.css"; // Make sure to create corresponding CSS
import { handleFileChange } from "../ImageUploads";
import { useEditContext } from "../EditContext";

function ImagePins({ text }) {
  const [pins, setPins] = useState([]);
  const [showInstruction, setShowInstruction] = useState(true);
  const [draggedLabelIndex, setDraggedLabelIndex] = useState(null);
  const { imageData, setImageData } = useEditContext();

  const imgRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const placePin = (e) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Add new pin to the array
    setPins((prevPins) => [
      ...prevPins,
      {
        x: Math.max(0, Math.min(x, rect.width - 20)),
        y: Math.max(0, Math.min(y, rect.height - 20)),
        label: "",
        labelX: x, // Initial Label X (same as pin X initially)
        labelY: y - 40, // Initial Label Y (slightly above pin Y)
      },
    ]);
  };

  const handleRightClick = (e, index) => {
    e.preventDefault(); // Prevent the browser context menu from opening
    setPins((prevPins) => prevPins.filter((_, i) => i !== index)); // Remove the pin at the clicked index
  };

  const handleDoubleClick = (index) => {
    const label = prompt("Enter a label for this pin:", pins[index].label);
    if (label !== null) {
      // Check if the user didn't press Cancel
      setPins(pins.map((pin, i) => (i === index ? { ...pin, label } : pin)));
    }
  };

  // Adjusted onDragStart to prevent default behavior
  const onDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", ""); // For Firefox compatibility
    setDraggedLabelIndex(index);
  };

  // Moved onDragOver to the image-pin-container
  const onDragOver = (e) => {
    e.preventDefault(); // This is crucial for allowing the drop
  };

  const onDrop = (e) => {
    if (!imgRef.current || draggedLabelIndex === null) return;

    const rect = imgRef.current.getBoundingClientRect();
    let labelX = e.clientX - rect.left;
    let labelY = e.clientY - rect.top;

    // Update only the label's position
    setPins(
      pins.map((pin, i) =>
        i === draggedLabelIndex
          ? { ...pin, labelX: labelX, labelY: labelY }
          : pin
      )
    );

    setDraggedLabelIndex(null); // Reset after drop
  };

  const updateImageData = (data) => {
    setImageData(data);
  };

  return (
    <div className="image-pin-maincontainer">
      <div
        className="image-pin-container"
        draggable="false" // Prevent the container from being draggable
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {(text !== "[local]" || imageData) && (
          <img
            ref={imgRef}
            className="image-pin-image"
            alt="Highlight"
            onClick={placePin}
            draggable="false"
            src={text && text !== "[local]" ? text : imageData}
            crossOrigin="anonymous"
          />
        )}

        {text === "[local]" && !imageData && (
          <div>
            The local image will need to be provided...
            <br />{" "}
            <input
              type="file"
              className="fileUpload"
              accept="image/*"
              onChange={(event) =>
                handleFileChange(event.target.files[0], updateImageData)
              }
            />
          </div>
        )}

        {pins.map((pin, index) => (
          <React.Fragment key={`pinlabel-${index}`}>
            <div
              key={`pin-${index}`}
              className="pin"
              style={{ left: `${pin.x - 10}px`, top: `${pin.y - 10}px` }}
              onContextMenu={(e) => handleRightClick(e, index)}
              onDoubleClick={() => handleDoubleClick(index)}
            ></div>
            {pin.label && (
              <div
                className="pin-label"
                style={{ left: `${pin.labelX}px`, top: `${pin.labelY}px` }} // Use labelX and labelY for positioning
                draggable="true"
                onDragStart={(e) => onDragStart(e, index)}
              >
                {pin.label}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {showInstruction && (
        <div className="image-pin-instruction">
          <h1>Image Pins</h1>
          <p>
            click to drop pins, right-click to delete pin, double-click to add a
            label; drag labels to reposition.
          </p>
        </div>
      )}
    </div>
  );
}

export default ImagePins;
