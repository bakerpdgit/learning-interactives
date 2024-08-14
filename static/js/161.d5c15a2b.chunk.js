"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[161],{8161:(e,t,n)=>{n.r(t),n.d(t,{default:()=>h});var r=n(2791),l=n(3047),i=n.n(l);const a="RaffleBalls_gameArea__KsO9i",o="RaffleBalls_ball__jV5Yq",s="RaffleBalls_expanded__bzFWp",c="RaffleBalls_ballText__ixfhY",d="RaffleBalls_selectButton__31YEj";var u=n(184);const h=function(e){let{text:t}=e;const n=(0,r.useRef)(null),l=(0,r.useRef)(null),h=(0,r.useRef)([]),[f,g]=(0,r.useState)(null),[p,w]=(0,r.useState)([]),[S,m]=(0,r.useState)(!0),[y,b]=(0,r.useState)(null),[x,E]=(0,r.useState)(null),[B,_]=(0,r.useState)(!1),[R,v]=(0,r.useState)(null),[W,j]=(0,r.useState)({}),[T,k]=(0,r.useState)(t);return(0,r.useEffect)((()=>{const e=()=>{window.location.reload()};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}}),[]),(0,r.useEffect)((()=>{const e=i().Engine.create();e.gravity.y=0,e.gravity.x=0,l.current=e,h.current=[];const t=i().Render.create({element:n.current,engine:e,options:{width:n.current.offsetWidth,height:n.current.offsetHeight,wireframes:!1,background:"#f0f0f0"}}),r={width:n.current.offsetWidth,height:n.current.offsetHeight},a=[i().Bodies.rectangle(r.width/2,0,r.width,10,{isStatic:!0,render:{fillStyle:"red"}}),i().Bodies.rectangle(r.width/2,r.height,r.width,10,{isStatic:!0,render:{fillStyle:"red"}}),i().Bodies.rectangle(0,r.height/2,10,r.height,{isStatic:!0,render:{fillStyle:"red"}}),i().Bodies.rectangle(r.width,r.height/2,10,r.height,{isStatic:!0,render:{fillStyle:"red"}})],o=r.height-150,s=i().Bodies.rectangle(r.width/4,o,r.width/2,8,{isStatic:!0,render:{fillStyle:"blue"}});b(s);const c=i().Bodies.rectangle(3*r.width/4,o,r.width/2,8,{isStatic:!0,render:{fillStyle:"blue"}});E(c),i().World.add(e.world,[...a,s,c]);const d=((r.width/2-22.5)**2+12100)**.5,u=i().Bodies.rectangle(r.width/2-22.5-d/2,r.height-110*d/(r.width/2-22.5)/2-40,d,8,{isStatic:!0,angle:Math.atan(110/(r.width/2-22.5)),render:{fillStyle:"blue"}}),f=i().Bodies.rectangle(r.width/2+22.5+d/2,r.height-110*d/(r.width/2-22.5)/2-40,d,8,{isStatic:!0,angle:Math.PI-Math.atan(110/(r.width/2-22.5)),render:{fillStyle:"blue"}}),g=i().Bodies.rectangle(r.width/2-22.5-8,r.height-20,8,40,{isStatic:!0,render:{fillStyle:"blue"}}),p=i().Bodies.rectangle(r.width/2+22.5+8,r.height-20,8,40,{isStatic:!0,render:{fillStyle:"blue"}});i().World.add(e.world,[u,f,g,p]);const S=T.split("\n").map((e=>{const[t,n]=e.split(",");return{name:t,score:parseInt(n,10)}})),m=[],y=W;S.forEach(((e,t)=>{if(!y[e.name]){const n=360*t/S.length;y[e.name]="hsl(".concat(n,", 100%, 50%)")}Array.from({length:e.score}).forEach(((t,n)=>{const l=20+Math.random()*(r.width-40),a=20+Math.random()*(r.height-190),o=y[e.name],s=i().Bodies.circle(l,a,20,{restitution:1,friction:0,frictionAir:0,frictionStatic:0,inertia:1/0,render:{fillStyle:o},label:e.name,customColor:o});h.current.push(s),m.push({x:l,y:a,color:o,label:e.name})}))})),w(m),j(y),i().Render.run(t);const x=i().Runner.create();return i().Runner.run(x,e),()=>{i().Render.stop(t),i().Runner.stop(x),i().World.clear(e.world),i().Engine.clear(e),t.canvas.remove(),t.canvas=null,t.context=null,t.textures={}}}),[T,W]),(0,u.jsxs)("div",{children:[(0,u.jsx)("button",{onClick:()=>{m(!1),h.current.forEach((e=>{i().World.add(l.current.world,e);const t=.1*(Math.random()-.5),n=.1*(Math.random()-.5);i().Body.applyForce(e,{x:e.position.x,y:e.position.y},{x:t,y:n})})),setTimeout((()=>{l.current.world.gravity.y=1,h.current.forEach((e=>{i().Body.set(e,{restitution:.5})})),setTimeout((()=>{i().World.remove(l.current.world,[y,x]),setTimeout((()=>{let e=h.current[0],t=0;h.current.forEach(((n,r)=>{n.position.y>e.position.y&&(e=n,t=r)}));const n=h.current.map((e=>({color:e.customColor,label:e.label,x:e.position.x,y:e.position.y,visible:!0})));w(n),g(t),i().World.remove(l.current.world,h.current),v(t),m(!0),_(!0)}),5e3)}),5e3)}),5e3)},className:d,children:"SELECT"}),B&&(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)("button",{onClick:()=>{_(!1),g(null),k(T+" ")},children:"RESET"}),(0,u.jsx)("button",{onClick:()=>{const e=p[R].label,t=T.split("\n").map((t=>{const[n,r]=t.split(",");if(n===e){const e=parseInt(r,10)-1;return"".concat(n,",").concat(e)}return t})).filter((e=>!e.includes(",0"))).join("\n");_(!1),g(null),k(t)},children:"RESET WITHOUT WINNING BALL"}),(0,u.jsx)("button",{onClick:()=>{const e=p[R].label,t=T.split("\n").filter((t=>!t.startsWith(e))).join("\n");_(!1),g(null),k(t)},children:"RESET WITHOUT WINNER"})]}),(0,u.jsx)("div",{ref:n,className:a,children:S&&p.map(((e,t)=>(0,u.jsx)("div",{id:"ball-".concat(t),className:"".concat(o," ").concat(f===t?s:""),onClick:()=>(e=>{g(e)})(t),style:{backgroundColor:e.color,top:"".concat(e.y-20,"px"),left:"".concat(e.x-20,"px")},children:f===t?(0,u.jsx)("span",{className:c,children:e.label}):null},t)))})]})}}}]);
//# sourceMappingURL=161.d5c15a2b.chunk.js.map