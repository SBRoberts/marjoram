!function(e,t){e&&!e.getElementById("livereloadscript")&&((t=e.createElement("script")).async=1,t.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",t.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(t))}(self.document),function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";!function(){const e={};try{if(process)return process.env=Object.assign({},process.env),void Object.assign(process.env,e)}catch(e){}globalThis.process={env:e}}();var e=function(){function e(e){var t=this;this._insertTag=function(e){var n;n=0===t.tags.length?t.prepend?t.container.firstChild:t.before:t.tags[t.tags.length-1].nextSibling,t.container.insertBefore(e,n),t.tags.push(e)},this.isSpeedy=void 0===e.speedy?"production"===process.env.NODE_ENV:e.speedy,this.tags=[],this.ctr=0,this.nonce=e.nonce,this.key=e.key,this.container=e.container,this.prepend=e.prepend,this.before=null}var t=e.prototype;return t.hydrate=function(e){e.forEach(this._insertTag)},t.insert=function(e){this.ctr%(this.isSpeedy?65e3:1)==0&&this._insertTag(function(e){var t=document.createElement("style");return t.setAttribute("data-emotion",e.key),void 0!==e.nonce&&t.setAttribute("nonce",e.nonce),t.appendChild(document.createTextNode("")),t.setAttribute("data-s",""),t}(this));var t=this.tags[this.tags.length-1];if("production"!==process.env.NODE_ENV){var n=64===e.charCodeAt(0)&&105===e.charCodeAt(1);n&&this._alreadyInsertedOrderInsensitiveRule&&console.error("You're attempting to insert the following rule:\n"+e+"\n\n`@import` rules must be before all other types of rules in a stylesheet but other rules have already been inserted. Please ensure that `@import` rules are before all other rules."),this._alreadyInsertedOrderInsensitiveRule=this._alreadyInsertedOrderInsensitiveRule||!n}if(this.isSpeedy){var r=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]}(t);try{r.insertRule(e,r.cssRules.length)}catch(t){"production"===process.env.NODE_ENV||/:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear){/.test(e)||console.error('There was a problem inserting the following rule: "'+e+'"',t)}}else t.appendChild(document.createTextNode(e));this.ctr++},t.flush=function(){this.tags.forEach((function(e){return e.parentNode.removeChild(e)})),this.tags=[],this.ctr=0,"production"!==process.env.NODE_ENV&&(this._alreadyInsertedOrderInsensitiveRule=!1)},e}(),t="-ms-",n="-moz-",r="-webkit-",i="comm",o="rule",a="decl",s=Math.abs,c=String.fromCharCode;function l(e){return e.trim()}function u(e,t,n){return e.replace(t,n)}function d(e,t){return e.indexOf(t)}function p(e,t){return 0|e.charCodeAt(t)}function f(e,t,n){return e.slice(t,n)}function m(e){return e.length}function h(e){return e.length}function b(e,t){return t.push(e),e}var g=1,v=1,y=0,x=0,w=0,_="";function k(e,t,n,r,i,o,a){return{value:e,root:t,parent:n,type:r,props:i,children:o,line:g,column:v,length:a,return:""}}function $(e,t,n){return k(e,t.root,t.parent,n,t.props,t.children,0)}function E(){return w=x>0?p(_,--x):0,v--,10===w&&(v=1,g--),w}function C(){return w=x<y?p(_,x++):0,v++,10===w&&(v=1,g++),w}function A(){return p(_,x)}function N(){return x}function M(e,t){return f(_,e,t)}function O(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function S(e){return g=v=1,y=m(_=e),x=0,[]}function z(e){return _="",e}function D(e){return l(M(x-1,j(91===e?e+2:40===e?e+1:e)))}function q(e){for(;(w=A())&&w<33;)C();return O(e)>2||O(w)>3?"":" "}function B(e,t){for(;--t&&C()&&!(w<48||w>102||w>57&&w<65||w>70&&w<97););return M(e,N()+(t<6&&32==A()&&32==C()))}function j(e){for(;C();)switch(w){case e:return x;case 34:case 39:return j(34===e||39===e?e:w);case 40:41===e&&j(e);break;case 92:C()}return x}function I(e,t){for(;C()&&e+w!==57&&(e+w!==84||47!==A()););return"/*"+M(t,x-1)+"*"+c(47===e?e:C())}function W(e){for(;!O(A());)C();return M(e,x)}function H(e){return z(T("",null,null,null,[""],e=S(e),0,[0],e))}function T(e,t,n,r,i,o,a,s,l){for(var d=0,p=0,f=a,h=0,g=0,v=0,y=1,x=1,w=1,_=0,k="",$=i,M=o,O=r,S=k;x;)switch(v=_,_=C()){case 34:case 39:case 91:case 40:S+=D(_);break;case 9:case 10:case 13:case 32:S+=q(v);break;case 92:S+=B(N()-1,7);continue;case 47:switch(A()){case 42:case 47:b(P(I(C(),N()),t,n),l);break;default:S+="/"}break;case 123*y:s[d++]=m(S)*w;case 125*y:case 59:case 0:switch(_){case 0:case 125:x=0;case 59+p:g>0&&m(S)-f&&b(g>32?Z(S+";",r,n,f-1):Z(u(S," ","")+";",r,n,f-2),l);break;case 59:S+=";";default:if(b(O=V(S,t,n,d,p,i,s,k,$=[],M=[],f),o),123===_)if(0===p)T(S,t,O,O,$,o,f,s,M);else switch(h){case 100:case 109:case 115:T(e,O,O,r&&b(V(e,O,O,0,0,i,s,k,i,$=[],f),M),i,M,f,s,r?$:M);break;default:T(S,O,O,O,[""],M,f,s,M)}}d=p=g=0,y=w=1,k=S="",f=a;break;case 58:f=1+m(S),g=v;default:if(y<1)if(123==_)--y;else if(125==_&&0==y++&&125==E())continue;switch(S+=c(_),_*y){case 38:w=p>0?1:(S+="\f",-1);break;case 44:s[d++]=(m(S)-1)*w,w=1;break;case 64:45===A()&&(S+=D(C())),h=A(),p=m(k=S+=W(N())),_++;break;case 45:45===v&&2==m(S)&&(y=0)}}return o}function V(e,t,n,r,i,a,c,d,p,m,b){for(var g=i-1,v=0===i?a:[""],y=h(v),x=0,w=0,_=0;x<r;++x)for(var $=0,E=f(e,g+1,g=s(w=c[x])),C=e;$<y;++$)(C=l(w>0?v[$]+" "+E:u(E,/&\f/g,v[$])))&&(p[_++]=C);return k(e,t,n,0===i?o:d,p,m,b)}function P(e,t,n){return k(e,t,n,i,c(w),f(e,2,-2),0)}function Z(e,t,n,r){return k(e,t,n,a,f(e,0,r),f(e,r+1,-1),r)}function R(e,i){switch(function(e,t){return(((t<<2^p(e,0))<<2^p(e,1))<<2^p(e,2))<<2^p(e,3)}(e,i)){case 5103:return r+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return r+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return r+e+n+e+t+e+e;case 6828:case 4268:return r+e+t+e+e;case 6165:return r+e+t+"flex-"+e+e;case 5187:return r+e+u(e,/(\w+).+(:[^]+)/,r+"box-$1$2"+t+"flex-$1$2")+e;case 5443:return r+e+t+"flex-item-"+u(e,/flex-|-self/,"")+e;case 4675:return r+e+t+"flex-line-pack"+u(e,/align-content|flex-|-self/,"")+e;case 5548:return r+e+t+u(e,"shrink","negative")+e;case 5292:return r+e+t+u(e,"basis","preferred-size")+e;case 6060:return r+"box-"+u(e,"-grow","")+r+e+t+u(e,"grow","positive")+e;case 4554:return r+u(e,/([^-])(transform)/g,"$1"+r+"$2")+e;case 6187:return u(u(u(e,/(zoom-|grab)/,r+"$1"),/(image-set)/,r+"$1"),e,"")+e;case 5495:case 3959:return u(e,/(image-set\([^]*)/,r+"$1$`$1");case 4968:return u(u(e,/(.+:)(flex-)?(.*)/,r+"box-pack:$3"+t+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+r+e+e;case 4095:case 3583:case 4068:case 2532:return u(e,/(.+)-inline(.+)/,r+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(m(e)-1-i>6)switch(p(e,i+1)){case 109:if(45!==p(e,i+4))break;case 102:return u(e,/(.+:)(.+)-([^]+)/,"$1"+r+"$2-$3$1"+n+(108==p(e,i+3)?"$3":"$2-$3"))+e;case 115:return~d(e,"stretch")?R(u(e,"stretch","fill-available"),i)+e:e}break;case 4949:if(115!==p(e,i+1))break;case 6444:switch(p(e,m(e)-3-(~d(e,"!important")&&10))){case 107:return u(e,":",":"+r)+e;case 101:return u(e,/(.+:)([^;!]+)(;|!.+)?/,"$1"+r+(45===p(e,14)?"inline-":"")+"box$3$1"+r+"$2$3$1"+t+"$2box$3")+e}break;case 5936:switch(p(e,i+11)){case 114:return r+e+t+u(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return r+e+t+u(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return r+e+t+u(e,/[svh]\w+-[tblr]{2}/,"lr")+e}return r+e+t+e+e}return e}function L(e,t){for(var n="",r=h(e),i=0;i<r;i++)n+=t(e[i],i,e,t)||"";return n}function X(e,t,n,r){switch(e.type){case"@import":case a:return e.return=e.return||e.value;case i:return"";case o:e.value=e.props.join(",")}return m(n=L(e.children,r))?e.return=e.value+"{"+n+"}":""}function G(e){var t=h(e);return function(n,r,i,o){for(var a="",s=0;s<t;s++)a+=e[s](n,r,i,o)||"";return a}}function Y(e){return function(t){t.root||(t=t.return)&&e(t)}}function F(e){var t=Object.create(null);return function(n){return void 0===t[n]&&(t[n]=e(n)),t[n]}}var J,U,Q=function(e,t){return z(function(e,t){var n=-1,r=44;do{switch(O(r)){case 0:38===r&&12===A()&&(t[n]=1),e[n]+=W(x-1);break;case 2:e[n]+=D(r);break;case 4:if(44===r){e[++n]=58===A()?"&\f":"",t[n]=e[n].length;break}default:e[n]+=c(r)}}while(r=C());return e}(S(e),t))},K=new WeakMap,ee=function(e){if("rule"===e.type&&e.parent&&e.length){for(var t=e.value,n=e.parent,r=e.column===n.column&&e.line===n.line;"rule"!==n.type;)if(!(n=n.parent))return;if((1!==e.props.length||58===t.charCodeAt(0)||K.get(n))&&!r){K.set(e,!0);for(var i=[],o=Q(t,i),a=n.props,s=0,c=0;s<o.length;s++)for(var l=0;l<a.length;l++,c++)e.props[c]=i[s]?o[s].replace(/&\f/g,a[l]):a[l]+" "+o[s]}}},te=function(e){if("decl"===e.type){var t=e.value;108===t.charCodeAt(0)&&98===t.charCodeAt(2)&&(e.return="",e.value="")}},ne=function(e){return 105===e.type.charCodeAt(1)&&64===e.type.charCodeAt(0)},re=function(e){e.type="",e.value="",e.return="",e.children="",e.props=""},ie=function(e,t,n){ne(e)&&(e.parent?(console.error("`@import` rules can't be nested inside other rules. Please move it to the top level and put it before regular rules. Keep in mind that they can only be used within global styles."),re(e)):function(e,t){for(var n=e-1;n>=0;n--)if(!ne(t[n]))return!0;return!1}(t,n)&&(console.error("`@import` rules can't be after other rules. Please put your `@import` rules before your other rules."),re(e)))},oe="undefined"!=typeof document,ae=oe?void 0:(J=function(){return F((function(){var e={};return function(t){return e[t]}}))},U=new WeakMap,function(e){if(U.has(e))return U.get(e);var t=J(e);return U.set(e,t),t}),se=[function(e,n,i,s){if(!e.return)switch(e.type){case a:e.return=R(e.value,e.length);break;case"@keyframes":return L([$(u(e.value,"@","@"+r),e,"")],s);case o:if(e.length)return function(e,t){return e.map(t).join("")}(e.props,(function(n){switch(function(e,t){return(e=t.exec(e))?e[0]:e}(n,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return L([$(u(n,/:(read-\w+)/,":-moz-$1"),e,"")],s);case"::placeholder":return L([$(u(n,/:(plac\w+)/,":"+r+"input-$1"),e,""),$(u(n,/:(plac\w+)/,":-moz-$1"),e,""),$(u(n,/:(plac\w+)/,t+"input-$1"),e,"")],s)}return""}))}}],ce=function(t){var n=t.key;if("production"!==process.env.NODE_ENV&&!n)throw new Error("You have to configure `key` for your cache. Please make sure it's unique (and not equal to 'css') as it's used for linking styles to your cache.\nIf multiple caches share the same key they might \"fight\" for each other's style elements.");if(oe&&"css"===n){var r=document.querySelectorAll("style[data-emotion]:not([data-s])");Array.prototype.forEach.call(r,(function(e){-1!==e.getAttribute("data-emotion").indexOf(" ")&&(document.head.appendChild(e),e.setAttribute("data-s",""))}))}var o=t.stylisPlugins||se;if("production"!==process.env.NODE_ENV&&/[^a-z-]/.test(n))throw new Error('Emotion key must only contain lower case alphabetical characters and - but "'+n+'" was passed');var a,s,c={},l=[];oe&&(a=t.container||document.head,Array.prototype.forEach.call(document.querySelectorAll('style[data-emotion^="'+n+' "]'),(function(e){for(var t=e.getAttribute("data-emotion").split(" "),n=1;n<t.length;n++)c[t[n]]=!0;l.push(e)})));var u=[ee,te];if("production"!==process.env.NODE_ENV&&u.push(function(e){return function(t,n,r){if("rule"===t.type){var i,o=t.value.match(/(:first|:nth|:nth-last)-child/g);if(o&&!0!==e.compat){var a=n>0?r[n-1]:null;if(a&&function(e){return!!e&&"comm"===e.type&&e.children.indexOf("emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason")>-1}((i=a.children).length?i[i.length-1]:null))return;o.forEach((function(e){console.error('The pseudo class "'+e+'" is potentially unsafe when doing server-side rendering. Try changing it to "'+e.split("-child")[0]+'-of-type".')}))}}}}({get compat(){return v.compat}}),ie),oe){var d,p=[X,"production"!==process.env.NODE_ENV?function(e){e.root||(e.return?d.insert(e.return):e.value&&e.type!==i&&d.insert(e.value+"{}"))}:Y((function(e){d.insert(e)}))],f=G(u.concat(o,p));s=function(e,t,n,r){d=n,"production"!==process.env.NODE_ENV&&void 0!==t.map&&(d={insert:function(e){n.insert(e+t.map)}}),L(H(e?e+"{"+t.styles+"}":t.styles),f),r&&(v.inserted[t.name]=!0)}}else{var m=[X],h=G(u.concat(o,m)),b=ae(o)(n),g=function(e,t){var n=t.name;return void 0===b[n]&&(b[n]=L(H(e?e+"{"+t.styles+"}":t.styles),h)),b[n]};s=function(e,t,n,r){var i=t.name,o=g(e,t);return void 0===v.compat?(r&&(v.inserted[i]=!0),"development"===process.env.NODE_ENV&&void 0!==t.map?o+t.map:o):r?void(v.inserted[i]=o):o}}var v={key:n,sheet:new e({key:n,container:a,nonce:t.nonce,speedy:t.speedy,prepend:t.prepend}),nonce:t.nonce,inserted:c,registered:{},insert:s};return v.sheet.hydrate(l),v};var le={animationIterationCount:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},ue="You have illegal escape sequence in your template literal, most likely inside content's property value.\nBecause you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \"content: '\\00d7';\" should become \"content: '\\\\00d7';\".\nYou can read more about this here:\nhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences",de="You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).",pe=/[A-Z]|^ms/g,fe=/_EMO_([^_]+?)_([^]*?)_EMO_/g,me=function(e){return 45===e.charCodeAt(1)},he=function(e){return null!=e&&"boolean"!=typeof e},be=F((function(e){return me(e)?e:e.replace(pe,"-$&").toLowerCase()})),ge=function(e,t){switch(e){case"animation":case"animationName":if("string"==typeof t)return t.replace(fe,(function(e,t,n){return Ce={name:t,styles:n,next:Ce},t}))}return 1===le[e]||me(e)||"number"!=typeof t||0===t?t:t+"px"};if("production"!==process.env.NODE_ENV){var ve=/(attr|counters?|url|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/,ye=["normal","none","initial","inherit","unset"],xe=ge,we=/^-ms-/,_e=/-(.)/g,ke={};ge=function(e,t){if("content"===e&&("string"!=typeof t||-1===ye.indexOf(t)&&!ve.test(t)&&(t.charAt(0)!==t.charAt(t.length-1)||'"'!==t.charAt(0)&&"'"!==t.charAt(0))))throw new Error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\""+t+"\"'`");var n=xe(e,t);return""===n||me(e)||-1===e.indexOf("-")||void 0!==ke[e]||(ke[e]=!0,console.error("Using kebab-case for css properties in objects is not supported. Did you mean "+e.replace(we,"ms-").replace(_e,(function(e,t){return t.toUpperCase()}))+"?")),n}}function $e(e,t,n){if(null==n)return"";if(void 0!==n.__emotion_styles){if("production"!==process.env.NODE_ENV&&"NO_COMPONENT_SELECTOR"===n.toString())throw new Error("Component selectors can only be used in conjunction with @emotion/babel-plugin.");return n}switch(typeof n){case"boolean":return"";case"object":if(1===n.anim)return Ce={name:n.name,styles:n.styles,next:Ce},n.name;if(void 0!==n.styles){var r=n.next;if(void 0!==r)for(;void 0!==r;)Ce={name:r.name,styles:r.styles,next:Ce},r=r.next;var i=n.styles+";";return"production"!==process.env.NODE_ENV&&void 0!==n.map&&(i+=n.map),i}return function(e,t,n){var r="";if(Array.isArray(n))for(var i=0;i<n.length;i++)r+=$e(e,t,n[i])+";";else for(var o in n){var a=n[o];if("object"!=typeof a)null!=t&&void 0!==t[a]?r+=o+"{"+t[a]+"}":he(a)&&(r+=be(o)+":"+ge(o,a)+";");else{if("NO_COMPONENT_SELECTOR"===o&&"production"!==process.env.NODE_ENV)throw new Error("Component selectors can only be used in conjunction with @emotion/babel-plugin.");if(!Array.isArray(a)||"string"!=typeof a[0]||null!=t&&void 0!==t[a[0]]){var s=$e(e,t,a);switch(o){case"animation":case"animationName":r+=be(o)+":"+s+";";break;default:"production"!==process.env.NODE_ENV&&"undefined"===o&&console.error(de),r+=o+"{"+s+"}"}}else for(var c=0;c<a.length;c++)he(a[c])&&(r+=be(o)+":"+ge(o,a[c])+";")}}return r}(e,t,n);case"function":if(void 0!==e){var o=Ce,a=n(e);return Ce=o,$e(e,t,a)}"production"!==process.env.NODE_ENV&&console.error("Functions that are interpolated in css calls will be stringified.\nIf you want to have a css call based on props, create a function that returns a css call like this\nlet dynamicStyle = (props) => css`color: ${props.color}`\nIt can be called directly with props or interpolated in a styled call like this\nlet SomeComponent = styled('div')`${dynamicStyle}`");break;case"string":if("production"!==process.env.NODE_ENV){var s=[],c=n.replace(fe,(function(e,t,n){var r="animation"+s.length;return s.push("const "+r+" = keyframes`"+n.replace(/^@keyframes animation-\w+/,"")+"`"),"${"+r+"}"}));s.length&&console.error("`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\nInstead of doing this:\n\n"+[].concat(s,["`"+c+"`"]).join("\n")+"\n\nYou should wrap it with `css` like this:\n\ncss`"+c+"`")}}if(null==t)return n;var l=t[n];return void 0!==l?l:n}var Ee,Ce,Ae=/label:\s*([^\s;\n{]+)\s*(;|$)/g;"production"!==process.env.NODE_ENV&&(Ee=/\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//g);var Ne=function(e,t,n){if(1===e.length&&"object"==typeof e[0]&&null!==e[0]&&void 0!==e[0].styles)return e[0];var r=!0,i="";Ce=void 0;var o,a=e[0];null==a||void 0===a.raw?(r=!1,i+=$e(n,t,a)):("production"!==process.env.NODE_ENV&&void 0===a[0]&&console.error(ue),i+=a[0]);for(var s=1;s<e.length;s++)i+=$e(n,t,e[s]),r&&("production"!==process.env.NODE_ENV&&void 0===a[s]&&console.error(ue),i+=a[s]);"production"!==process.env.NODE_ENV&&(i=i.replace(Ee,(function(e){return o=e,""}))),Ae.lastIndex=0;for(var c,l="";null!==(c=Ae.exec(i));)l+="-"+c[1];var u=function(e){for(var t,n=0,r=0,i=e.length;i>=4;++r,i-=4)t=1540483477*(65535&(t=255&e.charCodeAt(r)|(255&e.charCodeAt(++r))<<8|(255&e.charCodeAt(++r))<<16|(255&e.charCodeAt(++r))<<24))+(59797*(t>>>16)<<16),n=1540483477*(65535&(t^=t>>>24))+(59797*(t>>>16)<<16)^1540483477*(65535&n)+(59797*(n>>>16)<<16);switch(i){case 3:n^=(255&e.charCodeAt(r+2))<<16;case 2:n^=(255&e.charCodeAt(r+1))<<8;case 1:n=1540483477*(65535&(n^=255&e.charCodeAt(r)))+(59797*(n>>>16)<<16)}return(((n=1540483477*(65535&(n^=n>>>13))+(59797*(n>>>16)<<16))^n>>>15)>>>0).toString(36)}(i)+l;return"production"!==process.env.NODE_ENV?{name:u,styles:i,map:o,next:Ce,toString:function(){return"You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."}}:{name:u,styles:i,next:Ce}},Me="undefined"!=typeof document;function Oe(e,t,n){var r="";return n.split(" ").forEach((function(n){void 0!==e[n]?t.push(e[n]+";"):r+=n+" "})),r}var Se=function(e,t,n){var r=e.key+"-"+t.name;if((!1===n||!1===Me&&void 0!==e.compat)&&void 0===e.registered[r]&&(e.registered[r]=t.styles),void 0===e.inserted[t.name]){var i="",o=t;do{var a=e.insert(t===o?"."+r:"",o,e.sheet,!0);Me||void 0===a||(i+=a),o=o.next}while(void 0!==o);if(!Me&&0!==i.length)return i}};function ze(e,t){if(void 0===e.inserted[t.name])return e.insert("",t,e.sheet,!0)}function De(e,t,n){var r=[],i=Oe(e,r,n);return r.length<2?n:i+t(r)}var qe=function e(t){for(var n="",r=0;r<t.length;r++){var i=t[r];if(null!=i){var o=void 0;switch(typeof i){case"boolean":break;case"object":if(Array.isArray(i))o=e(i);else for(var a in o="",i)i[a]&&a&&(o&&(o+=" "),o+=a);break;default:o=i}o&&(n&&(n+=" "),n+=o)}}return n},Be=function(e){var t=ce(e);t.sheet.speedy=function(e){if("production"!==process.env.NODE_ENV&&0!==this.ctr)throw new Error("speedy must be changed before any rules are inserted");this.isSpeedy=e},t.compat=!0;var n=function(){for(var e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];var i=Ne(n,t.registered,void 0);return Se(t,i,!1),t.key+"-"+i.name};return{css:n,cx:function(){for(var e=arguments.length,r=new Array(e),i=0;i<e;i++)r[i]=arguments[i];return De(t.registered,n,qe(r))},injectGlobal:function(){for(var e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];var i=Ne(n,t.registered);ze(t,i)},keyframes:function(){for(var e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];var i=Ne(n,t.registered),o="animation-"+i.name;return ze(t,{name:i.name,styles:"@keyframes "+o+"{"+i.styles+"}"}),o},hydrate:function(e){e.forEach((function(e){t.inserted[e]=!0}))},flush:function(){t.registered={},t.inserted={},t.sheet.flush()},sheet:t.sheet,cache:t,getRegisteredStyles:Oe.bind(null,t.registered),merge:De.bind(null,t.registered,n)}}({key:"css"}),je=Be.injectGlobal,Ie=Be.css;const We="#496b54",He="#aabfb2",Te=Ie`
  * {
    color: ${We};
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
`,Ve=Ie`
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
    border: 1px solid ${We};
    border-radius: 10px;
    outline: none;
    padding: 0.5em 0.75em;
    transition: color 0.2s ease-out, background 0.2s ease-out,
      transform 0.2s ease-out;
    &:hover,
    &:focus,
    &:active {
      background: ${We};
      color: ${He};
    }
    &:active {
      transform: scale(1.1);
    }
    &:not(:last-of-type) {
      margin-right: 25px;
    }
  }
`,Pe=Ie`
  &.product {
    align-items: center;
    box-shadow: 0 10px 30px 0px ${"#496b5466"};
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    width: 100%;

    * {
      color: ${We};
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
      box-shadow: 0 20px 16px -10px ${"#496b5499"};
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
      border: 1px solid ${We};
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
        fill: ${We};
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
      color: ${We};
      font-size: 1.25em;
      font-weight: 700;
      text-decoration: underline;
      width: 100%;
      margin: 0;
    }
  }
`,Ze=Ie`
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  grid-gap: 100px 50px;
  width: 100%;
`,Re=Ie`
  &.cart,
  .cart {
    backdrop-filter: blur(15px);
    border: 2px solid ${We};
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
      box-shadow: 0 0 20px 0px ${We};
      border-radius: 17px 0 0 0;
      background: ${"#496b54cc"};
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
      transition: transform 0.3s ease-out, filter 0.3s ease-out;
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
          fill: ${We};
        }
      }
      &--open svg {
        fill: ${He};
      }
    }

    svg {
      /* fill: ${He}; */
      transition: fill 0.3s ease-out;
      width: 50px;
    }

    &__items {
      height: calc(100% - 75px);
      position: relative;
      overflow-y: scroll;
    }

    &__total {
      color: ${We};
      display: block;
      font-size: 20px;
      font-weight: 400;
      margin-top: 15px;
      padding: 15px;
      position: relative;
      &:before {
        background: ${We};
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
`,Le=Ie`
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
      /* border: 1px solid ${We}; */
      box-shadow: 0 20px 16px -10px ${"#496b5499"};
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
      background: ${He};
      border: none;
      color: ${We};
      font-weight: 700;
      font-size: 18px;
    }
    &__btn {
      background: ${We};
      border-radius: 5px;
      color: ${He};
      min-width: 30px;
      padding: 3px 5px;
      transition: background 0.25s ease-in, color 0.25s ease-in;
      &:hover {
        background: ${He};
        color: ${We};
        transition: background 0.2s ease-out, color 0.2s ease-out;
      }
    }
  }
`,Xe=Ie`
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
        background: ${We};
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
    color: ${We};
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
      border-bottom: 1px solid ${We};
      flex-grow: 1;
      padding: 5px 0;
      margin-left: 10px;
      transform: filter 0.2s ease-out;
      &::placeholder {
        color: ${"#496b54aa"};
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
`,Ge=Ie`
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
      background: ${He};
      border: 1px solid ${We};
      border-radius: 20px;
      box-shadow: 0 10px 30px 0px ${"#496b5466"};
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
`;function Ye(e,t,n,r){if("a"===n&&!r)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!r:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===n?r:"a"===n?r.call(e):r?r.value:t.get(e)}var Fe,Je;je`
  html{line-height:1.15;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,footer,header,nav,section{display:block}h1{font-size:2em;margin:.67em 0}figcaption,figure,main{display:block}figure{margin:1em 40px}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent;-webkit-text-decoration-skip:objects}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}dfn{font-style:italic}mark{background-color:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}audio,video{display:inline-block}audio:not([controls]){display:none;height:0}img{border-style:none}svg:not(:root){overflow:hidden}button,input,optgroup,select,textarea{font-family:sans-serif;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}button,html [type=button],[type=reset],[type=submit]{-webkit-appearance:button}button::-moz-focus-inner,[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner{border-style:none;padding:0}button:-moz-focusring,[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:.35em .75em .625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{display:inline-block;vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details,menu{display:block}summary{display:list-item}canvas{display:inline-block}template{display:none}[hidden]{display:none}

  html {
    font-size: 18px;
    font-family: Arial, Helvetica, sans-serif;
  }

  body {
    margin: 5% 8%;
    background: ${He};
  }

  * {
    box-sizing: border-box;
  }

  ul,ol {
    list-style:none;
    padding: 0;
  }
`;class Ue{constructor(e,t,n){Fe.set(this,void 0),Je.set(this,[]),this.key=t,this.value=n,this.id="_"+Math.random().toString(36).substr(2,9),this.compute=this.compute.bind(this,e)}update(e){const t=Ye(this,Fe,"f")?Ye(this,Fe,"f").call(this,e):e;return Ye(this,Je,"f")&&Ye(this,Je,"f").forEach((e=>e(t))),this.value=t,this}observe(e,t=this){e instanceof Node&&(e=this.nodeObserver(e)),Ye(this,Je,"f").push(e.bind(t))}compute(e,t){const n=e.defineProperty(t(this.value));return function(e,t,n,r,i){if("m"===r)throw new TypeError("Private method is not writable");if("a"===r&&!i)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!i:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");"a"===r?i.call(e,n):i?i.value=n:t.set(e,n)}(n,Fe,t,"f"),this.observe(n.update,n),n}nodeObserver(e){let t=this.value;const n=e.parentElement;return r=>{t=this.value,e instanceof Attr?e.value=e.value.replace(t.toString(),r.toString()):Array.isArray(r)?n.replaceChildren(...r):e.textContent=e.textContent.replace(t.toString(),r.toString())}}}Fe=new WeakMap,Je=new WeakMap;const Qe=function(e){if(e)return e;return{ids:[],props:[],defineProperty(e,t){if(Ue.prototype.isPrototypeOf(e)){const t=e,{id:n}=t;return this.hasId(n)||(this.props.push(t),this.ids.push(n)),t}const n=new Ue(this,t,e);return this.props.push(n),this.ids.push(n.id),n},getPropertyByKey(e){return this.props.find((({key:t})=>t===e))},getPropertyByValue(e){return this.props.find((({value:t})=>t===e))},getPropertyById(e){return this.props.find((({id:t})=>t===e))},hasProperty(e){return this.props.some((t=>t.key===e))},hasId(e){return this.ids.some((t=>t===e))}}},Ke=(e,t,n)=>t.reduce(((t,r,i)=>{const o=n.defineProperty(r,null==r?void 0:r.key);return[...t,((e,{id:t,value:n})=>{const r=e=>e instanceof Node;if(Array.isArray(n)&&n.every(r)||r(n))return`<del ${t}></del>`})(0,o)||o.id,e[i+1]]}),[e[0]]).join(""),et=e=>{const{id:t,value:n}=e;return r=>{var i;(e=>{Array.isArray(e)||(e instanceof DocumentFragment||Element)})(n),(null===(i=r.textContent)||void 0===i?void 0:i.includes(t))&&(e.observe(r,e),Array.isArray(n)?(n.forEach(et(e)),r.textContent=r.textContent.replace(t,"")):"object"!=typeof n&&(r.textContent=r.textContent.replace(t,n.toString())))}},tt=e=>{const{attributes:t,childNodes:n}=e,r=Array.from(t),i=Array.from(n).filter((({nodeType:e,textContent:t})=>e===Node.TEXT_NODE&&t.trim()));return e=>{((e,t)=>{e.forEach(et(t))})(i,e),((e,t)=>{e.forEach((e=>{const{id:t,value:n}=e;return r=>{(r.value.includes(t)&&"data-id"!==r.name||"string"==typeof n&&"number"==typeof n)&&(e.observe(r,e),r.value=r.value.replace(t,n))}})(t))})(r,e)}},nt=(e,t)=>{const n=e.props;n.forEach(((e,t)=>e=>{const{id:n,value:r}=e,i=t.querySelector(`del[${n}]`),o=e=>e instanceof Node,a=Array.isArray(r)&&r.every(o);if(i&&(o||a)){e.observe(i,e);const t=Array.isArray(r)?r:[r];i.replaceWith(...t)}})(0,t));return Array.from(t.querySelectorAll("*")).forEach((e=>t=>e.forEach(tt(t)))(n)),t},rt=function(e,...t){const n=Qe(),r=Ke(e,t,n),i=document.createElement("template");i.innerHTML=r;const o=nt(n,i.content);return o.collect=function(e){const t=e.querySelectorAll("[ref]");return()=>{if(null==e?void 0:e.refs)return e.refs;const n=Array.from(t).reduce(((e,t)=>(e[t.getAttribute("ref")]=t,e)),{});return e.refs=n,n}}(o),o},it=function(e){const t=Qe();e=Object.assign({},e);const n={get(e,n){if("symbol"==typeof n)return;const r="$"===n[0];if(!((n=r?n.replace("$",""):n)in e))return;const i=Reflect.get(e,n),o=Ue.prototype.isPrototypeOf(i),a=t.defineProperty(i,n);if(Reflect.set(e,n,a),r)return a;if(o)return Reflect.get(i,"value");if(!("object"!=typeof i||Array.isArray(i)||i instanceof Node)){const t=new Proxy(i,this);return Reflect.set(e,n,t),t}return i},set(e,n,r){if("symbol"==typeof n)return!1;const i=t.getPropertyByKey(n);return!i||(i.update(r),!!i)}};return new Proxy(e,n)},ot="cart",at={total:0,items:JSON.parse(localStorage.getItem(ot))||[],subscribers:[],subscribe(e){this.notify(),this.subscribers.push(e)},notify(){this.subscribers.forEach((e=>e(this.items)))},addItem(e){const t=this.getAll();let n=t.find((({id:t})=>t===e));n?n.quantity++:(n=st.find((({id:t})=>t===e)),n.quantity=1,t.push(n)),n&&this.updateCart(t)},removeItem(e){const t=this.getAll();let n=t.find((({id:t})=>t===e));n&&(n.quantity--,this.updateCart(t.filter((({quantity:e})=>e))))},getItem(e){return this.getAll().find((({id:t})=>t===e))},updateCart(e){localStorage.setItem(ot,JSON.stringify(e)),this.getAll(),this.notify()},getAll(){let e=localStorage.getItem(ot);return e||localStorage.setItem(ot,JSON.stringify(this.items)),this.items=JSON.parse(e),this.items},removeAll:()=>localStorage.setItem(ot,JSON.stringify([]))};at.getAll();const st=[{id:201,name:"Nulla",price:207,description:"Culpa sed tenetur incidunt quia veniam sed molliti",likes:78,quantity:0,image:"https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:202,name:"Corporis",price:271,description:"Nam incidunt blanditiis odio inventore. Nobis volu",likes:67,quantity:0,image:"https://images.unsplash.com/photo-1547514701-42782101795e?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:203,name:"Minus",price:295,description:"Quod reiciendis aspernatur ipsum cum debitis. Quis",likes:116,quantity:0,image:"https://images.unsplash.com/photo-1591287083773-9a52ba8184a4?ixid=MXwxMjA3fDB8MHxzZWFyY2h8N3x8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:204,name:"Qui",price:280,description:"Occaecati dolore assumenda facilis error quaerat. ",likes:78,quantity:0,image:"https://images.unsplash.com/photo-1528825871115-3581a5387919?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OHx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:209,name:"Similique",price:262,description:"Autem blanditiis similique saepe excepturi at erro",likes:44,quantity:0,image:"https://images.unsplash.com/photo-1552089123-2d26226fc2b7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OXx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:220,name:"Soluta",price:109,description:"Quos accusamus distinctio voluptates ducimus neque",likes:34,quantity:0,image:"https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTV8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:223,name:"Quos",price:247,description:"Error voluptate recusandae reiciendis adipisci nec",likes:188,quantity:0,image:"https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTl8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:224,name:"Sunt",price:297,description:"Tempora sed explicabo quae recusandae vitae debiti",likes:63,quantity:0,image:"https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MjR8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:225,name:"Nemo",price:143,description:"Id pariatur at modi esse distinctio error. Dolores",likes:116,quantity:0,image:"https://images.unsplash.com/photo-1439127989242-c3749a012eac?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MzB8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:226,name:"Quo",price:150,description:"Explicabo distinctio labore eius. Culpa provident ",likes:157,quantity:0,image:"https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NDl8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:227,name:"Nobis",price:195,description:"Reprehenderit iste quos amet. Natus consequatur in",likes:30,quantity:0,image:"https://images.unsplash.com/photo-1560155016-bd4879ae8f21?ixid=MXwxMjA3fDB8MHxzZWFyY2h8M3x8YXZvY2Fkb3xlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"},{id:228,name:"Explicabo",price:253,description:"Nihil magni libero sapiente voluptate. Perspiciati",likes:11,quantity:0,image:"https://images.unsplash.com/photo-1587324438673-56c78a866b15?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8bGVtb258ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"}],ct=e=>{const t=it(e),{$image:n,$name:r,$price:i,$likes:o,$description:a}=t,s=rt`
    <div class="${Pe} product">
      <div class="product__imageContainer">
        <img class="product__image" src="${n}" alt="${r}" />
      </div>
      <div class="product__headingContainer">
        <h3 class="product__name">${r}</h3>
        <p class="product__description">${a}</p>
      </div>
      <div class="product__priceContainer">
        <h4 class="product__price">$${i}</h4>
      </div>
      <div class="product__likesContainer">
        <button ref="likeBtn" class="product__likeBtn">
          <span class="product__thumbsUp"> ${rt`<svg
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
          <span>${o}</span>
        </button>
      </div>

      <div class="product__cartContainer">
        <button ref="cartBtn" class="product__likeBtn">Add To Cart</button>
      </div>
    </div>
  `,{likeBtn:c,cartBtn:l}=s.collect();return c.addEventListener("click",(()=>t.likes+=1)),l.addEventListener("click",(()=>at.addItem(e.id))),s},lt=e=>{const t=it(e),{$id:n,$image:r,$name:i,$quantity:o,quantity:a,price:s}=t,c=rt`
    <li class="item ${Le}" data-id="${n}">
      <div class="item__imageContainer">
        <img class="item__image" src="${r}" alt="${i}" />
      </div>
      <div class="item__details">
        <div class="item__nameContainer">
          <p>${i}</p>
        </div>
        <div class="item__quantityContainer">
          <button
            ref="minusBtn"
            class="item__quantity item__quantity--minus item__btn"
          >
            -
          </button>
          <p class="item__quantity">${o}</p>
          <button
            ref="plusBtn"
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
  `,{plusBtn:l,minusBtn:u}=c.collect();return l.addEventListener("click",(()=>at.addItem(t.id))),u.addEventListener("click",(()=>at.removeItem(t.id))),c},ut=e=>e.reduce(((e,t)=>(t.price&&(e+=t.price*t.quantity),e)),0),dt=e=>{const t=it({items:e,isOpen:!1,total:ut(at.getAll())}),{$isOpen:n,$items:r,$total:i}=t,o=n.compute((e=>e?"open":"closed")),a=r.compute((e=>e.map(lt))),s=rt`
    <div ref="cartContainer" class="${Re} cart cart--${o}">
      <div class="cart__contentContainer">
        <div class="cart__controlContainer">
          <button
            ref="cartBtn"
            class="cart__control cart__control--${o}"
          >
            ${rt`
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
          ${a}
        </ul>
        <div class="cart__total">
          Total: <span class="cart__sum">$${i}</span>
        </div>
      </div>
    </div>
  `,{cartBtn:c}=s.collect();return c.addEventListener("click",(()=>{t.isOpen=!t.isOpen})),at.subscribe((e=>{t.items=e,t.total=ut(e)})),s},pt=(e={label:"",name:"",placeholder:"",autocomplete:!1})=>{var t,n,r;return rt` <div class="form__item">
    <label ref="${e.label.toLowerCase()}" class="formInput">
      <span class="formInput__labelText"> ${e.label} </span>
      <input
        type="${null!==(t=null==e?void 0:e.type)&&void 0!==t?t:"text"}"
        class="formInput__input"
        placeholder="${null!==(n=null==e?void 0:e.placeholder)&&void 0!==n?n:""}"
        autocomplete="${(null==e?void 0:e.autocomplete)?"on":"off"}"
        name="${null!==(r=null==e?void 0:e.name)&&void 0!==r?r:""}"
      />
    </label>
  </div>`},ft=[{label:"Name:",name:"name"},{label:"Email:",name:"email"},{label:"Industry:",name:"industry"},{label:"Reason for inquiry:",name:"subject"}],mt=e=>{const t=rt`
    <div class="${Xe}">
      <h2 id="form_label" class="form__label">Get in touch</h2>
      <form class="form" ref="form">
        ${ft.map(pt)}
        <button ref="submitBtn" type="submit">Submit</button>
      </form>
      <h3 class="form__disclaimer">❗️Uhhh... this isn't an actual form.</h3>
    </div>
  `,{form:n}=t.collect();return null==n||n.addEventListener("submit",(e=>{e.preventDefault(),new FormData(e.target)})),t},ht=Object.freeze({BACKSPACE:8,TAB:9,ESCAPE:27}),bt=(...e)=>{const t=rt`
    <div class="${Te} layout">
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
    <footer class="${Te} ${Ve}">
      ${(e=>{const t=it(Object.assign({isOpen:!1},e));let n=!1;const{$isOpen:r}=t,i=rt` <button class="footer__contact" ref="modalBtn">
      ${t.$openBtn}
    </button>
    <div
      ref="modal"
      role="modal"
      id="modal"
      aria-labelledby="modal_label"
      aria-modal="true"
      aria-hidden="${!t.$isOpen}"
      class="${Ge} modal modal__open--${r}"
    >
      <div ref="modalContent" class="modal__content">
        <button ref="closeBtn" class="modal__close">✕</button>
        ${t.$content}
      </div>
    </div>`,{modal:o,modalBtn:a,modalContent:s,submitBtn:c,closeBtn:l}=i.collect(),u=(e=!1)=>{t.isOpen=e};return o.addEventListener("click",(e=>{n=!1,e.target instanceof Node&&e.target===o&&!s.contains(e.target)&&u(!1)})),a.addEventListener("click",(()=>{u(!t.isOpen)})),null==l||l.addEventListener("click",(()=>{u(!1)})),document.addEventListener("keyup",(e=>{n=!0,(e.which||e.keyCode)===ht.ESCAPE&&t.isOpen&&(t.isOpen=!1,e.stopPropagation())})),s.addEventListener("focusout",(e=>{n&&e.relatedTarget instanceof Node&&!s.contains(e.relatedTarget)&&l.focus()})),i})({openBtn:"💌",content:mt()})}
      ${(({text:e,target:t})=>{const n=it({text:e}),r=rt` <button ref="jumpLink">${n.text}</button> `,{jumpLink:i}=r.collect();return null==i||i.addEventListener("click",(()=>t.scrollIntoView({behavior:"smooth"}))),r.viewModel=n,r})({text:"⬆️",target:document.firstElementChild})}
    </footer>
  `;return t};document.addEventListener("DOMContentLoaded",(()=>{const e=document.getElementById("root"),t=dt(at.items),n=(e=>rt`
    <div class="productGrid ${Ze}">${e.map(ct)}</div>
  `)(st),r=bt(t,n);e.append(r)}))}));
//# sourceMappingURL=index.js.map
