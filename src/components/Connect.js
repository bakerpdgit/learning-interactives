import React, { useState, useEffect } from "react";
import styles from "./Connect.module.css";

const Tile = ({ word, onToggle, isSelected, isIncorrect, isMatched }) => {
  const handleClick = () => {
    if (!isMatched) {
      onToggle(word);
    }
  };

  return (
    <div
      className={`${styles.tile} ${isSelected ? styles.selected : ""} ${
        isMatched ? styles.matched : ""
      } ${isIncorrect ? styles.incorrect : ""}`}
      onClick={handleClick}
    >
      {word}
    </div>
  );
};

const OnlyConnect = ({ text }) => {
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [allWords, setAllWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [matchedGroups, setMatchedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [correctGroups, setCorrectGroups] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  const shuffleArray = (array) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; // Swap elements
    }
    return newArr;
  };

  useEffect(() => {
    const initialGroups = text
      .trim()
      .split("\n\n")
      .map((group) => group.split("\n"));

    setGroups(initialGroups);
    setAllWords(shuffleArray(initialGroups.flat()));
  }, [text]); // Only depend on 'text'

  useEffect(() => {
    if (matchedGroups.length === groups.length && matchedGroups.length > 0) {
      setGameCompleted(true);
      // Optional: Reset the celebration after a few seconds
      setTimeout(() => setGameCompleted(false), 4000);
    }
  }, [matchedGroups, groups]);

  const toggleWordSelection = (word) => {
    setSelectedWords((words) =>
      selectedWords.includes(word)
        ? selectedWords.filter((selectedWord) => selectedWord !== word)
        : [...selectedWords, word]
    );
  };

  const flashIncorrect = () => {
    setIsIncorrect(true);
    setTimeout(() => setIsIncorrect(false), 500); // Reset after 0.5 seconds
  };

  const checkGroups = () => {
    let newCorrectGroups = [...correctGroups];
    groups.forEach((group, index) => {
      const isFullGroupSelected = group.every((word) =>
        selectedWords.includes(word)
      );
      const isOnlyGroupSelected = selectedWords.every((selectedWord) =>
        group.includes(selectedWord)
      );

      if (
        isFullGroupSelected &&
        isOnlyGroupSelected &&
        !matchedGroups.includes(index)
      ) {
        setMatchedGroups((prev) => [...prev, index]);
        newCorrectGroups = [...newCorrectGroups, group];
        // Remove correctly guessed words from allWords to not display them in the main grid anymore
        setAllWords((prevAllWords) =>
          prevAllWords.filter((word) => !group.includes(word))
        );
      }
    });

    setCorrectGroups(newCorrectGroups);

    if (newCorrectGroups.length === correctGroups.length) {
      flashIncorrect();
    }

    setSelectedWords([]);
  };

  const handleCheck = () => {
    checkGroups();
    // Additional logic for checking completion of all groups and handling the game's end state
  };

  return (
    <>
      <h1>Connect</h1>
      <p className={styles.instructions}>
        Select groups of related words to identify all of the groups
        <br />
        <button onClick={handleCheck}>Check</button>
      </p>
      <div className={styles.GameAreaGrid}>
        {allWords.map((word, index) => (
          <Tile
            key={index}
            word={word}
            onToggle={toggleWordSelection}
            isSelected={selectedWords.includes(word)}
            isIncorrect={isIncorrect}
          />
        ))}
      </div>

      <div className={styles.CorrectArea}>
        {correctGroups.map((group, index) => (
          <div key={index} className={styles.CorrectGroup}>
            {group.map((word) => (
              <div key={word} className={styles.CorrectTile}>
                {word}
              </div>
            ))}
          </div>
        ))}
      </div>
      {gameCompleted && <div className={styles.celebrationEmoji}>🎉</div>}
    </>
  );
};

export default OnlyConnect;
