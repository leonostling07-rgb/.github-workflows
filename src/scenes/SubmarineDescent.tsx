import React from "react";
import { Composition } from "remotion";
import { Short, ShortProps } from "./Short";

const demo: ShortProps = {
  title: "Demo",
  theme: { background: "#02030a", accent: "#22d3ee", text: "#ffffff" },
  totalFrames: 300,
  hasMusic: false,
  words: [
    { word: "What", start: 10, end: 30 },
    { word: "if", start: 30, end: 45 },
    { word: "the", start: 45, end: 60 },
    { word: "ocean", start: 60, end: 100 },
    { word: "had", start: 100, end: 130 },
    { word: "no", start: 130, end: 160 },
    { word: "bottom", start: 160, end: 220 },
    { word: "we", start: 240, end: 260 },
    { word: "would", start: 260, end: 285 },
    { word: "know", start: 285, end: 300 },
  ],
  scenes: [
    {
      template: "story",
      scene: "submarine_descent",
      text: "What if the ocean had no bottom",
      from: 0,
      duration: 300,
    },
  ],
};

export const Root: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={450}
    defaultProps={demo}
    calculateMetadata={({ props }) => ({ durationInFrames: props.totalFrames })}
  />
);
