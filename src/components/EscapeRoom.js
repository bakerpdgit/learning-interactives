import React, { useState, useEffect, useRef } from "react";
import styles from "./InteractiveTemplate.module.css";
import MathComponent from "./MathComponent.js";

// Helper function to parse the text prop
const parseText = (text) => {
  if (!text) return { rooms: {}, questionMap: {} };

  const sections = text.split("\n\n");
  const world = sections[0].split("\n");
  const questions = sections.slice(1).map((section) => section.split("\n"));

  const rooms = {};
  const questionMap = {};

  world.forEach((link) => {
    const [from, to] = link.split(">");
    const [fromRoom, direction] = from.split(/(?=[NEWS])/);
    if (!rooms[fromRoom]) rooms[fromRoom] = {};
    rooms[fromRoom][direction] = to;
  });

  questions.forEach((q) => {
    const [roomInfo, question, answers, gift] = q;
    const [room, type] = roomInfo.split(/(?=[TC])/);
    questionMap[room] = {
      type,
      question,
      answers: answers
        .split(",")
        .map((a) => a.replace(/\s/g, "").toLowerCase()),
      gift,
    };
  });

  return { rooms, questionMap };
};

// Helper function to get the map dimensions
const getMapDimensions = (rooms) => {
  let minX = 0,
    maxX = 0,
    minY = 0,
    maxY = 0;
  const positions = { 0: { x: 0, y: 0 } };
  const visited = new Set(["0"]);

  const directions = {
    N: { x: 0, y: -1 },
    S: { x: 0, y: 1 },
    E: { x: 1, y: 0 },
    W: { x: -1, y: 0 },
  };

  const traverse = (room, pos) => {
    if (!rooms[room]) return;
    for (const dir in rooms[room]) {
      const newPos = {
        x: pos.x + directions[dir].x,
        y: pos.y + directions[dir].y,
      };
      const nextRoom = rooms[room][dir];
      if (!visited.has(nextRoom)) {
        visited.add(nextRoom);
        positions[nextRoom] = newPos;
        minX = Math.min(minX, newPos.x);
        maxX = Math.max(maxX, newPos.x);
        minY = Math.min(minY, newPos.y);
        maxY = Math.max(maxY, newPos.y);
        traverse(nextRoom, newPos);
      }
    }
  };

  traverse("0", { x: 0, y: 0 });
  return {
    positions,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    offsetX: -minX,
    offsetY: -minY,
  };
};

function EscapeRoom({ text }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentRoom, setCurrentRoom] = useState("0");
  const [previousRoom, setPreviousRoom] = useState(null);
  const [answeredRooms, setAnsweredRooms] = useState({});
  const [question, setQuestion] = useState(null);

  const { rooms, questionMap } = parseText(text);
  const { positions, width, height, offsetX, offsetY } =
    getMapDimensions(rooms);
  const canvasRef = useRef(null);

  // Update the question state based on the current room
  useEffect(() => {
    if (questionMap[currentRoom] && !answeredRooms[currentRoom]) {
      setQuestion(questionMap[currentRoom]);
    } else {
      setQuestion(null);
    }
  }, [currentRoom, answeredRooms, questionMap]);

  // Draw the map on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = canvas.width / width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw the grid
    // for (let y = 0; y < height; y++) {
    //   for (let x = 0; x < width; x++) {
    //     ctx.strokeRect(x * size, y * size, size, size);
    //   }
    // }

    // Mark the rooms
    for (const room in positions) {
      const pos = positions[room];
      ctx.fillStyle = "grey";
      ctx.fillRect(
        (pos.x + offsetX) * size,
        (pos.y + offsetY) * size,
        size,
        size
      );
      //   ctx.fillText(
      //     room,
      //     (pos.x + offsetX) * size + size / 2,
      //     (pos.y + offsetY) * size + size / 2
      //   );
    }

    // Mark the current room
    const currentPos = positions[currentRoom];
    ctx.fillStyle = "red";
    ctx.fillRect(
      (currentPos.x + offsetX) * size,
      (currentPos.y + offsetY) * size,
      size,
      size
    );
    ctx.fillStyle = "black";
    ctx.fillText(
      "X",
      (currentPos.x + offsetX) * size + size / 2,
      (currentPos.y + offsetY) * size + size / 2
    );
  }, [currentRoom, positions, width, height, offsetX, offsetY]);

  // Handle room navigation
  const handleMove = (direction) => {
    if (rooms[currentRoom] && rooms[currentRoom][direction]) {
      setPreviousRoom(currentRoom);
      setCurrentRoom(rooms[currentRoom][direction]);
    }
  };

  // Handle answering questions
  const handleAnswer = (answer) => {
    const normalizedAnswer = answer.replace(/\s/g, "").toLowerCase();
    if (question.answers.includes(normalizedAnswer)) {
      setAnsweredRooms((prev) => ({ ...prev, [currentRoom]: true }));
      setQuestion(null);
      if (currentRoom === "999") {
        setShowCelebration(true);
      }
    } else {
      alert("Incorrect answer, try again.");
    }
  };

  // Handle going back to the previous room
  const handleBack = () => {
    setCurrentRoom(previousRoom);
  };

  return (
    <>
      <div className={styles.GameArea}>
        {question && (
          <div className={styles.questionPopup}>
            <p>{question.question}</p>
            {question.type === "T" ? (
              <input
                type="text"
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAnswer(e.target.value)
                }
                aria-label="Answer Input"
              />
            ) : (
              question.answers.map((ans, index) => (
                <button key={index} onClick={() => handleAnswer(ans)}>
                  {ans}
                </button>
              ))
            )}
            <button onClick={handleBack}>Back</button>
          </div>
        )}
        <div className={styles.room}>
          <button
            onClick={() => handleMove("N")}
            disabled={!rooms[currentRoom] || !rooms[currentRoom]["N"]}
            aria-label="Move North"
          >
            North
          </button>
          <button
            onClick={() => handleMove("E")}
            disabled={!rooms[currentRoom] || !rooms[currentRoom]["E"]}
            aria-label="Move East"
          >
            East
          </button>
          <button
            onClick={() => handleMove("S")}
            disabled={!rooms[currentRoom] || !rooms[currentRoom]["S"]}
            aria-label="Move South"
          >
            South
          </button>
          <button
            onClick={() => handleMove("W")}
            disabled={!rooms[currentRoom] || !rooms[currentRoom]["W"]}
            aria-label="Move West"
          >
            West
          </button>
        </div>
        <canvas
          ref={canvasRef}
          style={{ width: width * 50, height: height * 50 }}
        />
        {showCelebration && (
          <div className={styles.celebration}>🎉 You Win! 🎉</div>
        )}
      </div>
    </>
  );
}

export default EscapeRoom;
