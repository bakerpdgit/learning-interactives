"use strict";(self.webpackChunkmy_react_app=self.webpackChunkmy_react_app||[]).push([[568],{9568:(e,s,a)=>{a.r(s),a.d(s,{default:()=>F});var t=a(2791);const l="SelfReview_interactiveSubTitle__Qr0qs",r="SelfReview_selfReview__XPlJX",n="SelfReview_questionContainer__Oipih",i="SelfReview_question__pFBwN",c="SelfReview_marksAvailable__peDzO",m="SelfReview_questionProgress__2wJg1",_="SelfReview_answerInput__UNYOG",d="SelfReview_marksScored__xrVZg",h="SelfReview_markschemeContainer__hLvJH",o="SelfReview_markschemePoint__ywFii",v="SelfReview_selected__2-Rx4",u="SelfReview_reviewButton__3ewA3",w="SelfReview_reviewDisplay__3KWUD",x="SelfReview_reviewTable__kwktq",S="SelfReview_questionCell__Es-Ju",f="SelfReview_markschemeCell__1drON",k="SelfReview_reviewQuestionText__aGkwu",j="SelfReview_reviewMarksAvailable__KQGFo",p="SelfReview_userAnswer__znmsu",R="SelfReview_reviewMarkschemePoint__kA7po",N="SelfReview_overallScore__Se1Y7",g="SelfReview_highlight__YSPKJ",q="SelfReview_celebration__D40k7";var y=a(184);const C=e=>e.replace(/\*([^*]+)\*/g,"<span class=".concat(g,">$1</span>")),b=e=>{let{questions:s}=e;const a=s.reduce(((e,s)=>e+Math.min(s.markscheme.filter((e=>e.selected)).length,s.marks)),0),t=s.reduce(((e,s)=>e+s.marks),0);return(0,y.jsxs)("div",{className:w,children:[(0,y.jsx)("table",{className:x,children:(0,y.jsx)("tbody",{children:s.map(((e,s)=>(0,y.jsxs)("tr",{children:[(0,y.jsxs)("td",{className:S,children:[(0,y.jsx)("div",{className:k,children:e.text}),(0,y.jsxs)("div",{className:j,children:["[",e.marks,"]"]}),(0,y.jsx)("div",{className:p,children:e.answer})]}),(0,y.jsxs)("td",{className:f,children:[e.markscheme.map(((e,s)=>(0,y.jsx)("div",{className:"".concat(R," ").concat(e.selected?v:""),dangerouslySetInnerHTML:{__html:C(e.text)}},s))),(0,y.jsxs)("div",{className:d,children:["[",Math.min(e.markscheme.filter((e=>e.selected)).length,e.marks)," ","marks scored]"]})]})]},s)))})}),(0,y.jsxs)("div",{className:N,children:["Overall score: ",a," out of ",t]})]})},M=e=>{let{question:s,mode:a,onAnswerChange:t,onSelectMarkschemePoint:l}=e;const r=Math.min(s.markscheme.filter((e=>e.selected)).length,s.marks);return(0,y.jsxs)("div",{className:n,children:[(0,y.jsx)("div",{className:i,children:s.text}),(0,y.jsxs)("div",{className:c,children:["[",s.marks,"]"]}),(0,y.jsx)("textarea",{className:_,value:s.answer,onChange:e=>t(e.target.value),placeholder:"Type your answer here...",readOnly:"question"!==a}),"review"===a&&(0,y.jsxs)(y.Fragment,{children:[(0,y.jsxs)("div",{className:h,children:["Select the points you included in your answer:",s.markscheme.map(((e,s)=>(0,y.jsx)("div",{onClick:()=>l(s),className:"".concat(o," ").concat(e.selected?v:""),dangerouslySetInnerHTML:{__html:C(e.text)}},s)))]}),(0,y.jsxs)("div",{className:d,children:["[",r," marks scored]"]})]})]})},F=e=>{let{text:s}=e;const[a,n]=(0,t.useState)(0),[i,c]=(0,t.useState)([]),[_,d]=(0,t.useState)(""),[h,o]=(0,t.useState)(!1),[v,w]=(0,t.useState)(!1);(0,t.useEffect)((()=>{const{title:e,questions:a}=(e=>{const s=e.split("\n\n");return{title:s.shift(),questions:s.map(((e,s)=>{const a=e.split("\n").filter((e=>""!==e.trim()));return{text:"".concat(s+1,". ").concat(a[0]),marks:parseInt(a[1],10),markscheme:a.slice(2).map((e=>({text:e,selected:!1}))),answer:""}}))}})(s);d(e),c(a),n(0),o(!1)}),[s]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)("h1",{className:l,children:_}),(0,y.jsx)("div",{className:r,children:v?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)("div",{className:q,children:"\ud83d\ude03"}),(0,y.jsx)(b,{questions:i})]}):(0,y.jsxs)(y.Fragment,{children:[a<i.length&&(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(M,{question:i[a],mode:h?"review":"question",onAnswerChange:e=>((e,s)=>{c((a=>a.map(((a,t)=>t===e?{...a,answer:s}:a))))})(a,e),onSelectMarkschemePoint:e=>((e,s)=>{c((a=>a.map(((a,t)=>{if(t===e){const e=a.markscheme.map(((e,a)=>a===s?{...e,selected:!e.selected}:e));return{...a,markscheme:e}}return a}))))})(a,e)}),(0,y.jsxs)("div",{className:m,children:["[Question ",a+1," of ",i.length,"]"]})]}),(0,y.jsx)("button",{onClick:()=>{h?(n((e=>e+1<i.length?e+1:e)),a===i.length-1&&w(!0),o(!1)):o(!0)},className:u,children:h&&a<i.length-1?"Next":h?"Review Summary":"Review"})]})})]})}}}]);
//# sourceMappingURL=568.29084708.chunk.js.map