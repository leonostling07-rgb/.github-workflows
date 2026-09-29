import type { Theme, Scene } from "../Short";

export type VisualAction =
  | "enter" | "exit" | "walk" | "run" | "jump" | "fall" | "sleep"
  | "think" | "laugh" | "cry" | "point" | "hold" | "read" | "write"
  | "talk" | "look" | "react" | "celebrate" | "search" | "open"
  | "throw" | "catch" | "build" | "discover" | "focus" | "panic";

export type VisualObject =
  | "phone" | "laptop" | "book" | "brain" | "coffee" | "clock" | "calendar"
  | "mail" | "notification" | "heart" | "money" | "chart" | "check" | "warning"
  | "lightbulb" | "rocket" | "car" | "bike" | "house" | "desk" | "bed"
  | "dumbbell" | "trophy" | "gift" | "cloud" | "sun" | "moon" | "star"
  | "door" | "plant" | "chair" | "bag" | "headphones" | "cup" | "key";

export type EnvironmentKind =
  | "home" | "office" | "street" | "school" | "gym" | "nature" | "city" | "bedroom" | "abstract";

export type CameraMove =
  | "static" | "push" | "pull" | "panLeft" | "panRight" | "tilt" | "follow" | "whip";

export type VisualBeat = {
  id: string;
  start: number;
  duration: number;
  character?: { action: VisualAction; actor?: number; x?: number; y?: number };
  object?: { type: VisualObject; action?: VisualAction; x?: number; y?: number };
  camera?: CameraMove;
  emphasis?: boolean;
};

export type VisualPlan = {
  environment: EnvironmentKind;
  beats: VisualBeat[];
  palette: string[];
  seed: number;
};

export type DirectorContext = { scene: Scene; sceneIndex: number; theme: Theme; duration: number };
