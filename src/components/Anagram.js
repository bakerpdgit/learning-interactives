import React, { useState, useEffect } from "react";
import "./Anagram.css";

function Anagram({ text }) {
  const parseInput = (text) => {
    return text.split("\n\n").map((pair) => {
      const [clue, word] = pair.split("\n");
      return {
        word: shuffleArray(word.toUpperCase().split("")),
        originalWord: word.toUpperCase(),
        clue,
      };
    });
  };

  const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  const [wordPairs, setWordPairs] = useState(parseInput(text));

  const swapTiles = (pairIndex, tileIndex1, tileIndex2) => {
    const newWordPairs = [...wordPairs];
    const pair = newWordPairs[pairIndex];

    [pair.word[tileIndex1], pair.word[tileIndex2]] = [
      pair.word[tileIndex2],
      pair.word[tileIndex1],
    ];
    setWordPairs(newWordPairs);

    if (pair.word.join("") === pair.originalWord) {
      pair.completed = true;
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
    <div className="anagramContainer">
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
                onDragStart={(e) => handleDragStart(e, pairIndex, letterIndex)}
                onDrop={(e) => handleDrop(e, pairIndex, letterIndex)}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Anagram;
