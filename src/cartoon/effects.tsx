import React from "react";
import { interpolate } from "remotion";
import { ping } from "./animations";

export const Burst:React.FC<{x:number;y:number;color:string;frame:number;fps:number;start:number;count?:number;size?:number}> = ({x,y,color,frame,fps,start,count=14,size=9})=>{
  const p=ping(frame,fps,start,.8);
  return <g opacity={p}>
    {Array.from({length:count}).map((_,i)=>{const a=(i/count)*Math.PI*2; const d=interpolate(p,[0,1],[8,150+(i%3)*28]); return <circle key={i} cx={x+Math.cos(a)*d} cy={y+Math.sin(a)*d} r={Math.max(2,size*(1-p))} fill={color}/>;})}
  </g>;
};

export const SpeedLines:React.FC<{x:number;y:number;frame:number;color:string;flip?:boolean}> = ({x,y,frame,color,flip=false})=><g opacity={.12+.12*((frame%18)/18)} transform={`translate(${x} ${y}) scale(${flip?-1:1} 1)`}>
  {[0,1,2,3,4].map(i=><line key={i} x1={0} y1={i*22-44} x2={170-i*18} y2={i*22-44} stroke={color} strokeWidth={5-i*.5} strokeLinecap="round"/>)}
</g>;

export const Confetti:React.FC<{x:number;y:number;frame:number;color:string}> = ({x,y,frame,color})=><g>
  {Array.from({length:22}).map((_,i)=>{
    const local=Math.max(0,frame-i*1.4); const t=Math.min(1,local/36); const a=i*1.91; const dx=Math.cos(a)*220*t; const dy=-160*t+320*t*t; return <rect key={i} x={x+dx} y={y+dy} width={8+(i%3)*3} height={18} rx={3} fill={i%2?color:"#ffd76a"} transform={`rotate(${i*37} ${x+dx} ${y+dy})`} opacity={1-t*.55}/>;
  })}
</g>;
