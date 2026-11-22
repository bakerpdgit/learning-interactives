import Celebration from "./Celebration";
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import ReactPlayer from "react-player";
import { clipPlaybackUrl, FULL_CLIP } from "../audioClips";
import { LOCAL_MARKER } from "../activityFormat";
import styles from "./AudioWordComplete.module.css";
import { useEditContext } from "../EditContext";

function readClips(text) {
  return text.trim().split(/\r?\n\s*\r?\n/).flatMap((block, id) => {
    const lines = block.split(/\r?\n/).map((line) => line.trim());
    if (lines.length !== 4) return [];
    const [url, startTime, endTime, sentence] = lines;
    const gaps = [];
    const tokens = sentence.split(/(\s+)/).map((token) => {
      const marked = /^\*([^\s.,?!]+)([.,?!]*)$/.exec(token);
      if (!marked) return token.replace(/\*/g, "");
      const gap = { word: marked[1], punctuation: marked[2], index: gaps.length };
      gaps.push(gap);
      return gap;
    });
    return [{
      id, url, tokens, gaps,
      startTime: Math.max(0, parseFloat(startTime) || 0),
      endTime: endTime === FULL_CLIP ? Infinity : parseFloat(endTime),
    }];
  });
}

const isCorrect = (value, word) => value?.trim().toLowerCase() === word.toLowerCase();

