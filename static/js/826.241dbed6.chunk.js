"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[826],{4657:(n,e,t)=>{t.d(e,{Z:()=>o});var s=t(8832),r=t(184);function i(n){const e=Math.random().toString(36).substring(2,10),t=n.split("$$"),i=[];return t.forEach(((n,t)=>{t%2===1?i.push((0,r.jsx)(s.InlineMath,{math:n},"MCIM".concat(e,"-").concat(t))):i.push((0,r.jsx)("span",{children:n},"MCSP$".concat(e,"-{index}")))})),i}const o=function(n){let{text:e,renderNewLines:t=!1}=n;return t&&(e=(n=>n.replace(/\\n/g,"\n"))(e)),(0,r.jsx)("div",{style:{whiteSpace:e.includes("\n")&&t?"pre-wrap":"normal",marginTop:e.includes("$$")?"0.5em":"0"},children:i(e)})}},826:(n,e,t)=>{t.r(e),t.d(e,{default:()=>o});var s=t(2791),r=t(4657),i=t(184);const o=function(n){let{text:e}=n,t=[];e&&(t=e.split("\n").filter((n=>n.trim())));const[o,c]=(0,s.useState)(t.map((n=>{const{question:e,answer:t}=(n=>{const e=/^(.*?)(?:@([^)]+))?$/.exec(n);return{question:e[1].trim(),answer:e[2]?e[2].trim():null}})(n),s=(n=>{const e=n.startsWith("*");return{isAlignedTopLeft:e,content:e?n.slice(1):n}})(e);return{question:e,answer:t,isAlignedTopLeft:s.isAlignedTopLeft,content:s.content,shown:0}})));return(0,i.jsx)(i.Fragment,{children:(0,i.jsx)("div",{className:"quizBoardContainer",children:(0,i.jsx)("div",{className:"board",children:o.map(((n,e)=>(0,i.jsx)("div",{className:"question "+(3===n.shown?"blue":4===n.shown?"red":5===n.shown?"grey":""),onClick:()=>(n=>{const e=[...o];e[n].shown=(e[n].shown+1)%6,2===e[n].shown&&null===e[n].answer&&(e[n].shown+=1),c(e)})(e),children:(0,i.jsx)("div",{className:"qtext ".concat(n.isAlignedTopLeft&&n.shown>0?"top-left":""),children:0===n.shown?"Q"+(e+1):1===n.shown?(0,i.jsx)(r.Z,{text:n.content,renderNewLines:!0}):2===n.shown?(0,i.jsx)(r.Z,{text:n.answer,renderNewLines:!0}):""})},e)))})})})}}}]);
//# sourceMappingURL=826.241dbed6.chunk.js.map