"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[805],{805:(t,e,r)=>{r.r(e),r.d(e,{default:()=>a});var i=r(2791),n=r(8832);const s={lorContainer:"LeftOrRight_lorContainer__3Bw+g",lorPair:"LeftOrRight_lorPair__0JWGm",lorBox:"LeftOrRight_lorBox__OZHcC",selected:"LeftOrRight_selected__mxPF4",lorResult:"LeftOrRight_lorResult__SfnQO",SubmitButton:"LeftOrRight_SubmitButton__oSKgg",celebration:"LeftOrRight_celebration__oUriz",scale:"LeftOrRight_scale__HQ0Co",hide:"LeftOrRight_hide__wIM4m",score:"LeftOrRight_score__IMiKp"};var l=r(184);function c(t){const e=t.split("$$"),r=[];return e.forEach(((t,e)=>{e%2===1?r.push((0,l.jsx)(n.InlineMath,{math:t})):r.push((0,l.jsx)("span",{children:t}))})),r}function o(t){let{text:e}=t;return(0,l.jsx)(l.Fragment,{children:c(e)})}const a=function(t){let{text:e}=t;const r=function(t){return t.split("\n\n").map((t=>{const e=t.split("\n---\n"),r=e[0]?e[0].replace("*",""):"",i=e[1]?e[1].replace("*",""):"";return{left:{text:r,correct:e[0]&&e[0].startsWith("*")},right:{text:i,correct:e[1]&&e[1].startsWith("*")}}}))}(e),[n,c]=(0,i.useState)(Array(r.length).fill(null)),[a,h]=(0,i.useState)(!1),[u,d]=(0,i.useState)(!1);if(!e||"string"!==typeof e)return(0,l.jsx)("div",{children:"Error: Invalid input provided."});const _=(t,e)=>{if(a)return;const r=[...n];r[t]=e,c(r)},f=()=>r.reduce(((t,e,r)=>{const i=n[r];return i&&e[i].correct&&(t+=1),t}),0);return(0,l.jsxs)(l.Fragment,{children:[u&&(0,l.jsx)("div",{className:s.celebration,children:(0,l.jsx)("span",{children:"\ud83c\udfc6"})}),(0,l.jsxs)("div",{className:"interactiveContainer ".concat(s.lorContainer),children:[r.map(((t,e)=>(0,l.jsxs)("div",{className:s.lorPair,children:[(0,l.jsx)("div",{className:[s.lorBox,"left"===n[e]&&s.selected].filter(Boolean).join(" "),onClick:()=>_(e,"left"),children:(0,l.jsx)(o,{text:t.left.text})}),(0,l.jsx)("div",{className:s.lorResult,children:a&&n[e]&&(t[n[e]].correct?"\u2705":"\u274c")}),(0,l.jsx)("div",{className:[s.lorBox,"right"===n[e]&&s.selected].filter(Boolean).join(" "),onClick:()=>_(e,"right"),children:(0,l.jsx)(o,{text:t.right.text})})]},e))),r.some((t=>t.left.correct||t.right.correct))&&(0,l.jsx)("button",{onClick:()=>{h(!0),f()===r.length&&d(!0)},className:s.SubmitButton,children:"Submit"}),a&&(0,l.jsxs)("div",{className:s.score,children:["You scored ",f()]})]})]})}}}]);
//# sourceMappingURL=805.9827c339.chunk.js.map