import React, { useState, useEffect } from "react";
import styles from "./Timers.module.css";

const TimerBar = ({ label, remainingTime, height, initialTime }) => {
  // Calculate the percentage of time remaining
  const percentage = (remainingTime / initialTime) * 100;

  // Define the style for the timer bar
  const style = {
    height: `${height}%`,
    padding: "10px",
    margin: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid black",
    // Ensure the gradient visually decreases from the left as time decreases
    background: `linear-gradient(to left, #FFCCCC ${percentage}%, #ADD8E6 ${percentage}%)`,
  };

  return (
    <div style={style}>
      <span style={{ fontSize: "xx-large" }}>
        {label} ({Math.max(0, Math.round(remainingTime))})
      </span>
    </div>
  );
};

function Timers({ text }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPlayed, setCelebrationPlayed] = useState(false);
  const lines = text.split("\n");
  const initialTimes = lines.map((line) => parseInt(line.split(":")[1], 10));
  const [startTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const [pauseOffset, setPauseOffset] = useState(0);
  const [lastPauseTime, setLastPauseTime] = useState(null);

  useEffect(() => {
    let interval;

    const setupInterval = () => {
      // Clear any existing interval
      clearInterval(interval);

      const now = Date.now();
      const elapsed = now - startTime - pauseOffset;
      const nextTickDuration = 1000 - (elapsed % 1000); // Time until the next full second

      interval = setTimeout(() => {
        setCurrentTime(Date.now());

        // Set up the regular interval after adjusting to the next full second
        interval = setInterval(() => {
          setCurrentTime(Date.now());
        }, 1000);
      }, nextTickDuration);
    };

    if (!isPaused) {
      setupInterval();
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isPaused, pauseOffset, startTime]);

  const calculateRemainingTimes = () => {
    let totalElapsedSeconds = (currentTime - startTime - pauseOffset) / 1000;
    let accumulatedTime = 0;

    return initialTimes.map((initialTime, index) => {
      if (
        totalElapsedSeconds > accumulatedTime &&
        totalElapsedSeconds < accumulatedTime + initialTime
      ) {
        const remainingTime =
          initialTime - (totalElapsedSeconds - accumulatedTime);
        accumulatedTime += initialTime;
        return remainingTime;
      } else if (totalElapsedSeconds >= accumulatedTime + initialTime) {
        accumulatedTime += initialTime;
        return 0;
      } else {
        accumulatedTime += initialTime;
        return initialTime;
      }
    });
  };

  const togglePause = () => {
    if (isPaused) {
      // Unpausing
      const currentPauseTime = Date.now() - lastPauseTime;
      setPauseOffset((prevOffset) => prevOffset + currentPauseTime);
      setCurrentTime(Date.now()); // Update currentTime immediately on unpause
    } else {
      // Pausing
      setLastPauseTime(Date.now());
    }
    setIsPaused(!isPaused);
  };

  const remainingTimes = calculateRemainingTimes();

  useEffect(() => {
    const totalDuration = initialTimes.reduce((acc, time) => acc + time, 0);
    const adjustedElapsedTime = (currentTime - startTime - pauseOffset) / 1000;

    if (adjustedElapsedTime >= totalDuration && !celebrationPlayed) {
      setShowCelebration(true);
      playTrumpetBlast();
      setCelebrationPlayed(true);
    }
  }, [currentTime, initialTimes, startTime, pauseOffset, celebrationPlayed]);

  const timerBars = lines.map((line, index) => {
    const [label] = line.split(":");
    const height =
      (initialTimes[index] /
        initialTimes.reduce((acc, time) => acc + time, 0)) *
      100;
    return (
      <TimerBar
        key={label}
        label={label}
        remainingTime={remainingTimes[index]}
        height={height}
        initialTime={initialTimes[index]}
      />
    );
  });

  return (
    <>
      <div className={styles.GameArea}>
        <button onClick={togglePause} className={styles.pauseButton}>
          {isPaused ? "▶️" : "⏸️"}
        </button>
        {timerBars}
      </div>
      {showCelebration && <div className={styles.celebration}>🎉</div>}
    </>
  );
}

// Function to play a trumpet-like note
function playNote(frequency, duration) {
  // Create audio context but leave uninitialised
  let audioCtx = null;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Now you can use audioContext as needed
  }
  // Ensure audioContext is in the correct state (resumed) if already initialized
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  // Create oscillator
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sawtooth"; // Sawtooth wave is somewhat similar to a trumpet's timbre
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); // Frequency in Hz

  // Create a filter to alter the sound
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, audioCtx.currentTime);

  // Connect nodes and start playing
  oscillator.connect(filter);
  filter.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

// Play a sequence of notes to simulate a trumpet blast
function playTrumpetBlast() {
  playNote(440, 0.3); // A4
  setTimeout(() => playNote(466.16, 0.3), 300); // A#4/Bb4
  setTimeout(() => playNote(493.88, 0.3), 600); // B4
  setTimeout(() => playNote(493.88, 0.3), 900); // B4
}

export default Timers;
