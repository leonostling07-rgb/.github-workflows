import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, Theme, VisualBeat } from "../types";
import { Burst, Character, Environment, ObjectGraphic } from "./primitives";

const clamp = (v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const hash=(s:string)=>{let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return Math.abs(h);};

const actionMap = (a?:VisualBeat["action"]) => a || "idle";

export const CartoonStory: React.FC<{ scene: Scene; theme: Theme; sceneIndex: number }> = ({ scene, theme, sceneIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const p = clamp(seconds / Math.max(0.1, scene.duration / fps));
  const beats = scene.beats?.length ? [...scene.beats].sort((a,b)=>a.start-b.start) : [{id:"fallback",start:0,end:1,event:"",camera:"static" as const,mood:"calm" as const}];
  const activeIndex = Math.max(0, beats.findIndex((b,i)=>p >= b.start && p < (beats[i+1]?.start ?? 1)));
  const active = beats[activeIndex] || beats[beats.length-1];
  const local = clamp((p-active.start)/Math.max(0.001,active.end-active.start));

  const camera = active.camera || (activeIndex%3===1?"push":activeIndex%3===2?"follow":"static");
  const cameraScale = camera === "push" ? 1 + local*0.045 : camera === "pull" ? 1.04-local*0.035 : camera === "whip" ? 1.08 : 1;
  const cameraX = camera === "panLeft" ? -local*90 : camera === "panRight" ? local*90 : camera === "follow" ? Math.sin(local*Math.PI)*70 : 0;
  const cameraY = camera === "tilt" ? Math.sin(local*Math.PI)*45 : 0;

  return <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{position:"absolute",inset:0}}>
      <g transform={`translate(${cameraX} ${cameraY}) scale(${cameraScale})`} transform-origin="540 960">
        <Environment kind={scene.setting} theme={theme} frame={frame} />

        {scene.objects.filter(o=>o.layer!=="front").map((o,oi)=>{
          const used = active.objects?.includes(o.id) || oi < 3;
          if(!used) return null;
          const seed = hash(o.id)+sceneIndex*31+oi*17;
          let x=o.x, y=o.y;
          const k = active.objects?.indexOf(o.id) ?? -1;
          const dir = k % 2 === 0 ? 1 : -1;
          if(k>=0){
            if(active.action === "throw") { x += interpolate(local,[0,1],[0,dir*230]); y -= Math.sin(local*Math.PI)*360; }
            else if(active.action === "catch") { x += interpolate(local,[0,1],[dir*120,0]); y -= Math.sin(local*Math.PI)*160; }
            else if(active.action === "open") { x += Math.sin(local*Math.PI)*40; }
            else if(active.action === "run" || active.action === "walk") { x += Math.sin(local*Math.PI)*dir*110; }
          }
          return <ObjectGraphic key={o.id} type={o.type} x={x} y={y} scale={o.scale} rotation={o.rotation} accent={theme.accent} frame={frame} seed={seed%1000} motion={k>=0 ? active.action : undefined} local={k>=0 ? local : 0} emphasis={active.emphasis}/>;
        })}

        {scene.characters.map((c,ci)=>{
          const isActor = active.actor===c.id;
          const action = isActor ? actionMap(active.action) : "react";
          const move = isActor && (action === "walk" || action === "run") ? Math.sin(local*Math.PI)*(action === "run" ? 220 : 130) : 0;
          const jump = isActor && action === "jump" ? -Math.sin(local*Math.PI)*120 : 0;
          const reaction = isActor ? 0 : Math.sin(frame*0.05+ci)*7;
          return <Character key={c.id} x={c.x+move} y={c.y+jump+reaction} scale={c.scale} color={c.color || theme.accent} action={action as any} seed={sceneIndex*10+ci+activeIndex} frame={frame}/>;
        })}

        {scene.objects.filter(o=>o.layer==="front").map((o,oi)=><ObjectGraphic key={`front-${o.id}`} type={o.type} x={o.x} y={o.y} scale={o.scale} rotation={o.rotation} accent={theme.accent} frame={frame} seed={hash(o.id)+oi}/>) }

        {active.emphasis && <Burst x={540} y={650} color={theme.accent} frame={frame} intensity={active.mood==="triumph"?1.4:1}/>} 
      </g>
    </svg>
  </div>;
};
