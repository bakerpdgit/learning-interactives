import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./GoldRun.module.css";

// Utility function to shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Parse configuration text
const parseConfig = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let timeSeconds = 60; // default
  let configLines = [...lines];
  
  // Check for TIME: line
  if (lines.length > 0 && lines[0].startsWith('TIME:')) {
    const timeStr = lines[0].slice(5);
    const parsedTime = parseInt(timeStr, 10);
    if (!isNaN(parsedTime)) {
      timeSeconds = Math.max(10, Math.min(300, parsedTime)); // clamp to 10-300
    }
    configLines = lines.slice(1);
  }
  
  // Parse clue:answer lines
  const items = configLines.map(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      throw new Error(`Invalid line format: ${line}`);
    }
    
    const clue = line.slice(0, colonIndex).trim();
    const answer = line.slice(colonIndex + 1).trim();
    
    // Remove punctuation and get first letter
    const cleanAnswer = answer.replace(/[^a-zA-Z]/g, '');
    if (cleanAnswer.length === 0 || !/^[A-Za-z]/.test(cleanAnswer)) {
      throw new Error(`Answer must start with A-Z: ${answer}`);
    }
    
    return {
      clue,
      answer,
      letter: cleanAnswer[0].toUpperCase()
    };
  });
  
  if (items.length !== 20) {
    throw new Error(`Need exactly 20 clue:answer lines, got ${items.length}`);
  }
  
  return { timeSeconds, items };
};

// Build adjacency list for hexagonal grid (odd-r layout)
const buildAdjacencyList = () => {
  const adj = new Map();
  
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const key = `${r},${c}`;
      const neighbors = [];
      
      if (r % 2 === 0) { // even rows (0, 2)
        const possibleNeighbors = [
          [r - 1, c], [r - 1, c - 1], [r, c - 1],
          [r + 1, c], [r + 1, c - 1], [r, c + 1]
        ];
        
        for (const [nr, nc] of possibleNeighbors) {
          if (nr >= 0 && nr < 4 && nc >= 0 && nc < 5) {
            neighbors.push(`${nr},${nc}`);
          }
        }
      } else { // odd rows (1, 3)
        const possibleNeighbors = [
          [r - 1, c + 1], [r - 1, c], [r, c - 1],
          [r + 1, c + 1], [r + 1, c], [r, c + 1]
        ];
        
        for (const [nr, nc] of possibleNeighbors) {
          if (nr >= 0 && nr < 4 && nc >= 0 && nc < 5) {
            neighbors.push(`${nr},${nc}`);
          }
        }
      }
      
      adj.set(key, neighbors);
    }
  }
  
  return adj;
};

