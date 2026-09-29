import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { Scene, ShortProps, Theme, Word } from "./types";
import { CartoonStory } from "./cartoon/CartoonStory";
export type { Scene, ShortProps, Theme, Word } from "./types";

const clean=(s:string|undefined|null)=>(s||"").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\uFE0F]/gu,"").replace(/\s+/g," ").trim();
const hexToRgba=(hex:string,a:number)=>{const h=hex.replace("#","");const n=h.length===3?h.split("").map(c=>c+c).join(""):h.padEnd(6,"0");const r=parseInt(n.slice(0,2),16)||0,g=parseInt(n.slice(2,4),16)||0,b=parseInt(n.slice(4,6),16)||0;return `rgba(${r},${g},${b},${a})`;};

const Background:React.FC<{theme:Theme;frame:number}>=({theme,frame})=>{
  const drift=Math.sin(frame/90)*2.5;
  return <AbsoluteFill style={{background:theme.background,overflow:"hidden"}}>
    <div style={{position:"absolute",inset:"-10%",background:`radial-gradient(circle at ${20+drift}% 24%, ${hexToRgba(theme.accent,.20)}, transparent 33%), radial-gradient(circle at ${82-drift}% 78%, ${hexToRgba(theme.accent2||theme.accent,.14)}, transparent 35%)`}}/>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.48) 100%)"}}/>
  </AbsoluteFill>;
};

const Headline:React.FC<{text:string;theme:Theme}>=({text,theme})=>{
  const f=useCurrentFrame();
  const p=spring({frame:f,fps:30,config:{damping:18,stiffness:120}});
  const words=clean(text).split(" ").filter(Boolean); const mid=Math.ceil(words.length/2); const a=words.slice(0,mid).join(" "),b=words.slice(mid).join(" ");
  return <div style={{position:"absolute",top:115,left:60,right:60,textAlign:"center",fontFamily:'Inter,Arial,sans-serif',fontWeight:900,fontSize:62,lineHeight:1.04,letterSpacing:-1.8,color:theme.text,transform:`translateY(${(1-p)*-24}px)`,opacity:p,textShadow:"0 5px 24px rgba(0,0,0,.3)",pointerEvents:"none"}}>
    <div>{a}</div>{b?<div style={{color:theme.accent}}>{b}</div>:null}
  </div>;
};

const Captions:React.FC<{words:Word[];theme:Theme}>=({words,theme})=>{
  const f=useCurrentFrame(); if(!words.length)return null;
  if(f < words[0].start) return null;
  const found=words.findIndex(w=>f>=w.start&&f<=w.end+4);
  const idx=found<0?Math.max(0,words.length-1):found; const chunkSize=4; const start=Math.floor(idx/chunkSize)*chunkSize; const chunk=words.slice(start,start+chunkSize); const active=idx-start;
  return <AbsoluteFill style={{justifyContent:"flex-end",alignItems:"center",paddingBottom:220,pointerEvents:"none"}}>
    <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:12,maxWidth:900,padding:"18px 24px",borderRadius:24,background:"rgba(0,0,0,.48)",backdropFilter:"blur(12px)",fontFamily:'Inter,Arial,sans-serif'}}>
      {chunk.map((w,i)=>{const on=i===active; const p=spring({frame:f-w.start,fps:30,config:{damping:15,stiffness:200}});return <span key={start+i} style={{fontSize:55,fontWeight:900,textTransform:"uppercase",color:on?theme.accent:"#fff",transform:`translateY(${on?-5*Math.min(1,p):0}px) scale(${on?1.08:1})`,textShadow:"0 3px 12px rgba(0,0,0,.4)"}}>{clean(w.word)}</span>})}
    </div>
  </AbsoluteFill>;
};

const Progress:React.FC<{theme:Theme;totalFrames:number}>=({theme,totalFrames})=>{const f=useCurrentFrame();return <div style={{position:"absolute",top:0,left:0,right:0,height:7,background:"rgba(255,255,255,.1)"}}><div style={{height:"100%",width:`${Math.min(100,(f/Math.max(1,totalFrames))*100)}%`,background:theme.accent,boxShadow:`0 0 16px ${hexToRgba(theme.accent,.85)}`}}/></div>};

export const Short:React.FC<ShortProps>=({theme,scenes,words,totalFrames,hasMusic})=>{
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <AbsoluteFill>
    <Background theme={theme} frame={frame}/>
    {scenes.map((s,i)=><Sequence key={i} from={s.from} durationInFrames={s.duration}><CartoonStory scene={s} theme={theme} sceneIndex={i}/><Headline text={s.text} theme={theme}/></Sequence>)}
    <Captions words={words} theme={theme}/>
    <Progress theme={theme} totalFrames={totalFrames}/>
    {words.length>0?<Audio src={staticFile("voiceover.wav")}/>:null}
    {hasMusic?<Audio src={staticFile("music.mp3")} volume={0.06} loop/>:null}
  </AbsoluteFill>;
};
