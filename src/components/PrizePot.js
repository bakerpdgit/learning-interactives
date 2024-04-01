import React, { useState, useEffect } from "react";
import styles from "./PrizePot.module.css";
import { useDrag } from "react-dnd";
import { useDrop } from "react-dnd";

const ItemTypes = {
  COIN_BAG: "coinBag",
};

const INITIAL_PRIZE_POT = 128;

const DraggableCoinBag = ({ id }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COIN_BAG,
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        fontSize: "3em",
        cursor: "move",
      }}
    >
      💰
    </div>
  );
};

const DroppableAnswerOption = ({
  index,
  onDropCoinBag,
  children,
  allocations,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.COIN_BAG,
    drop: (item, monitor) => onDropCoinBag(index, item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        border: isOver ? "2px solid green" : "1px solid gray",
        borderRadius: "20px",
        padding: "10px",
        margin: "5px",
        textAlign: "center",
        fontSize: "1em",
      }}
    >
      {children}
      <div className={styles.coinBagAllocation}>
        {allocations.map(
          (allocation, id) =>
            allocation === index && <DraggableCoinBag key={id} id={id} />
        )}
      </div>
    </div>
  );
};

const DroppablePrizeFund = ({ onReturnCoinBag, children, allocations }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.COIN_BAG,
    drop: (item, monitor) => onReturnCoinBag(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        // Apply your styles here
        border: isOver ? "2px dashed green" : "1px dashed grey",
        padding: "10px",
        borderRadius: "10px",
        textAlign: "center",
        minHeight: "100px", // Ensure there's enough space to drop
      }}
    >
      {children}
      {/* Render unallocated coin bags */}
      <div className={styles.prizeFund}>
        {allocations.map(
          (allocation, id) =>
            allocation === -1 && <DraggableCoinBag key={id} id={id} />
        )}
      </div>
    </div>
  );
};

function PrizePot({ text }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [prizePot, setPrizePot] = useState(INITIAL_PRIZE_POT);
  const currentQuestion = questions[currentQuestionIndex];
  const [celebrate, setCelebrate] = useState(false);
  const [coinBagsAllocation, setCoinBagsAllocation] = useState({
    bags: [-1, -1, -1, -1], // Assuming -1 indicates not allocated
  });

  // Handle returning a coin bag to the prize fund
  const handleReturnCoinBag = (coinBagId) => {
    setCoinBagsAllocation((prev) => {
      const newAllocations = { ...prev };
      newAllocations.bags[coinBagId] = -1; // Reset allocation for this coin bag
      return newAllocations;
    });
  };

  useEffect(() => {
    const parsedQuestions = text.split("\n\n").map((q) => {
      const lines = q.split("\n");
      return {
        question: lines[0],
        answers: lines.slice(1).map((answer) => ({
          text: answer.replace("*", ""),
          isCorrect: answer.includes("*"),
        })),
      };
    });
    setQuestions(parsedQuestions);
  }, [text]);

  const restartGame = () => {
    // Reset the game state as needed
    setPrizePot(INITIAL_PRIZE_POT); // Assuming 128 is the starting amount
    setCurrentQuestionIndex(0);
    setCoinBagsAllocation({ bags: [-1, -1, -1, -1] });
    setCelebrate(false);
    // Also, ensure to reset any other relevant state to initial conditions
  };

  const handleSelectOption = (index) => {
    // Update all bag allocations to the selected answer index
    setCoinBagsAllocation((prev) => ({
      ...prev,
      bags: prev.bags.map(() => index),
    }));
  };

  const handleSubmit = () => {
    // Identify the index of the correct answer
    const correctAnswerIndex = currentQuestion.answers.findIndex(
      (answer) => answer.isCorrect
    );

    // Calculate the prize pot update based on the bets
    const betPerBag = prizePot / 4; // Each bag represents a quarter of the current prize pot
    const bagsOnCorrectAnswer = coinBagsAllocation.bags.filter(
      (allocation) => allocation === correctAnswerIndex
    ).length;
    const winnings = bagsOnCorrectAnswer * betPerBag * 4; // Winnings from bets placed on the correct answer
    // Calculate the total amount lost from bets on incorrect answers
    const totalLostFromIncorrectBets =
      coinBagsAllocation.bags.filter(
        (allocation) => allocation !== correctAnswerIndex && allocation !== -1
      ).length * betPerBag;
    // Update the prize pot: add winnings and subtract the stake from incorrect bets
    // After calculating the new prize pot value
    const newPrizePot = Math.ceil(
      prizePot - totalLostFromIncorrectBets + winnings
    );

    setPrizePot(newPrizePot);

    // Prepare for the next question or end the quiz
    if (currentQuestionIndex + 1 < questions.length && newPrizePot > 0) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCoinBagsAllocation({ bags: [-1, -1, -1, -1] }); // Reset coin bag allocations for the next question
    } else {
      setCelebrate(true);
    }
  };

  // Handle dropping a coin bag onto an answer option
  const handleDropCoinBag = (answerIndex, coinBagId) => {
    // Update allocation state
    setCoinBagsAllocation((prev) => {
      const newAllocations = { ...prev };
      newAllocations.bags[coinBagId] = answerIndex;
      return newAllocations;
    });
  };

  // also removed this style ${selectedOption === index ? styles.selected : ""} from the options because not selecting
  return (
    <>
      <h1 className={styles.interactiveTitle}>Prize Pot Quiz</h1>
      <p className={styles.instructions}>
        Drag at least some of your prize pot to the options, spreading it
        depending on how sure you are! Click an option to transfer all to this
        answer.
      </p>
      <div className={styles.prizePot}>Current Fund: ${prizePot}</div>
      {!celebrate ? (
        currentQuestion && (
          <>
            <DroppablePrizeFund
              onReturnCoinBag={handleReturnCoinBag}
              allocations={coinBagsAllocation.bags}
            >
              <div className={styles.prizeFundTitle}>Prize Fund</div>
            </DroppablePrizeFund>
            <div className={styles.buttonWrapper}>
              <button
                className={styles.submitButton}
                disabled={coinBagsAllocation.bags.every(
                  (allocation) => allocation === -1
                )} // Disable if no bets have been placed
                onClick={handleSubmit}
              >
                Submit Final Answer
              </button>
            </div>
            <p className={styles.question}>{currentQuestion.question}</p>
            <div className={styles.gameArea}>
              {currentQuestion && (
                <>
                  <div className={styles.answers}>
                    {currentQuestion.answers.map((answer, index) => (
                      <DroppableAnswerOption
                        key={index}
                        index={index}
                        onDropCoinBag={handleDropCoinBag}
                        allocations={coinBagsAllocation.bags}
                      >
                        <div
                          className={`${styles.answerOption}`}
                          onClick={() => handleSelectOption(index)}
                        >
                          {answer.text}
                        </div>
                      </DroppableAnswerOption>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )
      ) : (
        <>
          <div className={styles.celebration}>
            {prizePot > 0 ? (
              <>
                <span>🎉</span>
              </>
            ) : (
              <>
                <span>😢</span>
              </>
            )}
          </div>
          <div className={styles.buttonWrapper}>
            <button style={styles.restartButton} onClick={restartGame}>
              Try Again?
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default PrizePot;
