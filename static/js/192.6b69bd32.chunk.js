"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[192],{6192:(e,t,n)=>{n.r(t),n.d(t,{default:()=>h});var s=n(2791);const l="RandomWheel_GameArea__ypUzU",i="RandomWheel_GameWheel__4M8Ku",a="RandomWheel_ItemsList__pEfjK",r="RandomWheel_Item__gSGPd",o="RandomWheel_celebration__A1WWm";var c=n(184);const h=function(e){let{text:t}=e;const[n,h]=(0,s.useState)([]),[u,d]=(0,s.useState)(0),[f,m]=(0,s.useState)(!1),[g,p]=(0,s.useState)(12),v=(0,s.useRef)(null),_=(0,s.useRef)(null),x=(0,s.useRef)(null),M=e=>.5*(1-Math.cos(Math.PI*e));(0,s.useEffect)((()=>{const e=t.split("\n");let n=e[0].startsWith("OPTIONS:")?e.shift():"",s=12;if(n){const e=n.split(":");if(e[1]){e[1].split(",").forEach((e=>{const[t,n]=e.split("=");"time"!==t||isNaN(n)||(s=parseFloat(n))}))}}p(s);const l=e.flatMap((e=>{if(e.includes(":")&&!isNaN(e.split(":")[1]))return(e=>{const[t,n]=e.split(":"),s=t.trim(),l=s.length>20?s.substring(0,20)+"...":s;return isNaN(n)?[e]:Array(parseInt(n)).fill(l)})(e);{const t=e.trim();return[t.length>20?t.substring(0,20)+"...":t]}}));h((e=>{const t=[...e];for(let n=t.length-1;n>0;n--){const e=Math.floor(Math.random()*(n+1));[t[n],t[e]]=[t[e],t[n]]}return t})(l))}),[t]);const b=(0,s.useCallback)((()=>{const e=v.current,t=e.getContext("2d"),s=_.current.getBoundingClientRect();e.width=s.width,e.height=s.height,t.clearRect(0,0,e.width,e.height);const l=e.width/2,i=e.height/2+10,a=Math.min(l,i)-30;t.save(),t.translate(l,i),t.rotate(u),t.beginPath(),t.arc(0,0,a,0,2*Math.PI),t.stroke(),t.fillStyle="lightpink",t.fill(),t.fillStyle="black",t.font="1.3em Arial";const r=n.length,o=2*Math.PI/r,c=o/2;for(let n=0;n<r;n++){const e=n*o+c;t.beginPath(),t.moveTo(0,0),t.lineTo(a*Math.cos(e),a*Math.sin(e)),t.stroke()}t.textAlign="right",t.textBaseline="middle";for(let h=0;h<r;h++){const e=h*o;t.save(),t.rotate(e),t.fillText(n[h],a-10,0),t.restore()}t.restore(),t.fillStyle="black",t.beginPath(),t.moveTo(l-10,10),t.lineTo(l+10,10),t.lineTo(l,25),t.closePath(),t.fill()}),[n,u]);(0,s.useEffect)((()=>{const e=()=>{b()};return window.addEventListener("resize",e),b(),()=>window.removeEventListener("resize",e)}),[n,u,b]);const k=Array.from(new Set(n));return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)("div",{className:l,children:[(0,c.jsxs)("div",{className:i,ref:_,children:[(0,c.jsx)("button",{onClick:()=>{m(!1),(()=>{let e=null,t=1e3*g,n=.6+.4*Math.random();const s=l=>{e||(e=l);let i,a=l-e;if(a<t/2)i=M(a/t);else{if(!(a<t))return cancelAnimationFrame(x.current),void m(!0);i=1-M(a/t)}d((e=>(e+i*n)%(2*Math.PI))),x.current=requestAnimationFrame(s)};x.current=requestAnimationFrame(s)})()},style:{display:"block",margin:"0 auto"},children:"Spin Wheel"}),(0,c.jsx)("canvas",{ref:v})]}),(0,c.jsx)("div",{className:a,children:k.map(((e,t)=>(0,c.jsx)("div",{className:r,onClick:()=>(e=>{h((t=>{const n=t.indexOf(e);return n>-1?[...t.slice(0,n),...t.slice(n+1)]:t}))})(e),onContextMenu:t=>((e,t)=>{e.preventDefault(),h((e=>e.filter((e=>e!==t))))})(t,e),children:e},t)))})]}),f&&(0,c.jsx)("div",{className:o,children:"\ud83c\udf89"})]})}}}]);
//# sourceMappingURL=192.6b69bd32.chunk.js.map