"use strict";(self.webpackChunkcomplianz_gdpr=self.webpackChunkcomplianz_gdpr||[]).push([[3990,2010],{52010:(e,t,l)=>{l.r(t),l.d(t,{default:()=>m});var n=l(51609),a=l(45111),c=l(86087);const m=e=>{const[t,l]=(0,c.useState)(!1);return(0,n.createElement)("div",{className:"cmplz-panel__list__item",style:e.style?e.style:{}},(0,n.createElement)("details",{open:t},(0,n.createElement)("summary",{onClick:e=>(e=>{e.preventDefault(),l(!t)})(e)},e.icon&&(0,n.createElement)(a.default,{name:e.icon}),(0,n.createElement)("h5",{className:"cmplz-panel__list__item__title"},e.summary),(0,n.createElement)("div",{className:"cmplz-panel__list__item__comment"},e.comment),(0,n.createElement)("div",{className:"cmplz-panel__list__item__icons"},e.icons),(0,n.createElement)(a.default,{name:"chevron-down",size:18})),(0,n.createElement)("div",{className:"cmplz-panel__list__item__details"},t&&e.details)))}},3990:(e,t,l)=>{l.r(t),l.d(t,{default:()=>p});var n=l(51609),a=l(52010),c=l(27723),m=l(45111),i=l(86087),o=l(4219),s=l(42838),r=l.n(s);const p=(0,i.memo)((e=>{const{updateField:t,setChangedField:l,getFieldValue:i}=(0,o.default)();return(0,n.createElement)(n.Fragment,null,(0,n.createElement)(a.default,{summary:e.plugin.plugin_name,icon:e.icon,icons:(0,n.createElement)(n.Fragment,null,(0,n.createElement)("button",{className:"cmplz-button-icon",onClick:n=>((e,n,a)=>{a.preventDefault();let c=i("custom_privacy_policy_text");c+="<h1>"+e+"</h1>"+n,t("custom_privacy_policy_text",c),l("custom_privacy_policy_text",c)})(e.plugin.plugin_name,e.plugin.policy_text,n)},(0,n.createElement)(m.default,{tooltip:(0,c.__)("Add to annex of Privacy Statement","complianz-gdpr"),name:"plus"})),"na"!==e.plugin.consent_api&&(0,n.createElement)(n.Fragment,null,(0,n.createElement)("button",{className:"cmplz-button-icon"},!e.plugin.consent_api&&(0,n.createElement)(m.default,{tooltip:(0,c.__)("Does not conform with the Consent API","complianz-gdpr"),name:"circle",color:"red"}),e.plugin.consent_api&&(0,n.createElement)(m.default,{tooltip:(0,c.__)("Conforms to the Consent API","complianz-gdpr"),name:"circle",color:"green"})))),details:(0,n.createElement)(n.Fragment,null,(0,n.createElement)("div",{className:"cmplz-details-row",dangerouslySetInnerHTML:{__html:r().sanitize(e.plugin.policy_text)}}))}))}))}}]);