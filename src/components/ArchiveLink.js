
import React, { useState } from "react";
import { Button } from "@mui/material";
import { useLocation } from "react-router-dom";
import { getActivity } from "../activities";
import { readActivityRequest } from "../activityFormat";
import { prepareArchiveActivity, readLocalActivity, useEditContext } from "../EditContext";
import SaveDialog from "./SaveDialog";
import SiteDialog from "./SiteDialog";

export default function ArchiveLink() {
  const location = useLocation();
  const { activity, draft } = useEditContext();
  const [dialog, setDialog] = useState(null);
  const {id, mode} = readActivityRequest(location.search);
  const local = mode === "localedit" || mode === "localrun";
  const active = local ? (activity?.id === id && !activity.source ? activity : readLocalActivity(id)) : null;
  const href = "/archive/" + location.search + location.hash;

  const switchVersion = () => {
    if (active && !prepareArchiveActivity(active)) setDialog("handoff");
    else window.location.assign(href);
  };

  return <>
    <a className="legacyLink" href={href} onClick={(event) => {
      if (!draft && !active) return;
      event.preventDefault();
      if (draft) setDialog("draft");
      else switchVersion();
    }}>Use old site…</a>
    {dialog === "draft" && <SiteDialog
      title="Leave this draft?" onClose={() => setDialog(null)}
      actions={<>
        <Button onClick={() => setDialog(null)}>Stay here</Button>
        <Button onClick={switchVersion}>Open old site</Button>
      </>}
    >Your unsubmitted changes will be lost when you switch sites.</SiteDialog>}
    {dialog === "handoff" && <SiteDialog
      title="Take your activity with you" onClose={() => setDialog(null)}
      actions={<>
        <Button onClick={() => setDialog(null)}>Stay here</Button>
        <Button variant="contained" onClick={() => setDialog("save")}>Save activity</Button>
      </>}
    >Save the activity file, then load it on the old site to use its media.</SiteDialog>}
    {dialog === "save" && active && <SaveDialog
      activity={active} title={getActivity(id)?.name || "ClassInteractive"}
      onClose={() => setDialog(null)} onSaved={() => window.location.assign("/archive/?id=999")}
    />}
  </>;
}
