"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[7922],{4657:(e,t,s)=>{s.d(t,{Z:()=>l});var n=s(8832),r=s(184);function c(e){const t=Math.random().toString(36).substring(2,10),s=e.split("$$"),c=[];return s.forEach(((e,s)=>{s%2===1?c.push((0,r.jsx)(n.InlineMath,{math:e},"MCIM-".concat(t,"-").concat(s))):c.push((0,r.jsx)("span",{children:e},"MCSP-".concat(t,"-").concat(s)))})),c}const l=function(e){let{text:t,renderNewLines:s=!1}=e;return s&&(t=(e=>e.replace(/\\n/g,"\n"))(t)),(0,r.jsx)("div",{style:{whiteSpace:t.includes("\n")&&s?"pre-wrap":"normal",marginTop:t.includes("$$")?"0.5em":"0"},children:c(t)})}},7922:(e,t,s)=>{s.r(t),s.d(t,{default:()=>l});var n=s(2791),r=s(4657),c=s(184);const l=function(e){let{text:t}=e;const[s,...l]=t.split("\n\n"),i=s.startsWith("OPTIONS:")?s:null,a=i?l.join("\n\n"):t,o={time:"unlimited",scroll:"yes",immediate:"no",...i&&i.startsWith("OPTIONS:")?Object.fromEntries(i.slice(8).split(",").map((e=>e.split("=")))):{}};function u(e){let t,s=e.length;for(;0!==s;)t=Math.floor(Math.random()*s),s--,[e[s],e[t]]=[e[t],e[s]];return e}const[d]=(0,n.useState)((()=>a.split("\n\n").map((e=>{const[t,...s]=e.split("\n");return{question:t,answers:u(s.map((e=>({text:e.replace("*",""),correct:e.startsWith("*")}))))}})))),[m,h]=(0,n.useState)(o.time&&!isNaN(o.time)?parseInt(o.time):null),[x,p]=(0,n.useState)(Array(d.length).fill(null)),[j,w]=(0,n.useState)(null),[N,f]=(0,n.useState)(0),b=(0,n.useCallback)((()=>{const e=x.reduce(((e,t,s)=>d[s].answers[t]&&d[s].answers[t].correct?e+1:e),0),t=d.filter((e=>e.answers.some((e=>e.correct)))).length;w({correct:e,total:t}),h(null)}),[x,d]);(0,n.useEffect)((()=>{if(null===j){if(null!==m&&m>0){const e=setTimeout((()=>h(m-1)),1e3);return()=>clearTimeout(e)}0===m&&b()}}),[m,b,j]);const v=(e,t)=>{if(null!==j)return;if("yes"===o.immediate&&null!==x[e])return;const s=[...x];s[e]=t,p(s)};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)("div",{className:"submissionInfo",children:[null==j&&(0,c.jsxs)("button",{onClick:b,disabled:null!==j,children:["Submit Answers",null!==m?" (".concat(m,"s)"):""]}),null!==j&&(0,c.jsxs)("div",{className:"score",children:["Score: ",j.correct,"/",j.total]})]}),(0,c.jsx)("div",{className:"multiChoiceContainer",children:(0,c.jsx)("div",{className:"gameArea",children:"yes"===o.scroll?d.map(((e,t)=>(0,c.jsxs)("div",{className:"questionBox",children:[(0,c.jsxs)("div",{className:"questionText",children:[t+1,"."," ",(0,c.jsx)(r.Z,{text:e.question,renderNewLines:!0})]}),e.answers.map(((s,n)=>(0,c.jsx)("button",{className:"answerOption ".concat(x[t]===n?null!==j&&!s.correct&&e.answers.some((e=>e.correct))?"incorrectAnswer":"selected":""," ").concat(null===j&&"yes"!==o.immediate||!s.correct||null===x[t]?"":"correctAnswer"),onClick:()=>v(t,n),children:(0,c.jsx)(r.Z,{text:s.text,renderNewLines:!0})},n)))]},t))):(0,c.jsxs)("div",{className:"questionBox",children:[(0,c.jsxs)("div",{className:"questionText",children:[N+1,"."," ",(0,c.jsx)(r.Z,{text:d[N].question,renderNewLines:!0})]}),d[N].answers.map(((e,t)=>(0,c.jsx)("button",{className:"answerOption ".concat(x[N]===t?null!==j&&!e.correct&&d[N].answers.some((e=>e.correct))?"incorrectAnswer":"selected":""," ").concat(null===j&&"yes"!==o.immediate||!e.correct||null===x[N]?"":"correctAnswer"),onClick:()=>v(N,t),children:(0,c.jsx)(r.Z,{text:e.text,renderNewLines:!0})},t))),(0,c.jsxs)("div",{className:"navigationButtons",children:[(0,c.jsx)("button",{onClick:()=>f(0),disabled:0===N,children:"<< First"}),(0,c.jsx)("button",{onClick:()=>f(N-1),disabled:0===N,children:"< Previous"}),(0,c.jsx)("button",{onClick:()=>f(N+1),disabled:N===d.length-1,children:"> Next"}),(0,c.jsx)("button",{onClick:()=>f(d.length-1),disabled:N===d.length-1,children:">> Last"})]})]})})})]})}}}]);
//# sourceMappingURL=7922.76bf8a53.chunk.js.map