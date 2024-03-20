import{j as k,k as h,l as a,m as n,d as x,n as $,p as v,i as y,q as z,s as d,F as g,v as C,c as u,a as j,w as q,h as c,b as P,u as S,o as p,f as m,t as b}from"./index-DgDpiFLA.js";const O=k("divider",`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[h("vertical",`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[h("no-title",`
 display: flex;
 align-items: center;
 `)]),a("title",`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),n("title-position-left",[a("line",[n("left",{width:"28px"})])]),n("title-position-right",[a("line",[n("right",{width:"28px"})])]),n("dashed",[a("line",`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),n("vertical",`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),a("line",`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),h("dashed",[a("line",{backgroundColor:"var(--n-color)"})]),n("dashed",[a("line",{borderColor:"var(--n-color)"})]),n("vertical",{backgroundColor:"var(--n-color)"})]),R=x({name:"Divider",props:Object.assign(Object.assign({},v.props),{titlePlacement:{type:String,default:"center"},dashed:Boolean,vertical:Boolean}),setup(i){const{mergedClsPrefixRef:r,inlineThemeDisabled:o}=$(i),l=v("Divider","-divider",O,C,i,r),e=y(()=>{const{common:{cubicBezierEaseInOut:t},self:{color:f,textColor:_,fontWeight:w}}=l.value;return{"--n-bezier":t,"--n-color":f,"--n-text-color":_,"--n-font-weight":w}}),s=o?z("divider",void 0,e,i):void 0;return{mergedClsPrefix:r,cssVars:o?void 0:e,themeClass:s==null?void 0:s.themeClass,onRender:s==null?void 0:s.onRender}},render(){var i;const{$slots:r,titlePlacement:o,vertical:l,dashed:e,cssVars:s,mergedClsPrefix:t}=this;return(i=this.onRender)===null||i===void 0||i.call(this),d("div",{role:"separator",class:[`${t}-divider`,this.themeClass,{[`${t}-divider--vertical`]:l,[`${t}-divider--no-title`]:!r.default,[`${t}-divider--dashed`]:e,[`${t}-divider--title-position-${o}`]:r.default&&o}],style:s},l?null:d("div",{class:`${t}-divider__line ${t}-divider__line--left`}),!l&&r.default?d(g,null,d("div",{class:`${t}-divider__title`},this.$slots),d("div",{class:`${t}-divider__line ${t}-divider__line--right`})):null)}}),D=[{avatar:"https://lain.bgm.tv/pic/user/l/000/61/04/610402.jpg",name:"MomoTori",introduction:"Ciallo~",url:"http://home.ustc.edu.cn/~taoyang_2002/"},{avatar:"https://xkz0777.github.io/images/icon.jpg",name:"xkz's blog",introduction:"xls!",url:"https://xkz0777.github.io/"},{avatar:"https://q2.qlogo.cn/headimg_dl?dst_uin=2292009362&spec=100",name:"Fluegelcat",introduction:"0. 0",url:"http://home.ustc.edu.cn/~es020711/blog/"},{avatar:"https://q2.qlogo.cn/g?b=qq&nk=1418373194&s=0",name:"Citrine",introduction:"txtxtxj",url:"https://txtxj.top/"},{avatar:"https://irisesd.github.io/assets/img/icon3.png",name:"IrisesD",introduction:"SE & Systems",url:"https://irisesd.github.io/"},{avatar:"https://q2.qlogo.cn/headimg_dl?dst_uin=364105900&spec=100",name:"PRO",introduction:"很多 emoji 的博客",url:"https://pro-2684.github.io/"},{avatar:"https://sproutnan.github.io/static/assets/img/photo.jpg",name:"SproutNan",introduction:"Societal AI",url:"https://sproutnan.github.io/"}],B={class:"overflow-hidden flex flex-wrap"},I=["href"],T=["src","alt"],E={class:"flex flex-col"},F=x({__name:"links",setup:i=>(r,o)=>{const l=R;return p(),u(g,null,[j(l,{"title-placement":"left"},{default:q(()=>[m(" 友情链接 ")]),_:1}),c("div",B,[(p(!0),u(g,null,P(S(D),e=>(p(),u("a",{key:e.name,href:e.url,target:"_blank",class:"flex-auto text-left m-2.5 flex card p-4"},[c("img",{src:e.avatar,alt:e.name,class:"mr-3 rounded-full",height:"48",width:"48"},null,8,T),c("div",E,[c("b",null,b(e.name),1),m(" "+b(e.introduction),1)])],8,I))),128))])],64)}}),V=Object.freeze(Object.defineProperty({__proto__:null,default:F},Symbol.toStringTag,{value:"Module"}));export{R as _,V as l};
