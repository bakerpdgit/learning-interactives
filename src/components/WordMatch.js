import Celebration from "./Celebration";
import React, { useState, useEffect } from "react";
import styles from "./WordMatch.module.css";

const WordMatch = ({ text }) => {
  const [input, setInput] = useState("");
  const [solvedWords, setSolvedWords] = useState([]);
  const [topic, setTopic] = useState("");
  const [words, setWords] = useState([]);
  const [longestWordLength, setLongestWordLength] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (text.includes("\n\n")) {
      const [newTopic, wordList] = text.split("\n\n", 2);
      setTopic(newTopic);
      const wrds = wordList.split("\n");
      setWords(wrds);
      setLongestWordLength(Math.max(...wrds.map((word) => word.length)));
    } else {
      const wrds = text.split("\n");
      setWords(wrds);
      setLongestWordLength(Math.max(...wrds.map((word) => word.length)));
    }
  }, [text]);

  const cleanInput = (value) => value.toLowerCase().replace(/[^a-z]/g, "").slice(0, longestWordLength);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey ||
          event.target.closest?.("input, textarea, select, [contenteditable=true]")) return;
      if (event.key === "Backspace") {
        event.preventDefault();
        setInput((previous) => previous.slice(0, -1));
      } else if (/^[a-z]$/i.test(event.key)) {
        setInput((previous) => (previous + event.key.toLowerCase()).slice(0, longestWordLength));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [longestWordLength]);

  useEffect(() => {
    const checkWords = (currentInput) => {
      const newSolvedWords = words.filter(
        (word) => word === currentInput && !solvedWords.includes(word)
      );
      if (newSolvedWords.length > 0) {
        setSolvedWords([...solvedWords, ...newSolvedWords]);
        setScore((prevScore) => prevScore + 1); // Increase score
        setInput("");
      }
    };

    checkWords(input);
  }, [input, solvedWords, words]);

  const renderWordTiles = () => {
    return words.map((word, wordIndex) => (
      <div key={wordIndex} className={styles.wordRow}>
        {Array.from({ length: longestWordLength }, (_, charIndex) => {
          const char = input[charIndex] || "";
          const isCorrect =
            char !== "" &&
            word[charIndex] &&
            char.toUpperCase() === word[charIndex].toUpperCase();
          const isInWord = char !== "" && word.includes(char);

          // Determine the color of the box
          const boxColor =
            charIndex >= word.length // Extra boxes beyond the word's length
              ? styles.unusedBox
              : solvedWords.includes(word)
              ? styles.correctBox // Entire word is solved
              : isCorrect
              ? styles.correctChar
              : isInWord
              ? styles.inWordChar
              : char !== ""
              ? styles.wrongChar
              : "";

          return (
            <div key={charIndex} className={`${styles.wordBox} ${boxColor}`}>
              {solvedWords.includes(word)
                ? word[charIndex] || ""
                : charIndex < word.length
                ? char
                : ""}
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className={styles.wordMatchContainer}>
      <h1>{topic}</h1>
      <div className={styles.score}>Score: {score}</div>
      <label className={styles.guess}>
        Your guess
        <input type="text" inputMode="text" autoComplete="off" autoCapitalize="none"
          spellCheck={false} value={input} onChange={(event) => setInput(cleanInput(event.target.value))} />
      </label>
      <div className={styles.wordsContainer} style={{ "--word-columns": Math.max(1, longestWordLength) }}>
        {renderWordTiles()}
      </div>
      {solvedWords.length === words.length && (
        <Celebration />
      )}
    </div>
  );
};

export default WordMatch;
