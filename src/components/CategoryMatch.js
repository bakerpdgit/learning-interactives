import React, { useRef, useState } from "react";
import "./CategoryMatch.css";
import MathComponent from "./MathComponent";
import InputModal from "./InputModal";
import Celebration from "./Celebration";
import { readCategorise } from "../activityMarking";

export default function CategoryMatch({ text }) {
  const [settings, body] = readCategorise(text);
  const [header, termsText = ""] = body.split("\n\n");
  const categories = header.split("\n");
  const [terms, setTerms] = useState(() => termsText.split("\n")
    .flatMap((term, id) => {
      if (!term) return [];
      const answer = settings.answers?.[id];
      return [{ id, word: term.split("@")[0], category: null,
        answer: answer >= 1 && answer <= categories.length ? answer - 1 : null }];
    }));
  const nextId = useRef((terms.at(-1)?.id ?? -1) + 1);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [checked, setChecked] = useState(false);
  const markedTerms = terms.filter((term) => term.answer != null);

  function place(id, category) {
    if (!terms.some((term) => term.id === id)) return;
    setTerms((current) => current.map((term) => term.id === id ? { ...term, category } : term));
    setAnnouncement(category == null ? "Moved back to the word bank." : "Moved to " + categories[category] + ".");
    setSelected(null);
    setChecked(false);
  }

  function drop(event, category) {
    event.preventDefault();
    const id = event.dataTransfer.getData("application/x-category-term");
    if (id !== "") place(Number(id), category);
  }

  function group(category) {
    return <div className="categoryTerms">
      {terms.filter((term) => term.category === category).map(({ id, word, answer }) => <div className="term" key={id}>
        <button type="button" className="categoryTermLabel" aria-pressed={selected === id} draggable
          data-result={checked && answer != null ? (answer === category ? "correct" : "incorrect") : undefined}
          onClick={() => setSelected(selected === id ? null : id)}
          onDragStart={(event) => event.dataTransfer.setData("application/x-category-term", String(id))}>
          <MathComponent text={word} renderNewLines />
          {checked && answer != null && <span className="categoryResult">
            {answer === category ? "Correct" : category === null ? "Unplaced" : "Incorrect"}
          </span>}
        </button>
        {answer == null && <button type="button" className="categoryRemove" aria-label={"Remove " + word}
          onClick={() => {
            setTerms((current) => current.filter((term) => term.id !== id));
            if (selected === id) setSelected(null);
          }}>×</button>}
      </div>)}
    </div>;
  }

  function checkCategories() {
    const correct = markedTerms.filter((term) => term.category === term.answer).length;
    setChecked(true);
    setAnnouncement(`${correct} of ${markedTerms.length} marked items in the correct category.`);
  }

  return <div className="categoryActivity">
    {adding && <InputModal title="Add item" placeholder="Type here..." onClose={() => setAdding(false)}
      onSubmit={(value) => {
        if (!value.trim()) return;
        const id = nextId.current++;
        setTerms((current) => [...current, { id, word: value.trim(), category: null }]);
      }} />}
    {(settings.add !== false || markedTerms.length > 0) && <div className="buttonRow">
      {settings.add !== false && <button type="button" onClick={() => setAdding(true)}>Add item</button>}
      {markedTerms.length > 0 && <button type="button" onClick={checkCategories}>Check categories</button>}
    </div>}
    <div className="categoryBox" onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, null)}>
      <button type="button" className="categoryDestination" disabled={selected == null}
        onClick={() => place(selected, null)}>Word bank</button>
      {group(null)}
    </div>
    <div className="CategoryMatch">
      {categories.map((category, index) => <div key={index} className="categoryBox"
        onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, index)}>
        <button type="button" className="categoryDestination" disabled={selected == null}
          onClick={() => place(selected, index)}>{category}</button>
        {group(index)}
      </div>)}
    </div>
    <span role="status">{announcement}</span>
    {checked && markedTerms.length > 0 && markedTerms.every((term) => term.category === term.answer) &&
      <Celebration label={null} />}
  </div>;
}
