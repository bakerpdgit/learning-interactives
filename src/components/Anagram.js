import React, { useState, useEffect } from "react";
import "./Anagram.css";

function Anagram({ text }) {
  const parseOptions = (optionsLine) => {
    return Object.fromEntries(
      optionsLine
        .substring(8)
        .split(";")
        .map((option) => option.split("="))
    );
  };

  const checkSingleWordAnswers = (pairs) => {
    return pairs.some((pair) => pair.word.length === 1);
  };

  const parseInput = (text) => {
    const lines = text.split("\n\n");
    let options = {};

    if (lines[0].startsWith("OPTIONS:")) {
      options = parseOptions(lines.shift());
    }

    const mode = options.mode || "letter";

    const pairs = lines.map((pair) => {
      const [clue, word] = pair.split("\n");
      return {
        word: shuffleArray(mode === "word" ? word.split(" ") : word.split("")),
        originalWord: word,
        clue,
        correctAnswer: mode === "word" ? word.replace(/\s+/g, "") : word,
      };
    });

    const hasSingleWordAnswers =
      mode === "word" && checkSingleWordAnswers(pairs);
    return { pairs, hasSingleWordAnswers };
  };

  const shuffleArray = (array) => {
    if (array.length <= 1) {
      return array; // Return as-is for single item arrays
    }

    let shuffledArray = [...array];
    do {
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [
          shuffledArray[j],
          shuffledArray[i],
        ];
      }
    } while (shuffledArray.every((val, idx) => val === array[idx])); // Reshuffle if the order is the same as original

    return shuffledArray;
  };

  // Parse the input and initialize the state for word pairs
  const { pairs, hasSingleWordAnswers } = parseInput(text);

  const [wordPairs, setWordPairs] = useState(pairs);
  // eslint-disable-next-line
  const [singleWordError, setSingleWordError] = useState(hasSingleWordAnswers);

  const swapTiles = (pairIndex, dragIndex, dropIndex) => {
    const newWordPairs = [...wordPairs];
    const pair = newWordPairs[pairIndex];

    // Remove the dragged tile from its original position
    const [draggedTile] = pair.word.splice(dragIndex, 1);

    // Insert the dragged tile to the left of the drop position
    pair.word.splice(dropIndex, 0, draggedTile);

    setWordPairs(newWordPairs);

    const reconstructedPhrase = wordPairs[pairIndex].word.join("");

    if (reconstructedPhrase === wordPairs[pairIndex].correctAnswer) {
      const newWordPairs = [...wordPairs];
      newWordPairs[pairIndex].completed = true;
      setWordPairs(newWordPairs);
    }
  };

  const handleDragStart = (e, pairIndex, tileIndex) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ pairIndex, tileIndex })
    );
  };

  const handleDrop = (e, pairIndex, dropIndex) => {
    e.preventDefault();
    const { pairIndex: dragPairIndex, tileIndex: dragIndex } = JSON.parse(
      e.dataTransfer.getData("text/plain")
    );

    if (dragPairIndex === pairIndex) {
      swapTiles(pairIndex, dragIndex, dropIndex);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (wordPairs.every((pair) => pair.completed)) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000); // Hide the celebration icon after 2 seconds
    }
  }, [wordPairs]);

  return (
    <>
      <h1 className="interactiveTitle">Anagram</h1>
      <p className="instructions">
        Drag and drop items left or right to find the correct order.
      </p>
      <div className="interactiveContainer">
        <div className="anagramContainer">
          {singleWordError && (
            <div className="error">
              The puzzle below is not suitable because all answers should have
              more than one word to use word mode.
            </div>
          )}
          {showCelebration && <div className="celebration">😃</div>}
          {wordPairs.map((pair, pairIndex) => (
            <div
              key={pairIndex}
              className={`pair ${pair.completed ? "completed" : ""}`}
            >
              <div className="clue">{pair.clue}</div>
              <div className="word" onDragOver={handleDragOver}>
                {pair.word.map((letter, letterIndex) => (
                  <span
                    key={letterIndex}
                    className={`tile ${
                      letterIndex === pair.selectedTile ? "selected" : ""
                    }`}
                    draggable={!pair.completed}
                    onDragStart={(e) =>
                      handleDragStart(e, pairIndex, letterIndex)
                    }
                    onDrop={(e) => handleDrop(e, pairIndex, letterIndex)}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Anagram;
