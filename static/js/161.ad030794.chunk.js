"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[161],{8161:(e,t,r)=>{r.r(t),r.d(t,{default:()=>o});var n=r(2791),l=r(3047),i=r.n(l);const a={gameArea:"RaffleBalls_gameArea__KsO9i",ball:"RaffleBalls_ball__jV5Yq",expanded:"RaffleBalls_expanded__bzFWp",ballText:"RaffleBalls_ballText__ixfhY",selectButton:"RaffleBalls_selectButton__31YEj",raffleContainer:"RaffleBalls_raffleContainer__404Sj",gameAreaContainer:"RaffleBalls_gameAreaContainer__rQvBL",winnersPanel:"RaffleBalls_winnersPanel__10yU3",winnersList:"RaffleBalls_winnersList__SkC5Y",winner:"RaffleBalls_winner__6CYB1"};var s=r(184);const o=function(e){let{text:t}=e;const r=(0,n.useRef)(null),l=(0,n.useRef)(null),o=(0,n.useRef)([]),[c,d]=(0,n.useState)(null),[u,h]=(0,n.useState)([]),[f,p]=(0,n.useState)(!0),[w,g]=(0,n.useState)(null),[m,S]=(0,n.useState)(null),[y,x]=(0,n.useState)(!1),[_,b]=(0,n.useState)(null),[B,v]=(0,n.useState)({}),[E,R]=(0,n.useState)(t.startsWith("OPTIONS:")?t.split("\n").slice(1).join("\n"):t),[j,W]=(0,n.useState)([]),[C,T]=(0,n.useState)(!1),[N,k]=(0,n.useState)(0);return(0,n.useEffect)((()=>{const e=t.split("\n")[0];if(e.startsWith("OPTIONS:")){e.split(":")[1].split(",").forEach((e=>{const[t,r]=e.split("=");"drop_all"===t&&"yes"===r?T(!0):"group_size"===t&&k(parseInt(r,10))}))}}),[t]),(0,n.useEffect)((()=>{const e=()=>{window.location.reload()};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}}),[]),(0,n.useEffect)((()=>{const e=i().Engine.create();e.gravity.y=0,e.gravity.x=0,l.current=e,o.current=[];const t=i().Render.create({element:r.current,engine:e,options:{width:r.current.offsetWidth,height:r.current.offsetHeight,wireframes:!1,background:"#f0f0f0"}}),n={width:r.current.offsetWidth,height:r.current.offsetHeight},a=[i().Bodies.rectangle(n.width/2,0,n.width,10,{isStatic:!0,render:{fillStyle:"red"}}),!C&&i().Bodies.rectangle(n.width/2,n.height,n.width,10,{isStatic:!0,render:{fillStyle:"red"}}),i().Bodies.rectangle(0,n.height/2,10,n.height,{isStatic:!0,render:{fillStyle:"red"}}),i().Bodies.rectangle(n.width,n.height/2,10,n.height,{isStatic:!0,render:{fillStyle:"red"}})],s=n.height-150,c=!C&&i().Bodies.rectangle(n.width/4,s,n.width/2,8,{isStatic:!0,render:{fillStyle:"blue"}});g(c);const d=!C&&i().Bodies.rectangle(3*n.width/4,s,n.width/2,8,{isStatic:!0,render:{fillStyle:"blue"}});S(d),i().World.add(e.world,[...a,c,d]);const u=((n.width/2-22.5)**2+12100)**.5,f=i().Bodies.rectangle(n.width/2-22.5-u/2,n.height-110*u/(n.width/2-22.5)/2-40,u,8,{isStatic:!0,angle:Math.atan(110/(n.width/2-22.5)),render:{fillStyle:"blue"}}),p=i().Bodies.rectangle(n.width/2+22.5+u/2,n.height-110*u/(n.width/2-22.5)/2-40,u,8,{isStatic:!0,angle:Math.PI-Math.atan(110/(n.width/2-22.5)),render:{fillStyle:"blue"}}),w=i().Bodies.rectangle(n.width/2-22.5-8,n.height-20,8,40,{isStatic:!0,render:{fillStyle:"blue"}}),m=i().Bodies.rectangle(n.width/2+22.5+8,n.height-20,8,40,{isStatic:!0,render:{fillStyle:"blue"}});i().World.add(e.world,[f,p,w,m]);const y=E.split("\n").map((e=>{const[t,r]=e.split(",");return{name:t,score:parseInt(r,10)?parseInt(r,10):1}})),x=[],_=B;y.forEach(((e,t)=>{if(!_[e.name]){const r=360*t/y.length;_[e.name]="hsl(".concat(r,", 100%, 50%)")}Array.from({length:e.score}).forEach(((t,r)=>{const l=20+Math.random()*(n.width-40),a=20+Math.random()*(n.height-190),s=_[e.name],c=i().Bodies.circle(l,a,20,{restitution:1,friction:0,frictionAir:0,frictionStatic:0,inertia:1/0,render:{fillStyle:s},label:e.name,customColor:s});o.current.push(c),x.push({x:l,y:a,color:s,label:e.name})}))})),h(x),v(_),i().Render.run(t);const b=i().Runner.create();return i().Runner.run(b,e),()=>{i().Render.stop(t),i().Runner.stop(b),i().World.clear(e.world),i().Engine.clear(e),t.canvas.remove(),t.canvas=null,t.context=null,t.textures={}}}),[E,B,C]),(0,s.jsxs)("div",{children:[(0,s.jsx)("button",{onClick:()=>{if(C)return p(!1),d(null),o.current.forEach((e=>{i().World.add(l.current.world,e);const t=.1*(Math.random()-.5),r=.1*(Math.random()-.5);i().Body.applyForce(e,{x:e.position.x,y:e.position.y},{x:t,y:r})})),l.current.world.gravity.y=1,o.current.forEach((e=>{i().Body.set(e,{restitution:.5})})),void i().Events.on(l.current,"afterUpdate",(()=>{x(!0),o.current.forEach(((e,t)=>{e.position.y>r.current.offsetHeight&&(W((t=>[...t,e.label])),i().World.remove(l.current.world,e),o.current.splice(t,1))})),0===o.current.length&&i().Events.off(l.current,"afterUpdate")}));p(!1),o.current.forEach((e=>{i().World.add(l.current.world,e);const t=.1*(Math.random()-.5),r=.1*(Math.random()-.5);i().Body.applyForce(e,{x:e.position.x,y:e.position.y},{x:t,y:r})})),setTimeout((()=>{l.current.world.gravity.y=1,o.current.forEach((e=>{i().Body.set(e,{restitution:.5})})),setTimeout((()=>{i().World.remove(l.current.world,[w,m]),setTimeout((()=>{let e=o.current[0],t=0;o.current.forEach(((r,n)=>{r.position.y>e.position.y&&(e=r,t=n)}));const r=o.current.map((e=>({color:e.customColor,label:e.label,x:e.position.x,y:e.position.y,visible:!0})));h(r),d(t),i().World.remove(l.current.world,o.current),b(t),p(!0),x(!0),W((t=>[...t,e.label]))}),4e3)}),3e3)}),3e3)},className:a.selectButton,children:"SELECT"}),y&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("button",{onClick:()=>{window.location.reload()},children:"RESET"}),!C&&(0,s.jsx)("button",{onClick:()=>{const e=u[_].label,t=E.split("\n").map((t=>{const[r,n]=t.split(",");if(r===e){const e=parseInt(n,10)-1;return"".concat(r,",").concat(e)}return t})).filter((e=>!e.includes(",0"))).join("\n");x(!1),d(null),R(t)},children:"RESET WITHOUT WINNING BALL"}),!C&&(0,s.jsx)("button",{onClick:()=>{const e=u[_].label,t=E.split("\n").filter((t=>!t.startsWith(e))).join("\n");x(!1),d(null),R(t)},children:"RESET WITHOUT WINNER"})]}),(0,s.jsx)("div",{ref:r,className:a.gameArea,children:f&&u.map(((e,t)=>(0,s.jsx)("div",{id:"ball-".concat(t),className:"".concat(a.ball," ").concat(c===t?a.expanded:""),onClick:()=>(e=>{d(e)})(t),style:{backgroundColor:e.color,top:"".concat(e.y-20,"px"),left:"".concat(e.x-20,"px")},children:c===t?(0,s.jsx)("span",{className:a.ballText,children:e.label}):null},t)))}),y&&(0,s.jsxs)("div",{className:a.winnersPanel,children:[(0,s.jsx)("h3",{children:"Results"}),(0,s.jsx)("div",{className:a.winnersList,children:j.map(((e,t)=>(0,s.jsxs)(n.Fragment,{children:[(0,s.jsxs)("div",{className:a.winner,children:[t+1,". ",e]}),N>1&&(t+1)%N===0&&(0,s.jsx)("hr",{className:a.separator})]},t)))})]})]})}}}]);
//# sourceMappingURL=161.ad030794.chunk.js.map