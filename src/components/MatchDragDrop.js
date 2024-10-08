import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
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

  const [terms, setTerms] = useState(
    shuffled(
      originalPairs.map((p, idx) => ({
        id: `term-${idx}`,
        content: p.term,
      }))
    )
  );

  const [definitions, setDefinitions] = useState(
    shuffled(
      originalPairs.map((p, idx) => ({
        id: `def-${idx}`,
        termId: `term-${idx}`,
        content: p.definition,
      }))
    )
  );

  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongMatch, setWrongMatch] = useState(null);
  const [correctMatch, setCorrectMatch] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);

  // Check if all pairs have been matched
  useEffect(() => {
    if (matchedPairs.length === originalPairs.length) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setShowFinalResult(true);
      }, 3000); // 3-second celebration
    }
  }, [matchedPairs, originalPairs.length]);

  const onDragEnd = (result) => {
    // eslint-disable-next-line no-unused-vars
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // If dropped back to the terms area, do nothing
    if (destination.droppableId === "terms") {
      return;
    }

    // Only proceed if dropped into a definition area
    if (destination.droppableId.startsWith("def-")) {
      const defIndex = definitions.findIndex(
        (def) => def.id === destination.droppableId
      );

      if (definitions[defIndex].termId === draggableId) {
        // Correct match
        setCorrectMatch(definitions[defIndex].id);
        setTimeout(() => {
          setCorrectMatch(null);
          setMatchedPairs((prevState) => [...prevState, draggableId]);

          // Remove the matched term and definition from the lists
          setTerms((prevTerms) =>
            prevTerms.filter((term) => term.id !== draggableId)
          );
          setDefinitions((prevDefs) =>
            prevDefs.filter((def) => def.id !== destination.droppableId)
          );
        }, 500);
      } else {
        // Incorrect match
        setWrongMatch(definitions[defIndex].id);
        setTimeout(() => {
          setWrongMatch(null);
        }, 500);
      }
    }
  };

  return (
    <>
      {showFinalResult ? (
        <div className="matchContainer">
          <div className="terms">
            {originalPairs.map((pair, index) => (
              <div key={index} className="finishedTerm">
                <MathComponent text={pair.term} renderNewLines={true} />
              </div>
            ))}
          </div>
          <div className="definitions">
            {originalPairs.map((pair, index) => (
              <div key={index} className="finishedDefinition">
                <MathComponent text={pair.definition} renderNewLines={true} />
              </div>
            ))}
          </div>
        </div>
      ) : showCelebration ? (
        <div className="celebration">🎉</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="matchContainer">
            {/* Wrap terms in a Droppable */}
            <Droppable droppableId="terms" isDropDisabled={true}>
              {(provided) => (
                <div
                  className="terms"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {terms.map((term, index) => (
                    <Draggable
                      key={term.id}
                      draggableId={term.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="draggable"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <MathComponent
                            text={term.content}
                            renderNewLines={true}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className="definitions">
              {definitions.map((definition) => {
                const isMatched = matchedPairs.includes(definition.termId);

                return (
                  <Droppable
                    key={definition.id}
                    droppableId={definition.id}
                    isDropDisabled={isMatched}
                  >
                    {(provided) => (
                      <div
                        className={`droppable ${
                          correctMatch === definition.id
                            ? "correct"
                            : wrongMatch === definition.id
                            ? "wrong"
                            : ""
                        }`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <MathComponent
                          text={definition.content}
                          renderNewLines={true}
                        />
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </div>
        </DragDropContext>
      )}
    </>
  );
}

export default MatchDragDrop;
