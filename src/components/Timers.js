
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import Celebration from "./Celebration";
import styles from "./Timers.module.css";

function playTrumpet(context) {
  const start = context.currentTime;
  [440, 466.16, 493.88, 493.88].forEach((frequency, index) => {
    const at = start + index * 0.3;
    const note = context.createOscillator();
    const filter = context.createBiquadFilter();
    const volume = context.createGain();
    note.type = "sawtooth";
    note.frequency.value = frequency;
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    volume.gain.setValueAtTime(0, at);
    volume.gain.linearRampToValueAtTime(0.22, at + 0.025);
    volume.gain.linearRampToValueAtTime(0, at + 0.26);
    note.connect(filter).connect(volume).connect(context.destination);
    note.onended = () => { note.disconnect(); filter.disconnect(); volume.disconnect(); };
    note.start(at);
    note.stop(at + 0.27);
  });
}

function useTimerAlert(finished) {
  const context = useRef(null);
  const alerted = useRef(false);
  const [sound, setSound] = useState("unavailable");

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return undefined;
    let audio;
    try {
      audio = new AudioContext();
    } catch {
      return undefined;
    }
    context.current = audio;
    const updateState = () => setSound(audio.state);
    audio.addEventListener("statechange", updateState);
    updateState();
    return () => {
      audio.removeEventListener("statechange", updateState);
      context.current = null;
      audio.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!finished || alerted.current) return;
    alerted.current = true;
    if (context.current?.state === "running") playTrumpet(context.current);
  }, [finished]);

  return {
    sound,
    enableSound: () => context.current?.resume().catch(() => setSound("blocked")),
  };
}

export default function Timers({ text }) {
  const timers = useMemo(() => text.split("\n").map((line) => {
    const [label, duration] = line.split(":");
    return { label, duration: Math.max(0, parseInt(duration, 10) || 0) };
  }), [text]);
  const total = timers.reduce((sum, timer) => sum + timer.duration, 0);
  const [start] = useState(Date.now);
  const [now, setNow] = useState(start);
  const [pausedAt, setPausedAt] = useState(null);
  const [pauseTotal, setPauseTotal] = useState(0);
  const elapsed = Math.max(0, ((pausedAt ?? now) - start - pauseTotal) / 1000);
  const finished = elapsed >= total;
  const { sound, enableSound } = useTimerAlert(finished);

  useEffect(() => {
    if (pausedAt != null || finished) return undefined;
    const timeout = setTimeout(() => setNow(Date.now()), 1000 - (elapsed * 1000) % 1000);
    return () => clearTimeout(timeout);
  }, [elapsed, finished, now, pausedAt]);

  const togglePause = () => {
    const time = Date.now();
    if (pausedAt == null) setPausedAt(time);
    else {
      setPauseTotal((prior) => prior + time - pausedAt);
      setNow(time);
      setPausedAt(null);
    }
  };

  let timeBefore = 0;
  return <div className={styles.gameArea}>
    <div className="buttonRow">
      <Button variant="outlined" onClick={togglePause} disabled={finished}>
        {pausedAt == null ? "Pause" : "Resume"}
      </Button>
      {!finished && !["running", "unavailable"].includes(sound) &&
        <Button onClick={enableSound}>Enable sound</Button>}
      {sound === "blocked" && <span role="status">The browser is blocking sound.</span>}
    </div>
    {finished && <Celebration label="Time’s up" />}
    {timers.map(({label, duration}, index) => {
      const remaining = Math.min(duration, Math.max(0, timeBefore + duration - elapsed));
      timeBefore += duration;
      return <div className={styles.timer} key={index}
        style={{"--remaining": duration ? remaining / duration * 100 + "%" : "0%"}}>
        <span>{label}</span>
        <span>{Math.ceil(remaining)} s</span>
      </div>;
    })}
  </div>;
}
