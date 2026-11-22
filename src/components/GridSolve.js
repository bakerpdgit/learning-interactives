import React, { useEffect, useRef, useState } from "react";
import Celebration from "./Celebration";
import MathComponent from "./MathComponent";
import styles from "./GridSolve.module.css";

const normalize = (answer) => answer.replace(/\s+/g, "").toLowerCase();

function Card({ question, answer, active, solved, onActivate, onSubmit }) {
  const [draft, setDraft] = useState("");
  const [incorrect, setIncorrect] = useState(false);
  const input = useRef(null);
  const clue = useRef(null);

  useEffect(() => {
    if (active) input.current?.focus();
  }, [active]);

  function submit(event) {
    event.preventDefault();
    const correct = normalize(draft) === normalize(answer);
    setIncorrect(!correct);
    if (!correct) clue.current?.focus();
    onSubmit(correct);
  }

  return <div className={styles.Card} data-solved={solved}>
    <button ref={clue} type="button" className={styles.text} disabled={solved} onClick={() => {
      setIncorrect(false);
      onActivate();
      if (active) input.current?.focus();
    }}>
      <MathComponent text={question} renderNewLines />
    </button>
    {active && <form className={styles.answerForm} onSubmit={submit}>
      <input ref={input} type="text" aria-label="Answer" autoComplete="off" value={draft}
        onChange={(event) => setDraft(event.target.value)} />
    </form>}
    {incorrect && <span role="status" className={styles.retry}>Try again.</span>}
    {solved && <div className={styles.answer}>{answer}</div>}
  </div>;
}

export default function GridSolve({ text }) {
  const [active, setActive] = useState(null);
  const [solved, setSolved] = useState([]);
  const pairs = text.split("\n\n").map((pair) => {
    const lines = pair.split("\n");
    const answer = lines.pop();
    return { question: lines.join("\n"), answer };
  });

  return <>
    <div className={styles.GameAreaGrid} style={{"--columns": Math.ceil(Math.sqrt(pairs.length * 1.7))}}>
      {pairs.map((pair, index) => <Card key={index} {...pair}
        active={active === index} solved={solved.includes(index)}
        onActivate={() => setActive(index)} onSubmit={(correct) => {
          setActive(null);
          if (correct) setSolved((previous) => previous.includes(index) ? previous : [...previous, index]);
        }} />)}
    </div>
    {solved.length === pairs.length && <Celebration />}
  </>;
}
