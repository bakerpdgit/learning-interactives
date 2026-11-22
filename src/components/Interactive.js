
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import { Button } from "@mui/material";
import { getActivity } from "../activities";
import { useEditContext, readLocalActivity } from "../EditContext";
import { fetchActivity, localActivitySearch, makeDirectLink, needsLocalMedia, readActivityRequest } from "../activityFormat";
import TextInput from "./TextInput";
import SaveDialog from "./SaveDialog";
import ShareModal from "./ShareModal";
import "katex/dist/katex.min.css";

function ActivityMessage({ children }) {
  return <div className="activityMessage" role="alert">
    <p>{children}</p>
    <Link to="/?id=999">Load saved activity</Link>
  </div>;
}

export default function Interactive() {
  const history = useHistory();
  const location = useLocation();
  const request = useMemo(() => readActivityRequest(location.search), [location.search]);
  const { activity, loadActivity } = useEditContext();
  const [dialog, setDialog] = useState(null);
  const [remoteError, setRemoteError] = useState("");
  const [ready, setReady] = useState(false);
  const local = request.mode === "localedit" || request.mode === "localrun";
  const entry = getActivity(request.id);
  const ownActivity = activity?.id === request.id && !activity.source ? activity : null;
  const restored = useMemo(
    () => local && !ownActivity ? readLocalActivity(request.id) : null,
    [local, ownActivity, request.id],
  );

  useEffect(() => {
    if (request.remote) {
      const controller = new AbortController();
      fetchActivity(request.remote, request.id, controller.signal)
        .then((data) => {
          if (!getActivity(data.id)?.name) throw new Error("This file uses an unknown activity.");
          if (!controller.signal.aborted) {
            loadActivity({ ...data, source: location.search });
            setReady(true);
          }
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setRemoteError(error.message + " Source: " + new URL(request.remote).hostname + ".");
          }
        });
      return () => controller.abort();
    }
    if (entry?.name && request.mode === "public") {
      loadActivity({ id: request.id, text: request.text, media: null, source: location.search });
      setReady(true);
    } else if (restored && entry?.name) {
      loadActivity(restored);
    }
  }, [request, entry, restored, loadActivity, location.search]);

  const navigate = (edit) => history.replace({
    pathname: location.pathname,
    search: localActivitySearch(request.id, edit),
    hash: location.hash,
  });

  if (entry?.id === "999" && !request.remote) {
    return <Suspense fallback={<p role="status">Loading…</p>}><entry.Player /></Suspense>;
  }
  if (remoteError) return <ActivityMessage>{remoteError}</ActivityMessage>;
  if ((request.remote || request.mode === "public") && !ready && (request.remote || entry)) {
    return <p role="status">Loading activity…</p>;
  }
  const active = local ? ownActivity || restored : activity?.source === location.search ? activity : null;
  const definition = request.remote ? getActivity(active?.id) : entry;
  if (!definition?.name || request.mode === "invalid") {
    return <ActivityMessage>This activity link is invalid or the activity is unavailable.</ActivityMessage>;
  }
  if (!request.remote && (request.mode === "new" || request.mode === "localedit")) {
    return <>
      <h1 className="interactiveTitle">{definition.name}</h1>
      <TextInput
        definition={definition}
        initialText={active?.text ?? definition.example}
        initialMedia={active?.media ?? null}
        onRun={(text, media) => {
          loadActivity({id: definition.id, text, media}, true);
          navigate(false);
        }}
      />
    </>;
  }
  if (!active?.text) return <ActivityMessage>This activity was opened in another browser tab or session.</ActivityMessage>;
  if (local && !ownActivity) return <p role="status">Loading activity…</p>;

  const { Player, id } = definition;
  return (
    <>
      <div className="activityHeading">
        <div>
          <h1 className="interactiveTitle">{definition.name}</h1>
          <p className="instructions">{definition.playInstructions}</p>
        </div>
        {local && active.editable && <div className="activityActions" aria-label="Activity actions">
          <Button variant="outlined" onClick={() => navigate(true)}>Edit</Button>
          <Button variant="outlined" onClick={() => setDialog("save")}>Save</Button>
          <Button variant="contained" onClick={() => setDialog("share")}>Share</Button>
        </div>}
      </div>
      {id === "32" && needsLocalMedia(id, active.text) && !active.media ?
        <ActivityMessage>This activity needs its saved image or recording. Load the original activity file to restore it.</ActivityMessage> :
        <Suspense fallback={<p role="status">Loading activity…</p>}>
          <section className="activityPlayer" aria-label={definition.name + " play area"}>
            <Player text={active.text.trim()} />
          </section>
        </Suspense>}
      {dialog === "save" && <SaveDialog activity={active} title={definition.name} onClose={() => setDialog(null)} />}
      {dialog === "share" && <ShareModal
        directLink={makeDirectLink(id, active.text, active.media)}
        hasMedia={Boolean(active.media)}
        onSave={() => setDialog("save")}
        onClose={() => setDialog(null)}
      />}
    </>
  );
}
