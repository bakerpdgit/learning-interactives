"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[8209],{8209:(e,t,r)=>{r.r(t),r.d(t,{default:()=>h});var s=r(2791);const d={interactiveSubTitle:"WordSearch_interactiveSubTitle__A1P3Z",GameArea:"WordSearch_GameArea__tAV2U",RevealButton:"WordSearch_RevealButton__sQxtH",Container:"WordSearch_Container__jr9bd",WordSearchGrid:"WordSearch_WordSearchGrid__aeVss",WordSearchRow:"WordSearch_WordSearchRow__ZqvBD",WordSearchCell:"WordSearch_WordSearchCell__ohZaY",WordList:"WordSearch_WordList__xjQX-",RevealedCell:"WordSearch_RevealedCell__7EwFz",SelectedCell:"WordSearch_SelectedCell__U1bv+",FoundCell:"WordSearch_FoundCell__kpWJP",FoundWord:"WordSearch_FoundWord__AOkoD",celebration:"WordSearch_celebration__-OI9z",scale:"WordSearch_scale__Ods1w",hide:"WordSearch_hide__8wt9y"};var o=r(184);function a(e,t,r){const s=r?[{dx:1,dy:0},{dx:0,dy:1},{dx:1,dy:1},{dx:-1,dy:1}]:[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1},{dx:1,dy:1},{dx:-1,dy:1},{dx:1,dy:-1},{dx:-1,dy:-1}];let d=Array.from({length:e},(()=>Array(e).fill(""))),o=[],a=[];t.forEach((t=>{let l=[],c=[],h=[];for(let o=0;o<e;o++)for(let a=0;a<e;a++)s.forEach((e=>{const{fits:s,hasOverlap:i,isIsolated:u}=n(d,t,o,a,e,r);if(s){const r={word:t,startRow:o,startCol:a,direction:e};u?(l.push(r),i&&(l.push(r),l.push(r),l.push(r),l.push(r))):i?c.push(r):h.push(r)}}));let u=l.length>0?l:c.length>0?c:h;if(!(u.length>0))return{grid:[],wordPlacements:[],usedCoordinates:[]};{const e=u[Math.floor(Math.random()*u.length)];i(d,e.word,e.startRow,e.startCol,e.direction),o.push(e);for(let r=0;r<t.length;r++){const t=e.startRow+r*e.direction.dy,s=e.startCol+r*e.direction.dx;a.push("".concat(t,"-").concat(s))}}}));for(let n=0;n<e;n++)for(let t=0;t<e;t++)""===d[n][t]&&(d[n][t]=String.fromCharCode(Math.floor(26*Math.random())+65));return{grid:d,wordPlacements:o,usedCoordinates:a}}function n(e,t,r,s,d,o){let a=!1,n=!0,i=e.map((e=>e.slice()));for(let c=0;c<t.length;c++){const n=r+c*d.dy,h=s+c*d.dx;if(n<0||n>=e.length||h<0||h>=e[0].length)return{fits:!1,hasOverlap:!1,isIsolated:!1};if(""!==e[n][h]&&e[n][h]!==t[c])return{fits:!1,hasOverlap:!1,isIsolated:!1};if(e[n][h]===t[c]){if(a=!0,o)return{fits:!1,hasOverlap:!0,isIsolated:!1};l(i,n,h)}}return n=function(e,t,r,s,d){for(let o=0;o<s;o++){if(!c(e,t+o*d.dy,r+o*d.dx))return!1}return!0}(i,r,s,t.length,d),{fits:!0,hasOverlap:a,isIsolated:n}}function l(e,t,r){[{dx:-1,dy:-1},{dx:0,dy:-1},{dx:1,dy:-1},{dx:-1,dy:0},{dx:1,dy:0},{dx:-1,dy:1},{dx:0,dy:1},{dx:1,dy:1}].forEach((s=>{let{dx:d,dy:o}=s;const a=t+o,n=r+d;a>=0&&a<e.length&&n>=0&&n<e[0].length&&(e[a][n]="")})),e[t][r]=""}function c(e,t,r){const s=[{dx:-1,dy:-1},{dx:0,dy:-1},{dx:1,dy:-1},{dx:-1,dy:0},{dx:1,dy:0},{dx:-1,dy:1},{dx:0,dy:1},{dx:1,dy:1}];for(const{dx:d,dy:o}of s){const s=t+o,a=r+d;if(s>=0&&s<e.length&&a>=0&&a<e[0].length&&""!==e[s][a])return!1}return!0}const i=(e,t,r,s,d)=>{for(let o=0;o<t.length;o++){const a=r+o*d.dy,n=s+o*d.dx;e[a][n]=t[o]}},h=function(e){let{text:t}=e;const[r,n]=(0,s.useState)(12),[l,c]=(0,s.useState)(!1),[i,h]=(0,s.useState)(""),[u,f]=(0,s.useState)([]),[x,m]=(0,s.useState)([]),[_,S]=(0,s.useState)(!1),[y,p]=(0,s.useState)(!1),[C,g]=(0,s.useState)([]),[v,W]=(0,s.useState)([]),[w,j]=(0,s.useState)([]),[N,R]=(0,s.useState)([]),[b,F]=(0,s.useState)(u.length),[L,A]=(0,s.useState)(!1);function k(e,t){return v.includes("".concat(e,"-").concat(t))}(0,s.useEffect)((()=>{const e=t.split("\n"),r=e[0].slice(8).split(",");let s=!1,d=10,o=!0,l=!1;r.forEach((e=>{const[t,r]=e.split("=");"size"===t.trim().toLowerCase()?(d=parseInt(r),n(d)):"show"===t.trim().toLowerCase()?(o="yes"===r.trim().toLowerCase(),c(o)):"reveal"===t.trim().toLowerCase()?(l="yes"===r.trim().toLowerCase(),p(l)):"simple"===t.trim().toLowerCase()&&(s="yes"===r.trim().toLowerCase())})),h(e[1]);const i=e.slice(2).filter((e=>""!==e.trim())).map((e=>e.toUpperCase()));f(i),F(i.length);if(i.some((e=>e.length>d))||d>20||d<5)return void A(!0);let u=0,x=!1;for(;u<3&&!x;){const{grid:e,wordPlacements:t,usedCoordinates:r}=a(d,i,s);0!==e.length?(m(e),g(t),W(r),x=!0):u++}x||A(!0)}),[t,r]);const O=e=>{R([...N,e]),j([]),F((e=>e-1))},G=e=>{const[t,r]=e,[s,d]=t.split("-").map(Number),[o,a]=r.split("-").map(Number);for(const{word:n,startRow:l,startCol:c,direction:i}of C){const{dx:e,dy:t}=i,r=n.length;if(s===l&&d===c&&o===l+(r-1)*t&&a===c+(r-1)*e)return void O(n)}j([])};return L?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h1",{className:d.interactiveSubTitle,children:i}),(0,o.jsx)("div",{className:d.GameArea,children:(0,o.jsx)("p",{className:d.instructions,children:"Failed to create wordsearch: refresh to try again or change the puzzle to use a different grid size."})})]}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h1",{className:d.interactiveSubTitle,children:i}),0===b&&u.length>0&&(0,o.jsx)("div",{className:d.celebration,children:"\ud83d\ude03"}),(0,o.jsxs)("div",{className:d.Container,children:[(0,o.jsxs)("div",{className:d.GameArea,children:[(0,o.jsx)("div",{className:d.WordSearchGrid,style:{gridTemplateColumns:"repeat(".concat(r,", 1fr)")},children:x.map(((e,t)=>(0,o.jsx)("div",{className:d.WordSearchRow,children:e.map(((e,r)=>(0,o.jsx)("div",{className:"".concat(d.WordSearchCell," ").concat(_&&k(t,r)?d.RevealedCell:""," ").concat(w.includes("".concat(t,"-").concat(r))?d.SelectedCell:""," ").concat(N.some((e=>function(e,t,r){for(const{word:s,startRow:d,startCol:o,direction:a}of C)if(s===r){const{dx:s,dy:n}=a,l=r.length;for(let r=0;r<l;r++)if(e===d+r*n&&t===o+r*s)return!0}return!1}(t,r,e)))?d.FoundCell:""),onClick:()=>((e,t)=>{if(_)return;const r="".concat(e,"-").concat(t),s=[...w];2===w.length&&s.splice(0,2),s.push(r),j(s),2===s.length&&G(s)})(t,r),children:e},r)))},t)))}),!l&&(0,o.jsxs)("div",{className:d.WordList,children:[(0,o.jsx)("h2",{children:"Words to Find:"}),(0,o.jsx)("ul",{children:(0,o.jsx)("li",{children:b})})]}),l&&(0,o.jsxs)("div",{className:d.WordList,children:[(0,o.jsx)("h2",{children:"Words to Find:"}),(0,o.jsx)("ul",{children:u.map(((e,t)=>(0,o.jsx)("li",{className:N.includes(e)?d.FoundWord:"",children:e},t)))})]})]}),y&&(0,o.jsx)("button",{onClick:()=>{S(!0)},className:d.RevealButton,children:"Reveal"})]})]})}}}]);
//# sourceMappingURL=8209.06094d5f.chunk.js.map