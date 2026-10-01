import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

type Word = { word: string; start: number; end: number };
type Theme = { background: string; accent: string; text: string };

export type SubmarineDescentProps = {
  sceneFrom: number;
  duration: number;
  words: Word[];
  theme: Theme;
};

const W = 1080;
const H = 1920;

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const hexToRgb = (h: string): [number, number, number] => {
  const n = (h || "#000000").replace("#", "");
  const s = n.length === 3 ? n.split("").map((c) => c + c).join("") : n.padEnd(6, "0");
  return [
    parseInt(s.slice(0, 2), 16) || 0,
    parseInt(s.slice(2, 4), 16) || 0,
    parseInt(s.slice(4, 6), 16) || 0,
  ];
};

const lerpColor = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
};

const Submarine: React.FC<{ bob: number; spin: number; accent: string }> = ({ bob, spin, accent }) => (
  <g transform={`translate(0 ${bob})`}>
    <path d="M 548 130 L 1080 30 L 1080 270 L 548 170 Z" fill="url(#beam)" opacity={0.45} />
    <path
      d="M 50 150 Q 50 88 150 82 L 450 82 Q 520 88 550 118 Q 560 150 550 182 Q 520 212 450 218 L 150 218 Q 50 212 50 150 Z"
      fill="#1a2e42" stroke="#4a6a8a" strokeWidth={3}
    />
    <path d="M 80 100 Q 150 90 300 90 L 450 92" fill="none" stroke="#7a9aba" strokeWidth={2} opacity={0.5} />
    <path d="M 80 200 Q 150 210 300 210 L 450 208" fill="none" stroke="#2a4a6a" strokeWidth={2} opacity={0.8} />
    <path d="M 240 85 L 240 20 L 330 20 L 330 85 Z" fill="#1a2e42" stroke="#4a6a8a" strokeWidth={3} />
    <line x1={285} y1={20} x2={285} y2={-10} stroke="#4a6a8a" strokeWidth={3} />
    <line x1={285} y1={-10} x2={305} y2={-10} stroke="#4a6a8a" strokeWidth={3} />
    <rect x={260} y={42} width={50} height={20} rx={4} fill="#0a1218" stroke="#4a6a8a" strokeWidth={1.5} />
    {[140, 220, 300, 380, 460].map((x, i) => (
      <g key={i}>
        <circle cx={x} cy={150} r={16} fill="#0a1218" stroke="#5a7a95" strokeWidth={2.5} />
        <circle cx={x} cy={150} r={9} fill={accent} opacity={0.8} />
      </g>
    ))}
    <path d="M 440 85 L 470 40 L 500 85 Z" fill="#1a2e42" stroke="#4a6a8a" strokeWidth={2} />
    <path d="M 440 215 L 470 260 L 500 215 Z" fill="#1a2e42" stroke="#4a6a8a" strokeWidth={2} />
    <path d="M 50 150 L 10 110 L 40 150 Z" fill="#1a2e42" stroke="#4a6a8a" strokeWidth={2} />
    <path d="M 50 150 L 10 190 L 40 150 Z" fill="#1a2e42" stroke="#4a6a8a" strokeWidth={2} />
    <g transform={`translate(10 150) rotate(${spin})`}>
      <ellipse cx={0} cy={-22} rx={5} ry={18} fill="#5a7a95" />
      <ellipse cx={19} cy={11} rx={5} ry={18} fill="#5a7a95" transform="rotate(120)" />
      <ellipse cx={-19} cy={11} rx={5} ry={18} fill="#5a7a95" transform="rotate(-120)" />
    </g>
    <circle cx={10} cy={150} r={8} fill="#3a5267" />
    <circle cx={548} cy={150} r={6} fill={accent} />
    <circle cx={548} cy={150} r={12} fill={accent} opacity={0.4} />
  </g>
);

