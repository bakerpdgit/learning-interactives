import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import styles from "./PhraseMemorise.module.css"; // Importing the CSS file

function PhraseMemorise({ text }) {
  const [phrases, setPhrases] = useState([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayModes, setDisplayModes] = useState([]);
  const [defaultDisplayMode, setDefaultDisplayMode] = useState("first"); // Added for dynamic update

  // Function to shuffle phrases if needed
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  // Parse OPTIONS and initialize states
  useEffect(() => {
    const lines = text.split("\n");
    const optionsLine = lines.find((line) => line.startsWith("OPTIONS:"));
    let order = "maintain"; // Default order

    // Parsing the OPTIONS line
    if (optionsLine) {
      const optionsParts = optionsLine.split(":")[1].split(",");
      optionsParts.forEach((part) => {
        const [key, value] = part.split("=");
        if (key === "show") setDefaultDisplayMode(value);
        if (key === "order") order = value;
      });
    }

    let filteredPhrases = lines.filter(
      (line) => line && !line.startsWith("OPTIONS:")
    );
    if (order === "random") filteredPhrases = shuffleArray(filteredPhrases);

    setPhrases(filteredPhrases);
    setCurrentPhraseIndex(0);
  }, [text]); // Re-run when text prop changes

  // Update words and displayModes when currentPhraseIndex changes
  useEffect(() => {
    if (phrases.length > 0 && currentPhraseIndex < phrases.length) {
      const words = phrases[currentPhraseIndex]
        .split(" ")
        .filter((word) => word);
      const newDisplayModes = words.map(() => {
        if (defaultDisplayMode === "all") return "full";
        if (defaultDisplayMode === "none") return "hidden";
        return "first";
      });
      setDisplayModes(newDisplayModes);
    }
  }, [currentPhraseIndex, phrases, defaultDisplayMode]); // Re-run when any of these dependencies change

  // Extract current words based on the currentPhraseIndex for rendering
  const words =
    phrases.length > 0 && currentPhraseIndex < phrases.length
      ? phrases[currentPhraseIndex].split(" ").filter((word) => word)
      : [];

  const toggleWord = (index) => {
    const newModes = [...displayModes];
    if (newModes[index] === "full") {
      newModes[index] = "hidden";
    } else if (newModes[index] === "first") {
      newModes[index] = "full";
    } else {
      newModes[index] = "first";
    }
    setDisplayModes(newModes);
  };

  const renderWord = (word, mode) => {
    if (mode === "full")
      return word.split("").map((letter, letterIndex) => (
        <span key={letterIndex} className={styles.letter}>
          {letter}
        </span>
      ));
    if (mode === "first")
      return [word.charAt(0), ..."_".repeat(word.length - 1).split("")].map(
        (letter, letterIndex) => (
          <span key={letterIndex} className={styles.letter}>
            {letter}
          </span>
        )
      );
    return "_"
      .repeat(word.length)
      .split("")
      .map((letter, letterIndex) => (
        <span key={letterIndex} className={styles.letter}>
          {letter}
        </span>
      ));
  };

  const handleNextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setDisplayModes(
        phrases[currentPhraseIndex + 1].split(" ").map(() => "first")
      );
    }
  };

  const handlePrevPhrase = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(currentPhraseIndex - 1);
      setDisplayModes(
        phrases[currentPhraseIndex - 1].split(" ").map(() => "first")
      );
    }
  };

  const revealAllWords = () => {
    setDisplayModes(new Array(words.length).fill("full"));
  };

  const resetWords = () => {
    setDisplayModes(words.map(() => defaultDisplayMode));
  };

  return (
    <>
      <h1 className="interactiveTitle">Phrase Memorise</h1>
      <p className="instructions">click each word to toggle its view</p>
      <div className={`interactiveContainer ${styles.phraseMemoriseContainer}`}>
        <div className={styles.phraseMemoriseBox}>
          {words.map((word, index) => (
            <span
              key={index}
              className={styles.clickableWord}
              onClick={() => toggleWord(index)}
            >
              {renderWord(word, displayModes[index])}{" "}
            </span>
          ))}
        </div>
        {phrases.length > 1 && (
          <div className={styles.navigationButtons}>
            <IconButton
              onClick={handlePrevPhrase}
              disabled={currentPhraseIndex === 0}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              onClick={handleNextPhrase}
              disabled={currentPhraseIndex === phrases.length - 1}
            >
              <ArrowForwardIcon />
            </IconButton>
          </div>
        )}
        <div className={styles.actionButtons}>
          <button onClick={revealAllWords}>Reveal</button>
          <button onClick={resetWords}>Reset</button>
        </div>
      </div>
    </>
  );
}

export default PhraseMemorise;
