import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SubmarineDescent } from "./scenes/SubmarineDescent";

export type Theme = { background: string; accent: string; text: string };
export type StoryAction = "launch" | "walk" | "climb" | "think" | "celebrate" | "search";
export type StoryVehicle = "rocket" | "car" | "plane" | "none";
export type StoryDestination = "moon" | "mountain" | "city" | "star" | "flag" | "lightbulb" | "none";
export type Scene = {
  template: "title" | "bullet-reveal" | "big-number" | "quote" | "story";
  text: string; items?: string[]; number?: string; label?: string; author?: string;
  action?: StoryAction; vehicle?: StoryVehicle; destination?: StoryDestination;
  scene?: string;
  from: number; duration: number;
};
export type Word = { word: string; start: number; end: number };
export type ShortProps = { title: string; theme: Theme; scenes: Scene[]; words: Word[]; totalFrames: number; hasMusic: boolean };

const font = '"Inter", "Helvetica Neue", Arial, sans-serif';

const clean = (s: string | undefined | null) =>
  (s || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\uFE0F]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const useSpr = (delay = 0, cfg?: { damping?: number; stiffness?: number; mass?: number }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 16, stiffness: 120, mass: 0.9, ...cfg } });
};

const hexToRgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = h.length === 3
    ? h.split("").map((c) => c + c).join("")
    : h.padEnd(6, "0");
  const r = parseInt(n.slice(0, 2), 16) || 0;
  const g = parseInt(n.slice(2, 4), 16) || 0;
  const b = parseInt(n.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a})`;
};

const Blob: React.FC<{ cx: number; cy: number; r: number; color: string; speed: number; phase: number }> = ({ cx, cy, r, color, speed, phase }) => {
  const f = useCurrentFrame();
  const x = cx + 6 * Math.sin(f / speed + phase);
  const y = cy + 5 * Math.cos(f / (speed * 1.3) + phase);
  const scale = 1 + 0.06 * Math.sin(f / (speed * 0.8) + phase);
  return (
    <div style={{
      position: "absolute", left: `${x}%`, top: `${y}%`, width: r, height: r,
      transform: `translate(-50%,-50%) scale(${scale})`,
      background: color, borderRadius: "50%", filter: "blur(90px)", opacity: 0.55,
    }} />
  );
};

const Background: React.FC<{ theme: Theme; frame: number; totalFrames: number }> = ({ theme, frame }) => {
  const zoom = 1 + interpolate(frame % 240, [0, 240], [0, 0.04]);
  return (
    <AbsoluteFill style={{ background: theme.background, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Blob cx={22} cy={28} r={620} color={hexToRgba(theme.accent, 0.9)} speed={95} phase={0} />
        <Blob cx={80} cy={70} r={700} color={hexToRgba(theme.accent, 0.55)} speed={130} phase={2} />
        <Blob cx={55} cy={45} r={520} color={hexToRgba(theme.text, 0.12)} speed={160} phase={4} />
      </AbsoluteFill>
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "3px 3px", mixBlendMode: "overlay", opacity: 0.5,
      }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

const SceneWrap: React.FC<{ duration: number; variant: number; children: React.ReactNode }> = ({ duration, variant, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const outStart = duration - 16;
  const outP = interpolate(f, [outStart, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacityIn = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const opacity = opacityIn * (1 - outP);
  const v = variant % 4;

  if (v === 1) {
    const inP = spring({ frame: f, fps, config: { damping: 20, stiffness: 140 } });
    const x = (1 - inP) * 340 - outP * 300;
    const rot = (1 - inP) * 4 - outP * 3;
    return <AbsoluteFill style={{ opacity, transform: `translateX(${x}px) rotate(${rot}deg)` }}>{children}</AbsoluteFill>;
  }
  if (v === 2) {
    const inP = spring({ frame: f, fps, config: { damping: 11, stiffness: 170 } });
    const scale = 1.4 - 0.4 * inP - outP * 0.15;
    const blur = (1 - inP) * 8 + outP * 6;
    return <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
  }
  if (v === 3) {
    const inP = spring({ frame: f, fps, config: { damping: 20, stiffness: 120 } });
    const yFinal = (1 - inP) * 220 + outP * -140;
    const skew = (1 - inP) * 5;
    return <AbsoluteFill style={{ opacity, transform: `translateY(${yFinal}px) skewY(${skew}deg)` }}>{children}</AbsoluteFill>;
  }
  const inP = spring({ frame: f, fps, config: { damping: 18, stiffness: 130 } });
  const scale = 0.94 + 0.06 * inP - 0.05 * outP;
  const blur = outP * 6;
  return <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
};

const EMOJI_RULES: { match: string[]; emojis: string[] }[] = [
  { match: ["rocket", "space", "moon", "mars", "astronaut", "launch", "orbit"], emojis: ["🚀", "🌕", "✨", "🛰️", "👨‍🚀"] },
  { match: ["money", "dollar", "cash", "pay", "fee", "cost", "price", "euro", "€", "$", "£"], emojis: ["💰", "💵", "🪙", "📈"] },
  { match: ["idea", "think", "invent", "discover", "realiz"], emojis: ["💡", "🧠", "✨"] },
  { match: ["win", "success", "celebrat", "achiev", "victory", "champion"], emojis: ["🏆", "🎉", "🥳", "🔥"] },
  { match: ["love", "heart", "relationship"], emojis: ["❤️", "💕"] },
  { match: ["time", "clock", "hour", "minute", "year", "day"], emojis: ["⏰", "⌛", "📅"] },
  { match: ["climate", "planet", "earth", "environment", "green", "eco"], emojis: ["🌍", "🌱", "♻️"] },
  { match: ["city", "town", "urban", "downtown"], emojis: ["🏙️", "🚦", "🏢"] },
  { match: ["bike", "bicycle", "cycling", "cyclist"], emojis: ["🚲", "🚴"] },
  { match: ["bag", "plastic", "grocery", "shop"], emojis: ["🛍️", "🛒", "♻️"] },
  { match: ["food", "eat", "meal", "hungry"], emojis: ["🍔", "🍕", "🍎"] },
  { match: ["water", "ocean", "sea", "river"], emojis: ["🌊", "💧"] },
  { match: ["fire", "hot", "burn"], emojis: ["🔥"] },
  { match: ["question", "why", "how", "what if"], emojis: ["❓", "🤔"] },
  { match: ["fast", "speed", "quick"], emojis: ["⚡", "💨"] },
  { match: ["build", "construct", "creat"], emojis: ["🛠️", "🏗️"] },
  { match: ["law", "government", "policy", "official"], emojis: ["🏛️", "📜"] },
  { match: ["school", "learn", "study", "student"], emojis: ["📚", "🎓"] },
  { match: ["health", "doctor", "medicine", "hospital"], emojis: ["🩺", "💊"] },
  { match: ["music", "song", "sound"], emojis: ["🎵", "🎶"] },
  { match: ["star", "famous", "dream", "wish"], emojis: ["⭐", "🌟"] },
  { match: ["mountain", "climb", "peak"], emojis: ["⛰️", "🏔️", "🚩"] },
];
const GENERIC_POOL = ["✨", "🔥", "💯", "⚡", "🌟", "🎯", "💥", "👀"];

const pickEmojis = (text: string, count: number): string[] => {
  const txt = (text || "").toLowerCase();
  const matched: string[] = [];
  for (const rule of EMOJI_RULES) if (rule.match.some((m) => txt.includes(m))) matched.push(...rule.emojis);
  const pool = matched.length ? Array.from(new Set(matched)) : GENERIC_POOL;
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(pool[i % pool.length]);
  return out;
};

const FloatingEmojis: React.FC<{ text: string; sceneIndex: number; count?: number }> = ({ text, sceneIndex, count = 7 }) => {
  const f = useCurrentFrame();
  const emojis = pickEmojis(text, count);
  return (
    <>
      {emojis.map((e, i) => {
        const seed = sceneIndex * 97.13 + i * 53.7;
        const angle = (seed * 37) % 360;
        const rad = 370 + ((seed * 13) % 280);
        const cx = Math.min(1030, Math.max(50, 540 + Math.cos((angle * Math.PI) / 180) * rad));
        const cy = Math.min(1560, Math.max(90, 760 + Math.sin((angle * Math.PI) / 180) * rad * 1.15));
        const size = 42 + ((seed * 7) % 130);
        const ambient = size > 110;
        const floatY = Math.sin(f / 40 + seed) * 20;
        const floatX = Math.cos(f / 55 + seed) * 12;
        const rot = Math.sin(f / 65 + seed) * 14;
        const inDelay = i * 3;
        const p = spring({ frame: f - inDelay, fps: 30, config: { damping: 15, stiffness: 95 } });
        const opacity = (ambient ? 0.24 : 0.88) * p;
        return (
          <div key={i} style={{
            position: "absolute", left: cx + floatX, top: cy + floatY,
            fontSize: size, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`,
            opacity, filter: ambient ? "blur(2px)" : "none", pointerEvents: "none",
          }}>{e}</div>
        );
      })}
    </>
  );
};

