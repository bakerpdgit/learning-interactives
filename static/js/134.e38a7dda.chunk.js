"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[134],{7134:(e,t,s)=>{s.r(t),s.d(t,{default:()=>o});var l=s(2791),a=s(2917),i=s(7394),n=s(8264);const r={phraseMemoriseBox:"PhraseMemorise_phraseMemoriseBox__qw1We",letter:"PhraseMemorise_letter__wBn6U",clickableWord:"PhraseMemorise_clickableWord__X0GpL"};var c=s(184);const o=function(e){let{text:t}=e;const[s,o]=(0,l.useState)([]),[h,p]=(0,l.useState)(0),[d,f]=(0,l.useState)([]),[m,u]=(0,l.useState)("first");(0,l.useEffect)((()=>{const e=t.split("\n"),s=e.find((e=>e.startsWith("OPTIONS:")));let l="maintain";if(s){s.split(":")[1].split(",").forEach((e=>{const[t,s]=e.split("=");"show"===t&&u(s),"order"===t&&(l=s)}))}let a=e.filter((e=>e&&!e.startsWith("OPTIONS:")));"random"===l&&(a=(e=>{for(let t=e.length-1;t>0;t--){const s=Math.floor(Math.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}return e})(a)),o(a),p(0)}),[t]),(0,l.useEffect)((()=>{if(s.length>0&&h<s.length){const e=s[h].split(" ").filter((e=>e)).map((()=>"all"===m?"full":"none"===m?"hidden":"first"));f(e)}}),[h,s,m]);const x=s.length>0&&h<s.length?s[h].split(" ").filter((e=>e)):[],j=(e,t)=>"full"===t?e.split("").map(((e,t)=>(0,c.jsx)("span",{className:r.letter,children:e},t))):"first"===t?[e.charAt(0),..."_".repeat(e.length-1).split("")].map(((e,t)=>(0,c.jsx)("span",{className:r.letter,children:e},t))):"_".repeat(e.length).split("").map(((e,t)=>(0,c.jsx)("span",{className:r.letter,children:e},t)));return(0,c.jsx)(c.Fragment,{children:(0,c.jsxs)("div",{className:"interactiveContainer ".concat(r.phraseMemoriseContainer),children:[(0,c.jsx)("div",{className:r.phraseMemoriseBox,children:x.map(((e,t)=>(0,c.jsxs)("span",{className:r.clickableWord,onClick:()=>(e=>{const t=[...d];"full"===t[e]?t[e]="hidden":"first"===t[e]?t[e]="full":t[e]="first",f(t)})(t),children:[j(e,d[t])," "]},t)))}),s.length>1&&(0,c.jsxs)("div",{className:r.navigationButtons,children:[(0,c.jsx)(a.Z,{onClick:()=>{h>0&&(p(h-1),f(s[h-1].split(" ").map((()=>"first"))))},disabled:0===h,children:(0,c.jsx)(i.Z,{})}),(0,c.jsx)(a.Z,{onClick:()=>{h<s.length-1&&(p(h+1),f(s[h+1].split(" ").map((()=>"first"))))},disabled:h===s.length-1,children:(0,c.jsx)(n.Z,{})})]}),(0,c.jsxs)("div",{className:r.actionButtons,children:[(0,c.jsx)("button",{onClick:()=>{f(new Array(x.length).fill("full"))},children:"Reveal"}),(0,c.jsx)("button",{onClick:()=>{f(x.map((()=>m)))},children:"Reset"})]})]})})}}}]);
//# sourceMappingURL=134.e38a7dda.chunk.js.map