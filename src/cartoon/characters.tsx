import React from 'react';
import { VisualAction } from './types';

export type CharacterProps={x:number;y:number;scale?:number;color:string;action?:VisualAction;frame:number;seed?:number;secondary?:boolean};

export const CartoonCharacter:React.FC<CharacterProps>=({x,y,scale=1,color,action='enter',frame,seed=0,secondary=false})=>{
  const t=frame/30+seed;
  const walk=Math.sin(t*5)*18;
  const bob=Math.abs(Math.sin(t*3.1))*8;
  const jump=Math.abs(Math.sin(t*1.6))*55;
  const isSleep=action==='sleep';
  const isRun=action==='run';
  const isJump=action==='jump';
  const isLaugh=action==='laugh';
  const isCry=action==='cry';
  const isPoint=action==='point';
  const isThink=action==='think';
  const bodyY=isJump? -jump : -bob;
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={8} rx={48} ry={9} fill="#000" opacity={.13}/>
    <g transform={`translate(0 ${bodyY})`}>
      <circle cx={0} cy={-98} r={32} fill="#f4c7a1"/>
      <path d="M-31-104 Q0-143 31-104 L25-88 L-25-88Z" fill={secondary?'#4b5563':'#273244'}/>
      <circle cx={-11} cy={-99} r={3.2} fill="#273244"/><circle cx={11} cy={-99} r={3.2} fill="#273244"/>
      {isLaugh?<path d="M-11-83 Q0-70 11-83" fill="none" stroke="#273244" strokeWidth={4} strokeLinecap="round"/>:
       isCry?<path d="M-10-83 Q0-91 10-83" fill="none" stroke="#273244" strokeWidth={4}/>:<path d="M-8-83 Q0-78 8-83" fill="none" stroke="#273244" strokeWidth={3}/>} 
      {isCry&&<><circle cx={-12} cy={-88} r={5} fill="#72c9ff"/><circle cx={12} cy={-88} r={5} fill="#72c9ff"/></>}
      <rect x={-30} y={-62} width={60} height={78} rx={23} fill={color}/>
      {isPoint?<><line x1={25} y1={-45} x2={80} y2={-78} stroke={color} strokeWidth={13} strokeLinecap="round"/><line x1={-25} y1={-45} x2={-50} y2={-10} stroke={color} strokeWidth={13} strokeLinecap="round"/></>:
      isThink?<><line x1={25} y1={-40} x2={52} y2={-74} stroke={color} strokeWidth={13} strokeLinecap="round"/><line x1={-25} y1={-40} x2={-48} y2={-10} stroke={color} strokeWidth={13} strokeLinecap="round"/></>:
      <><line x1={-25} y1={-42} x2={-44+walk} y2={-2} stroke={color} strokeWidth={13} strokeLinecap="round"/><line x1={25} y1={-42} x2={44-walk} y2={-2} stroke={color} strokeWidth={13} strokeLinecap="round"/></>}
      <line x1={-12} y1={15} x2={-22+(isRun?walk:walk*.5)} y2={70} stroke="#273244" strokeWidth={14} strokeLinecap="round"/>
      <line x1={12} y1={15} x2={22-(isRun?walk:walk*.5)} y2={70} stroke="#273244" strokeWidth={14} strokeLinecap="round"/>
      {isSleep&&<path d="M-15-102 Q-8-94 0-102 M4-102 Q12-94 20-102" fill="none" stroke="#273244" strokeWidth={4}/>} 
    </g>
  </g>;
};

export const CharacterPair:React.FC<{frame:number;color:string;action:VisualAction}> = ({frame,color,action})=><g><CartoonCharacter x={390} y={1450} scale={1.05} color={color} action={action} frame={frame}/><CartoonCharacter x={700} y={1450} scale={.86} color="#8b9cff" action="react" frame={frame} secondary/></g>;