const GlassCard: React.FC<{ children: React.ReactNode; pad?: number }> = ({ children, pad = 64 }) => (
  <div style={{
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 40, padding: pad,
    backdropFilter: "blur(18px)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
  }}>{children}</div>
);

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 84px", paddingBottom: 360, fontFamily: font }}>
    {children}
  </AbsoluteFill>
);

const MaskedText: React.FC<{ text: string; fontSize: number; weight: number; color: string; delay?: number; align?: "center" | "left" }> = ({ text, fontSize, weight, color, delay = 0, align = "center" }) => {
  const p = useSpr(delay, { damping: 22, stiffness: 90 });
  const reveal = interpolate(p, [0, 1], [100, 0]);
  return (
    <div style={{ position: "relative", overflow: "hidden", textAlign: align }}>
      <div style={{
        fontSize, fontWeight: weight, color, lineHeight: 1.12, textAlign: align, letterSpacing: -1,
        clipPath: `inset(0 ${reveal}% 0 0)`,
        textShadow: "0 8px 30px rgba(0,0,0,0.35)",
      }}>{text}</div>
    </div>
  );
};

const Title: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const text = clean(s.text);
  const words = text.split(" ");
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(" ");
  const line2 = words.slice(mid).join(" ");
  return (
    <Center>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 900 }}>
        <MaskedText text={line1} fontSize={112} weight={900} color={t.text} delay={0} />
        {line2 && <MaskedText text={line2} fontSize={112} weight={900} color={t.accent} delay={5} />}
      </div>
    </Center>
  );
};

