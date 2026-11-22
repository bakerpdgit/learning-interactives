
import React, { useEffect, useState } from "react";
import styles from "./Celebration.module.css";

const variants = ["glitter", "confetti", "fireworks"];
const colours = ["#007f65", "#f7ae00", "#df4561", "#2678e8", "#8b4ccc", "#f07827", "#05acb5"];
const duration = 3700;
const burstCentres = [[25, 33], [73, 40], [42, 52], [65, 27]];

function particleStyle(index, variant) {
  const burst = Math.floor(index / 12);
  const angle = (index % 12) * Math.PI / 6;
  const distance = 55 + (index * 13) % 80;
  const [x, y] = burstCentres[burst];
  return {
    "--x": (variant === "fireworks" ? x : (index * 17 + 7) % 98) + "%",
    "--y": y + "%",
    "--dx": Math.cos(angle) * distance + "px",
    "--dy": Math.sin(angle) * distance + "px",
    "--delay": (variant === "fireworks" ? burst * 650 : (index * 47) % 920) + "ms",
    "--length": (variant === "fireworks" ? 1470 : 1700 + (index * 67) % 1000) + "ms",
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
    {label != null && <p className={styles.message} role="status">{label}</p>}
    {animate && <div className={styles[variant]} data-celebration={variant} aria-hidden="true">
      {Array.from({ length: 48 }, (_, index) => <span key={index} style={particleStyle(index, variant)} />)}
    </div>}
  </>;
}
