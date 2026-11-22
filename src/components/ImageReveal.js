import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Celebration from "./Celebration";
import { Alert } from "@mui/material";
import { handleImageFileChange } from "../ImageUploads";
import { useEditContext } from "../EditContext";
import { LOCAL_MARKER } from "../activityFormat";
import "./ImageReveal.css";

function readSettings(text) {
  const lines = text.split("\n").filter((line) => line.trim());
  const options = lines[0]?.startsWith("OPTIONS:") ?
    Object.fromEntries(lines[0].slice(8).split(",").map((option) => option.split("=").map((part) => part.trim()))) : {};
  const scale = Number.parseFloat(options.scale);
  return {
    gridSize: Math.max(1, Number.parseInt(options.gridsize, 10) || 5),
    scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
    url: lines.at(-1),
  };
}

function ImageRevealBoard({ source, gridSize, scale }) {
  const container = useRef(null);
  const [top, setTop] = useState(0);
  const [size, setSize] = useState(null);
  const [revealed, setRevealed] = useState([]);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const y = container.current.getBoundingClientRect().top + window.scrollY;
      setTop(Math.ceil(y));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!document.fonts) return;
    let mounted = true;
    document.fonts.ready.then(() => {
      if (mounted) setTop(Math.ceil(container.current.getBoundingClientRect().top + window.scrollY));
    });
    return () => { mounted = false; };
  }, []);

  const ratio = size ? size.width / size.height : 1;

  return <div className="image-reveal-container" ref={container}>
    {failed ? <Alert severity="error">
      The image couldn’t be loaded. Check its link or use a local image.
    </Alert> : <div className="image-reveal-board"
      style={size ? {
        "--reveal-width": size.width * scale + "px",
        "--reveal-top": top + "px",
        "--reveal-ratio": ratio,
        "--reveal-columns": gridSize,
      } : undefined}>
      <img className="image-reveal-image" src={source} alt="Reveal" draggable={false}
        onLoad={(event) => setSize({
          width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight,
        })}
        onError={() => setFailed(true)} />
      {size && <div className="image-reveal-tiles">
        {Array.from({ length: gridSize ** 2 }, (_, index) => {
          const isRevealed = revealed.includes(index);
          return <button key={index} type="button" disabled={isRevealed}
            className={"image-box" + (isRevealed ? " image-box-reveal" : "")}
            aria-label={(isRevealed ? "Revealed tile " : "Reveal tile ") + (index + 1)}
            onClick={() => setRevealed((tiles) => [...tiles, index])}>
            {index + 1}
          </button>;
        })}
      </div>}
    </div>}
    {!failed && size && revealed.length === gridSize ** 2 && <Celebration label="Image revealed!" />}
  </div>;
}

export default function ImageReveal({ text }) {
  const { imageData, setImageData } = useEditContext();
  const { gridSize, scale, url } = readSettings(text);
  const source = url === LOCAL_MARKER ? imageData : url;

  if (!source) return <label>
    Choose an image
    <input type="file" accept="image/*"
      onChange={(event) => handleImageFileChange(event.target.files[0], setImageData)} />
  </label>;

  return <ImageRevealBoard key={source} source={source} gridSize={gridSize} scale={scale} />;
}
