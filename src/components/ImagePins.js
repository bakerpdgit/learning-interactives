import React, { useState, useRef, useEffect } from "react";
import "./ImagePins.css"; // Make sure to create corresponding CSS

function ImagePins({ text }) {
  const [pins, setPins] = useState([]);
  const [showInstruction, setShowInstruction] = useState(true);

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

  return (
    <div className="image-pin-maincontainer">
      <div
        className="image-pin-container"
        draggable="false" // Prevent the container from being draggable
      >
        <img
          ref={imgRef}
          src={text}
          className="image-pin-image"
          alt="Highlight"
          onClick={placePin}
          draggable="false"
        />

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
                key={`label-${index}`}
                className="pin-label"
                style={{
                  position: "absolute",
                  left: `${pin.x}px`,
                  top: `${pin.y - 35}px`, // Adjust as needed to position above the pin
                }}
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
            label
          </p>
        </div>
      )}
    </div>
  );
}

export default ImagePins;
