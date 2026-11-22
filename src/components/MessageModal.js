
import React from "react";
import { Button } from "@mui/material";
import SiteDialog from "./SiteDialog";

export default function MessageModal({ message, onClose }) {
  return (
    <SiteDialog title="Activity notice" onClose={onClose}
      actions={<Button variant="contained" onClick={onClose}>OK</Button>}>
      {message}
    </SiteDialog>
  );
}
