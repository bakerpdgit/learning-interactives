"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[852],{852:(e,t,a)=>{a.r(t),a.d(t,{default:()=>d});var r=a(2791);const c={timer:"TimeRecorder_timer__ZPnoz",button:"TimeRecorder_button__ATNIX",controls:"TimeRecorder_controls__KXaWb",categories:"TimeRecorder_categories__DlZgo",category:"TimeRecorder_category__GO6T5",categoryButton:"TimeRecorder_categoryButton__HGinF",selected:"TimeRecorder_selected__YMAZG",categoryTime:"TimeRecorder_categoryTime__g9v87",addCategory:"TimeRecorder_addCategory__zOif5",addCategoryButton:"TimeRecorder_addCategoryButton__R0mP3",exportButton:"TimeRecorder_exportButton__BAPue",GameArea:"TimeRecorder_GameArea__yTGZI"};var s=a(184);const o=e=>{let{time:t}=e;const a=Math.floor(t/60),r=t%60;return(0,s.jsxs)("div",{className:c.timer,children:[a,":",r<10?"0".concat(r):r]})},n=e=>{let{onClick:t,label:a,disabled:r}=e;return(0,s.jsx)("button",{onClick:t,className:c.button,disabled:r,children:a})},i=e=>{let{name:t,time:a,isSelected:r,onClick:o}=e;const n=Math.floor(a/60),i=a%60;return(0,s.jsxs)("div",{className:c.category,children:[(0,s.jsx)("div",{className:"".concat(c.categoryButton," ").concat(r?c.selected:""),onClick:()=>o(t),children:t}),(0,s.jsxs)("div",{className:c.categoryTime,children:[n,":",i<10?"0".concat(i):i]})]})},l=e=>{let{initialTime:t=0,categories:a=[]}=e;const[l,d]=(0,r.useState)(t),[m,u]=(0,r.useState)(!1),[_,T]=(0,r.useState)(!1),[g,x]=(0,r.useState)(null),[h,y]=(0,r.useState)(0),[j,p]=(0,r.useState)(null),[b,v]=(0,r.useState)(!1),R=(0,r.useRef)(null),[C,S]=(0,r.useState)("OTHER"),[f,N]=(0,r.useState)(a),[k,A]=(0,r.useState)(a.reduce(((e,t)=>(e[t]=0,e)),{OTHER:0})),[O,B]=(0,r.useState)(!1);(0,r.useEffect)((()=>{let e;return m&&!_&&(e=setInterval((()=>{const a=(new Date).getTime(),r=Math.floor((a-j)/1e3),c=Math.floor((a-g-h)/1e3),s=t>0?Math.max(t-c,0):c;d(s),A((e=>{const t={...e};return t[C]+=r,t})),p(a),0===s&&t>0&&(clearInterval(e),u(!1),T(!1),B(!0))}),1e3)),()=>clearInterval(e)}),[m,_,g,h,t,j,C]);const E=e=>{S(e)};return(0,s.jsxs)("div",{className:c.timeRecorder,children:[(0,s.jsx)(o,{time:l}),(0,s.jsxs)("div",{className:c.controls,children:[(0,s.jsx)(n,{onClick:()=>{const e=(new Date).getTime();p(e),m?_?(T(!1),y(h+(e-j))):(T(!0),y(h+(e-j))):(u(!0),T(!1),x(e))},label:_||!m?"START":"PAUSE",disabled:O}),(0,s.jsx)(n,{onClick:()=>{u(!1),T(!1),B(!0),v(!0)},label:"END",disabled:O})]}),(0,s.jsx)("div",{className:c.categories,children:["OTHER",...f].map((e=>(0,s.jsx)(i,{name:e,time:k[e],isSelected:C===e,onClick:E},e)))}),(0,s.jsxs)("div",{className:c.addCategory,children:[(0,s.jsx)("input",{type:"text",ref:R,placeholder:"New category"}),(0,s.jsx)(n,{onClick:()=>{const e=R.current.value;e&&!k.hasOwnProperty(e)&&(A((t=>({...t,[e]:0}))),N((t=>[...t,e]))),R.current.value=""},label:"Add Category"})]}),(0,s.jsx)("div",{className:c.export,children:(0,s.jsx)(n,{onClick:()=>{const e="data:text/csv;charset=utf-8,"+["Category,Time (seconds)",...Object.entries(k).map((e=>{let[t,a]=e;return"".concat(t,",").concat(a)}))].join("\n"),t=encodeURI(e),a=document.createElement("a");a.setAttribute("href",t),a.setAttribute("download","category_times.csv"),document.body.appendChild(a),a.click()},label:"Export",disabled:!b})})]})};const d=function(e){let{text:t}=e;const a=t.split("\n"),r=a[0].startsWith("OPTIONS:time=")?parseInt(a[0].split("=")[1],10):0,o=a.slice(r?1:0);return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)("div",{className:c.GameArea,children:(0,s.jsx)(l,{initialTime:r,categories:o})})})}}}]);
//# sourceMappingURL=852.7ae746d2.chunk.js.map