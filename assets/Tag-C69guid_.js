import{x as no,a0 as lo,a1 as o,j as ao,m as C,l as k,k as P,y as I,d as co,A as so,n as to,p as U,a2 as io,z as ho,a3 as go,i as D,D as d,a4 as Co,q as bo,E as A,a5 as L,s as f,a6 as vo,G as po}from"./index-BaNlFi6C.js";const uo={name:"Tag",common:no,self:t=>{const{textColor2:g,primaryColorHover:r,primaryColorPressed:b,primaryColor:n,infoColor:i,successColor:l,warningColor:a,errorColor:c,baseColor:v,borderColor:h,opacityDisabled:e,tagColor:s,closeIconColor:m,closeIconColorHover:p,closeIconColorPressed:u,borderRadiusSmall:x,fontSizeMini:z,fontSizeTiny:S,fontSizeSmall:$,fontSizeMedium:B,heightMini:H,heightTiny:R,heightSmall:E,heightMedium:M,closeColorHover:W,closeColorPressed:w,buttonColor2Hover:O,buttonColor2Pressed:T,fontWeightStrong:j}=t;return Object.assign(Object.assign({},lo),{closeBorderRadius:x,heightTiny:H,heightSmall:R,heightMedium:E,heightLarge:M,borderRadius:x,opacityDisabled:e,fontSizeTiny:z,fontSizeSmall:S,fontSizeMedium:$,fontSizeLarge:B,fontWeightStrong:j,textColorCheckable:g,textColorHoverCheckable:g,textColorPressedCheckable:g,textColorChecked:v,colorCheckable:"#0000",colorHoverCheckable:O,colorPressedCheckable:T,colorChecked:n,colorCheckedHover:r,colorCheckedPressed:b,border:`1px solid ${h}`,textColor:g,color:s,colorBordered:"rgb(250, 250, 252)",closeIconColor:m,closeIconColorHover:p,closeIconColorPressed:u,closeColorHover:W,closeColorPressed:w,borderPrimary:`1px solid ${o(n,{alpha:.3})}`,textColorPrimary:n,colorPrimary:o(n,{alpha:.12}),colorBorderedPrimary:o(n,{alpha:.1}),closeIconColorPrimary:n,closeIconColorHoverPrimary:n,closeIconColorPressedPrimary:n,closeColorHoverPrimary:o(n,{alpha:.12}),closeColorPressedPrimary:o(n,{alpha:.18}),borderInfo:`1px solid ${o(i,{alpha:.3})}`,textColorInfo:i,colorInfo:o(i,{alpha:.12}),colorBorderedInfo:o(i,{alpha:.1}),closeIconColorInfo:i,closeIconColorHoverInfo:i,closeIconColorPressedInfo:i,closeColorHoverInfo:o(i,{alpha:.12}),closeColorPressedInfo:o(i,{alpha:.18}),borderSuccess:`1px solid ${o(l,{alpha:.3})}`,textColorSuccess:l,colorSuccess:o(l,{alpha:.12}),colorBorderedSuccess:o(l,{alpha:.1}),closeIconColorSuccess:l,closeIconColorHoverSuccess:l,closeIconColorPressedSuccess:l,closeColorHoverSuccess:o(l,{alpha:.12}),closeColorPressedSuccess:o(l,{alpha:.18}),borderWarning:`1px solid ${o(a,{alpha:.35})}`,textColorWarning:a,colorWarning:o(a,{alpha:.15}),colorBorderedWarning:o(a,{alpha:.12}),closeIconColorWarning:a,closeIconColorHoverWarning:a,closeIconColorPressedWarning:a,closeColorHoverWarning:o(a,{alpha:.12}),closeColorPressedWarning:o(a,{alpha:.18}),borderError:`1px solid ${o(c,{alpha:.23})}`,textColorError:c,colorError:o(c,{alpha:.1}),colorBorderedError:o(c,{alpha:.08}),closeIconColorError:c,closeIconColorHoverError:c,closeIconColorPressedError:c,closeColorHoverError:o(c,{alpha:.12}),closeColorPressedError:o(c,{alpha:.18})})}},ko={color:Object,type:{type:String,default:"default"},round:Boolean,size:{type:String,default:"medium"},closable:Boolean,disabled:{type:Boolean,default:void 0}},mo=ao("tag",`
 --n-close-margin: var(--n-close-margin-top) var(--n-close-margin-right) var(--n-close-margin-bottom) var(--n-close-margin-left);
 white-space: nowrap;
 position: relative;
 box-sizing: border-box;
 cursor: default;
 display: inline-flex;
 align-items: center;
 flex-wrap: nowrap;
 padding: var(--n-padding);
 border-radius: var(--n-border-radius);
 color: var(--n-text-color);
 background-color: var(--n-color);
 transition: 
 border-color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 opacity .3s var(--n-bezier);
 line-height: 1;
 height: var(--n-height);
 font-size: var(--n-font-size);
`,[C("strong",`
 font-weight: var(--n-font-weight-strong);
 `),k("border",`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
 border: var(--n-border);
 transition: border-color .3s var(--n-bezier);
 `),k("icon",`
 display: flex;
 margin: 0 4px 0 0;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 font-size: var(--n-avatar-size-override);
 `),k("avatar",`
 display: flex;
 margin: 0 6px 0 0;
 `),k("close",`
 margin: var(--n-close-margin);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),C("round",`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[k("icon",`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),k("avatar",`
 margin: 0 6px 0 calc((var(--n-height) - 8px) / -2);
 `),C("closable",`
 padding: 0 calc(var(--n-height) / 4) 0 calc(var(--n-height) / 3);
 `)]),C("icon, avatar",[C("round",`
 padding: 0 calc(var(--n-height) / 3) 0 calc(var(--n-height) / 2);
 `)]),C("disabled",`
 cursor: not-allowed !important;
 opacity: var(--n-opacity-disabled);
 `),C("checkable",`
 cursor: pointer;
 box-shadow: none;
 color: var(--n-text-color-checkable);
 background-color: var(--n-color-checkable);
 `,[P("disabled",[I("&:hover","background-color: var(--n-color-hover-checkable);",[P("checked","color: var(--n-text-color-hover-checkable);")]),I("&:active","background-color: var(--n-color-pressed-checkable);",[P("checked","color: var(--n-text-color-pressed-checkable);")])]),C("checked",`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[P("disabled",[I("&:hover","background-color: var(--n-color-checked-hover);"),I("&:active","background-color: var(--n-color-checked-pressed);")])])])]),fo=Object.assign(Object.assign(Object.assign({},U.props),ko),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),xo=vo("n-tag"),Po=co({name:"Tag",props:fo,setup(t){const g=so(null),{mergedBorderedRef:r,mergedClsPrefixRef:b,inlineThemeDisabled:n,mergedRtlRef:i}=to(t),l=U("Tag","-tag",mo,uo,t,b);io(xo,{roundRef:ho(t,"round")});const a={setTextContent(e){const{value:s}=g;s&&(s.textContent=e)}},c=go("Tag",i,b),v=D(()=>{const{type:e,size:s,color:{color:m,textColor:p}={}}=t,{common:{cubicBezierEaseInOut:u},self:{padding:x,closeMargin:z,borderRadius:S,opacityDisabled:$,textColorCheckable:B,textColorHoverCheckable:H,textColorPressedCheckable:R,textColorChecked:E,colorCheckable:M,colorHoverCheckable:W,colorPressedCheckable:w,colorChecked:O,colorCheckedHover:T,colorCheckedPressed:j,closeBorderRadius:V,fontWeightStrong:q,[d("colorBordered",e)]:G,[d("closeSize",s)]:J,[d("closeIconSize",s)]:K,[d("fontSize",s)]:N,[d("height",s)]:_,[d("color",e)]:Q,[d("textColor",e)]:X,[d("border",e)]:Y,[d("closeIconColor",e)]:F,[d("closeIconColorHover",e)]:Z,[d("closeIconColorPressed",e)]:oo,[d("closeColorHover",e)]:eo,[d("closeColorPressed",e)]:ro}}=l.value,y=Co(z);return{"--n-font-weight-strong":q,"--n-avatar-size-override":`calc(${_} - 8px)`,"--n-bezier":u,"--n-border-radius":S,"--n-border":Y,"--n-close-icon-size":K,"--n-close-color-pressed":ro,"--n-close-color-hover":eo,"--n-close-border-radius":V,"--n-close-icon-color":F,"--n-close-icon-color-hover":Z,"--n-close-icon-color-pressed":oo,"--n-close-icon-color-disabled":F,"--n-close-margin-top":y.top,"--n-close-margin-right":y.right,"--n-close-margin-bottom":y.bottom,"--n-close-margin-left":y.left,"--n-close-size":J,"--n-color":m||(r.value?G:Q),"--n-color-checkable":M,"--n-color-checked":O,"--n-color-checked-hover":T,"--n-color-checked-pressed":j,"--n-color-hover-checkable":W,"--n-color-pressed-checkable":w,"--n-font-size":N,"--n-height":_,"--n-opacity-disabled":$,"--n-padding":x,"--n-text-color":p||X,"--n-text-color-checkable":B,"--n-text-color-checked":E,"--n-text-color-hover-checkable":H,"--n-text-color-pressed-checkable":R}}),h=n?bo("tag",D(()=>{let e="";const{type:s,size:m,color:{color:p,textColor:u}={}}=t;return e+=s[0],e+=m[0],p&&(e+=`a${A(p)}`),u&&(e+=`b${A(u)}`),r.value&&(e+="c"),e}),v,t):void 0;return Object.assign(Object.assign({},a),{rtlEnabled:c,mergedClsPrefix:b,contentRef:g,mergedBordered:r,handleClick:function(e){},handleCloseClick:function(e){t.triggerClickOnClose||e.stopPropagation();{const{onClose:s}=t;s&&po(s,e)}},cssVars:n?void 0:v,themeClass:h==null?void 0:h.themeClass,onRender:h==null?void 0:h.onRender})},render(){var t,g;const{mergedClsPrefix:r,rtlEnabled:b,color:{borderColor:n}={},round:i,onRender:l,$slots:a}=this;l==null||l();const c=L(a.avatar,h=>h&&f("div",{class:`${r}-tag__avatar`},h)),v=L(a.icon,h=>h&&f("div",{class:`${r}-tag__icon`},h));return f("div",{class:[`${r}-tag`,this.themeClass,{[`${r}-tag--rtl`]:b,[`${r}-tag--strong`]:this.strong,[`${r}-tag--disabled`]:!1,[`${r}-tag--checkable`]:!1,[`${r}-tag--checked`]:!1,[`${r}-tag--round`]:i,[`${r}-tag--avatar`]:c,[`${r}-tag--icon`]:v,[`${r}-tag--closable`]:!1}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},v||c,f("span",{class:`${r}-tag__content`,ref:"contentRef"},(g=(t=this.$slots).default)===null||g===void 0?void 0:g.call(t)),null,this.mergedBordered?f("div",{class:`${r}-tag__border`,style:{borderColor:n}}):null)}});export{Po as _};
