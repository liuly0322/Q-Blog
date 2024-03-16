import{j as w,k as h,l,m as o,d as _,n as C,p as f,i as y,q as $,s as d,F as g,v as z,c as u,a as j,w as q,h as c,b as P,u as B,o as p,f as m,t as v}from"./index-f4lxPngi.js";const R=w("divider",`
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
 `)]),l("title",`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),o("title-position-left",[l("line",[o("left",{width:"28px"})])]),o("title-position-right",[l("line",[o("right",{width:"28px"})])]),o("dashed",[l("line",`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),o("vertical",`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),l("line",`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),h("dashed",[l("line",{backgroundColor:"var(--n-color)"})]),o("dashed",[l("line",{borderColor:"var(--n-color)"})]),o("vertical",{backgroundColor:"var(--n-color)"})]),O=Object.assign(Object.assign({},f.props),{titlePlacement:{type:String,default:"center"},dashed:Boolean,vertical:Boolean}),S=_({name:"Divider",props:O,setup(i){const{mergedClsPrefixRef:s,inlineThemeDisabled:a}=C(i),r=f("Divider","-divider",R,z,i,s),t=y(()=>{const{common:{cubicBezierEaseInOut:e},self:{color:x,textColor:b,fontWeight:k}}=r.value;return{"--n-bezier":e,"--n-color":x,"--n-text-color":b,"--n-font-weight":k}}),n=a?$("divider",void 0,t,i):void 0;return{mergedClsPrefix:s,cssVars:a?void 0:t,themeClass:n==null?void 0:n.themeClass,onRender:n==null?void 0:n.onRender}},render(){var i;const{$slots:s,titlePlacement:a,vertical:r,dashed:t,cssVars:n,mergedClsPrefix:e}=this;return(i=this.onRender)===null||i===void 0||i.call(this),d("div",{role:"separator",class:[`${e}-divider`,this.themeClass,{[`${e}-divider--vertical`]:r,[`${e}-divider--no-title`]:!s.default,[`${e}-divider--dashed`]:t,[`${e}-divider--title-position-${a}`]:s.default&&a}],style:n},r?null:d("div",{class:`${e}-divider__line ${e}-divider__line--left`}),!r&&s.default?d(g,null,d("div",{class:`${e}-divider__title`},this.$slots),d("div",{class:`${e}-divider__line ${e}-divider__line--right`})):null)}}),T=[{avatar:"https://lain.bgm.tv/pic/user/l/000/61/04/610402.jpg",name:"MomoTori",introduction:"Ciallo~",url:"http://home.ustc.edu.cn/~taoyang_2002/"},{avatar:"https://xkz0777.github.io/images/icon.jpg",name:"xkz's blog",introduction:"xls!",url:"https://xkz0777.github.io/"},{avatar:"https://q2.qlogo.cn/headimg_dl?dst_uin=2292009362&spec=100",name:"Fluegelcat",introduction:"0. 0",url:"http://home.ustc.edu.cn/~es020711/blog/"},{avatar:"https://q2.qlogo.cn/g?b=qq&nk=1418373194&s=0",name:"Citrine",introduction:"txtxtxj",url:"https://txtxj.top/"},{avatar:"https://irisesd.github.io/assets/img/icon3.png",name:"IrisesD",introduction:"SE & Systems",url:"https://irisesd.github.io/"},{avatar:"https://q2.qlogo.cn/headimg_dl?dst_uin=364105900&spec=100",name:"PRO",introduction:"很多 emoji 的博客",url:"https://pro-2684.github.io/"}],V={class:"overflow-hidden flex flex-wrap"},D=["href"],E=["src","alt"],M={class:"flex flex-col"},N=_({__name:"links",setup(i){return(s,a)=>{const r=S;return p(),u(g,null,[j(r,{"title-placement":"left"},{default:q(()=>[m(" 友情链接 ")]),_:1}),c("div",V,[(p(!0),u(g,null,P(B(T),t=>(p(),u("a",{key:t.name,href:t.url,target:"_blank",class:"flex-auto text-left m-2.5 flex card p-4"},[c("img",{src:t.avatar,alt:t.name,class:"mr-3 rounded-full",height:"48",width:"48"},null,8,E),c("div",M,[c("b",null,v(t.name),1),m(" "+v(t.introduction),1)])],8,D))),128))])],64)}}}),I=Object.freeze(Object.defineProperty({__proto__:null,default:N},Symbol.toStringTag,{value:"Module"}));export{S as _,I as l};
