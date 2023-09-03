import React, { useState } from "react";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import "./PhraseMemorise.css"; // Importing the CSS file

function PhraseMemorise({ text }) {
  const phrases = text.split("\n").filter((phrase) => phrase);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const words = phrases[currentPhraseIndex].split(" ").filter((word) => word);
  const [displayModes, setDisplayModes] = useState(words.map(() => "first"));

  const toggleWord = (index) => {
    const newModes = [...displayModes];
    if (newModes[index] === "full") {
      newModes[index] = "first";
    } else if (newModes[index] === "first") {
      newModes[index] = "hidden";
    } else {
      newModes[index] = "full";
    }
    setDisplayModes(newModes);
  };

  const renderWord = (word, mode) => {
    if (mode === "full")
      return word.split("").map((letter, letterIndex) => (
        <span key={letterIndex} className="letter">
          {letter}
        </span>
      ));
    if (mode === "first")
      return [word.charAt(0), ..."_".repeat(word.length - 1).split("")].map(
        (letter, letterIndex) => (
          <span key={letterIndex} className="letter">
            {letter}
          </span>
        )
      );
    return "_"
      .repeat(word.length)
      .split("")
      .map((letter, letterIndex) => (
        <span key={letterIndex} className="letter">
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

  return (
    <>
      <h1 className="interactiveTitle">Phrase Memorise</h1>
      <div className="phraseMemoriseContainer">
        <div className="phraseMemoriseBox">
          {words.map((word, index) => (
            <span
              key={index}
              className="clickableWord"
              onClick={() => toggleWord(index)}
            >
              {renderWord(word, displayModes[index])}{" "}
            </span>
          ))}
        </div>
        {phrases.length > 1 && (
          <div className="navigationButtons">
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
      </div>
    </>
  );
}

export default PhraseMemorise;
