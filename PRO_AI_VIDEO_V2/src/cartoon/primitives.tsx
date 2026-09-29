import React from "react";
import type { CharacterAction, EnvironmentKind, ObjectType, Theme } from "../types";

export const Character: React.FC<{
  x: number; y: number; scale: number; color: string; action: CharacterAction; seed: number; frame: number;
}> = ({ x, y, scale, color, action, seed, frame }) => {
  const phase = seed * 0.63;
  const t = frame;
  const walk = Math.sin(t * 0.28 + phase) * (action === "run" ? 30 : 17);
  const bob = Math.abs(Math.sin(t * 0.16 + phase)) * (action === "jump" ? 0 : 7);
  const jump = action === "jump" ? Math.abs(Math.sin(t * 0.105 + phase)) * 90 : 0;
  const fall = action === "fall" ? 65 : 0;
  const tilt = action === "fall" ? Math.sin(t * 0.12) * 30 : action === "run" ? Math.sin(t * 0.18) * 4 : 0;
  const armsUp = action === "celebrate" || action === "jump";
  const thinking = action === "think";
  const pointing = action === "point" || action === "search";
  const asleep = action === "sleep";

  return (
    <g transform={`translate(${x} ${y - jump + fall}) rotate(${tilt}) scale(${scale})`}>
      <ellipse cx="0" cy="12" rx="62" ry="12" fill="#172033" opacity="0.18" />
      <g transform={`translate(0 ${-bob})`}>
        <circle cx="0" cy="-118" r="43" fill="#f3c7a3" stroke="#1e293b" strokeWidth="7" />
        <path d="M-41-128 Q0-175 41-128 L32-108 L-32-108Z" fill="#263247" />
        {asleep ? <>
          <path d="M-22-119 Q-12-111-2-119" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
          <path d="M5-119 Q15-111 25-119" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
          <path d="M-12-100 Q0-94 12-100" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
        </> : <>
          <circle cx="-14" cy="-120" r="4" fill="#1e293b" />
          <circle cx="14" cy="-120" r="4" fill="#1e293b" />
          {action === "laugh" ? <path d="M-15-102 Q0-87 15-102" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            : action === "cry" ? <path d="M-15-101 Q0-109 15-101" fill="none" stroke="#1e293b" strokeWidth="5" />
            : <path d="M-10-100 Q0-94 10-100" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />}
        </>}

        <rect x="-38" y="-74" width="76" height="92" rx="28" fill={color} stroke="#1e293b" strokeWidth="7" />

        {pointing ? <>
          <line x1="28" y1="-50" x2="90" y2="-88" stroke={color} strokeWidth="15" strokeLinecap="round" />
          <line x1="-28" y1="-48" x2="-57" y2="-4" stroke={color} strokeWidth="15" strokeLinecap="round" />
        </> : thinking ? <>
          <line x1="27" y1="-47" x2="55" y2="-82" stroke={color} strokeWidth="15" strokeLinecap="round" />
          <line x1="-27" y1="-47" x2="-55" y2="-6" stroke={color} strokeWidth="15" strokeLinecap="round" />
        </> : armsUp ? <>
          <line x1="-27" y1="-48" x2="-58" y2="-108" stroke={color} strokeWidth="15" strokeLinecap="round" />
          <line x1="27" y1="-48" x2="58" y2="-108" stroke={color} strokeWidth="15" strokeLinecap="round" />
        </> : <>
          <line x1="-28" y1="-47" x2={-46 + walk} y2="3" stroke={color} strokeWidth="15" strokeLinecap="round" />
          <line x1="28" y1="-47" x2={46 - walk} y2="3" stroke={color} strokeWidth="15" strokeLinecap="round" />
        </>}

        <line x1="-14" y1="18" x2={-26 + walk * 0.45} y2="92" stroke="#263247" strokeWidth="16" strokeLinecap="round" />
        <line x1="14" y1="18" x2={26 - walk * 0.45} y2="92" stroke="#263247" strokeWidth="16" strokeLinecap="round" />
      </g>
    </g>
  );
};


