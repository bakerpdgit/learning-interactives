"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[69],{1069:(e,t,a)=>{a.r(t),a.d(t,{default:()=>o});var n=a(2791),i=a(5851),l=a(6187);const r={imagePinMaincontainer:"ImagePins_imagePinMaincontainer__ve+Rp",imagePinContainer:"ImagePins_imagePinContainer__gV26t",imagePinImage:"ImagePins_imagePinImage__IpjTM",pinLabel:"ImagePins_pinLabel__boY-Q",correctLabel:"ImagePins_correctLabel__qIafK",errorLabel:"ImagePins_errorLabel__8NLFJ",hiddenLabelsContainer:"ImagePins_hiddenLabelsContainer__E33Kt",hiddenLabel:"ImagePins_hiddenLabel__j-Yd4",imagePinInstruction:"ImagePins_imagePinInstruction__yX44S",pin:"ImagePins_pin__FcmAN",pinDraggable:"ImagePins_pinDraggable__-W5-y",celebration:"ImagePins_celebration__eLfSQ",flyAcross:"ImagePins_flyAcross__HgWSj"};var s=a(9767),c=a(184);const o=function(e){let{text:t}=e;const[a,o]=(0,n.useState)([]),[d,g]=(0,n.useState)(0),[h,p]=(0,n.useState)([]),[u,m]=(0,n.useState)(!0),[b,f]=(0,n.useState)(!1),[x,_]=(0,n.useState)({type:null,index:null,startX:0,startY:0}),[y,P]=(0,n.useState)(null),[v,I]=(0,n.useState)({width:0,height:0}),{textData:L,imageData:w,setImageData:X}=(0,l.c)(),j=(0,n.useRef)(null);(0,n.useEffect)((()=>{const e=t.split("\n"),a=e[0].startsWith("OPTIONS:")?e.shift():null,n=e.pop();let i=!1;if(a){a.substring(8).split(";").forEach((e=>{const[t,a]=e.split("=");"show"===t&&"yes"===a&&(i=!0)}))}const l=[];if(e.length>0){let t=0;const a=e.map(((e,a)=>{const n=e.match(/\((\d+(\.\d+)?),(\d+(\.\d+)?)\)$/);if(n){t++,e=e.replace(n[0],""),l.push(e);const a=parseFloat(n[1]),i=parseFloat(n[3]),r=a/100*v.width,s=i/100*v.height;return{x:r,y:s,label:"",labelX:r,labelY:s-40,hidden:!0,labelAnswer:e,provided:!0}}{const n=a-t,i=50+70*Math.floor(n/5),l=50+n%5*70;return{x:i,y:l,label:e,labelX:i,labelY:l-40,hidden:!1,provided:!0}}}));o(a),g(t),i&&p(l.sort((()=>Math.random()-.5)))}P(n&&!n.includes(s.XH)?n:w)}),[t,L,w,v.width,v.height]),(0,n.useEffect)((()=>{const e=setTimeout((()=>{j.current&&(I({width:j.current.offsetWidth,height:j.current.offsetHeight}),o((e=>e.map((e=>e.x>j.current.offsetWidth||e.y>j.current.offsetHeight?{...e,x:100,y:100,labelX:100,labelY:50}:e)))))}),1e3);return()=>clearTimeout(e)}),[y]),(0,n.useEffect)((()=>{const e=setTimeout((()=>{m(!1)}),1e3);return()=>clearTimeout(e)}),[]),(0,n.useEffect)((()=>{const e=()=>{if(!j.current||0===v.width||0===v.height)return;const e=j.current.offsetWidth/v.width,t=j.current.offsetHeight/v.height;let n=a.map((a=>({...a,x:a.x*e,y:a.y*t,labelX:a.labelX*e,labelY:a.labelY*t})));n=n.map((e=>e.x>j.current.offsetWidth||e.y>j.current.offsetHeight?{...e,x:100,y:100,labelX:100,labelY:50}:e)),o(n),j.current&&I({width:j.current.offsetWidth,height:j.current.offsetHeight})};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}}),[v,a]);const Y=(e,t,n)=>{e.dataTransfer.setData("text/plain","");const i=a[t],l="pin"===n?i.x:i.labelX,r="pin"===n?i.y:i.labelY;_({type:n,index:t,startX:l,startY:r})},C=e=>{X(e),P(e)};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)("div",{className:r.imagePinMaincontainer,children:[(0,c.jsxs)("div",{className:r.imagePinContainer,draggable:"false",onDragOver:e=>{e.preventDefault()},onDrop:e=>{if(!j.current||null===x.index)return;const t=j.current.getBoundingClientRect();let n=e.clientX-t.left,i=e.clientY-t.top;const l=n-x.startX,r=i-x.startY;o(a.map(((e,t)=>t===x.index?{...e,x:e.x+("pin"===x.type?l:0),y:e.y+("pin"===x.type?r:0),labelX:e.labelX+l,labelY:e.labelY+r}:e))),_({type:null,index:null,startX:0,startY:0})},children:[(!t.includes(s.XH)||L)&&(0,c.jsx)("img",{ref:j,className:r.imagePinImage,alt:"Highlight",onClick:e=>{if(!j.current)return;const t=j.current.getBoundingClientRect();let a=e.clientX-t.left,n=e.clientY-t.top;o((e=>[...e,{x:Math.max(0,Math.min(a,t.width-20)),y:Math.max(0,Math.min(n,t.height-20)),label:"",labelX:a,labelY:n-40,provided:!1}]))},draggable:"false",src:y,crossOrigin:"anonymous"}),t.includes(s.XH)&&!L&&(0,c.jsxs)("div",{children:["The local image will need to be provided...",(0,c.jsx)("br",{})," ",(0,c.jsx)("input",{type:"file",className:r.fileUpload,accept:"image/*",onChange:e=>(0,i.vh)(e.target.files[0],C)})]}),a.map(((e,t)=>(0,c.jsxs)(n.Fragment,{children:[(0,c.jsx)("div",{className:"".concat(r.pin," ").concat(e.hidden?"":r.pinDraggable),style:{left:"".concat(e.x-10,"px"),top:"".concat(e.y-10,"px")},draggable:!e.hidden,onDragStart:e=>Y(e,t,"pin"),onContextMenu:e=>((e,t)=>{e.preventDefault(),o((e=>e.filter(((e,a)=>a!==t||e.provided))))})(e,t),onDoubleClick:()=>(e=>{const t=prompt("Enter a label for this pin:",a[e].label);if(null!==t)if(a[e].hidden)if(t.trim().toLowerCase().replace(/\s+/g,"")===a[e].labelAnswer.trim().toLowerCase().replace(/\s+/g,"")){o(a.map(((t,n)=>n===e?{...t,label:a[e].labelAnswer,hidden:!0}:t)));const t=d-1;g(t),0===t&&f(!0)}else o(a.map(((t,a)=>a===e?{...t,label:"try again",error:!0}:t))),setTimeout((()=>{o(a.map(((t,a)=>a===e?{...t,label:"",error:!1}:t)))}),1e3);else o(a.map(((a,n)=>n===e?{...a,label:t}:a)))})(t)},"pin-".concat(t)),e.label&&(0,c.jsx)("div",{className:"".concat(r.pinLabel," ").concat(!0===e.hidden?r.correctLabel:""," ").concat(e.error?r.errorLabel:""),style:{left:"".concat(e.labelX,"px"),top:"".concat(e.labelY-10,"px")},draggable:"true",onDragStart:e=>Y(e,t,"label"),children:e.label})]},"pinlabel-".concat(t))))]}),u&&(0,c.jsxs)("div",{className:r.imagePinInstruction,children:[(0,c.jsx)("h1",{children:"Image Pins"}),(0,c.jsx)("p",{children:"click to drop pins, right-click to delete pin, double-click to add a label; drag labels to reposition."})]})]}),h&&(0,c.jsx)("div",{className:r.hiddenLabelsContainer,children:h.map(((e,t)=>(0,c.jsx)("div",{className:r.hiddenLabel,children:e},"hiddenLbl".concat(t))))}),b&&(0,c.jsx)("div",{className:r.celebration,children:"\ud83c\udfba"})]})}}}]);
//# sourceMappingURL=69.140af8a2.chunk.js.map