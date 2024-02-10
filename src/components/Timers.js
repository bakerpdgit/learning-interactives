import React, { useState, useEffect } from "react";
import "./Timers.css";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateRemainingTimes = () => {
    let totalElapsedSeconds = (currentTime - startTime) / 1000;
    let accumulatedTime = 0;

    return initialTimes.map((initialTime, index) => {
      if (
        totalElapsedSeconds > accumulatedTime &&
        totalElapsedSeconds < accumulatedTime + initialTime
      ) {
        // Active timer
        const remainingTime =
          initialTime - (totalElapsedSeconds - accumulatedTime);
        accumulatedTime += initialTime;
        return remainingTime;
      } else if (totalElapsedSeconds >= accumulatedTime + initialTime) {
        // Past timer
        accumulatedTime += initialTime;
        return 0;
      } else {
        // Future timer
        accumulatedTime += initialTime;
        return initialTime; // Display full time for timers that haven't started
      }
    });
  };

  const remainingTimes = calculateRemainingTimes();

  useEffect(() => {
    const totalDuration = initialTimes.reduce((acc, time) => acc + time, 0);
    if (
      (currentTime - startTime) / 1000 >= totalDuration &&
      !celebrationPlayed
    ) {
      setShowCelebration(true);
      playTrumpetBlast();
      setCelebrationPlayed(true); // Set this to true so it doesn't play again
    }
  }, [currentTime, initialTimes, startTime, celebrationPlayed]);

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
      <h1>Timers</h1>
      <div className="GameArea">{timerBars}</div>
      {showCelebration && <div className="celebration">🎉</div>}
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
