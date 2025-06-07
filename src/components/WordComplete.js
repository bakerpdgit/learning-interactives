import React, { useState, useEffect } from "react";
import styles from "./WordComplete.module.css";

function WordComplete({ text }) {
  const initialWords = (text.match(/\*([a-zA-Z0-9]+)(?=[ ,.?!]|$)/g) || []).map(
    (w) => w.substring(1)
  );
  const [originalText, setOriginalText] = useState(text);
  const [score, setScore] = useState(0);
  const [originalTextIndex, setOriginalTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(originalText);
  const [asteriskedWords, setAsteriskedWords] = useState(initialWords);
  const [missingWordIndex, setMissingWordIndex] = useState(-1);
  const [mistakes, setMistakes] = useState(0);
  const [showCorrectWord, setShowCorrectWord] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

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
    const firstCharShown =
      !hasDigits && randomWord.length > 2 ? randomWord.charAt(0) : "";
    const lastCharShown =
      !hasDigits && randomWord.length > 2
        ? randomWord.charAt(randomWord.length - 1)
        : "";

    tempText =
      tempText.substring(0, randomIndex) +
      `<span class="${
        styles.missing
      }">${firstCharShown}<input type="text" class="${
        styles.missingInput
      }" data-word="${randomWord}" value="" size="${Math.min(
        randomWord.length - (hasDigits ? 0 : 2, 1)
      )}">${lastCharShown}</span>` +
      tempText.substring(randomIndex + randomWord.length);

    // Remove all asterisks from the tempText
    tempText = tempText.replace(/\*/g, "");
    setDisplayedText(tempText);
    setMissingWordIndex(randomWordIndex);
    setOriginalTextIndex(randomIndex);
  }, [originalText, asteriskedWords]);

  useEffect(() => {
    if (celebrate) {
      setDisplayedText(originalText);
    }
  }, [celebrate, displayedText, originalText]);

  useEffect(() => {
    const inputBox = document.querySelector(`.${styles.missingInput}`);
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
        setMistakes(0);

        const tempText =
          originalText.substring(0, originalTextIndex - 1) +
          originalText.substring(originalTextIndex);
        setOriginalText(tempText);

        const wordsLeft = asteriskedWords.filter(
          (word, index) => index !== missingWordIndex
        );
        if (wordsLeft.length === 0) {
          setCelebrate(true);
        }
        setAsteriskedWords(wordsLeft);
      } else {
        setMistakes((prevMistakes) => {
          if (prevMistakes === 2) {
            // On the third mistake
            setScore(0); // Reset score on any mistake
            setShowCorrectWord(true); // Show the correct word
            setTimeout(() => {
              setShowCorrectWord(false);
              setMistakes(0); // Reset mistakes count after showing the correct word
            }, 1000); // Hide after 1 second
            return prevMistakes + 1; // Keep the mistake count until the timeout is done
          }
          return prevMistakes + 1; // Increment mistakes count
        });
        inputBox.classList.add(styles.wrong);
      }
    }
  };

  return (
    <>
      {celebrate ? (
        <div className={styles.celebration}>
          <span className={styles.emoji} role="img" aria-label="celebrate">
            🎉
          </span>
        </div>
      ) : null}
      {showCorrectWord && (
        <div className={styles.correctWordContainer}>
          {asteriskedWords[missingWordIndex]}
        </div>
      )}
      <div className={styles.wordCompleteContainer}>
        {
          <>
            <div
              className={styles.textArea}
              onKeyUp={handleInput}
              dangerouslySetInnerHTML={{ __html: displayedText }}
            ></div>
            <div className={styles.mistakes}>{"✖".repeat(mistakes)}</div>
            <div className={styles.score}>
              <span className={styles.star}>★</span> {score}&nbsp;&nbsp;&nbsp;
              <span className={styles.todo}>📝 </span>
              {asteriskedWords.length}
            </div>
          </>
        }
      </div>
    </>
  );
}

export default WordComplete;
