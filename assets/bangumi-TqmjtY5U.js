import{x as q,s as g,j as J,y as x,l as C,m as B,k as X,d as T,n as Z,p as U,z as Q,A as y,B as Y,C as ee,i as L,D as te,q as se,E as ae,b as O,N as ne,G as I,H as oe,I as le,J as re,c as _,h as i,F as A,u as V,a as E,K as $,f as F,o as b,t as k,L as ie}from"./index-CC7GXe4n.js";const ce=e=>{const{railColor:a}=e;return{itemColor:a,itemColorActive:"#FFCC33",sizeSmall:"16px",sizeMedium:"20px",sizeLarge:"24px"}},ue={name:"Rate",common:q,self:ce},de=ue,me=g("svg",{viewBox:"0 0 512 512"},g("path",{d:"M394 480a16 16 0 01-9.39-3L256 383.76 127.39 477a16 16 0 01-24.55-18.08L153 310.35 23 221.2a16 16 0 019-29.2h160.38l48.4-148.95a16 16 0 0130.44 0l48.4 149H480a16 16 0 019.05 29.2L359 310.35l50.13 148.53A16 16 0 01394 480z"})),fe=J("rate",{display:"inline-flex",flexWrap:"nowrap"},[x("&:hover",[C("item",`
 transition:
 transform .1s var(--n-bezier),
 color .3s var(--n-bezier);
 `)]),C("item",`
 position: relative;
 display: flex;
 transition:
 transform .1s var(--n-bezier),
 color .3s var(--n-bezier);
 transform: scale(1);
 font-size: var(--n-item-size);
 color: var(--n-item-color);
 `,[x("&:not(:first-child)",`
 margin-left: 6px;
 `),B("active",`
 color: var(--n-item-color-active);
 `)]),X("readonly",`
 cursor: pointer;
 `,[C("item",[x("&:hover",`
 transform: scale(1.05);
 `),x("&:active",`
 transform: scale(0.96);
 `)])]),C("half",`
 display: flex;
 transition: inherit;
 position: absolute;
 top: 0;
 left: 0;
 bottom: 0;
 width: 50%;
 overflow: hidden;
 color: rgba(255, 255, 255, 0);
 `,[B("active",`
 color: var(--n-item-color-active);
 `)])]),he=Object.assign(Object.assign({},U.props),{allowHalf:Boolean,count:{type:Number,default:5},value:Number,defaultValue:{type:Number,default:null},readonly:Boolean,size:{type:[String,Number],default:"medium"},clearable:Boolean,color:String,onClear:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array]}),ve=T({name:"Rate",props:he,setup(e){const{mergedClsPrefixRef:a,inlineThemeDisabled:r}=Z(e),n=U("Rate","-rate",fe,de,e,a),c=Q(e,"value"),f=y(e.defaultValue),h=y(null),l=Y(e),m=ee(c,f);function u(s){const{"onUpdate:value":o,onUpdateValue:d}=e,{nTriggerFormChange:w,nTriggerFormInput:z}=l;o&&I(o,s),d&&I(d,s),f.value=s,w(),z()}function t(s,o){return o.offsetX>=Math.floor(o.currentTarget.offsetWidth/2)?s+1:s+.5}let v=!1;function H(s,o){v||(h.value=t(s,o))}function W(){h.value=null}function G(s,o){const d=t(s,o);u(d)}function K(){v=!1}const N=L(()=>{const{size:s}=e,{self:o}=n.value;return typeof s=="number"?`${s}px`:o[te("size",s)]}),R=L(()=>{const{common:{cubicBezierEaseInOut:s},self:o}=n.value,{itemColor:d,itemColorActive:w}=o,{color:z}=e;return{"--n-bezier":s,"--n-item-color":d,"--n-item-color-active":z||w,"--n-item-size":N.value}}),p=r?se("rate",L(()=>{const s=N.value,{color:o}=e;let d="";return s&&(d+=s[0]),o&&(d+=ae(o)),d}),R,e):void 0;return{mergedClsPrefix:a,mergedValue:m,hoverIndex:h,handleMouseMove:H,handleClick:G,handleMouseLeave:W,handleMouseEnterSomeStar:K,cssVars:r?void 0:R,themeClass:p==null?void 0:p.themeClass,onRender:p==null?void 0:p.onRender}},render(){const{readonly:e,hoverIndex:a,mergedValue:r,mergedClsPrefix:n,onRender:c,$slots:{default:f}}=this;return c==null||c(),g("div",{class:[`${n}-rate`,{[`${n}-rate--readonly`]:e},this.themeClass],style:this.cssVars,onMouseleave:this.handleMouseLeave},O(this.count,(h,l)=>{const m=f?f({index:l}):g(ne,{clsPrefix:n},{default:()=>me}),u=a!==null?l+1<=a:l+1<=(r||0);return g("div",{key:l,class:[`${n}-rate__item`,u&&`${n}-rate__item--active`],onClick:e?void 0:t=>{this.handleClick(l,t)},onMouseenter:this.handleMouseEnterSomeStar,onMousemove:e?void 0:t=>{this.handleMouseMove(l,t)}},m,g("div",{class:[`${n}-rate__half`,{[`${n}-rate__half--active`]:!u&&a!==null?l+.5<=a:l+.5<=(r||0)}]},m))}))}});function pe(e){return e.map(a=>{const r=oe(a.updated_at);return{...a,updated_at:r}})}const P=12,j=y([]);async function ge(e){const a=e*P,r=await fetch(`https://api.liuly.moe/v0/users/undef_baka/collections?subject_type=2&type=2&limit=${P}&offset=${a}`);if(!r.ok)throw new Error("Network response was not ok");const n=await r.json(),c=n.total;if(j.value=j.value.concat(pe(n.data)),a+n.data.length>=c)throw new Error("No more data")}let D=0;const S=y(!0);async function _e(){try{await ge(D),D++}catch{S.value=!1}}let M=!1;async function be(){M||!S.value||(M=!0,await _e(),M=!1)}const ye=()=>({animeList:j,loading:S,updateAnimeList:be}),xe=i("h1",{class:"text-3xl font-bold"}," 动画列表 ",-1),Ce=i("p",{class:"mt-5"},[F(" 我在 "),i("a",{href:"https://bangumi.tv/user/undef_baka",class:"blue-link",target:"_blank",rel:"noopener noreferrer"},"bangumi"),F(" 上对部分看过动画的评分与短评（Optional）。 ")],-1),ke={class:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5"},we=["href"],ze=["src","alt"],Le={class:"<sm:ml-4 flex flex-col justify-between flex-grow text-sm"},Ve=["href"],Me=i("hr",null,null,-1),je={class:"mt-4 flex flex-wrap justify-center"},Se={class:"text-gray-500 ml-2 text-xs mt-1 <sm:hidden"},Re=T({__name:"bangumi",setup(e){const{animeList:a,loading:r,updateAnimeList:n}=ye(),c=y(),f=new IntersectionObserver(([l])=>{l.isIntersecting&&n()});le(()=>{c.value&&f.observe(c.value)}),re(()=>{f.disconnect()});function h(l){var t;const m=l.target,u=(t=Array.from(m.classList).find(v=>v.startsWith("line-clamp-")))==null?void 0:t.split("-")[2];if(u){const v=m.style.getPropertyValue("-webkit-line-clamp")||u;m.style.setProperty("-webkit-line-clamp",v===u?"unset":u)}}return(l,m)=>{const u=ve;return b(),_(A,null,[xe,Ce,i("div",ke,[(b(!0),_(A,null,O(V(a),t=>(b(),_("div",{key:t.subject.id,class:"flex flex-col justify-between card p-3 <sm:flex-row <sm:items-center"},[i("a",{class:"mb-2 <sm:flex-shrink-0 <sm:basis-2/5",href:`https://bgm.tv/subject/${t.subject.id}`,target:"_blank",rel:"noopener noreferrer"},[i("img",{src:t.subject.images.medium,alt:t.subject.name,class:"rounded-lg w-full",style:{"aspect-ratio":"5 / 7"}},null,8,ze)],8,we),i("div",Le,[i("a",{href:`https://bgm.tv/subject/${t.subject.id}`,target:"_blank",rel:"noopener noreferrer",class:"mt-2 text-lg blue-link font-bold"},k(t.subject.name_cn||t.subject.name),9,Ve),i("div",{class:"cursor-pointer line-clamp-2 text-gray-500 mt-4 mb-2 whitespace-pre-line",onClick:h},k(t.subject.short_summary),1),Me,t.comment?(b(),_("div",{key:0,class:"cursor-pointer line-clamp-3 mt-4",onClick:h},k(t.comment),1)):$("",!0),i("div",je,[E(u,{"default-value":t.rate/2,readonly:"","allow-half":""},null,8,["default-value"]),i("span",Se,k(t.updated_at),1)])])]))),128))]),V(r)?(b(),_("div",{key:0,ref_key:"loadingElement",ref:c,class:"text-center pt-5"},[E(V(ie),{style:{color:"#18a058"}})],512)):$("",!0)],64)}}});export{Re as default};
