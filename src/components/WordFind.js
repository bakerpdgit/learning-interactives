import React, { useState, useEffect } from "react";
import styles from "./WordFind.module.css"; // Ensure you have corresponding CSS

const WordTile = ({ word, onRevealNextLetter, onCorrectGuess }) => {
  const [revealedLetters, setRevealedLetters] = useState(1);
  const [isCorrect, setIsCorrect] = useState(false); // Track if the guess was correct

  const handleRevealNextLetter = () => {
    if (revealedLetters < word.length) {
      onRevealNextLetter(1, revealedLetters + 1 === word.length);
      setRevealedLetters((prev) => prev + 1);
    }
  };

  const handleGuess = () => {
    const guess = window.prompt("Enter the full word: ");
    if (guess && guess.toLowerCase() === word.toLowerCase()) {
      setIsCorrect(true);
      setRevealedLetters(word.length);
      onCorrectGuess();
    }
  };

  return (
    <div
      className={`${styles.wordTile} ${
        isCorrect || revealedLetters === word.length ? styles.correct : ""
      }`}
    >
      {word.slice(0, revealedLetters) +
        "_".repeat(word.length - revealedLetters)}
      {!isCorrect && revealedLetters < word.length && (
        <div className={styles.icons}>
          <button
            className={styles.wordFindButton}
            onClick={handleRevealNextLetter}
          >
            🔍
          </button>
          <button className={styles.wordFindButton} onClick={handleGuess}>
            ✏️
          </button>
        </div>
      )}
    </div>
  );
};

const WordFind = ({ text }) => {
  const [wordsEnded, setWordsEnded] = useState(0); // Count of correctly guessed words
  const [topic, setTopic] = useState("");
  const [wordList, setWordList] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (text.includes("\n\n")) {
      const [newTopic, words] = text.split("\n\n", 2);
      setTopic(newTopic);
      setWordList(words.split("\n"));
    } else {
      setWordList(text.split("\n"));
    }
  }, [text]);

  useEffect(() => {
    if (wordList.length > 0) {
      setScore(wordList.reduce((acc, word) => acc + word.length - 1, 0));
    }
  }, [wordList]);

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
