
import React, { useState } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { useHistory } from "react-router-dom";
import { getActivity } from "../activities";
import { fetchActivity, localActivitySearch, readActivityFile, readActivityRequest } from "../activityFormat";
import { useEditContext } from "../EditContext";

export default function Uploader() {
  const history = useHistory();
  const { loadActivity } = useEditContext();
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const read = async (readSource) => {
    setBusy(true);
    setError("");
    try {
      const data = await readSource();
      if (!getActivity(data.id)?.name) throw new Error("This file uses an unknown activity.");
      setResult(data);
    } catch (error) {
      setError(error.message || "The activity couldn’t be loaded.");
    } finally {
      setBusy(false);
    }
  };

  const readUrl = async () => {
    const source = new URL(url.trim());
    if (!["https:", "http:"].includes(source.protocol)) {
      throw new Error("Enter an HTTP or HTTPS activity link.");
    }
    const request = readActivityRequest(source.search);
    if (request.remote) return fetchActivity(request.remote, request.id);
    if (request.text) return readActivityFile(source.href);
    if (source.searchParams.has("txt")) throw new Error("This link doesn’t contain the activity. Choose its saved file instead.");
    return fetchActivity(source.href);
  };

  const open = (edit) => {
    loadActivity(result, true);
    history.replace({ pathname: "/", search: localActivitySearch(result.id, edit) });
  };

  return <>
    <h1 className="interactiveTitle">Load saved activity</h1>
    <div className="workPanel loadPanel">
      <label htmlFor="activity-file">Choose an activity file</label>
      <input id="activity-file" type="file" accept=".txt,text/plain" disabled={busy}
        onChange={(event) => { setFile(event.target.files[0]); setError(""); }} />
      <Button variant="outlined" disabled={!file || busy} onClick={() => read(async () => readActivityFile(await file.text()))}>
        Load file
      </Button>
      <form className="loadLinkForm" onSubmit={(event) => { event.preventDefault(); read(readUrl); }}>
        <TextField label="Activity URL" type="url" value={url} fullWidth size="small" disabled={busy}
          onChange={(event) => setUrl(event.target.value)} />
        <Button type="submit" variant="outlined" disabled={!url.trim() || busy}>Load URL</Button>
      </form>
      {busy && <p role="status">Loading activity…</p>}
      {error && <Alert severity="error">{error}</Alert>}
      {result && <div className="loadedActivity">
        <p role="status">{getActivity(result.id).name} is ready.</p>
        <div className="buttonRow">
          <Button variant="contained" disabled={busy} onClick={() => open(false)}>Run</Button>
          <Button variant="outlined" disabled={busy} onClick={() => open(true)}>Edit</Button>
        </div>
      </div>}
    </div>
  </>;
}