const Bullet: React.FC<{ text: string; delay: number; t: Theme; i: number }> = ({ text, delay, t, i }) => {
  const p = useSpr(delay);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 26, margin: "14px 0", width: "100%", maxWidth: 820,
      opacity: p, transform: `translateX(${(1 - p) * 90}px)`,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
        background: hexToRgba(t.accent, 0.18), border: `1.5px solid ${hexToRgba(t.accent, 0.6)}`,
        color: t.accent, fontWeight: 900, fontSize: 28, flexShrink: 0,
      }}>{i + 1}</div>
      <div style={{ fontSize: 62, fontWeight: 700, color: t.text, lineHeight: 1.15 }}>{text}</div>
    </div>
  );
};

const Bullets: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const head = useSpr(0);
  const items = (s.items || []).map(clean).filter(Boolean);
  const gap = Math.max(10, (s.duration * 0.55) / Math.max(1, items.length));
  return (
    <Center>
      <GlassCard pad={70}>
        <div style={{ fontSize: 78, fontWeight: 900, color: t.text, textAlign: "center", marginBottom: 46,
          opacity: head, transform: `scale(${0.9 + 0.1 * head})`, maxWidth: 820 }}>{clean(s.text)}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {items.map((it, i) => <Bullet key={i} text={it} delay={10 + i * gap} t={t} i={i} />)}
        </div>
      </GlassCard>
    </Center>
  );
};

const BigNumber: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const p = useSpr(0, { damping: 12, stiffness: 140 });
  const glow = useSpr(0, { damping: 26, stiffness: 60 });
  const l = useSpr(16);
  return (
    <Center>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", inset: -40, borderRadius: "50%",
          background: `radial-gradient(circle, ${hexToRgba(t.accent, 0.5 * glow)}, transparent 70%)`,
          filter: "blur(30px)",
        }} />
        <div style={{
          fontSize: 320, fontWeight: 900, color: t.accent, position: "relative",
          transform: `scale(${0.5 + 0.5 * p})`, opacity: p, letterSpacing: -6,
          textShadow: `0 0 60px ${hexToRgba(t.accent, 0.6)}`,
        }}>{clean(s.number)}</div>
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, color: t.text, textAlign: "center", opacity: l,
        transform: `translateY(${(1 - l) * 36}px)`, marginTop: 12, maxWidth: 760 }}>{clean(s.label || s.text)}</div>
    </Center>
  );
};

