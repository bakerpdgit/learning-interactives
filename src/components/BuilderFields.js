
import React, { lazy, Suspense, useId, useRef, useState } from "react";
import { Button, Checkbox, FormControlLabel, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from "@mui/material";
import Close from "@mui/icons-material/Close";
import Functions from "@mui/icons-material/Functions";
import { LOCAL_MARKER } from "../activityFormat";
import { isImageSource } from "../builders";
import MathComponent from "./MathComponent";
import RenderFallback from "./RenderFallback";
import SiteDialog from "./SiteDialog";

const EquationDialog = lazy(() => import("./EquationDialog"));

function EquationField({schema, value, onChange, validation}) {
  const field = useRef(null);
  const [selection, setSelection] = useState(null);
  const [editing, setEditing] = useState(null);
  const rememberPosition = () => {
    const element = field.current;
    setSelection([element.selectionStart, element.selectionEnd]);
  };

  const openEditor = () => {
    const [start, end] = selection || [value.length, value.length];
    const match = [...value.matchAll(/\$\$([\s\S]*?)\$\$/g)]
      .find((match) => start >= match.index && end <= match.index + match[0].length);
    setEditing(match ? { start: match.index, end: match.index + match[0].length, latex: match[1] } :
      {start, end, latex: ""});
  };

  return <div className="builderField">
    <TextField size="small" fullWidth inputRef={field} label={schema.label} value={value}
      multiline={schema.multiline}
      InputProps={{ endAdornment: <InputAdornment position="end">
        <Tooltip title="Equation editor">
          <IconButton size="small" color="primary" aria-label={"Equation editor for " + schema.label}
            onMouseDown={(event) => event.preventDefault()} onClick={openEditor}>
            <Functions fontSize="small" />
          </IconButton>
        </Tooltip>
      </InputAdornment> }}
      {...validation} onSelect={rememberPosition} onChange={(event) => onChange(event.target.value)} />
    {value.includes("$$") && <div className="mathPreview"><MathComponent text={value} renderNewLines /></div>}
    {editing && <RenderFallback fallback={<SiteDialog title="Equation editor unavailable" onClose={() => setEditing(null)}
      actions={<Button onClick={() => setEditing(null)}>Close</Button>}>
        Enter your equation directly in the field between pairs of dollar signs.
      </SiteDialog>}>
      <Suspense fallback={<p role="status">Loading equation editor…</p>}>
      <EquationDialog initial={editing.latex} onClose={() => setEditing(null)}
        onInsert={(latex) => {
          const equation = "$$" + latex + "$$";
          onChange(value.slice(0, editing.start) + equation + value.slice(editing.end));
          setSelection([editing.start, editing.start + equation.length]);
          setEditing(null);
        }} />
      </Suspense>
    </RenderFallback>}
  </div>;
}

function GapField({schema, value, onChange, validation}) {
  const [marking, setMarking] = useState(false);
  const tokens = value.split(/(\s+)/);
  return <div className="builderField">
    <TextField size="small" fullWidth label={schema.label} value={value} multiline={schema.multiline} {...validation}
      onChange={(event) => onChange(event.target.value)} />
    {value.trim() && <Button size="small" aria-expanded={marking} onClick={() => setMarking((value) => !value)}>
      {marking ? "Hide gap choices" : "Choose gap words"}
    </Button>}
    {marking && <div className="buttonRow">
      {tokens.map((token, index) => {
        if (!token.trim()) return null;
        const marked = token.startsWith("*");
        return <Button size="small" key={index} variant={marked ? "contained" : "outlined"} aria-pressed={marked}
          onClick={() => {
            const next = [...tokens];
            next[index] = marked ? token.slice(1) : "*" + token;
            onChange(next.join(""));
          }}>
          {marked ? token.slice(1) : token}
        </Button>;
      })}
    </div>}
  </div>;
}

export function ImageUpload({onChange, onUpload, media, value, busy, showUrl = true, validation}) {
  const inputId = useId();
  const preview = value === LOCAL_MARKER ? media : isImageSource(value) ? value : "";
  return <div className="builderField">
    {showUrl && <TextField size="small" fullWidth label="Image URL" {...validation} value={value === LOCAL_MARKER ? "" : value}
      placeholder={value === LOCAL_MARKER ? "Using the uploaded image" : undefined}
      onChange={(event) => onChange(event.target.value)} />}
    <label className="imageFileLabel" htmlFor={inputId}>Upload an image</label>
    <input id={inputId} type="file" accept="image/*" disabled={busy}
      onChange={(event) => {
        const file = event.target.files[0];
        event.target.value = "";
        if (file) onUpload(file, () => onChange(LOCAL_MARKER));
      }} />
    {typeof preview === "string" && preview && <img className="uploadPreview" src={preview} alt="Activity preview" />}
  </div>;
}

function Field({schema, value, onChange, mediaControls, showErrors}) {
  const message = showErrors ? schema.validate?.(value)[0] : "";
  const validation = message ? {error: true, helperText: message} : {};
  if (schema.type === "math") return <EquationField {...{schema, value, onChange, validation}} />;
  if (schema.type === "gaps") return <GapField {...{schema, value, onChange, validation}} />;
  if (schema.type === "image") return <ImageUpload {...mediaControls} {...{value, onChange, validation}} />;
  if (schema.type === "audioSource") return <div className="builderField">
    <TextField select size="small" fullWidth label={schema.label}
      value={value === LOCAL_MARKER ? "local" : "video"}
      onChange={(event) => onChange(event.target.value === "local" ? LOCAL_MARKER : "")}>
      <MenuItem value="video">Video URL</MenuItem>
      <MenuItem value="local">Local recording</MenuItem>
    </TextField>
    {value !== LOCAL_MARKER && <TextField size="small" fullWidth label="Video URL" {...validation} value={value}
      onChange={(event) => onChange(event.target.value)} />}
  </div>;
  return <TextField
    size="small" fullWidth label={schema.label} value={value}
    multiline={schema.multiline}
    minRows={schema.multiline ? 3 : undefined}
    select={schema.type === "choice"}
    inputProps={schema.type === "number" ? {inputMode: schema.integer ? "numeric" : "decimal"} : undefined}
    onChange={(event) => onChange(event.target.value)}
  >
    {schema.values && Object.entries(schema.values).map(([value, label]) =>
      <MenuItem key={value} value={value}>{label}</MenuItem>)}
  </TextField>;
}

export default function BuilderFields({schema, value, onChange, mediaControls, showErrors}) {
  const listId = useId();
  const render = (node, nextValue, update) =>
    <BuilderFields schema={node} value={nextValue} onChange={update} mediaControls={mediaControls} showErrors={showErrors} />;
  const isField = (node) => node.kind === "field" || node.kind === "marked";

  switch (schema.kind) {
    case "field":
      return <Field {...{schema, value, onChange, mediaControls, showErrors}} />;
    case "parts":
      return <div className={schema.fields.every(isField) ? "builderFields builderColumns" : "builderFields"}>
        {schema.fields.map((part, index) =>
        <React.Fragment key={index}>{render(part, value[index], (next) =>
          onChange(value.map((item, itemIndex) => index === itemIndex ? next : item)))}</React.Fragment>)}</div>;
    case "rows": {
      const inline = isField(schema.item);
      return <div className="builderRows">
        {value.map(({rowId, value: item}, index) => {
          const name = `${schema.label} ${index + 1}`;
          const labelId = `${listId}-${rowId}`;
          return <section role="group" aria-labelledby={labelId}
            className={inline ? "builderRow builderRowInline" : "builderRow"} key={rowId}>
            <span id={labelId} className="builderRowTitle">{name}</span>
            <Tooltip title="Remove" describeChild>
              <IconButton className="builderRemove" size="small" color="error"
                aria-label={`Remove ${name.toLowerCase()}`}
                onClick={() => onChange(value.filter((row) => row.rowId !== rowId))}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
            <div className="builderRowBody">
              {render(schema.item, item, (next) =>
                onChange(value.map((row) => row.rowId === rowId ? {...row, value: next} : row)))}
            </div>
          </section>;
        })}
        <Button size="small" disabled={value.length >= schema.max}
          onClick={() => onChange([...value, schema.add()])}>Add {schema.label.toLowerCase()}</Button>
      </div>;
    }
    case "marked":
      return <div className="builderMarked">
        {render(schema.input, value.text, (text) => onChange({...value, text}))}
        <FormControlLabel className="builderMark" control={<Checkbox size="small" checked={value.enabled}
          inputProps={{"aria-label": schema.label}}
          onChange={(event) => onChange({...value, enabled: event.target.checked})} />}
          label={schema.label === "Correct answer" ? "Correct" : schema.label} />
      </div>;
    case "options":
      return <div className="builderFields">
        <fieldset className="builderSettings">
          <legend>Options</legend>
          <div className="optionFields">{schema.settings.map((spec) => {
            const current = value.settings[spec.key] ?? spec.initial ?? "";
            const update = (next) => onChange({...value, settings: {...value.settings, [spec.key]: next}});
            if (spec.toggle) return <FormControlLabel key={spec.key} label={spec.label}
              control={<Checkbox checked={current === "yes"} onChange={(event) =>
                update(event.target.checked ? "yes" : "no")} />} />;
            return <React.Fragment key={spec.key}>{render(spec.input ||
              {kind: "field", type: "choice", label: spec.label, values: spec.values}, current, update)}</React.Fragment>;
          })}</div>
        </fieldset>
        {render(schema.body, value.body, (body) => onChange({...value, body}))}
      </div>;
    default:
      return null;
  }
}
