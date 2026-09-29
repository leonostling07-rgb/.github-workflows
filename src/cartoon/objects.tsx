import React from 'react';
import { VisualObject } from './types';
import { pop, easeOut } from './animations';

export const CartoonObject:React.FC<{type:VisualObject;x:number;y:number;frame:number;color:string;scale?:number;action?:string;seed?:number}> = ({type,x,y,frame,color,scale=1,action='enter',seed=0})=>{
  const p=pop(frame,30,seed*.04,.42);
  const s=scale*(p||.001);
  const bob=Math.sin((frame+seed*17)/24)*4;
  const common={stroke:'#253044',strokeWidth:8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
  return <g transform={`translate(${x} ${y+bob}) scale(${s})`}>
    {type==='phone'&&<g><rect x={-62} y={-110} width={124} height={220} rx={24} fill="#263244"/><rect x={-49} y={-84} width={98} height={165} rx={12} fill="#bfe8ff"/><circle cx={0} cy={94} r={6} fill="#fff"/><circle cx={26} cy={-54} r={15} fill="#fff" opacity={.8}/></g>}
    {type==='laptop'&&<g><rect x={-125} y={-85} width={250} height={155} rx={12} fill="#273244"/><rect x={-106} y={-66} width={212} height={116} rx={7} fill="#bfe8ff"/><path d="M-155 70 L155 70 L118 102 L-118 102Z" fill="#aeb7c2"/></g>}
    {type==='book'&&<g><path d="M-120-80 Q-55-110 0-72 L0 105 Q-58 72-120 100Z" fill="#75bfff"/><path d="M0-72 Q55-110 120-80 L120 100 Q58 72 0 105Z" fill="#cce9ff"/><line x1={0} y1={-72} x2={0} y2={105} stroke="#fff" strokeWidth={7}/><line x1={-92} y1={-35} x2={-30} y2={-50} stroke="#fff" strokeWidth={5}/><line x1={30} y1={-50} x2={92} y2={-35} stroke="#fff" strokeWidth={5}/></g>}
    {type==='brain'&&<g><path d="M-20-90 C-85-110-125-50-93-10 C-125 35-80 88-35 65 C-5 120 55 88 48 47 C105 48 120-20 77-45 C87-98 20-116-20-90Z" fill="#ff8fa8" {...common}/><path d="M-35-65 Q-60-25-30 5 T-42 58 M18-72 Q-8-35 18-10 T5 55 M55-50 Q30-20 58 5" fill="none" stroke="#fff" strokeWidth={6} opacity={.8}/></g>}
    {type==='coffee'||type==='cup'&&<g><path d="M-70-55 L70-55 L55 85 Q0 110-55 85Z" fill="#d9a36c" {...common}/><path d="M70-28 Q130-25 100 35 Q88 58 60 52" fill="none" stroke="#253044" strokeWidth={10}/><path d="M-35-80 Q-55-125-25-145 M5-80 Q-15-125 15-145" fill="none" stroke="#fff" strokeWidth={7} opacity={.5}/></g>}
    {type==='clock'&&<g><circle r={100} fill="#f6f7f8" stroke="#8f9aa8" strokeWidth={10}/><line x1={0} y1={0} x2={0} y2={-58} stroke="#273244" strokeWidth={9}/><line x1={0} y1={0} x2={45} y2={32} stroke="#273244" strokeWidth={9}/><circle r={8} fill={color}/></g>}
    {type==='calendar'&&<g><rect x={-105} y={-90} width={210} height={190} rx={18} fill="#fff" stroke="#273244" strokeWidth={8}/><rect x={-105} y={-90} width={210} height={50} rx={18} fill={color}/>{[[-55,-5],[0,-5],[55,-5],[-55,45],[0,45],[55,45]].map((q,i)=><rect key={i} x={q[0]} y={q[1]} width={26} height={26} rx={5} fill="#b8c1cc"/>)}</g>}
    {type==='mail'||type==='notification'&&<g><rect x={-120} y={-82} width={240} height={165} rx={20} fill="#fff" stroke="#273244" strokeWidth={8}/><path d="M-108-58 L0 30 L108-58" fill="none" stroke={color} strokeWidth={9}/>{type==='notification'&&<circle cx={90} cy={-70} r={25} fill="#ff5d78"/>}</g>}
    {type==='heart'&&<path d="M0 110 C-25 72-120 18-120-45 C-120-110-38-128 0-72 C38-128 120-110 120-45 C120 18 25 72 0 110Z" fill="#ff6d91" stroke="#273244" strokeWidth={8}/>} 
    {type==='money'&&<g><rect x={-130} y={-82} width={260} height={164} rx={20} fill="#74d391" stroke="#273244" strokeWidth={8}/><circle r={45} fill="#c8f3cf"/><text y={20} textAnchor="middle" fontSize={62} fontWeight="900" fill="#2d7d4d">$</text></g>}
    {type==='chart'&&<g><line x1={-120} y1={90} x2={-120} y2={-100} stroke="#273244" strokeWidth={8}/><line x1={-120} y1={90} x2={130} y2={90} stroke="#273244" strokeWidth={8}/><path d="M-105 55 L-30 10 L20 35 L105-70" fill="none" stroke={color} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round"/><circle cx={105} cy={-70} r={13} fill={color}/></g>}
    {type==='check'&&<g><circle r={85} fill="#7ddd91"/><path d="M-45 5 L-10 40 L55-40" fill="none" stroke="#fff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round"/></g>}
    {type==='warning'&&<g><path d="M0-110 L120 95 L-120 95Z" fill="#ffd76a" stroke="#273244" strokeWidth={8}/><rect x={-8} y={-45} width={16} height={78} rx={8} fill="#273244"/><circle cy={62} r={9} fill="#273244"/></g>}
    {type==='lightbulb'&&<g><circle cy={-35} r={68} fill="#ffe078" stroke="#273244" strokeWidth={8}/><rect x={-24} y={35} width={48} height={45} rx={8} fill="#8993a0"/><path d="M-100-35 L-135-35 M100-35 L135-35 M0-135 L0-165" stroke="#ffe078" strokeWidth={10} strokeLinecap="round"/></g>}
    {type==='trophy'&&<g><path d="M-60-85 L60-85 L40 20 Q0 72-40 20Z" fill="#ffd76a" stroke="#273244" strokeWidth={8}/><path d="M-60-55 Q-120-60-100 8 Q-90 35-45 28 M60-55 Q120-60 100 8 Q90 35 45 28" fill="none" stroke="#ffd76a" strokeWidth={15}/><rect x={-14} y={65} width={28} height={38} fill="#ffd76a"/><rect x={-65} y={100} width={130} height={20} rx={8} fill="#ffd76a"/></g>}
    {type==='rocket'&&<g transform="rotate(-35)"><path d="M0-135 C70-90 70 30 0 85 C-70 30-70-90 0-135Z" fill="#e9edf2" stroke="#273244" strokeWidth={8}/><circle cy={-40} r={25} fill="#8fd5ff"/><path d="M-55 25 L-95 65 L-55 78 M55 25 L95 65 L55 78" fill={color}/><path d="M-25 82 L0 145 L25 82" fill="#ff9a54"/></g>}
    {type==='star'&&<path d="M0-110 L30-35 L108-35 L45 15 L68 95 L0 50 L-68 95 L-45 15 L-108-35 L-30-35Z" fill="#ffd76a" stroke="#273244" strokeWidth={8}/>} 
    {type==='sun'&&<g><circle r={72} fill="#ffd76a" stroke="#273244" strokeWidth={7}/>{Array.from({length:8}).map((_,i)=>{const a=i*Math.PI/4;return <line key={i} x1={Math.cos(a)*98} y1={Math.sin(a)*98} x2={Math.cos(a)*135} y2={Math.sin(a)*135} stroke="#ffd76a" strokeWidth={10} strokeLinecap="round"/>})}</g>}
    {type==='moon'&&<path d="M45-115 C-55-95-90 15-25 82 C18 125 80 110 108 65 C35 75-20 5 0-55 C12-83 28-100 45-115Z" fill="#dfe5ec" stroke="#273244" strokeWidth={8}/>} 
    {type==='cloud'&&<g fill="#edf6ff" stroke="#273244" strokeWidth={7}><circle cx={-60} cy={25} r={52}/><circle cx={0} cy={-5} r={75}/><circle cx={65} cy={25} r={55}/><rect x={-105} y={20} width={210} height={65} rx={32}/></g>}
    {type==='house'&&<g><path d="M-135-10 L0-125 L135-10Z" fill="#ff8b70" stroke="#273244" strokeWidth={8}/><rect x={-105} y={-10} width={210} height={135} fill="#efd5a7" stroke="#273244" strokeWidth={8}/><rect x={-22} y={55} width={44} height={70} fill="#6d7784"/><rect x={-75} y={20} width={44} height={44} fill="#9cdbff"/><rect x={31} y={20} width={44} height={44} fill="#9cdbff"/></g>}
    {type==='door'&&<g><rect x={-90} y={-135} width={180} height={270} rx={8} fill="#a97855" stroke="#273244" strokeWidth={8}/><circle cx={60} cy={10} r={8} fill="#ffd76a"/></g>}
    {type==='chair'&&<g stroke="#273244" strokeWidth={10} strokeLinecap="round"><path d="M-70-90 L70-90 L70 20 L-70 20Z" fill="#8494a8"/><line x1={-55} y1={20} x2={-65} y2={100}/><line x1={55} y1={20} x2={65} y2={100}/></g>}
    {type==='headphones'&&<g fill="none" stroke="#273244" strokeWidth={15}><path d="M-75 10 Q-75-100 0-100 Q75-100 75 10"/><rect x={-92} y={-5} width={30} height={70} rx={12} fill={color}/><rect x={62} y={-5} width={30} height={70} rx={12} fill={color}/></g>}
    {type==='bag'&&<g><path d="M-90-45 Q-90-105 0-105 Q90-105 90-45" fill="none" stroke="#273244" strokeWidth={12}/><rect x={-105} y={-45} width={210} height={150} rx={22} fill={color} stroke="#273244" strokeWidth={8}/></g>}
    {type==='key'&&<g stroke="#273244" strokeWidth={10} fill="none"><circle cx={-45} r={45}/><line x1={0} x2={120}/><line x1={80} x2={80} y1={0} y2={35}/><line x1={105} x2={105} y1={0} y2={25}/></g>}
  </g>;
};
