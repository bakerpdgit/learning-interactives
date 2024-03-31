import React, { useState, useEffect } from "react";
import styles from "./CarGame.module.css";

const CarGame = ({ text }) => {
  const [topic, setTopic] = useState("");
  const [words, setWords] = useState([]);
  const [completedWords, setCompletedWords] = useState(new Set());
  const [goaliePosition, setGoaliePosition] = useState(50); // Initial position, as a percentage
  const [animationStartTime, setAnimationStartTime] = useState(null);

  useEffect(() => {
    const parseText = (gameText) => {
      const [gameTopic, correctWordsText, incorrectWordsText] =
        gameText.split("\n\n");
      setTopic(gameTopic);

      const correctWords = correctWordsText.split("\n");
      const incorrectWords = incorrectWordsText.split("\n");
      const combinedWords = [
        ...correctWords.map((word) => ({ text: word, correct: true })),
        ...incorrectWords.map((word) => ({ text: word, correct: false })),
      ];

      // Shuffle the combined array of words
      const shuffledWords = shuffleArray(combinedWords);

      // Calculate segment height based on the number of words
      const segmentHeight = 100 / shuffledWords.length;

      let words = shuffledWords.map((word, index) => ({
        ...word,
        speed: 5 + Math.random() * 3, // Random speed between 5s and 8s
        top: index * segmentHeight + segmentHeight / 2 - 5, // Center in its segment
      }));

      setWords(words);

      const GOALIE_POSITION = 10; // Example goalie position in percentage of container width
      const GOALIE_WIDTH = 1; // Example goalie width in percentage of container width
      const WORD_WIDTH = 10; // Example word width in percentage of container width
      const CONTAINER_WIDTH = 100; // Assuming 100% is the full width for easy calculation

      const animStart = Date.now();
      setAnimationStartTime(animStart);

      words.forEach((word, index) => {
        const wordTravelDistance = CONTAINER_WIDTH - GOALIE_POSITION;

        // Calculate when the left of the word hits the goalie's left position
        const intersectionStart =
          (wordTravelDistance - WORD_WIDTH) * 10 * word.speed;
        // Calculate when the right of the word clears the goalie's right position
        const intersectionEnd = wordTravelDistance * 10 * word.speed;

        console.log(
          `Word ${index}: Start Intersection: ${intersectionStart}, End Intersection: ${intersectionEnd}`
        );
      });
    };

    parseText(text);
  }, [text]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowUp") {
        setGoaliePosition((prevPosition) => Math.max(0, prevPosition - 10)); // Move up, with limits
      } else if (event.key === "ArrowDown") {
        setGoaliePosition((prevPosition) => Math.min(100, prevPosition + 10)); // Move down, with limits
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const markWordAsCompleted = (index) => {
    setCompletedWords((prev) => new Set(prev).add(index));
  };

  return (
    <>
      <h1>{topic}</h1>
      <div className={styles.gameContainer}>
        <div className={styles.goalLine}></div>
        <div
          className={styles.goalie}
          style={{ top: `${goaliePosition}%` }}
        ></div>
        {words.map((word, index) => (
          <div
            key={index}
            className={`${styles.word} ${
              completedWords.has(index)
                ? word.correct
                  ? styles.correctWord
                  : styles.incorrectWord
                : ""
            }`}
            style={{
              top: `${word.top}%`,
              "--animation-duration": `${word.speed}s`,
            }}
            onAnimationEnd={() => markWordAsCompleted(index)}
          >
            {word.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default CarGame;
