import Celebration from "./Celebration";
import React, { useEffect, useRef, useState } from "react";
import styles from "./WordComplete.module.css";

function readPassage(text) {
  const gaps = [...text.matchAll(/\*([\p{L}\p{N}]+)(?=[\s,.?!;:]|$)/gu)];
  const order = gaps.map((_, index) => index);
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }
  return { gaps, order };
}

export default function WordComplete({ text }) {
  const [{ gaps, order }] = useState(() => readPassage(text));
  const [position, setPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [answer, setAnswer] = useState("");
  const field = useRef(null);
  const word = gaps[order[position]]?.[1];
  const showAnswer = mistakes === 3;
  const hints = word?.length > 2 && !/\p{N}/u.test(word);
  const expected = hints ? word.slice(1, -1) : word;

  useEffect(() => {
    field.current?.focus({ preventScroll: true });
  }, [position]);

  useEffect(() => {
    if (!showAnswer) return;
    const timeout = setTimeout(() => {
      setMistakes(0);
      setAnswer("");
      field.current?.focus({ preventScroll: true });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [showAnswer]);

  function submit(event) {
    event.preventDefault();
    if (!word || showAnswer) return;
    const guess = answer.trim().toLowerCase();
    if (guess === expected.toLowerCase() || guess === word.toLowerCase()) {
      setPosition(position + 1);
      setScore(score + 1);
      setAnswer("");
      setMistakes(0);
    } else {
      if (mistakes === 2) setScore(0);
      setMistakes(mistakes + 1);
      field.current?.select();
    }
  }

  let start = 0;
  const passage = gaps.map(([match, value], index) => {
    const offset = gaps[index].index;
    const before = text.slice(start, offset);
    start = offset + match.length;
    return <React.Fragment key={offset}>
      {before}
      {index === order[position] ? <span className={styles.missing}>
        {hints && word[0]}
        <input ref={field} type="text" className={styles.missingInput + (mistakes ? " " + styles.wrong : "")}
          aria-label="Missing word or number" aria-invalid={Boolean(mistakes)} data-word={word}
          inputMode={/^[0-9]+$/.test(word) ? "numeric" : "text"} enterKeyHint="done"
          autoComplete="off" autoCapitalize="none" value={answer}
          style={{"--gap-width": Math.max(1, expected.length) + "ch"}}
          onChange={(event) => setAnswer(event.target.value)} />
        {hints && word.at(-1)}
      </span> : value}
    </React.Fragment>;
  });

  return <div className={styles.wordCompleteContainer}>
    {gaps.length > 0 && !word && <Celebration />}
    {showAnswer && <div className={styles.correctWordContainer} role="status">Answer: {word}</div>}
    <form className={styles.textArea} onSubmit={submit}>{passage}{text.slice(start)}</form>
    <div className={styles.mistakes} aria-label={mistakes ? mistakes + " incorrect guesses" : undefined}>
      {"✖".repeat(mistakes)}
    </div>
    <div className={styles.score} role="status">Streak: {score} · Gaps remaining: {gaps.length - position}</div>
  </div>;
}