const Quote: React.FC<{ s: Scene; t: Theme }> = ({ s, t }) => {
  const p = useSpr(0, { damping: 20, stiffness: 100 });
  const a = useSpr(18);
  return (
    <Center>
      <GlassCard pad={80}>
        <div style={{ fontSize: 220, color: t.accent, lineHeight: 0.4, opacity: p, fontFamily: "Georgia, serif" }}>&ldquo;</div>
        <div style={{ fontSize: 76, fontWeight: 800, color: t.text, textAlign: "center", opacity: p,
          transform: `translateY(${(1 - p) * 40}px)`, maxWidth: 780, lineHeight: 1.25 }}>{clean(s.text)}</div>
        {s.author ? <div style={{ fontSize: 46, color: t.accent, marginTop: 40, opacity: a, textAlign: "center",
          fontWeight: 600, letterSpacing: 1 }}>— {clean(s.author)}</div> : null}
      </GlassCard>
    </Center>
  );
};

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const Character: React.FC<{ x: number; y: number; scale?: number; facing?: number; legPhase?: number; armsUp?: boolean; accent: string }> = ({ x, y, scale = 1, facing = 1, legPhase = 0, armsUp = false, accent }) => {
  const legSwing = Math.sin(legPhase) * 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <line x1={-10} y1={40} x2={-10 - legSwing * 0.4} y2={95} stroke="#2b2b3a" strokeWidth={14} strokeLinecap="round" />
      <line x1={10} y1={40} x2={10 + legSwing * 0.4} y2={95} stroke="#2b2b3a" strokeWidth={14} strokeLinecap="round" />
      <rect x={-32} y={-10} width={64} height={58} rx={24} fill={accent} />
      {armsUp ? (
        <>
          <line x1={-26} y1={0} x2={-46} y2={-46} stroke={accent} strokeWidth={13} strokeLinecap="round" />
          <line x1={26} y1={0} x2={46} y2={-46} stroke={accent} strokeWidth={13} strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={-28} y1={4} x2={-44 + Math.sin(legPhase + 1) * 8} y2={40} stroke={accent} strokeWidth={13} strokeLinecap="round" />
          <line x1={28} y1={4} x2={44 - Math.sin(legPhase + 1) * 8} y2={40} stroke={accent} strokeWidth={13} strokeLinecap="round" />
        </>
      )}
      <circle cx={0} cy={-40} r={34} fill="#ffffff" />
      <path d="M -22 -46 A 26 26 0 0 1 22 -46 L 20 -30 A 22 20 0 0 1 -20 -30 Z" fill="#0b0f1a" opacity={0.85} />
    </g>
  );
};

const Rocket: React.FC<{ x: number; y: number; angle: number; scale?: number; accent: string }> = ({ x, y, angle, scale = 1, accent }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M 0 -90 C 26 -50 30 20 20 60 L -20 60 C -30 20 -26 -50 0 -90 Z" fill={accent} />
    <circle cx={0} cy={-10} r={14} fill="#0b0f1a" opacity={0.85} />
    <path d="M -20 40 L -46 70 L -18 60 Z" fill="#ffffff" opacity={0.9} />
    <path d="M 20 40 L 46 70 L 18 60 Z" fill="#ffffff" opacity={0.9} />
    <path d="M -10 60 Q 0 100 10 60 Z" fill="#ffb44d" />
  </g>
);

