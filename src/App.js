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
              🏠 C.I.
            </Typography>
          </Link>
          <Interactive id={id} />
        </>
      ) : (
        <>
          <Typography variant="h3" gutterBottom align="center">
            Class Interactives
          </Typography>

          <Typography variant="p" gutterTop align="center">
            Teacher instructions: explore our different interactives below! For
            each one provide some activity text in the form of the example
            given. Once your interactive has rendered, you can share it with
            pupils either by using the share button to generate a URL if the
            interactive content is not too long or by downloading and sharing
            the interactive file otherwise for use with the Uploader. In either
            case, make sure to download your interactive for future editing.
            Remember these tools are for fun learning activities; they are not
            secure and should not be used for tests.
          </Typography>

          <TileGrid />
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
