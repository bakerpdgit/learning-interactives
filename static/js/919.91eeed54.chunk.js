"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[919],{7919:(e,t,n)=>{n.r(t),n.d(t,{default:()=>c});var a=n(2791),s=n(184);const i=e=>{let{label:t,remainingTime:n,height:a,initialTime:i}=e;const r=n/i*100,c={height:"".concat(a,"%"),padding:"10px",margin:"10px",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid black",background:"linear-gradient(to left, #FFCCCC ".concat(r,"%, #ADD8E6 ").concat(r,"%)")};return(0,s.jsx)("div",{style:c,children:(0,s.jsxs)("span",{style:{fontSize:"xx-large"},children:[t," (",Math.max(0,Math.round(n)),")"]})})};function r(e,t){let n=null;n||(n=new(window.AudioContext||window.webkitAudioContext)),"suspended"===n.state&&n.resume();const a=n.createOscillator();a.type="sawtooth",a.frequency.setValueAtTime(e,n.currentTime);const s=n.createBiquadFilter();s.type="lowpass",s.frequency.setValueAtTime(2e3,n.currentTime),a.connect(s),s.connect(n.destination),a.start(),a.stop(n.currentTime+t)}const c=function(e){let{text:t}=e;const[n,c]=(0,a.useState)(!1),[l,o]=(0,a.useState)(!1),u=t.split("\n"),d=u.map((e=>parseInt(e.split(":")[1],10))),[m]=(0,a.useState)(Date.now()),[p,h]=(0,a.useState)(Date.now());(0,a.useEffect)((()=>{const e=setInterval((()=>{h(Date.now())}),1e3);return()=>clearInterval(e)}),[]);const f=(()=>{let e=(p-m)/1e3,t=0;return d.map(((n,a)=>{if(e>t&&e<t+n){const a=n-(e-t);return t+=n,a}return e>=t+n?(t+=n,0):(t+=n,n)}))})();(0,a.useEffect)((()=>{const e=d.reduce(((e,t)=>e+t),0);(p-m)/1e3>=e&&!l&&(c(!0),r(440,.3),setTimeout((()=>r(466.16,.3)),300),setTimeout((()=>r(493.88,.3)),600),setTimeout((()=>r(493.88,.3)),900),o(!0))}),[p,d,m,l]);const x=u.map(((e,t)=>{const[n]=e.split(":"),a=d[t]/d.reduce(((e,t)=>e+t),0)*100;return(0,s.jsx)(i,{label:n,remainingTime:f[t],height:a,initialTime:d[t]},n)}));return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{className:"GameArea",children:x}),n&&(0,s.jsx)("div",{className:"celebration",children:"\ud83c\udf89"})]})}}}]);
//# sourceMappingURL=919.91eeed54.chunk.js.map