const DestinationIcon: React.FC<{ kind: StoryDestination; x: number; y: number; theme: Theme; glow?: number }> = ({ kind, x, y, theme, glow = 0 }) => {
  if (kind === "none") return null;
  return (
    <g transform={`translate(${x} ${y})`}>
      {glow > 0 && <circle r={140} fill={hexToRgba(theme.accent, 0.35 * glow)} style={{ filter: "blur(20px)" }} />}
      {kind === "moon" && (
        <g>
          <circle r={110} fill="#d8dbe2" />
          <circle cx={-30} cy={-20} r={16} fill="#b7bac3" />
          <circle cx={25} cy={10} r={22} fill="#b7bac3" />
          <circle cx={0} cy={45} r={12} fill="#b7bac3" />
        </g>
      )}
      {kind === "mountain" && (
        <g>
          <path d="M -140 90 L 0 -110 L 140 90 Z" fill="#7b8794" />
          <path d="M -30 -50 L 0 -110 L 30 -50 L 10 -40 L 0 -60 L -10 -40 Z" fill="#ffffff" />
        </g>
      )}
      {kind === "city" && (
        <g>
          {[[-120, 60, 70, 130], [-40, 30, 80, 160], [50, 50, 60, 140], [120, 10, 50, 170]].map((r, i) => (
            <rect key={i} x={r[0]} y={-(r[3] as number) + (r[1] as number)} width={r[2] as number} height={r[3] as number} fill="#5b6470" />
          ))}
        </g>
      )}
      {kind === "star" && (
        <path d="M0 -110 L28 -34 L108 -34 L44 16 L68 92 L0 46 L-68 92 L-44 16 L-108 -34 L-28 -34 Z" fill="#ffd76a" />
      )}
      {kind === "flag" && (
        <g>
          <line x1={0} y1={100} x2={0} y2={-120} stroke="#cfd3da" strokeWidth={10} />
          <path d="M 0 -120 L 100 -95 L 0 -70 Z" fill={theme.accent} />
        </g>
      )}
      {kind === "lightbulb" && (
        <g>
          <circle r={70} fill="#ffe27a" opacity={glow > 0 ? 1 : 0.5} />
          <rect x={-22} y={65} width={44} height={22} rx={6} fill="#8a8f9a" />
          {glow > 0 && [0, 60, 120, 180, 240, 300].map((a, i) => (
            <line key={i} x1={Math.cos((a * Math.PI) / 180) * 90} y1={Math.sin((a * Math.PI) / 180) * 90}
              x2={Math.cos((a * Math.PI) / 180) * 115} y2={Math.sin((a * Math.PI) / 180) * 115}
              stroke="#ffe27a" strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
      )}
    </g>
  );
};

const Particles: React.FC<{ cx: number; cy: number; seedBase: number; count?: number; color: string; spread?: number; life: number }> = ({ cx, cy, seedBase, count = 10, color, spread = 140, life }) => {
  const items = Array.from({ length: count }).map((_, i) => {
    const seed = seedBase + i * 13.37;
    const ang = ((seed * 47) % 360) * (Math.PI / 180);
    const dist = life * spread * (0.4 + ((seed * 7) % 10) / 10);
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist - life * 40;
    const o = Math.max(0, 1 - life);
    const r = 5 + ((seed * 3) % 6);
    return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={o} />;
  });
  return <g>{items}</g>;
};

const StarField: React.FC<{ frame: number }> = ({ frame }) => {
  const stars = Array.from({ length: 40 }).map((_, i) => {
    const seed = i * 97.13;
    const x = (seed * 13) % 1080;
    const y = (seed * 29) % 1100;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i));
    return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="#ffffff" opacity={tw} />;
  });
  return <g>{stars}</g>;
};

const FALLBACK_ACTIONS: StoryAction[] = ["walk", "think", "climb", "celebrate", "search", "launch"];
const FALLBACK_DESTS: StoryDestination[] = ["star", "lightbulb", "mountain", "flag", "city", "moon"];
const inferStory = (s: Scene, sceneIndex: number) => {
  const txt = (s.text || "").toLowerCase();
  const has = (...words: string[]) => words.some((w) => txt.includes(w));
  let action = s.action;
  let vehicle = s.vehicle;
  let destination = s.destination;
  if (!action) {
    if (has("rocket", "space", "launch", "moon", "astronaut", "mars")) action = "launch";
    else if (has("climb", "mountain", "peak", "rise", "up the")) action = "climb";
    else if (has("idea", "think", "realiz", "discover", "invent")) action = "think";
    else if (has("win", "celebrat", "success", "achiev", "victory")) action = "celebrate";
    else if (has("search", "look", "find", "explore", "hunt")) action = "search";
    else if (has("walk", "went", "travel", "journey", "arrive")) action = "walk";
    else action = FALLBACK_ACTIONS[sceneIndex % FALLBACK_ACTIONS.length];
  }
  if (!vehicle) vehicle = action === "launch" ? "rocket" : "none";
  if (!destination) {
    if (has("moon", "space", "mars")) destination = "moon";
    else if (has("mountain", "peak", "climb")) destination = "mountain";
    else if (has("city", "town", "downtown")) destination = "city";
    else if (has("idea", "invent", "light")) destination = "lightbulb";
    else if (has("win", "flag", "goal", "achiev")) destination = "flag";
    else if (has("star", "dream", "wish", "famous")) destination = "star";
    else destination = action === "walk" || action === "search" ? "none" : FALLBACK_DESTS[sceneIndex % FALLBACK_DESTS.length];
  }
  return { action, vehicle, destination };
};

const Story: React.FC<{ s: Scene; t: Theme; duration: number; sceneIndex: number }> = ({ s, t, duration, sceneIndex }) => {
  const f = useCurrentFrame();
  const p = Math.min(1, Math.max(0, f / Math.max(1, duration)));
  const { action, destination } = inferStory(s, sceneIndex);
  const destX = 800, destY = 420;
  const groundY = 1420;
  const caption = clean(s.text);
  const captionP = spring({ frame: f, fps: 30, config: { damping: 18, stiffness: 110 } });

  let charX = 300, charY = groundY, charScale = 1, charVisible = true, legPhase = f / 4, armsUp = false;
  let vehicleEl: React.ReactNode = null;
  let destGlow = 0;
  let particlesEl: React.ReactNode = null;
  let showStars = destination === "moon" || action === "launch";

  if (action === "launch") {
    const runEnd = 0.28, boardEnd = 0.4, flyEnd = 0.85;
    if (p < runEnd) {
      const lp = p / runEnd;
      charX = interpolate(lp, [0, 1], [-120, 340]);
      legPhase = f / 2.5;
    } else if (p < boardEnd) {
      const lp = (p - runEnd) / (boardEnd - runEnd);
      charX = 340; charScale = 1 - lp; charVisible = lp < 0.96;
      vehicleEl = <Rocket x={340} y={groundY - 60} angle={0} scale={0.4 + lp * 0.6} accent={t.accent} />;
    } else if (p < flyEnd) {
      charVisible = false;
      const lp = easeInOut((p - boardEnd) / (flyEnd - boardEnd));
      const vx = interpolate(lp, [0, 1], [340, destX]);
      const arc = -Math.sin(lp * Math.PI) * 260;
      const vy = interpolate(lp, [0, 1], [groundY - 60, destY]) + arc;
      const angle = interpolate(lp, [0, 1], [-6, -70]);
      vehicleEl = <Rocket x={vx} y={vy} angle={angle} scale={1} accent={t.accent} />;
      particlesEl = <Particles cx={vx} cy={vy + 70} seedBase={Math.floor(f / 2)} color="#ffb44d" life={0.5} count={6} spread={60} />;
    } else {
      charVisible = false;
      const lp = (p - flyEnd) / (1 - flyEnd);
      const bounce = spring({ frame: f - Math.round(flyEnd * duration), fps: 30, config: { damping: 10, stiffness: 160 } });
      const squash = 1 - Math.max(0, (1 - bounce)) * 0.25;
      vehicleEl = <Rocket x={destX} y={destY + (1 - bounce) * 40} angle={-70} scale={squash} accent={t.accent} />;
      destGlow = Math.min(1, lp * 2);
      if (lp < 0.4) particlesEl = <Particles cx={destX} cy={destY + 40} seedBase={7} color="#ffffff" life={lp / 0.4} count={12} spread={110} />;
    }
  } else if (action === "walk") {
    const lp = easeInOut(Math.min(1, p / 0.7));
    charX = interpolate(lp, [0, 1], [-120, destX - 160]);
    legPhase = f / 3;
    armsUp = p > 0.75;
    destGlow = p > 0.5 ? 1 : 0;
  } else if (action === "climb") {
    const lp = easeInOut(p);
    charX = interpolate(lp, [0, 1], [160, destX - 140]);
    charY = interpolate(lp, [0, 1], [groundY, destY + 120]) - Math.abs(Math.sin(f / 3)) * 18;
    legPhase = f / 2;
    destGlow = p > 0.85 ? 1 : 0;
  } else if (action === "think") {
    charX = 540; charY = groundY - 40;
    legPhase = f / 14;
    destGlow = p > 0.35 ? Math.min(1, (p - 0.35) * 3) : 0;
  } else if (action === "celebrate") {
    charX = 540;
    charY = groundY - Math.abs(Math.sin((f / 30) * Math.PI)) * 90;
    armsUp = true; legPhase = f / 2;
    particlesEl = <Particles cx={540} cy={groundY - 200} seedBase={Math.floor(f / 3)} color={t.accent} life={(f % 40) / 40} count={14} spread={220} />;
  } else if (action === "search") {
    charX = 540 + Math.sin((f / 60) * Math.PI * 2) * 140;
    charY = groundY - 20;
    legPhase = f / 6;
  }

  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {showStars && <StarField frame={f} />}
        {destination !== "none" && <DestinationIcon kind={destination} x={destX} y={destY} theme={t} glow={destGlow} />}
        {particlesEl}
        {vehicleEl}
        {charVisible && <Character x={charX} y={charY} scale={charScale} facing={1} legPhase={legPhase} armsUp={armsUp} accent={t.text === "#ffffff" ? t.accent : t.text} />}
      </svg>
      {caption && (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 120, fontFamily: font }}>
          <div style={{
            fontSize: 56, fontWeight: 800, color: t.text, textAlign: "center", maxWidth: 760,
            opacity: captionP, transform: `translateY(${(1 - captionP) * -20}px)`,
            background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)", borderRadius: 24, padding: "20px 36px",
          }}>{caption}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: Scene; t: Theme; sceneIndex: number; words: Word[]; sceneFrom: number }> = ({ s, t, sceneIndex, words, sceneFrom }) => {
  if (s.template === "story" && s.scene === "submarine_descent") {
    return <SubmarineDescent sceneFrom={sceneFrom} duration={s.duration} words={words} theme={t} />;
  }
  switch (s.template) {
    case "bullet-reveal": return <Bullets s={s} t={t} />;
    case "big-number": return <BigNumber s={s} t={t} />;
    case "quote": return <Quote s={s} t={t} />;
    case "story": return <Story s={s} t={t} duration={s.duration} sceneIndex={sceneIndex} />;
    default: return <Title s={s} t={t} />;
  }
};