// Check if there's a path from left to right
const checkWinCondition = (grid, adj) => {
  const visited = new Set();
  const queue = [];
  
  // Add all correct cells in column 0 to queue
  for (let r = 0; r < 4; r++) {
    if (grid[r][0].state === 'correct') {
      const key = `${r},0`;
      queue.push(key);
      visited.add(key);
    }
  }
  
  // BFS to find path to column 4
  while (queue.length > 0) {
    const current = queue.shift();
    const [, c] = current.split(',').map(Number);
    
    // If we reached column 4, we have a winning path
    if (c === 4) {
      return true;
    }
    
    // Check neighbors
    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const [nr, nc] = neighbor.split(',').map(Number);
        if (grid[nr][nc].state === 'correct') {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
  
  return false;
};

const GoldRun = ({ text }) => {
  const [gameState, setGameState] = useState({
    secondsTotal: 60,
    secondsRemaining: 60,
    status: 'idle', // 'idle' | 'running' | 'won' | 'lost'
    grid: [],
    adj: new Map()
  });
  
  const [showModal, setShowModal] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [lastTimerUpdate, setLastTimerUpdate] = useState(0);
  
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  
  // Initialize game from text
  useEffect(() => {
    try {
      const { timeSeconds, items } = parseConfig(text);
      const shuffledItems = shuffleArray(items);
      
      // Create 4x5 grid
      const grid = [];
      for (let r = 0; r < 4; r++) {
        const row = [];
        for (let c = 0; c < 5; c++) {
          const index = r * 5 + c;
          row.push({
            ...shuffledItems[index],
            id: `${r}-${c}`,
            row: r,
            col: c,
            state: 'unanswered' // 'unanswered' | 'correct' | 'incorrect'
          });
        }
        grid.push(row);
      }
      
      const adj = buildAdjacencyList();
      
      setGameState({
        secondsTotal: timeSeconds,
        secondsRemaining: timeSeconds,
        status: 'idle',
        grid,
        adj
      });
    } catch (error) {
      console.error('Error parsing config:', error);
      // Set error state if needed
    }
  }, [text]);
  
  // Timer logic
  useEffect(() => {
    if (gameState.status === 'running') {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newRemaining = prev.secondsRemaining - 1;
          
          // Timer announcement for accessibility (every 10 seconds)
          const now = Date.now();
          if (newRemaining % 10 === 0 && now - lastTimerUpdate > 9000) {
            setLastTimerUpdate(now);
            // This would trigger aria-live announcement
          }
          
          if (newRemaining <= 0) {
            // Game over
            setShowGameOver(true);
            setTimeout(() => setShowGameOver(false), 3000);
            return { ...prev, secondsRemaining: 0, status: 'lost' };
          }
          
          return { ...prev, secondsRemaining: newRemaining };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.status, lastTimerUpdate]);
  
  // Handle hex click
  const handleHexClick = useCallback((card) => {
    if (gameState.status === 'won' || gameState.status === 'lost' || card.state !== 'unanswered') {
      return;
    }
    
    // Start timer on first click
    if (gameState.status === 'idle') {
      setGameState(prev => ({ ...prev, status: 'running' }));
    }
    
    setCurrentCard(card);
    setAnswerRevealed(false);
    setShowModal(true);
  }, [gameState.status]);
  
  // Handle answer reveal
  const handleReveal = () => {
    setAnswerRevealed(true);
  };
  
  // Handle correct answer
  const handleCorrect = () => {
    setGameState(prev => {
      const newGrid = prev.grid.map(row => 
        row.map(cell => 
          cell.id === currentCard.id 
            ? { ...cell, state: 'correct' }
            : cell
        )
      );
      
      // Check win condition
      const hasWon = checkWinCondition(newGrid, prev.adj);
      
      if (hasWon) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        return {
          ...prev,
          grid: newGrid,
          status: 'won'
        };
      }
      
      return {
        ...prev,
        grid: newGrid
      };
    });
    
    setShowModal(false);
    setCurrentCard(null);
  };
  
  // Handle incorrect answer
  const handleIncorrect = () => {
    setGameState(prev => ({
      ...prev,
      grid: prev.grid.map(row => 
        row.map(cell => 
          cell.id === currentCard.id 
            ? { ...cell, state: 'incorrect' }
            : cell
        )
      )
    }));
    
    setShowModal(false);
    setCurrentCard(null);
  };
  
  // Close modal (only after choice is made)
  const handleCloseModal = () => {
    if (answerRevealed) {
      setShowModal(false);
      setCurrentCard(null);
    }
  };
  
  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.header}>
        <div className={styles.timer} aria-live="polite">
          ⏱ {gameState.secondsRemaining}
        </div>
        <div className={styles.instructions}>
          {gameState.status === 'idle' 
            ? "Build a path left-to-right to win. Click any hex to start the timer."
            : gameState.status === 'running'
            ? "Build a path left-to-right to win."
            : gameState.status === 'won'
            ? "Congratulations! You built a winning path!"
            : "Time's up! Better luck next time."
          }
        </div>
      </div>
      
      <div className={styles.gameArea}>
        <HexagonalBoard 
          grid={gameState.grid} 
          onHexClick={handleHexClick}
          gameStatus={gameState.status}
        />
      </div>
      
      {showModal && currentCard && (
        <ClueModal
          card={currentCard}
          answerRevealed={answerRevealed}
          onReveal={handleReveal}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onClose={handleCloseModal}
        />
      )}
      
      {showCelebration && (
        <div className={styles.celebration}>🎉</div>
      )}
      
      {showGameOver && (
        <div className={styles.gameOver}>😞</div>
      )}
    </div>
  );
};

