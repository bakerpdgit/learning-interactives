"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[1428],{1428:(n,e,a)=>{a.r(e),a.d(e,{default:()=>_});var o=a(2791),l=a(8120),t=a(4657),i=a(5249);const d="ColorPickerModal_modalOverlay__DFw5o",r="ColorPickerModal_modalContent__w2quJ",s="ColorPickerModal_modalTitle__w6cGx",c="ColorPickerModal_buttonGroup__1ZKIz",m="ColorPickerModal_submitButton__1j8oD",u="ColorPickerModal_cancelButton__WSvhb";var b=a(184);const p=function(n){let{title:e,initialColor:a,onSubmit:l,onClose:t}=n;const[i,p]=(0,o.useState)(a||"#FFFFFF");return(0,b.jsx)("div",{className:d,children:(0,b.jsxs)("div",{className:r,children:[(0,b.jsx)("h2",{className:s,children:e}),(0,b.jsx)("input",{type:"color",value:i,onChange:n=>p(n.target.value)}),(0,b.jsxs)("div",{className:c,children:[(0,b.jsx)("button",{className:m,onClick:()=>{l(i),t()},children:"Submit"}),(0,b.jsx)("button",{className:u,onClick:t,children:"Cancel"})]})]})})},C={kanbanBoard:"KanbanBoard_kanbanBoard__XUkTy",kanbanColumns:"KanbanBoard_kanbanColumns__vWkWw",kanbanColumn:"KanbanBoard_kanbanColumn__WAdjB",kanbanColumnHeader:"KanbanBoard_kanbanColumnHeader__cgoph",columnMenuButton:"KanbanBoard_columnMenuButton__IMxCs",columnDropdown:"KanbanBoard_columnDropdown__QFEke",columnDropdownItem:"KanbanBoard_columnDropdownItem__z+BWZ",addItemBtn:"KanbanBoard_addItemBtn__T89OM",kanbanColumnContent:"KanbanBoard_kanbanColumnContent__6F2D7",kanbanItem:"KanbanBoard_kanbanItem__GnooQ",deleteItem:"KanbanBoard_deleteItem__lsGm5",addColumn:"KanbanBoard_addColumn__FJHNm",addColumnBar:"KanbanBoard_addColumnBar__Dx-l1"};const _=function(n){let{text:e}=n;const{options:a,initialColumns:d}=(0,o.useMemo)((()=>{const n=e.split("\n").filter((n=>""!==n.trim()));let a={},o=[];if(n[0].startsWith("OPTIONS:")){n.shift().substring(8).split(",").forEach((n=>{const[e,o]=n.split("=");a[e.trim()]=o.trim()}))}return o=n.map(((n,e)=>({id:"column-".concat(e),name:n.trim(),color:"#FFFDD0",items:[]}))),{options:a,initialColumns:o}}),[e]),[r,s]=(0,o.useState)(d),[c,m]=(0,o.useState)(!1),[u,_]=(0,o.useState)({}),[h,x]=(0,o.useState)(!1),[v,k]=(0,o.useState)({}),[j,B]=(0,o.useState)(null);return(0,b.jsxs)(b.Fragment,{children:[c&&(0,b.jsx)(i.Z,{title:u.title,placeholder:u.placeholder,value:u.value,onSubmit:u.onSubmit,onClose:()=>m(!1),multiLine:u.multiLine}),h&&(0,b.jsx)(p,{title:v.title,initialColor:v.initialColor,onSubmit:v.onSubmit,onClose:()=>x(!1)}),"yes"===a.add&&(0,b.jsx)("div",{className:C.addColumnBar,children:(0,b.jsx)("button",{className:C.addColumn,onClick:()=>{_({title:"Add New Column:",placeholder:"Enter column name",value:"",onSubmit:n=>{if(n){const e={id:"column-".concat(Date.now()),name:n,color:"#FFFDD0",items:[]};s((n=>[...n,e]))}m(!1)},multiLine:!1}),m(!0)},children:"Add Column"})}),(0,b.jsx)("div",{className:C.kanbanBoard,children:(0,b.jsx)("div",{className:C.kanbanColumns,children:(0,b.jsx)(l.Z5,{onDragEnd:n=>{const{source:e,destination:a}=n;a&&(e.droppableId===a.droppableId&&e.index===a.index||s((n=>{const o=n.findIndex((n=>n.id===e.droppableId)),l=n.findIndex((n=>n.id===a.droppableId)),t=n[o],i=n[l],d=Array.from(t.items),r=Array.from(i.items),[s]=d.splice(e.index,1);if(t.id===i.id){d.splice(a.index,0,s);const e=[...n];return e[o]={...t,items:d},e}{r.splice(a.index,0,s);const e=[...n];return e[o]={...t,items:d},e[l]={...i,items:r},e}})))},children:r.map((n=>(0,b.jsxs)("div",{className:C.kanbanColumn,style:{backgroundColor:n.color},children:[(0,b.jsxs)("div",{className:C.kanbanColumnHeader,children:[(0,b.jsx)("span",{className:C.kanbanColumnTitle,children:n.name}),(0,b.jsx)("div",{children:(0,b.jsx)("button",{onClick:()=>{return e=n.id,_({title:"Please enter text for the new item:",placeholder:"Type here...",value:"",onSubmit:n=>{if(n){const a={id:"item-".concat(Date.now()),content:n};s((n=>n.map((n=>n.id===e?{...n,items:[...n.items,a]}:n))))}m(!1)},multiLine:!0}),void m(!0);var e},className:C.addItemBtn,children:"Add"})}),(0,b.jsxs)("div",{className:C.columnMenu,children:[(0,b.jsx)("button",{className:C.columnMenuButton,onClick:()=>{return e=n.id,void B((n=>n===e?null:e));var e},children:"\u22ee"}),j===n.id&&(0,b.jsxs)("div",{className:C.columnDropdown,children:["yes"===a.add&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:C.columnDropdownItem,onClick:()=>{return e=n.id,a=n.name,_({title:"Rename Column:",placeholder:"Enter new column name",value:a,onSubmit:n=>{n&&s((a=>a.map((a=>a.id===e?{...a,name:n}:a)))),m(!1)},multiLine:!1}),m(!0),void B(null);var e,a},children:"Rename"}),(0,b.jsx)("div",{className:C.columnDropdownItem,onClick:()=>{return e=n.id,s((n=>n.filter((n=>n.id!==e)))),void B(null);var e},children:"Delete"})]}),(0,b.jsx)("div",{className:C.columnDropdownItem,onClick:()=>{return e=n.id,a=n.color,k({title:"Select Column Colour:",initialColor:a,onSubmit:n=>{s((a=>a.map((a=>a.id===e?{...a,color:n}:a)))),x(!1)}}),x(!0),void B(null);var e,a},children:"Recolour"})]})]})]}),(0,b.jsx)(l.bK,{droppableId:n.id,children:e=>(0,b.jsxs)("div",{className:C.kanbanColumnContent,ref:e.innerRef,...e.droppableProps,children:[n.items.map(((e,a)=>(0,b.jsx)(l._l,{draggableId:e.id,index:a,children:a=>(0,b.jsxs)("div",{className:C.kanbanItem,ref:a.innerRef,...a.draggableProps,...a.dragHandleProps,children:[(0,b.jsx)("div",{className:C.deleteItem,onClick:()=>{return a=n.id,o=e.id,void s((n=>n.map((n=>n.id===a?{...n,items:n.items.filter((n=>n.id!==o))}:n))));var a,o},children:"\u2716"}),(0,b.jsx)(t.Z,{text:e.content,renderNewLines:!0})]})},e.id))),e.placeholder]})})]},n.id)))})})})]})}},4657:(n,e,a)=>{a.d(e,{Z:()=>i});var o=a(8832),l=a(184);function t(n){const e=Math.random().toString(36).substring(2,10),a=n.split("$$"),t=[];return a.forEach(((n,a)=>{a%2===1?t.push((0,l.jsx)(o.InlineMath,{math:n},"MCIM-".concat(e,"-").concat(a))):t.push((0,l.jsx)("span",{children:n},"MCSP-".concat(e,"-").concat(a)))})),t}const i=function(n){let{text:e,renderNewLines:a=!1}=n;return a&&(e=(n=>n.replace(/\\n/g,"\n"))(e)),(0,l.jsx)("div",{style:{whiteSpace:e.includes("\n")&&a?"pre-wrap":"normal",marginTop:e.includes("$$")?"0.5em":"0"},children:t(e)})}}}]);
//# sourceMappingURL=1428.b813f042.chunk.js.map