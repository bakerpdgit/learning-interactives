"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[306],{3142:(e,t,n)=>{n.r(t),n.d(t,{default:()=>o});var r=n(2791),s=n(9962),i=n.n(s),a=n(4657),c=n(184);const o=function(e){let{text:t}=e;const[n,s]=(0,r.useState)(!0),o=t.split("\n\n")[0].split("\n"),d=t.split("\n\n")[1].split("\n").map((e=>{const[t,n]=e.split("@");return{word:t,catIndex:n?parseInt(n):null}})),l=.9*window.innerHeight,p=window.innerWidth,h=d.map((e=>({...e,x:window.innerWidth/2+(-.5+Math.random())*p*.5,y:window.innerHeight/2+(-.5+Math.random())*l*.5}))),[m,u]=(0,r.useState)(h),w=o.length;let x=Math.round(Math.sqrt(w)),f=Math.ceil(w/x);const y={gridTemplateRows:"repeat(".concat(x,", 1fr)"),gridTemplateColumns:"repeat(".concat(f,", 1fr)")};return(0,r.useEffect)((()=>{const e=setTimeout((()=>{s(!1)}),1e3);return()=>clearTimeout(e)}),[]),(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)("button",{onClick:()=>{const e=window.prompt("Please enter text for the new item:");if(e){const t={word:e,catIndex:null,x:window.innerWidth/2,y:window.innerHeight/2};u((e=>[...e,t]))}},className:"addItemBtn",children:"Add item"}),(0,c.jsxs)("div",{className:"CategoryMatch",style:y,children:[o.map(((e,t)=>(0,c.jsx)("div",{className:"categoryBox",children:e},t))),!n&&m.map(((e,t)=>(0,c.jsx)(i(),{position:{x:e.x,y:e.y},onStop:(t,n)=>((e,t,n)=>{const r=m.map((e=>e.word===n.word?{...e,x:t.x,y:t.y}:e));u(r)})(0,n,e),children:(0,c.jsxs)("div",{style:{zIndex:t+1},className:"term",children:[(0,c.jsx)("div",{className:"positionMarker",onClick:()=>{return t=e,void u((e=>e.filter((e=>e!==t))));var t}}),(0,c.jsx)(a.Z,{text:e.word,renderNewLines:!0})]})},t))),n&&(0,c.jsx)("div",{className:"instruction",children:(0,c.jsx)("p",{children:"Drag each term to its category..."})})]})]})}},4657:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(8832),s=n(184);function i(e){const t=e.split("$$"),n=[];return t.forEach(((e,t)=>{t%2===1?n.push((0,s.jsx)(r.InlineMath,{math:e},"MCIM".concat(t))):n.push((0,s.jsx)("span",{children:e},"MCSP".concat(t)))})),n}const a=function(e){let{text:t,renderNewLines:n=!1}=e;return n&&(t=(e=>e.replace(/\\n/g,"\n"))(t)),(0,s.jsx)("div",{style:{whiteSpace:t.includes("\n")&&n?"pre-wrap":"normal",marginTop:t.includes("$$")?"0.5em":"0"},children:i(t)})}}}]);
//# sourceMappingURL=306.22e7cd90.chunk.js.map