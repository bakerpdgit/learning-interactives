import React, { useState, useEffect } from "react";
import { decompressText } from "./TextInput";
import "./WordComplete.css";

function WordComplete({ text }) {
  const originalText = decompressText(text);
  const [score, setScore] = useState(0);
  const [displayedText, setDisplayedText] = useState(originalText);
  const [asteriskedWords, setAsteriskedWords] = useState(
    (originalText.match(/\*([a-zA-Z0-9]+)(?=[ ,.?!])/g) || []).map((w) =>
      w.substring(1)
    )
  );
  const [missingWord, setMissingWord] = useState("");

  useEffect(() => {
    let tempText = originalText;

    if (asteriskedWords.length === 0) return;

    const randomWord =
      asteriskedWords[Math.floor(Math.random() * asteriskedWords.length)];
    console.log(randomWord);

    let matches = [];
    let match;
    const regex = new RegExp(`\\b${randomWord}\\b`, "g");

    while ((match = regex.exec(tempText))) {
      matches.push(match.index);
    }

    if (matches.length === 0) return;

    const randomIndex = matches[Math.floor(Math.random() * matches.length)];

    tempText =
      tempText.substring(0, randomIndex) +
      `<span class="missing">${randomWord.charAt(
        0
      )}<input type="text" class="missingInput" data-word="${randomWord}" value="" size="${
        randomWord.length - 2
      }">${randomWord.charAt(randomWord.length - 1)}</span>` +
      tempText.substring(randomIndex + randomWord.length);

    // Remove all asterisks from the tempText
    tempText = tempText.replace(/\*/g, "");

    setDisplayedText(tempText);
    setMissingWord(randomWord);
  }, [originalText, asteriskedWords]);

  useEffect(() => {
    const inputBox = document.querySelector(".missingInput");
    if (inputBox) {
      inputBox.focus();
    }
  }, [displayedText]);

  const handleInput = (e) => {
    if (e.key === "Enter") {
      const inputBox = e.target;
      const userAnswer =
        missingWord.charAt(0) +
        inputBox.value +
        missingWord.charAt(missingWord.length - 1);

      let isCorrect;
      if (/^\d+$/.test(missingWord)) {
        isCorrect = userAnswer === missingWord;
      } else {
        isCorrect = userAnswer
          .toUpperCase()
          .includes(missingWord.toUpperCase());
      }

      if (isCorrect) {
        setScore((prevScore) => prevScore + 1);

        const wordsLeft = asteriskedWords.filter(
          (word) => word !== missingWord
        );
        setAsteriskedWords(wordsLeft);
      } else {
        setScore(0);
        inputBox.classList.add("wrong");
      }
    }
  };

  return (
    <>
      <h1 className="interactiveTitle">Word Complete</h1>
      <div className="wordCompleteContainer">
        {asteriskedWords.length === 0 ? (
          <div className="celebration">
            <span className="emoji" role="img" aria-label="celebrate">
              🎉
            </span>
          </div>
        ) : (
          <>
            <div
              className="textArea"
              onKeyUp={handleInput}
              dangerouslySetInnerHTML={{ __html: displayedText }}
            ></div>
            <div className="score">
              <span className="star">★</span> {score}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default WordComplete;
