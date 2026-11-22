
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, useLocation, Link } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { deepOrange, teal } from "@mui/material/colors";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import ArchiveLink from "./components/ArchiveLink";
import RenderFallback from "./components/RenderFallback";
import TileGrid from "./components/TileGrid";
import "./App.css";
import "./components/Interactive.css";

const Interactive = lazy(() => import("./components/Interactive"));

const theme = createTheme({
  palette: {
    primary: { main: teal[800] },
    secondary: { main: deepOrange[800] },
    background: { default: "#f7f6f0", paper: "#ffffff" },
    text: { primary: "#242e2c", secondary: "#55615c" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    button: { fontWeight: 650, textTransform: "none" },
  },
  components: {
    MuiButton: { styleOverrides: {
      root: { minHeight: 40 },
      contained: { boxShadow: "none" },
    } },
  },
});

function AppContent() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const showActivity = params.has("id") || params.has("txt");
  return <>
    <a className="skipLink" href="#main">Skip to content</a>
    <header className="siteHeader">
      <div className="siteWidth headerContents">
        <Link className="siteBrand" to="/">
          <span className="brandMark" aria-hidden="true">✦</span>
          Class Interactives
        </Link>
        <nav aria-label="Site navigation" className="siteNav">
          <Link className="loadLink" to="/?id=999">
            <UploadFileOutlined fontSize="small" aria-hidden="true" />
            Load saved activity
          </Link>
          <ArchiveLink />
        </nav>
      </div>
    </header>
    <main id="main" className={showActivity ? "siteWidth activityPage" : "siteWidth catalogPage"}>
      {showActivity ? <RenderFallback key={location.search} fallback={<div className="activityMessage" role="alert">
        <p>This activity couldn’t be displayed. Check the activity text or open it on the old site.</p>
        <Link to="/?id=999">Load saved activity</Link>
      </div>}>
        <Suspense fallback={<p role="status">Loading activity…</p>}>
          <Interactive />
        </Suspense>
      </RenderFallback> : <>
        <div className="catalogIntro">
          <h1>Class Interactives</h1>
          <p>Choose an activity, make it your own, and share it with your class.</p>
        </div>
        <TileGrid />
        <footer className="catalogFooter">For classroom practice. Use a secure assessment tool for tests.</footer>
      </>}
    </main>
  </>;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
          <AppContent />
        </DndProvider>
      </Router>
    </ThemeProvider>
  );
}
