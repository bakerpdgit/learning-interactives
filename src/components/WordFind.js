import React, { useState } from "react";
import styles from "./WordFind.module.css"; // Ensure you have corresponding CSS

const WordTile = ({ word, onRevealNextLetter, onCorrectGuess }) => {
  const [revealedLetters, setRevealedLetters] = useState(1);
  const [isCorrect, setIsCorrect] = useState(false); // Track if the guess was correct
  const [showWrongGuess, setShowWrongGuess] = useState(false); // New state for wrong guess feedback

  const handleRevealNextLetter = () => {
    if (revealedLetters < word.length) {
      onRevealNextLetter(1, revealedLetters + 1 === word.length); // Assuming this reduces the potential score by 1
      setRevealedLetters((prev) => prev + 1);
    }
  };

  const handleGuess = () => {
    const guess = window.prompt("Enter the full word: ");
    if (guess && guess.toLowerCase() === word.toLowerCase()) {
      setIsCorrect(true); // This word tile now knows it's correctly guessed
      setRevealedLetters(word.length); // Reveal the whole word
      onCorrectGuess();
    } else {
      // If guess is incorrect, show red border
      setShowWrongGuess(true);
      setTimeout(() => {
        setShowWrongGuess(false); // Remove red border after 0.25 seconds
      }, 500);
    }
  };

  return (
    <div
      className={`${styles.wordTile} ${
        showWrongGuess ? styles.wrongGuess : ""
      } ${isCorrect ? styles.correct : ""}`}
    >
      {isCorrect
        ? word
        : word.slice(0, revealedLetters) +
          "_".repeat(word.length - revealedLetters)}
      <div className={styles.icons}>
        {!isCorrect && (
          <>
            <button
              className={styles.wordFindButton}
              onClick={handleRevealNextLetter}
            >
              🔍
            </button>
            <button className={styles.wordFindButton} onClick={handleGuess}>
              ✏️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const WordFind = ({ text }) => {
  const [wordsEnded, setWordsEnded] = useState(0); // Count of correctly guessed words
  const [topic, words] = text.split("\n\n", 2);
  const wordList = words.split("\n");

  const [score, setScore] = useState(
    wordList.reduce((acc, word) => acc + word.length - 1, 0)
  );

  const handleRevealNextLetter = (decrement, isFinished) => {
    setScore((prevScore) => prevScore - decrement);
    if (isFinished) {
      setWordsEnded((prev) => prev + 1);
    }
  };

  const handleCorrectGuess = () => {
    setWordsEnded((prev) => prev + 1);
  };

  return (
    <>
      <h1>{topic}</h1>
      <p className={styles.instructions}>
        Guess all the words related to the above topic with as few letters
        needed as possible to get your best score.
      </p>
      <div className={styles.score}>
        {wordsEnded !== wordList.length && <>Possible</>} Score: {score}
      </div>
      <div className={styles.GameAreaGrid}>
        {wordsEnded === wordList.length && (
          <div className={styles.celebration}>🎂</div>
        )}

        {wordList.map((word, index) => (
          <WordTile
            key={index}
            word={word}
            wordIndex={index}
            onRevealNextLetter={handleRevealNextLetter}
            onCorrectGuess={handleCorrectGuess}
          />
        ))}
      </div>
    </>
  );
};

export default WordFind;
