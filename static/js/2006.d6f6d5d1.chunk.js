"use strict";(self.webpackChunkclass_interactives=self.webpackChunkclass_interactives||[]).push([[2006],{2006:(t,e,s)=>{s.r(e),s.d(e,{default:()=>o});var n=s(2791);const l="DeckOfCards_cardContainer__W0kVx",a="DeckOfCards_card__Tk3MG",c="DeckOfCards_buttons__oVC93",r="DeckOfCards_button__3f8yT";var i=s(184);const o=function(t){let{text:e}=t;const[s,o]=(0,n.useState)((t=>{let e=[...t];for(let s=e.length-1;s>0;s--){const t=Math.floor(Math.random()*(s+1));[e[s],e[t]]=[e[t],e[s]]}return e})((t=>t.split("\n").map((t=>{const[e,s]=t.split("@"),n=e.split("|"),l=n[0],a=n.length>1?n[1]:"";return{front:l.trim(),back:a.trim(),hasFlip:n.length>1,link:s?s.trim():""}})))(e))),[d,h]=(0,n.useState)(0),[k,u]=(0,n.useState)(!1);return(0,i.jsx)("div",{className:l,children:0===s.length?(0,i.jsx)("div",{className:a,children:"No more cards in the deck."}):(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("div",{className:a,onClick:()=>(()=>{const t=s[d];t.link?window.open(t.link,"_blank"):u(!k)})(),style:{cursor:s[d].link||s[d].hasFlip?"pointer":"default"},children:k&&s[d].back?s[d].back:s[d].front}),(0,i.jsxs)("div",{className:c,children:[(0,i.jsx)("button",{className:r,onClick:()=>{u(!1),h((d+1)%s.length)},children:"Next"}),(0,i.jsx)("button",{className:r,onClick:()=>{const t=s.filter(((t,e)=>e!==d));o(t),h(d%t.length)},children:"Remove"}),s[d].hasFlip&&(0,i.jsx)("button",{className:r,onClick:()=>{u(!k)},children:"Flip"})]})]})})}}}]);
//# sourceMappingURL=2006.d6f6d5d1.chunk.js.map