"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[1832],{1832:(e,n,t)=>{t.r(n),t.d(n,{default:()=>p});var l=t(2791);const o="DiamondNine_interactiveSubTitle__0rKD+",a="DiamondNine_GameArea__fVsYP",i="DiamondNine_diamondFormation__VHacg",c="DiamondNine_diamondRow__3h5oS",s="DiamondNine_sideCollection__-gAf5",r="DiamondNine_tile__4ZQIK",d="DiamondNine_diamondTile__3pD0I",u="DiamondNine_selected__MrRL1",m="DiamondNine_editIcon__-1zxJ";var _=t(5249),h=t(184);const p=e=>{let{text:n}=e;const[t,p]=(0,l.useState)(""),[N,x]=(0,l.useState)([]),[w,v]=(0,l.useState)(null),[f,g]=(0,l.useState)(!1),[I,j]=(0,l.useState)({});(0,l.useEffect)((()=>{const[e,t,...l]=n.split("\n").filter(Boolean),o={};e.startsWith("OPTIONS:")&&e.replace("OPTIONS:","").split(",").forEach((e=>{const[n,t]=e.split("=");o[n]=t}));const a=l.map(((e,n)=>({id:n,content:e,row:-1,column:-1,isPlaceholder:!1}))),i=[{id:a.length,content:"",row:0,column:0,isPlaceholder:!0},{id:a.length+1,content:"",row:1,column:0,isPlaceholder:!0},{id:a.length+2,content:"",row:1,column:1,isPlaceholder:!0},{id:a.length+3,content:"",row:2,column:0,isPlaceholder:!0},{id:a.length+4,content:"",row:2,column:1,isPlaceholder:!0},{id:a.length+5,content:"",row:2,column:2,isPlaceholder:!0},{id:a.length+6,content:"",row:3,column:0,isPlaceholder:!0},{id:a.length+7,content:"",row:3,column:1,isPlaceholder:!0},{id:a.length+8,content:"",row:4,column:0,isPlaceholder:!0}];p(t),x([...a,...i]),g("yes"===o.editing.toLowerCase())}),[n]);const C=e=>{null!==w?(x((n=>{const t=n.map((e=>({...e}))),l=t.findIndex((e=>e.id===w)),o=t.findIndex((n=>n.id===e));if(-1===l||-1===o)return n;const a=t[l],i=t[o],c=a.row,s=a.column;return a.row=i.row,a.column=i.column,i.row=c,i.column=s,t})),v(null)):(e=>{v(w===e?null:e)})(e)},P=e=>{if(!e)return null;const n=-1===e.row&&-1===e.column;return(0,h.jsxs)("div",{className:"".concat(n?r:d," ").concat(w===e.id?u:""),onClick:()=>C(e.id),children:[e.content,f&&(0,h.jsx)("span",{className:m,onClick:n=>((e,n)=>{e.stopPropagation(),j({prompt:"Enter new text:",value:n.content,tileId:n.id})})(n,e),children:"\u270e"})]},e.id)};return(0,h.jsxs)(h.Fragment,{children:[I.prompt&&(0,h.jsx)(_.Z,{title:I.prompt,placeholder:"Type here...",value:I.value,onSubmit:e=>{x((n=>n.map((n=>n.id===I.tileId?{...n,content:e}:n)))),j({})},onClose:()=>j({})}),(0,h.jsx)("h1",{className:o,children:t}),(0,h.jsxs)("div",{className:a,children:[(0,h.jsx)("div",{className:i,children:[1,2,3,2,1].map(((e,n)=>(0,h.jsx)("div",{className:c,children:Array.from({length:e}).map(((e,t)=>{const l=N.find((e=>e.row===n&&e.column===t));return P(l)}))},n)))}),(0,h.jsx)("div",{className:s,children:N.filter((e=>-1===e.row&&-1===e.column)).map(P)})]})]})}},5249:(e,n,t)=>{t.d(n,{Z:()=>_});var l=t(2791);const o="InputModal_modalOverlay__Y-bWN",a="InputModal_modalContent__z50rT",i="InputModal_modalTitle__FCo0P",c="InputModal_inputField__IeKtc",s="InputModal_inputArea__qi5q6",r="InputModal_buttonGroup__3nwbY",d="InputModal_submitButton__irpiv",u="InputModal_cancelButton__xmt2G";var m=t(184);const _=e=>{let{title:n,placeholder:t,value:_="",onSubmit:h,onClose:p,multiLine:N=!1}=e;const[x,w]=(0,l.useState)(_);(0,l.useEffect)((()=>{w(_)}),[_]);const v=e=>{w(e.target.value)},f=()=>{h(x),p()},g=e=>{"Enter"!==e.key||N||f()};return(0,m.jsx)("div",{className:o,children:(0,m.jsxs)("div",{className:a,children:[(0,m.jsx)("h2",{className:i,children:n}),N?(0,m.jsx)("textarea",{type:"text",className:s,placeholder:t,value:x,onChange:v,onKeyDown:g,autoFocus:!0}):(0,m.jsx)("input",{type:"text",className:c,placeholder:t,value:x,onChange:v,onKeyDown:g,autoFocus:!0}),(0,m.jsxs)("div",{className:r,children:[(0,m.jsx)("button",{className:d,onClick:f,children:"Submit"}),(0,m.jsx)("button",{className:u,onClick:p,children:"Cancel"})]})]})})}}}]);
//# sourceMappingURL=1832.ace5db08.chunk.js.map