export const ObjectGraphic: React.FC<{
  type: ObjectType; x: number; y: number; scale: number; rotation?: number; accent: string; frame: number; seed: number; motion?: CharacterAction; local?: number; emphasis?: boolean;
}> = ({ type, x, y, scale, rotation = 0, accent, frame, seed, motion, local = 0, emphasis = false }) => {
  const stroke = "#223047";
  const p = Math.max(0, Math.min(1, local));
  const ease = p < 0.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2;
  let mx=0, my=0, mr=rotation, ms=scale;
  if (motion === "react" || motion === "panic") mr += Math.sin(p*Math.PI*4) * (12 + (emphasis ? 8 : 0)) * (1-p);
  if (motion === "discover") ms *= 1 + Math.sin(p*Math.PI)*0.11;
  if (motion === "open") mr += -18 + ease*18;
  if (motion === "search") mx += Math.sin(p*Math.PI)*45;
  if (motion === "build") my -= Math.sin(p*Math.PI)*55;
  if (motion === "celebrate") { my -= Math.sin(p*Math.PI)*45; ms *= 1 + Math.sin(p*Math.PI)*0.10; }
  if (motion === "fall") my += ease*130;
  if (motion === "jump") my -= Math.sin(p*Math.PI)*120;
  return (
    <g transform={`translate(${x + mx} ${y + my}) rotate(${mr}) scale(${ms})`}>
      {type === "phone" && <g><rect x="-62" y="-115" width="124" height="230" rx="24" fill="#263247"/><rect x="-48" y="-88" width="96" height="173" rx="14" fill="#aee0ff"/><circle cx="0" cy="98" r="6" fill="#fff"/><circle cx="32" cy="-54" r="12" fill={accent}/></g>}
      {type === "laptop" && <g><rect x="-130" y="-90" width="260" height="168" rx="14" fill="#263247"/><rect x="-108" y="-68" width="216" height="126" rx="8" fill="#b9e5ff"/><path d="M-158 80 L158 80 L120 116 L-120 116Z" fill="#adb8c6"/></g>}
      {type === "book" && <g><path d="M-122-88 Q-56-115 0-78 L0 108 Q-58 78-122 99Z" fill="#69b9ff" stroke={stroke} strokeWidth="7"/><path d="M0-78 Q56-115 122-88 L122 99 Q58 78 0 108Z" fill="#d6ecff" stroke={stroke} strokeWidth="7"/><line x1="0" y1="-78" x2="0" y2="108" stroke="#fff" strokeWidth="7"/></g>}
      {type === "brain" && <path d="M-20-100 C-92-120-132-58-96-8 C-132 42-82 96-35 72 C-2 126 58 94 50 50 C112 49 128-25 80-50 C90-105 22-124-20-100Z" fill="#ff8fa8" stroke={stroke} strokeWidth="8"/>}
      {type === "coffee" || type === "cup" ? <g><path d="M-70-62 L70-62 L52 88 Q0 112-52 88Z" fill="#d7a16f" stroke={stroke} strokeWidth="8"/><path d="M67-35 Q130-28 98 35 Q85 60 57 50" fill="none" stroke={stroke} strokeWidth="10"/><path d="M-30-90 Q-45-130-20-145 M10-90 Q0-128 20-145" fill="none" stroke="#fff" strokeWidth="7" opacity=".55"/></g> : null}
      {type === "clock" || type === "alarm" ? <g><circle r="100" fill="#f5f7f9" stroke="#8996a7" strokeWidth="10"/><line x1="0" y1="0" x2="0" y2="-58" stroke={stroke} strokeWidth="9" strokeLinecap="round"/><line x1="0" y1="0" x2="44" y2="32" stroke={stroke} strokeWidth="9" strokeLinecap="round"/><circle r="8" fill={accent}/>{type === "alarm" && <><line x1="-54" y1="-93" x2="-82" y2="-126" stroke={stroke} strokeWidth="10"/><line x1="54" y1="-93" x2="82" y2="-126" stroke={stroke} strokeWidth="10"/></>}</g> : null}
      {type === "calendar" && <g><rect x="-108" y="-94" width="216" height="196" rx="18" fill="#fff" stroke={stroke} strokeWidth="8"/><rect x="-108" y="-94" width="216" height="52" rx="18" fill={accent}/>{[-58,0,58].flatMap((cx) => [0,50].map((cy)=><rect key={`${cx}-${cy}`} x={cx-13} y={cy-5} width="26" height="26" rx="5" fill="#b8c3cf"/>))}</g>}
      {type === "mail" || type === "notification" ? <g><rect x="-122" y="-84" width="244" height="168" rx="20" fill="#fff" stroke={stroke} strokeWidth="8"/><path d="M-110-60 L0 28 L110-60" fill="none" stroke={accent} strokeWidth="9"/>{type === "notification" && <circle cx="90" cy="-72" r="26" fill="#ff5e78"/>}</g> : null}
      {type === "heart" && <path d="M0 112 C-28 72-124 20-124-46 C-124-115-40-136 0-74 C40-136 124-115 124-46 C124 20 28 72 0 112Z" fill="#ff668c" stroke={stroke} strokeWidth="8"/>}
      {type === "money" && <g><rect x="-132" y="-82" width="264" height="164" rx="20" fill="#73d495" stroke={stroke} strokeWidth="8"/><circle r="46" fill="#c8f4d2"/><text y="20" textAnchor="middle" fontSize="62" fontWeight="900" fill="#2d7c4d">$</text></g>}
      {type === "chart" && <g><line x1="-126" y1="96" x2="-126" y2="-110" stroke={stroke} strokeWidth="8"/><line x1="-126" y1="96" x2="135" y2="96" stroke={stroke} strokeWidth="8"/><path d="M-110 55 L-35 15 L18 36 L106-74" fill="none" stroke={accent} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/><circle cx="106" cy="-74" r="13" fill={accent}/></g>}
      {type === "check" && <g><circle r="88" fill="#7cdd94"/><path d="M-48 5 L-10 42 L58-44" fill="none" stroke="#fff" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/></g>}
      {type === "warning" && <g><path d="M0-112 L126 98 L-126 98Z" fill="#ffd66e" stroke={stroke} strokeWidth="8"/><rect x="-8" y="-48" width="16" height="78" rx="8" fill={stroke}/><circle cy="62" r="10" fill={stroke}/></g>}
      {type === "lightbulb" && <g><circle cy="-36" r="70" fill="#ffe17d" stroke={stroke} strokeWidth="8"/><rect x="-24" y="36" width="48" height="46" rx="8" fill="#8e98a7"/>{[0,60,120,180,240,300].map((d)=><line key={d} x1={Math.cos(d*Math.PI/180)*98} y1={-36+Math.sin(d*Math.PI/180)*98} x2={Math.cos(d*Math.PI/180)*132} y2={-36+Math.sin(d*Math.PI/180)*132} stroke="#ffe17d" strokeWidth="9" strokeLinecap="round"/>)}</g>}
      {type === "rocket" && <g transform="rotate(-34)"><path d="M0-142 C72-90 72 34 0 92 C-72 34-72-90 0-142Z" fill="#edf0f4" stroke={stroke} strokeWidth="8"/><circle cy="-43" r="26" fill="#87d0ff"/><path d="M-62 30 L-102 70 L-56 80 M62 30 L102 70 L56 80" fill={accent}/><path d="M-28 88 L0 154 L28 88" fill="#ff9c4e"/></g>}
      {type === "car" && <g><rect x="-150" y="-42" width="300" height="92" rx="35" fill={accent} stroke={stroke} strokeWidth="8"/><path d="M-84-42 L-34-98 L60-98 L102-42Z" fill="#bfe6ff" stroke={stroke} strokeWidth="8"/><circle cx="-90" cy="58" r="30" fill={stroke}/><circle cx="90" cy="58" r="30" fill={stroke}/></g>}
      {type === "bike" && <g fill="none" stroke={stroke} strokeWidth="10"><circle cx="-70" cy="70" r="44"/><circle cx="70" cy="70" r="44"/><path d="M-70 70 L-18-5 L18 70 L70 70 L0-5 L-18-5"/><line x1="0" y1="-5" x2="34" y2="-40"/></g>}
      {type === "house" && <g><path d="M-140 0 L0-126 L140 0Z" fill="#ff8c70" stroke={stroke} strokeWidth="8"/><rect x="-108" y="0" width="216" height="138" fill="#efd5a7" stroke={stroke} strokeWidth="8"/><rect x="-25" y="64" width="50" height="74" fill="#6d7784"/><rect x="-78" y="25" width="50" height="50" fill="#9ddcff"/><rect x="28" y="25" width="50" height="50" fill="#9ddcff"/></g>}
      {type === "desk" && <g><rect x="-170" y="-26" width="340" height="44" rx="18" fill="#92735a"/><rect x="-145" y="18" width="24" height="126" fill="#6e5847"/><rect x="121" y="18" width="24" height="126" fill="#6e5847"/></g>}
      {type === "bed" && <g><rect x="-180" y="-8" width="360" height="100" rx="26" fill="#62748a" stroke={stroke} strokeWidth="8"/><rect x="-150" y="-76" width="132" height="76" rx="20" fill="#dce5ed"/><rect x="18" y="-76" width="132" height="76" rx="20" fill="#dce5ed"/></g>}
      {type === "dumbbell" && <g stroke={stroke} strokeWidth="10"><rect x="-15" y="-10" width="30" height="20" fill={accent}/><rect x="-95" y="-48" width="30" height="96" rx="10" fill="#7f8995"/><rect x="65" y="-48" width="30" height="96" rx="10" fill="#7f8995"/></g>}
      {type === "trophy" && <g><path d="M-58-88 L58-88 L40 22 Q0 80-40 22Z" fill="#ffd66e" stroke={stroke} strokeWidth="8"/><path d="M-58-62 Q-126-62-108 5 Q-96 38-42 32 M58-62 Q126-62 108 5 Q96 38 42 32" fill="none" stroke="#ffd66e" strokeWidth="16"/><rect x="-14" y="70" width="28" height="38" fill="#ffd66e"/><rect x="-70" y="108" width="140" height="20" rx="8" fill="#ffd66e"/></g>}
      {type === "gift" && <g><rect x="-110" y="-30" width="220" height="140" rx="14" fill="#ff6e92" stroke={stroke} strokeWidth="8"/><rect x="-122" y="-68" width="244" height="46" rx="11" fill="#ff8aaa" stroke={stroke} strokeWidth="8"/><rect x="-20" y="-68" width="40" height="178" fill="#ffd66e"/></g>}
      {type === "cloud" && <g fill="#edf6ff" stroke={stroke} strokeWidth="7"><circle cx="-62" cy="24" r="54"/><circle cx="0" cy="-5" r="80"/><circle cx="70" cy="24" r="58"/><rect x="-108" y="20" width="216" height="66" rx="32"/></g>}
      {type === "sun" && <g><circle r="74" fill="#ffd66e" stroke={stroke} strokeWidth="7"/>{[0,45,90,135,180,225,270,315].map((d)=><line key={d} x1={Math.cos(d*Math.PI/180)*104} y1={Math.sin(d*Math.PI/180)*104} x2={Math.cos(d*Math.PI/180)*140} y2={Math.sin(d*Math.PI/180)*140} stroke="#ffd66e" strokeWidth="10" strokeLinecap="round"/>)}</g>}
      {type === "moon" && <path d="M48-120 C-55-94-90 15-25 84 C18 126 82 110 112 62 C34 76-18 6 3-58 C14-88 30-103 48-120Z" fill="#dde3ea" stroke={stroke} strokeWidth="8"/>}
      {type === "star" && <path d="M0-118 L30-38 L112-38 L46 16 L70 99 L0 50 L-70 99 L-46 16 L-112-38 L-30-38Z" fill="#ffd66e" stroke={stroke} strokeWidth="8"/>}
      {type === "door" && <g><rect x="-92" y="-150" width="184" height="300" rx="10" fill="#a87855" stroke={stroke} strokeWidth="8"/><circle cx="60" cy="0" r="9" fill="#ffd66e"/></g>}
      {type === "plant" && <g><rect x="-42" y="50" width="84" height="62" rx="10" fill="#c98d62" stroke={stroke} strokeWidth="8"/><path d="M0 50 C-25-40-65-58-78-30 M0 45 C18-55 60-72 76-38 M0 40 C0-72 28-104 42-108" fill="none" stroke="#5f9e68" strokeWidth="18" strokeLinecap="round"/></g>}
      {type === "chair" && <g stroke={stroke} strokeWidth="10" strokeLinecap="round"><rect x="-74" y="-88" width="148" height="110" rx="20" fill="#8795a9"/><line x1="-56" y1="22" x2="-65" y2="108"/><line x1="56" y1="22" x2="65" y2="108"/></g>}
      {type === "bag" && <g><path d="M-90-44 Q-90-106 0-106 Q90-106 90-44" fill="none" stroke={stroke} strokeWidth="12"/><rect x="-108" y="-44" width="216" height="160" rx="24" fill={accent} stroke={stroke} strokeWidth="8"/></g>}
      {type === "headphones" && <g fill="none" stroke={stroke} strokeWidth="16"><path d="M-76 8 Q-76-102 0-102 Q76-102 76 8"/><rect x="-95" y="-4" width="34" height="76" rx="14" fill={accent}/><rect x="61" y="-4" width="34" height="76" rx="14" fill={accent}/></g>}
      {type === "key" && <g stroke={stroke} strokeWidth="11" fill="none"><circle cx="-52" r="46"/><line x1="-10" x2="122"/><line x1="78" x2="78" y1="0" y2="40"/><line x1="105" x2="105" y1="0" y2="26"/></g>}
      {type === "ball" && <circle r="74" fill={accent} stroke={stroke} strokeWidth="8"/>}
      {type === "box" && <g><rect x="-115" y="-95" width="230" height="190" rx="12" fill="#d5a56f" stroke={stroke} strokeWidth="8"/><path d="M-115-18 L0-58 L115-18" fill="none" stroke={stroke} strokeWidth="8"/></g>}
      {type === "tree" && <g><rect x="-18" y="18" width="36" height="130" fill="#80674e"/><circle cx="0" cy="-50" r="104" fill="#69ab70" stroke={stroke} strokeWidth="8"/></g>}
      {type === "food" && <g><ellipse cx="0" cy="42" rx="120" ry="30" fill="#fff" stroke={stroke} strokeWidth="7"/><circle cx="-42" cy="8" r="30" fill="#ef7f6b"/><circle cx="12" cy="-2" r="32" fill="#f4c46c"/><circle cx="56" cy="15" r="28" fill="#7fc87f"/></g>}
      {type === "magnifier" && <g fill="none" stroke={stroke} strokeWidth="12"><circle cx="-22" cy="-22" r="72"/><line x1="30" y1="30" x2="92" y2="92" stroke={accent}/></g>}
      {type === "paper" && <g><rect x="-92" y="-120" width="184" height="240" fill="#fff" stroke={stroke} strokeWidth="8"/><line x1="-54" y1="-50" x2="54" y2="-50" stroke="#9ba7b5" strokeWidth="10"/><line x1="-54" y1="-8" x2="35" y2="-8" stroke="#9ba7b5" strokeWidth="10"/><line x1="-54" y1="34" x2="54" y2="34" stroke="#9ba7b5" strokeWidth="10"/></g>}
      {type === "map" && <g><path d="M-130-90 L-40-120 L45-90 L130-120 L130 90 L45 120 L-40 90 L-130 120Z" fill="#a9d6a2" stroke={stroke} strokeWidth="8"/><path d="M-40-120 L-40 90 M45-90 L45 120" stroke="#7a8b9b" strokeWidth="8"/></g>}
      {type === "pencil" && <g transform="rotate(-22)"><rect x="-130" y="-18" width="210" height="36" rx="12" fill="#ffd36f" stroke={stroke} strokeWidth="7"/><path d="M80-18 L124 0 L80 18Z" fill="#f4c7a3" stroke={stroke} strokeWidth="7"/></g>}
      {type === "medal" && <g><path d="M-54-115 L0-28 L54-115" fill={accent} stroke={stroke} strokeWidth="8"/><circle cy="36" r="66" fill="#ffd66e" stroke={stroke} strokeWidth="8"/></g>}
    </g>
  );
};

