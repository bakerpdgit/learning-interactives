"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[568],{9568:(e,s,a)=>{a.r(s),a.d(s,{default:()=>M});var t=a(2791);const l="SelfReview_selfReview__XPlJX",r="SelfReview_questionContainer__Oipih",n="SelfReview_question__pFBwN",i="SelfReview_marksAvailable__peDzO",c="SelfReview_questionProgress__2wJg1",m="SelfReview_answerInput__UNYOG",_="SelfReview_marksScored__xrVZg",d="SelfReview_markschemeContainer__hLvJH",h="SelfReview_markschemePoint__ywFii",o="SelfReview_selected__2-Rx4",v="SelfReview_reviewButton__3ewA3",w="SelfReview_reviewDisplay__3KWUD",u="SelfReview_reviewTable__kwktq",x="SelfReview_questionCell__Es-Ju",k="SelfReview_markschemeCell__1drON",f="SelfReview_reviewQuestionText__aGkwu",S="SelfReview_reviewMarksAvailable__KQGFo",j="SelfReview_userAnswer__znmsu",p="SelfReview_reviewMarkschemePoint__kA7po",N="SelfReview_overallScore__Se1Y7",R="SelfReview_highlight__YSPKJ",g="SelfReview_celebration__D40k7";var q=a(184);const y=e=>e.replace(/\*([^*]+)\*/g,"<span class=".concat(R,">$1</span>")),C=e=>{let{questions:s}=e;const a=s.reduce(((e,s)=>e+Math.min(s.markscheme.filter((e=>e.selected)).length,s.marks)),0),t=s.reduce(((e,s)=>e+s.marks),0);return(0,q.jsxs)("div",{className:w,children:[(0,q.jsx)("table",{className:u,children:(0,q.jsx)("tbody",{children:s.map(((e,s)=>(0,q.jsxs)("tr",{children:[(0,q.jsxs)("td",{className:x,children:[(0,q.jsx)("div",{className:f,children:e.text}),(0,q.jsxs)("div",{className:S,children:["[",e.marks,"]"]}),(0,q.jsx)("div",{className:j,children:e.answer})]}),(0,q.jsxs)("td",{className:k,children:[e.markscheme.map(((e,s)=>(0,q.jsx)("div",{className:"".concat(p," ").concat(e.selected?o:""),dangerouslySetInnerHTML:{__html:y(e.text)}},s))),(0,q.jsxs)("div",{className:_,children:["[",Math.min(e.markscheme.filter((e=>e.selected)).length,e.marks)," ","marks scored]"]})]})]},s)))})}),(0,q.jsxs)("div",{className:N,children:["Overall score: ",a," out of ",t]})]})},b=e=>{let{question:s,mode:a,onAnswerChange:t,onSelectMarkschemePoint:l}=e;const c=Math.min(s.markscheme.filter((e=>e.selected)).length,s.marks);return(0,q.jsxs)("div",{className:r,children:[(0,q.jsx)("div",{className:n,children:s.text}),(0,q.jsxs)("div",{className:i,children:["[",s.marks,"]"]}),(0,q.jsx)("textarea",{className:m,value:s.answer,onChange:e=>t(e.target.value),placeholder:"Type your answer here...",readOnly:"question"!==a}),"review"===a&&(0,q.jsxs)(q.Fragment,{children:[(0,q.jsx)("div",{className:d,children:s.markscheme.map(((e,s)=>(0,q.jsx)("div",{onClick:()=>l(s),className:"".concat(h," ").concat(e.selected?o:""),dangerouslySetInnerHTML:{__html:y(e.text)}},s)))}),(0,q.jsxs)("div",{className:_,children:["[",c," marks scored]"]})]})]})},M=e=>{let{text:s}=e;const[a,r]=(0,t.useState)(0),[n,i]=(0,t.useState)([]),[m,_]=(0,t.useState)(""),[d,h]=(0,t.useState)(!1),[o,w]=(0,t.useState)(!1);(0,t.useEffect)((()=>{const{title:e,questions:a}=(e=>{const s=e.split("\n\n");return{title:s.shift(),questions:s.map(((e,s)=>{const a=e.split("\n").filter((e=>""!==e.trim()));return{text:"".concat(s+1,". ").concat(a[0]),marks:parseInt(a[1],10),markscheme:a.slice(2).map((e=>({text:e,selected:!1}))),answer:""}}))}})(s);_(e),i(a),r(0),h(!1)}),[s]);return(0,q.jsxs)(q.Fragment,{children:[(0,q.jsx)("h1",{className:"interactiveTitle",children:m}),(0,q.jsx)("div",{className:l,children:o?(0,q.jsxs)(q.Fragment,{children:[(0,q.jsx)("div",{className:g,children:"\ud83d\ude03"}),(0,q.jsx)(C,{questions:n})]}):(0,q.jsxs)(q.Fragment,{children:[a<n.length&&(0,q.jsxs)(q.Fragment,{children:[(0,q.jsx)(b,{question:n[a],mode:d?"review":"question",onAnswerChange:e=>((e,s)=>{i((a=>a.map(((a,t)=>t===e?{...a,answer:s}:a))))})(a,e),onSelectMarkschemePoint:e=>((e,s)=>{i((a=>a.map(((a,t)=>{if(t===e){const e=a.markscheme.map(((e,a)=>a===s?{...e,selected:!e.selected}:e));return{...a,markscheme:e}}return a}))))})(a,e)}),(0,q.jsxs)("div",{className:c,children:["[Question ",a+1," of ",n.length,"]"]})]}),(0,q.jsx)("button",{onClick:()=>{d?(r((e=>e+1<n.length?e+1:e)),a===n.length-1&&w(!0),h(!1)):h(!0)},className:v,children:d&&a<n.length-1?"Next":d?"Review Summary":"Review"})]})})]})}}}]);
//# sourceMappingURL=568.0e7ff5f9.chunk.js.map