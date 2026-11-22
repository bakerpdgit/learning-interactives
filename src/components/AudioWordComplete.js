import Celebration from "./Celebration";
import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { clipPlaybackUrl, FULL_CLIP } from "../audioClips";
import { LOCAL_MARKER } from "../activityFormat";
import styles from "./AudioWordComplete.module.css";
import { useEditContext } from "../EditContext";

function AudioWordComplete({ text }) {
  const [blocks, setBlocks] = useState([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [currentSentence, setCurrentSentence] = useState("");
  const [currentBlock, setCurrentBlock] = useState(null);
  const [asteriskedWords, setAsteriskedWords] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [allCorrect, setAllCorrect] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playback, setPlayback] = useState("ready");
  const [playAttempt, setPlayAttempt] = useState(0);
  const [reload, setReload] = useState(0);

  const playerRef = useRef(null);
  const audioRef = useRef(null); // Reference to the audio element
  const inputRefs = useRef({});
  const { imageData } = useEditContext();
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    const url = imageData instanceof Blob ? URL.createObjectURL(imageData) : "";
    setAudioUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [imageData]);

  useEffect(() => {
    const parseBlocks = () => {
      const rawBlocks = text.trim().split(/\r?\n\s*\r?\n/);
      const parsedBlocks = rawBlocks
        .map((block, index) => {
          const lines = block.split(/\r?\n/).map((line) => line.trim());
          if (lines.length !== 4) {
            console.error(
              `Block ${index + 1}: Expected 4 lines but got ${lines.length}.`
            );
            return null;
          }
          const [url, startTime, endTime, sentence] = lines;
          return {
            id: index,
            url,
            startTime: Math.max(0, parseFloat(startTime) || 0),
            endTime: endTime === FULL_CLIP ? Infinity : parseFloat(endTime),
            sentence,
          };
        })
        .filter((block) => block !== null);
      setBlocks(parsedBlocks);
    };
    parseBlocks();
  }, [text]);

  useEffect(() => {
    if (blocks.length > 0 && currentBlockIndex < blocks.length) {
      const block = blocks[currentBlockIndex];
      setCurrentBlock(block);
      setCurrentSentence(block.sentence);

      // Extract asterisked words
      const regex = /\*([^\s]+)/g;
      const words = [];
      let match;
      while ((match = regex.exec(block.sentence)) !== null) {
        let word = match[1];
        // Remove any trailing punctuation marks
        word = word.replace(/[.,?!]+$/, "");
        words.push(word);
      }
      setAsteriskedWords(words);

      // Initialize user inputs
      const inputs = {};
      words.forEach((word) => {
        inputs[word] = "";
      });
      setUserInputs(inputs);
      setAllCorrect(false);
      setPlayback("loading");
      setPlaying(true); // Start playing immediately
    } else if (currentBlockIndex >= blocks.length && blocks.length > 0) {
      setCelebrate(true);
    }
  }, [blocks, currentBlockIndex]);

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

  useEffect(() => {
    const allCorrect = asteriskedWords.every(
      (w) => userInputs[w].trim().toLowerCase() === w.toLowerCase()
    );
    setAllCorrect(allCorrect);

    // Focus on the first incomplete input
    if (!allCorrect) {
      const nextWord = asteriskedWords.find(
        (word) => userInputs[word].trim().toLowerCase() !== word.toLowerCase()
      );
      if (nextWord && inputRefs.current[nextWord]) {
        inputRefs.current[nextWord].focus();
      }
    }
  }, [userInputs, asteriskedWords]);

  const handleInputChange = (e) => {
    const word = e.target.dataset.word;
    const value = e.target.value;
    setUserInputs((prevInputs) => ({
      ...prevInputs,
      [word]: value,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const word = e.target.dataset.word;
      const inputValue = userInputs[word];
      if (inputValue.trim().toLowerCase() === word.toLowerCase()) {
        // Correct
        setUserInputs((prevInputs) => ({
          ...prevInputs,
          [word]: inputValue,
        }));
      } else {
        // Incorrect, flash red
        e.target.classList.add(styles.wrong);
        setTimeout(() => {
          e.target.classList.remove(styles.wrong);
        }, 500);
      }
    }
  };

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

  const nextQuestion = () => {
    setCurrentBlockIndex((prevIndex) => prevIndex + 1);
    setPlaying(false);
  };

  const getSentenceElements = () => {
    inputRefs.current = {}; // Reset input refs here

    const elements = [];
    let tempSentence = currentSentence;
    // Remove asterisks for display
    tempSentence = tempSentence.replace(/\*/g, "");

    const tokens = tempSentence.split(/(\s+)/); // Split by spaces, keeping them
    tokens.forEach((token, index) => {
      const trimmedToken = token.trim();
      // Extract trailing punctuation
      const wordMatch = trimmedToken.match(/^([^\s.,?!]+)([.,?!]*)$/);
      if (wordMatch) {
        // eslint-disable-next-line
        const [_, wordWithoutPunct, punctuation] = wordMatch;

        if (asteriskedWords.includes(wordWithoutPunct)) {
          const inputValue = userInputs[wordWithoutPunct] || "";
          const isCorrect =
            inputValue.trim().toLowerCase() === wordWithoutPunct.toLowerCase();
          if (isCorrect) {
            elements.push(
              <span
                key={index}
                className={styles.foundWord}
                style={{ minWidth: `${wordWithoutPunct.length}ch` }}
              >
                {wordWithoutPunct}
              </span>
            );
          } else {
            elements.push(
              <input
                key={index}
                ref={(el) => {
                  if (el) {
                    inputRefs.current[wordWithoutPunct] = el;
                  }
                }}
                type="text"
                data-word={wordWithoutPunct}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                style={{ width: `${wordWithoutPunct.length}ch` }}
                className={styles.inputBox}
              />
            );
          }
          // Add the punctuation back
          elements.push(punctuation);
        } else {
          elements.push(token);
        }
      } else {
        elements.push(token);
      }
    });
    return elements;
  };

  if (celebrate) {
    return (
      <Celebration />
    );
  }

  if (!currentBlock) {
    return null;
  }

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

      <div className={styles.sentence}>{getSentenceElements()}</div>
      {allCorrect && (
        <div className={styles.nextQuestion}>
          <button onClick={nextQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
}

export default AudioWordComplete;
