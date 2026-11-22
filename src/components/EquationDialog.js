import React, { useEffect, useRef, useState } from "react";
import { Alert, Button } from "@mui/material";
import KeyboardOutlined from "@mui/icons-material/KeyboardOutlined";
import { MathfieldElement } from "mathlive";
import katex from "katex";
import "mathlive/fonts.css";
import SiteDialog from "./SiteDialog";

MathfieldElement.fontsDirectory = null;
MathfieldElement.soundsDirectory = null;

function MathInput({ initial, mathField, onInput }) {
  const container = useRef(null);
  const [keyboard, setKeyboard] = useState({ visible: false, height: 0 });

  useEffect(() => {
    const field = mathField.current;
    field.setValue(initial);
    const keyboard = window.mathVirtualKeyboard;
    const previousContainer = keyboard.container;
    keyboard.container = container.current;
    const update = () => setKeyboard({
      visible: keyboard.visible,
      height: Math.ceil(keyboard.boundingRect.height),
    });
    keyboard.addEventListener("virtual-keyboard-toggle", update);
    keyboard.addEventListener("geometrychange", update);
    update();
    field.focus();
    return () => {
      keyboard.removeEventListener("virtual-keyboard-toggle", update);
      keyboard.removeEventListener("geometrychange", update);
      keyboard.hide();
      keyboard.container = previousContainer;
    };
  }, [initial, mathField]);

  const toggleKeyboard = () => {
    const keyboard = window.mathVirtualKeyboard;
    if (keyboard.visible) keyboard.hide();
    else {
      mathField.current.focus();
      keyboard.show();
    }
  };

  return <div className="equationEditor">
    <math-field ref={mathField} aria-label="Equation" math-virtual-keyboard-policy="manual" onInput={onInput} />
    <Button startIcon={<KeyboardOutlined />} size="small" aria-pressed={keyboard.visible} onClick={toggleKeyboard}>
      Math keyboard
    </Button>
    <div ref={container} style={{ height: keyboard.height }} />
  </div>;
}

export default function EquationDialog({ initial, onInsert, onClose }) {
  const mathField = useRef(null);
  const [error, setError] = useState("");

  const insert = () => {
    // Expand MathLive macros such as \differentialD before passing LaTeX to KaTeX.
    const latex = mathField.current.getValue("latex-expanded").trim();
    if (!latex || latex.includes("$$")) {
      setError("Enter one equation.");
      return;
    }
    if (/\\placeholder\b/.test(latex)) {
      setError("Fill in the empty parts of the equation.");
      return;
    }
    try {
      katex.renderToString(latex);
    } catch {
      setError("This equation uses syntax the activity player can’t display.");
      return;
    }
    onInsert(latex);
  };

  return <SiteDialog title={initial ? "Edit equation" : "Insert equation"} wide onClose={onClose}
    actions={<>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={insert}>Insert equation</Button>
    </>}
  >
    <MathInput initial={initial} mathField={mathField} onInput={() => setError("")} />
    {error && <Alert severity="error">{error}</Alert>}
  </SiteDialog>;
}
