"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[1832],{1832:(e,n,t)=>{t.r(n),t.d(n,{default:()=>p});var o=t(2791);const l="DiamondNine_interactiveSubTitle__0rKD+",i="DiamondNine_GameArea__fVsYP",c="DiamondNine_diamondFormation__VHacg",a="DiamondNine_diamondRow__3h5oS",s="DiamondNine_sideCollection__-gAf5",r="DiamondNine_tile__4ZQIK",d="DiamondNine_diamondTile__3pD0I",m="DiamondNine_selected__MrRL1",u="DiamondNine_editIcon__-1zxJ";var h=t(5249),_=t(184);const p=e=>{let{text:n}=e;const[t,p]=(0,o.useState)(""),[w,N]=(0,o.useState)([]),[f,g]=(0,o.useState)(null),[x,P]=(0,o.useState)(!1),[v,D]=(0,o.useState)({});(0,o.useEffect)((()=>{const[e,t,...o]=n.split("\n").filter(Boolean),l={};e.startsWith("OPTIONS:")&&e.replace("OPTIONS:","").split(",").forEach((e=>{const[n,t]=e.split("=");l[n]=t}));const i=o.map(((e,n)=>({id:n,content:e,row:-1,column:-1,isPlaceholder:!1}))),c=[{id:i.length,content:"",row:0,column:0,isPlaceholder:!0},{id:i.length+1,content:"",row:1,column:0,isPlaceholder:!0},{id:i.length+2,content:"",row:1,column:1,isPlaceholder:!0},{id:i.length+3,content:"",row:2,column:0,isPlaceholder:!0},{id:i.length+4,content:"",row:2,column:1,isPlaceholder:!0},{id:i.length+5,content:"",row:2,column:2,isPlaceholder:!0},{id:i.length+6,content:"",row:3,column:0,isPlaceholder:!0},{id:i.length+7,content:"",row:3,column:1,isPlaceholder:!0},{id:i.length+8,content:"",row:4,column:0,isPlaceholder:!0}];p(t),N([...i,...c]),P("yes"===l.editing.toLowerCase())}),[n]);const S=e=>{null!==f?(N((n=>{const t=n.map((e=>({...e}))),o=t.findIndex((e=>e.id===f)),l=t.findIndex((n=>n.id===e));if(-1===o||-1===l)return n;const i=t[o],c=t[l],a=i.row,s=i.column;return i.row=c.row,i.column=c.column,c.row=a,c.column=s,t})),g(null)):(e=>{g(f===e?null:e)})(e)},j=e=>{if(!e)return null;const n=-1===e.row&&-1===e.column;return(0,_.jsxs)("div",{className:"".concat(n?r:d," ").concat(f===e.id?m:""),onClick:()=>S(e.id),children:[e.content,x&&(0,_.jsx)("span",{className:u,onClick:n=>((e,n)=>{e.stopPropagation(),D({prompt:"Enter new text:",value:n.content,tileId:n.id})})(n,e),children:"\u270e"})]},e.id)};return(0,_.jsxs)(_.Fragment,{children:[v.prompt&&(0,_.jsx)(h.Z,{title:v.prompt,placeholder:"Type here...",value:v.value,onSubmit:e=>{N((n=>n.map((n=>n.id===v.tileId?{...n,content:e}:n)))),D({})},onClose:()=>D({})}),(0,_.jsx)("h1",{className:l,children:t}),(0,_.jsxs)("div",{className:i,children:[(0,_.jsx)("div",{className:c,children:[1,2,3,2,1].map(((e,n)=>(0,_.jsx)("div",{className:a,children:Array.from({length:e}).map(((e,t)=>{const o=w.find((e=>e.row===n&&e.column===t));return j(o)}))},n)))}),(0,_.jsx)("div",{className:s,children:w.filter((e=>-1===e.row&&-1===e.column)).map(j)})]})]})}}}]);
//# sourceMappingURL=1832.f66da3f5.chunk.js.map