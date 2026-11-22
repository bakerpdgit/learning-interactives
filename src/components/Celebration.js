
import React, { useEffect, useState } from "react";
import styles from "./Celebration.module.css";

const variants = ["glitter", "confetti", "fireworks"];
const colours = ["#008b73", "#e5972d", "#d3596a", "#557cb0", "#7958ab"];
const duration = 2400;

function particleStyle(index, variant) {
  const burst = Math.floor(index / 12);
  const angle = (index % 12) * Math.PI / 6;
  const distance = 38 + (index * 13) % 54;
  return {
    "--x": (variant === "fireworks" ? 26 + burst * 24 : (index * 13 + 7) % 98) + "%",
    "--y": (24 + (burst % 2) * 18) + "%",
    "--dx": Math.cos(angle) * distance + "px",
    "--dy": Math.sin(angle) * distance + "px",
    "--delay": (variant === "fireworks" ? burst * 240 : (index * 47) % 750) + "ms",
    "--length": (variant === "fireworks" ? 720 : 850 + (index * 67) % 800) + "ms",
    "--colour": colours[index % colours.length],
  };
}

export default function Celebration({ label = "Well done!" }) {
  const [variant] = useState(() => variants[Math.floor(Math.random() * variants.length)]);
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(false), duration);
    return () => clearTimeout(timer);
  }, []);

  return <>
    <p className={styles.message} role="status">{label}</p>
    {animate && <div className={styles[variant]} aria-hidden="true">
      {Array.from({ length: 36 }, (_, index) => <span key={index} style={particleStyle(index, variant)} />)}
    </div>}
  </>;
}
