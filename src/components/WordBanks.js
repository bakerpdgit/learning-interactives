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
    const lines = text.split("\n").map((line, lineIndex) => {
      let sentenceParts = [];
      let wordBank = [];
      let currentWord = "";

      const processAsteriskWord = (substring) => {
        let extractedWord = "";
        let i = 0;
        // Skip the asterisk itself
        i++;

        while (i < substring.length) {
          const char = substring[i];
          // Check if it's acceptable punctuation within an asterisked word (e.g., decimals)
          const isAcceptablePunctuation =
            char === "." &&
            i + 1 < substring.length &&
            /\d/.test(substring[i + 1]);
          // Continue if it's a letter, digit, or acceptable punctuation; stop otherwise
          if (/\w/.test(char) || isAcceptablePunctuation) {
            extractedWord += char;
          } else {
            // Stop on encountering other punctuation or whitespace unless first character
            // or unless it is a hyphen or underscore
            if (i === 0 || /[-_]/.test(char)) {
              extractedWord += char;
            } else {
              break;
            }
          }
          i++;
        }

        // Return the extracted word and the remaining substring
        return { extractedWord, remainder: substring.slice(i) };
      };

      let i = 0;
      while (i < line.length) {
        const char = line[i];
        if (char === "*" && currentWord.length === 0) {
          if (currentWord) {
            // End current word on encountering an asterisk
            sentenceParts.push({
              word: currentWord,
              location: "sentence",
              isTile: false,
              uuid: null,
            });
            currentWord = "";
          }
          // Process the asterisk word
          const { extractedWord, remainder } = processAsteriskWord(
            line.slice(i)
          );
          // Add the extracted word to the word bank
          wordBank.push({
            word: extractedWord,
            location: "bank",
            isTile: true,
            uuid: generateUUID(),
            lineIndex,
          });

          sentenceParts.push({
            word: "",
            location: "sentence",
            isTile: true,
            uuid: generateUUID(), // Assign a UUID
          });

          line = remainder;
          i = 0;
        } else {
          if (/\s/.test(char) && currentWord) {
            // End current word on encountering whitespace
            sentenceParts.push({
              word: currentWord,
              location: "sentence",
              isTile: false,
              uuid: null,
            });
            currentWord = "";
          } else if (!/\s/.test(char)) {
            currentWord += char;
          }
          i++;
        }
      }

      // Check for any remaining word at the end
      if (currentWord) {
        sentenceParts.push({
          word: currentWord,
          location: "sentence",
          isTile: false,
          uuid: null,
        });
      }

      // Shuffle the word bank
      wordBank = shuffleArray(wordBank);

      return {
        sentence: sentenceParts.map((part, index) => ({
          ...part,
          index,
          uuid: part.uuid,
        })),
        wordBank,
        completed: false,
      };
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
    // Join the words in the sentence, then remove all whitespace
    const currentSentence = sentence
      .map((wordObj) => wordObj.word)
      .join("")
      .replace(/\s+/g, ""); // Remove all whitespace

    // Remove asterisks and all whitespace from the original sentence
    const originalSentence = originalLine
      .replace(/\*/g, "")
      .replace(/\s+/g, ""); // Remove all whitespace

    // Compare the two strings
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
                onDrop={
                  wordObj.isTile
                    ? () => onDrop(lineIndex, wordIndex)
                    : undefined
                }
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
