import React, { useState } from "react";
import "./MatchDragDrop.css";
import MathComponent from "./MathComponent.js";

function MatchDragDrop({ text }) {
  const originalPairs = text.split("\n\n").map((pair) => {
    const [term, ...definition] = pair.split("\n");
    return { term, definition: definition.join(" ") };
  });

  const shuffled = (array) => {
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

  const [terms] = useState(shuffled(originalPairs.map((p) => p.term)));
  const [definitions] = useState(
    shuffled(originalPairs.map((p, idx) => ({ ...p, id: idx })))
  );
  const [matchedPairs, setMatchedPairs] = useState([]);

  const [showCelebration, setShowCelebration] = useState(false);

  const dropHandler = (termIndex, defIndex) => {
    const definitionDiv = document.querySelector(
      `.droppable[data-id="${defIndex}"]`
    );
    if (terms[termIndex] === definitions[defIndex].term) {
      definitionDiv.classList.add("correct");
      setMatchedPairs((prevState) => [...prevState, termIndex]);
      setTimeout(() => {
        const termToHide = document.querySelector(
          `.draggable[data-id="${termIndex}"]`
        );
        termToHide.style.display = "none";
        definitionDiv.style.display = "none";
        if (matchedPairs.length + 1 === terms.length) {
          setShowCelebration(true);
        }
      }, 500);
    } else {
      definitionDiv.classList.add("wrong");
      setTimeout(() => {
        definitionDiv.classList.remove("wrong");
      }, 500);
    }
  };

  return (
    <>
      {showCelebration ? (
        <div className="celebration">😃</div>
      ) : (
        <div className="matchContainer">
          <div className="terms">
            {terms.map(
              (term, index) =>
                !matchedPairs.includes(index) && (
                  <div
                    key={index}
                    className="draggable"
                    draggable
                    data-id={index}
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", index)
                    }
                  >
                    <MathComponent text={term} renderNewLines={true} />
                  </div>
                )
            )}
          </div>
          <div className="definitions">
            {definitions.map((definition, index) => (
              <div
                key={index}
                className="droppable"
                data-id={index}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const termIndex = e.dataTransfer.getData("text/plain");
                  dropHandler(termIndex, index);
                }}
              >
                <MathComponent
                  text={definition.definition}
                  renderNewLines={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default MatchDragDrop;
