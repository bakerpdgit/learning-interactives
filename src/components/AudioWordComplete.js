import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import styles from "./AudioWordComplete.module.css";

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
  const inputRefs = useRef({});

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
      // Remove inputRefs.current reset from here
    } else if (currentBlockIndex >= blocks.length && blocks.length > 0) {
      setCelebrate(true);
    }
  }, [blocks, currentBlockIndex]);

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
    if (playerRef.current) {
      playerRef.current.seekTo(currentBlock.startTime, "seconds");
      setPlaying(true);
    }
  };

  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    if (currentTime >= currentBlock.endTime) {
      setPlaying(false);
    }
  };

  const nextQuestion = () => {
    setCurrentBlockIndex((prevIndex) => prevIndex + 1);
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
