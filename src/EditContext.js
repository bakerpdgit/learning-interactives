import React, { createContext, useState, useContext, useEffect } from "react";

const EditContext = createContext();

export const useEditContext = () => useContext(EditContext);

export const EditProvider = ({ children }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [textData, setTextData] = useState(null);
  const [imageData, setImageData] = useState(null);

  const enableEdit = () => setIsEditable(true);
  const disableEdit = () => setIsEditable(false);

  useEffect(() => {
    // if textData is updated, store it in sessionStorage as backup
    if (textData) {
      sessionStorage.setItem("textData", textData);
    }
  }, [textData]);

  useEffect(() => {
    // if imageData is updated, store it in sessionStorage as backup
    if (imageData) {
      sessionStorage.setItem("imageData", imageData);
    }
  }, [imageData]);

  return (
    <EditContext.Provider
      value={{
        isEditable,
        enableEdit,
        disableEdit,
        textData,
        setTextData,
        imageData,
        setImageData,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};
