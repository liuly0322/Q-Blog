import{a0 as to,s as b,j as U,m as g,y as u,k as P,d as V,a1 as io,z as K,N as ho,x as bo,a2 as go,a3 as e,l as z,A as uo,n as vo,p as q,a4 as Co,a5 as fo,i as F,D as h,a6 as po,q as ko,E as D,a7 as N,a8 as mo,G as xo}from"./index-B-qyixBe.js";const yo=to("close",b("svg",{viewBox:"0 0 12 12",version:"1.1",xmlns:"http://www.w3.org/2000/svg","aria-hidden":!0},b("g",{stroke:"none","stroke-width":"1",fill:"none","fill-rule":"evenodd"},b("g",{fill:"currentColor","fill-rule":"nonzero"},b("path",{d:"M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"}))))),zo=U("base-close",`
 display: flex;
 align-items: center;
 justify-content: center;
 cursor: pointer;
 background-color: transparent;
 color: var(--n-close-icon-color);
 border-radius: var(--n-close-border-radius);
 height: var(--n-close-size);
 width: var(--n-close-size);
 font-size: var(--n-close-icon-size);
 outline: none;
 border: none;
 position: relative;
 padding: 0;
`,[g("absolute",`
 height: var(--n-close-icon-size);
 width: var(--n-close-icon-size);
 `),u("&::before",`
 content: "";
 position: absolute;
 width: var(--n-close-size);
 height: var(--n-close-size);
 left: 50%;
 top: 50%;
 transform: translateY(-50%) translateX(-50%);
 transition: inherit;
 border-radius: inherit;
 `),P("disabled",[u("&:hover",`
 color: var(--n-close-icon-color-hover);
 `),u("&:hover::before",`
 background-color: var(--n-close-color-hover);
 `),u("&:focus::before",`
 background-color: var(--n-close-color-hover);
 `),u("&:active",`
 color: var(--n-close-icon-color-pressed);
 `),u("&:active::before",`
 background-color: var(--n-close-color-pressed);
 `)]),g("disabled",`
 cursor: not-allowed;
 color: var(--n-close-icon-color-disabled);
 background-color: transparent;
 `),g("round",[u("&::before",`
 border-radius: 50%;
 `)])]),Po=V({name:"BaseClose",props:{isButtonTag:{type:Boolean,default:!0},clsPrefix:{type:String,required:!0},disabled:{type:Boolean,default:void 0},focusable:{type:Boolean,default:!0},round:Boolean,onClick:Function,absolute:Boolean},setup(l){return io("-base-close",zo,K(l,"clsPrefix")),()=>{const{clsPrefix:n,disabled:o,absolute:f,round:a,isButtonTag:s}=l;return b(s?"button":"div",{type:s?"button":void 0,tabindex:o||!l.focusable?-1:0,"aria-disabled":o,"aria-label":"close",role:s?void 0:"button",disabled:o,class:[`${n}-base-close`,f&&`${n}-base-close--absolute`,o&&`${n}-base-close--disabled`,a&&`${n}-base-close--round`],onMousedown:t=>{l.focusable||t.preventDefault()},onClick:l.onClick},b(ho,{clsPrefix:n},{default:()=>b(yo,null)}))}}}),Io=l=>{const{textColor2:n,primaryColorHover:o,primaryColorPressed:f,primaryColor:a,infoColor:s,successColor:i,warningColor:t,errorColor:d,baseColor:x,borderColor:y,opacityDisabled:v,tagColor:k,closeIconColor:r,closeIconColorHover:c,closeIconColorPressed:m,borderRadiusSmall:C,fontSizeMini:p,fontSizeTiny:B,fontSizeSmall:S,fontSizeMedium:$,heightMini:H,heightTiny:w,heightSmall:M,heightMedium:R,closeColorHover:T,closeColorPressed:L,buttonColor2Hover:_,buttonColor2Pressed:E,fontWeightStrong:j}=l;return Object.assign(Object.assign({},go),{closeBorderRadius:C,heightTiny:H,heightSmall:w,heightMedium:M,heightLarge:R,borderRadius:C,opacityDisabled:v,fontSizeTiny:p,fontSizeSmall:B,fontSizeMedium:S,fontSizeLarge:$,fontWeightStrong:j,textColorCheckable:n,textColorHoverCheckable:n,textColorPressedCheckable:n,textColorChecked:x,colorCheckable:"#0000",colorHoverCheckable:_,colorPressedCheckable:E,colorChecked:a,colorCheckedHover:o,colorCheckedPressed:f,border:`1px solid ${y}`,textColor:n,color:k,colorBordered:"rgb(250, 250, 252)",closeIconColor:r,closeIconColorHover:c,closeIconColorPressed:m,closeColorHover:T,closeColorPressed:L,borderPrimary:`1px solid ${e(a,{alpha:.3})}`,textColorPrimary:a,colorPrimary:e(a,{alpha:.12}),colorBorderedPrimary:e(a,{alpha:.1}),closeIconColorPrimary:a,closeIconColorHoverPrimary:a,closeIconColorPressedPrimary:a,closeColorHoverPrimary:e(a,{alpha:.12}),closeColorPressedPrimary:e(a,{alpha:.18}),borderInfo:`1px solid ${e(s,{alpha:.3})}`,textColorInfo:s,colorInfo:e(s,{alpha:.12}),colorBorderedInfo:e(s,{alpha:.1}),closeIconColorInfo:s,closeIconColorHoverInfo:s,closeIconColorPressedInfo:s,closeColorHoverInfo:e(s,{alpha:.12}),closeColorPressedInfo:e(s,{alpha:.18}),borderSuccess:`1px solid ${e(i,{alpha:.3})}`,textColorSuccess:i,colorSuccess:e(i,{alpha:.12}),colorBorderedSuccess:e(i,{alpha:.1}),closeIconColorSuccess:i,closeIconColorHoverSuccess:i,closeIconColorPressedSuccess:i,closeColorHoverSuccess:e(i,{alpha:.12}),closeColorPressedSuccess:e(i,{alpha:.18}),borderWarning:`1px solid ${e(t,{alpha:.35})}`,textColorWarning:t,colorWarning:e(t,{alpha:.15}),colorBorderedWarning:e(t,{alpha:.12}),closeIconColorWarning:t,closeIconColorHoverWarning:t,closeIconColorPressedWarning:t,closeColorHoverWarning:e(t,{alpha:.12}),closeColorPressedWarning:e(t,{alpha:.18}),borderError:`1px solid ${e(d,{alpha:.23})}`,textColorError:d,colorError:e(d,{alpha:.1}),colorBorderedError:e(d,{alpha:.08}),closeIconColorError:d,closeIconColorHoverError:d,closeIconColorPressedError:d,closeColorHoverError:e(d,{alpha:.12}),closeColorPressedError:e(d,{alpha:.18})})},Bo={name:"Tag",common:bo,self:Io},So=Bo,$o={color:Object,type:{type:String,default:"default"},round:Boolean,size:{type:String,default:"medium"},closable:Boolean,disabled:{type:Boolean,default:void 0}},Ho=U("tag",`
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
`,[g("strong",`
 font-weight: var(--n-font-weight-strong);
 `),z("border",`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
 border: var(--n-border);
 transition: border-color .3s var(--n-bezier);
 `),z("icon",`
 display: flex;
 margin: 0 4px 0 0;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 font-size: var(--n-avatar-size-override);
 `),z("avatar",`
 display: flex;
 margin: 0 6px 0 0;
 `),z("close",`
 margin: var(--n-close-margin);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),g("round",`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[z("icon",`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),z("avatar",`
 margin: 0 6px 0 calc((var(--n-height) - 8px) / -2);
 `),g("closable",`
 padding: 0 calc(var(--n-height) / 4) 0 calc(var(--n-height) / 3);
 `)]),g("icon, avatar",[g("round",`
 padding: 0 calc(var(--n-height) / 3) 0 calc(var(--n-height) / 2);
 `)]),g("disabled",`
 cursor: not-allowed !important;
 opacity: var(--n-opacity-disabled);
 `),g("checkable",`
 cursor: pointer;
 box-shadow: none;
 color: var(--n-text-color-checkable);
 background-color: var(--n-color-checkable);
 `,[P("disabled",[u("&:hover","background-color: var(--n-color-hover-checkable);",[P("checked","color: var(--n-text-color-hover-checkable);")]),u("&:active","background-color: var(--n-color-pressed-checkable);",[P("checked","color: var(--n-text-color-pressed-checkable);")])]),g("checked",`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[P("disabled",[u("&:hover","background-color: var(--n-color-checked-hover);"),u("&:active","background-color: var(--n-color-checked-pressed);")])])])]),wo=Object.assign(Object.assign(Object.assign({},q.props),$o),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),Mo=mo("n-tag"),To=V({name:"Tag",props:wo,setup(l){const n=uo(null),{mergedBorderedRef:o,mergedClsPrefixRef:f,inlineThemeDisabled:a,mergedRtlRef:s}=vo(l),i=q("Tag","-tag",Ho,So,l,f);Co(Mo,{roundRef:K(l,"round")});function t(r){if(!l.disabled&&l.checkable){const{checked:c,onCheckedChange:m,onUpdateChecked:C,"onUpdate:checked":p}=l;C&&C(!c),p&&p(!c),m&&m(!c)}}function d(r){if(l.triggerClickOnClose||r.stopPropagation(),!l.disabled){const{onClose:c}=l;c&&xo(c,r)}}const x={setTextContent(r){const{value:c}=n;c&&(c.textContent=r)}},y=fo("Tag",s,f),v=F(()=>{const{type:r,size:c,color:{color:m,textColor:C}={}}=l,{common:{cubicBezierEaseInOut:p},self:{padding:B,closeMargin:S,borderRadius:$,opacityDisabled:H,textColorCheckable:w,textColorHoverCheckable:M,textColorPressedCheckable:R,textColorChecked:T,colorCheckable:L,colorHoverCheckable:_,colorPressedCheckable:E,colorChecked:j,colorCheckedHover:A,colorCheckedPressed:G,closeBorderRadius:X,fontWeightStrong:Y,[h("colorBordered",r)]:Z,[h("closeSize",c)]:J,[h("closeIconSize",c)]:Q,[h("fontSize",c)]:oo,[h("height",c)]:W,[h("color",r)]:eo,[h("textColor",r)]:ro,[h("border",r)]:lo,[h("closeIconColor",r)]:O,[h("closeIconColorHover",r)]:ao,[h("closeIconColorPressed",r)]:co,[h("closeColorHover",r)]:no,[h("closeColorPressed",r)]:so}}=i.value,I=po(S);return{"--n-font-weight-strong":Y,"--n-avatar-size-override":`calc(${W} - 8px)`,"--n-bezier":p,"--n-border-radius":$,"--n-border":lo,"--n-close-icon-size":Q,"--n-close-color-pressed":so,"--n-close-color-hover":no,"--n-close-border-radius":X,"--n-close-icon-color":O,"--n-close-icon-color-hover":ao,"--n-close-icon-color-pressed":co,"--n-close-icon-color-disabled":O,"--n-close-margin-top":I.top,"--n-close-margin-right":I.right,"--n-close-margin-bottom":I.bottom,"--n-close-margin-left":I.left,"--n-close-size":J,"--n-color":m||(o.value?Z:eo),"--n-color-checkable":L,"--n-color-checked":j,"--n-color-checked-hover":A,"--n-color-checked-pressed":G,"--n-color-hover-checkable":_,"--n-color-pressed-checkable":E,"--n-font-size":oo,"--n-height":W,"--n-opacity-disabled":H,"--n-padding":B,"--n-text-color":C||ro,"--n-text-color-checkable":w,"--n-text-color-checked":T,"--n-text-color-hover-checkable":M,"--n-text-color-pressed-checkable":R}}),k=a?ko("tag",F(()=>{let r="";const{type:c,size:m,color:{color:C,textColor:p}={}}=l;return r+=c[0],r+=m[0],C&&(r+=`a${D(C)}`),p&&(r+=`b${D(p)}`),o.value&&(r+="c"),r}),v,l):void 0;return Object.assign(Object.assign({},x),{rtlEnabled:y,mergedClsPrefix:f,contentRef:n,mergedBordered:o,handleClick:t,handleCloseClick:d,cssVars:a?void 0:v,themeClass:k==null?void 0:k.themeClass,onRender:k==null?void 0:k.onRender})},render(){var l,n;const{mergedClsPrefix:o,rtlEnabled:f,closable:a,color:{borderColor:s}={},round:i,onRender:t,$slots:d}=this;t==null||t();const x=N(d.avatar,v=>v&&b("div",{class:`${o}-tag__avatar`},v)),y=N(d.icon,v=>v&&b("div",{class:`${o}-tag__icon`},v));return b("div",{class:[`${o}-tag`,this.themeClass,{[`${o}-tag--rtl`]:f,[`${o}-tag--strong`]:this.strong,[`${o}-tag--disabled`]:this.disabled,[`${o}-tag--checkable`]:this.checkable,[`${o}-tag--checked`]:this.checkable&&this.checked,[`${o}-tag--round`]:i,[`${o}-tag--avatar`]:x,[`${o}-tag--icon`]:y,[`${o}-tag--closable`]:a}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},y||x,b("span",{class:`${o}-tag__content`,ref:"contentRef"},(n=(l=this.$slots).default)===null||n===void 0?void 0:n.call(l)),!this.checkable&&a?b(Po,{clsPrefix:o,class:`${o}-tag__close`,disabled:this.disabled,onClick:this.handleCloseClick,focusable:this.internalCloseFocusable,round:i,isButtonTag:this.internalCloseIsButtonTag,absolute:!0}):null,!this.checkable&&this.mergedBordered?b("div",{class:`${o}-tag__border`,style:{borderColor:s}}):null)}});export{To as _};
