import React from "react";
import { Composition, registerRoot } from "remotion";
import { Short } from "./Short";
import type { ShortProps } from "./types";

const defaultProps: ShortProps = {
  title: "Preview",
  theme: { background: "#0c1220", accent: "#52d8ff", text: "#ffffff", accent2: "#ff7aa8" },
  scenes: [],
  words: [],
  totalFrames: 30,
  hasMusic: false,
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    fps={30}
    width={1080}
    height={1920}
    durationInFrames={30}
    defaultProps={defaultProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.max(30, Number((props as ShortProps).totalFrames || 30)) })}
  />
);

registerRoot(RemotionRoot);
