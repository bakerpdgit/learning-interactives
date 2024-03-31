import React, { useState, useEffect, useRef } from "react";
import styles from "./CarGame.module.css";

const CarGame = ({ text }) => {
  const [topic, setTopic] = useState("");
  const [score, setScore] = useState(0);
  const wordsRef = useRef([]);
  const gameContainerRef = useRef(null);
  const goalieRef = useRef(null);
  const animationRef = useRef(null);

  console.log("REACT render");

  useEffect(() => {
    const parseText = (gameText) => {
      const gameStartTime = Date.now(); // Store the start time of the game
      const [gameTopic, correctWordsText, incorrectWordsText] =
        gameText.split("\n\n");
      setTopic(gameTopic);
      let cumulativeDelay = 0;

      const correctWords = correctWordsText.split("\n");
      const incorrectWords = incorrectWordsText.split("\n");
      const combinedWords = [
        ...correctWords.map((word) => ({ text: word, correct: true })),
        ...incorrectWords.map((word) => ({ text: word, correct: false })),
      ];

      const shuffledWords = shuffleArray(combinedWords);
      const segmentHeight = 100 / shuffledWords.length; // For vertical alignment

      shuffledWords.forEach((word, index) => {
        const wordElement = document.createElement("div");
        wordElement.className = styles.word; // Ensure you have defined this class in your CSS
        wordElement.textContent = word.text;
        wordElement.style.top = `${index * segmentHeight}%`; // Adjust for vertical alignment
        wordElement.style.left = "90%"; // Start off-screen to the right

        cumulativeDelay += 1000 + Math.random() * 1000; // Increment delay by 1 to 2 seconds for each word
        wordElement.dataset.startDelay = cumulativeDelay; // Set delay as a data attribute on the element

        // Append to the game container instead of the body
        if (gameContainerRef.current) {
          gameContainerRef.current.appendChild(wordElement);
        }

        // Store references to the word elements for later manipulation
        wordsRef.current.push({
          element: wordElement,
          speed: Math.random() * 3, // Speed between 1 and 3
          correct: word.correct,
        });
      });

      startWordMovement(gameStartTime);
    };

    parseText(text);

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      wordsRef.current.forEach((obj) => obj.element.remove()); // Clean up words
      clearInterval(animationRef.current); // Stop word movement
    };
  }, [text]);

  const startWordMovement = (gameStartTime) => {
    animationRef.current = setInterval(() => {
      const currentTime = Date.now();

      wordsRef.current.forEach((obj) => {
        const wordElement = obj.element;
        const startDelay = parseInt(wordElement.dataset.startDelay, 10);

        if (currentTime >= startDelay) {
          // Move the word if the current time is past the start delay
          let currentLeft = parseInt(wordElement.style.left, 10) || 100; // Adjust if starting off-screen
          if (currentLeft > 5) {
            currentLeft -= obj.speed;
            wordElement.style.left = `${currentLeft}%`;
          } else {
            // Handle reaching the end (e.g., mark correct/incorrect, update score)
          }
        }
      });
    }, 100);
  };

  const handleKeyPress = (event) => {
    if (!goalieRef.current) return;

    let currentPosition = parseInt(goalieRef.current.style.top, 10) || 0; // Default position
    const goalieHeight = parseInt(goalieRef.current.style.height, 10); // Read the hardcoded height

    if (event.key === "ArrowUp") {
      currentPosition = Math.max(0, currentPosition - 10);
    } else if (event.key === "ArrowDown") {
      currentPosition = Math.min(100 - goalieHeight, currentPosition + 10); // Ensure goalie stays within bounds
    }

    goalieRef.current.style.top = `${currentPosition}%`;
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  return (
    <>
      <h1>{topic}</h1>
      <div ref={gameContainerRef} className={styles.gameContainer}>
        <div
          ref={goalieRef}
          className={styles.goalie}
          style={{
            top: "45%",
            height: "10%",
            left: "10%",
          }}
        ></div>
        {/* Words and scoring */}
      </div>
      <div>Score: {score}</div>
    </>
  );
};

export default CarGame;
