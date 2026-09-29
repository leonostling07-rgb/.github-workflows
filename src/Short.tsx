import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export type Theme = { background: string; accent: string; text: string };
export type StoryAction =
  | "launch" | "walk" | "climb" | "think" | "celebrate" | "search"
  | "run" | "jump" | "sleep" | "laugh" | "cry" | "point"
  | "fall" | "hold" | "open" | "throw";
export type StoryVehicle = "rocket" | "car" | "plane" | "bike" | "none";
export type StoryDestination =
  | "moon" | "mountain" | "city" | "star" | "flag" | "lightbulb"
  | "book" | "trophy" | "heart" | "money" | "clock" | "gift"
  | "cloud" | "sun" | "house" | "bike" | "none";
export type Scene = {
  template: "title" | "bullet-reveal" | "big-number" | "quote" | "story";
  text: string; items?: string[]; number?: string; label?: string; author?: string;
  action?: StoryAction; vehicle?: StoryVehicle; destination?: StoryDestination;
  from: number; duration: number;
};
export type Word = { word: string; start: number; end: number };
export type ShortProps = { title: string; theme: Theme; scenes: Scene[]; words: Word[]; totalFrames: number; hasMusic: boolean };

const font = '"Inter", "Helvetica Neue", Arial, sans-serif';

// Strip emoji / pictographs so stray characters from an AI script never
// break layout or wrap unpredictably. Keep plain punctuation and letters only.
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

// ---------- Cinematic layered background ----------
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
      {/* fine grain for texture */}
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "3px 3px", mixBlendMode: "overlay", opacity: 0.5,
      }} />
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- Scene transition wrapper ----------
const SceneWrap: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame: f, fps, config: { damping: 18, stiffness: 130 } });
  const outStart = duration - 14;
  const outP = interpolate(f, [outStart, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }) * (1 - outP);
  const scale = 0.94 + 0.06 * inP - 0.05 * outP;
  const blur = outP * 6;
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
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

// ---------- Masked text reveal (cinematic wipe, not flying words) ----------
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

// ---------- Templates ----------
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

