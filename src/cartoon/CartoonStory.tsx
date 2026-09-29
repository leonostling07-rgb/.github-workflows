import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Scene, Theme } from '../Short';
import { makeVisualPlan } from './director';
import { CartoonCharacter } from './characters';
import { CartoonObject } from './objects';
import { Environment } from './environments';
import { CameraRig } from './camera';
import { Burst, SpeedLines, Confetti } from './effects';
import { VisualBeat } from './types';

export const CartoonStory:React.FC<{scene:Scene;theme:Theme;sceneIndex:number}>=({scene,theme,sceneIndex})=>{
 const frame=useCurrentFrame(); const {fps}=useVideoConfig();
 const plan=makeVisualPlan({scene,sceneIndex,theme,duration:scene.duration});
 const sec=frame/fps;
 const active:VisualBeat|undefined=plan.beats.filter(b=>b.start<=sec).pop();
 const beatIndex=Math.max(0,plan.beats.findIndex(b=>b===active));
 const object=active?.object;
 const character=active?.character;
 const x=520+Math.sin((beatIndex+1)*1.71)*230;
 const y=1420-(Math.max(0,sec-(active?.start||0))*90%180);
 return <AbsoluteFill style={{overflow:'hidden'}}>
   <Environment kind={plan.environment} color={theme.background} accent={theme.accent} frame={frame}/>
   <CameraRig frame={frame} fps={fps} duration={scene.duration} move={active?.camera}>
     <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:'absolute',inset:0}}>
       <SpeedLines x={120} y={640} frame={frame} color={theme.text} flip={beatIndex%2===1}/>
       {character && <CartoonCharacter x={x} y={y} scale={1.05} color={theme.accent} action={character.action} frame={frame} seed={beatIndex}/>} 
       {object && <CartoonObject type={object.type} x={720} y={650+Math.sin(frame/18)*20} frame={frame} color={theme.accent} seed={beatIndex} scale={.9}/>} 
       {active?.emphasis && <Burst x={540} y={650} color={theme.accent} frame={frame} fps={fps} start={active.start} count={18} size={10}/>} 
       {sceneIndex%4===0 && beatIndex===plan.beats.length-1 && <Confetti x={540} y={900} frame={frame} color={theme.accent}/>} 
     </svg>
   </CameraRig>
 </AbsoluteFill>;
};
