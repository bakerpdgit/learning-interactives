"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[3801],{3801:(e,a,r)=>{r.r(a),r.d(a,{default:()=>g});var i=r(2791),s=r(8120),n=r(5249);const d="FreyarDiagram_container__YiSQD",l="FreyarDiagram_title__A8Gfw",c="FreyarDiagram_diagram__V4xME",t="FreyarDiagram_row__MmVAk",o="FreyarDiagram_box__Tzzg6",p="FreyarDiagram_itemList__+CpAe",m="FreyarDiagram_item__fPuXt",h="FreyarDiagram_rubbishSection__gzocJ",x="FreyarDiagram_rubbishBin__+wksp",b="FreyarDiagram_binIcon__Mcwt6";var _=r(184);const g=function(e){let{text:a}=e;const r=a,[g,j]=(0,i.useState)({Definition:[],Characteristics:[],Examples:[],"Anti-Examples":[]}),[f,u]=(0,i.useState)(!1),[v,D]=(0,i.useState)(""),[N,y]=(0,i.useState)(""),C=e=>{y(e),D(""),u(!0)};return(0,_.jsxs)(_.Fragment,{children:[f&&(0,_.jsx)(n.Z,{title:"Add items to ".concat(N),value:v,onChange:e=>D(e.target.value),onSubmit:e=>{if(e.trim()){const a={id:"item-".concat(Date.now(),"-").concat(Math.random()),content:e};j((e=>({...e,[N]:[...e[N],a]})))}u(!1)},onClose:()=>u(!1),multiLine:!0}),(0,_.jsx)("h2",{className:l,children:r}),(0,_.jsx)(s.Z5,{onDragEnd:e=>{const{source:a,destination:r}=e;if(!r)return;if(r.droppableId===a.droppableId&&r.index===a.index)return;const i=a.droppableId,s=r.droppableId,n=Array.from(g[i]),[d]=n.splice(a.index,1);if("RubbishBin"!==s)if(i===s)n.splice(r.index,0,d),j((e=>({...e,[i]:n})));else{const e=Array.from(g[s]);e.splice(r.index,0,d),j((a=>({...a,[i]:n,[s]:e})))}else j((e=>({...e,[i]:n})))},children:(0,_.jsxs)("div",{className:d,children:[(0,_.jsxs)("div",{className:c,children:[(0,_.jsx)("div",{className:t,children:["Definition","Characteristics"].map((e=>(0,_.jsxs)("div",{className:o,children:[(0,_.jsx)("h3",{children:e.toUpperCase()}),(0,_.jsx)(s.bK,{droppableId:e,children:a=>(0,_.jsxs)("div",{ref:a.innerRef,...a.droppableProps,className:p,children:[g[e].map(((e,a)=>(0,_.jsx)(s._l,{draggableId:e.id,index:a,children:a=>(0,_.jsx)("div",{ref:a.innerRef,...a.draggableProps,...a.dragHandleProps,className:m,children:e.content})},e.id))),a.placeholder]})}),(0,_.jsx)("button",{onClick:()=>C(e),children:"Add"})]},e)))}),(0,_.jsx)("div",{className:t,children:["Examples","Anti-Examples"].map((e=>(0,_.jsxs)("div",{className:o,children:[(0,_.jsx)("h3",{children:e.toUpperCase()}),(0,_.jsx)(s.bK,{droppableId:e,children:a=>(0,_.jsxs)("div",{ref:a.innerRef,...a.droppableProps,className:p,children:[g[e].map(((e,a)=>(0,_.jsx)(s._l,{draggableId:e.id,index:a,children:a=>(0,_.jsx)("div",{ref:a.innerRef,...a.draggableProps,...a.dragHandleProps,className:m,children:e.content})},e.id))),a.placeholder]})}),(0,_.jsx)("button",{onClick:()=>C(e),children:"Add"})]},e)))})]}),(0,_.jsx)("div",{className:h,children:(0,_.jsx)(s.bK,{droppableId:"RubbishBin",children:e=>(0,_.jsxs)("div",{className:x,ref:e.innerRef,...e.droppableProps,children:[(0,_.jsx)("span",{role:"img","aria-label":"bin",className:b,children:"\ud83d\uddd1\ufe0f"}),e.placeholder]})})})]})})]})}}}]);
//# sourceMappingURL=3801.cade1490.chunk.js.map