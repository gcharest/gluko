import{d as y,o as u,c as d,a as e,t as l,b as h,w as b,u as i,R as _,e as N,F as $,f as v,g as R,h as V,r as A,i as f,v as p,j as F,k as L,l as S,m as q,n as w,p as E}from"./vendor.df8df59a.js";const M=function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerpolicy&&(o.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?o.credentials="include":t.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(t){if(t.ep)return;t.ep=!0;const o=n(t);fetch(t.href,o)}};M();const T={skipToContent:"Skip to content"},P="Carbs",Q="About",O="Counter",U="Total count of carbs",j="Factor",I="Reset";var W={navigation:T,home:P,about:Q,Calculateur:O,message:U,"Nom de l'aliment":"Nutrient",Quantit\u00E9:"Quantity",Facteur:j,"Ajouter un aliment":"Add a nutrient",Reset:I};const B={skipToContent:"Aller au contenu"},D="Glucides",G="\xC0 propos",K="Calculateur",z="Total des glucides",H="Facteur",J="R\xE9initialiser";var X={navigation:B,home:D,about:G,Calculateur:K,message:z,"Nom de l'aliment":"Aliment",Quantit\u00E9:"Quantit\xE9",Facteur:H,"Ajouter un aliment":"Ajouter un aliment",Reset:J};const Y={class:"visually-hidden-focusable",href:"#content"},Z={class:"navbar navbar-expand-md navbar-dark bg-dark"},x={class:"container-fluid"},tt=e("a",{class:"navbar-brand",href:"#"},"Gluko",-1),et=e("button",{class:"navbar-toggler",type:"button","data-bs-toggle":"collapse","data-bs-target":"#navbarMain","aria-controls":"navbarMain","aria-expanded":"false","aria-label":"Toggle navigation"},[e("span",{class:"navbar-toggler-icon"})],-1),ot={class:"collapse navbar-collapse",id:"navbarMain"},at={class:"navbar-nav me-auto mb-2 mb-lg-0"},st={class:"nav-item"},nt={class:"nav-item"},rt=y({setup(c){return(a,n)=>(u(),d($,null,[e("header",null,[e("a",Y,l(a.$t("navigation.skipToContent")),1),e("nav",Z,[e("div",x,[tt,et,e("div",ot,[e("ul",at,[e("li",st,[h(i(_),{class:"nav-link",to:"/"},{default:b(()=>[v(l(a.$t("home")),1)]),_:1})]),e("li",nt,[h(i(_),{class:"nav-link",to:"/about"},{default:b(()=>[v(l(a.$t("about")),1)]),_:1})])])])])])]),h(i(N))],64))}}),lt="modulepreload",g={},it="/gluko/",ct=function(a,n){return!n||n.length===0?a():Promise.all(n.map(r=>{if(r=`${it}${r}`,r in g)return;g[r]=!0;const t=r.endsWith(".css"),o=t?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${o}`))return;const s=document.createElement("link");if(s.rel=t?"stylesheet":lt,t||(s.as="script",s.crossOrigin=""),s.href=r,document.head.appendChild(s),t)return new Promise((k,C)=>{s.addEventListener("load",k),s.addEventListener("error",C)})})).then(()=>a())},ut=R({id:"meal",state:()=>({nutrients:V("nutrients",[{name:"default",quantity:0,factor:0}])}),getters:{getAllNutrients(){return this.nutrients},nutrientEmpty(){return this.nutrients.length<=0},mealCarbs(){return this.nutrients.reduce((a,n)=>a+n.quantity*n.factor,0)}},actions:{addNutrient(c){this.nutrients.push(c)},removeNutrient(c){this.nutrients.splice(c,1)},resetMeal(){this.nutrients=[{name:"",quantity:0,factor:0}]}}}),dt={class:"bd-main container"},mt={class:"text-light"},ht={class:"col form-floating mb-3"},ft=["onUpdate:modelValue","placeholder","id"],pt=["for"],bt={class:"col form-floating mb-3"},_t=["onUpdate:modelValue","placeholder","id"],vt=["for"],gt={class:"col form-floating mb-3"},yt=["onUpdate:modelValue","placeholder","id"],$t=["for"],kt={class:"col"},Ct=["onClick"],Nt=e("i",{class:"bi bi-trash3-fill"},null,-1),Rt=[Nt],Vt={class:"row"},At={class:"col"},Ft={class:"col"},Lt={class:"row"},St={class:"col mt-3"},qt={class:"text-light"},wt=y({setup(c){const a=ut();return(n,r)=>(u(),d("main",dt,[e("h1",mt,l(n.$t("Calculateur")),1),e("form",null,[(u(!0),d($,null,A(i(a).nutrients,(t,o)=>(u(),d("div",{class:"row g-3",key:t.name},[e("div",ht,[f(e("input",{type:"text",class:"form-control text-black","onUpdate:modelValue":s=>t.name=s,placeholder:t.name,id:"nutrientName"+o},null,8,ft),[[p,t.name,void 0,{lazy:!0}]]),e("label",{class:"text-dark",for:"nutrientName"+o},l(n.$t("Nom de l'aliment")),9,pt)]),e("div",bt,[f(e("input",{type:"decimal",class:"form-control","onUpdate:modelValue":s=>t.quantity=s,placeholder:t.quantity.toString(),id:"nutrientQuantity"+o},null,8,_t),[[p,t.quantity]]),e("label",{for:"nutrientQuantity"+o},l(n.$t("Quantit\xE9")),9,vt)]),e("div",gt,[f(e("input",{type:"decimal",class:"form-control","onUpdate:modelValue":s=>t.factor=s,placeholder:t.factor.toString(),id:"nutrientFactor"+o},null,8,yt),[[p,t.factor]]),e("label",{for:"nutrientFactor"+o},l(n.$t("Facteur")),9,$t)]),e("div",kt,[i(a).nutrients.length>1?(u(),d("button",{key:0,type:"button",class:"btn btn-outline-light",onClick:s=>i(a).removeNutrient(o)},Rt,8,Ct)):F("",!0)])]))),128)),e("div",Vt,[e("div",At,[e("button",{type:"button",class:"btn btn-primary",onClick:r[0]||(r[0]=t=>i(a).addNutrient({name:"",quantity:0,factor:0}))},l(n.$t("Ajouter un aliment")),1)]),e("div",Ft,[e("button",{type:"button",class:"btn btn-secondary",onClick:r[1]||(r[1]=(...t)=>i(a).resetMeal&&i(a).resetMeal(...t))},l(n.$t("Reset")),1)])]),e("div",Lt,[e("div",St,[e("h2",qt,l(n.$t("message"))+": "+l(Math.round(i(a).mealCarbs*100)/100),1)])])])]))}}),Et=L({history:S("/gluko/"),routes:[{path:"/",name:"home",component:wt},{path:"/about",name:"about",component:()=>ct(()=>import("./AboutView.1fe5a08e.js"),["assets/AboutView.1fe5a08e.js","assets/vendor.df8df59a.js"])}]}),Mt=q({messages:{en:W,fr:X},locale:"fr",fallbackLocale:"fr",resolveWithKeyValue:!0,fallbackWarn:!1}),Tt=w(),m=E(rt);m.use(Tt);m.use(Et);m.use(Mt);m.mount("#app");
