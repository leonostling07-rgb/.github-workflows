import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export type Theme = { background: string; accent: string; text: string };
export type Scene = {
  template: "title" | "bullet-reveal" | "big-number" | "quote";
  text: string; items?: string[]; number?: string; label?: string; author?: string;
  from: number; duration: number;
};
export type Word = { word: string; start: number; end: number };
export type ShortProps = { title: string; theme: Theme; scenes: Scene[]; words: Word[]; totalFrames: number; hasMusic: boolean };

const font = '"Helvetica Neue", Arial, sans-serif';

const useSpring = (delay = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 110 } });
};

const Background: React.FC<{ theme: Theme }> = ({ theme }) => {
  const f = useCurrentFrame();
  const x = 50 + 25 * Math.sin(f / 70);
  const y = 35 + 15 * Math.cos(f / 90);
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, ${theme.accent}55, transparent 55%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${100 - x}% ${100 - y}%, ${theme.accent}33, transparent 50%)` }} />
    </AbsoluteFill>
  );
};

const Fade: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, duration - 8, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 90px", paddingBottom: 380, fontFamily: font }}>
    {children}
  </AbsoluteFill>
);

const WordIn: React.FC<{ w: string; i: number; t: Theme }> = ({ w, i, t }) => {
  const p = useSpring(i * 4);
  return (
    <span style={{ fontSize: 120, fontWeight: 900, color: i % 3 === 2 ? t.accent : t.text, lineHeight: 1.15,
      transform: `translateY(${(1 - p) * 60}px)`, opacity: p, textAlign: "center" }}>{w}</span>
  );
};

const Title: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => (
  <Center>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 28px" }}>
      {s.text.split(" ").map((w, i) => <WordIn key={i} w={w} i={i} t={t} />)}
    </div>
  </Center>
);

const Bullet: React.FC<{ text: string; delay: number; t: Theme }> = ({ text, delay, t }) => {
  const p = useSpring(delay);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, margin: "18px 0", opacity: p, transform: `translateX(${(1 - p) * 120}px)` }}>
      <div style={{ width: 28, height: 28, borderRadius: 14, background: t.accent }} />
      <div style={{ fontSize: 76, fontWeight: 700, color: t.text }}>{text}</div>
    </div>
  );
};

const Bullets: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const head = useSpring(0);
  const items = s.items || [];
  const gap = Math.max(12, (s.duration * 0.6) / Math.max(1, items.length));
  return (
    <Center>
      <div style={{ fontSize: 96, fontWeight: 900, color: t.text, textAlign: "center", marginBottom: 70, opacity: head, transform: `scale(${0.85 + 0.15 * head})` }}>{s.text}</div>
      {items.map((it, i) => <Bullet key={i} text={it} delay={12 + i * gap} t={t} />)}
    </Center>
  );
};

const BigNumber: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const p = useSpring(0);
  const l = useSpring(14);
  return (
    <Center>
      <div style={{ fontSize: 300, fontWeight: 900, color: t.accent, transform: `scale(${0.4 + 0.6 * p})`, opacity: p }}>{s.number}</div>
      <div style={{ fontSize: 80, fontWeight: 700, color: t.text, textAlign: "center", opacity: l, transform: `translateY(${(1 - l) * 40}px)` }}>{s.label || s.text}</div>
    </Center>
  );
};

const Quote: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const p = useSpring(0);
  const a = useSpring(20);
  return (
    <Center>
      <div style={{ fontSize: 260, color: t.accent, lineHeight: 0.6, opacity: p }}>“</div>
      <div style={{ fontSize: 88, fontWeight: 800, color: t.text, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 50}px)` }}>{s.text}</div>
      {s.author ? <div style={{ fontSize: 56, color: t.accent, marginTop: 50, opacity: a }}>— {s.author}</div> : null}
    </Center>
  );
};

const SceneView: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  switch (s.template) {
    case "bullet-reveal": return <Bullets s={s} t={t} />;
    case "big-number": return <BigNumber s={s} t={t} />;
    case "quote": return <Quote s={s} t={t} />;
    default: return <Title s={s} t={t} />;
  }
};

const Captions: React.FC<{ words: Word[]; t: Theme }> = ({ words, t }) => {
  const f = useCurrentFrame();
  if (!words.length) return null;
  let cur = words.findIndex((w) => f >= w.start && f <= w.end + 4);
  if (cur === -1) cur = Math.max(0, words.findIndex((w) => w.start > f) - 1);
  const chunkStart = Math.floor(cur / 4) * 4;
  const chunk = words.slice(chunkStart, chunkStart + 4);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 340, fontFamily: font }}>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", padding: "0 70px" }}>
        {chunk.map((w, i) => (
          <span key={chunkStart + i} style={{
            fontSize: 84, fontWeight: 900, textTransform: "uppercase",
            color: chunkStart + i === cur ? t.accent : "#fff",
            textShadow: "0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)",
            transform: `scale(${chunkStart + i === cur ? 1.12 : 1})`,
          }}>{w.word}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Short: React.FC<ShortProps> = ({ theme, scenes, words, hasMusic }) => (
  <AbsoluteFill>
    <Background theme={theme} />
    {scenes.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.duration}>
        <Fade duration={s.duration}><SceneView s={s} t={theme} /></Fade>
      </Sequence>
    ))}
    <Captions words={words} t={theme} />
    {words.length > 0 && <Audio src={staticFile("voiceover.wav")} />}
    {hasMusic && <Audio src={staticFile("music.mp3")} volume={0.07} loop />}
  </AbsoluteFill>
);