export const Environment: React.FC<{ kind: EnvironmentKind; theme: Theme; frame: number }> = ({ kind, theme, frame }) => {
  const drift = Math.sin(frame * 0.012) * 18;
  const bg = theme.background;
  if (kind === "bedroom") return <g><rect width="1080" height="1920" fill="#182235"/><circle cx="860" cy="260" r="110" fill="#f5efc5"/><rect y="1200" width="1080" height="720" fill="#2b3547"/><rect x="130" y="920" width="820" height="350" rx="55" fill="#64738a"/><rect x="170" y="820" width="280" height="155" rx="28" fill="#dce4eb"/><rect x="630" y="820" width="280" height="155" rx="28" fill="#dce4eb"/><circle cx={180 + drift} cy="340" r="5" fill="#fff"/><circle cx={320 - drift} cy="490" r="4" fill="#fff"/><circle cx={760 + drift} cy="430" r="5" fill="#fff"/></g>;
  if (kind === "office") return <g><rect width="1080" height="1920" fill="#dce7ee"/><rect y="1100" width="1080" height="820" fill="#c8d2db"/><rect x="85" y="220" width="910" height="520" rx="36" fill="#b9e4f5" stroke="#687687" strokeWidth="10"/><rect x="110" y="980" width="860" height="54" rx="25" fill="#8a97a5"/><rect x="130" y="1030" width="35" height="190" fill="#707b88"/><rect x="915" y="1030" width="35" height="190" fill="#707b88"/><rect x="735" y="830" width="160" height="120" rx="20" fill="#f0f4f6" stroke="#7e8995" strokeWidth="7"/></g>;
  if (kind === "kitchen") return <g><rect width="1080" height="1920" fill="#f1dfd1"/><rect y="1250" width="1080" height="670" fill="#caa98a"/><rect x="100" y="420" width="880" height="230" rx="24" fill="#f5f6f7" stroke="#7f8b97" strokeWidth="8"/><rect x="120" y="740" width="840" height="80" fill="#7e8a96"/><rect x="150" y="900" width="780" height="250" rx="24" fill="#eceff2" stroke="#8a9299" strokeWidth="8"/><circle cx="290" cy="1020" r="62" fill="#444e5a"/><circle cx="540" cy="1020" r="62" fill="#444e5a"/><circle cx="790" cy="1020" r="62" fill="#444e5a"/></g>;
  if (kind === "school") return <g><rect width="1080" height="1920" fill="#f3efe5"/><rect y="1190" width="1080" height="730" fill="#d3bea4"/><rect x="90" y="250" width="900" height="520" fill="#e6d5b8" stroke="#5d6670" strokeWidth="10"/><rect x="170" y="345" width="740" height="300" fill="#465362"/><rect x="190" y="835" width="700" height="40" rx="18" fill="#7f664d"/><circle cx="280" cy="980" r="58" fill="#76c7ff"/><circle cx="540" cy="980" r="58" fill="#ff91aa"/><circle cx="800" cy="980" r="58" fill="#8ee18f"/></g>;
  if (kind === "lab") return <g><rect width="1080" height="1920" fill="#d9edf0"/><rect y="1230" width="1080" height="690" fill="#aab9bf"/><rect x="120" y="830" width="840" height="60" rx="22" fill="#6f7e87"/><rect x="160" y="890" width="44" height="280" fill="#61717a"/><rect x="876" y="890" width="44" height="280" fill="#61717a"/><rect x="260" y="400" width="150" height="260" rx="24" fill="#f4f6f8" stroke="#65717b" strokeWidth="8"/><rect x="665" y="400" width="150" height="260" rx="24" fill="#f4f6f8" stroke="#65717b" strokeWidth="8"/><circle cx="335" cy="540" r="70" fill="#9de6cb" opacity=".85"/><circle cx="740" cy="520" r="75" fill="#aad3ff" opacity=".85"/></g>;
  if (kind === "gym") return <g><rect width="1080" height="1920" fill="#1c2532"/><rect y="1200" width="1080" height="720" fill="#353f4d"/><rect x="90" y="300" width="900" height="40" fill="#8998a8"/><rect x="170" y="340" width="30" height="700" fill="#8998a8"/><rect x="880" y="340" width="30" height="700" fill="#8998a8"/><circle cx="300" cy="930" r="82" fill="#46505e"/><circle cx="780" cy="930" r="82" fill="#46505e"/><rect x="200" y="1030" width="600" height="35" rx="15" fill={theme.accent}/></g>;
  if (kind === "street" || kind === "city") return <g><rect width="1080" height="1920" fill="#cfe8f4"/><circle cx="850" cy="280" r="105" fill="#ffd66e"/><rect y="1080" width="1080" height="840" fill="#6e7986"/><rect y="1200" width="1080" height="48" fill="#e5e9ec"/><rect y="1330" width="1080" height="48" fill="#e5e9ec"/>{[70,285,500,715,930].map((x,i)=><rect key={i} x={x} y={500-(i%2)*100} width="160" height={580+(i%2)*90} fill={i%2 ? "#64707d" : "#55616e"}/>)}</g>;
  if (kind === "nature") return <g><rect width="1080" height="1920" fill="#bfe6ef"/><circle cx="850" cy="260" r="110" fill="#ffd66e"/><path d="M0 1260 L260 790 L520 1260 L790 730 L1080 1260Z" fill="#789f82"/><path d="M0 1320 Q260 1180 560 1320 T1080 1290 L1080 1920 L0 1920Z" fill="#87bc79"/><circle cx={180+drift} cy="970" r="76" fill="#60925f"/><rect x={171+drift} y="970" width="18" height="220" fill="#7b644d"/></g>;
  if (kind === "space") return <g><rect width="1080" height="1920" fill="#070c18"/>{Array.from({length:55}).map((_,i)=><circle key={i} cx={(i*149)%1080} cy={(i*293)%1200} r={1+(i%3)} fill="#fff" opacity={0.35+0.4*Math.abs(Math.sin(frame*0.03+i))}/>)}</g>;
  if (kind === "workshop") return <g><rect width="1080" height="1920" fill="#ded4c7"/><rect y="1180" width="1080" height="740" fill="#8e7764"/><rect x="110" y="420" width="860" height="530" rx="30" fill="#b3bec6" stroke="#5d6670" strokeWidth="10"/><rect x="150" y="980" width="780" height="58" rx="22" fill="#6e5847"/><rect x="190" y="1038" width="35" height="190" fill="#5c493b"/><rect x="855" y="1038" width="35" height="190" fill="#5c493b"/></g>;
  return <g><rect width="1080" height="1920" fill={bg}/><circle cx={180+drift} cy={430} r="180" fill={theme.accent} opacity=".14"/><circle cx={860-drift} cy={1080} r="250" fill="#fff" opacity=".05"/><path d="M0 1450 Q260 1300 540 1450 T1080 1450 L1080 1920 L0 1920Z" fill="#000" opacity=".08"/></g>;
};

export const Burst: React.FC<{ x: number; y: number; color: string; frame: number; intensity?: number }> = ({ x, y, color, frame, intensity = 1 }) => {
  const life = (frame % 30) / 30;
  return <g opacity={1-life}>
    {Array.from({length:14}).map((_,i)=>{const a=(Math.PI*2*i)/14; const r=50+life*190*intensity; return <circle key={i} cx={x+Math.cos(a)*r} cy={y+Math.sin(a)*r} r={4+intensity*2} fill={color}/>;})}
  </g>;
};
