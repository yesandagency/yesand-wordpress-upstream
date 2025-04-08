"use strict";(globalThis.webpackChunkcomplianz_gdpr=globalThis.webpackChunkcomplianz_gdpr||[]).push([[2058,6902],{42058:(e,n,a)=>{a.r(n),a.d(n,{default:()=>u});var l=a(51609),r=a(27723),t=a(4219),o=a(86087),i=a(52043),d=a(45111),c=a(76902);const u=(0,o.memo)((()=>{const{fieldsLoaded:e,fields:n,updateField:a,getFieldValue:u,changedFields:s,setChangedField:p,updateFieldsData:g,addHelpNotice:m,fetchAllFieldsCompleted:_,allRequiredFieldsCompleted:h,notCompletedRequiredFields:b}=(0,t.default)(),{getMenuLinkById:f}=(0,i.default)(),{cookiebannerRequired:k,getCookieBannerRequired:z}=(0,c.default)();return(0,o.useEffect)((()=>{e&&(s.length>0||z())}),[s]),(0,o.useEffect)((()=>{e&&_()}),[e,n]),(0,o.useEffect)((()=>{e&&u("cookie_banner_required")!==k&&(a("cookie_banner_required",k),p("cookie_banner_required",k),g())}),[e,k]),(0,o.useEffect)((()=>{if(e)if(k){let e=(0,r.__)("The consent banner and cookie blocker are required on your website.","complianz-gdpr")+" "+(0,r.__)("You can enable them both here, then you should check your website if your configuration is working properly.","complianz-gdpr")+" "+(0,r.__)("Please read the below article to debug any issues while in safe mode. Safe mode is available under settings.","complianz-gdpr")+" "+(0,r.__)("You will find tips and tricks on your dashboard after you have configured your consent banner.","complianz-gdpr");m("last-step-feedback","default",e,(0,r.__)("A consent banner is required","complianz-gdpr"),"https://complianz.io/debugging-manual")}else{let e=(0,r.__)("Your site does not require a consent banner. If you think you need a consent banner, please review your wizard settings.","complianz-gdpr");m("last-step-feedback","warning",e,(0,r.__)("A consent banner is not required","complianz-gdpr"))}}),[e,k,s]),(0,l.createElement)(l.Fragment,null,b.length<2&&(0,l.createElement)("b",null,(0,r.__)("Almost there!","complianz-gdpr")),b.length>=2&&(0,l.createElement)("b",null,(0,r.__)("There are %s questions that are required to complete the wizard.","complianz-gdpr").replace("%s",b.length)),h&&(0,l.createElement)("div",null,(0,l.createElement)("p",null,(0,r.__)("Click '%s' to complete the configuration. You can come back to change your configuration at any time.","complianz-gdpr").replace("%s",(0,r.__)("Finish","complianz-gdpr"))),k&&(0,l.createElement)("p",null,(0,r.__)("The consent banner and the cookie blocker are now ready to be enabled.","complianz-gdpr")+" "+(0,r.__)("Please check your website after finishing the wizard to verify that your configuration is working properly.","complianz-gdpr"))),!h&&(0,l.createElement)("div",null,(0,l.createElement)("p",null,(0,r.__)("Not all required fields are completed yet.","complianz-gdpr")+" "+(0,r.__)("Please check the wizard to complete all required questions.","complianz-gdpr")),(0,l.createElement)("p",null,(0,r.__)("The following required fields have not been completed:","complianz-gdpr")),(0,l.createElement)("ul",null,b.map(((e,n)=>(0,l.createElement)("li",{key:n},(0,l.createElement)("div",null,e.parent_label?e.parent_label:e.label," ",(0,l.createElement)("a",{href:f(e.menu_id)},(0,l.createElement)(d.default,{name:"circle-chevron-right",color:"black",tooltip:(0,r.__)("Go to question","complianz-gdpr"),size:14})))))))))}))},76902:(e,n,a)=>{a.r(n),a.d(n,{default:()=>t});var l=a(81621),r=a(9588);const t=(0,l.vt)(((e,n)=>({cookiebannerRequired:!1,loading:!1,getCookieBannerRequired:async()=>{if(n().loading)return;e({loading:!0});const{required:a}=await r.doAction("get_cookiebanner_required",{}).then((e=>e));e({cookiebannerRequired:a,loading:!1})}})))}}]);