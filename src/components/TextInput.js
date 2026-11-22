
import React, { useEffect, useId, useState } from "react";
import { Alert, Button, Tab, Tabs, TextField } from "@mui/material";
import { needsLocalMedia } from "../activityFormat";
import { useEditContext } from "../EditContext";
import { loadImageFile } from "../ImageUploads";
import { checkBuilder, getBuilder, isImageSource, parseBuilder } from "../builders";
import BuilderFields, { ImageUpload } from "./BuilderFields";
import RecordingInput from "./RecordingInput";
import SiteDialog from "./SiteDialog";
import "./TextInput.css";

function imageAtEnd(text) {
  const lastLine = text.trimEnd().split("\n").at(-1);
  return isImageSource(lastLine) ? lastLine : "";
}

export default function TextInput({definition, initialText, initialMedia, onRun}) {
  const schema = getBuilder(definition.id);
  const panelId = useId();
  const [builder, setBuilder] = useState(() => parseBuilder(schema, initialText));
  const [tab, setTab] = useState(builder ? "builder" : "free");
  const [raw, setRaw] = useState(initialText);
  const [synced, setSynced] = useState(initialText);
  const [builderChanged, setBuilderChanged] = useState(false);
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState("");
  const [conflict, setConflict] = useState(false);
  const {setDraft} = useEditContext();

  const dirty = builderChanged || raw !== initialText || media !== initialMedia;
  const busy = uploading || recording;
  const builderErrors = builder ? checkBuilder(schema, builder.value) : [];
  const submittedText = tab === "builder" && builder ? schema.write(builder.value) : raw;
  const shouldAttachMedia = needsLocalMedia(definition.id, submittedText);
  const legacyWarning = raw.trim() && !new RegExp(definition.legacyPattern).test(raw.trim());
  const freeDraft = tab === "free" && raw.trim() ? parseBuilder(schema, raw) : null;
  const freeEntryNotes = freeDraft ? schema.validate(freeDraft.value) : [];

  useEffect(() => {
    setDraft(dirty ? definition.id : null);
    return () => setDraft(null);
  }, [definition.id, dirty, setDraft]);

  const openBuilder = () => {
    const result = parseBuilder(schema, raw);
    setBuilder(result);
    setSynced(raw);
    setBuilderChanged(false);
    if (result) setTab("builder");
    else setNotice("This text uses a layout or options the Builder can’t represent. You can keep editing it in Free Entry.");
  };

  const selectTab = (next) => {
    setNotice("");
    setShowErrors(false);
    if (next === "free") {
      if (builder && !builderErrors.length) {
        const text = schema.write(builder.value);
        setRaw(text);
        setSynced(text);
        setBuilderChanged(false);
      }
      setTab("free");
    } else if (raw === synced && builder) {
      setTab("builder");
    } else if (builderChanged) {
      setConflict(true);
    } else {
      openBuilder();
    }
  };

  const uploadImage = async (file, applyMarker) => {
    setUploading(true);
    setNotice("");
    try {
      const image = await loadImageFile(file);
      setMedia(image);
      applyMarker();
    } catch {
      setNotice("The image couldn’t be opened. Choose another image file.");
    } finally {
      setUploading(false);
    }
  };
  const mediaControls = {onUpload: uploadImage, media, busy, recordingDuration};
  const updateRawImage = (source) => setRaw((text) => {
    const existing = imageAtEnd(text);
    const before = existing ? text.trimEnd().slice(0, -existing.length) : text.trimEnd();
    return before + (before && !before.endsWith("\n") ? "\n" : "") + source;
  });

  const run = () => {
    setNotice("");
    setShowErrors(true);
    if (tab === "builder" && builderErrors.length) return;
    if (!submittedText.trim()) {
      setNotice("Enter some activity content.");
      return;
    }
    if (shouldAttachMedia && !media) {
      setNotice("Add the image or recording referenced by this activity.");
      return;
    }
    onRun(submittedText, shouldAttachMedia ? media : null);
  };

  return <div className="workPanel authorPanel">
    {schema && <Tabs value={tab} onChange={(_, next) => selectTab(next)} aria-label="Authoring mode">
      <Tab label="Builder" value="builder" id={panelId + "-builder"} aria-controls={panelId + "-panel"} disabled={busy} />
      <Tab label="Free Entry" value="free" id={panelId + "-free"} aria-controls={panelId + "-panel"} disabled={busy} />
    </Tabs>}
    <div role={schema ? "tabpanel" : undefined} id={panelId + "-panel"} aria-labelledby={schema ? panelId + "-" + tab : undefined} className="authorTab">
      {tab === "builder" && builder ? <BuilderFields
        schema={schema} value={builder.value} mediaControls={mediaControls} showErrors={showErrors}
        onChange={(value) => { setBuilder({value}); setBuilderChanged(true); }}
      /> : <>
        <details className="formatHelp">
          <summary>Activity text format</summary>
          <p>{definition.authorInstructions}</p>
        </details>
        {schema && !builder && raw === initialText && <p className="draftNotice">
          This text is open in Free Entry to preserve its original layout.
        </p>}
        {builderChanged && <p className="draftNotice">Free Entry shows the last synchronized text. Your Builder draft is still available.</p>}
        <TextField fullWidth multiline minRows={8} label="Activity text"
          value={raw} onChange={(event) => setRaw(event.target.value)}
          inputProps={{spellCheck: false}} className="freeEntryText" />
        {freeEntryNotes.length > 0 ? <ul className="validationList draftNotice">
          {[...new Set(freeEntryNotes)].map((note) => <li key={note}>{note}</li>)}
        </ul> : legacyWarning && <p className="draftNotice">Check the line breaks and separators against the activity text format above.</p>}
        {definition.image && <ImageUpload {...mediaControls} value={imageAtEnd(raw)} showUrl={false} onChange={updateRawImage} />}
      </>}
      {definition.recording && <RecordingInput media={media} onChange={setMedia} onBusy={setRecording}
        onDuration={setRecordingDuration} />}
    </div>
    {notice && <Alert severity="warning">{notice}</Alert>}
    {tab === "builder" && showErrors && builderErrors.length > 0 && <Alert severity="error">
      <ul className="validationList">{[...new Set(builderErrors)].map((error) => <li key={error}>{error}</li>)}</ul>
    </Alert>}
    <div className="authorActions">
      <Button variant="contained" onClick={run} disabled={busy}>Run activity</Button>
    </div>
    {conflict && <SiteDialog title="Which draft should the Builder use?" onClose={() => setConflict(false)}
      actions={<>
        <Button onClick={() => setConflict(false)}>Cancel</Button>
        <Button onClick={() => {
          setRaw(synced);
          setTab("builder");
          setConflict(false);
        }}>Keep Builder draft</Button>
        <Button variant="contained" onClick={() => {
          setConflict(false);
          openBuilder();
        }}>Keep Free Entry</Button>
      </>}
    >Both tabs have changes. Choose which draft to keep editing.</SiteDialog>}
  </div>;
}
