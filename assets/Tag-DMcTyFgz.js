import{x as co,a0 as no,a1 as o,j as so,m as b,l as k,k as I,y as z,d as to,A as io,n as ho,p as K,a2 as go,z as Co,a3 as bo,i as D,D as t,a4 as vo,q as uo,E as L,a5 as V,s as y,a6 as po}from"./index-CC7GXe4n.js";const fo=i=>{const{textColor2:d,primaryColorHover:r,primaryColorPressed:v,primaryColor:l,infoColor:n,successColor:a,warningColor:c,errorColor:s,baseColor:p,borderColor:f,opacityDisabled:g,tagColor:C,closeIconColor:e,closeIconColorHover:h,closeIconColorPressed:x,borderRadiusSmall:u,fontSizeMini:m,fontSizeTiny:S,fontSizeSmall:B,fontSizeMedium:$,heightMini:H,heightTiny:R,heightSmall:M,heightMedium:E,closeColorHover:_,closeColorPressed:T,buttonColor2Hover:W,buttonColor2Pressed:j,fontWeightStrong:w}=i;return Object.assign(Object.assign({},no),{closeBorderRadius:u,heightTiny:H,heightSmall:R,heightMedium:M,heightLarge:E,borderRadius:u,opacityDisabled:g,fontSizeTiny:m,fontSizeSmall:S,fontSizeMedium:B,fontSizeLarge:$,fontWeightStrong:w,textColorCheckable:d,textColorHoverCheckable:d,textColorPressedCheckable:d,textColorChecked:p,colorCheckable:"#0000",colorHoverCheckable:W,colorPressedCheckable:j,colorChecked:l,colorCheckedHover:r,colorCheckedPressed:v,border:`1px solid ${f}`,textColor:d,color:C,colorBordered:"rgb(250, 250, 252)",closeIconColor:e,closeIconColorHover:h,closeIconColorPressed:x,closeColorHover:_,closeColorPressed:T,borderPrimary:`1px solid ${o(l,{alpha:.3})}`,textColorPrimary:l,colorPrimary:o(l,{alpha:.12}),colorBorderedPrimary:o(l,{alpha:.1}),closeIconColorPrimary:l,closeIconColorHoverPrimary:l,closeIconColorPressedPrimary:l,closeColorHoverPrimary:o(l,{alpha:.12}),closeColorPressedPrimary:o(l,{alpha:.18}),borderInfo:`1px solid ${o(n,{alpha:.3})}`,textColorInfo:n,colorInfo:o(n,{alpha:.12}),colorBorderedInfo:o(n,{alpha:.1}),closeIconColorInfo:n,closeIconColorHoverInfo:n,closeIconColorPressedInfo:n,closeColorHoverInfo:o(n,{alpha:.12}),closeColorPressedInfo:o(n,{alpha:.18}),borderSuccess:`1px solid ${o(a,{alpha:.3})}`,textColorSuccess:a,colorSuccess:o(a,{alpha:.12}),colorBorderedSuccess:o(a,{alpha:.1}),closeIconColorSuccess:a,closeIconColorHoverSuccess:a,closeIconColorPressedSuccess:a,closeColorHoverSuccess:o(a,{alpha:.12}),closeColorPressedSuccess:o(a,{alpha:.18}),borderWarning:`1px solid ${o(c,{alpha:.35})}`,textColorWarning:c,colorWarning:o(c,{alpha:.15}),colorBorderedWarning:o(c,{alpha:.12}),closeIconColorWarning:c,closeIconColorHoverWarning:c,closeIconColorPressedWarning:c,closeColorHoverWarning:o(c,{alpha:.12}),closeColorPressedWarning:o(c,{alpha:.18}),borderError:`1px solid ${o(s,{alpha:.23})}`,textColorError:s,colorError:o(s,{alpha:.1}),colorBorderedError:o(s,{alpha:.08}),closeIconColorError:s,closeIconColorHoverError:s,closeIconColorPressedError:s,closeColorHoverError:o(s,{alpha:.12}),closeColorPressedError:o(s,{alpha:.18})})},mo={name:"Tag",common:co,self:fo},ko=mo,xo={color:Object,type:{type:String,default:"default"},round:Boolean,size:{type:String,default:"medium"},closable:Boolean,disabled:{type:Boolean,default:void 0}},yo=so("tag",`
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
`,[b("strong",`
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
 `),b("round",`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[k("icon",`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),k("avatar",`
 margin: 0 6px 0 calc((var(--n-height) - 8px) / -2);
 `),b("closable",`
 padding: 0 calc(var(--n-height) / 4) 0 calc(var(--n-height) / 3);
 `)]),b("icon, avatar",[b("round",`
 padding: 0 calc(var(--n-height) / 3) 0 calc(var(--n-height) / 2);
 `)]),b("disabled",`
 cursor: not-allowed !important;
 opacity: var(--n-opacity-disabled);
 `),b("checkable",`
 cursor: pointer;
 box-shadow: none;
 color: var(--n-text-color-checkable);
 background-color: var(--n-color-checkable);
 `,[I("disabled",[z("&:hover","background-color: var(--n-color-hover-checkable);",[I("checked","color: var(--n-text-color-hover-checkable);")]),z("&:active","background-color: var(--n-color-pressed-checkable);",[I("checked","color: var(--n-text-color-pressed-checkable);")])]),b("checked",`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[I("disabled",[z("&:hover","background-color: var(--n-color-checked-hover);"),z("&:active","background-color: var(--n-color-checked-pressed);")])])])]),Po=Object.assign(Object.assign(Object.assign({},K.props),xo),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),Io=po("n-tag"),So=to({name:"Tag",props:Po,setup(i){const d=io(null),{mergedBorderedRef:r,mergedClsPrefixRef:v,inlineThemeDisabled:l,mergedRtlRef:n}=ho(i),a=K("Tag","-tag",yo,ko,i,v);go(Io,{roundRef:Co(i,"round")});function c(e){}function s(e){i.triggerClickOnClose||e.stopPropagation()}const p={setTextContent(e){const{value:h}=d;h&&(h.textContent=e)}},f=bo("Tag",n,v),g=D(()=>{const{type:e,size:h,color:{color:x,textColor:u}={}}=i,{common:{cubicBezierEaseInOut:m},self:{padding:S,closeMargin:B,borderRadius:$,opacityDisabled:H,textColorCheckable:R,textColorHoverCheckable:M,textColorPressedCheckable:E,textColorChecked:_,colorCheckable:T,colorHoverCheckable:W,colorPressedCheckable:j,colorChecked:w,colorCheckedHover:N,colorCheckedPressed:A,closeBorderRadius:U,fontWeightStrong:q,[t("colorBordered",e)]:G,[t("closeSize",h)]:J,[t("closeIconSize",h)]:Q,[t("fontSize",h)]:X,[t("height",h)]:O,[t("color",e)]:Y,[t("textColor",e)]:Z,[t("border",e)]:oo,[t("closeIconColor",e)]:F,[t("closeIconColorHover",e)]:eo,[t("closeIconColorPressed",e)]:ro,[t("closeColorHover",e)]:lo,[t("closeColorPressed",e)]:ao}}=a.value,P=vo(B);return{"--n-font-weight-strong":q,"--n-avatar-size-override":`calc(${O} - 8px)`,"--n-bezier":m,"--n-border-radius":$,"--n-border":oo,"--n-close-icon-size":Q,"--n-close-color-pressed":ao,"--n-close-color-hover":lo,"--n-close-border-radius":U,"--n-close-icon-color":F,"--n-close-icon-color-hover":eo,"--n-close-icon-color-pressed":ro,"--n-close-icon-color-disabled":F,"--n-close-margin-top":P.top,"--n-close-margin-right":P.right,"--n-close-margin-bottom":P.bottom,"--n-close-margin-left":P.left,"--n-close-size":J,"--n-color":x||(r.value?G:Y),"--n-color-checkable":T,"--n-color-checked":w,"--n-color-checked-hover":N,"--n-color-checked-pressed":A,"--n-color-hover-checkable":W,"--n-color-pressed-checkable":j,"--n-font-size":X,"--n-height":O,"--n-opacity-disabled":H,"--n-padding":S,"--n-text-color":u||Z,"--n-text-color-checkable":R,"--n-text-color-checked":_,"--n-text-color-hover-checkable":M,"--n-text-color-pressed-checkable":E}}),C=l?uo("tag",D(()=>{let e="";const{type:h,size:x,color:{color:u,textColor:m}={}}=i;return e+=h[0],e+=x[0],u&&(e+=`a${L(u)}`),m&&(e+=`b${L(m)}`),r.value&&(e+="c"),e}),g,i):void 0;return Object.assign(Object.assign({},p),{rtlEnabled:f,mergedClsPrefix:v,contentRef:d,mergedBordered:r,handleClick:c,handleCloseClick:s,cssVars:l?void 0:g,themeClass:C==null?void 0:C.themeClass,onRender:C==null?void 0:C.onRender})},render(){var i,d;const{mergedClsPrefix:r,rtlEnabled:v,color:{borderColor:l}={},round:n,onRender:a,$slots:c}=this,s=!1;a==null||a();const p=V(c.avatar,g=>g&&y("div",{class:`${r}-tag__avatar`},g)),f=V(c.icon,g=>g&&y("div",{class:`${r}-tag__icon`},g));return y("div",{class:[`${r}-tag`,this.themeClass,{[`${r}-tag--rtl`]:v,[`${r}-tag--strong`]:this.strong,[`${r}-tag--disabled`]:!1,[`${r}-tag--checkable`]:!1,[`${r}-tag--checked`]:!1,[`${r}-tag--round`]:n,[`${r}-tag--avatar`]:p,[`${r}-tag--icon`]:f,[`${r}-tag--closable`]:s}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},f||p,y("span",{class:`${r}-tag__content`,ref:"contentRef"},(d=(i=this.$slots).default)===null||d===void 0?void 0:d.call(i)),null,this.mergedBordered?y("div",{class:`${r}-tag__border`,style:{borderColor:l}}):null)}});export{So as _};
