"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[305],{9305:(e,t,s)=>{s.r(t),s.d(t,{default:()=>l});var a=s(2791),n=s(184);const l=function(e){let{text:t}=e;const[s,l]=(0,a.useState)(!1),c=t.split("\n").map((e=>{const t=e.split(":");return{label:t[0],score:t.length>1?parseInt(t[1],10):0}})),[r,i]=(0,a.useState)(c.map((e=>e.score))),[o,d]=(0,a.useState)(1.5),x=e=>{let{label:t,score:s,index:a}=e;return(0,n.jsxs)("div",{style:{flex:1,padding:"10px",margin:"10px",display:"flex",alignItems:"center",justifyContent:"flex-start",border:"1px solid black"},className:"ScoreBar",children:[(0,n.jsx)("button",{className:"buttonSCLeft",onClick:()=>p(a),children:"-"}),(0,n.jsx)("button",{className:"buttonSCRight",onClick:()=>u(a),children:"+"}),t,(0,n.jsx)("span",{style:{fontSize:"".concat(o,"em")},children:"\u2b50".repeat(s)})]})},u=e=>{const t=[...r];t[e]+=1,i(t)},p=e=>{const t=[...r];t[e]=Math.max(0,t[e]-1),i(t)},m=c.map(((e,t)=>(0,n.jsx)(x,{label:e.label,score:r[t],index:t},t)));return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("div",{align:"center",children:[(0,n.jsx)("button",{className:"buttonSCLeft",onClick:()=>{d(Math.max(.1,o-.1))},children:"-"}),(0,n.jsx)("button",{className:"buttonSCRight",onClick:()=>{d(o+.1)},children:"+"})]}),(0,n.jsx)("div",{className:"GameAreaSC",children:m}),s&&(0,n.jsx)("div",{className:"celebration",children:"\ud83c\udf89"})]})}}}]);
//# sourceMappingURL=305.e753d4eb.chunk.js.map