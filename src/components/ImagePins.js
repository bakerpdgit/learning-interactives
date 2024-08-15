import React, { useState, useRef, useEffect } from "react";
import { handleImageFileChange } from "../ImageUploads";
import { useEditContext } from "../EditContext";
import styles from "./ImagePins.module.css";
import { LOCAL_MARKER } from "./TextInput";
import MessageModal from "./MessageModal";
import InputModal from "./InputModal";

function ImagePins({ text }) {
  const [pins, setPins] = useState([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [hiddenLabels, setHiddenLabels] = useState([]); // Array of hidden labels [label1, label2, ...
  const [showInstruction, setShowInstruction] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [disableAdding, setDisableAdding] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [inputMessage, setInputMessage] = useState({});

  const [draggedItem, setDraggedItem] = useState({
    type: null,
    index: null,
    startX: 0,
    startY: 0,
  });

  const [imgData, setImgData] = useState(null);

  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const { textData, imageData, setImageData } = useEditContext();

  const imgRef = useRef(null);

  useEffect(() => {
    const lines = text.split("\n"); // Split the text by new lines
    const optionsLine = lines[0].startsWith("OPTIONS:") ? lines.shift() : null;
    const imageUrl = lines.pop(); // The last line is the image URL

    let showHiddenLabels = false;
    if (optionsLine) {
      const options = optionsLine.substring(8).split(",");
      options.forEach((option) => {
        const [key, value] = option.split("=");
        if (key === "show" && value === "yes") {
          showHiddenLabels = true;
        } else if (key === "disable_adding" && value === "yes") {
          setDisableAdding(true);
        }
      });
    }

    const hiddenLabels = [];

    if (lines.length > 0) {
      let hiddenPinCount = 0;

      const newPins = lines.map((label, index) => {
        const coordinateMatch = label.match(/\((\d+(\.\d+)?),(\d+(\.\d+)?)\)$/);
        if (coordinateMatch) {
          hiddenPinCount++;
          label = label.replace(coordinateMatch[0], ""); // Remove the coordinates from the label
          hiddenLabels.push(label);
          const xPercent = parseFloat(coordinateMatch[1]);
          const yPercent = parseFloat(coordinateMatch[3]);
          const x = (xPercent / 100) * originalDimensions.width;
          const y = (yPercent / 100) * originalDimensions.height;
          return {
            x,
            y,
            label: "",
            labelX: x,
            labelY: y - 40,
            hidden: true, // Mark the label as hidden
            labelAnswer: label,
            provided: true, // given in setup so cannot be deleted
            answered: false,
          };
        } else {
          const adjustedIndex = index - hiddenPinCount;
          const x = 50 + Math.floor(adjustedIndex / 5) * 70; // Move 50 pixels right for every new column of 5 labels
          const y = 50 + (adjustedIndex % 5) * 70; // Place labels 70 pixels apart vertically
          return {
            x,
            y,
            label,
            labelX: x,
            labelY: y - 40,
            hidden: false, // Visible label
            provided: true,
          };
        }
      });

      setPins(newPins);
      setHiddenCount(hiddenPinCount);

      if (showHiddenLabels) {
        // randomly shuffle the hidden labels
        setHiddenLabels(hiddenLabels.sort(() => Math.random() - 0.5));
      }
    }

    setImgData(
      imageUrl && !imageUrl.includes(LOCAL_MARKER) ? imageUrl : imageData
    );
  }, [
    text,
    textData,
    imageData,
    originalDimensions.width,
    originalDimensions.height,
  ]); // Dependency array includes textData to re-run this effect when textData changes

  useEffect(() => {
    // Assuming imgRef is a ref to your img element

    // Set a timeout to wait for the image to stabilize
    const timeoutId = setTimeout(() => {
      if (imgRef.current) {
        setOriginalDimensions({
          width: imgRef.current.offsetWidth,
          height: imgRef.current.offsetHeight,
        });
        // Adjust pins if necessary
        setPins((currentPins) => {
          return currentPins.map((pin) => {
            // Check if the pin is outside the bounds of the image
            if (
              pin.x > imgRef.current.offsetWidth ||
              pin.y > imgRef.current.offsetHeight
            ) {
              // Reset position to (100, 100) if outside bounds
              return { ...pin, x: 100, y: 100, labelX: 100, labelY: 50 }; // Adjust labelY accordingly if needed
            }
            return pin; // Return the pin unchanged if it's within bounds
          });
        });
      }
    }, 1000); // 1 second delay to allow for image dimensions to stabilize

    return () => clearTimeout(timeoutId); // Cleanup the timeout if the component unmounts or if textData changes again before the timeout finishes
  }, [imgData]); // Dependency array includes textData to re-run this effect when textData changes

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (
        !imgRef.current ||
        originalDimensions.width === 0 ||
        originalDimensions.height === 0
      )
        return; // Ensure the image ref is available

      // Example: Calculate new scale factors based on image's resized dimensions
      // This assumes you have some way of determining or storing the original dimensions
      const scaleFactorWidth =
        imgRef.current.offsetWidth / originalDimensions.width;
      const scaleFactorHeight =
        imgRef.current.offsetHeight / originalDimensions.height;

      let rescaledPins = pins.map((pin) => {
        // Adjust each pin's position based on the scale factor
        return {
          ...pin,
          x: pin.x * scaleFactorWidth,
          y: pin.y * scaleFactorHeight,
          labelX: pin.labelX * scaleFactorWidth,
          labelY: pin.labelY * scaleFactorHeight,
        };
      });

      rescaledPins = rescaledPins.map((pin) => {
        // Check if the pin is outside the bounds of the image
        if (
          pin.x > imgRef.current.offsetWidth ||
          pin.y > imgRef.current.offsetHeight
        ) {
          // Reset position to (100, 100) if outside bounds
          return { ...pin, x: 100, y: 100, labelX: 100, labelY: 50 }; // Adjust labelY accordingly if needed
        }
        return pin; // Return the pin unchanged if it's within bounds
      });

      setPins(rescaledPins); // Update the state with the new positions
      if (imgRef.current) {
        setOriginalDimensions({
          width: imgRef.current.offsetWidth,
          height: imgRef.current.offsetHeight,
        });
      }
    };

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove the listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [originalDimensions, pins]); // Empty dependency array means this runs once on mount and cleanup on unmount

  const handleModalClose = () => {
    setModalMessage("");
  };

  const placePin = (e) => {
    if (disableAdding) {
      setModalMessage("Adding pins is disabled for this task.");
      return;
    }

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
        provided: false, // can be deleted
      },
    ]);
  };

  const handleRightClick = (e, index) => {
    e.preventDefault(); // Prevent the browser context menu from opening
    setPins((prevPins) =>
      prevPins.filter((pin, i) => i !== index || pin.provided)
    ); // Remove the pin at the clicked index
  };

  const handleDoubleClick = (index) => {
    // ignore if pin is already answered
    if (pins[index].answered) {
      return;
    }

    setInputMessage({
      prompt: "Enter a label for this pin:",
      value: pins[index].label,
      currentPinIndex: index,
    });
  };

  const handleInputSubmit = (inputLabel) => {
    const index = inputMessage.currentPinIndex;
    setInputMessage({});

    // ignore if pin is already answered
    if (pins[index].answered) {
      return;
    }

    if (inputLabel !== null) {
      if (pins[index].hidden) {
        const normalizedInput = inputLabel
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "");
        const normalizedOriginal = pins[index].labelAnswer
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "");

        if (normalizedInput === normalizedOriginal) {
          setPins(
            pins.map((pin, i) =>
              i === index
                ? {
                    ...pin,
                    label: pins[index].labelAnswer,
                    hidden: true,
                    answered: true,
                  }
                : pin
            )
          );
          const newHiddenCount = hiddenCount - 1;
          setHiddenCount(newHiddenCount);
          if (newHiddenCount === 0) {
            setShowCelebration(true);
          }
        } else {
          setPins(
            pins.map((pin, i) =>
              i === index ? { ...pin, label: "try again", error: true } : pin
            )
          );
          setTimeout(() => {
            setPins(
              pins.map((pin, i) =>
                i === index ? { ...pin, label: "", error: false } : pin
              )
            );
          }, 1000);
        }
      } else {
        setPins(
          pins.map((pin, i) =>
            i === index ? { ...pin, label: inputLabel } : pin
          )
        );
      }
    }
  };

  // Adjusted onDragStart to prevent default behavior
  const onDragStart = (e, index, type) => {
    e.dataTransfer.setData("text/plain", ""); // For Firefox compatibility

    // Determine initial position
    const item = pins[index];
    const startX = type === "pin" ? item.x : item.labelX;
    const startY = type === "pin" ? item.y : item.labelY;

    setDraggedItem({ type, index, startX, startY });
  };

  // Moved onDragOver to the image-pin-container
  const onDragOver = (e) => {
    e.preventDefault(); // This is crucial for allowing the drop
  };

  const onDrop = (e) => {
    if (!imgRef.current || draggedItem.index === null) return;

    const rect = imgRef.current.getBoundingClientRect();
    let endX = e.clientX - rect.left;
    let endY = e.clientY - rect.top;

    // Calculate movement vector
    const moveX = endX - draggedItem.startX;
    const moveY = endY - draggedItem.startY;

    setPins(
      pins.map((pin, index) => {
        if (index === draggedItem.index) {
          // Apply movement vector to both pin and label
          return {
            ...pin,
            x: pin.x + (draggedItem.type === "pin" ? moveX : 0),
            y: pin.y + (draggedItem.type === "pin" ? moveY : 0),
            labelX: pin.labelX + moveX,
            labelY: pin.labelY + moveY,
          };
        }
        return pin;
      })
    );

    setDraggedItem({ type: null, index: null, startX: 0, startY: 0 }); // Reset after drop
  };

  const updateImageData = (data) => {
    setImageData(data);
    setImgData(data);
  };

  return (
    <>
      {modalMessage !== "" && (
        <MessageModal message={modalMessage} onClose={handleModalClose} />
      )}
      {inputMessage.prompt && (
        <InputModal
          title={inputMessage.prompt}
          placeholder="type here..."
          value={inputMessage.value}
          onSubmit={handleInputSubmit}
          onClose={() => setInputMessage({})}
        />
      )}

      <div className={styles.imagePinMaincontainer}>
        <div
          className={styles.imagePinContainer}
          draggable="false" // Prevent the container from being draggable
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {(!text.includes(LOCAL_MARKER) || textData) && (
            <img
              ref={imgRef}
              className={styles.imagePinImage}
              alt="Highlight"
              onClick={placePin}
              draggable="false"
              src={imgData}
              crossOrigin="anonymous"
            />
          )}

          {text.includes(LOCAL_MARKER) && !textData && (
            <div>
              The local image will need to be provided...
              <br />{" "}
              <input
                type="file"
                className={styles.fileUpload}
                accept="image/*"
                onChange={(event) =>
                  handleImageFileChange(event.target.files[0], updateImageData)
                }
              />
            </div>
          )}

          {pins.map((pin, index) => (
            <React.Fragment key={`pinlabel-${index}`}>
              <div
                key={`pin-${index}`}
                className={`${styles.pin} ${
                  !pin.hidden ? styles.pinDraggable : ""
                }`}
                style={{ left: `${pin.x - 10}px`, top: `${pin.y - 10}px` }}
                draggable={!pin.hidden}
                onDragStart={(e) => onDragStart(e, index, "pin")}
                onContextMenu={(e) => handleRightClick(e, index)}
                onDoubleClick={() => handleDoubleClick(index)}
              ></div>
              {pin.label && (
                <div
                  className={`${styles.pinLabel} ${
                    pin.hidden === true ? styles.correctLabel : ""
                  } ${pin.error ? styles.errorLabel : ""}`}
                  style={{
                    left: `${pin.labelX}px`,
                    top: `${pin.labelY - 10}px`,
                  }}
                  draggable="true"
                  onDragStart={(e) => onDragStart(e, index, "label")}
                >
                  {pin.label}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {showInstruction && (
          <div className={styles.imagePinInstruction}>
            <h1>Image Pins</h1>
            <p>
              click to drop pins, right-click to delete pin, double-click to add
              a label; drag labels to reposition.
            </p>
          </div>
        )}
      </div>
      {hiddenLabels && hiddenCount > 0 && (
        <div className={styles.hiddenLabelsContainer}>
          Double-click pins to add:
          {hiddenLabels
            .filter(
              (label) =>
                !pins.some((pin) => pin.labelAnswer === label && pin.answered)
            )
            .map((label, index) => (
              <div key={`hiddenLbl${index}`} className={styles.hiddenLabel}>
                {label}
              </div>
            ))}
        </div>
      )}

      {showCelebration && <div className={styles.celebration}>🎺</div>}
    </>
  );
}

export default ImagePins;
