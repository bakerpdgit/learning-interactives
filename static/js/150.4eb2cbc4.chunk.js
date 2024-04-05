"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[150],{7150:(t,e,n)=>{n.r(e),n.d(e,{default:()=>c});var a=n(2791),s=n(8363);const r="Geometry_GameArea__lLLvX",i="Geometry_instructions__FM4Mw";var o=n(184);const c=function(t){let{text:e}=t;const[n,c]=(0,a.useState)([]),[l,x]=(0,a.useState)([]),[h,y]=(0,a.useState)({width:0,height:0}),[d,g]=(0,a.useState)(!0),[p,u]=(0,a.useState)({x:0,y:0}),[m,f]=(0,a.useState)({angles:"no"}),[w,b]=(0,a.useState)([]),M=t=>{g(!1),u({x:t.target.x(),y:t.target.y()})},v=(t,e)=>{c((n=>{const a=[...n];return a[t].length>=1&&(a[t]=[...a[t].slice(0,e),...a[t].slice(e+1)],j(a)),a}))},k=(t,e)=>{const a=h.width/1e3,s=(t.target.x()-p.x)/a,r=(t.target.y()-p.y)/a,i=n.map(((t,n)=>n===e?t.map((t=>({x:t.x+s,y:t.y+r}))):t));c(i),j(i),g(!0),t.target.position({x:p.x,y:p.y}),t.target.getLayer().batchDraw()},j=(0,a.useCallback)((t=>{const e=h.width/1e3,n=t.map((t=>t.map((t=>({x:t.x*e,y:t.y*e})))));x(n)}),[h.width,x]);function D(){const t=Math.min(.9*window.innerWidth,.9*window.innerHeight);y({width:t,height:t})}(0,a.useEffect)((()=>{j(n)}),[h,n,j]),(0,a.useEffect)((()=>{const{options:t,points:n,shapeTypes:a}=function(t){const e=t.split("\n");let n={angles:"no"},a=[],s=[];return e.forEach((t=>{if(t.startsWith("OPTIONS:"))t.substring(8).split(",").forEach((t=>{const[e,a]=t.split("=");n[e]=a}));else if(t.includes("[")){const e=t.match(/\[(.*?)\]/g).map((t=>t.replace(/\[|\]/g,"").split(",").map(Number)));a.push([{x:e[0][0],y:e[0][1]},{x:e[1][0],y:e[1][1]}]),s.push(1)}else{var e;const n=null===(e=t.match(/\((.*?)\)/g))||void 0===e?void 0:e.map((t=>{const[e,n]=t.replace(/\(|\)/g,"").split(",").map(Number);return{x:e,y:n}}));n&&(a.push(n),s.push(0))}})),{options:n,points:a,shapeTypes:s}}(e);return f(t),c(n),b(a),D(),window.addEventListener("resize",D),()=>window.removeEventListener("resize",D)}),[e]);const S=(t,e)=>{t.evt.preventDefault(),c((t=>{const n=t[e];if(!Array.isArray(n))return console.error("Expected an array of points, got:",n),t;const a=n.map((t=>({x:t.x+20,y:t.y+20})));return[...t,a]})),b((t=>[...t,t[e]]))};function C(t,e,n,a,s,r){let i=Math.sqrt((s-n)**2+(r-a)**2);if(0===i)return Math.sqrt((t-n)**2+(e-a)**2);let o=((t-n)*(s-n)+(e-a)*(r-a))/i**2;o=Math.max(0,Math.min(1,o));let c=n+o*(s-n),l=a+o*(r-a);return Math.sqrt((t-c)**2+(e-l)**2)}const E=(t,e,n)=>{const a=l[e][n];t.target.position({x:a.x,y:a.y})},_=(t,e,n)=>{const a=h.width/1e3,s=t.target.x()/a,r=t.target.y()/a;if(s<20||s>980||r<0||r>980)return;const i=l.map(((a,s)=>s===e?a.map(((e,a)=>a===n?{x:t.target.x(),y:t.target.y()}:e)):a));x(i);const o=i.map((t=>t.map((t=>({x:1e3*t.x/h.width,y:1e3*t.y/h.height})))));c(o)};function q(t){return Math.sqrt(t.x*t.x+t.y*t.y)}return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{children:(0,o.jsx)("p",{className:i,children:"Right click a shape to duplicate; double-click a point to remove; double-click a polygon to add a vertex; drag a shape to move it."})}),(0,o.jsx)("div",{className:r,children:(0,o.jsxs)(s.Hf,{width:h.width,height:h.height,className:r,children:[(0,o.jsxs)(s.mh,{children:[(0,o.jsx)(s.UL,{x:0,y:0,width:h.width,height:h.height,stroke:"black",strokeWidth:4}),l.map(((t,e)=>(0,o.jsxs)(a.Fragment,{children:[0===w[e]&&(0,o.jsx)(s.x1,{points:t.flatMap((t=>[t.x,t.y])),closed:!0,stroke:"black",onDblClick:t=>((t,e)=>{const a=t.target.getStage().getPointerPosition(),s=h.width/1e3,r=a.x/s,i=a.y/s,o=n[e];let l=0,x=1/0;for(let n=0;n<o.length;n++){const t=(n+1)%o.length,e=C(r,i,o[n].x,o[n].y,o[t].x,o[t].y);e<x&&(x=e,l=n)}const y={x:r,y:i},d=[...o.slice(0,l+1),y,...o.slice(l+1)],g=[...n.slice(0,e),d,...n.slice(e+1)];c(g),j(g)})(t,e),onContextMenu:t=>S(t,e),draggable:!0,onDragStart:M,onDragEnd:t=>k(t,e)}),1===w[e]&&(0,o.jsx)(s.Cd,{x:t[0].x,y:t[0].y,radius:Math.sqrt(Math.pow(t[1].x-t[0].x,2)+Math.pow(t[1].y-t[0].y,2)),stroke:"black",strokeWidth:2,onContextMenu:t=>S(t,e),draggable:!0,onDragStart:M,onDragEnd:t=>k(t,e)}),t.map(((t,n)=>(0,o.jsx)(s.Cd,{x:t.x,y:t.y,radius:5,fill:"red",draggable:d,visible:d,onDragMove:t=>_(t,e,n),onDragEnd:t=>E(t,e,n),onDblClick:()=>v(e,n)},n))),t.length>2&&"yes"===m.angles&&t.map(((e,n)=>{const r=t[(n-1+t.length)%t.length],i=e,c=t[(n+1)%t.length],l=function(t,e,n){const a={x:t.x-e.x,y:t.y-e.y},s={x:n.x-e.x,y:n.y-e.y},r=function(t,e){return t.x*e.x+t.y*e.y}(a,s)/(q(a)*q(s));return Math.acos(r)*(180/Math.PI)}(r,i,c),x=l.toFixed(1)+"\xb0";if(Math.abs(l)>.5&&Math.abs(l-180)>.5){const t=t=>{const e=Math.sqrt(t.x*t.x+t.y*t.y);return{x:t.x/e,y:t.y/e}},e=t({x:r.x-i.x,y:r.y-i.y}),l=t({x:c.x-i.x,y:c.y-i.y}),y=t({x:e.x+l.x,y:e.y+l.y});let g=h.width/35,p=Math.atan2(y.y,y.x)*(180/Math.PI);return(p<-90||p>90)&&(p+=180,g*=3),(0,o.jsx)(a.Fragment,{children:(0,o.jsx)(s.xv,{x:i.x+y.x*g,y:i.y+y.y*g,text:x,fontSize:12,fill:"black",visible:d,rotation:p})},n)}return null}))]},e)))]}),(0,o.jsx)(s.mh,{children:l.map(((t,e)=>(0,o.jsx)(a.Fragment,{children:t.map(((t,n)=>(0,o.jsx)(s.Cd,{x:t.x,y:t.y,radius:5,fill:"red",draggable:d,visible:d,onDragMove:t=>_(t,e,n),onDragEnd:t=>E(t,e,n),onDblClick:()=>v(e,n)},n)))},"v".concat(e))))})]})})]})}}}]);
//# sourceMappingURL=150.4eb2cbc4.chunk.js.map