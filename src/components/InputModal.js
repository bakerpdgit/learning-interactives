
import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import SiteDialog from "./SiteDialog";

export default function InputModal({
  title, placeholder, value = "", onSubmit, onClose, multiLine = false, onDelete,
}) {
  const [inputValue, setInputValue] = useState(value);
  return (
    <SiteDialog
      title={title}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(inputValue);
        onClose();
      }}
      actions={<>
        {onDelete && <Button color="error" onClick={() => { onDelete(); onClose(); }}>Delete</Button>}
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" type="submit">Submit</Button>
      </>}
    >
      <TextField
        autoFocus
        fullWidth
        margin="dense"
        label={placeholder || title}
        multiline={multiLine}
        minRows={multiLine ? 3 : undefined}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
      />
    </SiteDialog>
  );
}
