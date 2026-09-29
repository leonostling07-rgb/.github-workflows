export type Theme = {
  background: string;
  accent: string;
  text: string;
  accent2?: string;
};

export type CharacterAction =
  | "idle" | "walk" | "run" | "jump" | "sleep" | "think" | "laugh"
  | "cry" | "point" | "hold" | "read" | "write" | "talk" | "look"
  | "react" | "celebrate" | "search" | "open" | "throw" | "catch"
  | "build" | "discover" | "panic" | "fall";

export type ObjectType =
  | "phone" | "laptop" | "book" | "brain" | "coffee" | "clock" | "calendar"
  | "mail" | "notification" | "heart" | "money" | "chart" | "check" | "warning"
  | "lightbulb" | "rocket" | "car" | "bike" | "house" | "desk" | "bed"
  | "dumbbell" | "trophy" | "gift" | "cloud" | "sun" | "moon" | "star"
  | "door" | "plant" | "chair" | "bag" | "headphones" | "cup" | "key"
  | "ball" | "box" | "tree" | "food" | "magnifier" | "paper" | "map"
  | "alarm" | "pencil" | "medal";

export type EnvironmentKind =
  | "home" | "office" | "kitchen" | "street" | "school" | "gym"
  | "nature" | "city" | "bedroom" | "lab" | "space" | "workshop" | "abstract";

export type CameraMove =
  | "static" | "push" | "pull" | "panLeft" | "panRight" | "tilt" | "follow" | "whip";

export type CharacterSpec = {
  id: string;
  role: string;
  color: string;
  x: number;
  y: number;
  scale: number;
};

export type ObjectSpec = {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  layer?: "back" | "mid" | "front";
};

export type VisualBeat = {
  id: string;
  start: number;
  end: number;
  event: string;
  actor?: string;
  action?: CharacterAction;
  objects?: string[];
  camera?: CameraMove;
  emphasis?: boolean;
  mood?: "calm" | "curious" | "tense" | "funny" | "surprise" | "triumph";
};

export type Scene = {
  template: "title" | "bullet-reveal" | "big-number" | "quote" | "story";
  text: string;
  narration: string;
  setting: EnvironmentKind;
  characters: CharacterSpec[];
  objects: ObjectSpec[];
  beats: VisualBeat[];
  transition: "cut" | "push" | "whip" | "match" | "reveal";
  from: number;
  duration: number;
};

export type Word = { word: string; start: number; end: number };

export type ShortProps = {
  title: string;
  theme: Theme;
  scenes: Scene[];
  words: Word[];
  totalFrames: number;
  hasMusic: boolean;
};
