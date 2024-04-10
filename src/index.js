import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { EditProvider } from "./EditContext";

const root = document.getElementById("root");
const appRoot = createRoot(root);

appRoot.render(
  <React.StrictMode>
    <EditProvider>
      <App />
    </EditProvider>
  </React.StrictMode>
);
