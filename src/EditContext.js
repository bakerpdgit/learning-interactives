import React, { createContext, useState, useContext } from "react";

const EditContext = createContext();

export const useEditContext = () => useContext(EditContext);

export const EditProvider = ({ children }) => {
  const [isEditable, setIsEditable] = useState(false);

  const enableEdit = () => setIsEditable(true);
  const disableEdit = () => setIsEditable(false);

  return (
    <EditContext.Provider value={{ isEditable, enableEdit, disableEdit }}>
      {children}
    </EditContext.Provider>
  );
};
