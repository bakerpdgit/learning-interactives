"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[228],{6228:(e,t,s)=>{s.r(t),s.d(t,{default:()=>m});var a=s(2791);const c="WordMatch_wordMatchContainer__tw+Nz",r="WordMatch_inputRow__fd3A-",n="WordMatch_inputBox__HdtAq",o="WordMatch_wordBox__QrQbp",d="WordMatch_wordsContainer__pEMaR",l="WordMatch_wordRow__gr50W",i="WordMatch_correctChar__+OnUc",h="WordMatch_inWordChar__SR1Zh",_="WordMatch_wrongChar__JwavM",u="WordMatch_correctBox__-3vgO",M="WordMatch_unusedBox__QO67Y",p="WordMatch_score__ZPz+G",w="WordMatch_celebration__7EMPC";var v=s(184);const m=e=>{let{text:t}=e;const[s,m]=(0,a.useState)(""),[x,W]=(0,a.useState)([]),[f,g]=(0,a.useState)(""),[C,k]=(0,a.useState)([]),[j,N]=(0,a.useState)(0),[S,y]=(0,a.useState)(0);(0,a.useEffect)((()=>{if(t.includes("\n\n")){const[e,s]=t.split("\n\n",2);g(e);const a=s.split("\n");k(a),N(Math.max(...a.map((e=>e.length))))}else{const e=t.split("\n");k(e),N(Math.max(...e.map((e=>e.length))))}}),[t]),(0,a.useEffect)((()=>{const e=e=>{"Backspace"===e.key?m((e=>e.slice(0,-1))):/^[a-zA-Z]$/.test(e.key)&&m((t=>(t+e.key.toLowerCase()).slice(0,j)))};return window.addEventListener("keydown",e),()=>{window.removeEventListener("keydown",e)}}),[j]),(0,a.useEffect)((()=>{(e=>{const t=C.filter((t=>t===e&&!x.includes(t)));t.length>0&&(W([...x,...t]),y((e=>e+1)),m(""))})(s)}),[s,x,C]);return(0,v.jsxs)("div",{className:c,children:[(0,v.jsx)("h1",{children:f}),(0,v.jsxs)("div",{className:p,children:["Score: ",S]}),(0,v.jsx)("div",{className:r,children:Array.from({length:j},((e,t)=>(0,v.jsx)("div",{className:n,children:s[t]||""},t)))}),(0,v.jsx)("div",{className:d,children:C.map(((e,t)=>(0,v.jsx)("div",{className:l,children:Array.from({length:j},((t,a)=>{const c=s[a]||"",r=""!==c&&e[a]&&c.toUpperCase()===e[a].toUpperCase(),n=""!==c&&e.includes(c),d=a>=e.length?M:x.includes(e)?u:r?i:n?h:""!==c?_:"";return(0,v.jsx)("div",{className:"".concat(o," ").concat(d),children:x.includes(e)?e[a]||"":a<e.length?c:""},a)}))},t)))}),x.length===C.length&&(0,v.jsx)("div",{className:w,children:"\ud83c\udf89"})]})}}}]);
//# sourceMappingURL=228.029d1ec2.chunk.js.map