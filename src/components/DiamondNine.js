import React, { useState, useEffect } from "react";
import styles from "./DiamondNine.module.css";

const DiamondNine = ({ text }) => {
  const [title, setTitle] = useState("");
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [editingEnabled, setEditingEnabled] = useState(false);

  useEffect(() => {
    const [optionsLine, titleLine, ...contentLines] = text
      .split("\n")
      .filter(Boolean);
    const options = {};

    if (optionsLine.startsWith("OPTIONS:")) {
      optionsLine
        .replace("OPTIONS:", "")
        .split(",")
        .forEach((option) => {
          const [key, value] = option.split("=");
          options[key] = value;
        });
    }

    const initialTiles = contentLines.map((line, index) => ({
      id: index,
      content: line,
      row: -1,
      column: -1,
      isPlaceholder: false,
    }));

    const placeholderTiles = [
      {
        id: initialTiles.length,
        content: "",
        row: 0,
        column: 0,
        isPlaceholder: true,
      },
      {
        id: initialTiles.length + 1,
        content: "",
        row: 1,
        column: 0,
        isPlaceholder: true,
      },
      {
        id: initialTiles.length + 2,
        content: "",
        row: 1,
        column: 1,
        isPlaceholder: true,
      },
      {
        id: initialTiles.length + 3,
        content: "",
        row: 2,
        column: 0,
        isPlaceholder: true,
      },
      {
        id: initialTiles.length + 4,
        content: "",
        row: 2,
        column: 1,
        isPlaceholder: true,
      },
      {
        id: initialTiles.length + 5,
        content: "",
        row: 2,
        column: 2,
        isPlaceholder: true,
      },
      {
        id: initialTiles.length + 6,
        content: "",
        row: 3,
        column: 0,
        isPlaceholder: true,
      },
      {
        id: initialTiles.length + 7,
        content: "",
        row: 3,
        column: 1,
        isPlaceholder: true,
      },
      {
        id: initialTiles.length + 8,
        content: "",
        row: 4,
        column: 0,
        isPlaceholder: true,
      },
    ];

    setTitle(titleLine);
    setTiles([...initialTiles, ...placeholderTiles]);
    setEditingEnabled(options.editing.toLowerCase() === "yes");
  }, [text]);

  const handleSelectTile = (id) => {
    setSelectedTile(selectedTile === id ? null : id);
  };

  const handleTileClick = (id) => {
    if (selectedTile === null) {
      handleSelectTile(id);
      return;
    }

    setTiles((prevTiles) => {
      // Clone the previous tiles array for immutability
      const newTiles = prevTiles.map((tile) => ({ ...tile }));

      // Find the indexes
      const selectedIndex = newTiles.findIndex(
        (tile) => tile.id === selectedTile
      );
      const targetIndex = newTiles.findIndex((tile) => tile.id === id);

      // Ensure both tiles were found
      if (selectedIndex === -1 || targetIndex === -1) return prevTiles; // Return original state if something went wrong

      const selectedTileObj = newTiles[selectedIndex];
      const targetTileObj = newTiles[targetIndex];

      const tempRow = selectedTileObj.row;
      const tempColumn = selectedTileObj.column;
      selectedTileObj.row = targetTileObj.row;
      selectedTileObj.column = targetTileObj.column;
      targetTileObj.row = tempRow;
      targetTileObj.column = tempColumn;

      return newTiles;
    });

    setSelectedTile(null); // Deselect the tile after placing it
  };

  const renderTile = (tile) => {
    if (!tile) {
      return null;
    }

    const isInSidebar = tile.row === -1 && tile.column === -1;

    const handleEditClick = (e) => {
      e.stopPropagation();
      const newContent = prompt("Enter new text:", tile.content);
      if (newContent !== null) {
        setTiles((prevTiles) =>
          prevTiles.map((t) =>
            t.id === tile.id ? { ...t, content: newContent } : t
          )
        );
      }
    };

    return (
      <div
        key={tile.id}
        className={`${isInSidebar ? styles.tile : styles.diamondTile} ${
          selectedTile === tile.id ? styles.selected : ""
        }`}
        onClick={() => handleTileClick(tile.id)}
      >
        {tile.content}
        {editingEnabled && (
          <span className={styles.editIcon} onClick={handleEditClick}>
            &#9998;
          </span>
        )}
      </div>
    );
  };

  const renderDiamondRows = () => {
    const rows = [1, 2, 3, 2, 1];
    return rows.map((rowCount, rowIndex) => (
      <div key={rowIndex} className={styles.diamondRow}>
        {Array.from({ length: rowCount }).map((_, columnIndex) => {
          const tile = tiles.find(
            (tile) => tile.row === rowIndex && tile.column === columnIndex
          );
          return renderTile(tile);
        })}
      </div>
    ));
  };

  return (
    <>
      <h1 className={styles.interactiveSubTitle}>{title}</h1>
      <div className={styles.GameArea}>
        <div className={styles.diamondFormation}>{renderDiamondRows()}</div>
        <div className={styles.sideCollection}>
          {tiles
            .filter((tile) => tile.row === -1 && tile.column === -1)
            .map(renderTile)}
        </div>
      </div>
    </>
  );
};

export default DiamondNine;
