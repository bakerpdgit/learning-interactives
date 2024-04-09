import React, { createContext, useState, useContext } from "react";

const EditContext = createContext();

export const useEditContext = () => useContext(EditContext);

export const EditProvider = ({ children }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [imageData, setImageData] = useState(null);

  const enableEdit = () => setIsEditable(true);
  const disableEdit = () => setIsEditable(false);

  return (
    <EditContext.Provider
      value={{ isEditable, enableEdit, disableEdit, imageData, setImageData }}
    >
      {children}
    </EditContext.Provider>
  );
};