// Hexagonal board component
const HexagonalBoard = ({ grid, onHexClick, gameStatus }) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const gameAreaRef = useRef(null);
  
  useEffect(() => {
    const updateDimensions = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(400, rect.width - 40),
          height: Math.max(300, rect.height - 40)
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  const hexRadius = Math.min(dimensions.width / 14, dimensions.height / 8);
  const hexWidth = hexRadius * 2;
  const hexHeight = Math.sqrt(3) * hexRadius;
  const horizontalSpacing = hexWidth * 0.85;
  const verticalSpacing = hexHeight * 0.75; // Exact mathematical spacing for hexagonal grid: 3/4 * hexHeight
  
  const padding = 20;
  const leftMargin = 25; // Increased margin to ensure left decorative column border is fully visible
  // Calculate board width to show equal decorative columns on both sides
  // Left column at -1, game columns 0-4, right column at 5
  // With odd-row offset, we need to account for the maximum extent
  const maxLeftX = -horizontalSpacing + padding - leftMargin; // Left decorative column with margin
  const maxRightX = 5 * horizontalSpacing + horizontalSpacing * 0.5 + hexWidth + padding + leftMargin; // Right decorative with odd-row offset and matching margin
  const boardWidth = maxRightX - maxLeftX;
  const boardHeight = 3 * verticalSpacing + hexHeight + padding * 2 + 50; // Added 50px for safe margin
  
  // Calculate hex center positions
  const getHexCenter = (row, col) => {
    const baseX = col * horizontalSpacing + (row % 2 ? horizontalSpacing * 0.5 : 0) + hexRadius;
    const x = baseX - maxLeftX; // Offset to account for left decorative column
    const y = row * verticalSpacing + hexRadius + padding;
    return { x, y };
  };
  
  // Generate hex polygon points
  const getHexPoints = (centerX, centerY) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
      const x = centerX + hexRadius * Math.cos(angle);
      const y = centerY + hexRadius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };
  
  // Generate decorative side columns
  const leftDecorative = [];
  const rightDecorative = [];
  
  for (let r = 0; r < 4; r++) {
    const leftCenter = getHexCenter(r, -1);
    const rightCenter = getHexCenter(r, 5);
    
    leftDecorative.push(
      <polygon
        key={`left-${r}`}
        points={getHexPoints(leftCenter.x, leftCenter.y)}
        className={styles.hexDecorative}
      />
    );
    
    rightDecorative.push(
      <polygon
        key={`right-${r}`}
        points={getHexPoints(rightCenter.x, rightCenter.y)}
        className={styles.hexDecorative}
      />
    );
  }
  
  return (
    <div className={styles.boardContainer} ref={gameAreaRef}>
      <svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className={styles.board}
      >
        {/* Decorative side columns */}
        {leftDecorative}
        {rightDecorative}
        
        {/* Game hexes */}
        {grid.map((row, r) => 
          row.map((card, c) => {
            const center = getHexCenter(r, c);
            const isDisabled = gameStatus === 'won' || gameStatus === 'lost' || card.state !== 'unanswered';
            
            return (
              <g key={card.id} className={styles.hexGroup}>
                <polygon
                  points={getHexPoints(center.x, center.y)}
                  className={`${styles.hex} ${
                    card.state === 'correct' ? styles.hexCorrect :
                    card.state === 'incorrect' ? styles.hexIncorrect :
                    isDisabled ? styles.hexDisabled : styles.hexUnanswered
                  }`}
                  onClick={() => !isDisabled && onHexClick(card)}
                  style={{ 
                    cursor: isDisabled ? 'default' : 'pointer',
                    pointerEvents: 'visible'
                  }}
                />
                <text
                  x={center.x}
                  y={center.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={styles.hexText}
                  style={{ pointerEvents: 'none' }}
                >
                  {card.letter}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

// Clue modal component
const ClueModal = ({ card, answerRevealed, onReveal, onCorrect, onIncorrect, onClose }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    // Focus trap for accessibility
    const firstButton = modalRef.current?.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && answerRevealed) {
        onClose();
      }
      
      // Simple focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll('button');
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [answerRevealed, onClose]);
  
  return (
    <div className={styles.modalOverlay} onClick={answerRevealed ? onClose : undefined}>
      <div 
        className={styles.modalContent} 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.clueText}>{card.clue}</div>
        
        {!answerRevealed ? (
          <div className={styles.buttonGroup}>
            <button 
              className={styles.revealButton}
              onClick={onReveal}
            >
              REVEAL
            </button>
          </div>
        ) : (
          <>
            <div className={styles.answerText}>{card.answer}</div>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.correctButton}
                onClick={onCorrect}
              >
                I WAS CORRECT
              </button>
              <button 
                className={styles.incorrectButton}
                onClick={onIncorrect}
              >
                I WAS INCORRECT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GoldRun;