import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export type Theme = { background: string; accent: string; text: string };
export type Scene = {
  template: "title" | "bullet-reveal" | "big-number" | "quote";
  text: string; items?: string[]; number?: string; label?: string; author?: string;
  from: number; duration: number;
  media_file?: string | null; media_type?: "image" | "video" | null;
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

const GradientBG: React.FC<{ theme: Theme }> = ({ theme }) => {
  const f = useCurrentFrame();
  const x = 50 + 26 * Math.sin(f / 70);
  const y = 34 + 16 * Math.cos(f / 90);
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, ${alpha(theme.accent, "55")}, transparent 55%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${100 - x}% ${100 - y}%, ${alpha(theme.accent, "33")}, transparent 50%)` }} />
    </AbsoluteFill>
  );
};

const MediaBG: React.FC<{ s: Scene; theme: Theme; duration: number }> = ({ s, theme, duration }) => {
  const f = useCurrentFrame();
  if (!s.media_file) return <GradientBG theme={theme} />;
  const src = staticFile(s.media_file);
  const scale = interpolate(f, [0, duration], [1.08, 1.22], { extrapolateRight: "clamp" });
  const panX = interpolate(f, [0, duration], [-20, 20], { extrapolateRight: "clamp" });
  const panY = interpolate(f, [0, duration], [15, -15], { extrapolateRight: "clamp" });
  const common: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      {s.media_type === "video" ? (
        <OffthreadVideo src={src} muted loop style={common} />
      ) : (
        <AbsoluteFill style={{ transform: `scale(${scale}) translate(${panX}px, ${panY}px)` }}>
          <Img src={src} style={common} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Scrim: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.55) 100%)" }} />
);

// Directional transition: each scene slides in from the right and out to the left,
// combined with a fade, so cuts feel intentional and push the story "forward".
const Transition: React.FC<{ duration: number; index: number; children: React.ReactNode }> = ({ duration, index, children }) => {
  const f = useCurrentFrame();
  const IN = 12;
  const OUT = 12;
  const dir = index % 2 === 0 ? 1 : -1; // alternate slide direction for rhythm
  const o = interpolate(f, [0, IN, duration - OUT, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inX = interpolate(f, [0, IN], [90 * dir, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outX = interpolate(f, [duration - OUT, duration], [0, -70 * dir], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(f, [0, IN], [1.04, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `translateX(${inX + outX}px) scale(${scale})` }}>{children}</AbsoluteFill>;
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 90px", fontFamily: font }}>
    {children}
  </AbsoluteFill>
);

const shadow = "0 4px 24px rgba(0,0,0,0.75), 0 0 60px rgba(0,0,0,0.5)";

const WordIn: React.FC<{ w: string; i: number; t: Theme }> = ({ w, i, t }) => {
  const p = useSpring(i * 4, { damping: 12, stiffness: 120 });
  return (
    <span style={{ fontSize: 118, fontWeight: 900, color: i % 3 === 2 ? t.accent : "#fff", lineHeight: 1.12, transform: `translateY(${(1 - p) * 70}px) scale(${0.9 + 0.1 * p})`, opacity: p, textAlign: "center", textShadow: shadow }}>{w}</span>
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
    <div style={{ display: "flex", alignItems: "center", gap: 28, margin: "18px 0", opacity: p, transform: `translateX(${(1 - p) * 140}px)`, background: "rgba(0,0,0,0.38)", backdropFilter: "blur(6px)", padding: "18px 30px", borderRadius: 20 }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, background: t.accent, boxShadow: `0 0 24px ${t.accent}`, transform: `scale(${p})`, flexShrink: 0 }} />
      <div style={{ fontSize: 72, fontWeight: 700, color: "#fff", textShadow: shadow }}>{text}</div>
    </div>
  );
};

const Bullets: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const head = useSpring(0);
  const items = s.items || [];
  const gap = Math.max(12, (s.duration * 0.5) / Math.max(1, items.length));
  return (
    <Center>
      <div style={{ fontSize: 94, fontWeight: 900, color: "#fff", textAlign: "center", marginBottom: 60, opacity: head, transform: `scale(${0.82 + 0.18 * head})`, textShadow: shadow }}>{s.text}</div>
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
        <div style={{ position: "absolute", width: 560, height: 560, borderRadius: 560, border: `6px solid ${alpha(t.accent, "66")}`, transform: `scale(${0.6 + 0.4 * p})`, opacity: p }} />
        <div style={{ fontSize: 320, fontWeight: 900, color: t.accent, transform: `scale(${(0.4 + 0.6 * p) * pulse})`, opacity: p, textShadow: shadow }}>{s.number}</div>
      </div>
      <div style={{ fontSize: 78, fontWeight: 700, color: "#fff", textAlign: "center", opacity: l, transform: `translateY(${(1 - l) * 46}px)`, marginTop: 20, textShadow: shadow }}>{s.label || s.text}</div>
    </Center>
  );
};

const Quote: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const p = useSpring(0);
  const a = useSpring(22);
  return (
    <Center>
      <div style={{ fontSize: 280, color: t.accent, lineHeight: 0.5, opacity: p, transform: `scale(${0.7 + 0.3 * p})`, textShadow: shadow }}>“</div>
      <div style={{ fontSize: 84, fontWeight: 800, color: "#fff", textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 56}px)`, fontStyle: "italic", textShadow: shadow }}>{s.text}</div>
      {s.author ? <div style={{ fontSize: 56, color: t.accent, marginTop: 50, opacity: a, letterSpacing: 2, textShadow: shadow }}>— {s.author}</div> : null}
    </Center>
  );
};

