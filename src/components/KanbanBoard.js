import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import MathComponent from "./MathComponent";
import InputModal from "./InputModal";
import ColorPickerModal from "./ColorPickerModal";
import styles from "./KanbanBoard.module.css";

function KanbanBoard({ text }) {
  // Parse the text prop to extract options and initial columns
  const { options, initialColumns } = useMemo(() => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    let options = {};
    let initialColumns = [];

    if (lines[0].startsWith("OPTIONS:")) {
      const optionsLine = lines.shift().substring(8); // Remove 'OPTIONS:'
      optionsLine.split(",").forEach((option) => {
        const [key, value] = option.split("=");
        options[key.trim()] = value.trim();
      });
    }

    initialColumns = lines.map((line, index) => ({
      id: `column-${index}`,
      name: line.trim(),
      color: "#FFFDD0", // Light cream color
      items: [],
    }));

    return { options, initialColumns };
  }, [text]);

  const [columns, setColumns] = useState(initialColumns);

  // State for InputModal
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [inputModalProps, setInputModalProps] = useState({});

  // State for ColorPickerModal
  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [colorPickerModalProps, setColorPickerModalProps] = useState({});

  const [columnMenuOpen, setColumnMenuOpen] = useState(null);

  // Handle adding new items
  const handleAddItem = (columnId) => {
    setInputModalProps({
      title: "Please enter text for the new item:",
      placeholder: "Type here...",
      value: "",
      onSubmit: (userInput) => {
        if (userInput) {
          const newItem = {
            id: `item-${Date.now()}`,
            content: userInput,
          };

          setColumns((prevColumns) =>
            prevColumns.map((column) => {
              if (column.id === columnId) {
                return {
                  ...column,
                  items: [...column.items, newItem],
                };
              }
              return column;
            })
          );
        }
        setInputModalOpen(false);
      },
      multiLine: true,
    });
    setInputModalOpen(true);
  };

  // Handle renaming a column
  const handleRenameColumn = (columnId, currentName) => {
    setInputModalProps({
      title: "Rename Column:",
      placeholder: "Enter new column name",
      value: currentName,
      onSubmit: (newName) => {
        if (newName) {
          setColumns((prevColumns) =>
            prevColumns.map((column) => {
              if (column.id === columnId) {
                return {
                  ...column,
                  name: newName,
                };
              }
              return column;
            })
          );
        }
        setInputModalOpen(false);
      },
      multiLine: false,
    });
    setInputModalOpen(true);
    setColumnMenuOpen(null);
  };

  // Handle adding a new column
  const handleAddColumn = () => {
    setInputModalProps({
      title: "Add New Column:",
      placeholder: "Enter column name",
      value: "",
      onSubmit: (newName) => {
        if (newName) {
          const newColumn = {
            id: `column-${Date.now()}`,
            name: newName,
            color: "#FFFDD0",
            items: [],
          };
          setColumns((prevColumns) => [...prevColumns, newColumn]);
        }
        setInputModalOpen(false);
      },
      multiLine: false,
    });
    setInputModalOpen(true);
  };

  // Handle recolouring a column
  const handleRecolourColumn = (columnId, currentColor) => {
    setColorPickerModalProps({
      title: "Select Column Colour:",
      initialColor: currentColor,
      onSubmit: (newColor) => {
        setColumns((prevColumns) =>
          prevColumns.map((column) => {
            if (column.id === columnId) {
              return {
                ...column,
                color: newColor,
              };
            }
            return column;
          })
        );
        setColorPickerModalOpen(false);
      },
    });
    setColorPickerModalOpen(true);
    setColumnMenuOpen(null);
  };

  // Handle deleting a column
  const handleDeleteColumn = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.filter((column) => column.id !== columnId)
    );
    setColumnMenuOpen(null);
  };

  // Handle deleting an item
  const handleDeleteItem = (columnId, itemId) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            items: column.items.filter((item) => item.id !== itemId),
          };
        }
        return column;
      })
    );
  };

  const handleToggleColumnMenu = (columnId) => {
    setColumnMenuOpen((prev) => (prev === columnId ? null : columnId));
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If dropped outside the list, do nothing
    if (!destination) {
      return;
    }

    // If dropped in the same place, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Move the item from source to destination
    setColumns((prevColumns) => {
      const sourceColumnIndex = prevColumns.findIndex(
        (column) => column.id === source.droppableId
      );
      const destColumnIndex = prevColumns.findIndex(
        (column) => column.id === destination.droppableId
      );

      const sourceColumn = prevColumns[sourceColumnIndex];
      const destColumn = prevColumns[destColumnIndex];

      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);

      const [removedItem] = sourceItems.splice(source.index, 1);

      if (sourceColumn.id === destColumn.id) {
        // Reordering within the same column
        sourceItems.splice(destination.index, 0, removedItem);

        const newColumns = [...prevColumns];
        newColumns[sourceColumnIndex] = {
          ...sourceColumn,
          items: sourceItems,
        };

        return newColumns;
      } else {
        // Moving item to a different column
        destItems.splice(destination.index, 0, removedItem);

        const newColumns = [...prevColumns];

        newColumns[sourceColumnIndex] = {
          ...sourceColumn,
          items: sourceItems,
        };

        newColumns[destColumnIndex] = {
          ...destColumn,
          items: destItems,
        };

        return newColumns;
      }
    });
  };

  return (
    <>
      {inputModalOpen && (
        <InputModal
          title={inputModalProps.title}
          placeholder={inputModalProps.placeholder}
          value={inputModalProps.value}
          onSubmit={inputModalProps.onSubmit}
          onClose={() => setInputModalOpen(false)}
          multiLine={inputModalProps.multiLine}
        />
      )}
      {colorPickerModalOpen && (
        <ColorPickerModal
          title={colorPickerModalProps.title}
          initialColor={colorPickerModalProps.initialColor}
          onSubmit={colorPickerModalProps.onSubmit}
          onClose={() => setColorPickerModalOpen(false)}
        />
      )}
      {options.add === "yes" && (
        <div className={styles.addColumnBar}>
          <button className={styles.addColumn} onClick={handleAddColumn}>
            Add Column
          </button>
        </div>
      )}
      <div className={styles.kanbanBoard}>
        <div className={styles.kanbanColumns}>
          <DragDropContext onDragEnd={onDragEnd}>
            {columns.map((column) => (
              <div
                key={column.id}
                className={styles.kanbanColumn}
                style={{ backgroundColor: column.color }}
              >
                <div className={styles.kanbanColumnHeader}>
                  <span className={styles.kanbanColumnTitle}>
                    {column.name}
                  </span>
                  <div>
                    <button
                      onClick={() => handleAddItem(column.id)}
                      className={styles.addItemBtn}
                    >
                      Add
                    </button>
                  </div>
                  {/* Dropdown menu */}
                  <div className={styles.columnMenu}>
                    <button
                      className={styles.columnMenuButton}
                      onClick={() => handleToggleColumnMenu(column.id)}
                    >
                      &#x22EE;
                    </button>
                    {columnMenuOpen === column.id && (
                      <div className={styles.columnDropdown}>
                        {options.add === "yes" && (
                          <>
                            <div
                              className={styles.columnDropdownItem}
                              onClick={() =>
                                handleRenameColumn(column.id, column.name)
                              }
                            >
                              Rename
                            </div>
                            <div
                              className={styles.columnDropdownItem}
                              onClick={() => handleDeleteColumn(column.id)}
                            >
                              Delete
                            </div>
                          </>
                        )}
                        <div
                          className={styles.columnDropdownItem}
                          onClick={() =>
                            handleRecolourColumn(column.id, column.color)
                          }
                        >
                          Recolour
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      className={styles.kanbanColumnContent}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {column.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className={styles.kanbanItem}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div
                                className={styles.deleteItem}
                                onClick={() =>
                                  handleDeleteItem(column.id, item.id)
                                }
                              >
                                &#x2716;
                              </div>
                              <MathComponent
                                text={item.content}
                                renderNewLines={true}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </DragDropContext>
        </div>
      </div>
    </>
  );
}

export default KanbanBoard;
