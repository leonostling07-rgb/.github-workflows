import { DirectorContext, VisualPlan, VisualBeat, EnvironmentKind, VisualAction, VisualObject, CameraMove } from './types';

const has=(t:string, words:string[])=>words.some(w=>t.includes(w));
const pick=(a:any[],i:number)=>a[i%a.length];

export function makeVisualPlan({scene,sceneIndex,duration}:DirectorContext):VisualPlan{
  const t=(scene.text||'').toLowerCase();
  let environment:EnvironmentKind='abstract';
  if(has(t,['sleep','bed','night','rest'])) environment='bedroom';
  else if(has(t,['focus','office','meeting','email','boss','deadline'])) environment='office';
  else if(has(t,['school','teacher','student','learn','class'])) environment='school';
  else if(has(t,['gym','train','exercise','run','workout'])) environment='gym';
  else if(has(t,['home','house','family','kitchen'])) environment='home';
  else if(has(t,['street','drive','car','city','traffic'])) environment='street';
  else if(has(t,['tree','forest','nature','mountain','outdoor'])) environment='nature';
  else if(has(t,['city','urban','building'])) environment='city';

  const beats:VisualBeat[]=[];
  const add=(id:string,start:number,dur:number,character?:VisualAction,object?:VisualObject,camera:CameraMove='static')=>beats.push({id,start,duration:dur,character:character?{action:character}:undefined,object:object?{type:object,action:'enter'}:undefined,camera});
  const n=Math.max(6,Math.min(11,Math.floor(duration*1.45)));
  const actions:VisualAction[] = has(t,['sleep','tired','night'])?['sleep','look','react','focus','wake','enter' as VisualAction]:
    has(t,['stress','pressure','deadline','overwhelmed'])?['focus','react','panic','look','run','focus','react']:
    has(t,['learn','book','knowledge','study'])?['read','look','discover','write','celebrate','focus']:
    has(t,['money','price','cost','salary'])?['look','hold','react','hold' as VisualAction,'discover','celebrate']:
    ['enter','look','react','point','discover','hold','celebrate'];
  const objects:VisualObject[] = has(t,['phone','mobile','notification','screen'])?['phone','notification','mail','calendar','phone','warning']:
    has(t,['brain','think','memory','focus'])?['brain','lightbulb','book','brain','star','check']:
    has(t,['money','cost','salary','business'])?['money','chart','calendar','money','check','trophy']:
    has(t,['sleep','night'])?['moon','bed','brain','clock','star','sun']:
    ['book','phone','clock','lightbulb','heart','star','check'];
  for(let i=0;i<n;i++){
    const start=(duration*i/n)*.9;
    const dur=Math.min(.95,duration/n*1.15);
    const camera:CameraMove= i===0?'push': i%5===1?'panRight':i%5===2?'follow':i%5===3?'push':'static';
    add(`beat-${sceneIndex}-${i}`,start,dur,pick(actions,i),pick(objects,i),camera);
  }
  return {environment,beats,palette:['#ffcf5c','#73c9ff','#ff7397','#8be28b'],seed:sceneIndex*997+Math.round(duration*31)};
}