const Jellyfish: React.FC<{ x: number; y: number; scale: number; opacity: number; pulse: number; accent: string }> = ({ x, y, scale, opacity, pulse, accent }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <ellipse rx={70 * (1 + pulse * 0.15)} ry={45 * (1 - pulse * 0.1)} fill="url(#jellyGlow)" />
    <ellipse rx={70 * (1 + pulse * 0.15)} ry={45 * (1 - pulse * 0.1)} fill="none" stroke={accent} strokeWidth={2} opacity={0.7} />
    <path
      d="M -60 10 Q -40 40 -30 100 M -30 10 Q -15 60 -10 120 M 0 10 Q 5 70 10 130 M 30 10 Q 15 60 20 120 M 60 10 Q 40 40 30 100"
      stroke={accent} strokeWidth={2} fill="none" opacity={0.8}
    />
  </g>
);

const GlowFish: React.FC<{ x: number; y: number; opacity: number; accent: string }> = ({ x, y, opacity, accent }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <circle cx={-30} cy={0} r={20} fill="url(#jellyGlow)" opacity={0.6} />
    <path d="M -40 0 Q -10 -20 20 0 Q -10 20 -40 0 Z" fill="#0a1218" stroke={accent} strokeWidth={2} />
    <path d="M 20 0 L 45 -15 L 45 15 Z" fill={accent} opacity={0.8} />
    <circle cx={-40} cy={0} r={4} fill={accent} />
  </g>
);

const Whale: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity * 0.22}>
    <path
      d="M 0 40 C 60 -20 200 -40 340 10 C 400 30 460 40 500 20 L 520 -10 L 510 25 C 490 70 400 90 280 90 C 140 90 40 90 0 40 Z"
      fill="#050f1c"
    />
    <path d="M 120 80 L 150 130 L 180 80 Z" fill="#050f1c" />
  </g>
);

