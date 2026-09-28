import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, random } from "remotion";

export type Theme = { background: string; accent: string; text: string };
export type Scene = {
  template: "title" | "bullet-reveal" | "big-number" | "quote";
  text: string; items?: string[]; number?: string; label?: string; author?: string;
  from: number; duration: number;
};
export type Word = { word: string; start: number; end: number };
export type ShortProps = { title: string; theme: Theme; scenes: Scene[]; words: Word[]; totalFrames: number; hasMusic: boolean };

const font = '"Helvetica Neue", Arial, sans-serif';

const useSpring = (delay = 0, config = { damping: 14, stiffness: 110 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config });
};

const alpha = (hex: string, a: string) => (/^#[0-9a-fA-F]{6}$/.test(hex) ? hex + a : hex);

const Background: React.FC<{ theme: Theme }> = ({ theme }) => {
  const f = useCurrentFrame();
  const x = 50 + 26 * Math.sin(f / 70);
  const y = 34 + 16 * Math.cos(f / 90);
  const x2 = 50 + 30 * Math.cos(f / 110);
  const y2 = 60 + 20 * Math.sin(f / 130);
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, ${alpha(theme.accent, "55")}, transparent 55%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${100 - x}% ${100 - y}%, ${alpha(theme.accent, "33")}, transparent 50%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x2}% ${y2}%, ${alpha(theme.text, "12")}, transparent 45%)` }} />
      <Particles theme={theme} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, transparent 45%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

const Particles: React.FC<{ theme: Theme }> = ({ theme }) => {
  const f = useCurrentFrame();
  const dots = new Array(26).fill(0).map((_, i) => {
    const seedX = random("x" + i);
    const seedY = random("y" + i);
    const seedS = random("s" + i);
    const speed = 0.2 + seedS * 0.6;
    const size = 6 + seedS * 26;
    const baseX = seedX * 100;
    const y = (seedY * 120 - (f * speed) / 6) % 120;
    const yy = y < 0 ? y + 120 : y;
    const drift = 4 * Math.sin((f + i * 30) / 40);
    const op = 0.10 + seedS * 0.25;
    return (
      <div key={i} style={{ position: "absolute", left: `${baseX + drift}%`, top: `${yy}%`, width: size, height: size, borderRadius: size, background: i % 3 === 0 ? theme.accent : theme.text, opacity: op, filter: "blur(1px)" }} />
    );
  });
  return <AbsoluteFill>{dots}</AbsoluteFill>;
};

const Camera: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, duration], [1.06, 1.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dx = 18 * Math.sin(f / 60);
  const dy = 12 * Math.cos(f / 75);
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${push})` }}>{children}</AbsoluteFill>
  );
};

const Fade: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, duration - 10, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 12], [40, 0], { extrapolateRight: "clamp" });
  const yOut = interpolate(f, [duration - 10, duration], [0, -40], { extrapolateLeft: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${y + yOut}px)` }}>{children}</AbsoluteFill>;
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 90px", fontFamily: font }}>
    {children}
  </AbsoluteFill>
);

const WordIn: React.FC<{ w: string; i: number; t: Theme }> = ({ w, i, t }) => {
  const p = useSpring(i * 4, { damping: 12, stiffness: 120 });
  return (
    <span style={{ fontSize: 122, fontWeight: 900, color: i % 3 === 2 ? t.accent : t.text, lineHeight: 1.12, transform: `translateY(${(1 - p) * 70}px) scale(${0.9 + 0.1 * p})`, opacity: p, textAlign: "center", textShadow: `0 0 40px ${alpha(t.accent, "55")}` }}>{w}</span>
  );
};

const Title: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const line = useSpring(4);
  return (
    <Center>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 28px" }}>
        {s.text.split(" ").map((w, i) => <WordIn key={i} w={w} i={i} t={t} />)}
      </div>
      <div style={{ marginTop: 44, height: 10, width: `${line * 260}px`, maxWidth: "70%", borderRadius: 8, background: t.accent, opacity: line, boxShadow: `0 0 30px ${t.accent}` }} />
    </Center>
  );
};

const Bullet: React.FC<{ text: string; delay: number; t: Theme }> = ({ text, delay, t }) => {
  const p = useSpring(delay, { damping: 13, stiffness: 130 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, margin: "20px 0", opacity: p, transform: `translateX(${(1 - p) * 140}px)` }}>
      <div style={{ width: 34, height: 34, borderRadius: 17, background: t.accent, boxShadow: `0 0 24px ${t.accent}`, transform: `scale(${p})` }} />
      <div style={{ fontSize: 78, fontWeight: 700, color: t.text }}>{text}</div>
    </div>
  );
};

const Bullets: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const head = useSpring(0);
  const items = s.items || [];
  const gap = Math.max(12, (s.duration * 0.55) / Math.max(1, items.length));
  return (
    <Center>
      <div style={{ fontSize: 98, fontWeight: 900, color: t.text, textAlign: "center", marginBottom: 74, opacity: head, transform: `scale(${0.82 + 0.18 * head})`, textShadow: `0 0 40px ${alpha(t.accent, "55")}` }}>{s.text}</div>
      {items.map((it, i) => <Bullet key={i} text={it} delay={12 + i * gap} t={t} />)}
    </Center>
  );
};

const BigNumber: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const p = useSpring(0, { damping: 10, stiffness: 90 });
  const l = useSpring(16);
  const f = useCurrentFrame();
  const pulse = 1 + 0.02 * Math.sin(f / 8);
  return (
    <Center>
      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "absolute", width: 560, height: 560, borderRadius: 560, border: `6px solid ${alpha(t.accent, "44")}`, transform: `scale(${0.6 + 0.4 * p})`, opacity: p }} />
        <div style={{ fontSize: 320, fontWeight: 900, color: t.accent, transform: `scale(${(0.4 + 0.6 * p) * pulse})`, opacity: p, textShadow: `0 0 60px ${t.accent}` }}>{s.number}</div>
      </div>
      <div style={{ fontSize: 82, fontWeight: 700, color: t.text, textAlign: "center", opacity: l, transform: `translateY(${(1 - l) * 46}px)`, marginTop: 20 }}>{s.label || s.text}</div>
    </Center>
  );
};

const Quote: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const p = useSpring(0);
  const a = useSpring(22);
  return (
    <Center>
      <div style={{ fontSize: 280, color: t.accent, lineHeight: 0.5, opacity: p, transform: `scale(${0.7 + 0.3 * p})`, textShadow: `0 0 50px ${alpha(t.accent, "66")}` }}>“</div>
      <div style={{ fontSize: 90, fontWeight: 800, color: t.text, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 56}px)`, fontStyle: "italic" }}>{s.text}</div>
      {s.author ? <div style={{ fontSize: 58, color: t.accent, marginTop: 54, opacity: a, letterSpacing: 2 }}>— {s.author}</div> : null}
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

export const Short: React.FC<ShortProps> = ({ theme, scenes, hasMusic }) => (
  <AbsoluteFill>
    <Background theme={theme} />
    {scenes.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.duration}>
        <Fade duration={s.duration}>
          <Camera duration={s.duration}>
            <SceneView s={s} t={theme} />
          </Camera>
        </Fade>
      </Sequence>
    ))}
    <Audio src={staticFile("voiceover.wav")} />
    {hasMusic && <Audio src={staticFile("music.mp3")} volume={0.07} loop />}
  </AbsoluteFill>
);
