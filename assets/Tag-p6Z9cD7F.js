import{x as no,a0 as lo,a1 as o,j as ao,m as b,l as k,k as P,y as I,d as co,A as so,n as to,p as U,a2 as io,z as ho,a3 as go,i as D,D as t,a4 as bo,q as Co,E as A,a5 as L,s as f,a6 as vo}from"./index-DgDpiFLA.js";const po={name:"Tag",common:no,self:i=>{const{textColor2:h,primaryColorHover:r,primaryColorPressed:C,primaryColor:n,infoColor:s,successColor:l,warningColor:a,errorColor:c,baseColor:v,borderColor:d,opacityDisabled:e,tagColor:g,closeIconColor:m,closeIconColorHover:p,closeIconColorPressed:u,borderRadiusSmall:x,fontSizeMini:z,fontSizeTiny:S,fontSizeSmall:$,fontSizeMedium:B,heightMini:H,heightTiny:R,heightSmall:E,heightMedium:M,closeColorHover:W,closeColorPressed:w,buttonColor2Hover:O,buttonColor2Pressed:T,fontWeightStrong:j}=i;return Object.assign(Object.assign({},lo),{closeBorderRadius:x,heightTiny:H,heightSmall:R,heightMedium:E,heightLarge:M,borderRadius:x,opacityDisabled:e,fontSizeTiny:z,fontSizeSmall:S,fontSizeMedium:$,fontSizeLarge:B,fontWeightStrong:j,textColorCheckable:h,textColorHoverCheckable:h,textColorPressedCheckable:h,textColorChecked:v,colorCheckable:"#0000",colorHoverCheckable:O,colorPressedCheckable:T,colorChecked:n,colorCheckedHover:r,colorCheckedPressed:C,border:`1px solid ${d}`,textColor:h,color:g,colorBordered:"rgb(250, 250, 252)",closeIconColor:m,closeIconColorHover:p,closeIconColorPressed:u,closeColorHover:W,closeColorPressed:w,borderPrimary:`1px solid ${o(n,{alpha:.3})}`,textColorPrimary:n,colorPrimary:o(n,{alpha:.12}),colorBorderedPrimary:o(n,{alpha:.1}),closeIconColorPrimary:n,closeIconColorHoverPrimary:n,closeIconColorPressedPrimary:n,closeColorHoverPrimary:o(n,{alpha:.12}),closeColorPressedPrimary:o(n,{alpha:.18}),borderInfo:`1px solid ${o(s,{alpha:.3})}`,textColorInfo:s,colorInfo:o(s,{alpha:.12}),colorBorderedInfo:o(s,{alpha:.1}),closeIconColorInfo:s,closeIconColorHoverInfo:s,closeIconColorPressedInfo:s,closeColorHoverInfo:o(s,{alpha:.12}),closeColorPressedInfo:o(s,{alpha:.18}),borderSuccess:`1px solid ${o(l,{alpha:.3})}`,textColorSuccess:l,colorSuccess:o(l,{alpha:.12}),colorBorderedSuccess:o(l,{alpha:.1}),closeIconColorSuccess:l,closeIconColorHoverSuccess:l,closeIconColorPressedSuccess:l,closeColorHoverSuccess:o(l,{alpha:.12}),closeColorPressedSuccess:o(l,{alpha:.18}),borderWarning:`1px solid ${o(a,{alpha:.35})}`,textColorWarning:a,colorWarning:o(a,{alpha:.15}),colorBorderedWarning:o(a,{alpha:.12}),closeIconColorWarning:a,closeIconColorHoverWarning:a,closeIconColorPressedWarning:a,closeColorHoverWarning:o(a,{alpha:.12}),closeColorPressedWarning:o(a,{alpha:.18}),borderError:`1px solid ${o(c,{alpha:.23})}`,textColorError:c,colorError:o(c,{alpha:.1}),colorBorderedError:o(c,{alpha:.08}),closeIconColorError:c,closeIconColorHoverError:c,closeIconColorPressedError:c,closeColorHoverError:o(c,{alpha:.12}),closeColorPressedError:o(c,{alpha:.18})})}},uo={color:Object,type:{type:String,default:"default"},round:Boolean,size:{type:String,default:"medium"},closable:Boolean,disabled:{type:Boolean,default:void 0}},ko=ao("tag",`
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
 `,[P("disabled",[I("&:hover","background-color: var(--n-color-hover-checkable);",[P("checked","color: var(--n-text-color-hover-checkable);")]),I("&:active","background-color: var(--n-color-pressed-checkable);",[P("checked","color: var(--n-text-color-pressed-checkable);")])]),b("checked",`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[P("disabled",[I("&:hover","background-color: var(--n-color-checked-hover);"),I("&:active","background-color: var(--n-color-checked-pressed);")])])])]),mo=Object.assign(Object.assign(Object.assign({},U.props),uo),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),fo=vo("n-tag"),yo=co({name:"Tag",props:mo,setup(i){const h=so(null),{mergedBorderedRef:r,mergedClsPrefixRef:C,inlineThemeDisabled:n,mergedRtlRef:s}=to(i),l=U("Tag","-tag",ko,po,i,C);io(fo,{roundRef:ho(i,"round")});const a={setTextContent(e){const{value:g}=h;g&&(g.textContent=e)}},c=go("Tag",s,C),v=D(()=>{const{type:e,size:g,color:{color:m,textColor:p}={}}=i,{common:{cubicBezierEaseInOut:u},self:{padding:x,closeMargin:z,borderRadius:S,opacityDisabled:$,textColorCheckable:B,textColorHoverCheckable:H,textColorPressedCheckable:R,textColorChecked:E,colorCheckable:M,colorHoverCheckable:W,colorPressedCheckable:w,colorChecked:O,colorCheckedHover:T,colorCheckedPressed:j,closeBorderRadius:V,fontWeightStrong:q,[t("colorBordered",e)]:G,[t("closeSize",g)]:J,[t("closeIconSize",g)]:K,[t("fontSize",g)]:N,[t("height",g)]:_,[t("color",e)]:Q,[t("textColor",e)]:X,[t("border",e)]:Y,[t("closeIconColor",e)]:F,[t("closeIconColorHover",e)]:Z,[t("closeIconColorPressed",e)]:oo,[t("closeColorHover",e)]:eo,[t("closeColorPressed",e)]:ro}}=l.value,y=bo(z);return{"--n-font-weight-strong":q,"--n-avatar-size-override":`calc(${_} - 8px)`,"--n-bezier":u,"--n-border-radius":S,"--n-border":Y,"--n-close-icon-size":K,"--n-close-color-pressed":ro,"--n-close-color-hover":eo,"--n-close-border-radius":V,"--n-close-icon-color":F,"--n-close-icon-color-hover":Z,"--n-close-icon-color-pressed":oo,"--n-close-icon-color-disabled":F,"--n-close-margin-top":y.top,"--n-close-margin-right":y.right,"--n-close-margin-bottom":y.bottom,"--n-close-margin-left":y.left,"--n-close-size":J,"--n-color":m||(r.value?G:Q),"--n-color-checkable":M,"--n-color-checked":O,"--n-color-checked-hover":T,"--n-color-checked-pressed":j,"--n-color-hover-checkable":W,"--n-color-pressed-checkable":w,"--n-font-size":N,"--n-height":_,"--n-opacity-disabled":$,"--n-padding":x,"--n-text-color":p||X,"--n-text-color-checkable":B,"--n-text-color-checked":E,"--n-text-color-hover-checkable":H,"--n-text-color-pressed-checkable":R}}),d=n?Co("tag",D(()=>{let e="";const{type:g,size:m,color:{color:p,textColor:u}={}}=i;return e+=g[0],e+=m[0],p&&(e+=`a${A(p)}`),u&&(e+=`b${A(u)}`),r.value&&(e+="c"),e}),v,i):void 0;return Object.assign(Object.assign({},a),{rtlEnabled:c,mergedClsPrefix:C,contentRef:h,mergedBordered:r,handleClick:function(e){},handleCloseClick:function(e){i.triggerClickOnClose||e.stopPropagation()},cssVars:n?void 0:v,themeClass:d==null?void 0:d.themeClass,onRender:d==null?void 0:d.onRender})},render(){var i,h;const{mergedClsPrefix:r,rtlEnabled:C,color:{borderColor:n}={},round:s,onRender:l,$slots:a}=this;l==null||l();const c=L(a.avatar,d=>d&&f("div",{class:`${r}-tag__avatar`},d)),v=L(a.icon,d=>d&&f("div",{class:`${r}-tag__icon`},d));return f("div",{class:[`${r}-tag`,this.themeClass,{[`${r}-tag--rtl`]:C,[`${r}-tag--strong`]:this.strong,[`${r}-tag--disabled`]:!1,[`${r}-tag--checkable`]:!1,[`${r}-tag--checked`]:!1,[`${r}-tag--round`]:s,[`${r}-tag--avatar`]:c,[`${r}-tag--icon`]:v,[`${r}-tag--closable`]:!1}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},v||c,f("span",{class:`${r}-tag__content`,ref:"contentRef"},(h=(i=this.$slots).default)===null||h===void 0?void 0:h.call(i)),null,this.mergedBordered?f("div",{class:`${r}-tag__border`,style:{borderColor:n}}):null)}});export{yo as _};
