
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button } from "@mui/material";

const recordingTypes = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/wav"];

export default function RecordingInput({media, onChange, onBusy, onDuration}) {
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [preview, setPreview] = useState("");
  const recorder = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const active = recorder.current;
      if (active?.state === "recording") active.stop();
      active?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const url = media instanceof Blob ? URL.createObjectURL(media) : "";
    setPreview(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [media]);

  const finish = (message) => {
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
    recorder.current = null;
    if (mounted.current) {
      setError(message || "");
      setStatus("idle");
      onBusy(false);
    }
  };

  const start = async () => {
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      setError("This browser can’t record audio. Use a video URL for your clip.");
      return;
    }
    setStatus("pending");
    setError("");
    onBusy(true);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const mimeType = recordingTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const active = new MediaRecorder(stream, mimeType ? {mimeType} : undefined);
      const chunks = [];
      const startedAt = performance.now();
      recorder.current = active;
      active.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      active.onstop = () => {
        if (recorder.current !== active) return;
        if (mounted.current && chunks.length) {
          onChange(new Blob(chunks, { type: active.mimeType || chunks[0].type }));
          onDuration((performance.now() - startedAt) / 1000);
        }
        finish(chunks.length ? "" : "The recording contained no audio. Try recording again.");
      };
      active.onerror = () => finish("Recording stopped unexpectedly. Try again.");
      active.start();
      setStatus("recording");
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      finish(error.name === "NotAllowedError" ? "Allow microphone access to record audio." :
        "The microphone couldn’t be opened. Check your device and try again.");
    }
  };

  return <section className="recordingField" aria-label="Local recording">
    <div className="buttonRow">
      <Button variant="outlined" disabled={status === "pending"}
        onClick={status === "recording" ? () => recorder.current?.stop() : start}>
        {status === "recording" ? "Stop recording" : "Record audio"}
      </Button>
      {preview && <Button color="error" disabled={status !== "idle"} onClick={() => {
        onChange(null);
        onDuration(null);
      }}>Remove recording</Button>}
    </div>
    {status === "pending" && <p role="status">Waiting for microphone access…</p>}
    {status === "recording" && <p role="status">Recording…</p>}
    {preview && <audio controls src={preview} aria-label="Recorded audio preview" onDurationChange={(event) => {
      const { duration } = event.currentTarget;
      if (Number.isFinite(duration) && duration > 0) onDuration(duration);
    }} />}
    {error && <Alert severity="error">{error}</Alert>}
  </section>;
}
