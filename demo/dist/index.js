!function(e,t){e&&!e.getElementById("livereloadscript")&&((t=e.createElement("script")).async=1,t.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",t.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(t))}(self.document),function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){"use strict";var e=function(){function e(e){var t=this;this._insertTag=function(e){var r;r=0===t.tags.length?t.insertionPoint?t.insertionPoint.nextSibling:t.prepend?t.container.firstChild:t.before:t.tags[t.tags.length-1].nextSibling,t.container.insertBefore(e,r),t.tags.push(e)},this.isSpeedy=void 0===e.speedy||e.speedy,this.tags=[],this.ctr=0,this.nonce=e.nonce,this.key=e.key,this.container=e.container,this.prepend=e.prepend,this.insertionPoint=e.insertionPoint,this.before=null}var t=e.prototype;return t.hydrate=function(e){e.forEach(this._insertTag)},t.insert=function(e){this.ctr%(this.isSpeedy?65e3:1)==0&&this._insertTag(function(e){var t=document.createElement("style");return t.setAttribute("data-emotion",e.key),void 0!==e.nonce&&t.setAttribute("nonce",e.nonce),t.appendChild(document.createTextNode("")),t.setAttribute("data-s",""),t}(this));var t=this.tags[this.tags.length-1];if(this.isSpeedy){var r=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]}(t);try{r.insertRule(e,r.cssRules.length)}catch(e){}}else t.appendChild(document.createTextNode(e));this.ctr++},t.flush=function(){this.tags.forEach(function(e){var t;return null==(t=e.parentNode)?void 0:t.removeChild(e)}),this.tags=[],this.ctr=0},e}(),t=("undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self,{exports:{}});function r(e){var t=Object.create(null);return function(r){return void 0===t[r]&&(t[r]=e(r)),t[r]}}(function(e){var t="-ms-",r="-moz-",n="-webkit-",i="comm",a="rule",o="decl",s="@page",c="@media",l="@import",u="@charset",p="@viewport",d="@supports",f="@document",h="@namespace",m="@keyframes",x="@font-face",g="@counter-style",b="@font-feature-values",y="@layer",v=Math.abs,w=String.fromCharCode,_=Object.assign;function $(e,t){return 45^C(e,0)?(((t<<2^C(e,0))<<2^C(e,1))<<2^C(e,2))<<2^C(e,3):0}function k(e){return e.trim()}function M(e,t){return(e=t.exec(e))?e[0]:e}function A(e,t,r){return e.replace(t,r)}function E(e,t){return e.indexOf(t)}function C(e,t){return 0|e.charCodeAt(t)}function S(e,t,r){return e.slice(t,r)}function B(e){return e.length}function W(e){return e.length}function T(e,t){return t.push(e),e}function z(e,t){return e.map(t).join("")}function I(t,r,n,i,a,o,s){return{value:t,root:r,parent:n,type:i,props:a,children:o,line:e.line,column:e.column,length:s,return:""}}function q(e,t){return _(I("",null,null,"",null,null,0),e,{length:-e.length},t)}function O(){return e.character}function j(){return e.character=e.position>0?C(e.characters,--e.position):0,e.column--,10===e.character&&(e.column=1,e.line--),e.character}function D(){return e.character=e.position<e.length?C(e.characters,e.position++):0,e.column++,10===e.character&&(e.column=1,e.line++),e.character}function N(){return C(e.characters,e.position)}function P(){return e.position}function K(t,r){return S(e.characters,t,r)}function R(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function H(t){return e.line=e.column=1,e.length=B(e.characters=t),e.position=0,[]}function Z(t){return e.characters="",t}function L(t){return k(K(e.position-1,V(91===t?t+2:40===t?t+1:t)))}function X(e){return Z(G(H(e)))}function F(t){for(;(e.character=N())&&e.character<33;)D();return R(t)>2||R(e.character)>3?"":" "}function G(t){for(;D();)switch(R(e.character)){case 0:T(U(e.position-1),t);break;case 2:T(L(e.character),t);break;default:T(w(e.character),t)}return t}function Y(t,r){for(;--r&&D()&&!(e.character<48||e.character>102||e.character>57&&e.character<65||e.character>70&&e.character<97););return K(t,P()+(r<6&&32==N()&&32==D()))}function V(t){for(;D();)switch(e.character){case t:return e.position;case 34:case 39:34!==t&&39!==t&&V(e.character);break;case 40:41===t&&V(t);break;case 92:D()}return e.position}function J(t,r){for(;D()&&t+e.character!==57&&(t+e.character!==84||47!==N()););return"/*"+K(r,e.position-1)+"*"+w(47===t?t:D())}function U(t){for(;!R(N());)D();return K(t,e.position)}function Q(e){return Z(ee("",null,null,null,[""],e=H(e),0,[0],e))}function ee(e,t,r,n,i,a,o,s,c){for(var l=0,u=0,p=o,d=0,f=0,h=0,m=1,x=1,g=1,b=0,y="",v=i,_=a,$=n,k=y;x;)switch(h=b,b=D()){case 40:if(108!=h&&58==C(k,p-1)){-1!=E(k+=A(L(b),"&","&\f"),"&\f")&&(g=-1);break}case 34:case 39:case 91:k+=L(b);break;case 9:case 10:case 13:case 32:k+=F(h);break;case 92:k+=Y(P()-1,7);continue;case 47:switch(N()){case 42:case 47:T(re(J(D(),P()),t,r),c);break;default:k+="/"}break;case 123*m:s[l++]=B(k)*g;case 125*m:case 59:case 0:switch(b){case 0:case 125:x=0;case 59+u:-1==g&&(k=A(k,/\f/g,"")),f>0&&B(k)-p&&T(f>32?ne(k+";",n,r,p-1):ne(A(k," ","")+";",n,r,p-2),c);break;case 59:k+=";";default:if(T($=te(k,t,r,l,u,i,s,y,v=[],_=[],p),a),123===b)if(0===u)ee(k,t,$,$,v,a,p,s,_);else switch(99===d&&110===C(k,3)?100:d){case 100:case 108:case 109:case 115:ee(e,$,$,n&&T(te(e,$,$,0,0,i,s,y,i,v=[],p),_),i,_,p,s,n?v:_);break;default:ee(k,$,$,$,[""],_,0,s,_)}}l=u=f=0,m=g=1,y=k="",p=o;break;case 58:p=1+B(k),f=h;default:if(m<1)if(123==b)--m;else if(125==b&&0==m++&&125==j())continue;switch(k+=w(b),b*m){case 38:g=u>0?1:(k+="\f",-1);break;case 44:s[l++]=(B(k)-1)*g,g=1;break;case 64:45===N()&&(k+=L(D())),d=N(),u=p=B(y=k+=U(P())),b++;break;case 45:45===h&&2==B(k)&&(m=0)}}return a}function te(e,t,r,n,i,o,s,c,l,u,p){for(var d=i-1,f=0===i?o:[""],h=W(f),m=0,x=0,g=0;m<n;++m)for(var b=0,y=S(e,d+1,d=v(x=s[m])),w=e;b<h;++b)(w=k(x>0?f[b]+" "+y:A(y,/&\f/g,f[b])))&&(l[g++]=w);return I(e,t,r,0===i?a:c,l,u,p)}function re(e,t,r){return I(e,t,r,i,w(O()),S(e,2,-2),0)}function ne(e,t,r,n){return I(e,t,r,o,S(e,0,n),S(e,n+1,-1),n)}function ie(e,i,a){switch($(e,i)){case 5103:return n+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return n+e+e;case 4789:return r+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return n+e+r+e+t+e+e;case 5936:switch(C(e,i+11)){case 114:return n+e+t+A(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return n+e+t+A(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return n+e+t+A(e,/[svh]\w+-[tblr]{2}/,"lr")+e}case 6828:case 4268:case 2903:return n+e+t+e+e;case 6165:return n+e+t+"flex-"+e+e;case 5187:return n+e+A(e,/(\w+).+(:[^]+)/,n+"box-$1$2"+t+"flex-$1$2")+e;case 5443:return n+e+t+"flex-item-"+A(e,/flex-|-self/g,"")+(M(e,/flex-|baseline/)?"":t+"grid-row-"+A(e,/flex-|-self/g,""))+e;case 4675:return n+e+t+"flex-line-pack"+A(e,/align-content|flex-|-self/g,"")+e;case 5548:return n+e+t+A(e,"shrink","negative")+e;case 5292:return n+e+t+A(e,"basis","preferred-size")+e;case 6060:return n+"box-"+A(e,"-grow","")+n+e+t+A(e,"grow","positive")+e;case 4554:return n+A(e,/([^-])(transform)/g,"$1"+n+"$2")+e;case 6187:return A(A(A(e,/(zoom-|grab)/,n+"$1"),/(image-set)/,n+"$1"),e,"")+e;case 5495:case 3959:return A(e,/(image-set\([^]*)/,n+"$1$`$1");case 4968:return A(A(e,/(.+:)(flex-)?(.*)/,n+"box-pack:$3"+t+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+n+e+e;case 4200:if(!M(e,/flex-|baseline/))return t+"grid-column-align"+S(e,i)+e;break;case 2592:case 3360:return t+A(e,"template-","")+e;case 4384:case 3616:return a&&a.some(function(e,t){return i=t,M(e.props,/grid-\w+-end/)})?~E(e+(a=a[i].value),"span")?e:t+A(e,"-start","")+e+t+"grid-row-span:"+(~E(a,"span")?M(a,/\d+/):+M(a,/\d+/)-+M(e,/\d+/))+";":t+A(e,"-start","")+e;case 4896:case 4128:return a&&a.some(function(e){return M(e.props,/grid-\w+-start/)})?e:t+A(A(e,"-end","-span"),"span ","")+e;case 4095:case 3583:case 4068:case 2532:return A(e,/(.+)-inline(.+)/,n+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(B(e)-1-i>6)switch(C(e,i+1)){case 109:if(45!==C(e,i+4))break;case 102:return A(e,/(.+:)(.+)-([^]+)/,"$1"+n+"$2-$3$1"+r+(108==C(e,i+3)?"$3":"$2-$3"))+e;case 115:return~E(e,"stretch")?ie(A(e,"stretch","fill-available"),i,a)+e:e}break;case 5152:case 5920:return A(e,/(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,function(r,n,i,a,o,s,c){return t+n+":"+i+c+(a?t+n+"-span:"+(o?s:+s-+i)+c:"")+e});case 4949:if(121===C(e,i+6))return A(e,":",":"+n)+e;break;case 6444:switch(C(e,45===C(e,14)?18:11)){case 120:return A(e,/(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,"$1"+n+(45===C(e,14)?"inline-":"")+"box$3$1"+n+"$2$3$1"+t+"$2box$3")+e;case 100:return A(e,":",":"+t)+e}break;case 5719:case 2647:case 2135:case 3927:case 2391:return A(e,"scroll-","scroll-snap-")+e}return e}function ae(e,t){for(var r="",n=W(e),i=0;i<n;i++)r+=t(e[i],i,e,t)||"";return r}function oe(e,t,r,n){switch(e.type){case y:if(e.children.length)break;case l:case o:return e.return=e.return||e.value;case i:return"";case m:return e.return=e.value+"{"+ae(e.children,n)+"}";case a:e.value=e.props.join(",")}return B(r=ae(e.children,n))?e.return=e.value+"{"+r+"}":""}function se(e){var t=W(e);return function(r,n,i,a){for(var o="",s=0;s<t;s++)o+=e[s](r,n,i,a)||"";return o}}function ce(e){return function(t){t.root||(t=t.return)&&e(t)}}function le(e,i,s,c){if(e.length>-1&&!e.return)switch(e.type){case o:return void(e.return=ie(e.value,e.length,s));case m:return ae([q(e,{value:A(e.value,"@","@"+n)})],c);case a:if(e.length)return z(e.props,function(i){switch(M(i,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return ae([q(e,{props:[A(i,/:(read-\w+)/,":"+r+"$1")]})],c);case"::placeholder":return ae([q(e,{props:[A(i,/:(plac\w+)/,":"+n+"input-$1")]}),q(e,{props:[A(i,/:(plac\w+)/,":"+r+"$1")]}),q(e,{props:[A(i,/:(plac\w+)/,t+"input-$1")]})],c)}return""})}}function ue(e){e.type===a&&(e.props=e.props.map(function(t){return z(X(t),function(t,r,n){switch(C(t,0)){case 12:return S(t,1,B(t));case 0:case 40:case 43:case 62:case 126:return t;case 58:"global"===n[++r]&&(n[r]="",n[++r]="\f"+S(n[r],r=1,-1));case 32:return 1===r?"":t;default:switch(r){case 0:return e=t,W(n)>1?"":t;case r=W(n)-1:case 2:return 2===r?t+e+e:t+e;default:return t}}})}))}e.line=1,e.column=1,e.length=0,e.position=0,e.character=0,e.characters="",e.CHARSET=u,e.COMMENT=i,e.COUNTER_STYLE=g,e.DECLARATION=o,e.DOCUMENT=f,e.FONT_FACE=x,e.FONT_FEATURE_VALUES=b,e.IMPORT=l,e.KEYFRAMES=m,e.LAYER=y,e.MEDIA=c,e.MOZ=r,e.MS=t,e.NAMESPACE=h,e.PAGE=s,e.RULESET=a,e.SUPPORTS=d,e.VIEWPORT=p,e.WEBKIT=n,e.abs=v,e.alloc=H,e.append=T,e.assign=_,e.caret=P,e.char=O,e.charat=C,e.combine=z,e.comment=re,e.commenter=J,e.compile=Q,e.copy=q,e.dealloc=Z,e.declaration=ne,e.delimit=L,e.delimiter=V,e.escaping=Y,e.from=w,e.hash=$,e.identifier=U,e.indexof=E,e.match=M,e.middleware=se,e.namespace=ue,e.next=D,e.node=I,e.parse=ee,e.peek=N,e.prefix=ie,e.prefixer=le,e.prev=j,e.replace=A,e.ruleset=te,e.rulesheet=ce,e.serialize=ae,e.sizeof=W,e.slice=K,e.stringify=oe,e.strlen=B,e.substr=S,e.token=R,e.tokenize=X,e.tokenizer=G,e.trim=k,e.whitespace=F,Object.defineProperty(e,"__esModule",{value:!0})})(t.exports);var n=function(e,r,n){for(var i=0,a=0;i=a,a=t.exports.peek(),38===i&&12===a&&(r[n]=1),!t.exports.token(a);)t.exports.next();return t.exports.slice(e,t.exports.position)},i=function(e,r){return t.exports.dealloc(function(e,r){var i=-1,a=44;do{switch(t.exports.token(a)){case 0:38===a&&12===t.exports.peek()&&(r[i]=1),e[i]+=n(t.exports.position-1,r,i);break;case 2:e[i]+=t.exports.delimit(a);break;case 4:if(44===a){e[++i]=58===t.exports.peek()?"&\f":"",r[i]=e[i].length;break}default:e[i]+=t.exports.from(a)}}while(a=t.exports.next());return e}(t.exports.alloc(e),r))},a=new WeakMap,o=function(e){if("rule"===e.type&&e.parent&&!(e.length<1)){for(var t=e.value,r=e.parent,n=e.column===r.column&&e.line===r.line;"rule"!==r.type;)if(!(r=r.parent))return;if((1!==e.props.length||58===t.charCodeAt(0)||a.get(r))&&!n){a.set(e,!0);for(var o=[],s=i(t,o),c=r.props,l=0,u=0;l<s.length;l++)for(var p=0;p<c.length;p++,u++)e.props[u]=o[l]?s[l].replace(/&\f/g,c[p]):c[p]+" "+s[l]}}},s=function(e){if("decl"===e.type){var t=e.value;108===t.charCodeAt(0)&&98===t.charCodeAt(2)&&(e.return="",e.value="")}};function c(e,r){switch(t.exports.hash(e,r)){case 5103:return t.exports.WEBKIT+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return t.exports.WEBKIT+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return t.exports.WEBKIT+e+t.exports.MOZ+e+t.exports.MS+e+e;case 6828:case 4268:return t.exports.WEBKIT+e+t.exports.MS+e+e;case 6165:return t.exports.WEBKIT+e+t.exports.MS+"flex-"+e+e;case 5187:return t.exports.WEBKIT+e+t.exports.replace(e,/(\w+).+(:[^]+)/,t.exports.WEBKIT+"box-$1$2"+t.exports.MS+"flex-$1$2")+e;case 5443:return t.exports.WEBKIT+e+t.exports.MS+"flex-item-"+t.exports.replace(e,/flex-|-self/,"")+e;case 4675:return t.exports.WEBKIT+e+t.exports.MS+"flex-line-pack"+t.exports.replace(e,/align-content|flex-|-self/,"")+e;case 5548:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,"shrink","negative")+e;case 5292:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,"basis","preferred-size")+e;case 6060:return t.exports.WEBKIT+"box-"+t.exports.replace(e,"-grow","")+t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,"grow","positive")+e;case 4554:return t.exports.WEBKIT+t.exports.replace(e,/([^-])(transform)/g,"$1"+t.exports.WEBKIT+"$2")+e;case 6187:return t.exports.replace(t.exports.replace(t.exports.replace(e,/(zoom-|grab)/,t.exports.WEBKIT+"$1"),/(image-set)/,t.exports.WEBKIT+"$1"),e,"")+e;case 5495:case 3959:return t.exports.replace(e,/(image-set\([^]*)/,t.exports.WEBKIT+"$1$`$1");case 4968:return t.exports.replace(t.exports.replace(e,/(.+:)(flex-)?(.*)/,t.exports.WEBKIT+"box-pack:$3"+t.exports.MS+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+t.exports.WEBKIT+e+e;case 4095:case 3583:case 4068:case 2532:return t.exports.replace(e,/(.+)-inline(.+)/,t.exports.WEBKIT+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(t.exports.strlen(e)-1-r>6)switch(t.exports.charat(e,r+1)){case 109:if(45!==t.exports.charat(e,r+4))break;case 102:return t.exports.replace(e,/(.+:)(.+)-([^]+)/,"$1"+t.exports.WEBKIT+"$2-$3$1"+t.exports.MOZ+(108==t.exports.charat(e,r+3)?"$3":"$2-$3"))+e;case 115:return~t.exports.indexof(e,"stretch")?c(t.exports.replace(e,"stretch","fill-available"),r)+e:e}break;case 4949:if(115!==t.exports.charat(e,r+1))break;case 6444:switch(t.exports.charat(e,t.exports.strlen(e)-3-(~t.exports.indexof(e,"!important")&&10))){case 107:return t.exports.replace(e,":",":"+t.exports.WEBKIT)+e;case 101:return t.exports.replace(e,/(.+:)([^;!]+)(;|!.+)?/,"$1"+t.exports.WEBKIT+(45===t.exports.charat(e,14)?"inline-":"")+"box$3$1"+t.exports.WEBKIT+"$2$3$1"+t.exports.MS+"$2box$3")+e}break;case 5936:switch(t.exports.charat(e,r+11)){case 114:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return t.exports.WEBKIT+e+t.exports.MS+t.exports.replace(e,/[svh]\w+-[tblr]{2}/,"lr")+e}return t.exports.WEBKIT+e+t.exports.MS+e+e}return e}var l=[function(e,r,n,i){if(e.length>-1&&!e.return)switch(e.type){case t.exports.DECLARATION:e.return=c(e.value,e.length);break;case t.exports.KEYFRAMES:return t.exports.serialize([t.exports.copy(e,{value:t.exports.replace(e.value,"@","@"+t.exports.WEBKIT)})],i);case t.exports.RULESET:if(e.length)return t.exports.combine(e.props,function(r){switch(t.exports.match(r,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return t.exports.serialize([t.exports.copy(e,{props:[t.exports.replace(r,/:(read-\w+)/,":"+t.exports.MOZ+"$1")]})],i);case"::placeholder":return t.exports.serialize([t.exports.copy(e,{props:[t.exports.replace(r,/:(plac\w+)/,":"+t.exports.WEBKIT+"input-$1")]}),t.exports.copy(e,{props:[t.exports.replace(r,/:(plac\w+)/,":"+t.exports.MOZ+"$1")]}),t.exports.copy(e,{props:[t.exports.replace(r,/:(plac\w+)/,t.exports.MS+"input-$1")]})],i)}return""})}}],u=function(r){var n=r.key;if("css"===n){var i=document.querySelectorAll("style[data-emotion]:not([data-s])");Array.prototype.forEach.call(i,function(e){-1!==e.getAttribute("data-emotion").indexOf(" ")&&(document.head.appendChild(e),e.setAttribute("data-s",""))})}var a,c,u=r.stylisPlugins||l,p={},d=[];a=r.container||document.head,Array.prototype.forEach.call(document.querySelectorAll('style[data-emotion^="'+n+' "]'),function(e){for(var t=e.getAttribute("data-emotion").split(" "),r=1;r<t.length;r++)p[t[r]]=!0;d.push(e)});var f,h=[o,s],m=[t.exports.stringify,t.exports.rulesheet(function(e){f.insert(e)})],x=t.exports.middleware(h.concat(u,m));c=function(e,r,n,i){var a;f=n,a=e?e+"{"+r.styles+"}":r.styles,t.exports.serialize(t.exports.compile(a),x),i&&(g.inserted[r.name]=!0)};var g={key:n,sheet:new e({key:n,container:a,nonce:r.nonce,speedy:r.speedy,prepend:r.prepend,insertionPoint:r.insertionPoint}),nonce:r.nonce,inserted:p,registered:{},insert:c};return g.sheet.hydrate(d),g};var p={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,scale:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},d=/[A-Z]|^ms/g,f=/_EMO_([^_]+?)_([^]*?)_EMO_/g,h=function(e){return 45===e.charCodeAt(1)},m=function(e){return null!=e&&"boolean"!=typeof e},x=r(function(e){return h(e)?e:e.replace(d,"-$&").toLowerCase()}),g=function(e,t){switch(e){case"animation":case"animationName":if("string"==typeof t)return t.replace(f,function(e,t,r){return y={name:t,styles:r,next:y},t})}return 1===p[e]||h(e)||"number"!=typeof t||0===t?t:t+"px"};function b(e,t,r){if(null==r)return"";var n=r;if(void 0!==n.__emotion_styles)return n;switch(typeof r){case"boolean":return"";case"object":var i=r;if(1===i.anim)return y={name:i.name,styles:i.styles,next:y},i.name;var a=r;if(void 0!==a.styles){var o=a.next;if(void 0!==o)for(;void 0!==o;)y={name:o.name,styles:o.styles,next:y},o=o.next;return a.styles+";"}return function(e,t,r){var n="";if(Array.isArray(r))for(var i=0;i<r.length;i++)n+=b(e,t,r[i])+";";else for(var a in r){var o=r[a];if("object"!=typeof o){var s=o;null!=t&&void 0!==t[s]?n+=a+"{"+t[s]+"}":m(s)&&(n+=x(a)+":"+g(a,s)+";")}else if(!Array.isArray(o)||"string"!=typeof o[0]||null!=t&&void 0!==t[o[0]]){var c=b(e,t,o);switch(a){case"animation":case"animationName":n+=x(a)+":"+c+";";break;default:n+=a+"{"+c+"}"}}else for(var l=0;l<o.length;l++)m(o[l])&&(n+=x(a)+":"+g(a,o[l])+";")}return n}(e,t,r);case"function":if(void 0!==e){var s=y,c=r(e);return y=s,b(e,t,c)}}var l=r;if(null==t)return l;var u=t[l];return void 0!==u?u:l}var y,v=/label:\s*([^\s;{]+)\s*(;|$)/g;function w(e,t,r){if(1===e.length&&"object"==typeof e[0]&&null!==e[0]&&void 0!==e[0].styles)return e[0];var n=!0,i="";y=void 0;var a=e[0];null==a||void 0===a.raw?(n=!1,i+=b(r,t,a)):i+=a[0];for(var o=1;o<e.length;o++){if(i+=b(r,t,e[o]),n)i+=a[o]}v.lastIndex=0;for(var s,c="";null!==(s=v.exec(i));)c+="-"+s[1];var l=function(e){for(var t,r=0,n=0,i=e.length;i>=4;++n,i-=4)t=1540483477*(65535&(t=255&e.charCodeAt(n)|(255&e.charCodeAt(++n))<<8|(255&e.charCodeAt(++n))<<16|(255&e.charCodeAt(++n))<<24))+(59797*(t>>>16)<<16),r=1540483477*(65535&(t^=t>>>24))+(59797*(t>>>16)<<16)^1540483477*(65535&r)+(59797*(r>>>16)<<16);switch(i){case 3:r^=(255&e.charCodeAt(n+2))<<16;case 2:r^=(255&e.charCodeAt(n+1))<<8;case 1:r=1540483477*(65535&(r^=255&e.charCodeAt(n)))+(59797*(r>>>16)<<16)}return(((r=1540483477*(65535&(r^=r>>>13))+(59797*(r>>>16)<<16))^r>>>15)>>>0).toString(36)}(i)+c;return{name:l,styles:i,next:y}}function _(e,t,r){var n="";return r.split(" ").forEach(function(r){void 0!==e[r]?t.push(e[r]+";"):r&&(n+=r+" ")}),n}function $(e,t){if(void 0===e.inserted[t.name])return e.insert("",t,e.sheet,!0)}function k(e,t,r){var n=[],i=_(e,n,r);return n.length<2?r:i+t(n)}var M=function e(t){for(var r="",n=0;n<t.length;n++){var i=t[n];if(null!=i){var a=void 0;switch(typeof i){case"boolean":break;case"object":if(Array.isArray(i))a=e(i);else for(var o in a="",i)i[o]&&o&&(a&&(a+=" "),a+=o);break;default:a=i}a&&(r&&(r+=" "),r+=a)}}return r},A=function(e){var t=u(e);t.sheet.speedy=function(e){this.isSpeedy=e},t.compat=!0;var r=function(){for(var e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];var i=w(r,t.registered,void 0);return function(e,t,r){!function(e,t,r){var n=e.key+"-"+t.name;!1===r&&void 0===e.registered[n]&&(e.registered[n]=t.styles)}(e,t,r);var n=e.key+"-"+t.name;if(void 0===e.inserted[t.name]){var i=t;do{e.insert(t===i?"."+n:"",i,e.sheet,!0),i=i.next}while(void 0!==i)}}(t,i,!1),t.key+"-"+i.name};return{css:r,cx:function(){for(var e=arguments.length,n=new Array(e),i=0;i<e;i++)n[i]=arguments[i];return k(t.registered,r,M(n))},injectGlobal:function(){for(var e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];var i=w(r,t.registered);$(t,i)},keyframes:function(){for(var e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];var i=w(r,t.registered),a="animation-"+i.name;return $(t,{name:i.name,styles:"@keyframes "+a+"{"+i.styles+"}"}),a},hydrate:function(e){e.forEach(function(e){t.inserted[e]=!0})},flush:function(){t.registered={},t.inserted={},t.sheet.flush()},sheet:t.sheet,cache:t,getRegisteredStyles:_.bind(null,t.registered),merge:k.bind(null,t.registered,r)}}({key:"css"}),E=A.injectGlobal,C=A.css;const S="#496b54",B="#aabfb2",W=C`
  * {
    color: ${S};
  }
  .layout,
  &.layout {
    margin-bottom: 50px;
    &__headingContainer {
      min-width: 66%;
      max-width: 100%;
      width: 100vmin;
      margin-bottom: 25px;
    }
  }
  h1 {
    margin-top: 0;
    display: inline-block;
    font-size: 2.5rem;
  }
`,T=C`
  align-items: center;
  display: flex;
  /* justify-content: space-between; */
  height: ${"100px"};
  width: 100%;
  > button {
    font-size: 30px;
  }
  button {
    background: transparent;
    border: 1px solid ${S};
    border-radius: 10px;
    outline: none;
    padding: 0.5em 0.75em;
    transition:
      color 0.2s ease-out,
      background 0.2s ease-out,
      transform 0.2s ease-out;
    &:hover,
    &:focus,
    &:active {
      background: ${S};
      color: ${B};
    }
    &:active {
      transform: scale(1.1);
    }
    &:not(:last-of-type) {
      margin-right: 25px;
    }
  }
`,z=C`
  &.product {
    align-items: center;
    box-shadow: 0 10px 30px 0px ${S+"66"};
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    width: 100%;

    * {
      color: ${S};
      font-size: 20px;
      text-align: center;
    }
    > *:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  .product {
    &__imageContainer {
      height: 40vmin;
      width: 100%;
    }

    &__image {
      border-radius: 10px;
      box-shadow: 0 20px 16px -10px ${S+"99"};
      height: 100%;
      object-fit: cover;
      width: 100%;
    }

    &__headingContainer {
      min-height: 13vmin;
    }

    &__likesContainer,
    &__cartContainer {
      width: 100%;
    }

    &__likeBtn {
      align-items: center;
      background: none;
      border: 1px solid ${S};
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      font-size: 1em;
      justify-content: center;
      outline: none;
      padding: 20px;
      width: 100%;
      min-height: 8vh;
    }

    &__thumbsUp {
      display: flex;
      cursor: pointer;
      margin-right: 10px;
      svg {
        fill: ${S};
        max-width: 50px;
        min-width: 25px;
      }
    }

    &__name {
      font-size: 1.5em;
      margin-bottom: 10px;
    }

    &__description {
      font-size: 1em;
    }

    &__priceContainer {
      padding: 5px;
      width: 100%;
    }
    &__price {
      color: ${S};
      font-size: 1.25em;
      font-weight: 700;
      text-decoration: underline;
      width: 100%;
      margin: 0;
    }
  }
`,I=C`
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  grid-gap: 100px 50px;
  width: 100%;
`,q=C`
  &.cart,
  .cart {
    backdrop-filter: blur(15px);
    border: 2px solid ${S};
    border-radius: 20px 0 0 20px;
    height: 100vh;
    position: fixed;
    max-width: 100vw;
    min-width: 300px;
    right: 0;
    top: 0;
    transition: transform 0.3s ease-out;

    &--open {
      transform: translateX(0);
    }

    &--closed {
      transform: translateX(100%);
    }

    &__contentContainer {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    &__controlContainer {
      box-shadow: 0 0 20px 0px ${S};
      border-radius: 17px 0 0 0;
      background: ${S+"cc"};
      backdrop-filter: blur(10px);
      /* opacity: 0.75; */
      text-align: left;
      width: 100%;
    }

    &__control {
      background: none;
      border: none;
      outline: none;
      padding: 15px;
      filter: none;
      transition:
        transform 0.3s ease-out,
        filter 0.3s ease-out;
      transform: translateX(0);
      &:hover,
      &:focus {
        cursor: pointer;
        transform: translateX(-100) scale(1.15);
      }
      &--closed {
        transform: translateX(-100%);
        &:hover {
          transform: translateX(-100%) scale(1.15);
        }
        svg {
          fill: ${S};
        }
      }
      &--open svg {
        fill: ${B};
      }
    }

    svg {
      /* fill: ${B}; */
      transition: fill 0.3s ease-out;
      width: 50px;
    }

    &__items {
      height: calc(100% - 75px);
      position: relative;
      overflow-y: scroll;
    }

    &__recentlyAdded {
      padding: 0 15px;
    }

    &__total {
      color: ${S};
      display: block;
      font-size: 20px;
      font-weight: 400;
      margin-top: 15px;
      padding: 15px;
      position: relative;
      &:before {
        background: ${S};
        content: "";
        position: absolute;
        left: 0;
        height: 2px;
        top: 0;
        width: 75%;
      }
    }

    &__sum {
      font-weight: 700;
    }
  }
`,O=C`
  &.item,
  .item {
    display: flex;
    font-size: 18px;
    list-style: none;
    margin: 15px;
    &__details {
      flex-grow: 1;
    }
    &__imageContainer {
      display: inline-block;
      height: 15vmin;
      margin-right: 15px;
      width: 15vmin;
    }

    &__image {
      /* border: 1px solid ${S}; */
      box-shadow: 0 20px 16px -10px ${S+"99"};
      border-radius: 10px;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }

    &__nameContainer {
      width: 100%;
    }

    &__priceContainer {
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
      background: ${B};
      border: none;
      color: ${S};
      font-weight: 700;
      font-size: 18px;
    }
    &__btn {
      background: ${S};
      border-radius: 5px;
      color: ${B};
      min-width: 30px;
      padding: 3px 5px;
      transition:
        background 0.25s ease-in,
        color 0.25s ease-in;
      &:hover {
        background: ${B};
        color: ${S};
        transition:
          background 0.2s ease-out,
          color 0.2s ease-out;
      }
    }
  }
`,j=C`
  .form {
    display: flex;
    flex-direction: column;
    position: relative;
    &__disclaimer {
      font-weight: 400;
      font-size: 0.75em;
      margin: 2em 0 0;
      text-align: right;
    }
    &__label {
      align-items: center;
      display: flex;
      font-style: italic;
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 0;
      padding-right: 50px;
      position: relative;
      white-space: space nowrap;
      &:after {
        background: ${S};
        border-radius: 1px;
        content: "";
        flex-grow: 1;
        height: 2px;
        width: auto;
        position: relative;
        margin-left: 25px;
      }
    }
  }
  .formInput {
    align-items: center;
    color: ${S};
    display: flex;
    margin-bottom: 10px;
    padding: 10px 0;
    &__labelText {
    }
    &__input {
      background: transparent;
      outline: none;
      border: none;
      border-radius: 5px 0px;
      border-bottom: 1px solid ${S};
      flex-grow: 1;
      padding: 5px 0;
      margin-left: 10px;
      transform: filter 0.2s ease-out;
      &::placeholder {
        color: ${S+"aa"};
      }
      &:not(:placeholder-shown) {
        filter: contrast(200%) brightness(1);
      }
    }
  }
  button[type="submit"] {
    margin-top: 25px;
    align-self: flex-end;
    min-width: 33%;
  }
`,D=C`
  &.modal,
  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    backdrop-filter: blur(10px);
    transition: opacity 0.2s ease-out;
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
      background: ${B};
      border: 1px solid ${S};
      border-radius: 20px;
      box-shadow: 0 10px 30px 0px ${S+"66"};
      max-width: 750px;
      padding: 40px;
      position: relative;
      width: 50vw;
    }
    &__close {
      position: absolute;
      top: 20px;
      right: 20px;
      text-align: center;
      border: none;
      border-radius: 50% !important;
    }
  }
`;function N(e,t,r,n){if("a"===r&&!n)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?n:"a"===r?n.call(e):n?n.value:t.get(e)}function P(e,t,r,n,i){if("m"===n)throw new TypeError("Private method is not writable");if("a"===n&&!i)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!i:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===n?i.call(e,r):i?i.value=r:t.set(e,r),r}var K,R,H,Z,L;E`
  html{line-height:1.15;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,footer,header,nav,section{display:block}h1{font-size:2em;margin:.67em 0}figcaption,figure,main{display:block}figure{margin:1em 40px}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent;-webkit-text-decoration-skip:objects}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}dfn{font-style:italic}mark{background-color:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}audio,video{display:inline-block}audio:not([controls]){display:none;height:0}img{border-style:none}svg:not(:root){overflow:hidden}button,input,optgroup,select,textarea{font-family:sans-serif;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}button,html [type=button],[type=reset],[type=submit]{-webkit-appearance:button}button::-moz-focus-inner,[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner{border-style:none;padding:0}button:-moz-focusring,[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:.35em .75em .625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{display:inline-block;vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details,menu{display:block}summary{display:list-item}canvas{display:inline-block}template{display:none}[hidden]{display:none}

  html {
    font-size: 18px;
    font-family: Arial, Helvetica, sans-serif;
  }

  body {
    margin: 5% 8%;
    background: ${B};
  }

  * {
    box-sizing: border-box;
  }

  ul,ol {
    list-style:none;
    padding: 0;
  }
`,"function"==typeof SuppressedError&&SuppressedError;class X{constructor(e,t,r){K.set(this,void 0),R.set(this,[]),H.set(this,!1),Z.set(this,void 0),L.set(this,void 0),this.key=t,this.value=r,this.id="_"+Math.random().toString(36).slice(2,11),P(this,L,e,"f")}getArrayMethod(e){return Array.isArray(this.value)?this.value[e].bind(this.value):void 0}get map(){return this.getArrayMethod("map")}get filter(){return this.getArrayMethod("filter")}get forEach(){return this.getArrayMethod("forEach")}get find(){return this.getArrayMethod("find")}get reduce(){return this.getArrayMethod("reduce")}get includes(){return this.getArrayMethod("includes")}get indexOf(){return this.getArrayMethod("indexOf")}get slice(){return this.getArrayMethod("slice")}get concat(){return this.getArrayMethod("concat")}get join(){return this.getArrayMethod("join")}get some(){return this.getArrayMethod("some")}get every(){return this.getArrayMethod("every")}get findIndex(){return this.getArrayMethod("findIndex")}get length(){return Array.isArray(this.value)?this.value.length:void 0}update(e){const t=N(this,K,"f")?N(this,K,"f").call(this,e):e;return this.value=t,N(this,H,"f")?P(this,Z,t,"f"):(P(this,H,!0,"f"),P(this,Z,t,"f"),queueMicrotask(()=>{P(this,H,!1,"f");const e=N(this,Z,"f");P(this,Z,void 0,"f"),N(this,R,"f")&&N(this,R,"f").forEach(t=>t(e))})),this}observe(e,t=this){e instanceof Node&&(e=this.nodeObserver(e)),N(this,R,"f").push(e.bind(t))}compute(e){const t=N(this,L,"f").defineProperty(e(this.value));return P(t,K,e,"f"),this.observe(t.update,t),t}nodeObserver(e){let t=this.value;const r=e.parentElement;return n=>{var i;e instanceof Attr?e.value=e.value.replace(t.toString(),n.toString()):Array.isArray(n)?null==r||r.replaceChildren(...n):e.textContent=(null===(i=e.textContent)||void 0===i?void 0:i.replace(t.toString(),n.toString()))||n.toString(),t=n}}}K=new WeakMap,R=new WeakMap,H=new WeakMap,Z=new WeakMap,L=new WeakMap;const F=function(e){if(e)return e;return{ids:[],props:[],defineProperty(e,t){if(e instanceof X){const t=e,{id:r}=t;return this.hasId(r)||(this.props.push(t),this.ids.push(r)),t}const r=null!=t?t:`_auto_${this.props.length}_${Date.now()}`,n=new X(this,r,e);return this.props.push(n),this.ids.push(n.id),n},getPropertyByKey(e){return this.props.find(({key:t})=>t===e)},getPropertyByValue(e){return this.props.find(({value:t})=>t===e)},getPropertyById(e){return this.props.find(({id:t})=>t===e)},hasProperty(e){return this.props.some(t=>t.key===e)},hasId(e){return this.ids.some(t=>t===e)}}},G=(e,t,r)=>t.reduce((t,n,i)=>{const a=null==n?"":n,o=r.defineProperty(a,null==a?void 0:a.key);return[...t,((e,{id:t,value:r})=>{const n=e=>e instanceof Node;if(Array.isArray(r)&&r.every(n)||n(r))return`<del ${t}></del>`})(0,o)||o.id,e[i+1]]},[e[0]]).join(""),Y=e=>{const{id:t,value:r}=e;return n=>{var i;if(null===(i=n.textContent)||void 0===i?void 0:i.includes(t))if(e.observe(n,e),Array.isArray(r))r.forEach(Y(e)),n.textContent=n.textContent.replace(t,"");else if("object"!=typeof r||r instanceof Date){const e=null==r?"":r.toString();n.textContent=n.textContent.replace(t,e)}}},V=e=>{const{attributes:t,childNodes:r}=e,n=Array.from(t),i=Array.from(r).filter(({nodeType:e,textContent:t})=>e===Node.TEXT_NODE&&(null==t?void 0:t.trim())),a=new Set;return t=>{const r=[];n.forEach(n=>{if(!a.has(n))if(n.name.startsWith("on")&&n.value===t.id&&"function"==typeof t.value){a.add(n);const r=n.name.slice(2);e.removeAttribute(n.name);let i=t.value;e.addEventListener(r,i),t.observe(t=>{e.removeEventListener(r,i),"function"==typeof t&&(i=t,e.addEventListener(r,i))})}else r.push(n)}),((e,t)=>{e.forEach(Y(t))})(i,t),((e,t)=>{e.forEach((e=>{const{id:t,value:r}=e;return n=>{(n.value.includes(t)&&"data-id"!==n.name||"string"==typeof r&&"number"==typeof r)&&(e.observe(n,e),n.value=n.value.replace(t,r))}})(t))})(r,t)}},J=(e,t)=>{const r=e.props;r.forEach(((e,t)=>e=>{const{id:r,value:n}=e,i=t.querySelector(`del[${r}]`),a=e=>e instanceof Node,o=Array.isArray(n)&&n.every(a);if(i&&(a(n)||o)){e.observe(i,e);const t=Array.isArray(n)?n:[n];i.replaceWith(...t)}})(0,t));return Array.from(t.querySelectorAll("*")).forEach((e=>t=>e.forEach(V(t)))(r)),t},U=(e,t,r)=>{const n=e=>{var n;return Boolean(e)?t():null!==(n=null==r?void 0:r())&&void 0!==n?n:document.createTextNode("")};if("boolean"==typeof e)return n(e);const i=document.createElement("span");return i.style.display="contents",i.appendChild(n(e.value)),e.observe(e=>{i.replaceChildren(n(e))}),i},Q=function(e,...t){const r=F(),n=G(e,t,r),i=document.createElement("template");i.innerHTML=n;const a=J(r,i.content);return a.collect=function(e){const t=e.querySelectorAll("[ref]");return()=>{const r=e;if(null==r?void 0:r.refs)return r.refs;const n=Array.from(t).reduce((e,t)=>{const r=t.getAttribute("ref");return r&&(e[r]=t),e},{});return r.refs=n,n}}(a),a},ee=new Set(["push","pop","shift","unshift","splice","sort","reverse","fill","copyWithin"]),te=(e,t)=>new Proxy(e,{get(e,r){if("string"==typeof r&&ee.has(r))return(...n)=>{const i=e[r](...n);return t.update([...e]),i};const n=Reflect.get(e,r);return"function"==typeof n?n.bind(e):n}}),re=function(e){const t=F();e={...e};const r=new Map;for(const t in e){const n=e[t];"function"==typeof n&&(r.set(t,n),delete e[t])}let n,i=!1;const a={get(e,i){if("symbol"==typeof i)return;const a="$"===i[0],o=a?i.replace("$",""):i;if(r.has(o)){const e=r.get(o);let i=t.getPropertyByKey(o);if(i){const t=e(n);i.value=t}else{const r=e(n);i=t.defineProperty(r,o),i.__computeFn=e,i.__proxyRef=n}return a?i:i.value}if(!(o in e))return;const s=Reflect.get(e,o),c=s instanceof X,l=t.defineProperty(s,o);if(Reflect.set(e,o,l),a)return l;if(c){const e=Reflect.get(s,"value");return Array.isArray(e)?te(e,s):e}if(Array.isArray(s))return te(s,l);if("object"==typeof s&&null!==s&&!(s instanceof Node)){const t=new Proxy(s,this);return Reflect.set(e,o,t),t}return s},set(e,a,o){if("symbol"==typeof a)return!1;if(r.has(a))throw new Error(`Cannot set computed property "${a}". Computed properties are read-only.`);const s=t.getPropertyByKey(a);if(!s)return Reflect.set(e,a,o),!0;if(s.update(o),!i){s.update&&queueMicrotask(()=>{i=!0;try{r.forEach((e,r)=>{const i=t.getPropertyByKey(r);if(i)try{const t=e(n);i.update(t)}catch(e){}})}finally{i=!1}})}return!!s}},o=new Proxy(e,a);return n=o,o},ne="cart",ie={total:0,items:JSON.parse(localStorage.getItem(ne))||[],subscribers:[],subscribe(e){this.notify(),this.subscribers.push(e)},notify(){this.subscribers.forEach(e=>e(this.items))},addItem(e){const t=this.getAll();let r=t.find(({id:t})=>t===e);r?r.quantity++:(r=ae.find(({id:t})=>t===e),r.quantity=1,t.push(r)),r&&this.updateCart(t)},removeItem(e){const t=this.getAll();let r=t.find(({id:t})=>t===e);r&&(r.quantity--,this.updateCart(t.filter(({quantity:e})=>e)))},getItem(e){return this.getAll().find(({id:t})=>t===e)},updateCart(e){localStorage.setItem(ne,JSON.stringify(e)),this.getAll(),this.notify()},getAll(){let e=localStorage.getItem(ne);return e||localStorage.setItem(ne,JSON.stringify(this.items)),this.items=JSON.parse(e),this.items},removeAll:()=>localStorage.setItem(ne,JSON.stringify([]))};ie.getAll();const ae=[{id:201,name:"Nulla",price:207,description:"Culpa sed tenetur incidunt quia veniam sed molliti",likes:78,quantity:0,image:"https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:202,name:"Corporis",price:271,description:"Nam incidunt blanditiis odio inventore. Nobis volu",likes:67,quantity:0,image:"https://images.unsplash.com/photo-1547514701-42782101795e?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:203,name:"Minus",price:295,description:"Quod reiciendis aspernatur ipsum cum debitis. Quis",likes:116,quantity:0,image:"https://images.unsplash.com/photo-1591287083773-9a52ba8184a4?ixid=MXwxMjA3fDB8MHxzZWFyY2h8N3x8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:204,name:"Qui",price:280,description:"Occaecati dolore assumenda facilis error quaerat. ",likes:78,quantity:0,image:"https://images.unsplash.com/photo-1528825871115-3581a5387919?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OHx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:209,name:"Similique",price:262,description:"Autem blanditiis similique saepe excepturi at erro",likes:44,quantity:0,image:"https://images.unsplash.com/photo-1552089123-2d26226fc2b7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OXx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:220,name:"Soluta",price:109,description:"Quos accusamus distinctio voluptates ducimus neque",likes:34,quantity:0,image:"https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTV8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:223,name:"Quos",price:247,description:"Error voluptate recusandae reiciendis adipisci nec",likes:188,quantity:0,image:"https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTl8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:224,name:"Sunt",price:297,description:"Tempora sed explicabo quae recusandae vitae debiti",likes:63,quantity:0,image:"https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MjR8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:225,name:"Nemo",price:143,description:"Id pariatur at modi esse distinctio error. Dolores",likes:116,quantity:0,image:"https://images.unsplash.com/photo-1439127989242-c3749a012eac?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MzB8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:226,name:"Quo",price:150,description:"Explicabo distinctio labore eius. Culpa provident ",likes:157,quantity:0,image:"https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NDl8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:227,name:"Nobis",price:195,description:"Reprehenderit iste quos amet. Natus consequatur in",likes:30,quantity:0,image:"https://images.unsplash.com/photo-1560155016-bd4879ae8f21?ixid=MXwxMjA3fDB8MHxzZWFyY2h8M3x8YXZvY2Fkb3xlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:228,name:"Explicabo",price:253,description:"Nihil magni libero sapiente voluptate. Perspiciati",likes:11,quantity:0,image:"https://images.unsplash.com/photo-1587324438673-56c78a866b15?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8bGVtb258ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"}],oe=e=>{const t=re(e),{$image:r,$name:n,$price:i,$likes:a,$description:o}=t;return Q`
    <div class="${z} product">
      <div class="product__imageContainer">
        <img class="product__image" src="${r}" alt="${n}" />
      </div>
      <div class="product__headingContainer">
        <h3 class="product__name">${n}</h3>
        <p class="product__description">${o}</p>
      </div>
      <div class="product__priceContainer">
        <h4 class="product__price">$${i}</h4>
      </div>
      <div class="product__likesContainer">
        <button onclick=${()=>t.likes+=1} class="product__likeBtn">
          <span class="product__thumbsUp"> ${Q`<svg
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
          <span>${a}</span>
        </button>
      </div>

      <div class="product__cartContainer">
        <button
          onclick=${()=>ie.addItem(e.id)}
          class="product__likeBtn"
        >
          Add To Cart
        </button>
      </div>
    </div>
  `},se=e=>{const t=re(e),{$id:r,$image:n,$name:i,$quantity:a,quantity:o,price:s}=t;return Q`
    <li class="item ${O}" data-id="${r}">
      <div class="item__imageContainer">
        <img class="item__image" src="${n}" alt="${i}" />
      </div>
      <div class="item__details">
        <div class="item__nameContainer">
          <p>${i}</p>
        </div>
        <div class="item__quantityContainer">
          <button
            onclick=${()=>ie.removeItem(t.id)}
            class="item__quantity item__quantity--minus item__btn"
          >
            -
          </button>
          <p class="item__quantity">${a}</p>
          <button
            onclick=${()=>ie.addItem(t.id)}
            class="item__quantity item__quantity--plus item__btn"
          >
            +
          </button>
        </div>
        <div class="item__priceContainer">
          <p>Price: $${s*o}</p>
        </div>
      </div>
    </li>
  `},ce=e=>e.reduce((e,t)=>(t.price&&(e+=t.price*t.quantity),e),0),le=e=>{const t=re({items:e,isOpen:!1,total:ce(ie.getAll()),recentlyAdded:[]}),{$isOpen:r,$items:n,$total:i,$recentlyAdded:a}=t,o=r.compute(e=>e?"open":"closed"),s=n.compute(e=>e.map(se)),c=a.compute(e=>e.length>0),l=a.compute(e=>{var t;return null!==(t=e[e.length-1])&&void 0!==t?t:""}),u=Q`
    <div ref="cartContainer" class="${q} cart cart--${o}">
      <div class="cart__contentContainer">
        <div class="cart__controlContainer">
          <button
            onclick=${()=>{t.isOpen=!t.isOpen}}
            class="cart__control cart__control--${o}"
          >
            ${Q`
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
          ${s}
        </ul>
        ${U(c,()=>Q`
            <p class="cart__recentlyAdded">Last added: ${l}</p>
          `)}
        <div class="cart__total">
          Total: <span class="cart__sum">$${i}</span>
        </div>
      </div>
    </div>
  `;return ie.subscribe(e=>{const r=new Set(t.items.map(e=>e.id));e.filter(e=>!r.has(e.id)&&e.quantity>0).forEach(e=>t.recentlyAdded.push(e.name)),t.items=e,t.total=ce(e)}),u},ue=(e={label:"",name:"",placeholder:"",autocomplete:!1})=>{var t,r,n;return Q` <div class="form__item">
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
  </div>`},pe=[{label:"Name:",name:"name"},{label:"Email:",name:"email"},{label:"Industry:",name:"industry"},{label:"Reason for inquiry:",name:"subject"}],de=e=>{const t=Q`
    <div class="${j}">
      <h2 id="form_label" class="form__label">Get in touch</h2>
      <form class="form" ref="form">
        ${pe.map(ue)}
        <button ref="submitBtn" type="submit">Submit</button>
      </form>
      <h3 class="form__disclaimer">❗️Uhhh... this isn't an actual form.</h3>
    </div>
  `,{form:r}=t.collect();return null==r||r.addEventListener("submit",e=>{e.preventDefault(),new FormData(e.target)}),t},fe=Object.freeze({BACKSPACE:8,TAB:9,ESCAPE:27}),he=(...e)=>Q`
    <div class="${W} layout">
      <div class="layout__headingContainer">
        <marquee behavior="alternate">
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
        </marquee>
        <p>
          Pickled intelligentsia butcher palo santo. Brooklyn narwhal small
          batch, hoodie echo park chia tofu. Fingerstache celiac bicycle rights,
          poke plaid locavore roof party neutra cronut. Hella cloud bread shabby
          chic, you probably haven't heard of them cornhole pok pok pop-up wolf
          neutra 90's drinking vinegar
        </p>
      </div>
      ${e}
    </div>
    <footer class="${W} ${T}">
      ${(e=>{const t=re({isOpen:!1,...e});let r=!1;const{$isOpen:n}=t,i=Q` <button class="footer__contact" ref="modalBtn">
      ${t.$openBtn}
    </button>
    <div
      ref="modal"
      role="modal"
      id="modal"
      aria-labelledby="modal_label"
      aria-modal="true"
      aria-hidden="${!t.$isOpen}"
      class="${D} modal modal__open--${n}"
    >
      <div ref="modalContent" class="modal__content">
        <button ref="closeBtn" class="modal__close">✕</button>
        ${t.$content}
      </div>
    </div>`,{modal:a,modalBtn:o,modalContent:s,submitBtn:c,closeBtn:l}=i.collect(),u=(e=!1)=>{t.isOpen=e};return a.addEventListener("click",e=>{r=!1,e.target instanceof Node&&e.target===a&&!s.contains(e.target)&&u(!1)}),o.addEventListener("click",()=>{u(!t.isOpen)}),null==l||l.addEventListener("click",()=>{u(!1)}),document.addEventListener("keyup",e=>{r=!0,(e.which||e.keyCode)===fe.ESCAPE&&t.isOpen&&(t.isOpen=!1,e.stopPropagation())}),s.addEventListener("focusout",e=>{r&&e.relatedTarget instanceof Node&&!s.contains(e.relatedTarget)&&l.focus()}),i})({openBtn:"💌",content:de()})}
      ${(({text:e,target:t})=>{const r=re({text:e}),n=Q` <button ref="jumpLink">${r.text}</button> `,{jumpLink:i}=n.collect();return null==i||i.addEventListener("click",()=>t.scrollIntoView({behavior:"smooth"})),n.viewModel=r,n})({text:"⬆️",target:document.firstElementChild})}
    </footer>
  `;document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("root");if(!e)throw new Error("Could not find element with id 'root'");const t=le(ie.items),r=(e=>Q`
    <div class="productGrid ${I}">${e.map(oe)}</div>
  `)(ae),n=he(t,r);e.append(n)})});
//# sourceMappingURL=index.js.map