function AudioWordComplete({ text }) {
  const clips = useMemo(() => readClips(text), [text]);
  const [clipIndex, setClipIndex] = useState(0);
  const currentBlock = clips[clipIndex];
  const [userInputs, setUserInputs] = useState({});
  const [wrongGap, setWrongGap] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [playback, setPlayback] = useState("loading");
  const [playAttempt, setPlayAttempt] = useState(0);
  const [reload, setReload] = useState(0);
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const inputRefs = useRef([]);
  const nextButton = useRef(null);
  const pendingFocus = useRef(null);
  const { imageData } = useEditContext();
  const [audioUrl, setAudioUrl] = useState("");
  const allCorrect = currentBlock?.gaps.every(({ index, word }) => isCorrect(userInputs[index], word));

  useEffect(() => {
    const url = imageData instanceof Blob ? URL.createObjectURL(imageData) : "";
    setAudioUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [imageData]);

  useEffect(() => {
    if (audioUrl && currentBlock?.url === LOCAL_MARKER) {
      const audio = audioRef.current;
      audio.currentTime = currentBlock.startTime;
      audio.play().catch((error) => {
        if (error.name !== "AbortError") setPlayback("unavailable");
      });
      return () => audio.pause();
    }
  }, [audioUrl, currentBlock]);

  useLayoutEffect(() => {
    inputRefs.current[0]?.focus({ preventScroll: true });
  }, [currentBlock]);

  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    const field = target === "next" ? nextButton.current : inputRefs.current[target];
    field?.focus({ preventScroll: true });
  }, [userInputs]);

  useEffect(() => {
    if (!wrongGap) return;
    const timer = setTimeout(() => setWrongGap(null), 500);
    return () => clearTimeout(timer);
  }, [wrongGap]);

  function changeGap(event, index, word) {
    const value = event.target.value;
    const nextInputs = { ...userInputs, [index]: value };
    if (isCorrect(value, word)) {
      const remaining = currentBlock.gaps.filter((gap) => !isCorrect(nextInputs[gap.index], gap.word));
      pendingFocus.current = (remaining.find((gap) => gap.index > index) ?? remaining[0])?.index ?? "next";
    }
    setWrongGap(null);
    setUserInputs(nextInputs);
  }

  useEffect(() => {
    if (playback !== "loading") return;
    const timeout = setTimeout(() => setPlayback("unavailable"), 8000);
    return () => clearTimeout(timeout);
  }, [playback, playAttempt]);

  function handlePlayAudio() {
    setPlayback("loading");
    setPlayAttempt((previous) => previous + 1);
    if (audioRef.current && audioUrl) {
      // Start inside the click so browsers can use its user activation.
      audioRef.current.currentTime = currentBlock.startTime;
      audioRef.current.play().catch(() => setPlayback("unavailable"));
    } else {
      playerRef.current?.seekTo(currentBlock.startTime, "seconds");
      // A retry can follow blocked autoplay while the wrapper already has playing=true.
      const player = playerRef.current?.getInternalPlayer();
      if (player?.playVideo) player.playVideo();
      else if (player instanceof HTMLMediaElement) player.play().catch(() => setPlayback("unavailable"));
      else if (!player && playback === "unavailable") setReload((previous) => previous + 1);
      setPlaying(true);
    }
  }

  function finishPlayback() {
    audioRef.current?.pause();
    setPlaying(false);
    setPlayback("finished");
  }

  const handleAudioTimeUpdate = (event) => {
    if (event.currentTarget.currentTime >= currentBlock.endTime) finishPlayback();
  };

  const handleProgress = ({ playedSeconds }) => {
    if (playedSeconds >= currentBlock.endTime) finishPlayback();
  };

  function nextQuestion() {
    audioRef.current?.pause();
    setClipIndex((index) => index + 1);
    setUserInputs({});
    setWrongGap(null);
    setPlayback("loading");
    setPlaying(true);
  }

  if (!currentBlock) return clips.length ? <Celebration /> : null;

  return (
    <div className={styles.audioWordCompleteContainer}>
      <div className={styles.audioPlayer}>
        <button onClick={handlePlayAudio}>Repeat Audio</button>
        <span role="status">{({
          loading: "Loading audio…", playing: "Playing audio.", finished: "Audio finished.",
          unavailable: "Audio isn’t playing. Select Repeat Audio to try again or check the clip on your network.",
        })[playback]}</span>
        {playback === "unavailable" && /^https?:\/\//i.test(currentBlock.url) &&
          <a href={currentBlock.url} target="_blank" rel="noreferrer">Open the clip</a>}
      </div>

      {currentBlock.url === LOCAL_MARKER ? (
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          onTimeUpdate={handleAudioTimeUpdate}
          onPlaying={() => setPlayback("playing")}
          onError={() => setPlayback("unavailable")}
          onEnded={finishPlayback}
          style={{ display: "none" }}
        />
      ) : (
        <ReactPlayer
          key={currentBlock.id + ":" + reload}
          ref={playerRef}
          className={styles.video}
          url={clipPlaybackUrl(currentBlock.url)}
          playing={playing}
          controls
          playsinline
          width="100%"
          height="clamp(200px, 52vw, 360px)"
          progressInterval={150}
          onReady={(player) => {
            if (currentBlock.startTime) player.seekTo(currentBlock.startTime, "seconds");
          }}
          onProgress={handleProgress}
          onPlay={() => setPlayback("playing")}
          onError={() => setPlayback("unavailable")}
          onEnded={finishPlayback}
          config={{
            youtube: {
              playerVars: {
                start: Math.floor(currentBlock.startTime),
                end: Number.isFinite(currentBlock.endTime) ? Math.ceil(currentBlock.endTime) : undefined,
              },
            },
          }}
        />
      )}

      <div className={styles.sentence}>
        {currentBlock.tokens.map((token, position) => {
          if (typeof token === "string") return token;
          const { word, index, punctuation } = token;
          return <span key={position} className={styles.gap}>
            {isCorrect(userInputs[index], word) ? <strong>{word}</strong> :
              <input ref={(node) => { inputRefs.current[index] = node; }}
                type="text" aria-label={`Missing word ${index + 1}`} data-word={word}
                aria-invalid={wrongGap?.index === index} autoComplete="off"
                className={styles.inputBox} style={{"--gap-width": word.length + "ch"}}
                value={userInputs[index] ?? ""} onChange={(event) => changeGap(event, index, word)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) setWrongGap({index});
                }} />}
            {punctuation}
          </span>;
        })}
      </div>
      {allCorrect && (
        <div className={styles.nextQuestion}>
          <button ref={nextButton} onClick={nextQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
}

export default AudioWordComplete;
