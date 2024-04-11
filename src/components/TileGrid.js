import { React, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Paper, Typography } from "@mui/material";
import { useEditContext } from "../EditContext";

function TileGrid() {
  const { setTextData } = useEditContext();

  useEffect(() => {
    // wipe each time back to the tile grid
    setTextData(null);
  }, [setTextData]);

  const interactives = [
    { id: 1, name: "Phrase Memorise", icon: "🧠" },
    { id: 2, name: "Image Reveal", icon: "🖼️" },
    { id: 3, name: "Match Drag & Drop", icon: "✊" },
    { id: 4, name: "Word Complete", icon: "★" },
    { id: 5, name: "Quiz Board", icon: "📝" },
    { id: 6, name: "Ordered Line", icon: "↔" },
    { id: 7, name: "Horse Race", icon: "🏇" },
    { id: 8, name: "Left or Right", icon: "🅰️🅱️" },
    { id: 9, name: "Categorise", icon: "🔗" },
    { id: 10, name: "Multi-choice Quiz", icon: "🔠" },
    { id: 11, name: "Timers", icon: "⏱" },
    { id: 12, name: "Random Wheel", icon: "⚙" },
    { id: 13, name: "Building Blocks", icon: "🧱" },
    { id: 14, name: "Score Chart", icon: "⭐" },
    { id: 15, name: "Tarsia Squares", icon: "◻️" },
    { id: 16, name: "Grid Solve", icon: "▦" },
    { id: 17, name: "Anagram", icon: "🔀" },
    { id: 18, name: "Word Banks", icon: "📚" },
    { id: 19, name: "Image Pins", icon: "📍" },
    { id: 20, name: "Deck of Cards", icon: "🂠" },
    { id: 21, name: "Word Find", icon: "❓" },
    { id: 22, name: "Connect", icon: "⛓" },
    // { id: 23, name: "Car Game", icon: "🚗" },
    { id: 23, name: "WordSearch", icon: "🔍" },
    { id: 24, name: "Diamond Nine", icon: "💠" },
    { id: 25, name: "Prize Pot", icon: "💰" },
    { id: 26, name: "Geometry", icon: "🛑" },
    { id: 27, name: "Order", icon: "↕️" },
    { id: 28, name: "Self-Review", icon: "🌱" },
    { id: 999, name: "Load", icon: "⬆️" },
  ];

  return (
    <Grid container spacing={0}>
      {interactives.map((interactive) => (
        <Grid item xs={12} md={2} key={interactive.id}>
          <Link
            to={`./?id=${interactive.id}`}
            style={{ textDecoration: "none" }}
          >
            <Paper
              elevation={3}
              style={{
                padding: "20px",
                margin: "10px",
                height: "85%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h4">{interactive.icon}</Typography>
              <Typography variant="h6">{interactive.name}</Typography>
            </Paper>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}

export default TileGrid;
