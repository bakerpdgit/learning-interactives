"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[358],{7358:(e,s,t)=>{t.r(s),t.d(s,{default:()=>r});var i=t(2791),a=t(5851),l=t(6187),c=t(9767),n=t(184);const r=function(e){let{text:s}=e;const[t,r]=(0,i.useState)([]),[o,d]=(0,i.useState)(!0),[u,m]=(0,i.useState)(5),[g,h]=(0,i.useState)(""),p=(0,i.useRef)(null),{imageData:v,setImageData:f}=(0,l.c)();(0,i.useEffect)((()=>{const e=s.startsWith("OPTIONS:")?s.split("\n")[0]:null,t=e?Object.fromEntries(e.slice(8).split(",").map((e=>e.split("=")))):{};t.gridsize&&m(t.gridsize);const i=s.split("\n");h(i[i.length-1])}),[s]),(0,i.useEffect)((()=>{const e=setTimeout((()=>{d(!1)}),1e3);return()=>clearTimeout(e)}),[]);const x=e=>{f(e)};return(0,n.jsxs)("div",{className:"image-reveal-container",children:[(0,n.jsxs)("div",{style:{position:"relative",display:"inline-block"},children:[(!g.includes(c.XH)||v)&&(0,n.jsx)("img",{ref:p,src:g&&!g.includes(c.XH)?g:v,className:"image-reveal-image",alt:"Reveal"}),g.includes(c.XH)&&!v&&(0,n.jsxs)("div",{children:["The local image will need to be provided...",(0,n.jsx)("br",{})," ",(0,n.jsx)("input",{type:"file",className:"fileUpload",accept:"image/*",onChange:e=>(0,a.v)(e.target.files[0],x)})]}),[...Array(u**2)].map(((e,s)=>(0,n.jsx)("div",{className:"image-box ".concat(t.includes(s)?"image-box-reveal":"image-box"),style:{width:"".concat(100/u+.1,"%"),height:"".concat(100/u+.1,"%"),top:"".concat(Math.floor(s/u)*(100/u),"%"),left:"".concat(s%u*(100/u),"%")},onClick:t.includes(s)?null:()=>(e=>{t.includes(e)||r((s=>[...s,e]))})(s),children:s+1},s)))]}),o&&(0,n.jsxs)("div",{className:"image-reveal-instruction",children:[(0,n.jsx)("h1",{children:"Image Reveal"}),(0,n.jsx)("p",{children:"click boxes to reveal"})]})]})}}}]);
//# sourceMappingURL=358.3da68d9f.chunk.js.map