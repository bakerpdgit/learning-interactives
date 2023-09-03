import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import "./CategoryMatch.css";
import { InlineMath } from "react-katex";

function CategoryMatch({ text }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [score, setScore] = useState(null);
  const [marked, setMarked] = useState(false);

  const categories = text.split("\n\n")[0].split("\n");
  const termsData = text
    .split("\n\n")[1]
    .split("\n")
    .map((term) => {
      const [word, catIndex] = term.split("@");
      return { word, catIndex: catIndex ? parseInt(catIndex) : null };
    });

  const hasMarkedTerm = termsData.some((term) => term.catIndex !== null);
  const gameAreaHeight = 0.9 * window.innerHeight;
  const gameAreaWidth = window.innerWidth;

  const randomizedTerms = termsData.map((term) => ({
    ...term,
    x: window.innerWidth / 2 + (-0.5 + Math.random()) * gameAreaWidth * 0.5, // Adjust 100 based on term width
    y: window.innerHeight / 2 + (-0.5 + Math.random()) * gameAreaHeight * 0.5, // Adjust 50 based on term height
  }));

  const [allTerms, setAllTerms] = useState(randomizedTerms);

  const numCategories = categories.length;
  let numRows = Math.round(Math.sqrt(numCategories));
  let numCols = Math.ceil(numCategories / numRows);
  const extraStyles = {
    gridTemplateRows: `repeat(${numRows}, 1fr)`,
    gridTemplateColumns: `repeat(${numCols}, 1fr)`,
  };

  const handleAddItem = () => {
    const userInput = window.prompt("Please enter text for the new item:");

    if (userInput) {
      // Check if user provided a value and didn't cancel the prompt
      const newTerm = {
        word: userInput,
        catIndex: null,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };

      setAllTerms((prevTerms) => [...prevTerms, newTerm]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStop = (e, data, draggedTerm) => {
    const updatedTerms = allTerms.map((term) => {
      if (term.word === draggedTerm.word) {
        return {
          ...term,
          x: data.x,
          y: data.y,
        };
      }
      return term;
    });

    setAllTerms(updatedTerms);
  };

  const handleMarking = () => {
    setMarked(true);
    let score = 0;
    let totalQ = 0;

    // Loop through all terms that have a category index
    allTerms
      .filter((term) => term.catIndex !== null)
      .forEach((term) => {
        // Get the category element from the DOM
        const categoryElem = document.querySelector(
          `.categoryBox:nth-child(${term.catIndex})`
        );

        if (categoryElem) {
          // Get the bounding rectangle of the category
          const rect = categoryElem.getBoundingClientRect();

          // Check if the term's red box marker is inside the category box
          if (
            rect.left <= term.x &&
            term.x <= rect.right &&
            rect.top <= term.y &&
            term.y <= rect.bottom
          ) {
            score++;
          }
          totalQ++;
        }
      });

    // Update state with the score
    setScore(score);

    // Show celebration if score equals totalQ
    if (score === totalQ) {
      setShowCelebration(true);
    }
  };

  const handleRemoveTerm = (termToRemove) => {
    setAllTerms((prevTerms) =>
      prevTerms.filter((term) => term !== termToRemove)
    );
  };

  const renderWithNewLines = (text) => {
    return text.replace(/\\n/g, "\n");
  };

  return (
    <>
      <h1>Category Match</h1>
      <button onClick={handleAddItem} className="addItemBtn">
        Add item
      </button>
      {/*
      {hasMarkedTerm && (
        <button className="submitBtn" onClick={handleMarking}>
          Submit
        </button>
      )}
      */}
      {marked && <div className="scoreBox">Score: {score}</div>}
      <div className="CategoryMatch" style={extraStyles}>
        {categories.map((category, index) => (
          <div key={index} className="categoryBox">
            {category}
          </div>
        ))}
        {!showInstruction &&
          allTerms.map((term, index) => (
            <Draggable
              key={index}
              position={{ x: term.x, y: term.y }}
              onStop={(e, data) => handleStop(e, data, term)}
            >
              <div
                style={{
                  zIndex: index + 1,
                  whiteSpace: term.word.includes("\\n") ? "pre-wrap" : "normal",
                }}
                className="term"
              >
                <div
                  className="positionMarker"
                  onClick={() => handleRemoveTerm(term)}
                ></div>
                {<MathComponent text={renderWithNewLines(term.word)} />}
              </div>
            </Draggable>
          ))}

        {showCelebration && "🎉 Celebration 🎉"}
        {showInstruction && (
          <div className="instruction">
            <p>Drag each term to its category...</p>
          </div>
        )}
      </div>
    </>
  );
}

function parseAndRenderMath(text) {
  // Split the text based on $$ delimiters
  const segments = text.split("$$");
  const elements = [];

  segments.forEach((segment, index) => {
    if (index % 2 === 1) {
      // Odd-indexed segments are LaTeX (since they are enclosed between $$ delimiters)
      elements.push(<InlineMath math={segment} />);
    } else {
      elements.push(<span>{segment}</span>);
    }
  });

  return elements;
}

function MathComponent({ text }) {
  return <>{parseAndRenderMath(text)}</>;
}

export default CategoryMatch;