export const SubmarineDescent: React.FC<SubmarineDescentProps> = ({ sceneFrom, duration, words, theme }) => {
  const f = useCurrentFrame();
  const p = Math.max(0, Math.min(1, f / Math.max(1, duration)));

  const sceneWords = useMemo(
    () =>
      words
        .filter((w) => w.start >= sceneFrom && w.start < sceneFrom + duration)
        .map((w) => ({ ...w, localStart: w.start - sceneFrom })),
    [words, sceneFrom, duration]
  );

  const snow = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => ({
        x: rand(i * 1.1) * W,
        baseY: rand(i * 2.3) * H,
        speed: 0.4 + rand(i * 3.7) * 1.2,
        size: 1 + rand(i * 5.1) * 2.5,
        alpha: 0.3 + rand(i * 7.3) * 0.5,
      })),
    []
  );

  const bubbles = useMemo(() => {
    const out: { x: number; y: number; start: number; size: number; color: string }[] = [];
    sceneWords.forEach((w, wi) => {
      const count = 2 + Math.floor(rand(wi * 13.1) * 3);
      for (let i = 0; i < count; i++) {
        out.push({
          x: 640 + (rand(wi * 17.3 + i * 2.1) - 0.5) * 60,
          y: 400 + rand(wi * 19.7 + i * 3.3) * 30,
          start: w.localStart,
          size: 3 + rand(wi * 23.1 + i * 4.7) * 9,
          color: i % 3 === 0 ? theme.accent : "#a8d8ea",
        });
      }
    });
    return out;
  }, [sceneWords, theme.accent]);

  const cameraScale = 1 + p * 0.14;
  const cameraY = -p * 40;

  const waterColor =
    p < 0.4
      ? lerpColor("#1a4a6e", "#0a2138", p / 0.4)
      : lerpColor("#0a2138", "#02030a", (p - 0.4) / 0.6);

  const topLight = Math.max(0, 1 - p / 0.65);

  const subBob = Math.sin(f / 42) * 8;
  const propSpin = f * 9;

  const jelly1 = p > 0.33 && p < 0.62 ? Math.sin(((p - 0.33) / 0.29) * Math.PI) : 0;
  const jelly2 = p > 0.68 && p < 0.95 ? Math.sin(((p - 0.68) / 0.27) * Math.PI) : 0;
  const jellyPulse = Math.sin(f / 25);

  const whaleFade = p > 0.18 && p < 0.42 ? Math.sin(((p - 0.18) / 0.24) * Math.PI) : 0;
  const whaleX = 1400 - p * 2400;

  const fishFade = p > 0.5 && p < 0.75 ? Math.sin(((p - 0.5) / 0.25) * Math.PI) : 0;
  const fishX = 1200 - p * 1800;
  const fishY = 950 + Math.sin(f / 30) * 30;

  const pingActive = p > 0.46 && p < 0.6;
  const pingT = pingActive ? (p - 0.46) / 0.14 : 0;

  const vig = 0.45 + p * 0.4;

  return (
    <AbsoluteFill style={{ background: waterColor, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
          transformOrigin: "50% 55%",
        }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="beam" cx="0" cy="0.5" r="1" fx="0" fy="0.5">
              <stop offset="0%" stopColor={theme.accent} stopOpacity={0.8} />
              <stop offset="60%" stopColor={theme.accent} stopOpacity={0.15} />
              <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
            </radialGradient>
            <radialGradient id="jellyGlow">
              <stop offset="0%" stopColor={theme.accent} stopOpacity={0.9} />
              <stop offset="60%" stopColor={theme.accent} stopOpacity={0.3} />
              <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
            </radialGradient>
          </defs>

          {topLight > 0.01 &&
            [0, 1, 2, 3, 4].map((i) => {
              const x = 100 + i * 220 + Math.sin(f / 120 + i) * 30;
              return (
                <path
                  key={i}
                  d={`M ${x} 0 L ${x + 70} 0 L ${x - 120} ${H * 0.7} L ${x - 190} ${H * 0.7} Z`}
                  fill="#cfe8ff"
                  opacity={0.04 * topLight}
                />
              );
            })}

          {whaleFade > 0.01 && <Whale x={whaleX} y={620} opacity={whaleFade} />}

          {snow.map((s, i) => {
            const y = ((s.baseY - f * s.speed) % H + H) % H;
            return <circle key={i} cx={s.x} cy={y} r={s.size} fill="#c8e0ff" opacity={s.alpha * 0.55} />;
          })}

          {pingActive && (
            <g transform="translate(640 460)">
              <circle r={pingT * 700} fill="none" stroke={theme.accent} strokeWidth={2.5} opacity={(1 - pingT) * 0.9} />
              <circle r={pingT * 450} fill="none" stroke={theme.accent} strokeWidth={1.5} opacity={(1 - pingT) * 0.5} />
            </g>
          )}

          {jelly1 > 0.01 && (
            <Jellyfish x={240} y={720 + Math.sin(f / 50) * 20} scale={1} opacity={jelly1} pulse={jellyPulse} accent={theme.accent} />
          )}
          {jelly2 > 0.01 && (
            <Jellyfish x={820} y={1250 + Math.sin(f / 55) * 18} scale={0.85} opacity={jelly2} pulse={jellyPulse * 0.7} accent={theme.accent} />
          )}

          {fishFade > 0.01 && <GlowFish x={fishX} y={fishY} opacity={fishFade} accent={theme.accent} />}

          <g transform="translate(220 380)">
            <Submarine bob={subBob} spin={propSpin} accent={theme.accent} />
          </g>

          {bubbles.map((b, i) => {
            const age = f - b.start;
            if (age < 0 || age > 100) return null;
            const t = age / 100;
            const op = Math.sin(t * Math.PI) * 0.85;
            const y = b.y - t * 560;
            const wob = Math.sin(age * 0.09 + i * 0.5) * 16;
            return (
              <circle
                key={i}
                cx={b.x + wob}
                cy={y}
                r={b.size * (1 - t * 0.35)}
                fill="none"
                stroke={b.color}
                strokeWidth={1.6}
                opacity={op}
              />
            );
          })}
        </svg>
      </div>

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 52%, transparent 30%, rgba(0,0,0,${vig}) 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export default SubmarineDescent;
