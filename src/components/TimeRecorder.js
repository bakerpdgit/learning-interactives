import React, { useState, useEffect } from "react";
import styles from "./TimeRecorder.module.css";

const Timer = ({ time }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return (
    <div className={styles.timer}>
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
};

const Button = ({ onClick, label, disabled }) => (
  <button onClick={onClick} className={styles.button} disabled={disabled}>
    {label}
  </button>
);

const Category = ({ name, time, isSelected, onClick }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return (
    <div className={styles.category}>
      <div
        className={`${styles.categoryButton} ${
          isSelected ? styles.selected : ""
        }`}
        onClick={() => onClick(name)}
      >
        {name}
      </div>
      <div className={styles.categoryTime}>
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </div>
    </div>
  );
};

const TimeRecorderComponent = ({ initialTime = 0, categories = [] }) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [currentCategory, setCurrentCategory] = useState("OTHER");
  const [categoryTimes, setCategoryTimes] = useState(
    categories.reduce(
      (acc, category) => {
        acc[category] = 0;
        return acc;
      },
      { OTHER: 0 }
    )
  );
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    let timer;

    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsedTime = Math.floor((now - lastUpdateTime) / 1000);
        const totalElapsed = Math.floor((now - startTime - pausedTime) / 1000);

        const newTime =
          initialTime > 0
            ? Math.max(initialTime - totalElapsed, 0)
            : totalElapsed;

        setTime(newTime);

        setCategoryTimes((prevCategoryTimes) => {
          const newCategoryTimes = { ...prevCategoryTimes };
          newCategoryTimes[currentCategory] += elapsedTime;
          return newCategoryTimes;
        });

        setLastUpdateTime(now);

        if (newTime === 0 && initialTime > 0) {
          clearInterval(timer);
          setIsRunning(false);
          setIsPaused(false);
          setIsDisabled(true);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [
    isRunning,
    isPaused,
    startTime,
    pausedTime,
    initialTime,
    lastUpdateTime,
    currentCategory,
  ]);

  const handleStartPause = () => {
    const now = new Date().getTime();
    setLastUpdateTime(now);

    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      setStartTime(now);
    } else if (isPaused) {
      setIsPaused(false);
      setPausedTime(pausedTime + (now - lastUpdateTime));
    } else {
      setIsPaused(true);
      setPausedTime(pausedTime + (now - lastUpdateTime));
    }
  };

  const handleEnd = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsDisabled(true);
  };

  const handleCategoryClick = (name) => {
    setCurrentCategory(name);
  };

  return (
    <div className={styles.timeRecorder}>
      <Timer time={time} />
      <div className={styles.controls}>
        <Button
          onClick={handleStartPause}
          label={isPaused || !isRunning ? "START" : "PAUSE"}
          disabled={isDisabled}
        />
        <Button onClick={handleEnd} label="END" disabled={isDisabled} />
      </div>
      <div className={styles.categories}>
        {["OTHER", ...categories].map((category) => (
          <Category
            key={category}
            name={category}
            time={categoryTimes[category]}
            isSelected={currentCategory === category}
            onClick={handleCategoryClick}
          />
        ))}
      </div>
    </div>
  );
};

function TimeRecorder({ text }) {
  const lines = text.split("\n");
  const timeOption = lines[0].startsWith("OPTIONS:time=")
    ? parseInt(lines[0].split("=")[1], 10)
    : 0;
  const categories = lines.slice(timeOption ? 1 : 0);

  return (
    <>
      <div className={styles.GameArea}>
        <TimeRecorderComponent
          initialTime={timeOption}
          categories={categories}
        />
      </div>
    </>
  );
}

export default TimeRecorder;
