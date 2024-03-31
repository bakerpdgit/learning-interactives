import React, { useState, useEffect } from "react";
import styles from "./WordSearch.module.css";

function WordSearch({ text }) {
  const [gridSize, setGridSize] = useState(12);
  const [showWords, setShowWords] = useState(false);
  const [title, setTitle] = useState("");
  const [words, setWords] = useState([]);
  const [grid, setGrid] = useState([]);
  const [revealWords, setRevealWords] = useState(false);
  const [wordPlacements, setWordPlacements] = useState([]);
  const [usedCoordinates, setUsedCoordinates] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [wordsToFind, setWordsToFind] = useState(words.length);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const lines = text.split("\n");
    const optionsLine = lines[0];
    const options = optionsLine.slice(8).split(",");
    let simpleMode = false;
    let sizeChoice = 10;
    let showChoice = true;

    options.forEach((option) => {
      const [key, value] = option.split("=");
      if (key.trim().toLowerCase() === "size") {
        sizeChoice = parseInt(value);
        setGridSize(sizeChoice);
      } else if (key.trim().toLowerCase() === "show") {
        showChoice = value.trim().toLowerCase() === "yes";
        setShowWords(showChoice);
      } else if (key.trim().toLowerCase() === "simple") {
        simpleMode = value.trim().toLowerCase() === "yes";
      }
    });

    setTitle(lines[1]);
    const tempWordsList = lines.slice(2).filter((word) => word.trim() !== "");
    const uppercaseWordsList = tempWordsList.map((word) => word.toUpperCase());
    setWords(uppercaseWordsList);
    setWordsToFind(uppercaseWordsList.length);

    // Check if any word is longer than the grid size
    const isAnyWordTooLong = uppercaseWordsList.some(
      (word) => word.length > sizeChoice
    );

    if (isAnyWordTooLong || sizeChoice > 20 || sizeChoice < 5) {
      setFailed(true);
    } else {
      const { newGrid, newWordPlacements, newUsedCoordinates } =
        generateWordSearch(sizeChoice, uppercaseWordsList, simpleMode);
      setGrid(newGrid);
      setWordPlacements(newWordPlacements);
      setUsedCoordinates(newUsedCoordinates);

      if (newGrid.length === 0) {
        setFailed(true);
      }
    }
  }, [text, gridSize]);

  const handleReveal = () => {
    setRevealWords(true);
  };

  function isPartOfWord(rowIndex, colIndex) {
    return usedCoordinates.includes(`${rowIndex}-${colIndex}`);
  }

  const handleCellClick = (rowIndex, colIndex) => {
    if (revealWords) {
      return;
    }
    const selectedCell = `${rowIndex}-${colIndex}`;
    const updatedSelectedLetters = [...selectedLetters];

    if (selectedLetters.length === 2) {
      updatedSelectedLetters.splice(0, 2);
    }

    updatedSelectedLetters.push(selectedCell);
    setSelectedLetters(updatedSelectedLetters);

    if (updatedSelectedLetters.length === 2) {
      checkSelectedWord(updatedSelectedLetters);
    }
  };

  const markWordAsFound = (word) => {
    setFoundWords([...foundWords, word]);
    setSelectedLetters([]);
    setWordsToFind((prevCount) => prevCount - 1);
  };

  const checkSelectedWord = (selectedCells) => {
    const [startCell, endCell] = selectedCells;
    const [selectedStartRow, selectedStartCol] = startCell
      .split("-")
      .map(Number);
    const [selectedEndRow, selectedEndCol] = endCell.split("-").map(Number);

    for (const { word, startRow, startCol, direction } of wordPlacements) {
      const { dx, dy } = direction;
      const wordLength = word.length;

      if (
        selectedStartRow === startRow &&
        selectedStartCol === startCol &&
        selectedEndRow === startRow + (wordLength - 1) * dy &&
        selectedEndCol === startCol + (wordLength - 1) * dx
      ) {
        markWordAsFound(word);
        return;
      }
    }

    setSelectedLetters([]);
  };

  function isPartOfFoundWord(rowIndex, colIndex, word) {
    for (const {
      word: foundWord,
      startRow,
      startCol,
      direction,
    } of wordPlacements) {
      if (foundWord === word) {
        const { dx, dy } = direction;
        const wordLength = word.length;

        for (let i = 0; i < wordLength; i++) {
          if (
            rowIndex === startRow + i * dy &&
            colIndex === startCol + i * dx
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  return failed ? (
    <>
      <h1>{title}</h1>
      <p className={styles.instructions}>
        Failed to create wordsearch: refresh to try again or change the puzzle
        to use a different grid size.
      </p>
    </>
  ) : (
    <>
      <h1>{title}</h1>
      <p className={styles.instructions}>
        Click the first and then last letter of a word to mark it in the grid.
      </p>
      {wordsToFind === 0 && words.length > 0 && (
        <div className={styles.celebration}>😃</div>
      )}
      <div className={styles.Container}>
        <div className={styles.GameArea}>
          <div
            className={styles.WordSearchGrid}
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.WordSearchRow}>
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`${styles.WordSearchCell} ${
                      revealWords && isPartOfWord(rowIndex, colIndex)
                        ? styles.RevealedCell
                        : ""
                    } ${
                      selectedLetters.includes(`${rowIndex}-${colIndex}`)
                        ? styles.SelectedCell
                        : ""
                    } ${
                      foundWords.some((word) =>
                        isPartOfFoundWord(rowIndex, colIndex, word)
                      )
                        ? styles.FoundCell
                        : ""
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {!showWords && (
            <div className={styles.WordList}>
              <h2>Words to Find:</h2>
              <ul>
                <li>{wordsToFind}</li>
              </ul>
            </div>
          )}

          {showWords && (
            <div className={styles.WordList}>
              <h2>Words to Find:</h2>
              <ul>
                {words.map((word, index) => (
                  <li
                    key={index}
                    className={
                      foundWords.includes(word) ? styles.FoundWord : ""
                    }
                  >
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button onClick={handleReveal} className={styles.RevealButton}>
          Reveal
        </button>
      </div>
    </>
  );
}
const canFitWord = (
  grid,
  word,
  startRow,
  startCol,
  direction,
  allowOverlap = false
) => {
  const { dx, dy } = direction;
  const wordLength = word.length;
  let row = startRow;
  let col = startCol;

  for (let i = 0; i < wordLength; i++) {
    if (
      row < 0 ||
      row >= grid.length ||
      col < 0 ||
      col >= grid[0].length ||
      (!allowOverlap && grid[row][col] !== "") ||
      (allowOverlap && grid[row][col] !== "" && grid[row][col] !== word[i])
    ) {
      return false;
    }
    row += dy;
    col += dx;
  }
  return true;
};

const fitWord = (grid, word, startRow, startCol, direction) => {
  const { dx, dy } = direction;
  const wordLength = word.length;
  let row = startRow;
  let col = startCol;

  for (let i = 0; i < wordLength; i++) {
    grid[row][col] = word[i];
    row += dy;
    col += dx;
  }
};

const generateWordSearch = (size, words, simpleMode) => {
  let directions = simpleMode
    ? [
        { dx: 1, dy: 0 }, // Right
        { dx: 0, dy: 1 }, // Down
        { dx: 1, dy: 1 }, // Diagonal (down-right)
        { dx: 1, dy: -1 }, // Diagonal (up-right)
      ]
    : [
        { dx: 1, dy: 0 }, // Right
        { dx: -1, dy: 0 }, // Left
        { dx: 0, dy: 1 }, // Down
        { dx: 0, dy: -1 }, // Up
        { dx: 1, dy: 1 }, // Diagonal (down-right)
        { dx: -1, dy: 1 }, // Diagonal (down-left)
        { dx: 1, dy: -1 }, // Diagonal (up-right)
        { dx: -1, dy: -1 }, // Diagonal (up-left)
      ];

  // Shuffle the directions array using Fisher-Yates shuffle algorithm
  for (let i = directions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [directions[i], directions[j]] = [directions[j], directions[i]];
  }

  const newGrid = Array(size)
    .fill()
    .map(() => Array(size).fill(""));

  const newWordPlacements = [];
  const newUsedCoordinates = [];

  let wordIndex = 0;
  for (const word of words) {
    let fitted = false;
    const startTime = Date.now();

    while (!fitted && Date.now() - startTime < 4000) {
      let dirChange = parseInt((Date.now() - startTime) / 500);
      const direction = directions[(wordIndex + dirChange) % directions.length];
      const startRow = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * size);

      if (canFitWord(newGrid, word, startRow, startCol, direction)) {
        fitWord(newGrid, word, startRow, startCol, direction);
        fitted = true;
        newWordPlacements.push({ word, startRow, startCol, direction });
        for (let i = 0; i < word.length; i++) {
          const rowCoord = startRow + i * direction.dy;
          const colCoord = startCol + i * direction.dx;
          newUsedCoordinates.push(`${rowCoord}-${colCoord}`);
        }
      }
    }

    if (!fitted) {
      return { newGrid: [], newWordPlacements: [], newUsedCoordinates: [] }; // Failed to fit all words
    }
    wordIndex++;
  }

  // Fill remaining cells with random letters
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (newGrid[row][col] === "") {
        newGrid[row][col] = String.fromCharCode(
          Math.floor(Math.random() * 26) + 65
        );
      }
    }
  }

  return { newGrid, newWordPlacements, newUsedCoordinates };
};

export default WordSearch;
