import{x as D,s as h,j as q,y as _,l as C,m as F,k as G,d as T,n as J,p as E,z as K,A as y,B as X,C as Q,i as z,D as Y,q as Z,E as ee,b as U,N as te,G as I,H as ae,I as ne,J as se,c as b,h as i,F as N,u as M,a as R,K as S,f as B,o as g,t as j,L as le}from"./index-BaSu0joe.js";const re={name:"Rate",common:D,self:t=>{const{railColor:l}=t;return{itemColor:l,itemColorActive:"#FFCC33",sizeSmall:"16px",sizeMedium:"20px",sizeLarge:"24px"}}},oe=h("svg",{viewBox:"0 0 512 512"},h("path",{d:"M394 480a16 16 0 01-9.39-3L256 383.76 127.39 477a16 16 0 01-24.55-18.08L153 310.35 23 221.2a16 16 0 019-29.2h160.38l48.4-148.95a16 16 0 0130.44 0l48.4 149H480a16 16 0 019.05 29.2L359 310.35l50.13 148.53A16 16 0 01394 480z"})),ie=q("rate",{display:"inline-flex",flexWrap:"nowrap"},[_("&:hover",[C("item",`
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
 `,[_("&:not(:first-child)",`
 margin-left: 6px;
 `),F("active",`
 color: var(--n-item-color-active);
 `)]),G("readonly",`
 cursor: pointer;
 `,[C("item",[_("&:hover",`
 transform: scale(1.05);
 `),_("&:active",`
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
 `,[F("active",`
 color: var(--n-item-color-active);
 `)])]),ce=T({name:"Rate",props:Object.assign(Object.assign({},E.props),{allowHalf:Boolean,count:{type:Number,default:5},value:Number,defaultValue:{type:Number,default:null},readonly:Boolean,size:{type:[String,Number],default:"medium"},clearable:Boolean,color:String,onClear:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array]}),setup(t){const{mergedClsPrefixRef:l,inlineThemeDisabled:u}=J(t),a=E("Rate","-rate",ie,re,t,l),m=K(t,"value"),c=y(t.defaultValue),d=y(null),n=X(t),f=Q(m,c);function o(s,r){return r.offsetX>=Math.floor(r.currentTarget.offsetWidth/2)?s+1:s+.5}let e=!1;const p=z(()=>{const{size:s}=t,{self:r}=a.value;return typeof s=="number"?`${s}px`:r[Y("size",s)]}),V=z(()=>{const{common:{cubicBezierEaseInOut:s},self:r}=a.value,{itemColor:v,itemColorActive:w}=r,{color:k}=t;return{"--n-bezier":s,"--n-item-color":v,"--n-item-color-active":k||w,"--n-item-size":p.value}}),x=u?Z("rate",z(()=>{const s=p.value,{color:r}=t;let v="";return s&&(v+=s[0]),r&&(v+=ee(r)),v}),V,t):void 0;return{mergedClsPrefix:l,mergedValue:f,hoverIndex:d,handleMouseMove:function(s,r){e||(d.value=o(s,r))},handleClick:function(s,r){(function(v){const{"onUpdate:value":w,onUpdateValue:k}=t,{nTriggerFormChange:H,nTriggerFormInput:W}=n;w&&I(w,v),k&&I(k,v),c.value=v,H(),W()})(o(s,r))},handleMouseLeave:function(){d.value=null},handleMouseEnterSomeStar:function(){e=!1},cssVars:u?void 0:V,themeClass:x==null?void 0:x.themeClass,onRender:x==null?void 0:x.onRender}},render(){const{readonly:t,hoverIndex:l,mergedValue:u,mergedClsPrefix:a,onRender:m,$slots:{default:c}}=this;return m==null||m(),h("div",{class:[`${a}-rate`,{[`${a}-rate--readonly`]:t},this.themeClass],style:this.cssVars,onMouseleave:this.handleMouseLeave},U(this.count,(d,n)=>{const f=c?c({index:n}):h(te,{clsPrefix:a},{default:()=>oe}),o=l!==null?n+1<=l:n+1<=(u||0);return h("div",{key:n,class:[`${a}-rate__item`,o&&`${a}-rate__item--active`],onClick:t?void 0:e=>{this.handleClick(n,e)},onMouseenter:this.handleMouseEnterSomeStar,onMousemove:t?void 0:e=>{this.handleMouseMove(n,e)}},f,h("div",{class:[`${a}-rate__half`,{[`${a}-rate__half--active`]:o||l===null?n+.5<=(u||0):n+.5<=l}]},f))}))}}),P=12,$=y([]);async function ue(t){const l=t*P,u=await fetch(`https://api.liuly.moe/v0/users/undef_baka/collections?subject_type=2&type=2&limit=${P}&offset=${l}`);if(!u.ok)throw new Error("Network response was not ok");const a=await u.json(),m=a.total;if($.value=$.value.concat(a.data.map(c=>{const d=ae(c.updated_at);return{...c,updated_at:d}})),l+a.data.length>=m)throw new Error("No more data")}let O=0;const A=y(!0);let L=!1;async function me(){!L&&A.value&&(L=!0,await async function(){try{await ue(O),O++}catch{A.value=!1}}(),L=!1)}const de=()=>({animeList:$,loading:A,updateAnimeList:me}),fe=i("h1",{class:"text-3xl font-bold"}," 动画列表 ",-1),ve=i("p",{class:"mt-5"},[B(" 我在 "),i("a",{href:"https://bangumi.tv/user/undef_baka",class:"blue-link",target:"_blank",rel:"noopener noreferrer"},"bangumi"),B(" 上对部分看过动画的评分与短评（Optional）。 ")],-1),pe={class:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5"},he=["href"],be=["src","alt"],ge={class:"<sm:ml-4 flex flex-col justify-between flex-grow text-sm"},ye=["href"],xe=i("hr",null,null,-1),we={class:"mt-4 flex flex-wrap justify-center"},ke={class:"text-gray-500 ml-2 text-xs mt-1 <sm:hidden"},Ce=T({__name:"bangumi",setup(t){const{animeList:l,loading:u,updateAnimeList:a}=de(),m=y(),c=new IntersectionObserver(([n])=>{n.isIntersecting&&a()});function d(n){var e;const f=n.target,o=(e=Array.from(f.classList).find(p=>p.startsWith("line-clamp-")))==null?void 0:e.split("-")[2];if(o){const p=f.style.getPropertyValue("-webkit-line-clamp")||o;f.style.setProperty("-webkit-line-clamp",p===o?"unset":o)}}return ne(()=>{m.value&&c.observe(m.value)}),se(()=>{c.disconnect()}),(n,f)=>{const o=ce;return g(),b(N,null,[fe,ve,i("div",pe,[(g(!0),b(N,null,U(M(l),e=>(g(),b("div",{key:e.subject.id,class:"flex flex-col justify-between card p-3 <sm:flex-row <sm:items-center"},[i("a",{class:"mb-2 <sm:flex-shrink-0 <sm:basis-2/5",href:`https://bgm.tv/subject/${e.subject.id}`,target:"_blank",rel:"noopener noreferrer"},[i("img",{src:e.subject.images.medium,alt:e.subject.name,class:"rounded-lg w-full",style:{"aspect-ratio":"5 / 7"}},null,8,be)],8,he),i("div",ge,[i("a",{href:`https://bgm.tv/subject/${e.subject.id}`,target:"_blank",rel:"noopener noreferrer",class:"mt-2 text-lg blue-link font-bold"},j(e.subject.name_cn||e.subject.name),9,ye),i("div",{class:"cursor-pointer line-clamp-2 text-gray-500 mt-4 mb-2 whitespace-pre-line",onClick:d},j(e.subject.short_summary),1),xe,e.comment?(g(),b("div",{key:0,class:"cursor-pointer line-clamp-3 mt-4",onClick:d},j(e.comment),1)):S("",!0),i("div",we,[R(o,{"default-value":e.rate/2,readonly:"","allow-half":""},null,8,["default-value"]),i("span",ke,j(e.updated_at),1)])])]))),128))]),M(u)?(g(),b("div",{key:0,ref_key:"loadingElement",ref:m,class:"text-center pt-5"},[R(M(le),{style:{color:"#18a058"}})],512)):S("",!0)],64)}}});export{Ce as default};
