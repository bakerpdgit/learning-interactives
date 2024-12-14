import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import InputModal from "./InputModal";
import styles from "./FreyarDiagram.module.css";

function FreyarDiagram({ text }) {
  const title = text;

  const [columns, setColumns] = useState({
    Definition: [],
    Characteristics: [],
    Examples: [],
    "Anti-Examples": [],
  });

  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [inputModalValue, setInputModalValue] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");

  const handleAddItem = (category) => {
    setCurrentCategory(category);
    setInputModalValue("");
    setInputModalVisible(true);
  };

  const handleModalSubmit = (userInput) => {
    const trimmedInput = userInput.trim();
    if (trimmedInput) {
      // Create a single item with multiline content
      const newItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        content: userInput,
      };
      setColumns((prev) => ({
        ...prev,
        [currentCategory]: [...prev[currentCategory], newItem],
      }));
    }
    setInputModalVisible(false);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    // If no position change, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const startColumn = source.droppableId;
    const finishColumn = destination.droppableId;

    // Extract the item from the start column
    const startItems = Array.from(columns[startColumn]);
    const [movedItem] = startItems.splice(source.index, 1);

    // If dropping in the rubbish bin
    if (finishColumn === "RubbishBin") {
      setColumns((prev) => ({
        ...prev,
        [startColumn]: startItems,
      }));
      return;
    }

    if (startColumn === finishColumn) {
      // Reordering within the same column
      startItems.splice(destination.index, 0, movedItem);
      setColumns((prev) => ({
        ...prev,
        [startColumn]: startItems,
      }));
    } else {
      // Moving item to a different column
      const finishItems = Array.from(columns[finishColumn]);
      finishItems.splice(destination.index, 0, movedItem);

      setColumns((prev) => ({
        ...prev,
        [startColumn]: startItems,
        [finishColumn]: finishItems,
      }));
    }
  };

  return (
    <>
      {inputModalVisible && (
        <InputModal
          title={`Add items to ${currentCategory}`}
          value={inputModalValue}
          onChange={(e) => setInputModalValue(e.target.value)}
          onSubmit={handleModalSubmit}
          onClose={() => setInputModalVisible(false)}
          multiLine={true}
        />
      )}

      <h2 className={styles.title}>{title}</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.container}>
          <div className={styles.diagram}>
            <div className={styles.row}>
              {["Definition", "Characteristics"].map((category) => (
                <div className={styles.box} key={category}>
                  <h3>{category.toUpperCase()}</h3>
                  <Droppable droppableId={category}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={styles.itemList}
                      >
                        {columns[category].map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={styles.item}
                              >
                                {item.content}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <button onClick={() => handleAddItem(category)}>Add</button>
                </div>
              ))}
            </div>
            <div className={styles.row}>
              {["Examples", "Anti-Examples"].map((category) => (
                <div className={styles.box} key={category}>
                  <h3>{category.toUpperCase()}</h3>
                  <Droppable droppableId={category}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={styles.itemList}
                      >
                        {columns[category].map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={styles.item}
                              >
                                {item.content}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <button onClick={() => handleAddItem(category)}>Add</button>
                </div>
              ))}
            </div>
          </div>

          {/* Rubbish bin section */}
          <div className={styles.rubbishSection}>
            <Droppable droppableId="RubbishBin">
              {(provided) => (
                <div
                  className={styles.rubbishBin}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <span role="img" aria-label="bin" className={styles.binIcon}>
                    🗑️
                  </span>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </>
  );
}

export default FreyarDiagram;
