import { interpolate, spring } from "remotion";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => {
  const t = clamp01(v);
  return t < .5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
};
export const easeOut = (v: number) => 1-Math.pow(1-clamp01(v),3);
export const easeIn = (v: number) => Math.pow(clamp01(v),3);
export const phase = (frame: number, fps: number, from: number, duration: number) => clamp01((frame/fps-from)/duration);
export const enter = (frame:number, fps:number, start:number, duration:number) => easeOut(phase(frame,fps,start,duration));
export const exit = (frame:number, fps:number, start:number, duration:number) => 1-easeIn(phase(frame,fps,start,duration));
export const pop = (frame:number, fps:number, start:number, duration:number) => {
  const p=phase(frame,fps,start,duration);
  if(p<=0) return 0;
  if(p<.7) return interpolate(easeOut(p/.7),[0,1],[.65,1.12]);
  return interpolate(ease((p-.7)/.3),[0,1],[1.12,1]);
};
export const reveal = (frame:number,fps:number,start:number,duration:number) => easeOut(phase(frame,fps,start,duration));
export const springIn = (frame:number,fps:number,start:number) => spring({frame:Math.max(0,frame-Math.round(start*fps)),fps,config:{damping:14,stiffness:150,mass:.8}});
export const stagger = (index:number,total:number,maxDelay=.45) => total<=1 ? 0 : (index/(total-1))*maxDelay;
export const ping = (frame:number,fps:number,start:number,duration:number) => {
  const p=phase(frame,fps,start,duration);
  if(p<=0 || p>=1) return 0;
  return Math.sin(p*Math.PI);
};
