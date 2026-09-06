import * as T from 'three';
import type {Acupoint} from './types';

// Reference-model proportions only; endpoints have not been clinically calibrated.
export function createGuide(host:HTMLElement){
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');svg.classList.add('proportion-guide');svg.setAttribute('aria-label','骨度分寸比例示意，模型端点待校准');
 const line=document.createElementNS(ns,'line');svg.appendChild(line);
 const ticks=Array.from({length:17},()=>{const tick=document.createElementNS(ns,'line');svg.appendChild(tick);return tick;});
 const labels=Array.from({length:3},()=>{const text=document.createElementNS(ns,'text');svg.appendChild(text);return text;});host.appendChild(svg);
 const a=new T.Vector3(),b=new T.Vector3();
 return {
  update(point:Acupoint|undefined,camera:T.Camera,show:boolean,width:number,height:number){
   let profile:{a:number[];b:number[];n:number;labels:string[]}|undefined;
   if(point&&['ST36','ST40','SP6','SP9','GB34'].includes(point.id))profile={a:[.17,.453,.022],b:[.17,.067,.022],n:16,labels:['膝部参考','踝部参考','16 等分示意']};
   else if(point&&['LU5','LU7','LU9','LI10','LI11','PC6','PC7','TE5','HT7'].includes(point.id))profile={a:[.34,1.115,.03],b:[.34,.887,.03],n:12,labels:['肘部参考','腕部参考','12 等分示意']};
   else if(point&&['CV12','ST25'].includes(point.id))profile={a:[.16,1.25,.13],b:[.16,1.08,.13],n:8,labels:['上腹参考','脐部参考','8 等分示意']};
   svg.style.display=show&&profile?'block':'none';if(!show||!profile)return;
   a.fromArray(profile.a).project(camera);b.fromArray(profile.b).project(camera);if(a.z>1||b.z>1){svg.style.display='none';return;}
   const x1=(a.x+1)*width/2,y1=(1-a.y)*height/2,x2=(b.x+1)*width/2,y2=(1-b.y)*height/2;
   svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
   for(const [attr,value]of Object.entries({x1,y1,x2,y2}))line.setAttribute(attr,String(value));
   ticks.forEach((tick,i)=>{tick.style.display=i<=profile!.n?'':'none';const t=i/profile!.n,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;for(const [attr,value]of Object.entries({x1:x-4,x2:x+4,y1:y,y2:y}))tick.setAttribute(attr,String(value));});
   labels.forEach((text,i)=>{text.textContent=profile!.labels[i];text.setAttribute('x',String(i===2?(x1+x2)/2+10:x1+8));text.setAttribute('y',String(i===0?y1-7:i===1?y2+13:(y1+y2)/2));});
  },
  dispose(){svg.remove();}
 };
}
