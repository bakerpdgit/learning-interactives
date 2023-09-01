import React from "react";
import { BrowserRouter as Router, useLocation, Link } from "react-router-dom";
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
            Learning Interactives
          </Typography>
          <TileGrid />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/learning-interactives">
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
