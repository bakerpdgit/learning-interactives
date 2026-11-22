
import React, { useState } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { activityFilename, makeActivityFile } from "../activityFormat";
import SiteDialog from "./SiteDialog";

export default function SaveDialog({activity, title, onClose, onSaved}) {
  const [name, setName] = useState(activityFilename(title) || "ClassInteractive.txt");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    const filename = activityFilename(name);
    if (!filename) {
      setError("Enter a filename.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const contents = await makeActivityFile(activity);
      const url = URL.createObjectURL(new Blob([contents], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (onSaved) onSaved();
      else onClose();
    } catch (error) {
      setError(error.message || "The activity couldn’t be saved.");
      setBusy(false);
    }
  };

  return (
    <SiteDialog title="Save activity" busy={busy} onClose={onClose} onSubmit={save}
      actions={<>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={busy}>
          {busy ? "Saving…" : onSaved ? "Download and open old site" : "Download"}
        </Button>
      </>}
    >
      <TextField autoFocus fullWidth margin="dense" label="Filename"
        value={name} onFocus={(event) => event.target.select()}
        onChange={(event) => setName(event.target.value)} disabled={busy}
        error={Boolean(error)} helperText="The activity is saved as a .txt file." />
      {error && <Alert severity="error">{error}</Alert>}
    </SiteDialog>
  );
}
