
import React, { createContext, useState, useContext, useCallback } from "react";

const EditContext = createContext();
const activityKey = "class-interactives:activity";
const archiveReturnKey = "class-interactives:archive-return";

export const useEditContext = () => useContext(EditContext);

export function readLocalActivity(id) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(activityKey));
    const fromArchive = sessionStorage.getItem(archiveReturnKey) === id;
    if (!fromArchive && saved) return saved.id === id ? saved : null;
    const text = sessionStorage.getItem("textData");
    const media = sessionStorage.getItem("imageData");
    return text ? { id, text, media: media === "[object Blob]" ? null : media } : null;
  } catch {
    return null;
  }
}

function persistActivity(activity) {
  try {
    sessionStorage.removeItem(archiveReturnKey);
    sessionStorage.setItem(activityKey, JSON.stringify({
      id: activity.id,
      text: activity.text,
      media: typeof activity.media === "string" ? activity.media : null,
    }));
  } catch {
    // Activities still work in this tab if storage is unavailable or full.
    try { sessionStorage.removeItem(activityKey); } catch {}
  }
}

export function prepareArchiveActivity(activity) {
  if (activity.media instanceof Blob) return false;
  try {
    sessionStorage.setItem("textData", activity.text);
    if (activity.media) sessionStorage.setItem("imageData", activity.media);
    else sessionStorage.removeItem("imageData");
    return true;
  } catch {
    return false;
  }
}

export function EditProvider({ children }) {
  const [activity, setActivity] = useState(null);
  const [draft, setDraft] = useState(null);
  const loadActivity = useCallback((data, editable = false) => {
    if (editable) persistActivity(data);
    setActivity({ ...data, editable });
  }, []);
  const setImageData = useCallback((media) => {
    setActivity((current) => {
      if (!current) return current;
      const next = { ...current, media };
      if (next.editable) persistActivity(next);
      return next;
    });
  }, []);

  return (
    <EditContext.Provider value={{
      activity, loadActivity, draft, setDraft, setImageData,
      textData: activity?.text, imageData: activity?.media,
    }}>
      {children}
    </EditContext.Provider>
  );
}
