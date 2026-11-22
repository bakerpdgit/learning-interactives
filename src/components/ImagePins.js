
import React, { useRef, useState } from "react";
import { Alert } from "@mui/material";
import { useEditContext } from "../EditContext";
import { LOCAL_MARKER } from "../activityFormat";
import { loadImageFile } from "../ImageUploads";
import Celebration from "./Celebration";
import InputModal from "./InputModal";
import styles from "./ImagePins.module.css";

const sampleMap = /^https?:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/5\/5c\/Africa_map\.svg\/585px-Africa_map\.svg\.png(?:[?#]|$)/i;

const clamp = (value) => Math.max(0, Math.min(100, value));
const normalize = (value) => value.toLowerCase().replace(/\s+/g, "");

function readPins(text) {
  const lines = text.split("\n");
  const settings = lines[0].startsWith("OPTIONS:") ?
    Object.fromEntries(lines.shift().slice(8).split(",").map((option) => option.split("="))) : {};
  const image = lines.pop();
  const pins = lines.map((label, index) => {
    const hidden = /\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)$/.exec(label);
    if (hidden) return { id: index, x: Number(hidden[1]), y: Number(hidden[2]),
      label: "", answer: label.slice(0, hidden.index), provided: true };
    return { id: index, label, provided: true, unplaced: true };
  });
  return { image, settings, pins };
}

export default function ImagePins({text}) {
  const [{ image, settings, pins: initial }] = useState(() => readPins(text));
  const [pins, setPins] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [imageError, setImageError] = useState(false);
  const [replacement, setReplacement] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const {imageData, setImageData} = useEditContext();
  const picture = useRef(null);
  const drag = useRef(null);
  const skipClick = useRef(null);
  const nextId = useRef(initial.length);
  const usesSampleMap = sampleMap.test(image);
  const src = replacement || (usesSampleMap ? process.env.PUBLIC_URL + "/examples/africa-map.svg" :
    image === LOCAL_MARKER ? imageData : image);
  const hidden = pins.filter((pin) => pin.answer != null);
  const remaining = hidden.filter((pin) => !pin.solved);
  const disableAdding = settings.disable_adding === "yes";
  const pinToEdit = pins.find((pin) => pin.id === editing);

  const setPin = (id, update) => setPins((current) => current.map((pin) =>
    pin.id === id ? {...pin, ...update(pin)} : pin));
  const deletePin = (id) => setPins((current) => current.filter((pin) => pin.id !== id || pin.provided));

  const position = (event) => {
    const rect = picture.current.getBoundingClientRect();
    return {x: 100 * (event.clientX - rect.left) / rect.width, y: 100 * (event.clientY - rect.top) / rect.height};
  };

  const addPin = (event) => {
    const {x, y} = position(event);
    if (selectedLabel != null) {
      setPin(selectedLabel, () => ({ x: clamp(x), y: clamp(y), unplaced: false }));
      setSelectedLabel(null);
      return;
    }
    if (disableAdding) return;
    const id = nextId.current++;
    setPins((current) => [...current, {id, x: clamp(x), y: clamp(y), label: ""}]);
  };

  const handlePointer = (pin, label) => ({
    onPointerDown(event) {
      if (!event.isPrimary || event.button !== 0) return;
      skipClick.current = null;
      drag.current = { pointer: event.pointerId, id: pin.id, from: position(event),
        clientX: event.clientX, clientY: event.clientY, pin, moved: false, movable: label || pin.answer == null };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event) {
      const current = drag.current;
      if (!current || current.pointer !== event.pointerId || current.id !== pin.id) return;
      if (!current.moved && Math.hypot(event.clientX - current.clientX, event.clientY - current.clientY) < 6) return;
      current.moved = true;
      if (!current.movable) return;
      const point = position(event);
      const dx = point.x - current.from.x;
      const dy = point.y - current.from.y;
      setPin(pin.id, () => label ? {
        labelDX: (current.pin.labelDX || 0) + dx, labelDY: (current.pin.labelDY || 0) + dy,
      } : {x: clamp(current.pin.x + dx), y: clamp(current.pin.y + dy)});
    },
    onPointerUp(event) {
      const current = drag.current;
      if (!label && event.pointerType !== "mouse" && current?.pointer === event.pointerId &&
          current.id === pin.id && !current.moved) setEditing(pin.id);
    },
    onLostPointerCapture() {
      if (drag.current?.id === pin.id) {
        skipClick.current = drag.current.moved ? pin.id : null;
        drag.current = null;
      }
    },
  });

  const submitLabel = (value) => {
    const pin = pinToEdit;
    if (!pin) return;
    if (pin.answer == null) setPin(pin.id, () => ({label: value}));
    else if (normalize(pin.answer) === normalize(value)) {
      setFeedback("Correct label.");
      setPin(pin.id, () => ({label: pin.answer, solved: true}));
    } else {
      setFeedback("Try another label.");
    }
  };

  return <div className={styles.panel} data-fit={Boolean(src && !imageError)}>
    {!imageError && src && pins.some((pin) => pin.unplaced) && <div className={styles.tray}>
      <span>Labels to place</span>
      {pins.filter((pin) => pin.unplaced).map((pin) => <button key={pin.id} type="button"
        aria-pressed={selectedLabel === pin.id}
        onClick={() => setSelectedLabel(selectedLabel === pin.id ? null : pin.id)}>{pin.label}</button>)}
      {selectedLabel != null && <span role="status">Select a spot on the image.</span>}
    </div>}
    {src && <div className={styles.pictureSpace}><div className={styles.picture}>
      <img ref={picture} src={src} alt="Locations to label" draggable={false}
        onClick={addPin} onLoad={() => setImageError(false)} onError={() => setImageError(true)} />
      {!imageError && pins.map((pin, index) => !pin.unplaced && <React.Fragment key={pin.id}>
        <button type="button" className={styles.pin}
          style={{left: pin.x + "%", top: pin.y + "%"}}
          aria-label={pin.solved ? "Correct label: " + pin.label : "Edit pin " + (index + 1)}
          disabled={pin.solved}
          {...handlePointer(pin, false)}
          onClick={(event) => {
            if (event.detail && skipClick.current === pin.id) { skipClick.current = null; return; }
            setEditing(pin.id);
          }}
          onContextMenu={(event) => { event.preventDefault(); deletePin(pin.id); }} />
        {pin.label && <span className={styles.label} data-solved={pin.solved}
          style={{left: pin.x + (pin.labelDX || 0) + "%", top: pin.y + (pin.labelDY || 0) + "%"}}
          {...handlePointer(pin, true)}>{pin.label}</span>}
      </React.Fragment>)}
    </div></div>}
    {usesSampleMap && !replacement && !imageError && <p className={styles.credit}>
      Africa map by Faigl.ladislav and JCRules, updated by Smasongarrison.
      {" "}<a href="https://commons.wikimedia.org/wiki/File:Africa_map.svg">Source</a>
      {" · "}<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>
    </p>}
    {imageError && <>
      <Alert severity="warning">The activity image couldn’t be opened. Choose a replacement to continue.</Alert>
      {image !== LOCAL_MARKER && <label>Choose replacement image <input type="file" accept="image/*"
        onChange={async (event) => {
          const file = event.target.files[0];
          if (!file) return;
          try { setReplacement(await loadImageFile(file)); }
          catch { setFeedback("This file couldn’t be opened as an image."); }
        }} /></label>}
    </>}
    {image === LOCAL_MARKER && !imageData && <label>
      Choose the activity image <input type="file" accept="image/*" onChange={async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try { setImageData(await loadImageFile(file)); }
        catch { setImageError(true); }
      }} />
    </label>}
    {settings.show === "yes" && remaining.length > 0 && <p className={styles.clues}>
      Labels to place: {remaining.map((pin) => pin.answer).join(", ")}
    </p>}
    {feedback && <span role="status">{feedback}</span>}
    {hidden.length > 0 && remaining.length === 0 && <Celebration />}
    {pinToEdit && <InputModal title="Label pin" placeholder="Pin label" value={pinToEdit.label} onSubmit={submitLabel}
      onClose={() => setEditing(null)} onDelete={pinToEdit.provided ? undefined : () => deletePin(pinToEdit.id)} />}
  </div>;
}
