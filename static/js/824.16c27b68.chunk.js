"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[824],{4824:(e,t,n)=>{n.r(t),n.d(t,{default:()=>h});var s=n(2791);const r="GridSolve_GameAreaGrid__mB7tD",a="GridSolve_Card__yRXCO",c="GridSolve_text__UEUSs",i="GridSolve_answer__gu8Zb",l="GridSolve_centered_input__crZRD",o="GridSolve_celebrationGrid__6IEYp";var u=n(4657),d=n(184);const p=e=>{let{text:t,answer:n,onCorrect:r}=e;const[o,p]=(0,s.useState)(!1),[h,_]=(0,s.useState)(""),[m,v]=(0,s.useState)(!1),x=(0,s.useRef)(null);(0,s.useEffect)((()=>{o&&x.current.focus()}),[o]);return(0,d.jsxs)("div",{onClick:()=>{m||p(!0)},className:a,style:{fontSize:"1.4em",backgroundColor:m?"lightgreen":"transparent"},children:[(0,d.jsx)("div",{className:c,children:(0,d.jsx)(u.Z,{text:t,renderNewLines:!0})}),o&&(0,d.jsx)("input",{ref:x,className:l,type:"text",value:h,onChange:e=>{_(e.target.value)},onKeyPress:e=>{if("Enter"===e.key){p(!1);h.replace(/\s+/g,"").toLowerCase()===n.replace(/\s+/g,"").toLowerCase()&&(v(!0),r())}},style:{fontSize:"0.7em"}}),m&&(0,d.jsx)("div",{className:i,children:n})]})},h=e=>{let{text:t}=e;const[n,a]=(0,s.useState)(!1),[c,i]=(0,s.useState)(0),l=()=>{i((e=>{const t=e+1;return t===u.length&&(a(!0),setTimeout((()=>a(!1)),3e3)),t}))},u=t.split("\n\n").map((e=>{const t=e.split("\n"),n=t.pop();return{question:t.join("\n"),answer:n}}));return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("div",{className:r,children:u.map(((e,t)=>(0,d.jsx)(p,{text:e.question,answer:e.answer,onCorrect:l},t)))}),n&&(0,d.jsx)("div",{className:o,children:"\ud83c\udf89"})]})}},4657:(e,t,n)=>{n.d(t,{Z:()=>c});var s=n(8832),r=n(184);function a(e){const t=Math.random().toString(36).substring(2,10),n=e.split("$$"),a=[];return n.forEach(((e,n)=>{n%2===1?a.push((0,r.jsx)(s.InlineMath,{math:e},"MCIM-".concat(t,"-").concat(n))):a.push((0,r.jsx)("span",{children:e},"MCSP-".concat(t,"-").concat(n)))})),a}const c=function(e){let{text:t,renderNewLines:n=!1}=e;return n&&(t=(e=>e.replace(/\\n/g,"\n"))(t)),(0,r.jsx)("div",{style:{whiteSpace:t.includes("\n")&&n?"pre-wrap":"normal",marginTop:t.includes("$$")?"0.5em":"0"},children:a(t)})}}}]);
//# sourceMappingURL=824.16c27b68.chunk.js.map