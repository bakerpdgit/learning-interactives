import React, { useState, useEffect } from "react";
import styles from "./CarGame.module.css"; // Importing the CSS file as a module

const CarGame = ({ text }) => {
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  // Parsing and initializing words from text
  const [topic, setTopic] = useState("");
  const [words, setWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [carPosition, setCarPosition] = useState(windowHeight / 2);
  const [score, setScore] = useState(0);
  const [activeWords, setActiveWords] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);

  // Function to parse and shuffle text
  useEffect(() => {
    const parseText = (gameText) => {
      const [gameTopic, correctWordsText, incorrectWordsText] =
        gameText.split("\n\n");
      const correctWords = correctWordsText.split("\n");
      const incorrectWords = incorrectWordsText.split("\n");
      const shuffledWords = shuffleArray([...correctWords, ...incorrectWords]);
      setTopic(gameTopic);
      setWords(
        shuffledWords.map((word, index) => ({
          word,
          correct: correctWords.includes(word),
          key: index,
          position: windowWidth,
          top: Math.random() * (windowHeight - 20), // Random top position when first appearing
        }))
      );
    };

    parseText(text);
  }, [text, windowHeight, windowWidth]);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowUp") {
        setCarPosition((prevPosition) => Math.max(0, prevPosition - 50));
      } else if (event.key === "ArrowDown") {
        setCarPosition((prevPosition) =>
          Math.min(windowHeight, prevPosition + 50)
        );
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [windowHeight]);

  useEffect(() => {
    const wordReleaseInterval = setInterval(() => {
      if (wordIndex < words.length) {
        setActiveWords((prevWords) => [...prevWords, words[wordIndex]]);
        setWordIndex((prevIndex) => prevIndex + 1);
      } else {
        clearInterval(wordReleaseInterval);
      }
    }, 2000); // Release a new word every 2 seconds

    const moveInterval = setInterval(() => {
      setActiveWords((prevWords) =>
        prevWords
          .map((word) => ({ ...word, position: word.position - 5 }))
          .filter((word) => word.position > -100)
      );

      setActiveWords((prevWords) => {
        const newWords = [...prevWords];
        let scoreAdjustment = 0;

        newWords.forEach((word, index) => {
          // Detect collision with the car
          if (
            word.position <= windowWidth * 0.25 + 50 &&
            word.position >= windowWidth * 0.25 &&
            carPosition < word.top + 30 &&
            carPosition + 30 > word.top
          ) {
            if (word.correct) {
              scoreAdjustment += 1;
            } else {
              scoreAdjustment -= 1;
            }
            newWords.splice(index, 1); // Remove word on collision
          }
          // Adjust score for words that pass off screen without collision
          else if (word.position < 0) {
            if (!word.correct) {
              scoreAdjustment += 1;
            } else {
              scoreAdjustment -= 1;
            }
            newWords.splice(index, 1); // Remove word
          }
        });

        if (scoreAdjustment !== 0) {
          setScore((prevScore) => prevScore + scoreAdjustment);
        }

        return newWords;
      });

      // Check for game end condition
      if (activeWords.length === 0 && wordIndex >= words.length) {
        clearInterval(moveInterval);
        setGameEnded(true);
      }
    }, 50); // Move words every 50ms

    return () => {
      clearInterval(wordReleaseInterval);
      clearInterval(moveInterval);
    };
  }, [
    words,
    carPosition,
    windowHeight,
    windowWidth,
    activeWords.length,
    wordIndex,
  ]);

  return (
    <>
      <h1 className="interactiveTitle">{topic}</h1>
      <p className="instructions">
        Use the up and down arrows to control your car, collecting the correct
        words for the topic.
      </p>
      <p className={styles.score}>Score: {score}</p>
      <div className={styles.gameContainer}>
        <div className={styles.car} style={{ top: `${carPosition}px` }}></div>
        {activeWords.map(({ word, key, position, top }) => (
          <div
            key={key}
            className={styles.word}
            style={{ left: `${position}px`, top: `${top}px` }}
          >
            {word}
          </div>
        ))}
        {gameEnded && <div className={styles.endMessage}>Game Over!</div>}
      </div>
    </>
  );
};

export default CarGame;
