!function(e,t){e&&!e.getElementById("livereloadscript")&&((t=e.createElement("script")).async=1,t.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",t.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(t))}(self.document),function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){"use strict";var e=function(){function e(e){var t=this;this._insertTag=function(e){var r;r=0===t.tags.length?t.insertionPoint?t.insertionPoint.nextSibling:t.prepend?t.container.firstChild:t.before:t.tags[t.tags.length-1].nextSibling,t.container.insertBefore(e,r),t.tags.push(e)},this.isSpeedy=void 0===e.speedy||e.speedy,this.tags=[],this.ctr=0,this.nonce=e.nonce,this.key=e.key,this.container=e.container,this.prepend=e.prepend,this.insertionPoint=e.insertionPoint,this.before=null}var t=e.prototype;return t.hydrate=function(e){e.forEach(this._insertTag)},t.insert=function(e){this.ctr%(this.isSpeedy?65e3:1)==0&&this._insertTag(function(e){var t=document.createElement("style");return t.setAttribute("data-emotion",e.key),void 0!==e.nonce&&t.setAttribute("nonce",e.nonce),t.appendChild(document.createTextNode("")),t.setAttribute("data-s",""),t}(this));var t=this.tags[this.tags.length-1];if(this.isSpeedy){var r=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]}(t);try{r.insertRule(e,r.cssRules.length)}catch(e){}}else t.appendChild(document.createTextNode(e));this.ctr++},t.flush=function(){this.tags.forEach(function(e){var t;return null==(t=e.parentNode)?void 0:t.removeChild(e)}),this.tags=[],this.ctr=0},e}(),t=("undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self,{exports:{}});function r(e){var t=Object.create(null);return function(r){return void 0===t[r]&&(t[r]=e(r)),t[r]}}(function(e){var t="-ms-",r="-moz-",n="-webkit-",o="comm",i="rule",a="decl",s="@page",c="@media",l="@import",d="@charset",p="@viewport",u="@supports",f="@document",h="@namespace",m="@keyframes",x="@font-face",g="@counter-style",b="@font-feature-values",v="@layer",y=Math.abs,w=String.fromCharCode,_=Object.assign;function $(e,t){return 45^C(e,0)?(((t<<2^C(e,0))<<2^C(e,1))<<2^C(e,2))<<2^C(e,3):0}function k(e){return e.trim()}function A(e,t){return(e=t.exec(e))?e[0]:e}function M(e,t,r){return e.replace(t,r)}function E(e,t){return e.indexOf(t)}function C(e,t){return 0|e.charCodeAt(t)}function F(e,t,r){return e.slice(t,r)}function S(e){return e.length}function z(e){return e.length}function T(e,t){return t.push(e),e}function B(e,t){return e.map(t).join("")}function I(t,r,n,o,i,a,s){return{value:t,root:r,parent:n,type:o,props:i,children:a,line:e.line,column:e.column,length:s,return:""}}function W(e,t){return _(I("",null,null,"",null,null,0),e,{length:-e.length},t)}function j(){return e.character}function N(){return e.character=e.position>0?C(e.characters,--e.position):0,e.column--,10===e.character&&(e.column=1,e.line--),e.character}function O(){return e.character=e.position<e.length?C(e.characters,e.position++):0,e.column++,10===e.character&&(e.column=1,e.line++),e.character}function D(){return C(e.characters,e.position)}function q(){return e.position}function H(t,r){return F(e.characters,t,r)}function R(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function K(t){return e.line=e.column=1,e.length=S(e.characters=t),e.position=0,[]}function P(t){return e.characters="",t}function L(t){return k(H(e.position-1,V(91===t?t+2:40===t?t+1:t)))}function Z(e){return P(G(K(e)))}function X(t){for(;(e.character=D())&&e.character<33;)O();return R(t)>2||R(e.character)>3?"":" "}function G(t){for(;O();)switch(R(e.character)){case 0:T(J(e.position-1),t);break;case 2:T(L(e.character),t);break;default:T(w(e.character),t)}return t}function Y(t,r){for(;--r&&O()&&!(e.character<48||e.character>102||e.character>57&&e.character<65||e.character>70&&e.character<97););return H(t,q()+(r<6&&32==D()&&32==O()))}function V(t){for(;O();)switch(e.character){case t:return e.position;case 34:case 39:34!==t&&39!==t&&V(e.character);break;case 40:41===t&&V(t);break;case 92:O()}return e.position}function U(t,r){for(;O()&&t+e.character!==57&&(t+e.character!==84||47!==D()););return"/*"+H(r,e.position-1)+"*"+w(47===t?t:O())}function J(t){for(;!R(D());)O();return H(t,e.position)}function Q(e){return P(ee("",null,null,null,[""],e=K(e),0,[0],e))}function ee(e,t,r,n,o,i,a,s,c){for(var l=0,d=0,p=a,u=0,f=0,h=0,m=1,x=1,g=1,b=0,v="",y=o,_=i,$=n,k=v;x;)switch(h=b,b=O()){case 40:if(108!=h&&58==C(k,p-1)){-1!=E(k+=M(L(b),"&","&\f"),"&\f")&&(g=-1);break}case 34:case 39:case 91:k+=L(b);break;case 9:case 10:case 13:case 32:k+=X(h);break;case 92:k+=Y(q()-1,7);continue;case 47:switch(D()){case 42:case 47:T(re(U(O(),q()),t,r),c);break;default:k+="/"}break;case 123*m:s[l++]=S(k)*g;case 125*m:case 59:case 0:switch(b){case 0:case 125:x=0;case 59+d:-1==g&&(k=M(k,/\f/g,"")),f>0&&S(k)-p&&T(f>32?ne(k+";",n,r,p-1):ne(M(k," ","")+";",n,r,p-2),c);break;case 59:k+=";";default:if(T($=te(k,t,r,l,d,o,s,v,y=[],_=[],p),i),123===b)if(0===d)ee(k,t,$,$,y,i,p,s,_);else switch(99===u&&110===C(k,3)?100:u){case 100:case 108:case 109:case 115:ee(e,$,$,n&&T(te(e,$,$,0,0,o,s,v,o,y=[],p),_),o,_,p,s,n?y:_);break;default:ee(k,$,$,$,[""],_,0,s,_)}}l=d=f=0,m=g=1,v=k="",p=a;break;case 58:p=1+S(k),f=h;default:if(m<1)if(123==b)--m;else if(125==b&&0==m++&&125==N())continue;switch(k+=w(b),b*m){case 38:g=d>0?1:(k+="\f",-1);break;case 44:s[l++]=(S(k)-1)*g,g=1;break;case 64:45===D()&&(k+=L(O())),u=D(),d=p=S(v=k+=J(q())),b++;break;case 45:45===h&&2==S(k)&&(m=0)}}return i}function te(e,t,r,n,o,a,s,c,l,d,p){for(var u=o-1,f=0===o?a:[""],h=z(f),m=0,x=0,g=0;m<n;++m)for(var b=0,v=F(e,u+1,u=y(x=s[m])),w=e;b<h;++b)(w=k(x>0?f[b]+" "+v:M(v,/&\f/g,f[b])))&&(l[g++]=w);return I(e,t,r,0===o?i:c,l,d,p)}function re(e,t,r){return I(e,t,r,o,w(j()),F(e,2,-2),0)}function ne(e,t,r,n){return I(e,t,r,a,F(e,0,n),F(e,n+1,-1),n)}function oe(e,o,i){switch($(e,o)){case 5103:return n+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return n+e+e;case 4789:return r+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return n+e+r+e+t+e+e;case 5936:switch(C(e,o+11)){case 114:return n+e+t+M(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return n+e+t+M(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return n+e+t+M(e,/[svh]\w+-[tblr]{2}/,"lr")+e}case 6828:case 4268:case 2903:return n+e+t+e+e;case 6165:return n+e+t+"flex-"+e+e;case 5187:return n+e+M(e,/(\w+).+(:[^]+)/,n+"box-$1$2"+t+"flex-$1$2")+e;case 5443:return n+e+t+"flex-item-"+M(e,/flex-|-self/g,"")+(A(e,/flex-|baseline/)?"":t+"grid-row-"+M(e,/flex-|-self/g,""))+e;case 4675:return n+e+t+"flex-line-pack"+M(e,/align-content|flex-|-self/g,"")+e;case 5548:return n+e+t+M(e,"shrink","negative")+e;case 5292:return n+e+t+M(e,"basis","preferred-size")+e;case 6060:return n+"box-"+M(e,"-grow","")+n+e+t+M(e,"grow","positive")+e;case 4554:return n+M(e,/([^-])(transform)/g,"$1"+n+"$2")+e;case 6187:return M(M(M(e,/(zoom-|grab)/,n+"$1"),/(image-set)/,n+"$1"),e,"")+e;case 5495:case 3959:return M(e,/(image-set\([^]*)/,n+"$1$`$1");case 4968:return M(M(e,/(.+:)(flex-)?(.*)/,n+"box-pack:$3"+t+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+n+e+e;case 4200:if(!A(e,/flex-|baseline/))return t+"grid-column-align"+F(e,o)+e;break;case 2592:case 3360:return t+M(e,"template-","")+e;case 4384:case 3616:return i&&i.some(function(e,t){return o=t,A(e.props,/grid-\w+-end/)})?~E(e+(i=i[o].value),"span")?e:t+M(e,"-start","")+e+t+"grid-row-span:"+(~E(i,"span")?A(i,/\d+/):+A(i,/\d+/)-+A(e,/\d+/))+";":t+M(e,"-start","")+e;case 4896:case 4128:return i&&i.some(function(e){return A(e.props,/grid-\w+-start/)})?e:t+M(M(e,"-end","-span"),"span ","")+e;case 4095:case 3583:case 4068:case 2532:return M(e,/(.+)-inline(.+)/,n+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(S(e)-1-o>6)switch(C(e,o+1)){case 109:if(45!==C(e,o+4))break;case 102:return M(e,/(.+:)(.+)-([^]+)/,"$1"+n+"$2-$3$1"+r+(108==C(e,o+3)?"$3":"$2-$3"))+e;case 115:return~E(e,"stretch")?oe(M(e,"stretch","fill-available"),o,i)+e:e}break;case 5152:case 5920:return M(e,/(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,function(r,n,o,i,a,s,c){return t+n+":"+o+c+(i?t+n+"-span:"+(a?s:+s-+o)+c:"")+e});case 4949:if(121===C(e,o+6))return M(e,":",":"+n)+e;break;case 6444:switch(C(e,45===C(e,14)?18:11)){case 120:return M(e,/(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,"$1"+n+(45===C(e,14)?"inline-":"")+"box$3$1"+n+"$2$3$1"+t+"$2box$3")+e;case 100:return M(e,":",":"+t)+e}break;case 5719:case 2647:case 2135:case 3927:case 2391:return M(e,"scroll-","scroll-snap-")+e}return e}function ie(e,t){for(var r="",n=z(e),o=0;o<n;o++)r+=t(e[o],o,e,t)||"";return r}function ae(e,t,r,n){switch(e.type){case v:if(e.children.length)break;case l:case a:return e.return=e.return||e.value;case o:return"";case m:return e.return=e.value+"{"+ie(e.children,n)+"}";case i:e.value=e.props.join(",")}return S(r=ie(e.children,n))?e.return=e.value+"{"+r+"}":""}function se(e){var t=z(e);return function(r,n,o,i){for(var a="",s=0;s<t;s++)a+=e[s](r,n,o,i)||"";return a}}function ce(e){return function(t){t.root||(t=t.return)&&e(t)}}function le(e,o,s,c){if(e.length>-1&&!e.return)switch(e.type){case a:return void(e.return=oe(e.value,e.length,s));case m:return ie([W(e,{value:M(e.value,"@","@"+n)})],c);case i:if(e.length)return B(e.props,function(o){switch(A(o,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return ie([W(e,{props:[M(o,/:(read-\w+)/,":"+r+"$1")]})],c);case"::placeholder":return ie([W(e,{props:[M(o,/:(plac\w+)/,":"+n+"input-$1")]}),W(e,{props:[M(o,/:(plac\w+)/,":"+r+"$1")]}),W(e,{props:[M(o,/:(plac\w+)/,t+"input-$1")]})],c)}return""})}}function de(e){e.type===i&&(e.props=e.props.map(function(t){return B(Z(t),function(t,r,n){switch(C(t,0)){case 12:return F(t,1,S(t));case 0:case 40:case 43:case 62:case 126:return t;case 58:"global"===n[++r]&&(n[r]="",n[++r]="\f"+F(n[r],r=1,-1));case 32:return 1===r?"":t;default:switch(r){case 0:return e=t,z(n)>1?"":t;case r=z(n)-1:case 2:return 2===r?t+e+e:t+e;default:return t}}})}))}e.line=1,e.column=1,e.length=0,e.position=0,e.character=0,e.characters="",e.CHARSET=d,e.COMMENT=o,e.COUNTER_STYLE=g,e.DECLARATION=a,e.DOCUMENT=f,e.FONT_FACE=x,e.FONT_FEATURE_VALUES=b,e.IMPORT=l,e.KEYFRAMES=m,e.LAYER=v,e.MEDIA=c,e.MOZ=r,e.MS=t,e.NAMESPACE=h,e.PAGE=s,e.RULESET=i,e.SUPPORTS=u,e.VIEWPORT=p,e.WEBKIT=n,e.abs=y,e.alloc=K,e.append=T,e.assign=_,e.caret=q,e.char=j,e.charat=C,e.combine=B,e.comment=re,e.commenter=U,e.compile=Q,e.copy=W,e.dealloc=P,e.declaration=ne,e.delimit=L,e.delimiter=V,e.escaping=Y,e.from=w,e.hash=$,e.identifier=J,e.indexof=E,e.match=A,e.middleware=se,e.namespace=de,e.next=O,e.node=I,e.parse=ee,e.peek=D,e.prefix=oe,e.prefixer=le,e.prev=N,e.replace=M,e.ruleset=te,e.rulesheet=ce,e.serialize=ie,e.sizeof=z,e.slice=H,e.stringify=ae,e.strlen=S,e.substr=F,e.token=R,e.tokenize=Z,e.tokenizer=G,e.trim=k,e.whitespace=X,Object.defineProperty(e,"__esModule",{value:!0})})(t.exports);var n=function(e,r,n){for(var o=0,i=0;o=i,i=t.exports.peek(),38===o&&12===i&&(r[n]=1),!t.exports.token(i);)t.exports.next();return t.exports.slice(e,t.exports.position)},o=function(e,r){return t.exports.dealloc(function(e,r){var o=-1,i=44;do{switch(t.exports.token(i)){case 0:38===i&&12===t.exports.peek()&&(r[o]=1),e[o]+=n(t.exports.position-1,r,o);break;case 2:e[o]+=t.exports.delimit(i);break;case 4:if(44===i){e[++o]=58===t.exports.peek()?"&\f":"",r[o]=e[o].length;break}default:e[o]+=t.exports.from(i)}}while(i=t.exports.next());return e}(t.exports.alloc(e),r))},i=new WeakMap,a=function(e){if("rule"===e.type&&e.parent&&!(e.length<1)){for(var t=e.value,r=e.parent,n=e.column===r.column&&e.line===r.line;"rule"!==r.type;)if(!(r=r.parent))return;if((1!==e.props.length||58===t.charCodeAt(0)||i.get(r))&&!n){i.set(e,!0);for(var a=[],s=o(t,a),c=r.props,l=0,d=0;l<s.length;l++)for(var p=0;p<c.length;p++,d++)e.props[d]=a[l]?s[l].replace(/&\f/g,c[p]):c[p]+" "+s[l]}}},s=function(e){if("decl"===e.type){var t=e.value;108===t.charCodeAt(0)&&98===t.charCodeAt(2)&&(e.return="",e.value="")}};function c(e,r){switch(t.exports.hash(e,r)){case 5103:return t.exports.WEBKIT+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return t.exports.WEBKIT+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return t.exports.WEBKIT+e+t.exports.MOZ+e+t.exports.MS+e+e;case 6828:case 4268:return t.exports.WEBKIT+e+t.exports.MS+e+e;case 6165:return t.exports.WEBKIT+e+t.exports.MS+"flex-"+e+e;case 5187:return t.exports.WEBKIT+e+t.exports.replace(e,/(\w+).+(:[^]+)/,t.exports.WEBKIT+"box-$1$2"+t.exports.MS+"flex-$1$2")+e;case 5443:return t.exports.WEBKIT+e+t.exports.MS+"flex-item-"+t.exports.replace(e,/flex-|-self/,"")+e;case 4675:return t.exports.WEBKIT+e+t.exports.MS+"flex-line-pack"+t.exports.replace(e,/align-content|flex-|-self/,"")+e;case 5548:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,"shrink","negative")+e;case 5292:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,"basis","preferred-size")+e;case 6060:return t.exports.WEBKIT+"box-"+t.exports.replace(e,"-grow","")+t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,"grow","positive")+e;case 4554:return t.exports.WEBKIT+t.exports.replace(e,/([^-])(transform)/g,"$1"+t.exports.WEBKIT+"$2")+e;case 6187:return t.exports.replace(t.exports.replace(t.exports.replace(e,/(zoom-|grab)/,t.exports.WEBKIT+"$1"),/(image-set)/,t.exports.WEBKIT+"$1"),e,"")+e;case 5495:case 3959:return t.exports.replace(e,/(image-set\([^]*)/,t.exports.WEBKIT+"$1$`$1");case 4968:return t.exports.replace(t.exports.replace(e,/(.+:)(flex-)?(.*)/,t.exports.WEBKIT+"box-pack:$3"+t.exports.MS+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+t.exports.WEBKIT+e+e;case 4095:case 3583:case 4068:case 2532:return t.exports.replace(e,/(.+)-inline(.+)/,t.exports.WEBKIT+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(t.exports.strlen(e)-1-r>6)switch(t.exports.charat(e,r+1)){case 109:if(45!==t.exports.charat(e,r+4))break;case 102:return t.exports.replace(e,/(.+:)(.+)-([^]+)/,"$1"+t.exports.WEBKIT+"$2-$3$1"+t.exports.MOZ+(108==t.exports.charat(e,r+3)?"$3":"$2-$3"))+e;case 115:return~t.exports.indexof(e,"stretch")?c(t.exports.replace(e,"stretch","fill-available"),r)+e:e}break;case 4949:if(115!==t.exports.charat(e,r+1))break;case 6444:switch(t.exports.charat(e,t.exports.strlen(e)-3-(~t.exports.indexof(e,"!important")&&10))){case 107:return t.exports.replace(e,":",":"+t.exports.WEBKIT)+e;case 101:return t.exports.replace(e,/(.+:)([^;!]+)(;|!.+)?/,"$1"+t.exports.WEBKIT+(45===t.exports.charat(e,14)?"inline-":"")+"box$3$1"+t.exports.WEBKIT+"$2$3$1"+t.exports.MS+"$2box$3")+e}break;case 5936:switch(t.exports.charat(e,r+11)){case 114:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,/[svh]\w+-[tblr]{2}/,"lr")+e}return t.exports.WEBKIT+e+t.exports.MS+e+e}return e}var l=[function(e,r,n,o){if(e.length>-1&&!e.return)switch(e.type){case t.exports.DECLARATION:e.return=c(e.value,e.length);break;case t.exports.KEYFRAMES:return t.exports.serialize([t.exports.copy(e,{value:t.exports.replace(e.value,"@","@"+t.exports.WEBKIT)})],o);case t.exports.RULESET:if(e.length)return t.exports.combine(e.props,function(r){switch(t.exports.match(r,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return t.exports.serialize([t.exports.copy(e,{props:[t.exports.replace(r,/:(read-\w+)/,":"+t.exports.MOZ+"$1")]})],o);case"::placeholder":return t.exports.serialize([t.exports.copy(e,{props:[t.exports.replace(r,/:(plac\w+)/,":"+t.exports.WEBKIT+"input-$1")]}),t.exports.copy(e,{props:[t.exports.replace(r,/:(plac\w+)/,":"+t.exports.MOZ+"$1")]}),t.exports.copy(e,{props:[t.exports.replace(r,/:(plac\w+)/,t.exports.MS+"input-$1")]})],o)}return""})}}],d=function(r){var n=r.key;if("css"===n){var o=document.querySelectorAll("style[data-emotion]:not([data-s])");Array.prototype.forEach.call(o,function(e){-1!==e.getAttribute("data-emotion").indexOf(" ")&&(document.head.appendChild(e),e.setAttribute("data-s",""))})}var i,c,d=r.stylisPlugins||l,p={},u=[];i=r.container||document.head,Array.prototype.forEach.call(document.querySelectorAll('style[data-emotion^="'+n+' "]'),function(e){for(var t=e.getAttribute("data-emotion").split(" "),r=1;r<t.length;r++)p[t[r]]=!0;u.push(e)});var f,h=[a,s],m=[t.exports.stringify,t.exports.rulesheet(function(e){f.insert(e)})],x=t.exports.middleware(h.concat(d,m));c=function(e,r,n,o){f=n,function(e){t.exports.serialize(t.exports.compile(e),x)}(e?e+"{"+r.styles+"}":r.styles),o&&(g.inserted[r.name]=!0)};var g={key:n,sheet:new e({key:n,container:i,nonce:r.nonce,speedy:r.speedy,prepend:r.prepend,insertionPoint:r.insertionPoint}),nonce:r.nonce,inserted:p,registered:{},insert:c};return g.sheet.hydrate(u),g};var p={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,scale:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},u=/[A-Z]|^ms/g,f=/_EMO_([^_]+?)_([^]*?)_EMO_/g,h=function(e){return 45===e.charCodeAt(1)},m=function(e){return null!=e&&"boolean"!=typeof e},x=r(function(e){return h(e)?e:e.replace(u,"-$&").toLowerCase()}),g=function(e,t){switch(e){case"animation":case"animationName":if("string"==typeof t)return t.replace(f,function(e,t,r){return v={name:t,styles:r,next:v},t})}return 1===p[e]||h(e)||"number"!=typeof t||0===t?t:t+"px"};function b(e,t,r){if(null==r)return"";var n=r;if(void 0!==n.__emotion_styles)return n;switch(typeof r){case"boolean":return"";case"object":var o=r;if(1===o.anim)return v={name:o.name,styles:o.styles,next:v},o.name;var i=r;if(void 0!==i.styles){var a=i.next;if(void 0!==a)for(;void 0!==a;)v={name:a.name,styles:a.styles,next:v},a=a.next;return i.styles+";"}return function(e,t,r){var n="";if(Array.isArray(r))for(var o=0;o<r.length;o++)n+=b(e,t,r[o])+";";else for(var i in r){var a=r[i];if("object"!=typeof a){var s=a;null!=t&&void 0!==t[s]?n+=i+"{"+t[s]+"}":m(s)&&(n+=x(i)+":"+g(i,s)+";")}else if(!Array.isArray(a)||"string"!=typeof a[0]||null!=t&&void 0!==t[a[0]]){var c=b(e,t,a);switch(i){case"animation":case"animationName":n+=x(i)+":"+c+";";break;default:n+=i+"{"+c+"}"}}else for(var l=0;l<a.length;l++)m(a[l])&&(n+=x(i)+":"+g(i,a[l])+";")}return n}(e,t,r);case"function":if(void 0!==e){var s=v,c=r(e);return v=s,b(e,t,c)}}var l=r;if(null==t)return l;var d=t[l];return void 0!==d?d:l}var v,y=/label:\s*([^\s;{]+)\s*(;|$)/g;function w(e,t,r){if(1===e.length&&"object"==typeof e[0]&&null!==e[0]&&void 0!==e[0].styles)return e[0];var n=!0,o="";v=void 0;var i=e[0];null==i||void 0===i.raw?(n=!1,o+=b(r,t,i)):o+=i[0];for(var a=1;a<e.length;a++){if(o+=b(r,t,e[a]),n)o+=i[a]}y.lastIndex=0;for(var s,c="";null!==(s=y.exec(o));)c+="-"+s[1];var l=function(e){for(var t,r=0,n=0,o=e.length;o>=4;++n,o-=4)t=1540483477*(65535&(t=255&e.charCodeAt(n)|(255&e.charCodeAt(++n))<<8|(255&e.charCodeAt(++n))<<16|(255&e.charCodeAt(++n))<<24))+(59797*(t>>>16)<<16),r=1540483477*(65535&(t^=t>>>24))+(59797*(t>>>16)<<16)^1540483477*(65535&r)+(59797*(r>>>16)<<16);switch(o){case 3:r^=(255&e.charCodeAt(n+2))<<16;case 2:r^=(255&e.charCodeAt(n+1))<<8;case 1:r=1540483477*(65535&(r^=255&e.charCodeAt(n)))+(59797*(r>>>16)<<16)}return(((r=1540483477*(65535&(r^=r>>>13))+(59797*(r>>>16)<<16))^r>>>15)>>>0).toString(36)}(o)+c;return{name:l,styles:o,next:v}}function _(e,t,r){var n="";return r.split(" ").forEach(function(r){void 0!==e[r]?t.push(e[r]+";"):r&&(n+=r+" ")}),n}function $(e,t){if(void 0===e.inserted[t.name])return e.insert("",t,e.sheet,!0)}function k(e,t,r){var n=[],o=_(e,n,r);return n.length<2?r:o+t(n)}var A=function e(t){for(var r="",n=0;n<t.length;n++){var o=t[n];if(null!=o){var i=void 0;switch(typeof o){case"boolean":break;case"object":if(Array.isArray(o))i=e(o);else for(var a in i="",o)o[a]&&a&&(i&&(i+=" "),i+=a);break;default:i=o}i&&(r&&(r+=" "),r+=i)}}return r},M=function(e){var t=d(e);t.sheet.speedy=function(e){this.isSpeedy=e},t.compat=!0;var r=function(){for(var e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];var o=w(r,t.registered,void 0);return function(e,t,r){!function(e,t,r){var n=e.key+"-"+t.name;!1===r&&void 0===e.registered[n]&&(e.registered[n]=t.styles)}(e,t,r);var n=e.key+"-"+t.name;if(void 0===e.inserted[t.name]){var o=t;do{e.insert(t===o?"."+n:"",o,e.sheet,!0),o=o.next}while(void 0!==o)}}(t,o,!1),t.key+"-"+o.name};return{css:r,cx:function(){for(var e=arguments.length,n=new Array(e),o=0;o<e;o++)n[o]=arguments[o];return k(t.registered,r,A(n))},injectGlobal:function(){for(var e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];var o=w(r,t.registered);$(t,o)},keyframes:function(){for(var e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];var o=w(r,t.registered),i="animation-"+o.name;return $(t,{name:o.name,styles:"@keyframes "+i+"{"+o.styles+"}"}),i},hydrate:function(e){e.forEach(function(e){t.inserted[e]=!0})},flush:function(){t.registered={},t.inserted={},t.sheet.flush()},sheet:t.sheet,cache:t,getRegisteredStyles:_.bind(null,t.registered),merge:k.bind(null,t.registered,r)}}({key:"css"}),E=M.injectGlobal,C=M.css;const F="#111111",S="#FAFAF8",z="#D62626",T="#1A3FAA",B="#F7C518",I="#F0EBE0",W=C`
  * {
    color: ${F};
  }
  .layout,
  &.layout {
    margin-bottom: 50px;
    &__headingContainer {
      align-items: stretch;
      border: 3px solid ${F};
      display: flex;
      margin-bottom: 40px;
      max-width: 640px;
    }
    &__headingAccent {
      background: ${T};
      border-right: 3px solid ${F};
      flex-shrink: 0;
      width: 20px;
    }
    &__headingContent {
      padding: 24px 28px;
    }
  }
  h1 {
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: -2px;
    line-height: 1;
    margin: 0 0 12px;
    text-transform: lowercase;
  }
  p {
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.6;
    margin: 0;
    max-width: 52ch;
    opacity: 0.8;
  }
`;C`
  align-items: center;
  background: ${I};
  border-top: 3px solid ${F};
  display: flex;
  gap: 16px;
  height: 80px;
  padding: 0 8px;
  width: 100%;
  button {
    background: ${S};
    border: 3px solid ${F};
    border-radius: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 900;
    outline: none;
    padding: 0.4em 0.7em;
    box-shadow: 4px 4px 0 ${F};
    transition:
      box-shadow 0.08s ease-out,
      transform 0.08s ease-out;
    &:hover,
    &:focus {
      box-shadow: 2px 2px 0 ${F};
      transform: translate(2px, 2px);
    }
    &:active {
      box-shadow: 0 0 0 ${F};
      transform: translate(4px, 4px);
    }
  }
`;const j=C`
  &.product {
    align-items: stretch;
    background: ${S};
    border: 3px solid ${F};
    box-shadow: 6px 6px 0 ${F};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    padding: 0;
    width: 100%;
    * {
      color: ${F};
      font-size: 20px;
      text-align: left;
    }
    > *:not(:last-child) {
      margin-bottom: 0;
    }
  }
  .product {
    &__imageContainer {
      background: linear-gradient(
        to bottom,
        var(--card-accent, ${F}) 0%,
        ${I} 100%
      );
      border-bottom: 3px solid ${F};
      height: 32vmin;
      width: 100%;
    }

    &__image {
      display: none;
    }

    &__headingContainer {
      flex: 1;
      min-height: 13vmin;
      padding: 16px 26px; /* φ-progression: 10→16→26 */
      border-bottom: 3px solid ${F};
    }

    &__metaRow {
      border-bottom: 3px solid ${F};
      display: flex;
      width: 100%;
    }

    &__likesContainer {
      flex: 1.618; /* golden majority — action zone */
    }

    &__cartContainer {
      width: 100%;
    }

    &__likeBtn {
      align-items: center;
      background: ${S};
      border: none;
      cursor: pointer;
      display: flex;
      font-size: 1em;
      font-weight: 700;
      height: 100%;
      justify-content: center;
      outline: none;
      padding: 16px 10px; /* 16:10 ≈ φ vertical:horizontal */
      width: 100%;
      transition:
        background 0.08s,
        color 0.08s;
      &:hover {
        background: ${z};
        color: ${S};
      }
    }

    &__thumbsUp {
      display: flex;
      cursor: pointer;
      margin-right: 10px;
      svg {
        fill: currentColor;
        max-width: 26px;
        min-width: 16px; /* 16:26 ≈ 1:φ */
      }
    }

    &__name {
      font-size: 1.375em; /* 0.85 × φ ≈ 1.375 */
      font-weight: 900;
      margin: 0 0 10px;
      letter-spacing: -0.5px;
    }

    &__description {
      font-size: 0.85em;
      font-weight: 400;
      margin: 0;
      opacity: 0.75;
    }

    &__priceContainer {
      flex: 1; /* minor portion: ~38.2% */
      background: ${F};
      border-right: 3px solid ${F};
      display: flex;
      align-items: center;
      padding: 10px 16px; /* 10:16 ≈ 1:φ */
    }
    &__price {
      color: ${B} !important;
      font-size: 1.25em;
      font-weight: 900;
      text-decoration: none;
      width: 100%;
      margin: 0;
    }

    &__cartContainer {
      button {
        background: ${T};
        border: none;
        border-top: 3px solid ${F};
        color: ${S} !important;
        cursor: pointer;
        font-size: 1em;
        font-weight: 700;
        padding: 14px 20px;
        text-align: left;
        transition: background 0.08s;
        width: 100%;
        &:hover {
          background: ${F};
        }
      }
    }

    /* Status modifiers */
    &--sold-out {
      .product__image {
        filter: grayscale(100%);
        opacity: 0.6;
      }
      .product__likeBtn--disabled {
        background: #ccc;
        color: #666 !important;
        cursor: not-allowed;
        font-style: italic;
        letter-spacing: 1px;
      }
      .product__cartContainer button {
        background: #999;
        cursor: not-allowed;
        &:hover {
          background: #999;
        }
      }
    }

    &--clearance {
      .product__price {
        text-decoration: line-through;
        opacity: 0.7;
      }
      .product__priceContainer::after {
        content: "SALE";
        color: ${B};
        font-size: 0.65em;
        font-weight: 900;
        letter-spacing: 2px;
        margin-left: 8px;
      }
    }

    &--featured {
      .product__headingContainer::before {
        content: "FEATURED";
        display: block;
        font-size: 0.65em;
        font-weight: 900;
        letter-spacing: 3px;
        color: ${z};
        margin-bottom: 6px;
      }
    }
  }
`,N=C`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-flow: row dense;
  gap: 30px;
  margin: 0 auto;
  width: 100%;

  /* Default: 2-col span (3 per row) — accent cycles through primary palette */
  & > .product {
    grid-column: span 2;
  }
  & > .product:nth-child(4n + 1) {
    --card-accent: ${T};
  }
  & > .product:nth-child(4n + 2) {
    --card-accent: ${z};
  }
  & > .product:nth-child(4n + 3) {
    --card-accent: ${B};
  }
  & > .product:nth-child(4n + 4) {
    --card-accent: ${F};
  }

  /* Featured: wide, red — high demand */
  & > .product--featured {
    grid-column: span 4;
    --card-accent: ${z};
  }

  /* Clearance: wide, yellow — urgency */
  & > .product--clearance {
    grid-column: span 4;
    --card-accent: ${B};
  }

  /* Sold-out: narrow, demoted */
  & > .product--sold-out {
    grid-column: span 2;
    --card-accent: ${F};
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    & > .product,
    & > .product--featured,
    & > .product--clearance,
    & > .product--sold-out {
      grid-column: span 1;
    }
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    & > .product,
    & > .product--featured,
    & > .product--clearance,
    & > .product--sold-out {
      grid-column: span 1;
    }
  }
`,O=C`
  &.cart {
    background: ${S};
    border-left: 3px solid ${F};
    height: 100vh;
    max-width: 100vw;
    min-width: 320px;
    position: fixed;
    right: 0;
    top: 0;
    transition: transform 0.2s ease-out;

    &--open {
      transform: translateX(0);
    }
    &--closed {
      transform: translateX(100%);
    }
  }

  .cart__contentContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* overflow: visible lets the button peek left outside the panel edge */
  .cart__controlContainer {
    background: ${F};
    overflow: visible;
    width: 100%;
  }

  .cart__control {
    background: ${F};
    border: none;
    cursor: pointer;
    display: block;
    outline: none;
    padding: 12px 15px;
    transition:
      transform 0.2s ease-out,
      background 0.1s ease-out;
    /* fit-content ensures -100% = the button's own width, not the container's */
    width: fit-content;
    svg {
      display: block;
      fill: ${S};
      width: 44px;
    }
    &:hover,
    &:focus {
      background: ${z};
    }
  }

  /* Slide the button left by its own width so it peeks out from the panel edge */
  .cart__control--closed {
    transform: translateX(-100%);
  }
  .cart__control--open {
    transform: translateX(0);
  }

  .cart__items {
    flex: 1;
    overflow-y: auto;
  }

  .cart__recentlyAdded {
    background: ${B};
    border-top: 3px solid ${F};
    font-size: 0.8em;
    font-weight: 700;
    margin: 0;
    padding: 8px 15px;
  }

  .cart__total {
    background: ${z};
    border-top: 3px solid ${F};
    color: ${S} !important;
    display: block;
    font-size: 18px;
    font-weight: 900;
    padding: 15px;
  }

  .cart__sum {
    color: ${S} !important;
    font-weight: 900;
  }
`,D=C`
  &.item,
  .item {
    border-bottom: 3px solid ${F};
    display: flex;
    font-size: 16px;
    list-style: none;
    margin: 0;
    padding: 14px 15px;
    &__details {
      flex-grow: 1;
    }
    &__imageContainer {
      border: 3px solid ${F};
      display: inline-block;
      flex-shrink: 0;
      height: 15vmin;
      margin-right: 12px;
      max-height: 100px;
      max-width: 100px;
      width: 15vmin;
    }

    &__image {
      display: block;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }

    &__nameContainer {
      font-weight: 700;
      width: 100%;
    }

    &__priceContainer {
      font-size: 0.9em;
      width: 100%;
    }

    &__quantityContainer {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      width: 100%;
    }

    &__quantity {
      background: transparent;
      border: none;
      color: ${F};
      font-size: 16px;
      font-weight: 900;
    }
    &__btn {
      background: ${F};
      border: none;
      color: ${S};
      cursor: pointer;
      font-weight: 700;
      min-width: 28px;
      padding: 4px 8px;
      transition: background 0.08s;
      &:hover {
        background: ${z};
      }
    }
  }
`,q=C`
  .form {
    display: flex;
    flex-direction: column;
    position: relative;
    &__disclaimer {
      font-size: 0.75em;
      font-weight: 400;
      margin: 2em 0 0;
      text-align: right;
    }
    &__label {
      align-items: center;
      display: flex;
      font-size: 1.1rem;
      font-weight: 900;
      flex-shrink: 0;
      letter-spacing: 1px;
      margin-top: 0;
      padding-right: 50px;
      position: relative;
      text-transform: uppercase;
      white-space: nowrap;
      &:after {
        background: ${F};
        content: "";
        flex-grow: 1;
        height: 3px;
        margin-left: 16px;
        position: relative;
        width: auto;
      }
    }
  }
  .formInput {
    align-items: center;
    color: ${F};
    display: flex;
    margin-bottom: 10px;
    padding: 10px 0;
    &__input {
      background: ${S};
      border: 3px solid ${F};
      flex-grow: 1;
      font-size: 1rem;
      font-weight: 500;
      margin-left: 10px;
      outline: none;
      padding: 8px 12px;
      &::placeholder {
        color: #888;
      }
      &:focus {
        outline: 3px solid ${T};
        outline-offset: 1px;
      }
    }
  }
  button[type="submit"] {
    align-self: flex-end;
    background: ${F};
    border: 3px solid ${F};
    box-shadow: 4px 4px 0 ${z};
    color: ${S};
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: 1px;
    margin-top: 25px;
    min-width: 33%;
    padding: 12px 24px;
    text-transform: uppercase;
    transition:
      box-shadow 0.08s ease-out,
      transform 0.08s ease-out;
    &:hover {
      box-shadow: 2px 2px 0 ${z};
      transform: translate(2px, 2px);
    }
    &:active {
      box-shadow: 0 0 0 ${z};
      transform: translate(4px, 4px);
    }
  }
`;function H(e,t,r,n){if("a"===r&&!n)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?n:"a"===r?n.call(e):n?n.value:t.get(e)}function R(e,t,r,n,o){if("m"===n)throw new TypeError("Private method is not writable");if("a"===n&&!o)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!o:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===n?o.call(e,r):o?o.value=r:t.set(e,r),r}C`
  &.modal,
  .modal {
    align-items: center;
    background: rgba(17, 17, 17, 0.8);
    display: flex;
    flex-direction: column;
    inset: 0;
    justify-content: center;
    position: fixed;
    transition: opacity 0.12s ease-out;
    &__open {
      &--true {
        opacity: 1;
      }
      &--false {
        opacity: 0;
        pointer-events: none;
      }
    }
    &__content {
      background: ${S};
      border: 3px solid ${F};
      border-top: 8px solid ${T};
      box-shadow: 8px 8px 0 ${F};
      max-width: 750px;
      padding: 40px;
      position: relative;
      width: 50vw;
    }
    &__close {
      align-items: center;
      background: ${F};
      border: 3px solid ${F} !important;
      border-radius: 0 !important;
      color: ${S};
      cursor: pointer;
      display: flex;
      font-size: 1.25rem;
      font-weight: 900;
      height: 36px;
      justify-content: center;
      padding: 0 !important;
      position: absolute;
      right: 16px;
      top: 16px;
      transition: background 0.08s;
      width: 36px;
      &:hover {
        background: ${z};
      }
    }
  }
`,E`
  html{line-height:1.15;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,footer,header,nav,section{display:block}h1{font-size:2em;margin:.67em 0}figcaption,figure,main{display:block}figure{margin:1em 40px}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent;-webkit-text-decoration-skip:objects}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}dfn{font-style:italic}mark{background-color:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}audio,video{display:inline-block}audio:not([controls]){display:none;height:0}img{border-style:none}svg:not(:root){overflow:hidden}button,input,optgroup,select,textarea{font-family:sans-serif;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}button,html [type=button],[type=reset],[type=submit]{-webkit-appearance:button}button::-moz-focus-inner,[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner{border-style:none;padding:0}button:-moz-focusring,[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:.35em .75em .625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{display:inline-block;vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details,menu{display:block}summary{display:list-item}canvas{display:inline-block}template{display:none}[hidden]{display:none}

  html {
    font-size: 16px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body {
    margin: 5% 8%;
    background: ${I};
  }

  * {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 900;
  }

  ul,ol {
    list-style:none;
    padding: 0;
    margin: 0;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }
`,"function"==typeof SuppressedError&&SuppressedError;let K=null;function P(e){for(const t of e._subscribers)t._running||t._notify()}var L,Z,X,G,Y,V;class U{constructor(e,t,r){L.set(this,void 0),Z.set(this,[]),X.set(this,!1),G.set(this,void 0),Y.set(this,void 0),V.set(this,void 0),this.key=t,R(this,Y,function(e){const t={_value:e,_subscribers:new Set},r=()=>(K&&(t._subscribers.add(K),K._sources.add(t)),t._value);return r.set=e=>{Object.is(t._value,e)||(t._value=e,P(t))},r.peek=()=>t._value,r.dispose=()=>{t._subscribers.clear()},r}(r),"f"),this.id="_"+Math.random().toString(36).slice(2,11),R(this,V,e,"f")}get value(){return H(this,Y,"f").call(this)}set value(e){H(this,Y,"f").set(e)}peek(){return H(this,Y,"f").peek()}get _signal(){return H(this,Y,"f")}getArrayMethod(e){const t=H(this,Y,"f").peek();return Array.isArray(t)?t[e].bind(t):void 0}get map(){return this.getArrayMethod("map")}get filter(){return this.getArrayMethod("filter")}get forEach(){return this.getArrayMethod("forEach")}get find(){return this.getArrayMethod("find")}get reduce(){return this.getArrayMethod("reduce")}get includes(){return this.getArrayMethod("includes")}get indexOf(){return this.getArrayMethod("indexOf")}get slice(){return this.getArrayMethod("slice")}get concat(){return this.getArrayMethod("concat")}get join(){return this.getArrayMethod("join")}get some(){return this.getArrayMethod("some")}get every(){return this.getArrayMethod("every")}get findIndex(){return this.getArrayMethod("findIndex")}get length(){const e=H(this,Y,"f").peek();return Array.isArray(e)?e.length:void 0}update(e){const t=H(this,L,"f")?H(this,L,"f").call(this,e):e;return H(this,Y,"f").set(t),H(this,X,"f")?R(this,G,t,"f"):(R(this,X,!0,"f"),R(this,G,t,"f"),queueMicrotask(()=>{R(this,X,!1,"f");const e=H(this,G,"f");R(this,G,void 0,"f"),H(this,Z,"f")&&H(this,Z,"f").forEach(t=>t(e))})),this}observe(e,t=this){e instanceof Node&&(e=this.nodeObserver(e)),H(this,Z,"f").push(e.bind(t))}compute(e){const t=H(this,V,"f").defineProperty(e(this.value));return R(t,L,e,"f"),this.observe(t.update,t),t}dispose(){R(this,Z,[],"f"),R(this,X,!1,"f"),R(this,G,void 0,"f"),H(this,Y,"f").dispose()}nodeObserver(e){let t=H(this,Y,"f").peek();const r=e.parentElement;return n=>{var o;e instanceof Attr?e.value=e.value.replace(String(t),String(n)):Array.isArray(n)?null==r||r.replaceChildren(...n):e.textContent=(null===(o=e.textContent)||void 0===o?void 0:o.replace(String(t),String(n)))||String(n),t=n}}}L=new WeakMap,Z=new WeakMap,X=new WeakMap,G=new WeakMap,Y=new WeakMap,V=new WeakMap;const J=function(e){if(e)return e;return{ids:[],props:[],keyMap:new Map,idMap:new Map,defineProperty(e,t){if(e instanceof U){const t=e,{id:r}=t;return this.idMap.has(r)||(this.props.push(t),this.ids.push(r),this.idMap.set(r,t),t.key&&this.keyMap.set(t.key,t)),t}const r=null!=t?t:`_auto_${this.props.length}_${Date.now()}`,n=new U(this,r,e);return this.props.push(n),this.ids.push(n.id),this.idMap.set(n.id,n),this.keyMap.set(r,n),n},getPropertyByKey(e){return this.keyMap.get(e)},getPropertyByValue(e){return this.props.find(({value:t})=>t===e)},getPropertyById(e){return this.idMap.get(e)},hasProperty(e){return this.keyMap.has(e)},hasId(e){return this.idMap.has(e)},dispose(){this.props.forEach(e=>e.dispose()),this.ids=[],this.props=[],this.keyMap.clear(),this.idMap.clear()}}},Q="marjoram-",ee=/marjoram-(\d+)/g;function te(){return document.createTextNode("")}function re(e,t,r){const n=e.parentNode;if(!n)return t;for(const e of t)n.removeChild(e);const o=e.nextSibling;for(const e of r)n.insertBefore(e,o);return[...r]}function ne(e,t){let r=[];const n=t=>{if(t instanceof DocumentFragment){const n=Array.from(t.childNodes);r=re(e,r,n.length>0?n:[te()])}else if(t instanceof Node)r=re(e,r,[t]);else if(Array.isArray(t)){const n=t.flatMap(e=>e instanceof DocumentFragment?Array.from(e.childNodes):e instanceof Node?[e]:[document.createTextNode(String(null!=e?e:""))]);r=re(e,r,n.length>0?n:[te()])}else{const n=null==t?"":String(t);1===r.length&&r[0].nodeType===Node.TEXT_NODE?r[0].data=n:r=re(e,r,[document.createTextNode(n)])}};n(t.value),t.observe(e=>n(e))}function oe(e,t,r){let n=null;const o=r=>{n&&(e.removeEventListener(t,n),n=null),"function"==typeof r&&(n=r,e.addEventListener(t,n))};o(r.value),r.observe(e=>o(e))}function ie(e,t,r){const n=r=>{e[t]=r};n(r.value),r.observe(e=>n(e))}function ae(e,t,r){const n=r=>{e.toggleAttribute(t,Boolean(r))};n(r.value),r.observe(e=>n(e))}function se(e,t){let r=null;const n=t=>{r&&(e.removeAttribute(r),r=null);const n=null==t?"":String(t);n&&(e.setAttribute(n,""),r=n)};n(t.value),t.observe(e=>n(e))}function ce(e,t,r,n,o){const i=n.map(e=>o[e].value),a=()=>{var n;let o=r[0];for(let e=0;e<i.length;e++)o+=String(null!==(n=i[e])&&void 0!==n?n:"")+r[e+1];e.setAttribute(t,o)};a(),n.forEach((e,t)=>{const r=o[e];r&&r.observe(e=>{i[t]=e,a()})})}function le(e){const t=[],r=[];let n=0;const o=new RegExp(ee.source,"g");let i;for(;null!==(i=o.exec(e));)t.push(e.slice(n,i.index)),r.push(parseInt(i[1],10)),n=i.index+i[0].length;return 0===r.length?null:(t.push(e.slice(n)),{statics:t,indices:r})}const de=/^data-marjoram-([epb])-(\d+)$/,pe=new RegExp(`^${Q}(\\d+)$`),ue=/<!--marjoram-(\d+)-->/g;function fe(e,t,r){const n=Array.from(e.attributes);for(const r of n){const n=r.name.match(de);if(n){const o=n[1],i=parseInt(n[2],10),a=r.value;e.removeAttribute(r.name);const s=t[i];if(!s)continue;"e"===o?oe(e,a,s):"p"===o?ie(e,a,s):ae(e,a,s);continue}const o=r.name.match(pe);if(o){const n=parseInt(o[1],10);e.removeAttribute(r.name);const i=t[n];if(!i)continue;se(e,i);continue}const i=le(r.value);if(!i)continue;const{statics:a,indices:s}=i;if(1===s.length&&a.every(e=>""===e)&&r.name.startsWith("on")){const n=r.name.slice(2);e.removeAttribute(r.name);const o=t[s[0]];o&&oe(e,n,o);continue}ce(e,r.name,a,s,t)}const o=e.getAttribute("ref");o&&(r[o]=e)}const he=(e,t)=>{const r={};!function(e,t){const r=document.createTreeWalker(e,NodeFilter.SHOW_COMMENT),n=[];for(;r.nextNode();){const e=r.currentNode;e.data.startsWith(Q)&&n.push({comment:e,index:parseInt(e.data.slice(9),10)})}for(const{comment:e,index:r}of n){const n=t[r];n&&ne(e,n)}}(e,t),function(e,t){const r=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),n=[];for(;r.nextNode();){const e=r.currentNode;ue.lastIndex=0,ue.test(e.data)&&n.push(e)}for(const e of n){const r=e.parentNode,n=e.data;ue.lastIndex=0;const o=[];let i,a=0;for(;null!==(i=ue.exec(n));)i.index>a&&o.push(n.slice(a,i.index)),o.push({index:parseInt(i[1],10)}),a=i.index+i[0].length;a<n.length&&o.push(n.slice(a));for(const n of o)if("string"==typeof n)r.insertBefore(document.createTextNode(n),e);else{const o=document.createComment(`${Q}${n.index}`);r.insertBefore(o,e);const i=t[n.index];i&&ne(o,i)}r.removeChild(e)}}(e,t);for(const n of e.querySelectorAll("*"))fe(n,t,r);return{refs:r}},me=new WeakMap,xe=function(e,...t){const r=J(),n=t.map(e=>{const t=null==e?"":e;return r.defineProperty(t,null==t?void 0:t.key)});let o=me.get(e);o||(o=document.createElement("template"),o.innerHTML=(e=>{let t="",r=!1,n=!1,o="";for(let i=0;i<e.length;i++){const a=e[i];for(let e=0;e<a.length;e++){const t=a[e];n?t===n&&(n=!1,o=""):r?">"===t?(r=!1,o=""):'"'===t||"'"===t?n=t:"="===t||(" "===t||"\n"===t||"\r"===t||"\t"===t?o.includes("=")||(o=""):o+=t):"<"===t&&(r=!0,o="")}if(t+=a,i<e.length-1)if(r)if(n)t+=`${Q}${i}`;else{const e=o[0],r=o.slice(1);if("@"===e||"."===e||"?"===e){const n=t.slice(0,t.length-o.length-1);t=n+`data-marjoram-${"@"===e?"e":"."===e?"p":"b"}-${i}="${r}"`}else t+=`${Q}${i}`;o=""}else t+=`\x3c!--${Q}${i}--\x3e`}return t})(e),me.set(e,o));const i=o.content.cloneNode(!0),a=he(i,n);i.collect=()=>(i.refs||(i.refs=a.refs),i.refs);let s=[];return i.mount=(e,t={})=>{const r="string"==typeof e?document.querySelector(e):e;if(!r)throw new Error(`[marjoram] mount target not found: "${e}"`);if(t.styles){const e=document.createElement("style");e.textContent=t.styles,i.prepend(e)}if(s=Array.from(i.childNodes),t.shadow){r.attachShadow({mode:t.shadow}).appendChild(i)}else r.appendChild(i)},i.unmount=()=>{r.dispose(),s.forEach(e=>{var t;return null===(t=e.parentNode)||void 0===t?void 0:t.removeChild(e)}),s=[]},i},ge=(e,t,r)=>{const n=e=>{var n;return Boolean(e)?t():null!==(n=null==r?void 0:r())&&void 0!==n?n:document.createTextNode("")};if("boolean"==typeof e)return n(e);const o=document.createElement("span");return o.style.display="contents",o.appendChild(n(e.value)),e.observe(e=>{o.replaceChildren(n(e))}),o},be=new Set(["push","pop","shift","unshift","splice","sort","reverse","fill","copyWithin"]),ve=(e,t)=>new Proxy(e,{get(e,r){if("string"==typeof r&&be.has(r))return(...n)=>{const o=e[r](...n);return t.update([...e]),o};const n=Reflect.get(e,r);return"function"==typeof n?n.bind(e):n}}),ye=function(e){const t=J();e={...e};const r=new Map;for(const t in e){const n=e[t];"function"==typeof n&&(r.set(t,n),delete e[t])}let n;const o=new Map,i=[];function a(e){let t=o.get(e);if(!t){const i=r.get(e);t=function(e){const t={_value:void 0,_subscribers:new Set};let r=!0;const n={_sources:new Set,_running:!1,_notify(){r||(r=!0,P(t))}};function o(){for(const e of n._sources)e._subscribers.delete(n);n._sources.clear();const o=K;K=n,n._running=!0;try{t._value=e()}finally{n._running=!1,K=o}return r=!1,t._value}o();const i=()=>(r&&o(),K&&(t._subscribers.add(K),K._sources.add(t)),t._value);return i.peek=()=>(r&&o(),t._value),i.dispose=()=>{for(const e of n._sources)e._subscribers.delete(n);n._sources.clear(),t._subscribers.clear(),r=!1},i}(()=>i(n)),o.set(e,t)}return t}function s(e,t){let r=!1;const n=function(e){let t,r=!1,n=!1;const o={_sources:new Set,_running:!1,_notify(){r||n||(r=!0,queueMicrotask(()=>{r=!1,n||i()}))}};function i(){"function"==typeof t&&t();for(const e of o._sources)e._subscribers.delete(o);o._sources.clear();const r=K;K=o,o._running=!0;try{t=e()}finally{o._running=!1,K=r}}return i(),()=>{n=!0,"function"==typeof t&&t();for(const e of o._sources)e._subscribers.delete(o);o._sources.clear()}}(()=>{const n=e();r&&t.update(n),r=!0});i.push(n)}const c={get(e,n){if("symbol"==typeof n)return;if("$destroy"===n)return()=>{for(const e of i)e();i.length=0;for(const e of o.values())e.dispose();o.clear(),t.dispose()};const c="$"===n[0],l=c?n.replace("$",""):n;if(r.has(l)){const e=a(l);let r=t.getPropertyByKey(l);if(r){const t=e.peek();r.value=t}else{const n=e.peek();r=t.defineProperty(n,l),s(e,r)}return c?r:r.value}if(!(l in e))return;const d=Reflect.get(e,l),p=d instanceof U;let u=t.getPropertyByKey(l);if(u?p||Reflect.set(e,l,u):(u=t.defineProperty(d,l),Reflect.set(e,l,u)),c)return u;if(p){const e=Reflect.get(d,"value");return Array.isArray(e)?ve(e,d):e}const f=u.value;if(Array.isArray(f))return ve(f,u);if("object"==typeof f&&null!==f&&!(f instanceof Node)){const t=new Proxy(f,this);return Reflect.set(e,l,t),t}return f},set(e,n,o){if("symbol"==typeof n)return!1;if(r.has(n))throw new Error(`Cannot set computed property "${n}". Computed properties are read-only.`);const i=t.getPropertyByKey(n);return i?(i.update(o),!!i):(Reflect.set(e,n,o),!0)}},l=new Proxy(e,c);return n=l,l};function we(e){const{target:t,shadow:r,styles:n,model:o,render:i,onMount:a,onDestroy:s}=e,c=ye(o),l=i(c),d={...r&&{shadow:r},...n&&{styles:n}};return{vm:c,mount(){l.mount(t,d),a&&a(c,l.collect())},destroy(){s&&s(c),l.unmount(),c.$destroy()}}}const _e="cart",$e={total:0,items:JSON.parse(localStorage.getItem(_e))||[],subscribers:[],subscribe(e){this.notify(),this.subscribers.push(e)},notify(){this.subscribers.forEach(e=>e(this.items))},addItem(e){const t=this.getAll();let r=t.find(({id:t})=>t===e);r?r.quantity++:(r=ke.find(({id:t})=>t===e),r.quantity=1,t.push(r)),r&&this.updateCart(t)},removeItem(e){const t=this.getAll();let r=t.find(({id:t})=>t===e);r&&(r.quantity--,this.updateCart(t.filter(({quantity:e})=>e)))},getItem(e){return this.getAll().find(({id:t})=>t===e)},updateCart(e){localStorage.setItem(_e,JSON.stringify(e)),this.getAll(),this.notify()},getAll(){let e=localStorage.getItem(_e);return e||localStorage.setItem(_e,JSON.stringify(this.items)),this.items=JSON.parse(e),this.items},removeAll:()=>localStorage.setItem(_e,JSON.stringify([]))};$e.getAll();const ke=[{id:201,name:"Nulla",price:207,description:"Culpa sed tenetur incidunt quia veniam sed molliti",likes:78,quantity:0,featured:!0,image:"https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:202,name:"Corporis",price:271,description:"Nam incidunt blanditiis odio inventore. Nobis volu",likes:67,quantity:0,image:"https://images.unsplash.com/photo-1547514701-42782101795e?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:203,name:"Minus",price:295,description:"Quod reiciendis aspernatur ipsum cum debitis. Quis",likes:116,quantity:0,image:"https://images.unsplash.com/photo-1591287083773-9a52ba8184a4?ixid=MXwxMjA3fDB8MHxzZWFyY2h8N3x8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:204,name:"Qui",price:280,description:"Occaecati dolore assumenda facilis error quaerat. ",likes:78,quantity:0,clearance:!0,image:"https://images.unsplash.com/photo-1528825871115-3581a5387919?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OHx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:209,name:"Similique",price:262,description:"Autem blanditiis similique saepe excepturi at erro",likes:44,quantity:0,soldOut:!0,image:"https://images.unsplash.com/photo-1552089123-2d26226fc2b7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OXx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:220,name:"Soluta",price:109,description:"Quos accusamus distinctio voluptates ducimus neque",likes:34,quantity:0,clearance:!0,image:"https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTV8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:223,name:"Quos",price:247,description:"Error voluptate recusandae reiciendis adipisci nec",likes:188,quantity:0,featured:!0,image:"https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTl8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:224,name:"Sunt",price:297,description:"Tempora sed explicabo quae recusandae vitae debiti",likes:63,quantity:0,soldOut:!0,image:"https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MjR8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:225,name:"Nemo",price:143,description:"Id pariatur at modi esse distinctio error. Dolores",likes:116,quantity:0,image:"https://images.unsplash.com/photo-1439127989242-c3749a012eac?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MzB8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:226,name:"Quo",price:150,description:"Explicabo distinctio labore eius. Culpa provident ",likes:157,quantity:0,image:"https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NDl8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:227,name:"Nobis",price:195,description:"Reprehenderit iste quos amet. Natus consequatur in",likes:30,quantity:0,image:"https://images.unsplash.com/photo-1560155016-bd4879ae8f21?ixid=MXwxMjA3fDB8MHxzZWFyY2h8M3x8YXZvY2Fkb3xlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:228,name:"Explicabo",price:253,description:"Nihil magni libero sapiente voluptate. Perspiciati",likes:11,quantity:0,soldOut:!0,image:"https://images.unsplash.com/photo-1587324438673-56c78a866b15?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8bGVtb258ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"}],Ae=e=>{const t=ye(e),{$image:r,$name:n,$price:o,$likes:i,$description:a}=t,s=e.featured?" product--featured":e.clearance?" product--clearance":e.soldOut?" product--sold-out":"",c=e.soldOut?xe`<button disabled class="product__likeBtn product__likeBtn--disabled">
        Sold Out
      </button>`:xe`<button
        onclick=${()=>$e.addItem(e.id)}
        class="product__likeBtn"
      >
        Add To Cart
      </button>`;return xe`
    <div class="${j} product${s}">
      <div class="product__imageContainer">
        <img class="product__image" src="${r}" alt="${n}" />
      </div>
      <div class="product__headingContainer">
        <h3 class="product__name">${n}</h3>
        <p class="product__description">${a}</p>
      </div>
      <div class="product__metaRow">
        <div class="product__priceContainer">
          <h4 class="product__price">$${o}</h4>
        </div>
        <div class="product__likesContainer">
          <button onclick=${()=>t.likes+=1} class="product__likeBtn">
            <span class="product__thumbsUp"> ${xe`<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="1.1"
  viewBox="0 0 169 158"
  xml:space="preserve"
>
  <path
    d="M8.5,133.7V72.9c0-1.6,0.6-3.1,1.8-4.3c1.2-1.2,2.6-1.8,4.3-1.8h27.4c1.6,0,3.1,0.6,4.3,1.8c1.2,1.2,1.8,2.6,1.8,4.3     v60.8c0,1.6-0.6,3.1-1.8,4.3c-1.2,1.2-2.6,1.8-4.3,1.8H14.6c-1.6,0-3.1-0.6-4.3-1.8C9.1,136.8,8.5,135.4,8.5,133.7z M20.7,121.6     c0,1.7,0.6,3.2,1.8,4.3c1.2,1.2,2.6,1.8,4.3,1.8c1.6,0,3.1-0.6,4.3-1.8c1.2-1.2,1.8-2.6,1.8-4.3c0-1.6-0.6-3.1-1.8-4.3     c-1.2-1.2-2.6-1.8-4.3-1.8c-1.7,0-3.2,0.6-4.3,1.8C21.3,118.5,20.7,119.9,20.7,121.6z M54.1,133.7V72.8c0-1.6,0.6-3,1.7-4.1     c1.1-1.2,2.5-1.8,4.1-1.9c1.5-0.1,3.9-2,7.2-5.6c3.3-3.6,6.5-7.4,9.6-11.5c4.3-5.5,7.5-9.3,9.6-11.4c1.1-1.1,2.1-2.7,2.9-4.6     c0.8-1.9,1.4-3.4,1.7-4.6c0.3-1.2,0.7-3.1,1.3-5.7c0.4-2.5,0.8-4.4,1.2-5.8c0.3-1.4,1-3,1.9-4.9c0.9-1.9,2-3.5,3.2-4.7     c1.2-1.2,2.6-1.8,4.3-1.8c2.9,0,5.5,0.3,7.8,1c2.3,0.7,4.2,1.5,5.7,2.5c1.5,1,2.8,2.3,3.8,3.8c1,1.6,1.8,3,2.3,4.3     c0.5,1.3,0.9,2.8,1.1,4.7c0.3,1.9,0.4,3.3,0.5,4.3c0,1,0,2.2,0,3.7c0,2.4-0.3,4.8-0.9,7.2c-0.6,2.4-1.2,4.3-1.8,5.7     c-0.6,1.4-1.5,3.2-2.6,5.3c-0.2,0.4-0.5,0.9-0.9,1.7c-0.4,0.8-0.8,1.5-1,2.1c-0.3,0.6-0.5,1.4-0.8,2.3h26.3     c4.9,0,9.2,1.8,12.8,5.4s5.4,7.9,5.4,12.8c0,5.4-1.7,10.2-5.2,14.2c0.9,2.8,1.4,5.2,1.4,7.2c0.2,4.8-1.2,9.2-4.1,13     c1.1,3.5,1.1,7.3,0,11.1c-0.9,3.6-2.7,6.6-5.1,8.9c0.6,7.1-1,12.8-4.7,17.2c-4.1,4.8-10.3,7.3-18.7,7.4h-3.4h-7.2h-1.6     c-4.2,0-8.7-0.5-13.7-1.5c-4.9-1-8.8-1.9-11.5-2.8c-2.8-0.9-6.6-2.1-11.4-3.8c-7.8-2.7-12.8-4.1-15-4.2c-1.6-0.1-3.1-0.7-4.3-1.9     C54.7,136.8,54.1,135.4,54.1,133.7z"
  />
</svg>`} </span>
            <span>${i}</span>
          </button>
        </div>
      </div>

      <div class="product__cartContainer">${c}</div>
    </div>
  `},Me=e=>{const t=ye(e),{$id:r,$image:n,$name:o,$quantity:i,quantity:a,price:s}=t;return xe`
    <li class="item ${D}" data-id="${r}">
      <div class="item__imageContainer">
        <img class="item__image" src="${n}" alt="${o}" />
      </div>
      <div class="item__details">
        <div class="item__nameContainer">
          <p>${o}</p>
        </div>
        <div class="item__quantityContainer">
          <button
            onclick=${()=>$e.removeItem(t.id)}
            class="item__quantity item__quantity--minus item__btn"
          >
            -
          </button>
          <p class="item__quantity">${i}</p>
          <button
            onclick=${()=>$e.addItem(t.id)}
            class="item__quantity item__quantity--plus item__btn"
          >
            +
          </button>
        </div>
        <div class="item__priceContainer">
          <p>Price: $${s*a}</p>
        </div>
      </div>
    </li>
  `},Ee=e=>e.reduce((e,t)=>(t.price&&(e+=t.price*t.quantity),e),0),Ce=e=>we({target:"#cart-root",model:{items:e,isOpen:!1,total:Ee(e),recentlyAdded:[]},render:e=>{const t=e.$isOpen.compute(e=>e?"open":"closed"),r=e.$items.compute(e=>e.map(Me)),n=e.$recentlyAdded.compute(e=>e.length>0),o=e.$recentlyAdded.compute(e=>{var t;return null!==(t=e[e.length-1])&&void 0!==t?t:""});return xe`
        <div ref="cartContainer" class="${O} cart cart--${t}">
          <div class="cart__contentContainer">
            <div class="cart__controlContainer">
              <button
                onclick=${()=>{e.isOpen=!e.isOpen}}
                class="cart__control cart__control--${t}"
              >
                ${xe`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    viewBox="0 0 902.86 902.86"
    style="enable-background:new 0 0 902.86 902.86;"
    xml:space="preserve"
  >
    <path
      d="M671.504,577.829l110.485-432.609H902.86v-68H729.174L703.128,179.2L0,178.697l74.753,399.129h596.751V577.829z     M685.766,247.188l-67.077,262.64H131.199L81.928,246.756L685.766,247.188z"
    />
    <path
      d="M578.418,825.641c59.961,0,108.743-48.783,108.743-108.744s-48.782-108.742-108.743-108.742H168.717    c-59.961,0-108.744,48.781-108.744,108.742s48.782,108.744,108.744,108.744c59.962,0,108.743-48.783,108.743-108.744    c0-14.4-2.821-28.152-7.927-40.742h208.069c-5.107,12.59-7.928,26.342-7.928,40.742    C469.675,776.858,518.457,825.641,578.418,825.641z M209.46,716.897c0,22.467-18.277,40.744-40.743,40.744    c-22.466,0-40.744-18.277-40.744-40.744c0-22.465,18.277-40.742,40.744-40.742C191.183,676.155,209.46,694.432,209.46,716.897z     M619.162,716.897c0,22.467-18.277,40.744-40.743,40.744s-40.743-18.277-40.743-40.744c0-22.465,18.277-40.742,40.743-40.742    S619.162,694.432,619.162,716.897z"
    />
  </svg>
`}
              </button>
            </div>
            <ul class="cart__items">
              ${r}
            </ul>
            ${ge(n,()=>xe`
                <p class="cart__recentlyAdded">Last added: ${o}</p>
              `)}
            <div class="cart__total">
              Total: <span class="cart__sum">$${e.$total}</span>
            </div>
          </div>
        </div>
      `},onMount:e=>{$e.subscribe(t=>{const r=new Set(e.items.map(e=>e.id));t.filter(e=>!r.has(e.id)&&e.quantity>0).forEach(t=>e.recentlyAdded.push(t.name)),e.items=t,e.total=Ee(t)})}}),Fe=[{id:1,text:"Your order has shipped!",read:!1},{id:2,text:"New comment on your post",read:!1},{id:3,text:"Welcome to Store™️",read:!0}],Se=(e={label:"",name:"",placeholder:"",autocomplete:!1})=>{var t,r,n;return xe` <div class="form__item">
    <label ref="${e.label.toLowerCase()}" class="formInput">
      <span class="formInput__labelText"> ${e.label} </span>
      <input
        type="${null!==(t=null==e?void 0:e.type)&&void 0!==t?t:"text"}"
        class="formInput__input"
        placeholder="${null!==(r=null==e?void 0:e.placeholder)&&void 0!==r?r:""}"
        autocomplete="${(null==e?void 0:e.autocomplete)?"on":"off"}"
        name="${null!==(n=null==e?void 0:e.name)&&void 0!==n?n:""}"
      />
    </label>
  </div>`},ze=[{label:"Name:",name:"name"},{label:"Email:",name:"email"},{label:"Industry:",name:"industry"},{label:"Reason for inquiry:",name:"subject"}],Te="#111111",Be="#FAFAF8",Ie="#D62626",We=C`
  align-items: center;
  background: ${Ie};
  border: 3px solid ${Te};
  border-radius: 0;
  bottom: calc(1.5rem + 56px + 0.75rem);
  box-shadow: 4px 4px 0 ${Te};
  color: ${Be};
  cursor: pointer;
  display: flex;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1rem;
  font-weight: 900;
  height: 56px;
  justify-content: center;
  left: 1.5rem;
  position: fixed;
  transition:
    box-shadow 0.08s,
    transform 0.08s;
  width: 56px;
  z-index: 9100;
  &:hover {
    box-shadow: 2px 2px 0 ${Te};
    transform: translate(2px, 2px);
  }
  &:active {
    box-shadow: 0 0 0 ${Te};
    transform: translate(4px, 4px);
  }
`,je=C`
  align-items: center;
  background: rgba(17, 17, 17, 0.85);
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  transition: opacity 0.12s ease-out;
  z-index: 9300;
  &--open {
    opacity: 1;
  }
  &--closed {
    opacity: 0;
    pointer-events: none;
  }
`,Ne=C`
  background: ${Be};
  border: 3px solid ${Te};
  border-top: 8px solid ${"#1A3FAA"};
  box-shadow: 8px 8px 0 ${Te};
  max-width: 560px;
  padding: 40px;
  position: relative;
  width: 90vw;
`,Oe=C`
  align-items: center;
  background: ${Te};
  border: 3px solid ${Te} !important;
  border-radius: 0 !important;
  color: ${Be};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 900;
  height: 36px;
  justify-content: center;
  position: absolute;
  right: 16px;
  top: 16px;
  transition: background 0.08s;
  width: 36px;
  &:hover {
    background: ${Ie};
  }
`,De=()=>{let e;return we({target:"#contact-root",model:{isOpen:!1},render:e=>{const t=e.$isOpen.compute(e=>e?"open":"closed");return xe`
        <button
          class="${We}"
          aria-label="Open contact form"
          aria-haspopup="dialog"
          onclick=${()=>{e.isOpen=!0}}
        >
          💌
        </button>
        <div
          class="${je} ${je}--${t}"
          role="dialog"
          aria-label="Contact"
          aria-modal="true"
          onclick=${t=>{t.target===t.currentTarget&&(e.isOpen=!1)}}
        >
          <div class="${Ne}">
            <button
              class="${Oe}"
              aria-label="Close"
              onclick=${()=>{e.isOpen=!1}}
            >
              ✕
            </button>
            ${(()=>{const e=xe`
    <div class="${q}">
      <h2 id="form_label" class="form__label">Get in touch</h2>
      <form class="form" ref="form">
        ${ze.map(Se)}
        <button ref="submitBtn" type="submit">Submit</button>
      </form>
      <h3 class="form__disclaimer">❗️Uhhh... this isn't an actual form.</h3>
    </div>
  `,{form:t}=e.collect();return null==t||t.addEventListener("submit",e=>{e.preventDefault(),new FormData(e.target)}),e})()}
          </div>
        </div>
      `},onMount:t=>{const r=e=>{"Escape"===e.key&&t.isOpen&&(t.isOpen=!1)};document.addEventListener("keydown",r),e=()=>document.removeEventListener("keydown",r)},onDestroy:()=>null==e?void 0:e()})};document.addEventListener("DOMContentLoaded",()=>{const e=Ce($e.items),t=(()=>{let e;return we({target:"#chat-root",shadow:"open",styles:"\n  *:focus-visible { outline: 3px solid #1A3FAA; outline-offset: 2px; }\n  .chat { position: fixed; bottom: 1.5rem; right: 1.5rem; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; z-index: 9200; display: flex; flex-direction: column; align-items: flex-end; }\n  .chat__toggle {\n    width: 56px; height: 56px; border: 3px solid #111111; border-radius: 0;\n    background: #111111; color: #FAFAF8; font-size: 1.5rem; cursor: pointer;\n    box-shadow: 4px 4px 0 #D62626; transition: box-shadow 0.08s, transform 0.08s;\n  }\n  .chat__toggle:hover { box-shadow: 2px 2px 0 #D62626; transform: translate(2px, 2px); }\n  .chat__badge {\n    position: absolute; top: -4px; right: -4px;\n    background: #D62626; color: #FAFAF8; font-size: 0.7rem; font-weight: 900;\n    width: 20px; height: 20px; border: 2px solid #111111; border-radius: 0;\n    display: flex; align-items: center; justify-content: center;\n  }\n  .chat__panel {\n    width: 300px; margin-bottom: 0.5rem;\n    background: #FAFAF8; border: 3px solid #111111; box-shadow: 6px 6px 0 #111111;\n    overflow: hidden; display: flex; flex-direction: column;\n  }\n  .chat__header {\n    padding: 0.75rem 1rem; background: #111111; color: #FAFAF8; font-weight: 900;\n    display: flex; justify-content: space-between; align-items: center;\n    border-bottom: 3px solid #111111;\n  }\n  .chat__close { background: none; border: none; color: #FAFAF8; font-size: 1.2rem; cursor: pointer; font-weight: 900; }\n  .chat__close:hover { color: #F7C518; }\n  .chat__messages { padding: 0.75rem; max-height: 240px; overflow-y: auto; overflow-anchor: auto; flex: 1; }\n  .chat__msg { padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; font-size: 0.85rem; max-width: 80%; border: 2px solid #111111; }\n  .chat__msg--them { background: #F0EBE0; }\n  .chat__msg--us { background: #1A3FAA; color: #FAFAF8; margin-left: auto; text-align: right; }\n  .chat__input-row { display: flex; border-top: 3px solid #111111; }\n  .chat__input {\n    flex: 1; border: none; border-right: 3px solid #111111; padding: 0.6rem 0.75rem; font-size: 0.85rem; outline: none; background: #FAFAF8;\n  }\n  .chat__input:focus-visible { outline: 3px solid #1A3FAA; outline-offset: -3px; }\n  .chat__send {\n    background: #1A3FAA; color: #FAFAF8; border: none; padding: 0 1rem; cursor: pointer;\n    font-weight: 900; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.08s;\n  }\n  .chat__send:hover { background: #111111; }\n",model:{open:!1,messages:[{text:"Hi! How can we help?",from:"them"}],draft:"",unread:1},render:e=>{const t=e.$open.compute(e=>String(e)),r=e.$open.compute(e=>e?"Close chat":"Open chat"),n=e.$unread.compute(e=>e>0?xe`<span class="chat__badge" aria-hidden="true">${e}</span>`:xe`<span></span>`),o=e.$messages.compute(e=>e.map(e=>xe`<div class="chat__msg chat__msg--${e.from}">${e.text}</div>`));return xe`
        <div class="chat">
          ${ge(e.$open,()=>xe`
              <div
                class="chat__panel"
                role="dialog"
                aria-label="Chat"
                aria-modal="true"
              >
                <div class="chat__header">
                  <span>Chat</span>
                  <button
                    class="chat__close"
                    aria-label="Close chat"
                    onclick=${()=>{e.open=!1}}
                  >
                    ✕
                  </button>
                </div>
                <div
                  class="chat__messages"
                  role="log"
                  aria-label="Chat messages"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  ${o}
                </div>
                <div class="chat__input-row">
                  <input
                    class="chat__input"
                    aria-label="Type a message"
                    placeholder="Type a message…"
                    oninput=${t=>{e.draft=t.target.value}}
                    onkeydown=${t=>{"Enter"===t.key&&e.draft.trim()&&(e.messages=[...e.messages,{text:e.draft.trim(),from:"us"}],e.draft="",t.target.value="")}}
                  />
                  <button
                    class="chat__send"
                    aria-label="Send message"
                    onclick=${()=>{e.draft.trim()&&(e.messages=[...e.messages,{text:e.draft.trim(),from:"us"}],e.draft="")}}
                  >
                    Send
                  </button>
                </div>
              </div>
            `)}
          <button
            class="chat__toggle"
            aria-label="${r}"
            aria-expanded="${t}"
            aria-haspopup="dialog"
            onclick=${()=>{e.open=!e.open,e.open&&(e.unread=0)}}
          >
            💬 ${n}
          </button>
        </div>
      `},onMount:t=>{const r=document.getElementById("chat-root"),n=()=>{setTimeout(()=>{var e;const t=null===(e=r.shadowRoot)||void 0===e?void 0:e.querySelector(".chat__messages");t&&(t.scrollTop=t.scrollHeight)},0)};t.$open.observe(e=>{e&&(setTimeout(()=>{var e,t;null===(t=null===(e=r.shadowRoot)||void 0===e?void 0:e.querySelector(".chat__input"))||void 0===t||t.focus()},0),n())}),t.$messages.observe(()=>{t.open&&n()});const o=e=>{var n,o;"Escape"===e.key&&t.open&&(t.open=!1,null===(o=null===(n=r.shadowRoot)||void 0===n?void 0:n.querySelector(".chat__toggle"))||void 0===o||o.focus())},i=e=>{t.open&&!e.composedPath().includes(r)&&(t.open=!1)};document.addEventListener("keydown",o),document.addEventListener("click",i),e=()=>{document.removeEventListener("keydown",o),document.removeEventListener("click",i)}},onDestroy:()=>null==e?void 0:e()})})(),r=(()=>{let e;return we({target:"#cookie-root",shadow:"open",styles:"\n  *:focus-visible { outline: 3px solid #1A3FAA; outline-offset: 2px; }\n  .banner {\n    position: fixed;\n    bottom: 1.5rem;\n    left: 50%;\n    transform: translateX(-50%);\n    z-index: 9000;\n    background: #111111;\n    border: 3px solid #111111;\n    box-shadow: 4px 4px 0 #111111;\n    color: #FAFAF8;\n    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\n    font-size: 0.8rem;\n    display: flex;\n    align-items: center;\n    gap: 0.75rem;\n    padding: 0.6rem 0.75rem 0.6rem 1rem;\n    white-space: nowrap;\n  }\n  .banner__text { font-weight: 500; letter-spacing: 0.01em; }\n  .banner__actions { display: flex; gap: 0.5rem; flex-shrink: 0; }\n  .banner__btn {\n    padding: 0.35rem 0.75rem;\n    border: 2px solid #FAFAF8;\n    border-radius: 0;\n    font-size: 0.75rem;\n    font-weight: 900;\n    cursor: pointer;\n    font-family: inherit;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    transition: box-shadow 0.08s, transform 0.08s;\n  }\n  .banner__btn:hover { box-shadow: 2px 2px 0 #FAFAF8; transform: translate(-1px, -1px); }\n  .banner__btn--accept { background: #F7C518; color: #111111; border-color: #F7C518; }\n  .banner__btn--accept:hover { box-shadow: 2px 2px 0 #F7C518; }\n  .banner__btn--reject { background: transparent; color: #FAFAF8; }\n",model:{visible:!0},render:e=>xe`
      <div
        class="banner"
        role="region"
        aria-label="Cookie consent"
        style="display: ${e.$visible.compute(e=>e?"flex":"none")}"
      >
        <div class="banner__text" id="cookie-desc">Cookies — demo only.</div>
        <div
          class="banner__actions"
          role="group"
          aria-label="Cookie consent options"
        >
          <button
            class="banner__btn banner__btn--reject"
            aria-describedby="cookie-desc"
            onclick=${()=>{e.visible=!1}}
          >
            No thanks
          </button>
          <button
            class="banner__btn banner__btn--accept"
            aria-describedby="cookie-desc"
            onclick=${()=>{e.visible=!1}}
          >
            Sure, why not
          </button>
        </div>
      </div>
    `,onMount:t=>{const r=document.getElementById("cookie-root");queueMicrotask(()=>{var e,t;null===(t=null===(e=r.shadowRoot)||void 0===e?void 0:e.querySelector(".banner__btn--reject"))||void 0===t||t.focus()});const n=e=>{"Escape"===e.key&&t.visible&&(t.visible=!1)};document.addEventListener("keydown",n),e=()=>document.removeEventListener("keydown",n)},onDestroy:()=>null==e?void 0:e()})})(),n=(()=>{let e;return we({target:"#bell-root",shadow:"open",styles:"\n  *:focus-visible { outline: 3px solid #1A3FAA; outline-offset: 2px; }\n  .bell { position: fixed; bottom: 1.5rem; left: 1.5rem; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; z-index: 9200; display: flex; flex-direction: column; align-items: flex-start; }\n  .bell__toggle {\n    width: 56px; height: 56px; border: 3px solid #111111; border-radius: 0;\n    background: #F7C518; color: #111111; font-size: 1.5rem; cursor: pointer; position: relative;\n    box-shadow: 4px 4px 0 #111111; transition: box-shadow 0.08s, transform 0.08s;\n  }\n  .bell__toggle:hover { box-shadow: 2px 2px 0 #111111; transform: translate(2px, 2px); }\n  .bell__badge {\n    position: absolute; top: -4px; right: -4px;\n    background: #D62626; color: #FAFAF8; font-size: 0.65rem; font-weight: 900;\n    min-width: 18px; height: 18px; border: 2px solid #111111; border-radius: 0; padding: 0 3px;\n    display: flex; align-items: center; justify-content: center;\n  }\n  .bell__dropdown {\n    width: 280px; margin-bottom: 0.5rem;\n    background: #FAFAF8; border: 3px solid #111111; box-shadow: 6px 6px 0 #111111;\n    overflow: hidden;\n  }\n  .bell__header {\n    padding: 0.6rem 0.75rem; border-bottom: 3px solid #111111;\n    display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;\n    background: #111111;\n  }\n  .bell__title { font-weight: 900; color: #FAFAF8; text-transform: uppercase; letter-spacing: 0.5px; }\n  .bell__mark-read {\n    background: none; border: none; color: #F7C518; font-size: 0.75rem;\n    cursor: pointer; font-weight: 900; text-transform: uppercase; font-family: inherit;\n  }\n  .bell__mark-read:hover { color: #FAFAF8; }\n  .bell__list { max-height: 240px; overflow-y: auto; }\n  .bell__item {\n    padding: 0.6rem 0.75rem; border-bottom: 2px solid #111111;\n    font-size: 0.8rem; color: #111111; cursor: default;\n  }\n  .bell__item--unread { background: #F0EBE0; border-left: 4px solid #D62626; }\n  .bell__empty { padding: 1.5rem; text-align: center; color: #666; font-size: 0.8rem; }\n",model:{open:!1,notifications:[...Fe],unread:e=>e.notifications.filter(e=>!e.read).length},render:e=>{const t=e.$open.compute(e=>String(e)),r=e.$unread.compute(e=>e>0?`Notifications, ${e} unread`:"Notifications"),n=e.$unread.compute(e=>e>0?xe`<span class="bell__badge" aria-hidden="true">${e}</span>`:xe`<span></span>`),o=e.$notifications.compute(e=>0===e.length?[xe`<div class="bell__empty" role="listitem">
                  No notifications
                </div>`]:e.map(e=>xe`<div
                    class="bell__item ${e.read?"":"bell__item--unread"}"
                    role="listitem"
                    aria-label="${e.read?"":"Unread: "}${e.text}"
                  >
                    ${e.text}
                  </div>`));return xe`
        <div class="bell">
          ${ge(e.$open,()=>xe`
              <div
                class="bell__dropdown"
                role="listbox"
                aria-label="Notifications"
              >
                <div class="bell__header">
                  <span class="bell__title" id="bell-title">Notifications</span>
                  <button
                    class="bell__mark-read"
                    aria-label="Mark all notifications as read"
                    onclick=${()=>{e.notifications=e.notifications.map(e=>({...e,read:!0}))}}
                  >
                    Mark all read
                  </button>
                </div>
                <div class="bell__list">${o}</div>
              </div>
            `)}
          <button
            class="bell__toggle"
            aria-label="${r}"
            aria-expanded="${t}"
            aria-haspopup="listbox"
            onclick=${()=>{e.open=!e.open}}
          >
            🔔 ${n}
          </button>
        </div>
      `},onMount:t=>{const r=document.getElementById("bell-root"),n=e=>{var n,o;"Escape"===e.key&&t.open&&(t.open=!1,null===(o=null===(n=r.shadowRoot)||void 0===n?void 0:n.querySelector(".bell__toggle"))||void 0===o||o.focus())},o=e=>{t.open&&!e.composedPath().includes(r)&&(t.open=!1)};document.addEventListener("keydown",n),document.addEventListener("click",o),e=()=>{document.removeEventListener("keydown",n),document.removeEventListener("click",o)}},onDestroy:()=>null==e?void 0:e()})})(),o=De(),i=(()=>{let e;return we({target:"#jump-root",shadow:"open",styles:"\n  *:focus-visible { outline: 3px solid #FAFAF8; outline-offset: 2px; }\n  .jump {\n    align-items: center;\n    background: #1A3FAA;\n    border: 3px solid #111111;\n    border-radius: 0;\n    box-shadow: 4px 4px 0 #111111;\n    color: #FAFAF8;\n    cursor: pointer;\n    display: flex;\n    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\n    font-size: 1.25rem;\n    font-weight: 900;\n    height: 56px;\n    justify-content: center;\n    opacity: 0;\n    pointer-events: none;\n    position: fixed;\n    bottom: calc(1.5rem + 56px + 0.75rem);\n    right: 1.5rem;\n    transition: box-shadow 0.08s, transform 0.08s, opacity 0.2s;\n    width: 56px;\n    z-index: 9100;\n  }\n  .jump--visible {\n    opacity: 1;\n    pointer-events: auto;\n  }\n  .jump:hover { box-shadow: 2px 2px 0 #111111; transform: translate(2px, 2px); }\n  .jump:active { box-shadow: 0 0 0 #111111; transform: translate(4px, 4px); }\n",model:{visible:!1},render:e=>{const t=e.$visible.compute(e=>e?"jump--visible":"");return xe`
        <button
          class="jump ${t}"
          aria-label="Back to top"
          onclick=${()=>{var e;return null===(e=document.firstElementChild)||void 0===e?void 0:e.scrollIntoView({behavior:"smooth"})}}
        >
          ↑
        </button>
      `},onMount:t=>{e=()=>{t.visible=window.scrollY>200},window.addEventListener("scroll",e,{passive:!0})},onDestroy:()=>{e&&window.removeEventListener("scroll",e)}})})(),a=we({target:"#root",model:{},render:()=>((...e)=>xe`
    <div class="${W} layout">
      <div class="layout__headingContainer">
        <div class="layout__headingAccent"></div>
        <div class="layout__headingContent">
          <h1>marjoram</h1>
          <p>
            Zero-dependency widget SDK — reactive views, shadow DOM isolation,
            no framework required.
          </p>
        </div>
      </div>
      ${e}
    </div>
  `)((e=>xe`
    <div class="productGrid ${N}">${e.map(Ae)}</div>
  `)(ke)),onMount:()=>{e.mount(),t.mount(),r.mount(),n.mount(),o.mount(),i.mount()},onDestroy:()=>{e.destroy(),t.destroy(),r.destroy(),n.destroy(),o.destroy(),i.destroy()}});a.mount()})});
//# sourceMappingURL=index.js.map
