import React from "react";
import { Composition } from "remotion";
import { Short, ShortProps } from "./Short";

const demo: ShortProps = {
  title: "Demo",
  theme: { background: "#0b0f1a", accent: "#ff5c8a", text: "#ffffff" },
  totalFrames: 300,
  hasMusic: false,
  words: [],
  scenes: [
    { template: "title", text: "Your brain rewires itself", from: 0, duration: 90 },
    { template: "bullet-reveal", text: "Three habits", items: ["Sleep", "Move", "Learn"], from: 90, duration: 90 },
    { template: "big-number", text: "", number: "87%", label: "of people agree", from: 180, duration: 60 },
    { template: "quote", text: "Small steps beat big plans", author: "Anonymous", from: 240, duration: 60 },
    { template: "story", text: "He built a rocket in his backyard", action: "launch", vehicle: "rocket", destination: "moon", from: 300, duration: 150 },
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
