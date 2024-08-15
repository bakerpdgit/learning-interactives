import React, { useState, useEffect } from "react";
import styles from "./WordFind.module.css"; // Ensure you have corresponding CSS
import InputModal from "./InputModal";

const WordTile = ({ word, onRevealNextLetter, onGuess }) => {
  const [revealedLetters, setRevealedLetters] = useState(1);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleRevealNextLetter = () => {
    if (revealedLetters < word.length) {
      onRevealNextLetter(1, revealedLetters + 1 === word.length);
      setRevealedLetters((prev) => prev + 1);
    }
  };

  const markCorrect = () => {
    setIsCorrect(true); // Mark this tile as correct
    setRevealedLetters(word.length); // Reveal the full word
  };

  const handleGuess = () => {
    onGuess(markCorrect); // Trigger the modal and pass the markCorrect function
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
  const [inputMessage, setInputMessage] = useState({});

  const handleTileGuess = (word, wordIndex, markTileCorrect) => {
    setInputMessage({
      prompt: "Enter the full word:",
      value: "",
      word: word,
      wordIndex: wordIndex,
      markTileCorrect: markTileCorrect, // Pass the function to mark the tile correct
    });
  };

  const handleInputSubmit = (guess) => {
    if (guess && guess.toLowerCase() === inputMessage.word.toLowerCase()) {
      inputMessage.markTileCorrect(); // Call the function to mark the tile as correct
      handleCorrectGuess(); // Increment the correct guesses count in WordFind
    }
    setInputMessage({}); // Clear the inputMessage to close the modal
  };

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
      {inputMessage.prompt && (
        <InputModal
          title={inputMessage.prompt}
          placeholder="Type your guess here..."
          value={inputMessage.value}
          onSubmit={handleInputSubmit}
          onClose={() => setInputMessage({})}
        />
      )}

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
            onGuess={(markTileCorrect) =>
              handleTileGuess(word, index, markTileCorrect)
            } // Pass markTileCorrect to handleTileGuess
          />
        ))}
      </div>
    </>
  );
};

export default WordFind;