const Overlay: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  switch (s.template) {
    case "bullet-reveal": return <Bullets s={s} t={t} />;
    case "big-number": return <BigNumber s={s} t={t} />;
    case "quote": return <Quote s={s} t={t} />;
    default: return <Title s={s} t={t} />;
  }
};

// Compact, professional Like + Subscribe popup for the last ~3s. Sits low
// on the screen (does not cover the frame) and animates in with a spring.
const ThumbIcon: React.FC = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" fill="#ffffff" style={{ flexShrink: 0 }}>
    <path d="M2 21h2V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 6.59 7.59C6.22 7.95 6 8.45 6 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
  </svg>
);

const BellIcon: React.FC = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="#ffffff" style={{ flexShrink: 0 }}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const EndCard: React.FC<{ t: Theme; total: number }> = ({ t, total }) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const showFor = Math.round(fps * 3);
  const start = Math.max(0, total - showFor);
  if (f < start) return null;
  const local = f - start;
  const p = spring({ frame: local, fps, config: { damping: 15, stiffness: 120 } });
  const out = interpolate(f, [total - 8, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const like = spring({ frame: local - 6, fps, config: { damping: 10, stiffness: 160 } });
  const sub = spring({ frame: local - 16, fps, config: { damping: 10, stiffness: 160 } });
  const pulse = 1 + 0.03 * Math.sin(local / 5);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 210, fontFamily: font, opacity: out, pointerEvents: "none" }}>
      <div style={{ display: "flex", gap: 26, alignItems: "center", transform: `translateY(${(1 - p) * 90}px)`, opacity: p }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(20,20,26,0.72)", backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,0.16)", padding: "20px 34px", borderRadius: 999, boxShadow: "0 10px 40px rgba(0,0,0,0.5)", transform: `scale(${(0.7 + 0.3 * like) * pulse})` }}>
          <ThumbIcon />
          <span style={{ fontSize: 46, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>Like</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#ff0033", padding: "20px 38px", borderRadius: 999, boxShadow: `0 10px 44px rgba(255,0,51,0.45)`, transform: `scale(${(0.7 + 0.3 * sub) * pulse})` }}>
          <BellIcon />
          <span style={{ fontSize: 46, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>Subscribe</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Short: React.FC<ShortProps> = ({ theme, scenes, hasMusic }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      {scenes.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.duration}>
          <Transition duration={s.duration} index={i}>
            <MediaBG s={s} theme={theme} duration={s.duration} />
            <Scrim />
            <Overlay s={s} t={theme} />
          </Transition>
        </Sequence>
      ))}
      <EndCard t={theme} total={durationInFrames} />
      <Audio src={staticFile("voiceover.wav")} />
      {hasMusic && <Audio src={staticFile("music.mp3")} volume={0.07} loop />}
    </AbsoluteFill>
  );
};
