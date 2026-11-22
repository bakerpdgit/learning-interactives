import Celebration from "./Celebration";
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

  const [lines, setLines] = useState(() => parseInput(text));
  const [showCelebration, setShowCelebration] = useState(false);
  const [draggedWord, setDraggedWord] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

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

  function place(source, lineIndex, wordIndex) {
    if (!source || source.lineIndex !== lineIndex || (source.location === "sentence" && source.index === wordIndex)) return;
    const line = lines[lineIndex];
    const sentence = [...line.sentence];
    const wordBank = line.wordBank.filter((word) => word.uuid !== source.uuid);
    if (sentence[wordIndex].word) wordBank.push(sentence[wordIndex]);
    if (source.location === "sentence") sentence[source.index] = { word: "", isTile: true };
    sentence[wordIndex] = source;
    const completed = isSentenceCorrect(sentence, text.split("\n")[lineIndex]);
    const updated = lines.map((item, index) => index === lineIndex ? { sentence, wordBank, completed } : item);
    setLines(updated);
    setShowCelebration(updated.every((item) => item.completed));
    setSelectedWord(null);
    setDraggedWord(null);
  }

  function renderSentence(sentence, lineIndex) {
    return <div className={"sentence" + (lines[lineIndex].completed ? " completed" : "")}>
      {sentence.map((item, index) => {
        if (!item.isTile) return <span key={index} className="regularWord">{item.word}</span>;
        const source = { ...item, lineIndex, index, location: "sentence" };
        return <button type="button" key={index} className={"wordTile " + (item.word ? "draggable" : "gap")}
          aria-label={item.word ? item.word + ", gap " + (index + 1) : "Place in gap " + (index + 1)}
          aria-pressed={item.word ? selectedWord?.uuid === item.uuid : undefined}
          draggable={Boolean(item.word)} onDragStart={() => onDragStart(source)} onDragEnd={() => setDraggedWord(null)}
          onDragOver={(event) => event.preventDefault()} onDrop={() => place(draggedWord, lineIndex, index)}
          onClick={() => {
            if (selectedWord?.lineIndex === lineIndex && selectedWord.uuid !== item.uuid) place(selectedWord, lineIndex, index);
            else if (item.word) setSelectedWord(selectedWord?.uuid === item.uuid ? null : source);
          }}>{item.word || "_____"}</button>;
      })}
    </div>;
  }

  function renderWordBank(wordBank, lineIndex) {
    return wordBank.map((item) => {
      const source = { ...item, lineIndex, location: "bank" };
      return <button key={item.uuid} type="button" className="wordTile draggable" draggable
        aria-pressed={selectedWord?.uuid === item.uuid}
        onDragStart={() => onDragStart(source)} onDragEnd={() => setDraggedWord(null)}
        onClick={() => setSelectedWord(selectedWord?.uuid === item.uuid ? null : source)}>{item.word}</button>;
    });
  }

  return (
    <>
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
          {showCelebration && <Celebration />}
        </div>
      </div>
    </>
  );
}

export default WordBanks;
