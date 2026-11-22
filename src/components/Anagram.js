import Celebration from "./Celebration";
import React, { useState } from "react";
import "./Anagram.css";

function shuffle(tiles) {
  const result = [...tiles];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  if (result.every((tile, index) => tiles[index] === tile)) {
    const different = result.findIndex((tile) => tile !== result[0]);
    if (different !== -1) [result[0], result[different]] = [result[different], result[0]];
  }
  return result;
}

function readPuzzle(text) {
  const blocks = text.split("\n\n");
  const wordMode = blocks[0].startsWith("OPTIONS:") && /(?:^|[,;])\s*mode=word(?:[,;]|$)/.test(blocks.shift().slice(8));
  return blocks.filter(Boolean).map((block) => {
    const [clue, answer = ""] = block.split("\n");
    const tiles = wordMode ? answer.split(" ") : [...answer];
    return {
      clue, tiles: shuffle(tiles), answer: tiles.join(""),
      completed: tiles.every((tile) => tile === tiles[0]),
      unsuitable: wordMode && tiles.length < 2,
    };
  });
}

export default function Anagram({ text }) {
  const [pairs, setPairs] = useState(() => readPuzzle(text));
  const [selected, setSelected] = useState(null);
  const completed = pairs.length > 0 && pairs.every((pair) => pair.completed);

  function move(pairIndex, from, to) {
    setPairs((current) => current.map((pair, index) => {
      if (index !== pairIndex || pair.completed || from === to ||
          !Number.isInteger(from) || from < 0 || from >= pair.tiles.length) return pair;
      const tiles = [...pair.tiles];
      tiles.splice(to, 0, tiles.splice(from, 1)[0]);
      return { ...pair, tiles, completed: tiles.join("") === pair.answer };
    }));
    setSelected(null);
  }

  function choose(pair, tile) {
    if (selected?.pair === pair && selected.tile !== tile) move(pair, selected.tile, tile);
    else setSelected(selected?.pair === pair ? null : { pair, tile });
  }

  return <div className="interactiveContainer">
    <div className="anagramContainer">
      {pairs.some((pair) => pair.unsuitable) && <p role="status">Word mode needs at least two words in each answer.</p>}
      {completed && <Celebration />}
      {pairs.map((pair, index) => <div key={index} className={"pair" + (pair.completed ? " completed" : "")}>
        <div className="clue">{pair.clue}</div>
        <div className="word" onDragOver={(event) => event.preventDefault()}>
          {pair.tiles.map((tile, position) => <button type="button" key={position} className="tile"
            aria-label={tile + ", position " + (position + 1)}
            aria-pressed={selected?.pair === index && selected.tile === position}
            disabled={pair.completed} draggable={!pair.completed}
            onClick={() => choose(index, position)}
            onDragStart={(event) => event.dataTransfer.setData("text/plain", index + ":" + position)}
            onDrop={(event) => {
              event.preventDefault();
              const [origin, from] = event.dataTransfer.getData("text/plain").split(":");
              if (origin === String(index) && from != null) move(index, Number(from), position);
            }}>{tile}</button>)}
        </div>
        {pair.completed && <span className="anagramSolved">Solved</span>}
      </div>)}
    </div>
  </div>;
}
