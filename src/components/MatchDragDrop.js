
import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import Celebration from "./Celebration";
import MathComponent from "./MathComponent";
import styles from "./MatchDragDrop.module.css";

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export default function MatchDragDrop({ text }) {
  const [pairs] = useState(() => text.split("\n\n").map((pair, index) => {
    const [term, ...definition] = pair.split("\n");
    return { id: String(index), term, definition: definition.join(" ") };
  }));
  const [terms] = useState(() => shuffle(pairs));
  const [definitions] = useState(() => shuffle(pairs));
  const [matched, setMatched] = useState([]);
  const [selected, setSelected] = useState(null);
  const [incorrect, setIncorrect] = useState(null);
  const complete = matched.length === pairs.length;

  useEffect(() => {
    if (incorrect == null) return undefined;
    const timeout = setTimeout(() => setIncorrect(null), 700);
    return () => clearTimeout(timeout);
  }, [incorrect]);

  const match = (term, definition) => {
    if (term == null || matched.includes(term)) return;
    if (term !== definition) {
      setIncorrect(definition);
      return;
    }
    setMatched((current) => current.includes(term) ? current : [...current, term]);
    setSelected(null);
    setIncorrect(null);
  };

  if (complete) return <>
    <Celebration />
    <div className={styles.matchContainer}>
      {pairs.map(({id, term, definition}) => <React.Fragment key={id}>
        <div className={styles.finished}><MathComponent text={term} renderNewLines /></div>
        <div className={styles.finished}><MathComponent text={definition} renderNewLines /></div>
      </React.Fragment>)}
    </div>
  </>;

  return <DragDropContext onDragEnd={({draggableId, destination}) => {
    if (destination?.droppableId.startsWith("definition-")) {
      match(draggableId, destination.droppableId.slice("definition-".length));
    }
  }}>
    <div className={styles.matchContainer}>
      <Droppable droppableId="terms" isDropDisabled>
        {(provided) => <div className={styles.column} ref={provided.innerRef} {...provided.droppableProps}>
          {terms.filter(({id}) => !matched.includes(id)).map(({id, term}, index) =>
            <Draggable draggableId={id} index={index} key={id}>
              {(provided) => <div className={styles.card} data-selected={selected === id}
                ref={provided.innerRef} {...provided.draggableProps}>
                <div {...provided.dragHandleProps} className={styles.dragHandle} aria-label={"Drag " + term}>
                  <MathComponent text={term} renderNewLines />
                </div>
                <Button size="small" aria-pressed={selected === id} aria-label={"Select " + term}
                  onClick={() => setSelected((prior) => prior === id ? null : id)}>Select</Button>
              </div>}
            </Draggable>)}
          {provided.placeholder}
        </div>}
      </Droppable>
      <div className={styles.column}>
        {definitions.filter(({id}) => !matched.includes(id)).map(({id, definition}) =>
          <Droppable droppableId={"definition-" + id} key={id}>
            {(provided) => <div className={styles.card} data-wrong={incorrect === id}
              ref={provided.innerRef} {...provided.droppableProps}>
              <MathComponent text={definition} renderNewLines />
              <Button size="small" disabled={selected == null} aria-label={"Match with " + definition}
                onClick={() => match(selected, id)}>Match</Button>
              {provided.placeholder}
            </div>}
          </Droppable>)}
      </div>
    </div>
    <span className={styles.feedback} role="status">
      {incorrect != null ? "Try another match." : matched.length ? matched.length + " of " + pairs.length + " matched." : ""}
    </span>
  </DragDropContext>;
}
