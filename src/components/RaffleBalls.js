import React, { useState, useEffect, useRef } from "react";
import Matter from "matter-js";
import styles from "./RaffleBalls.module.css";

function RaffleBalls({ text }) {
  const gameAreaRef = useRef(null);
  const engineRef = useRef(null);
  const ballsRef = useRef([]);
  const [expandedBallIndex, setExpandedBallIndex] = useState(null);
  const [ballPositions, setBallPositions] = useState([]);
  const [showBalls, setShowBalls] = useState(true);
  const [partitionLeft, setPartitionLeft] = useState(null);
  const [partitionRight, setPartitionRight] = useState(null);
  const [winnerFound, setWinnerFound] = useState(false);
  const [winningBallIndex, setWinningBallIndex] = useState(null);
  const [playerColours, setPlayerColours] = useState({});
  const [gameText, setGameText] = useState(
    text.startsWith("OPTIONS:") ? text.split("\n").slice(1).join("\n") : text
  );
  const [winners, setWinners] = useState([]);
  const [dropAll, setDropAll] = useState(false);
  const [groupSize, setGroupSize] = useState(0);

  useEffect(() => {
    const optionsLine = text.split("\n")[0];
    if (optionsLine.startsWith("OPTIONS:")) {
      const options = optionsLine.split(":")[1].split(",");
      options.forEach((option) => {
        const [key, value] = option.split("=");
        if (key === "drop_all" && value === "yes") {
          setDropAll(true);
        } else if (key === "group_size") {
          setGroupSize(parseInt(value, 10));
        }
      });
    }
  }, [text]);

  useEffect(() => {
    const handleResize = () => {
      window.location.reload();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const engine = Matter.Engine.create();
    engine.gravity.y = 0;
    engine.gravity.x = 0;
    engineRef.current = engine;
    ballsRef.current = [];

    // Create a renderer
    const render = Matter.Render.create({
      element: gameAreaRef.current,
      engine: engine,
      options: {
        width: gameAreaRef.current.offsetWidth,
        height: gameAreaRef.current.offsetHeight,
        wireframes: false,
        background: "#f0f0f0", // light gray background
      },
    });

    // Create the walls and partition
    const bounds = {
      width: gameAreaRef.current.offsetWidth,
      height: gameAreaRef.current.offsetHeight,
    };

    const walls = [
      Matter.Bodies.rectangle(bounds.width / 2, 0, bounds.width, 10, {
        isStatic: true,
        render: { fillStyle: "red" },
      }), // Top wall
      !dropAll &&
        Matter.Bodies.rectangle(
          bounds.width / 2,
          bounds.height,
          bounds.width,
          10,
          {
            isStatic: true,
            render: { fillStyle: "red" },
          }
        ), // Bottom wall
      Matter.Bodies.rectangle(0, bounds.height / 2, 10, bounds.height, {
        isStatic: true,
        render: { fillStyle: "red" },
      }), // Left wall
      Matter.Bodies.rectangle(
        bounds.width,
        bounds.height / 2,
        10,
        bounds.height,
        {
          isStatic: true,
          render: { fillStyle: "red" },
        }
      ), // Right wall
    ];

    // Create the partition rectangles
    const partitionHeight = 8;
    const partitionY = bounds.height - 150;
    const partLeft =
      !dropAll &&
      Matter.Bodies.rectangle(
        bounds.width / 4,
        partitionY,
        bounds.width / 2,
        partitionHeight,
        {
          isStatic: true,
          render: { fillStyle: "blue" },
        }
      );

    setPartitionLeft(partLeft);

    const partRight =
      !dropAll &&
      Matter.Bodies.rectangle(
        (3 * bounds.width) / 4,
        partitionY,
        bounds.width / 2,
        partitionHeight,
        {
          isStatic: true,
          render: { fillStyle: "blue" },
        }
      );

    setPartitionRight(partRight);

    Matter.World.add(engine.world, [...walls, partLeft, partRight]);

    // Create the funnel rectangles
    const funnelWidth = 8; // Width of the funnel walls
    const funnelGap = 45; // Gap between the two funnel walls at the bottom
    const funnelHeight =
      ((bounds.width / 2 - funnelGap / 2) ** 2 + 110 ** 2) ** 0.5; // Height of the funnel walls

    const funnelLeft = Matter.Bodies.rectangle(
      bounds.width / 2 - funnelGap / 2 - funnelHeight / 2,
      bounds.height -
        (funnelHeight * 110) / (bounds.width / 2 - funnelGap / 2) / 2 -
        40,
      funnelHeight,
      funnelWidth,
      {
        isStatic: true,
        angle: Math.atan(110 / (bounds.width / 2 - funnelGap / 2)),
        render: { fillStyle: "blue" }, // Color for visibility
      }
    );

    const funnelRight = Matter.Bodies.rectangle(
      bounds.width / 2 + funnelGap / 2 + funnelHeight / 2,
      bounds.height -
        (funnelHeight * 110) / (bounds.width / 2 - funnelGap / 2) / 2 -
        40,
      funnelHeight,
      funnelWidth,
      {
        isStatic: true,
        angle: Math.PI - Math.atan(110 / (bounds.width / 2 - funnelGap / 2)),
        render: { fillStyle: "blue" }, // Color for visibility
      }
    );

    const funnelBaseLeft = Matter.Bodies.rectangle(
      bounds.width / 2 - funnelGap / 2 - funnelWidth,
      bounds.height - 20,
      funnelWidth,
      40,
      {
        isStatic: true,
        render: { fillStyle: "blue" }, // Color for visibility
      }
    );

    const funnelBaseRight = Matter.Bodies.rectangle(
      bounds.width / 2 + funnelGap / 2 + funnelWidth,
      bounds.height - 20,
      funnelWidth,
      40,
      {
        isStatic: true,
        render: { fillStyle: "blue" }, // Color for visibility
      }
    );

    // Add the funnel rectangles to the world
    Matter.World.add(engine.world, [
      funnelLeft,
      funnelRight,
      funnelBaseLeft,
      funnelBaseRight,
    ]);

    const participants = gameText.split("\n").map((line) => {
      const [name, score] = line.split(",");
      return { name, score: parseInt(score, 10) ? parseInt(score, 10) : 1 };
    });

    const initialPositions = [];
    const currPlayerColors = playerColours;

    // Assign colors to each player, spreading them across the color spectrum
    participants.forEach((participant, participantIndex) => {
      if (!currPlayerColors[participant.name]) {
        const hue = (participantIndex * 360) / participants.length;
        currPlayerColors[participant.name] = `hsl(${hue}, 100%, 50%)`;
      }

      Array.from({ length: participant.score }).forEach((_, i) => {
        const x = 20 + Math.random() * (bounds.width - 40);
        const y = 20 + Math.random() * (bounds.height - 190);
        const color = currPlayerColors[participant.name];
        const ball = Matter.Bodies.circle(x, y, 20, {
          restitution: 1,
          friction: 0,
          frictionAir: 0,
          frictionStatic: 0,
          inertia: Infinity,
          render: {
            fillStyle: color,
          },
          label: participant.name, // Store the label
          customColor: color, // Store the color
        });
        ballsRef.current.push(ball);
        initialPositions.push({ x, y, color, label: participant.name });
      });
    });

    setBallPositions(initialPositions);
    setPlayerColours(currPlayerColors);

    // Run the renderer and engine's runner
    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Cleanup on unmount
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null;
      render.context = null;
      render.textures = {};
    };
  }, [gameText, playerColours, dropAll]);

  const startBouncingAll = () => {
    setShowBalls(false);
    setExpandedBallIndex(null);

    ballsRef.current.forEach((ball) => {
      Matter.World.add(engineRef.current.world, ball);
      const forceX = (Math.random() - 0.5) * 0.1;
      const forceY = (Math.random() - 0.5) * 0.1;
      Matter.Body.applyForce(
        ball,
        { x: ball.position.x, y: ball.position.y },
        { x: forceX, y: forceY }
      );
    });

    engineRef.current.world.gravity.y = 1;

    ballsRef.current.forEach((ball) => {
      Matter.Body.set(ball, {
        restitution: 0.5,
      });
    });

    Matter.Events.on(engineRef.current, "afterUpdate", () => {
      setWinnerFound(true);
      ballsRef.current.forEach((ball, index) => {
        if (ball.position.y > gameAreaRef.current.offsetHeight) {
          setWinners((prev) => [...prev, ball.label]);
          Matter.World.remove(engineRef.current.world, ball);
          ballsRef.current.splice(index, 1);
        }
      });

      if (ballsRef.current.length === 0) {
        Matter.Events.off(engineRef.current, "afterUpdate");
      }
    });
  };

  // Function to start bouncing
  const startBouncing = () => {
    if (dropAll) {
      startBouncingAll();
      return;
    }

    setShowBalls(false); // Hide the static balls

    ballsRef.current.forEach((ball) => {
      Matter.World.add(engineRef.current.world, ball);
      const forceX = (Math.random() - 0.5) * 0.1; // Random force between -0.05 and 0.05
      const forceY = (Math.random() - 0.5) * 0.1;
      Matter.Body.applyForce(
        ball,
        { x: ball.position.x, y: ball.position.y },
        { x: forceX, y: forceY }
      );
    });

    // Move the partition after 5 seconds
    // Move the partition after 5 seconds
    setTimeout(() => {
      // Enable gravity on the y-axis
      engineRef.current.world.gravity.y = 1;

      // Reduce restitution to make the balls lose energy
      ballsRef.current.forEach((ball) => {
        Matter.Body.set(ball, {
          restitution: 0.5,
        });
      });

      // Set another timeout to open the partition after another 5 seconds
      setTimeout(() => {
        // Reduce the width of the partitions to allow some balls to fall through
        Matter.World.remove(engineRef.current.world, [
          partitionLeft,
          partitionRight,
        ]);

        // After another 5 seconds, update the positions of all balls and find the winner
        setTimeout(() => {
          let winningBall = ballsRef.current[0];
          let winningIndex = 0;

          ballsRef.current.forEach((ball, index) => {
            if (ball.position.y > winningBall.position.y) {
              winningBall = ball;
              winningIndex = index;
            }
          });

          // Rebuild ballPositions from ballsRef
          const newBallPositions = ballsRef.current.map((ball) => ({
            color: ball.customColor, // Retrieve the color stored in the ball object
            label: ball.label, // Retrieve the label stored in the ball object
            x: ball.position.x,
            y: ball.position.y,
            visible: true, // Make all balls visible
          }));

          setBallPositions(newBallPositions);

          // Expand only the winning ball
          setExpandedBallIndex(winningIndex);
          Matter.World.remove(engineRef.current.world, ballsRef.current);
          setWinningBallIndex(winningIndex);
          setShowBalls(true);
          setWinnerFound(true);
          // Add the winner to the winners list
          setWinners((prev) => [...prev, winningBall.label]);
        }, 4000);
      }, 3000);
    }, 3000);
  };

  // Function to handle ball click
  const handleBallClick = (index) => {
    setExpandedBallIndex(index);
  };

  // Function to reset the game to the initial state
  const resetGame = () => {
    // reload the page
    window.location.reload();
  };

  const resetWithoutWinningBall = () => {
    const winningLabel = ballPositions[winningBallIndex].label;

    const updatedParticipants = gameText
      .split("\n")
      .map((line) => {
        const [name, score] = line.split(",");
        if (name === winningLabel) {
          const newScore = parseInt(score, 10) - 1;
          return `${name},${newScore}`;
        }
        return line;
      })
      .filter((line) => !line.includes(",0")) // Optionally filter out any participant with a score of 0
      .join("\n");

    setWinnerFound(false);
    setExpandedBallIndex(null);
    setGameText(updatedParticipants); // Trigger re-render with updated text
  };

  // Function to reset the game without the winning player's balls
  const resetWithoutWinner = () => {
    const winningLabel = ballPositions[winningBallIndex].label;
    const updatedParticipants = gameText
      .split("\n")
      .filter((line) => !line.startsWith(winningLabel))
      .join("\n");

    setWinnerFound(false);
    setExpandedBallIndex(null);
    setGameText(updatedParticipants); // Trigger re-render with updated text
  };

  return (
    <div>
      <button onClick={startBouncing} className={styles.selectButton}>
        SELECT
      </button>
      {winnerFound && (
        <>
          <button onClick={resetGame}>RESET</button>
          {!dropAll && (
            <button onClick={resetWithoutWinningBall}>
              RESET WITHOUT WINNING BALL
            </button>
          )}
          {!dropAll && (
            <button onClick={resetWithoutWinner}>RESET WITHOUT WINNER</button>
          )}
        </>
      )}
      <div ref={gameAreaRef} className={styles.gameArea}>
        {showBalls &&
          ballPositions.map((ball, index) => (
            <div
              key={index}
              id={`ball-${index}`}
              className={`${styles.ball} ${
                expandedBallIndex === index ? styles.expanded : ""
              }`}
              onClick={() => handleBallClick(index)}
              style={{
                backgroundColor: ball.color,
                top: `${ball.y - 20}px`,
                left: `${ball.x - 20}px`,
              }}
            >
              {expandedBallIndex === index ? (
                <span className={styles.ballText}>{ball.label}</span>
              ) : null}
            </div>
          ))}
      </div>
      {winnerFound && (
        <div className={styles.winnersPanel}>
          <h3>Results</h3>
          <div className={styles.winnersList}>
            {winners.map((winner, index) => (
              <React.Fragment key={index}>
                <div className={styles.winner}>
                  {index + 1}. {winner}
                </div>
                {groupSize > 1 && (index + 1) % groupSize === 0 && (
                  <hr className={styles.separator} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RaffleBalls;
