import React, { useState, useEffect } from "react";
import "./WordComplete.css";

function WordComplete({ text }) {
  const [originalText, setOriginalText] = useState(text);
  const [score, setScore] = useState(0);
  const [originalTextIndex, setOriginalTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(originalText);
  const [asteriskedWords, setAsteriskedWords] = useState(
    (originalText.match(/\*([a-zA-Z0-9]+)(?=[ ,.?!]|$)/g) || []).map((w) =>
      w.substring(1)
    )
  );
  const [missingWordIndex, setMissingWordIndex] = useState("");

  useEffect(() => {
    let tempText = originalText;

    if (asteriskedWords.length === 0) return;

    const randomWordIndex = Math.floor(Math.random() * asteriskedWords.length);
    const randomWord = asteriskedWords[randomWordIndex];

    let matches = [];
    let match;
    const regex = new RegExp(`\\*${randomWord}\\b`, "g");

    while ((match = regex.exec(tempText))) {
      matches.push(match.index);
    }

    if (matches.length === 0) return;

    let randomIndex = matches[Math.floor(Math.random() * matches.length)] + 1;

    const hasDigits = /\d/.test(randomWord);
    const firstCharShown = !hasDigits ? randomWord.charAt(0) : "";
    const lastCharShown = !hasDigits
      ? randomWord.charAt(randomWord.length - 1)
      : "";

    tempText =
      tempText.substring(0, randomIndex) +
      `<span class="missing">${firstCharShown}<input type="text" class="missingInput" data-word="${randomWord}" value="" size="${
        randomWord.length - 2
      }">${lastCharShown}</span>` +
      tempText.substring(randomIndex + randomWord.length);

    // Remove all asterisks from the tempText
    tempText = tempText.replace(/\*/g, "");

    setDisplayedText(tempText);
    setMissingWordIndex(randomWordIndex);
    setOriginalTextIndex(randomIndex);
  }, [originalText, asteriskedWords]);

  useEffect(() => {
    const inputBox = document.querySelector(".missingInput");
    if (inputBox) {
      inputBox.focus();
    }
  }, [displayedText]);

  const handleInput = (e) => {
    if (e.key === "Enter") {
      const missingWord = asteriskedWords[missingWordIndex];
      const inputBox = e.target;

      let isCorrect;
      if (/^\d+$/.test(missingWord)) {
        isCorrect = inputBox.value === missingWord;
      } else {
        const userAnswer =
          missingWord.charAt(0) +
          inputBox.value +
          missingWord.charAt(missingWord.length - 1);
        isCorrect = userAnswer
          .toUpperCase()
          .includes(missingWord.toUpperCase());
      }

      if (isCorrect) {
        setScore((prevScore) => prevScore + 1);

        const tempText =
          originalText.substring(0, originalTextIndex - 1) +
          originalText.substring(originalTextIndex);
        setOriginalText(tempText);

        const wordsLeft = asteriskedWords.filter(
          (word, index) => index !== missingWordIndex
        );
        setAsteriskedWords(wordsLeft);
      } else {
        setScore(0);
        inputBox.classList.add("wrong");
      }
    }
  };

  return (
    <>
      <h1 className="interactiveTitle">Word Complete</h1>
      <div className="wordCompleteContainer">
        {asteriskedWords.length === 0 ? (
          <div className="celebration">
            <span className="emoji" role="img" aria-label="celebrate">
              🎉
            </span>
          </div>
        ) : (
          <>
            <div
              className="textArea"
              onKeyUp={handleInput}
              dangerouslySetInnerHTML={{ __html: displayedText }}
            ></div>
            <div className="score">
              <span className="star">★</span> {score}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default WordComplete;
