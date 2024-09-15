import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player"; // Included the missing import
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

  const playerRef = useRef(null);
  const audioRef = useRef(null); // Reference to the audio element
  const inputRefs = useRef({});
  const { imageData } = useEditContext(); // Access the local audio data

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
            url,
            startTime: parseFloat(startTime),
            endTime: parseFloat(endTime),
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
      setPlaying(true); // Start playing immediately
    } else if (currentBlockIndex >= blocks.length && blocks.length > 0) {
      setCelebrate(true);
    }
  }, [blocks, currentBlockIndex]);

  // Start or stop playback when currentBlock or playing state changes
  useEffect(() => {
    if (currentBlock) {
      if (playing) {
        if (currentBlock.url === "[local]") {
          if (audioRef.current) {
            audioRef.current.currentTime = currentBlock.startTime;
            audioRef.current.play().catch((error) => {
              console.error("Error playing audio:", error);
            });
          }
        } else {
          if (playerRef.current) {
            playerRef.current.seekTo(currentBlock.startTime, "seconds");
          }
        }
      } else {
        if (currentBlock.url === "[local]") {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        } else {
          // For YouTube, ReactPlayer handles pausing
        }
      }
    }
  }, [currentBlock, playing]);

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

  const handlePlayAudio = () => {
    setPlaying(false); // Stop any current playback
    setTimeout(() => {
      setPlaying(true); // Start playback
    }, 100); // Slight delay to ensure state updates
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      if (currentTime >= currentBlock.endTime) {
        audioRef.current.pause();
        setPlaying(false);
      }
    }
  };

  const handleAudioEnded = () => {
    setPlaying(false);
  };

  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    if (currentTime >= currentBlock.endTime) {
      setPlaying(false);
    }
  };

  const nextQuestion = () => {
    setCurrentBlockIndex((prevIndex) => prevIndex + 1);
    setPlaying(true); // Start playback for the next question
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
      <div className={styles.celebration}>
        <span role="img" aria-label="celebrate">
          🎉
        </span>
      </div>
    );
  }

  if (!currentBlock) {
    return null;
  }

  return (
    <div className={styles.audioWordCompleteContainer}>
      <div className={styles.audioPlayer}>
        <button onClick={handlePlayAudio}>Repeat Audio</button>
      </div>

      {currentBlock.url === "[local]" ? (
        <audio
          ref={audioRef}
          src={imageData ? URL.createObjectURL(imageData) : ""}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          style={{ display: "none" }}
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          url={currentBlock.url}
          playing={playing}
          controls={false}
          width="0"
          height="0"
          onProgress={handleProgress}
          onEnded={() => setPlaying(false)}
          config={{
            youtube: {
              playerVars: {
                autoplay: 1,
                controls: 0,
                start: currentBlock.startTime,
                end: currentBlock.endTime,
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
