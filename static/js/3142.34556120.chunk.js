"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[3142],{3142:(e,t,n)=>{n.r(t),n.d(t,{default:()=>l});var r=n(2791),s=n(9962),i=n.n(s),a=n(4657),c=n(5249),o=n(184);const l=function(e){let{text:t}=e;const[n,s]=(0,r.useState)(!0),[l,d]=(0,r.useState)({}),p=t.split("\n\n")[0].split("\n"),h=t.split("\n\n")[1].split("\n").map((e=>{const[t,n]=e.split("@");return{word:t,catIndex:n?parseInt(n):null}})),u=.9*window.innerHeight,m=window.innerWidth,x=h.map((e=>({...e,x:window.innerWidth/2+(-.5+Math.random())*m*.5,y:window.innerHeight/2+(-.5+Math.random())*u*.5}))),[w,g]=(0,r.useState)(x),v=p.length;let f=Math.round(Math.sqrt(v)),j=Math.ceil(v/f);const y={gridTemplateRows:"repeat(".concat(f,", 1fr)"),gridTemplateColumns:"repeat(".concat(j,", 1fr)")};return(0,r.useEffect)((()=>{const e=setTimeout((()=>{s(!1)}),1e3);return()=>clearTimeout(e)}),[]),(0,o.jsxs)(o.Fragment,{children:[l.prompt&&(0,o.jsx)(c.Z,{title:l.prompt,placeholder:"Type here...",value:l.value,onSubmit:e=>{if(e){const t={word:e,catIndex:null,x:window.innerWidth/2,y:window.innerHeight/2};g((e=>[...e,t]))}d({})},onClose:()=>d({})}),(0,o.jsx)("button",{onClick:()=>{d({prompt:"Please enter text for the new item:",value:""})},className:"addItemBtn",children:"Add item"}),(0,o.jsxs)("div",{className:"CategoryMatch",style:y,children:[p.map(((e,t)=>(0,o.jsx)("div",{className:"categoryBox",children:e},t))),!n&&w.map(((e,t)=>(0,o.jsx)(i(),{position:{x:e.x,y:e.y},onStop:(t,n)=>((e,t,n)=>{const r=w.map((e=>e.word===n.word?{...e,x:t.x,y:t.y}:e));g(r)})(0,n,e),children:(0,o.jsxs)("div",{style:{zIndex:t+1},className:"term",children:[(0,o.jsx)("div",{className:"positionMarker",onClick:()=>{return t=e,void g((e=>e.filter((e=>e!==t))));var t}}),(0,o.jsx)(a.Z,{text:e.word,renderNewLines:!0})]})},t))),n&&(0,o.jsx)("div",{className:"instruction",children:(0,o.jsx)("p",{children:"Drag each term to its category..."})})]})]})}},4657:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(8832),s=n(184);function i(e){const t=Math.random().toString(36).substring(2,10),n=e.split("$$"),i=[];return n.forEach(((e,n)=>{n%2===1?i.push((0,s.jsx)(r.InlineMath,{math:e},"MCIM-".concat(t,"-").concat(n))):i.push((0,s.jsx)("span",{children:e},"MCSP-".concat(t,"-").concat(n)))})),i}const a=function(e){let{text:t,renderNewLines:n=!1}=e;return n&&(t=(e=>e.replace(/\\n/g,"\n"))(t)),(0,s.jsx)("div",{style:{whiteSpace:t.includes("\n")&&n?"pre-wrap":"normal",marginTop:t.includes("$$")?"0.5em":"0"},children:i(t)})}}}]);
//# sourceMappingURL=3142.34556120.chunk.js.map