
import React, { useId } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

export default function SiteDialog({title, children, actions, onClose, busy = false, wide = false, onSubmit}) {
  const labelId = useId();
  return (
    <Dialog
      open
      fullWidth
      maxWidth={wide ? "sm" : "xs"}
      onClose={busy ? undefined : onClose}
      aria-labelledby={labelId}
      PaperProps={onSubmit ? { component: "form", onSubmit } : undefined}
    >
      <DialogTitle id={labelId}>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
}