const Captions: React.FC<{ words: Word[]; t: Theme }> = ({ words, t }) => {
  const f = useCurrentFrame();
  if (!words.length) return null;
  let cur = words.findIndex((w) => f >= w.start && f <= w.end + 4);
  if (cur === -1) cur = Math.max(0, words.findIndex((w) => w.start > f) - 1);
  const CHUNK = 4;
  const chunkStart = Math.floor(cur / CHUNK) * CHUNK;
  const chunk = words.slice(chunkStart, chunkStart + CHUNK);
  const activeInChunk = cur - chunkStart;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 230, fontFamily: font }}>
      <div style={{
        display: "flex", justifyContent: "center", background: "rgba(0,0,0,0.42)",
        backdropFilter: "blur(10px)", borderRadius: 26, padding: "22px 44px", maxWidth: 880,
      }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {chunk.map((w, i) => {
            const active = i === activeInChunk;
            const wp = spring({ frame: f - w.start, fps: 30, config: { damping: 14, stiffness: 200 } });
            return (
              <span key={chunkStart + i} style={{
                fontSize: 58, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5,
                color: active ? t.accent : "#fff",
                transform: `scale(${active ? 0.94 + 0.14 * Math.min(1, wp) : 1})`,
                transition: "color 0.1s",
              }}>{clean(w.word)}</span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC<{ theme: Theme; totalFrames: number }> = ({ theme, totalFrames }) => {
  const f = useCurrentFrame();
  const pct = Math.min(1, f / Math.max(1, totalFrames));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start" }}>
      <div style={{ height: 8, width: "100%", background: "rgba(255,255,255,0.12)" }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: theme.accent,
          boxShadow: `0 0 16px ${hexToRgba(theme.accent, 0.8)}` }} />
      </div>
    </AbsoluteFill>
  );
};

export const Short: React.FC<ShortProps> = ({ theme, scenes, words, hasMusic, totalFrames }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background theme={theme} frame={frame} totalFrames={totalFrames} />
      {scenes.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.duration}>
          <SceneWrap duration={s.duration} variant={i}>
            <SceneView s={s} t={theme} sceneIndex={i} words={words} sceneFrom={s.from} />
          </SceneWrap>
        </Sequence>
      ))}
      <Captions words={words} t={theme} />
      <ProgressBar theme={theme} totalFrames={totalFrames} />
      {words.length > 0 && <Audio src={staticFile("voiceover.wav")} />}
      {hasMusic && <Audio src={staticFile("music.mp3")} volume={0.07} loop />}
    </AbsoluteFill>
  );
};
