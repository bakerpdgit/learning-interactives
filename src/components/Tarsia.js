import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import "./Tarsia.css";
import MathComponent from "./MathComponent.js";

const SquareComponent = forwardRef((props, ref) => {
  const { lb1, lb2, lb3, lb4, isSelected, onSelect } = props;
  // eslint-disable-next-line
  const [labels, setLabels] = useState([lb1, lb2, lb3, lb4]);

  useImperativeHandle(ref, () => ({
    getLabels: () => labels,
    setLabels: (newLabels) => setLabels(newLabels),
    rotateLabels: () => {
      setLabels((prevLabels) => [prevLabels[3], ...prevLabels.slice(0, 3)]);
    },
  }));

  return (
    <div
      className={`square ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="label top">
        {" "}
        <MathComponent text={labels[0]} renderNewLines={true} />
      </div>
      <div className="label right">
        {" "}
        <MathComponent text={labels[1]} renderNewLines={true} />
      </div>
      <div className="label bottom">
        {" "}
        <MathComponent text={labels[2]} renderNewLines={true} />
      </div>
      <div className="label left">
        {" "}
        <MathComponent text={labels[3]} renderNewLines={true} />
      </div>
      <button
        className="rotate-button"
        style={{ fontSize: "1.5em" }}
        onClick={(event) => {
          event.stopPropagation();
          setLabels((prev) => [prev[3], ...prev.slice(0, 3)]);
        }}
      >
        🔄
      </button>
    </div>
  );
});

function findAdjacent(squareIndex, labelIndex, gridDimension) {
  const row = Math.floor(squareIndex / gridDimension);
  const col = squareIndex % gridDimension;

  let adjacentRow = row;
  let adjacentCol = col;
  let adjacentLabelIndex;

  switch (labelIndex) {
    case 0: // Top
      adjacentRow = row - 1;
      adjacentLabelIndex = 2; // Bottom label of the square above
      break;
    case 1: // Right
      adjacentCol = col + 1;
      adjacentLabelIndex = 3; // Left label of the square on the right
      break;
    case 2: // Bottom
      adjacentRow = row + 1;
      adjacentLabelIndex = 0; // Top label of the square below
      break;
    case 3: // Left
      adjacentCol = col - 1;
      adjacentLabelIndex = 1; // Right label of the square on the left
      break;
    default:
      return null;
  }

  if (
    adjacentRow >= 0 &&
    adjacentRow < gridDimension &&
    adjacentCol >= 0 &&
    adjacentCol < gridDimension
  ) {
    const adjacentSquareIndex = adjacentRow * gridDimension + adjacentCol;
    return { squareIndex: adjacentSquareIndex, labelIndex: adjacentLabelIndex };
  } else {
    return null; // Indicates the label is facing outwards
  }
}

function checkSolution(squares, originalPairs, gridDimension) {
  for (let squareIndex = 0; squareIndex < squares.length; squareIndex++) {
    const square = squares[squareIndex];

    for (let labelIndex = 0; labelIndex < 4; labelIndex++) {
      const label = square.labels[labelIndex];

      // Skip empty labels
      if (label === "") continue;

      // Find the adjacent square and label index
      const adjacent = findAdjacent(squareIndex, labelIndex, gridDimension);

      // If there's no adjacent square (label is facing outwards), puzzle can't be correct
      if (adjacent === null) return false;

      // Get the label from the adjacent square
      const adjacentLabel =
        squares[adjacent.squareIndex].labels[adjacent.labelIndex];

      // If the adjacent label is empty, puzzle can't be correct
      if (adjacentLabel === "") return false;

      // Check if the pair exists in the original pairs list
      const pair = `${label}:${adjacentLabel}`;
      const reversedPair = `${adjacentLabel}:${label}`;

      if (
        !originalPairs.includes(pair) &&
        !originalPairs.includes(reversedPair)
      ) {
        return false;
      }
    }
  }

  // If we've made it through all the checks, the puzzle is correct
  return true;
}

const SquareGrid = ({ components, originalPairs, gridDimension }) => {
  const [selected, setSelected] = useState(null);
  const [firstSelected, setFirstSelected] = useState(null); // First selected square for swapping
  const squareRefs = useRef([]);
  const [message, setMessage] = useState(null);
  const [fontSize, setFontSize] = useState(1); // Default font size
  const [isCorrect, setIsCorrect] = useState(false);

  const increaseFontSize = () => setFontSize((prevSize) => prevSize + 0.1);
  const decreaseFontSize = () =>
    setFontSize((prevSize) => Math.max(0.4, prevSize - 0.1));

  const handleCheckSolution = () => {
    const result = checkPuzzle();
    if (result) {
      setIsCorrect(true);
      setMessage("Well Done!");
    } else {
      setIsCorrect(false);
      setMessage("Not Yet!");
    }

    // Clear the message after 2 seconds
    setTimeout(() => setMessage(null), 2000);
  };

  const checkPuzzle = () => {
    const allSquares = squareRefs.current.map((ref) => ({
      labels: ref.getLabels(),
    }));
    return checkSolution(allSquares, originalPairs, gridDimension);
  };

  const handleSelect = (index) => {
    if (firstSelected !== null) {
      // Swap labels between firstSelected and currently selected square
      const firstLabels = squareRefs.current[firstSelected].getLabels();
      const secondLabels = squareRefs.current[index].getLabels();
      squareRefs.current[firstSelected].setLabels(secondLabels);
      squareRefs.current[index].setLabels(firstLabels);

      // Reset firstSelected and selected
      setFirstSelected(null);
      setSelected(null);

      checkPuzzle();
    } else {
      setFirstSelected(index);
      setSelected(index);
    }
  };

  return (
    <>
      <div
        style={{ fontSize: `${fontSize}em` }}
        className={`grid-container ${
          gridDimension === 3 ? "three-by-three" : "four-by-four"
        }`}
      >
        {components.map((props, index) => (
          <div key={index} className="grid-item">
            <SquareComponent
              ref={(el) => (squareRefs.current[index] = el)}
              {...props}
              isSelected={selected === index}
              onSelect={() => handleSelect(index)}
              checkPuzzle={checkPuzzle}
            />
          </div>
        ))}
      </div>
      {message && (
        <div className={`message ${isCorrect ? "isCorrect" : "isIncorrect"}`}>
          {message}
        </div>
      )}
      <span>
        <button onClick={handleCheckSolution}>Check Solution</button>
        <button onClick={increaseFontSize}>+</button>
        <button onClick={decreaseFontSize}>-</button>
      </span>
    </>
  );
};

const GameArea = ({ text }) => {
  let lines = text.split("\n");
  const originalPairs = lines.map((line) => line.replace("\n", ""));
  // Shuffle and swap function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Function to rotate labels in a grid object
  const rotateLabels = (gridObj) => {
    const keys = ["lb1", "lb2", "lb3", "lb4"];
    const numRotations = Math.floor(Math.random() * 4); // Random number between 0 and 3

    for (let i = 0; i < numRotations; i++) {
      const temp = gridObj[keys[3]];
      for (let j = 3; j > 0; j--) {
        gridObj[keys[j]] = gridObj[keys[j - 1]];
      }
      gridObj[keys[0]] = temp;
    }

    return gridObj;
  };

  // Randomly swap questions and answers and shuffle the order
  lines = shuffleArray(
    lines.map((line) => {
      const [q, a] = line.split(":");
      return Math.random() > 0.5 ? `${a}:${q}` : line;
    })
  );

  // BUILD PUZZLE: Step 1: Determine Grid Dimension
  const pairsCount = lines.length;
  let gridDimension;

  if (pairsCount <= 12) {
    gridDimension = 3;
  } else if (pairsCount <= 24) {
    gridDimension = 4;
  } else {
    console.error("Too many question-answer pairs!");
  }

  // Step 2: Initialize 2D Grid
  const grid = Array.from({ length: gridDimension }, () =>
    Array.from({ length: gridDimension }, () => ({
      lb1: "",
      lb2: "",
      lb3: "",
      lb4: "",
    }))
  );

  // Step 3: Populate Labels
  let counter = 0;
  const qaPairs = lines.map((line) => {
    const [question, answer] = line.split(":");
    return { question, answer };
  });

  for (let row = 0; row < gridDimension; row++) {
    for (let col = 0; col < gridDimension - 1; col++) {
      if (counter < pairsCount) {
        grid[row][col].lb2 = qaPairs[counter].question;
        grid[row][col + 1].lb4 = qaPairs[counter].answer;
        counter++;
      }
    }
    if (row < gridDimension - 1) {
      for (let col = 0; col < gridDimension; col++) {
        if (counter < pairsCount) {
          grid[row][col].lb3 = qaPairs[counter].question;
          grid[row + 1][col].lb1 = qaPairs[counter].answer;
          counter++;
        }
      }
    }
  }

  // Step 4: Flatten 2D Grid
  const components = shuffleArray(grid.flat());

  // Step 5: apply a random number of rotations to each:
  const rotatedComponents = components.map(rotateLabels);

  // Pass 'components' to SquareGrid

  return (
    <div className="gameArea">
      <SquareGrid
        components={rotatedComponents}
        originalPairs={originalPairs}
        gridDimension={gridDimension}
      />
    </div>
  );
};

function Tarsia({ text }) {
  return (
    <>
      <h1 className="interactiveTitle">Tarsia Puzzle</h1>
      <p className="instructions">
        Get pairs next to each other: use rotate button or click one box then
        the other to swap.
      </p>
      <GameArea text={text} />
    </>
  );
}

export default Tarsia;
