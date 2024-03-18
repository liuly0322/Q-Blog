import{x as q,s as _,j as J,y as w,l as k,m as B,k as X,d as T,n as Z,p as U,z as Q,A as C,B as Y,C as ee,i as L,D as te,q as ae,E as se,b as H,N as ne,G as I,H as oe,I as le,J as re,c as y,h as u,F as A,u as V,a as E,K as $,f as F,o as x,t as z,L as ie}from"./index-B-qyixBe.js";const ce=e=>{const{railColor:s}=e;return{itemColor:s,itemColorActive:"#FFCC33",sizeSmall:"16px",sizeMedium:"20px",sizeLarge:"24px"}},ue={name:"Rate",common:q,self:ce},de=ue,fe=_("svg",{viewBox:"0 0 512 512"},_("path",{d:"M394 480a16 16 0 01-9.39-3L256 383.76 127.39 477a16 16 0 01-24.55-18.08L153 310.35 23 221.2a16 16 0 019-29.2h160.38l48.4-148.95a16 16 0 0130.44 0l48.4 149H480a16 16 0 019.05 29.2L359 310.35l50.13 148.53A16 16 0 01394 480z"})),me=J("rate",{display:"inline-flex",flexWrap:"nowrap"},[w("&:hover",[k("item",`
 transition:
 transform .1s var(--n-bezier),
 color .3s var(--n-bezier);
 `)]),k("item",`
 position: relative;
 display: flex;
 transition:
 transform .1s var(--n-bezier),
 color .3s var(--n-bezier);
 transform: scale(1);
 font-size: var(--n-item-size);
 color: var(--n-item-color);
 `,[w("&:not(:first-child)",`
 margin-left: 6px;
 `),B("active",`
 color: var(--n-item-color-active);
 `)]),X("readonly",`
 cursor: pointer;
 `,[k("item",[w("&:hover",`
 transform: scale(1.05);
 `),w("&:active",`
 transform: scale(0.96);
 `)])]),k("half",`
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
 `)])]),he=Object.assign(Object.assign({},U.props),{allowHalf:Boolean,count:{type:Number,default:5},value:Number,defaultValue:{type:Number,default:null},readonly:Boolean,size:{type:[String,Number],default:"medium"},clearable:Boolean,color:String,onClear:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array]}),ve=T({name:"Rate",props:he,setup(e){const{mergedClsPrefixRef:s,inlineThemeDisabled:r}=Z(e),n=U("Rate","-rate",me,de,e,s),d=Q(e,"value"),m=C(e.defaultValue),h=C(null),l=Y(e),f=ee(d,m);function i(a){const{"onUpdate:value":o,onUpdateValue:c}=e,{nTriggerFormChange:b,nTriggerFormInput:p}=l;o&&I(o,a),c&&I(c,a),m.value=a,b(),p()}function t(a,o){return e.allowHalf?o.offsetX>=Math.floor(o.currentTarget.offsetWidth/2)?a+1:a+.5:a+1}let v=!1;function O(a,o){v||(h.value=t(a,o))}function W(){h.value=null}function G(a,o){var c;const{clearable:b}=e,p=t(a,o);b&&p===f.value?(v=!0,(c=e.onClear)===null||c===void 0||c.call(e),h.value=null,i(null)):i(p)}function K(){v=!1}const N=L(()=>{const{size:a}=e,{self:o}=n.value;return typeof a=="number"?`${a}px`:o[te("size",a)]}),R=L(()=>{const{common:{cubicBezierEaseInOut:a},self:o}=n.value,{itemColor:c,itemColorActive:b}=o,{color:p}=e;return{"--n-bezier":a,"--n-item-color":c,"--n-item-color-active":p||b,"--n-item-size":N.value}}),g=r?ae("rate",L(()=>{const a=N.value,{color:o}=e;let c="";return a&&(c+=a[0]),o&&(c+=se(o)),c}),R,e):void 0;return{mergedClsPrefix:s,mergedValue:f,hoverIndex:h,handleMouseMove:O,handleClick:G,handleMouseLeave:W,handleMouseEnterSomeStar:K,cssVars:r?void 0:R,themeClass:g==null?void 0:g.themeClass,onRender:g==null?void 0:g.onRender}},render(){const{readonly:e,hoverIndex:s,mergedValue:r,mergedClsPrefix:n,onRender:d,$slots:{default:m}}=this;return d==null||d(),_("div",{class:[`${n}-rate`,{[`${n}-rate--readonly`]:e},this.themeClass],style:this.cssVars,onMouseleave:this.handleMouseLeave},H(this.count,(h,l)=>{const f=m?m({index:l}):_(ne,{clsPrefix:n},{default:()=>fe}),i=s!==null?l+1<=s:l+1<=(r||0);return _("div",{key:l,class:[`${n}-rate__item`,i&&`${n}-rate__item--active`],onClick:e?void 0:t=>{this.handleClick(l,t)},onMouseenter:this.handleMouseEnterSomeStar,onMousemove:e?void 0:t=>{this.handleMouseMove(l,t)}},f,this.allowHalf?_("div",{class:[`${n}-rate__half`,{[`${n}-rate__half--active`]:!i&&s!==null?l+.5<=s:l+.5<=(r||0)}]},f):null)}))}});function ge(e){return e.map(s=>{const r=oe(s.updated_at);return{...s,updated_at:r}})}const P=12,j=C([]);async function pe(e){const s=e*P,r=await fetch(`https://api.liuly.moe/v0/users/undef_baka/collections?subject_type=2&type=2&limit=${P}&offset=${s}`);if(!r.ok)throw new Error("Network response was not ok");const n=await r.json(),d=n.total;if(j.value=j.value.concat(ge(n.data)),s+n.data.length>=d)throw new Error("No more data")}let D=0;const S=C(!0);async function _e(){try{await pe(D),D++}catch{S.value=!1}}let M=!1;async function be(){M||!S.value||(M=!0,await _e(),M=!1)}const ye=()=>({animeList:j,loading:S,updateAnimeList:be}),xe=u("h1",{class:"text-3xl font-bold"}," 动画列表 ",-1),Ce=u("p",{class:"mt-5"},[F(" 我在 "),u("a",{href:"https://bangumi.tv/user/undef_baka",class:"blue-link",target:"_blank",rel:"noopener noreferrer"},"bangumi"),F(" 上对部分看过动画的评分与短评（Optional）。 ")],-1),we={class:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5"},ke=["href"],ze=["src","alt"],Le={class:"<sm:ml-4 flex flex-col justify-between flex-grow text-sm"},Ve=["href"],Me=u("hr",null,null,-1),je={class:"mt-4 flex flex-wrap justify-center"},Se={class:"text-gray-500 ml-2 text-xs mt-1 <sm:hidden"},Re=T({__name:"bangumi",setup(e){const{animeList:s,loading:r,updateAnimeList:n}=ye(),d=C(),m=new IntersectionObserver(([l])=>{l.isIntersecting&&n()});le(()=>{d.value&&m.observe(d.value)}),re(()=>{m.disconnect()});function h(l){var t;const f=l.target,i=(t=Array.from(f.classList).find(v=>v.startsWith("line-clamp-")))==null?void 0:t.split("-")[2];if(i){const v=f.style.getPropertyValue("-webkit-line-clamp")||i;f.style.setProperty("-webkit-line-clamp",v===i?"unset":i)}}return(l,f)=>{const i=ve;return x(),y(A,null,[xe,Ce,u("div",we,[(x(!0),y(A,null,H(V(s),t=>(x(),y("div",{key:t.subject.id,class:"flex flex-col justify-between card p-3 <sm:flex-row <sm:items-center"},[u("a",{class:"mb-2 <sm:flex-shrink-0 <sm:basis-2/5",href:`https://bgm.tv/subject/${t.subject.id}`,target:"_blank",rel:"noopener noreferrer"},[u("img",{src:t.subject.images.medium,alt:t.subject.name,class:"rounded-lg w-full",style:{"aspect-ratio":"5 / 7"}},null,8,ze)],8,ke),u("div",Le,[u("a",{href:`https://bgm.tv/subject/${t.subject.id}`,target:"_blank",rel:"noopener noreferrer",class:"mt-2 text-lg blue-link font-bold"},z(t.subject.name_cn||t.subject.name),9,Ve),u("div",{class:"cursor-pointer line-clamp-2 text-gray-500 mt-4 mb-2 whitespace-pre-line",onClick:h},z(t.subject.short_summary),1),Me,t.comment?(x(),y("div",{key:0,class:"cursor-pointer line-clamp-3 mt-4",onClick:h},z(t.comment),1)):$("",!0),u("div",je,[E(i,{"default-value":t.rate/2,readonly:"","allow-half":""},null,8,["default-value"]),u("span",Se,z(t.updated_at),1)])])]))),128))]),V(r)?(x(),y("div",{key:0,ref_key:"loadingElement",ref:d,class:"text-center pt-5"},[E(V(ie),{style:{color:"#18a058"}})],512)):$("",!0)],64)}}});export{Re as default};
