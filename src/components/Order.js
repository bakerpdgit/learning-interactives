import React, { useRef, useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import styles from "./Order.module.css";

// ItemTypes.js
const ItemTypes = {
  ITEM: "item",
};

const DraggableItem = ({ id, content, index, moveItem }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.ITEM,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ITEM,
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "move" }}
      className={styles.stackItem}
    >
      {content}
    </div>
  );
};

export const OrderStack = ({ items, moveItem }) => {
  return (
    <div className={styles.stackContainer}>
      {items.map((item, index) => (
        <DraggableItem
          key={item.id}
          index={index}
          id={item.id}
          content={item.content}
          moveItem={moveItem}
        />
      ))}
    </div>
  );
};

const Order = ({ text }) => {
  const [title, setTitle] = useState("");
  const [groups, setGroups] = useState([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  // useEffect hook to parse text prop
  useEffect(() => {
    function shuffleArray(array) {
      let currentIndex = array.length,
        temporaryValue,
        randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

    function ensureShuffled(original) {
      let shuffled;
      do {
        shuffled = shuffleArray([...original]);
      } while (
        shuffled.length > 1 &&
        shuffled.every((item, index) => item.id === original[index].id)
      );
      return shuffled;
    }

    const parseText = (text) => {
      // Split the text by double newline to separate title and groups
      const groupsText = text.split("\n\n");
      const title = groupsText.shift();

      const groups = groupsText.map((group, groupIndex) =>
        ensureShuffled(
          // Ensure each group is shuffled
          group.split("\n").map((line, index) => ({
            id: `group-${groupIndex}-item-${index}`,
            content: line,
          }))
        )
      );
      return { title, groups };
    };

    const { title, groups } = parseText(text);
    setTitle(title);
    setGroups(groups);
    setCurrentGroupIndex(0); // Reset to the first group
    setIsCompleted(false); // Reset completion status
    // Ensure this effect runs whenever the text prop changes
  }, [text]);

  const moveItem = (dragIndex, hoverIndex) => {
    const newGroups = [...groups];
    const dragItem = newGroups[currentGroupIndex][dragIndex];
    newGroups[currentGroupIndex].splice(dragIndex, 1);
    newGroups[currentGroupIndex].splice(hoverIndex, 0, dragItem);
    setGroups(newGroups);
  };

  // Implement the checkOrder function
  const checkOrder = () => {
    const isCorrect = groups[currentGroupIndex].every(
      (item, index) => item.id === `group-${currentGroupIndex}-item-${index}`
    );

    if (isCorrect) {
      if (currentGroupIndex < groups.length - 1) {
        // Move to the next group
        setCurrentGroupIndex(currentGroupIndex + 1);
        setAnimationClass(styles.correctFlash);
        setTimeout(() => {
          setAnimationClass("");
        }, 1000);

        // Reset animation class for the next group after the animation ends
      } else {
        // All groups completed
        setIsCompleted(true);
        setAnimationClass(styles.correctFlash);
        setTimeout(() => {
          setAnimationClass("");
        }, 1000);
      }
    } else {
      // Incorrect order
      setAnimationClass(styles.incorrectFlash);
      setTimeout(() => {
        setAnimationClass("");
      }, 1000);
    }
  };

  return (
    <>
      <h1 className={styles.interactiveSubTitle}>{title}</h1>
      <div className="instructions">
        {!isCompleted && <button onClick={checkOrder}>Submit</button>}
      </div>
      <div className={`${styles.interactiveContainer} interactiveContainer`}>
        <div className={`${styles.stackContainer} ${animationClass}`}>
          {groups.length > 0 && (
            <OrderStack items={groups[currentGroupIndex]} moveItem={moveItem} />
          )}
        </div>

        {isCompleted ? (
          <div className={styles.celebration}>
            <span className={styles.emoji} role="img" aria-label="celebrate">
              🎉
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Order;