// ---------- STORY: illustrated 2D character scenes ----------
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const Character: React.FC<{
  x: number; y: number; scale?: number; facing?: number;
  legPhase?: number; armsUp?: boolean; accent: string;
  pose?: "normal" | "sleep" | "laugh" | "cry" | "point" | "hold";
  tilt?: number; bounce?: number;
}> = ({
  x, y, scale = 1, facing = 1, legPhase = 0, armsUp = false,
  accent, pose = "normal", tilt = 0, bounce = 0,
}) => {
  const legSwing = Math.sin(legPhase) * 26;
  const armSwing = Math.sin(legPhase * 1.35) * 12;

  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale * facing} ${scale})`}>
      <ellipse cx={0} cy={102} rx={62} ry={12} fill="#000" opacity={0.18} />

      <g transform={`translate(0 ${-bounce})`}>
        {pose === "sleep" ? (
          <>
            <line x1={-8} y1={42} x2={-42} y2={78} stroke="#252a35" strokeWidth={14} strokeLinecap="round" />
            <line x1={8} y1={42} x2={42} y2={78} stroke="#252a35" strokeWidth={14} strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1={-10} y1={40} x2={-10 - legSwing * .42} y2={95} stroke="#252a35" strokeWidth={14} strokeLinecap="round" />
            <line x1={10} y1={40} x2={10 + legSwing * .42} y2={95} stroke="#252a35" strokeWidth={14} strokeLinecap="round" />
          </>
        )}

        <rect x={-32} y={-10} width={64} height={58} rx={24} fill={accent} />

        {pose === "point" ? (
          <>
            <line x1={-26} y1={0} x2={-54} y2={-18} stroke={accent} strokeWidth={13} strokeLinecap="round" />
            <line x1={26} y1={0} x2={74} y2={-38} stroke={accent} strokeWidth={13} strokeLinecap="round" />
          </>
        ) : pose === "hold" ? (
          <>
            <line x1={-26} y1={0} x2={-55} y2={-5} stroke={accent} strokeWidth={13} strokeLinecap="round" />
            <line x1={26} y1={0} x2={55} y2={-5} stroke={accent} strokeWidth={13} strokeLinecap="round" />
          </>
        ) : armsUp ? (
          <>
            <line x1={-26} y1={0} x2={-52} y2={-54 - armSwing} stroke={accent} strokeWidth={13} strokeLinecap="round" />
            <line x1={26} y1={0} x2={52} y2={-54 + armSwing} stroke={accent} strokeWidth={13} strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1={-28} y1={4} x2={-44 + Math.sin(legPhase + 1) * 8} y2={40} stroke={accent} strokeWidth={13} strokeLinecap="round" />
            <line x1={28} y1={4} x2={44 - Math.sin(legPhase + 1) * 8} y2={40} stroke={accent} strokeWidth={13} strokeLinecap="round" />
          </>
        )}

        <circle cx={0} cy={-40} r={34} fill="#fff" />
        <path d="M-22 -46 A26 26 0 0 1 22 -46 L20 -30 A22 20 0 0 1 -20 -30Z" fill="#0b0f1a" opacity=".86" />

        {pose === "sleep" ? (
          <>
            <path d="M-16 -43 Q-8 -36 0 -43" fill="none" stroke="#252a35" strokeWidth="4" />
            <path d="M2 -43 Q10 -36 18 -43" fill="none" stroke="#252a35" strokeWidth="4" />
            <path d="M-7 -27 Q0 -22 7 -27" fill="none" stroke="#252a35" strokeWidth="4" />
          </>
        ) : (
          <>
            <circle cx={-11} cy={-42} r={3.5} fill="#252a35" />
            <circle cx={11} cy={-42} r={3.5} fill="#252a35" />
            {pose === "laugh" ? (
              <path d="M-14 -27 Q0 -12 14 -27" fill="none" stroke="#252a35" strokeWidth="5" strokeLinecap="round" />
            ) : pose === "cry" ? (
              <>
                <path d="M-10 -27 Q0 -34 10 -27" fill="none" stroke="#252a35" strokeWidth="5" />
                <circle cx={-13} cy={-34} r={5} fill="#74c8ff" />
                <circle cx={13} cy={-34} r={5} fill="#74c8ff" />
              </>
            ) : (
              <path d="M-8 -27 Q0 -21 8 -27" fill="none" stroke="#252a35" strokeWidth="4" />
            )}
          </>
        )}
      </g>
    </g>
  );
};

const Rocket: React.FC<{ x: number; y: number; angle: number; scale?: number; accent: string; text: string }> = ({ x, y, angle, scale = 1, accent }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M 0 -90 C 26 -50 30 20 20 60 L -20 60 C -30 20 -26 -50 0 -90 Z" fill={accent} />
    <circle cx={0} cy={-10} r={14} fill="#0b0f1a" opacity={0.85} />
    <path d="M -20 40 L -46 70 L -18 60 Z" fill="#ffffff" opacity={0.9} />
    <path d="M 20 40 L 46 70 L 18 60 Z" fill="#ffffff" opacity={0.9} />
    <path d="M -10 60 Q 0 100 10 60 Z" fill="#ffb44d" />
  </g>
);

const DestinationIcon: React.FC<{
  kind: StoryDestination; x: number; y: number; theme: Theme;
  glow?: number; scale?: number; rotation?: number;
}> = ({ kind, x, y, theme, glow = 0, scale = 1, rotation = 0 }) => {
  if (kind === "none") return null;

  const line = theme.text;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
      {glow > 0 && (
        <circle r={150} fill={hexToRgba(theme.accent, .28 * glow)}
          style={{ filter: "blur(24px)" }} />
      )}

      {kind === "moon" && <g>
        <circle r={110} fill="#d8dbe2" />
        <circle cx={-30} cy={-20} r={16} fill="#b7bac3" />
        <circle cx={25} cy={10} r={22} fill="#b7bac3" />
        <circle cx={0} cy={45} r={12} fill="#b7bac3" />
      </g>}

      {kind === "mountain" && <g>
        <path d="M-155 105 L0 -130 L155 105Z" fill="#667381" />
        <path d="M-48 -55 L0 -130 L48 -55 L18 -44 L0 -76 L-18 -44Z" fill="#fff" />
        <path d="M-190 105 L-70 10 L5 105Z" fill="#505b68" />
      </g>}

      {kind === "city" && <g>
        {[[-155,65,70,125],[-70,25,80,165],[25,55,65,135],[100,0,60,190]].map((r,i)=>(
          <g key={i}>
            <rect x={r[0]} y={-(r[3] as number)+(r[1] as number)} width={r[2] as number} height={r[3] as number} fill={i%2 ? "#697582" : "#535f6c"} />
            {[0,1,2].map((j)=>(
              <rect key={j}
                x={(r[0] as number)+16+j*20}
                y={-(r[3] as number)+(r[1] as number)+24}
                width={8} height={12} rx={2} fill="#ffd76a" opacity={.7} />
            ))}
          </g>
        ))}
      </g>}

      {kind === "star" && (
        <path d="M0-110 L28-34 L108-34 L44 16 L68 92 L0 46 L-68 92 L-44 16 L-108-34 L-28-34Z" fill="#ffd76a" />
      )}

      {kind === "flag" && <g>
        <line x1={0} y1={115} x2={0} y2={-125} stroke="#cfd3da" strokeWidth={10} />
        <path d="M0-125 L115-94 L0-62Z" fill={theme.accent} />
      </g>}

      {kind === "lightbulb" && <g>
        <circle r={72} fill="#ffe27a" />
        <rect x={-23} y={66} width={46} height={24} rx={6} fill="#8a8f9a" />
        {glow > .1 && [0,60,120,180,240,300].map((deg,i)=>(
          <line key={i}
            x1={Math.cos(deg*Math.PI/180)*95} y1={Math.sin(deg*Math.PI/180)*95}
            x2={Math.cos(deg*Math.PI/180)*128} y2={Math.sin(deg*Math.PI/180)*128}
            stroke="#ffe27a" strokeWidth={7} strokeLinecap="round" />
        ))}
      </g>}

      {kind === "book" && <g>
        <path d="M-115-72 Q-48-105 0-70 L0 105 Q-55 72-115 96Z" fill="#70bfff" />
        <path d="M0-70 Q48-105 115-72 L115 96 Q55 72 0 105Z" fill="#bce5ff" />
        <line x1={0} y1={-70} x2={0} y2={105} stroke="#fff" strokeWidth={7} />
        <line x1={-85} y1={-28} x2={-28} y2={-45} stroke="#fff" strokeWidth={5} opacity=".7" />
        <line x1={28} y1={-45} x2={85} y2={-28} stroke="#fff" strokeWidth={5} opacity=".7" />
      </g>}

      {kind === "trophy" && <g>
        <path d="M-55-85 L55-85 L42 20 Q0 80-42 20Z" fill="#ffd76a" />
        <path d="M-55-62 Q-120-62-105 5 Q-95 42-42 34" fill="none" stroke="#ffd76a" strokeWidth={18} />
        <path d="M55-62 Q120-62 105 5 Q95 42 42 34" fill="none" stroke="#ffd76a" strokeWidth={18} />
        <rect x={-12} y={70} width={24} height={35} fill="#ffd76a" />
        <rect x={-65} y={105} width={130} height={18} rx={8} fill="#ffd76a" />
      </g>}

      {kind === "heart" && (
        <path d="M0 110 C-25 75-120 20-120-45 C-120-115-35-130 0-72 C35-130 120-115 120-45 C120 20 25 75 0 110Z" fill="#ff668c" />
      )}

      {kind === "money" && <g>
        <rect x={-125} y={-78} width={250} height={156} rx={20} fill="#68d391" />
        <circle r={45} fill="#b9f6c5" />
        <text x={0} y={18} textAnchor="middle" fontSize={60} fontWeight="900" fill="#2f855a">$</text>
      </g>}

      {kind === "clock" && <g>
        <circle r={108} fill="#f4f6f8" stroke="#9ca8b4" strokeWidth={12} />
        <line x1={0} y1={0} x2={0} y2={-62} stroke="#2b3440" strokeWidth={9} strokeLinecap="round" />
        <line x1={0} y1={0} x2={48} y2={35} stroke="#2b3440" strokeWidth={9} strokeLinecap="round" />
        <circle r={9} fill={theme.accent} />
      </g>}

      {kind === "gift" && <g>
        <rect x={-100} y={-35} width={200} height={135} rx={12} fill="#ff6f91" />
        <rect x={-115} y={-65} width={230} height={45} rx={10} fill="#ff8baa" />
        <rect x={-18} y={-65} width={36} height={165} fill="#ffd76a" />
        <path d="M0-65 C-70-125-105-75-62-45 C-40-30-18-40 0-65Z" fill="#ffd76a" />
        <path d="M0-65 C70-125 105-75 62-45 C40-30 18-40 0-65Z" fill="#ffd76a" />
      </g>}

      {kind === "cloud" && <g>
        <circle cx={-65} cy={20} r={55} fill="#eaf4ff" />
        <circle cx={0} cy={-5} r={80} fill="#fff" />
        <circle cx={70} cy={20} r={58} fill="#eaf4ff" />
        <rect x={-105} y={20} width={210} height={65} rx={32} fill="#eaf4ff" />
      </g>}

      {kind === "sun" && <g>
        <circle r={72} fill="#ffd76a" />
        {[0,45,90,135,180,225,270,315].map((deg)=>(
          <line key={deg}
            x1={Math.cos(deg*Math.PI/180)*105} y1={Math.sin(deg*Math.PI/180)*105}
            x2={Math.cos(deg*Math.PI/180)*138} y2={Math.sin(deg*Math.PI/180)*138}
            stroke="#ffd76a" strokeWidth={10} strokeLinecap="round" />
        ))}
      </g>}

      {kind === "house" && <g>
        <path d="M-130-5 L0-125 L130-5Z" fill="#ff8f70" />
        <rect x={-100} y={-5} width={200} height={135} rx={8} fill="#f2d6a2" />
        <rect x={-25} y={55} width={50} height={75} fill="#6b7280" />
        <rect x={-72} y={20} width={45} height={45} fill="#8fd3ff" />
        <rect x={27} y={20} width={45} height={45} fill="#8fd3ff" />
      </g>}

      {kind === "bike" && <g stroke={line} strokeWidth={9} fill="none">
        <circle cx={-70} cy={65} r={45} />
        <circle cx={70} cy={65} r={45} />
        <path d="M-70 65 L-20-5 L20 65 L70 65 L0-5 L-20-5" />
        <line x1={0} y1={-5} x2={35} y2={-45} />
      </g>}
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

// When the AI didn't set action/vehicle/destination, infer something sensible
// from the scene's own text instead of always defaulting to "walk".
const FALLBACK_ACTIONS: StoryAction[] =
  ["run", "think", "search", "jump", "walk", "point", "celebrate", "climb"];

const FALLBACK_DESTS: StoryDestination[] =
  ["star", "lightbulb", "book", "clock", "heart", "money", "trophy", "city", "moon"];

const inferStory = (s: Scene, sceneIndex: number) => {
  const txt = (s.text || "").toLowerCase();
  const has = (...words: string[]) => words.some((w) => txt.includes(w));

  let action = s.action;
  let vehicle = s.vehicle;
  let destination = s.destination;

  if (!action) {
    if (has("rocket","space","launch","moon","astronaut","mars","fly")) action = "launch";
    else if (has("sleep","slept","bed","tired","night","rest")) action = "sleep";
    else if (has("laugh","laughs","funny","joke","smile")) action = "laugh";
    else if (has("cry","sad","tears","upset")) action = "cry";
    else if (has("fall","fell","collapse","drop")) action = "fall";
    else if (has("jump","jumped","leap","leapt")) action = "jump";
    else if (has("run","ran","race","rush","quickly")) action = "run";
    else if (has("point","show","showed","look at")) action = "point";
    else if (has("open","opened","unlock","door")) action = "open";
    else if (has("throw","threw","toss")) action = "throw";
    else if (has("hold","held","carry","carried")) action = "hold";
    else if (has("climb","mountain","peak","rise")) action = "climb";
    else if (has("idea","think","realiz","discover","invent","decision")) action = "think";
    else if (has("win","celebrat","success","achiev","victory","won")) action = "celebrate";
    else if (has("search","look","find","explore","hunt")) action = "search";
    else action = FALLBACK_ACTIONS[sceneIndex % FALLBACK_ACTIONS.length];
  }

  if (!vehicle) {
    if (action === "launch") vehicle = "rocket";
    else if (has("car","drive","driving")) vehicle = "car";
    else if (has("plane","flight","airplane")) vehicle = "plane";
    else if (has("bike","bicycle","cycling","cycle")) vehicle = "bike";
    else vehicle = "none";
  }

  if (!destination) {
    if (has("moon","space","mars")) destination = "moon";
    else if (has("mountain","peak")) destination = "mountain";
    else if (has("city","town","downtown","urban")) destination = "city";
    else if (has("book","read","learn","knowledge")) destination = "book";
    else if (has("trophy","prize","award","winner")) destination = "trophy";
    else if (has("love","heart","care")) destination = "heart";
    else if (has("money","cash","wealth","cost","price")) destination = "money";
    else if (has("time","clock","hour","minute","deadline")) destination = "clock";
    else if (has("gift","present")) destination = "gift";
    else if (has("cloud","clouds","weather")) destination = "cloud";
    else if (has("sun","morning","daylight")) destination = "sun";
    else if (has("house","home","room")) destination = "house";
    else if (has("bike","bicycle","cycling")) destination = "bike";
    else if (has("idea","invent","light")) destination = "lightbulb";
    else if (has("win","flag","goal","achiev")) destination = "flag";
    else if (has("star","dream","wish","famous")) destination = "star";
    else destination = FALLBACK_DESTS[sceneIndex % FALLBACK_DESTS.length];
  }

  return { action, vehicle, destination };
};

const Story: React.FC<{ s: Scene; t: Theme; duration: number; sceneIndex: number }> = ({
  s, t, duration, sceneIndex
}) => {
  const f = useCurrentFrame();
  const p = Math.min(1, Math.max(0, f / Math.max(1, duration)));
  const { action, vehicle, destination } = inferStory(s, sceneIndex);

  const destX = 790 + Math.sin(f / 33) * 35;
  const destY = 420 + Math.cos(f / 41) * 25;
  const groundY = 1420;

  let charX = 300;
  let charY = groundY;
  let charScale = 1;
  let charVisible = true;
  let legPhase = f / 4;
  let armsUp = false;
  let pose: "normal" | "sleep" | "laugh" | "cry" | "point" | "hold" = "normal";
  let tilt = 0;

  let vehicleEl: React.ReactNode = null;
  let particlesEl: React.ReactNode = null;
  let extraEl: React.ReactNode = null;
  let destGlow = 0;

  const showStars = destination === "moon" || action === "launch";

  // Each action is a finite visual sequence rather than a permanent loop.
  if (action === "launch") {
    const runEnd = .22, boardEnd = .36, flyEnd = .82;

    if (p < runEnd) {
      const q = easeInOut(p / runEnd);
      charX = interpolate(q, [0,1], [-140, 330]);
      legPhase = f / 1.8;
      tilt = -5;
      particlesEl = <Particles cx={charX-40} cy={groundY+5} seedBase={f} color="#ffb44d" life={.35} count={4} spread={55} />;
    } else if (p < boardEnd) {
      const q = easeInOut((p-runEnd)/(boardEnd-runEnd));
      charX = 330;
      charScale = 1-q;
      charVisible = q < .92;
      vehicleEl = <Rocket x={330} y={groundY-70} angle={0} scale={.45+q*.55} accent={t.accent} text="" />;
      particlesEl = <Particles cx={330} cy={groundY+30} seedBase={Math.floor(f/2)} color="#ffb44d" life={.65} count={10} spread={100} />;
    } else if (p < flyEnd) {
      charVisible = false;
      const q = easeInOut((p-boardEnd)/(flyEnd-boardEnd));
      const x = interpolate(q,[0,1],[330,destX]);
      const y = interpolate(q,[0,1],[groundY-70,destY]) - Math.sin(q*Math.PI)*320;
      const angle = interpolate(q,[0,1],[-4,-68]);
      vehicleEl = <Rocket x={x} y={y} angle={angle} scale={1+Math.sin(q*Math.PI)*.12} accent={t.accent} text="" />;
      particlesEl = <>
        <Particles cx={x} cy={y+75} seedBase={Math.floor(f/2)} color="#ffb44d" life={.5} count={10} spread={100} />
        <Particles cx={x-30} cy={y+30} seedBase={Math.floor(f/4)} color="#fff" life={.35} count={5} spread={55} />
      </>;
    } else {
      charVisible = false;
      const q = Math.min(1,(p-flyEnd)/(1-flyEnd));
      const bounce = spring({ frame:f-Math.round(flyEnd*duration), fps:30, config:{damping:10,stiffness:160} });
      vehicleEl = <Rocket x={destX} y={destY+(1-bounce)*55} angle={-68} scale={1-.15*(1-bounce)} accent={t.accent} text="" />;
      destGlow = Math.min(1,q*2.5);
      particlesEl = <Particles cx={destX} cy={destY+30} seedBase={8} color="#fff" life={q*.9} count={18} spread={170} />;
    }
  }

  else if (action === "run") {
    const q = easeInOut(Math.min(1,p/.82));
    charX = interpolate(q,[0,1],[-100,destX-150]);
    charY = groundY - Math.abs(Math.sin(f/2.2))*24;
    legPhase = f/1.6;
    tilt = -10;
    particlesEl = <Particles cx={charX-40} cy={groundY} seedBase={Math.floor(f/2)} color={t.accent} life={.5} count={7} spread={85} />;
    destGlow = p>.7 ? 1 : 0;
  }

  else if (action === "walk") {
    const q = easeInOut(Math.min(1,p/.78));
    charX = interpolate(q,[0,1],[-120,destX-150]);
    charY = groundY - Math.abs(Math.sin(f/7))*8;
    legPhase = f/3.1;
    tilt = Math.sin(f/9)*2;
    if (p>.76) armsUp = true;
    particlesEl = <Particles cx={charX-20} cy={groundY+5} seedBase={Math.floor(f/4)} color={t.text} life={.3} count={3} spread={35} />;
  }

  else if (action === "jump") {
    const q = Math.abs(Math.sin(p*Math.PI));
    charX = interpolate(p,[0,1],[200,destX-130]);
    charY = groundY-q*320;
    charScale = 1+q*.1;
    armsUp = true;
    legPhase = f/1.9;
    tilt = Math.sin(f/7)*5;
    particlesEl = <Particles cx={charX} cy={charY+75} seedBase={Math.floor(f/3)} color={t.accent} life={.6} count={12} spread={140} />;
  }

  else if (action === "fall") {
    const q = easeInOut(p);
    charX = interpolate(q,[0,1],[420,560]);
    charY = groundY-270*(1-q);
    tilt = q*88;
    charScale = 1-q*.08;
    particlesEl = <Particles cx={charX} cy={charY+70} seedBase={Math.floor(f/2)} color="#fff" life={.5} count={10} spread={110} />;
  }

  else if (action === "climb") {
    const q = easeInOut(p);
    charX = interpolate(q,[0,1],[130,destX-140]);
    charY = interpolate(q,[0,1],[groundY,destY+120])-Math.abs(Math.sin(f/2.3))*18;
    legPhase = f/1.8;
    tilt = Math.sin(f/8)*5;
    particlesEl = <Particles cx={charX-15} cy={charY+65} seedBase={Math.floor(f/4)} color={t.text} life={.3} count={3} spread={30} />;
    destGlow = p>.82 ? 1 : 0;
  }

  else if (action === "think") {
    charX = 540;
    charY = groundY-35-Math.abs(Math.sin(f/17))*10;
    pose = "point";
    const bubbleY = 620-Math.sin(f/18)*18;
    extraEl = <g>
      <circle cx={540} cy={bubbleY} r={118} fill={hexToRgba(t.text,.08)} stroke={hexToRgba(t.accent,.65)} strokeWidth={4} />
      <circle cx={445} cy={bubbleY+110} r={15} fill={hexToRgba(t.text,.3)} />
      <circle cx={415} cy={bubbleY+138} r={8} fill={hexToRgba(t.text,.2)} />
      <DestinationIcon kind={destination} x={540} y={bubbleY} theme={t} glow={1} scale={.5} />
    </g>;
  }

  else if (action === "celebrate") {
    const q = Math.abs(Math.sin((f/32)*Math.PI));
    charX = 540;
    charY = groundY-q*115;
    armsUp = true;
    legPhase = f/1.7;
    tilt = Math.sin(f/8)*5;
    particlesEl = <>
      <Particles cx={540} cy={groundY-230} seedBase={Math.floor(f/2)} color={t.accent} life={(f%38)/38} count={22} spread={270} />
      <Particles cx={540} cy={groundY-300} seedBase={Math.floor(f/3)+20} color="#ffd76a" life={(f%44)/44} count={12} spread={220} />
    </>;
    destGlow = 1;
  }

  else if (action === "search") {
    charX = 540+Math.sin((f/58)*Math.PI*2)*175;
    charY = groundY-20;
    pose = "point";
    legPhase = f/5;
    extraEl = <g>
      <circle cx={charX+60} cy={charY-115} r={48} fill="none" stroke={t.accent} strokeWidth={13} opacity={.8} />
      <line x1={charX+94} y1={charY-82} x2={charX+128} y2={charY-48} stroke={t.accent} strokeWidth={13} strokeLinecap="round" />
    </g>;
  }

  else if (action === "sleep") {
    charX = 540;
    charY = groundY-55;
    charScale = 1.15;
    pose = "sleep";
    extraEl = <g>
      <rect x={320} y={groundY-8} width={440} height={95} rx={48} fill={hexToRgba(t.text,.10)} />
      <text x={720} y={groundY-180} fontSize={74} fontWeight="800" fill={t.text} opacity=".8">Z</text>
      <text x={790} y={groundY-255} fontSize={52} fontWeight="800" fill={t.accent} opacity=".65">Z</text>
      <text x={840} y={groundY-315} fontSize={34} fill={t.text} opacity=".5">Z</text>
    </g>;
  }

  else if (action === "laugh") {
    charX = 540;
    charY = groundY-Math.abs(Math.sin(f/10))*18;
    pose = "laugh";
    armsUp = true;
    legPhase = f/4;
    particlesEl = <Particles cx={540} cy={groundY-230} seedBase={Math.floor(f/4)} color={t.accent} life={.55} count={12} spread={190} />;
  }

  else if (action === "cry") {
    charX = 540;
    charY = groundY-20;
    pose = "cry";
    extraEl = <g>
      <line x1={470} y1={groundY-105} x2={455} y2={groundY+30} stroke="#74c8ff" strokeWidth={7} strokeLinecap="round" opacity=".75" />
      <line x1={610} y1={groundY-105} x2={625} y2={groundY+20} stroke="#74c8ff" strokeWidth={7} strokeLinecap="round" opacity=".75" />
    </g>;
  }

  else if (action === "point") {
    charX = 430;
    charY = groundY-15;
    pose = "point";
    tilt = -4;
    destGlow = 1;
  }

  else if (action === "hold") {
    charX = 540;
    charY = groundY-15;
    pose = "hold";
  }

  else if (action === "open") {
    charX = 420;
    charY = groundY-15;
    pose = "hold";
    const door = interpolate(easeInOut(p),[0,1],[0,125]);
    extraEl = <g>
      <rect x={680} y={groundY-305} width={180} height={305} rx={8} fill={hexToRgba(t.text,.10)} stroke={hexToRgba(t.text,.35)} strokeWidth={5} />
      <rect x={680-door} y={groundY-305} width={180} height={305} rx={8} fill={hexToRgba(t.accent,.25)} stroke={t.accent} strokeWidth={5} />
      <circle cx={835-door} cy={groundY-153} r={8} fill="#ffd76a" />
      {p>.45 && <DestinationIcon kind={destination} x={575} y={groundY-170} theme={t} glow={1} scale={.55} />}
    </g>;
  }

  else if (action === "throw") {
    charX = 420;
    charY = groundY-15;
    pose = "point";
    const q = easeInOut(p);
    const tx = interpolate(q,[0,1],[500,destX]);
    const ty = groundY-180-Math.sin(q*Math.PI)*360;
    extraEl = <g>
      <circle cx={tx} cy={ty} r={28+8*Math.sin(f/6)} fill={t.accent} />
      <circle cx={tx-9} cy={ty-9} r={8} fill="#fff" opacity=".7" />
      {q>.65 && <DestinationIcon kind={destination} x={destX} y={destY} theme={t} glow={q} scale={.8} />}
    </g>;
  }

  const ambientX = 160+Math.sin(f/37+sceneIndex)*70;
  const ambientY = 500+Math.cos(f/43+sceneIndex)*90;
  const ambient2X = 900+Math.cos(f/41+sceneIndex)*75;
  const ambient2Y = 980+Math.sin(f/35+sceneIndex)*80;

  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{position:"absolute",inset:0}}>
        {showStars && <StarField frame={f} />}

        <circle cx={ambientX} cy={ambientY} r={18+8*Math.sin(f/12)} fill={t.accent} opacity=".24" />
        <circle cx={ambient2X} cy={ambient2Y} r={13+6*Math.cos(f/15)} fill={t.text} opacity=".16" />

        <ellipse cx={540} cy={groundY+105} rx={470} ry={48} fill={hexToRgba(t.text,.045)} />

        {destination !== "none" && (
          <DestinationIcon
            kind={destination}
            x={destX}
            y={destY}
            theme={t}
            glow={destGlow}
            scale={1+Math.sin(f/25)*.025}
            rotation={Math.sin(f/30)*1.5}
          />
        )}

        {extraEl}
        {particlesEl}
        {vehicleEl}

        {charVisible && (
          <Character
            x={charX}
            y={charY}
            scale={charScale}
            facing={1}
            legPhase={legPhase}
            armsUp={armsUp}
            accent={t.text === "#ffffff" ? t.accent : t.text}
            pose={pose}
            tilt={tilt}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: Scene; t: Theme; sceneIndex: number }> = ({ s, t, sceneIndex }) => {
  switch (s.template) {
    case "bullet-reveal": return <Bullets s={s} t={t} />;
    case "big-number": return <BigNumber s={s} t={t} />;
    case "quote": return <Quote s={s} t={t} />;
    case "story": return <Story s={s} t={t} duration={s.duration} sceneIndex={sceneIndex} />;
    default: return <Title s={s} t={t} />;
  }
};

// ---------- Captions: fixed zone, controlled, karaoke highlight ----------
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
                transform: `translateY(${active ? -4 * Math.min(1, wp) : 0}px) scale(${active ? 0.94 + 0.14 * Math.min(1, wp) : 1})`,
                transition: "color 0.1s",
              }}>{clean(w.word)}</span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Progress bar ----------
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
          <SceneWrap duration={s.duration}><SceneView s={s} t={theme} sceneIndex={i} /></SceneWrap>
        </Sequence>
      ))}
      <Captions words={words} t={theme} />
      <ProgressBar theme={theme} totalFrames={totalFrames} />
      {words.length > 0 && <Audio src={staticFile("voiceover.wav")} />}
      {hasMusic && <Audio src={staticFile("music.mp3")} volume={0.07} loop />}
    </AbsoluteFill>
  );
};
