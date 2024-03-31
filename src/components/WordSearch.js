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
      return;
    }

    let attempts = 0;
    let success = false;
    while (attempts < 3 && !success) {
      const { grid, wordPlacements, usedCoordinates } = generateWordSearch(
        sizeChoice,
        uppercaseWordsList,
        simpleMode
      );

      if (grid.length !== 0) {
        setGrid(grid);
        setWordPlacements(wordPlacements);
        setUsedCoordinates(usedCoordinates);
        success = true; // Successfully generated the grid
      } else {
        attempts++;
      }
    }

    if (!success) {
      setFailed(true);
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
function generateWordSearch(size, words, simpleMode) {
  const directions = simpleMode
    ? [
        { dx: 1, dy: 0 }, // Right
        { dx: 0, dy: 1 }, // Down
        { dx: 1, dy: 1 }, // Diagonal down-right
        { dx: -1, dy: 1 }, // Diagonal up-right
      ]
    : [
        { dx: 1, dy: 0 }, // Right
        { dx: -1, dy: 0 }, // Left
        { dx: 0, dy: 1 }, // Down
        { dx: 0, dy: -1 }, // Up
        { dx: 1, dy: 1 }, // Diagonal down-right
        { dx: -1, dy: 1 }, // Diagonal down-left
        { dx: 1, dy: -1 }, // Diagonal up-right
        { dx: -1, dy: -1 }, // Diagonal up-left
      ];

  let grid = Array.from({ length: size }, () => Array(size).fill(""));
  let wordPlacements = [];
  let usedCoordinates = [];

  words.forEach((word) => {
    let isolatedOrOverlapAndIsolated = [];
    let overlappingButNotIsolated = [];
    let nonIsolated = [];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        directions.forEach((direction) => {
          const { fits, hasOverlap, isIsolated } = canFitWord(
            grid,
            word,
            row,
            col,
            direction,
            simpleMode
          );
          if (fits) {
            const placement = { word, startRow: row, startCol: col, direction };
            if (isIsolated) {
              isolatedOrOverlapAndIsolated.push(placement);
              if (hasOverlap) {
                isolatedOrOverlapAndIsolated.push(placement);
                isolatedOrOverlapAndIsolated.push(placement);
                isolatedOrOverlapAndIsolated.push(placement);
                isolatedOrOverlapAndIsolated.push(placement); // Add quad to increase likelihood of selection
              }
            } else if (hasOverlap) {
              overlappingButNotIsolated.push(placement);
            } else {
              nonIsolated.push(placement);
            }
          }
        });
      }
    }

    // Selection logic
    let selectedPossibilities =
      isolatedOrOverlapAndIsolated.length > 0
        ? isolatedOrOverlapAndIsolated
        : overlappingButNotIsolated.length > 0
        ? overlappingButNotIsolated
        : nonIsolated;

    if (selectedPossibilities.length > 0) {
      const selectedPlacement =
        selectedPossibilities[
          Math.floor(Math.random() * selectedPossibilities.length)
        ];
      fitWord(
        grid,
        selectedPlacement.word,
        selectedPlacement.startRow,
        selectedPlacement.startCol,
        selectedPlacement.direction
      );
      wordPlacements.push(selectedPlacement);
      // Update usedCoordinates based on the selected placement
      for (let i = 0; i < word.length; i++) {
        const row =
          selectedPlacement.startRow + i * selectedPlacement.direction.dy;
        const col =
          selectedPlacement.startCol + i * selectedPlacement.direction.dx;
        usedCoordinates.push(`${row}-${col}`);
      }
    } else {
      // Returning early with failure state if no placement is possible for a word
      return { grid: [], wordPlacements: [], usedCoordinates: [] };
    }
  });

  // Fill in remaining letters
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === "") {
        grid[row][col] = String.fromCharCode(
          Math.floor(Math.random() * 26) + 65
        );
      }
    }
  }

  return { grid, wordPlacements, usedCoordinates };
}

function canFitWord(grid, word, startRow, startCol, direction, noOverlap) {
  let hasOverlap = false;
  let isIsolated = true;
  // Make a deep copy of the grid
  let gridCopy = grid.map((row) => row.slice());

  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.dy;
    const col = startCol + i * direction.dx;

    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
      return { fits: false, hasOverlap: false, isIsolated: false };
    }

    if (grid[row][col] !== "" && grid[row][col] !== word[i]) {
      return { fits: false, hasOverlap: false, isIsolated: false };
    }

    if (grid[row][col] === word[i]) {
      hasOverlap = true;
      if (noOverlap) {
        return { fits: false, hasOverlap: true, isIsolated: false };
      }
      // Set the overlap point and its adjacent squares to empty in the copy
      setEmptyInGridCopy(gridCopy, row, col);
    }
  }

  // Perform the isolation check on the modified grid copy
  isIsolated = checkIsolated(
    gridCopy,
    startRow,
    startCol,
    word.length,
    direction
  );

  return { fits: true, hasOverlap, isIsolated };
}

function setEmptyInGridCopy(gridCopy, row, col) {
  const adjacentPositions = [
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ];
  adjacentPositions.forEach(({ dx, dy }) => {
    const adjRow = row + dy;
    const adjCol = col + dx;
    if (
      adjRow >= 0 &&
      adjRow < gridCopy.length &&
      adjCol >= 0 &&
      adjCol < gridCopy[0].length
    ) {
      gridCopy[adjRow][adjCol] = ""; // Set adjacent cells to empty
    }
  });
  gridCopy[row][col] = ""; // Also set the overlap cell itself to empty
}

function checkIsolated(gridCopy, startRow, startCol, wordLength, direction) {
  for (let i = 0; i < wordLength; i++) {
    const row = startRow + i * direction.dy;
    const col = startCol + i * direction.dx;

    // Simply check adjacent cells in the grid copy for emptiness
    if (!areAdjacentCellsEmpty(gridCopy, row, col)) {
      return false;
    }
  }
  return true;
}

function areAdjacentCellsEmpty(gridCopy, row, col) {
  const adjacentPositions = [
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ];
  for (const { dx, dy } of adjacentPositions) {
    const adjRow = row + dy;
    const adjCol = col + dx;
    if (
      adjRow >= 0 &&
      adjRow < gridCopy.length &&
      adjCol >= 0 &&
      adjCol < gridCopy[0].length
    ) {
      if (gridCopy[adjRow][adjCol] !== "") {
        return false; // Found a non-empty adjacent cell
      }
    }
  }
  return true; // All adjacent cells are empty
}

const fitWord = (grid, word, startRow, startCol, direction) => {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.dy;
    const col = startCol + i * direction.dx;
    grid[row][col] = word[i];
  }
};

export default WordSearch;
