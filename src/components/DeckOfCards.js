import React, { useState } from "react";
import styles from "./DeckOfCards.module.css";

function DeckOfCards({ text }) {
  const parseCards = (text) => {
    return text.split("\n").map((line) => {
      const [content, link] = line.split("@");
      const parts = content.split("|");
      const front = parts[0];
      const back = parts.length > 1 ? parts[1] : "";
      return {
        front: front.trim(),
        back: back.trim(),
        hasFlip: parts.length > 1,
        link: link ? link.trim() : "",
      };
    });
  };

  const shuffleArray = (array) => {
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

  const [cards, setCards] = useState(shuffleArray(parseCards(text)));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  const handleNext = () => {
    setFlip(false); // Reset flip state on moving to next
    setCurrentIndex((currentIndex + 1) % cards.length);
  };

  const handleRemove = () => {
    const newCards = cards.filter((_, index) => index !== currentIndex);
    setCards(newCards);
    setCurrentIndex(currentIndex % newCards.length);
  };

  const handleFlip = () => {
    setFlip(!flip);
  };

  const handleCardClick = () => {
    const currentCard = cards[currentIndex];
    if (currentCard.link) {
      window.open(currentCard.link, "_blank");
    }
  };

  return (
    <div className={styles.cardContainer}>
      {cards.length === 0 ? (
        <div className={styles.card}>No more cards in the deck.</div>
      ) : (
        <>
          <div
            className={styles.card}
            onClick={() => cards[currentIndex].link && handleCardClick()}
            style={{ cursor: cards[currentIndex].link ? "pointer" : "default" }}
          >
            {flip && cards[currentIndex].back
              ? cards[currentIndex].back
              : cards[currentIndex].front}
          </div>

          <div className={styles.buttons}>
            <button className={styles.button} onClick={handleNext}>
              Next
            </button>
            <button className={styles.button} onClick={handleRemove}>
              Remove
            </button>
            {cards[currentIndex].hasFlip && (
              <button className={styles.button} onClick={handleFlip}>
                Flip
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DeckOfCards;
