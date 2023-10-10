import React, { useState, useEffect } from "react";
import "./Timers.css";

const TimerBar = ({ label, remainingTime, height, initialTime }) => {
  const style = {
    height: `${height}%`,
    padding: "10px",
    margin: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid black",
    background: `linear-gradient(-90deg, #ADD8E6 ${(
      (remainingTime / initialTime) *
      100
    ).toFixed(2)}%, #FFCCCC ${((remainingTime / initialTime) * 100).toFixed(
      2
    )}%)`,
  };

  return (
    <div style={style}>
      <span style={{ fontSize: "xx-large" }}>
        {label} ({remainingTime})
      </span>
    </div>
  );
};

function Timers({ text }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTimerIndex, setActiveTimerIndex] = useState(0);
  const lines = text.split("\n");
  const initialTimes = lines.map((line) => parseInt(line.split(":")[1]));
  const [remainingTimes, setRemainingTimes] = useState([...initialTimes]);

  const totalSeconds = initialTimes.reduce((acc, time) => acc + time, 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTimes((prevTimes) => {
        const newTimes = [...prevTimes];
        if (newTimes[activeTimerIndex] > 0) {
          newTimes[activeTimerIndex]--;
        }
        if (newTimes[activeTimerIndex] === 0) {
          if (activeTimerIndex + 1 < lines.length) {
            setActiveTimerIndex((prevIndex) => prevIndex + 1);
          } else {
            clearInterval(timer);
            setShowCelebration(true);
            playTrumpetBlast();
          }
        }
        return newTimes;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [activeTimerIndex, lines.length]);

  const timerBars = lines.map((line, index) => {
    const [label] = line.split(":");
    const height = (initialTimes[index] / totalSeconds) * 100;
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

// Initialize audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a trumpet-like note
function playNote(frequency, duration) {
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
