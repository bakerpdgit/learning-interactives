import React, { useState, useEffect, useRef } from "react";
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
  const [exportEnabled, setExportEnabled] = useState(false);
  const newCategoryRef = useRef(null);
  const [currentCategory, setCurrentCategory] = useState("OTHER");
  const [categoryList, setCategoryList] = useState(categories);

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
    setExportEnabled(true);
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Category,Time (seconds)",
        ...Object.entries(categoryTimes).map(
          ([name, time]) => `${name},${time}`
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "category_times.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleCategoryClick = (name) => {
    setCurrentCategory(name);
  };

  const handleAddCategory = () => {
    const newCategory = newCategoryRef.current.value;
    if (newCategory && !categoryTimes.hasOwnProperty(newCategory)) {
      setCategoryTimes((prev) => ({ ...prev, [newCategory]: 0 }));
      setCategoryList((prev) => [...prev, newCategory]);
    }
    newCategoryRef.current.value = "";
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
        {["OTHER", ...categoryList].map((category) => (
          <Category
            key={category}
            name={category}
            time={categoryTimes[category]}
            isSelected={currentCategory === category}
            onClick={handleCategoryClick}
          />
        ))}
      </div>

      <div className={styles.addCategory}>
        <input type="text" ref={newCategoryRef} placeholder="New category" />
        <Button onClick={handleAddCategory} label="Add Category" />
      </div>
      <div className={styles.export}>
        <Button
          onClick={handleExport}
          label="Export"
          disabled={!exportEnabled}
        />
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
