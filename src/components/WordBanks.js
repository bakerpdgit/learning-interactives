import React, { useState, useEffect } from "react";
import "./WordBanks.css";

function WordBanks({ text }) {
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

  const generateUUID = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  const parseInput = (text) => {
    const lines = text.split("\n").map((line, lineidx) => {
      const words = line.split(" ");
      let wordBank = words
        .filter((word) => word.startsWith("*"))
        .map((word) => ({
          word: word.substring(1),
          location: "bank",
          isTile: true,
          uuid: generateUUID(), // Assign a UUID
          lineIndex: lineidx,
        }));

      wordBank = shuffleArray(wordBank); // Shuffle the word bank here

      const sentence = words.map((wrd, wordIndex) => ({
        word: wrd.startsWith("*") ? "" : wrd,
        location: "sentence",
        index: wordIndex,
        isTile: wrd.startsWith("*"),
        uuid: wrd.startsWith("*") ? generateUUID() : null, // Assign UUIDs only to draggable words
      }));

      return { sentence, wordBank, completed: false };
    });

    return lines;
  };

  const [lines, setLines] = useState(parseInput(text));
  const [showCelebration, setShowCelebration] = useState(false);
  const [draggedWord, setDraggedWord] = useState(null);

  const onDragStart = (word) => {
    setDraggedWord(word);
  };

  const isSentenceCorrect = (sentence, originalLine) => {
    const currentSentence = sentence.map((wordObj) => wordObj.word).join(" ");
    const originalSentence = originalLine.replace(/\*/g, "").trim();
    return currentSentence === originalSentence;
  };

  useEffect(() => {
    let timer;
    if (showCelebration) {
      timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000); // Hide the celebration after 3 seconds
    }
    return () => clearTimeout(timer); // Clear the timer when the component unmounts or the effect re-runs
  }, [showCelebration]);

  const onDrop = (lineIndex, wordIndex) => {
    // Validation to ensure words are not dragged across different lines
    if (draggedWord.lineIndex !== lineIndex) {
      return; // Exit the function if the word is being dragged to a different line
    }
    let newLines = [...lines];
    let currentLine = { ...newLines[lineIndex] };
    let wordBank = [...currentLine.wordBank];

    // Case 1: Dragged from bank
    if (draggedWord.location === "bank") {
      const draggedWordObj = wordBank.find((w) => w.uuid === draggedWord.uuid);
      if (draggedWordObj) {
        wordBank = wordBank.filter((w) => w.uuid !== draggedWord.uuid);

        // Check if the target location is occupied, and if so, move that word back to the bank
        if (currentLine.sentence[wordIndex].word !== "") {
          wordBank.push(currentLine.sentence[wordIndex]);
        }

        currentLine.sentence[wordIndex] = draggedWordObj;
      }
    }
    // Case 2: Dragged from sentence
    else if (draggedWord.location === "sentence") {
      const originalLocation = currentLine.sentence[draggedWord.index];

      // Replace original location with a blank tile
      currentLine.sentence[draggedWord.index] = {
        word: "",
        location: "sentence",
        index: draggedWord.index,
      };

      // If the target location is occupied, move that word back to the bank
      if (currentLine.sentence[wordIndex].word !== "") {
        wordBank.push(currentLine.sentence[wordIndex]);
      }

      currentLine.sentence[wordIndex] = originalLocation;
    }

    currentLine.wordBank = wordBank; // Update the word bank
    newLines[lineIndex] = currentLine;

    // Check if the current sentence is correct
    newLines[lineIndex].completed = isSentenceCorrect(
      newLines[lineIndex].sentence,
      text.split("\n")[lineIndex]
    );

    // Check if all sentences are completed
    const allCompleted = newLines.every((line) => line.completed);
    setShowCelebration(allCompleted);

    setLines(newLines);
    setDraggedWord(null);
  };

  const renderSentence = (sentence, lineIndex) => {
    const sentenceCompleted = lines[lineIndex].completed;
    const sentenceClass = sentenceCompleted ? "sentence completed" : "sentence";

    return (
      <div key={lineIndex} className={sentenceClass}>
        {sentence.map((wordObj, wordIndex) => {
          if (wordObj.word === "") {
            // Blank tile - drop zone but not draggable
            return (
              <span
                key={wordIndex}
                className="wordTile gap"
                onDrop={() => onDrop(lineIndex, wordIndex)}
                onDragOver={(e) => e.preventDefault()}
              >
                _____
              </span>
            );
          } else {
            // Regular words are not droppable
            const wordClass = wordObj.isTile
              ? "wordTile draggable"
              : "regularWord";
            return (
              <span
                key={wordIndex}
                className={wordClass}
                draggable={wordObj.isTile}
                onDragStart={
                  wordObj.isTile
                    ? () =>
                        onDragStart({
                          ...wordObj,
                          location: "sentence",
                          index: wordIndex,
                        })
                    : undefined
                }
                onDrop={() => onDrop(lineIndex, wordIndex)}
                onDragOver={(e) => e.preventDefault()}
              >
                {wordObj.word}
              </span>
            );
          }
        })}
      </div>
    );
  };

  const renderWordBank = (wordBank, lineIndex) => {
    return wordBank.map((wordObj, index) => (
      <span
        key={index}
        className="wordTile draggable"
        draggable
        onDragStart={() => onDragStart({ ...wordObj, location: "bank", index })}
      >
        {wordObj.word}
      </span>
    ));
  };

  return (
    <>
      <h1 className="interactiveTitle">Word Banks</h1>
      <p className="instructions">
        Drag words into sentences to fill in the gaps.
      </p>
      <div className="interactiveContainer">
        <div className="dragToGapContainer">
          {lines.map((line, index) => (
            <div key={index}>
              <div className="sentence">
                {renderSentence(line.sentence, index)}
              </div>
              <div className="wordBank">
                {renderWordBank(line.wordBank, index)}
              </div>
            </div>
          ))}
          {showCelebration && <div className="celebration">😃</div>}
        </div>
      </div>
    </>
  );
}

export default WordBanks;
