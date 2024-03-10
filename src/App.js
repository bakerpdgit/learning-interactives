import React from "react";
import { BrowserRouter as Router, useLocation, Link } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Typography,
} from "@mui/material";

import Interactive from "./components/Interactive";
import TileGrid from "./components/TileGrid";

const theme = createTheme();

function AppContent() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  return (
    <div style={{ padding: "20px" }}>
      {id ? (
        <>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 1000,
            }}
          >
            <Typography
              variant="h6"
              color="textPrimary"
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              🏠 L.I.
            </Typography>
          </Link>
          <Interactive id={id} />
        </>
      ) : (
        <>
          <Typography variant="h3" gutterBottom align="center">
            Class Interactives
          </Typography>

          <TileGrid />

          <Typography variant="p" gutterTop align="center">
            Teacher instructions: explore our different interactives! For each
            one provide some activity text in the form of the example given.
            Once your interactive has rendered with your content, you can share
            it with pupils simply by sharing the URL which embeds the content.
            The URL can sometimes be quite long and you can hit a maximum length
            but this varies with web-browser used.
          </Typography>
        </>
      )}
    </div>
  );
}

// basename was: /learning-interactives
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="">
        <DndProvider backend={HTML5Backend}>
          <AppContent />
        </DndProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
