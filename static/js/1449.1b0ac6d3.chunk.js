"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[1449],{1449:(e,t,c)=>{c.r(t),c.d(t,{default:()=>f});var n=c(2791);const s="Connect_GameAreaGrid__rKelh",l="Connect_buttonarea__Xpdoh",a="Connect_tile__0wgd+",r="Connect_selected__2O-Fm",o="Connect_matched__DH8hl",i="Connect_incorrect__Cs5Ug",d="Connect_CorrectArea__-QfGo",_="Connect_CorrectGroup__Nb6YY",u="Connect_CorrectTile__Dvm-U",h="Connect_celebration__BDtAv";var m=c(184);const C=e=>{let{word:t,onToggle:c,isSelected:n,isIncorrect:s,isMatched:l}=e;return(0,m.jsx)("div",{className:"".concat(a," ").concat(n?r:""," ").concat(l?o:""," ").concat(s?i:""),onClick:()=>{l||c(t)},children:t})},f=e=>{let{text:t}=e;const[c,a]=(0,n.useState)(!1),[r,o]=(0,n.useState)([]),[i,f]=(0,n.useState)([]),[v,g]=(0,n.useState)([]),[p,x]=(0,n.useState)([]),[j,S]=(0,n.useState)([]),[N,k]=(0,n.useState)(!1);(0,n.useEffect)((()=>{const e=t.trim().split("\n\n").map((e=>e.split("\n")));x(e),o((e=>{let t=[...e];for(let c=t.length-1;c>0;c--){const e=Math.floor(Math.random()*(c+1));[t[c],t[e]]=[t[e],t[c]]}return t})(e.flat()))}),[t]),(0,n.useEffect)((()=>{v.length===p.length&&v.length>0&&(k(!0),setTimeout((()=>k(!1)),4e3))}),[v,p]);const b=e=>{f((t=>i.includes(e)?i.filter((t=>t!==e)):[...i,e]))},w=()=>{let e=[...j];p.forEach(((t,c)=>{const n=t.every((e=>i.includes(e))),s=i.every((e=>t.includes(e)));n&&s&&!v.includes(c)&&(g((e=>[...e,c])),e=[...e,t],o((e=>e.filter((e=>!t.includes(e))))))})),S(e),e.length===j.length&&(a(!0),setTimeout((()=>a(!1)),500)),f([])};return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)("p",{className:l,children:(0,m.jsx)("button",{onClick:()=>{w()},children:"Check"})}),(0,m.jsx)("div",{className:s,children:r.map(((e,t)=>(0,m.jsx)(C,{word:e,onToggle:b,isSelected:i.includes(e),isIncorrect:c},t)))}),(0,m.jsx)("div",{className:d,children:j.map(((e,t)=>(0,m.jsx)("div",{className:_,children:e.map((e=>(0,m.jsx)("div",{className:u,children:e},e)))},t)))}),N&&(0,m.jsx)("div",{className:h,children:"\ud83c\udf89"})]})}}}]);
//# sourceMappingURL=1449.1b0ac6d3.chunk.js.map