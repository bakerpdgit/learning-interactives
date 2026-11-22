import React, { useRef, useState } from "react";
import "./CategoryMatch.css";
import MathComponent from "./MathComponent";
import InputModal from "./InputModal";

export default function CategoryMatch({ text }) {
  const [header, termsText = ""] = text.split("\n\n");
  const categories = header.split("\n");
  const [terms, setTerms] = useState(() => termsText.split("\n").filter(Boolean)
    .map((term, id) => ({ id, word: term.split("@")[0], category: null })));
  const nextId = useRef(terms.length);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  function place(id, category) {
    if (!terms.some((term) => term.id === id)) return;
    setTerms((current) => current.map((term) => term.id === id ? { ...term, category } : term));
    setAnnouncement(category == null ? "Moved back to the word bank." : "Moved to " + categories[category] + ".");
    setSelected(null);
  }

  function drop(event, category) {
    event.preventDefault();
    const id = event.dataTransfer.getData("application/x-category-term");
    if (id !== "") place(Number(id), category);
  }

  function group(category) {
    return <div className="categoryTerms">
      {terms.filter((term) => term.category === category).map(({ id, word }) => <div className="term" key={id}>
        <button type="button" className="categoryTermLabel" aria-pressed={selected === id} draggable
          onClick={() => setSelected(selected === id ? null : id)}
          onDragStart={(event) => event.dataTransfer.setData("application/x-category-term", String(id))}>
          <MathComponent text={word} renderNewLines />
        </button>
        <button type="button" className="categoryRemove" aria-label={"Remove " + word}
          onClick={() => {
            setTerms((current) => current.filter((term) => term.id !== id));
            if (selected === id) setSelected(null);
          }}>×</button>
      </div>)}
    </div>;
  }

  return <div className="categoryActivity">
    {adding && <InputModal title="Add item" placeholder="Type here..." onClose={() => setAdding(false)}
      onSubmit={(value) => {
        if (!value.trim()) return;
        const id = nextId.current++;
        setTerms((current) => [...current, { id, word: value.trim(), category: null }]);
      }} />}
    <button type="button" onClick={() => setAdding(true)}>Add item</button>
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
  </div>;
}
