import React from "react";
import { interpolate } from "remotion";
import { CameraMove, VisualBeat } from "./types";
import { ease } from "./animations";

export const CameraRig: React.FC<{frame:number; fps:number; duration:number; move?:CameraMove; children:React.ReactNode}> = ({frame,fps,duration,move="static",children}) => {
  const p=Math.min(1,frame/(duration*fps));
  let x=0,y=0,scale=1,rotate=0;
  if(move==="push") scale=interpolate(ease(p),[0,1],[1,1.09]);
  if(move==="pull") scale=interpolate(ease(p),[0,1],[1.10,1]);
  if(move==="panLeft") x=interpolate(ease(p),[0,1],[70,-70]);
  if(move==="panRight") x=interpolate(ease(p),[0,1],[-70,70]);
  if(move==="tilt") rotate=interpolate(ease(p),[0,1],[-2.5,2.5]);
  if(move==="follow") x=interpolate(ease(p),[0,1],[-45,45]);
  if(move==="whip") { x=interpolate(Math.min(1,p*1.8),[0,1],[-280,280]); rotate=interpolate(ease(p),[0,1],[-4,4]); }
  return <div style={{position:"absolute",inset:0,transform:`translate(${x}px,${y}px) scale(${scale}) rotate(${rotate}deg)`,transformOrigin:"50% 50%"}}>{children}</div>;
};

export const beatCamera=(beats:VisualBeat[], frame:number, fps:number):CameraMove=>{
  const sec=frame/fps;
  const active=beats.filter(b=>b.start<=sec && b.start+b.duration>=sec).pop();
  return active?.camera || "static";
};
