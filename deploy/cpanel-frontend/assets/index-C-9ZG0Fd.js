import{i as E,j as z,d as Ee,r as xe,a as ke,m as De,s as Oe,U as L,E as Ae,g as Te,c as Pe,b as He}from"./router-DD0KmG-x.js";/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */var je=Le,Me=Fe,Ue=Object.prototype.toString,x=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;function Le(e,t){if(typeof e!="string")throw new TypeError("argument str must be a string");for(var r={},n=t||{},a=n.decode||$e,i=0;i<e.length;){var o=e.indexOf("=",i);if(o===-1)break;var s=e.indexOf(";",i);if(s===-1)s=e.length;else if(s<o){i=e.lastIndexOf(";",o-1)+1;continue}var l=e.slice(i,o).trim();if(r[l]===void 0){var u=e.slice(o+1,s).trim();u.charCodeAt(0)===34&&(u=u.slice(1,-1)),r[l]=Ne(u,a)}i=s+1}return r}function Fe(e,t,r){var n=r||{},a=n.encode||ze;if(typeof a!="function")throw new TypeError("option encode is invalid");if(!x.test(e))throw new TypeError("argument name is invalid");var i=a(t);if(i&&!x.test(i))throw new TypeError("argument val is invalid");var o=e+"="+i;if(n.maxAge!=null){var s=n.maxAge-0;if(isNaN(s)||!isFinite(s))throw new TypeError("option maxAge is invalid");o+="; Max-Age="+Math.floor(s)}if(n.domain){if(!x.test(n.domain))throw new TypeError("option domain is invalid");o+="; Domain="+n.domain}if(n.path){if(!x.test(n.path))throw new TypeError("option path is invalid");o+="; Path="+n.path}if(n.expires){var l=n.expires;if(!Ie(l)||isNaN(l.valueOf()))throw new TypeError("option expires is invalid");o+="; Expires="+l.toUTCString()}if(n.httpOnly&&(o+="; HttpOnly"),n.secure&&(o+="; Secure"),n.partitioned&&(o+="; Partitioned"),n.priority){var u=typeof n.priority=="string"?n.priority.toLowerCase():n.priority;switch(u){case"low":o+="; Priority=Low";break;case"medium":o+="; Priority=Medium";break;case"high":o+="; Priority=High";break;default:throw new TypeError("option priority is invalid")}}if(n.sameSite){var c=typeof n.sameSite=="string"?n.sameSite.toLowerCase():n.sameSite;switch(c){case!0:o+="; SameSite=Strict";break;case"lax":o+="; SameSite=Lax";break;case"strict":o+="; SameSite=Strict";break;case"none":o+="; SameSite=None";break;default:throw new TypeError("option sameSite is invalid")}}return o}function $e(e){return e.indexOf("%")!==-1?decodeURIComponent(e):e}function ze(e){return encodeURIComponent(e)}function Ie(e){return Ue.call(e)==="[object Date]"||e instanceof Date}function Ne(e,t){try{return t(e)}catch{return e}}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const B={};function se(e,t){!e&&!B[t]&&(B[t]=!0,console.warn(t))}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Ve=({sign:e,unsign:t})=>(r,n={})=>{let{secrets:a=[],...i}={path:"/",sameSite:"lax",...n};return Be(r,i.expires),{get name(){return r},get isSigned(){return a.length>0},get expires(){return typeof i.maxAge<"u"?new Date(Date.now()+i.maxAge*1e3):i.expires},async parse(o,s){if(!o)return null;let l=je(o,{...i,...s});return r in l?l[r]===""?"":await qe(t,l[r],a):null},async serialize(o,s){return Me(r,o===""?"":await Xe(e,o,a),{...i,...s})}}},I=e=>e!=null&&typeof e.name=="string"&&typeof e.isSigned=="boolean"&&typeof e.parse=="function"&&typeof e.serialize=="function";async function Xe(e,t,r){let n=Je(t);return r.length>0&&(n=await e(n,r[0])),n}async function qe(e,t,r){if(r.length>0){for(let n of r){let a=await e(t,n);if(a!==!1)return Y(a)}return null}return Y(t)}function Je(e){return btoa(We(encodeURIComponent(JSON.stringify(e))))}function Y(e){try{return JSON.parse(decodeURIComponent(Ke(atob(e))))}catch{return{}}}function Ke(e){let t=e.toString(),r="",n=0,a,i;for(;n<t.length;)a=t.charAt(n++),/[\w*+\-./@]/.exec(a)?r+=a:(i=a.charCodeAt(0),i<256?r+="%"+G(i,2):r+="%u"+G(i,4).toUpperCase());return r}function G(e,t){let r=e.toString(16);for(;r.length<t;)r="0"+r;return r}function We(e){let t=e.toString(),r="",n=0,a,i;for(;n<t.length;){if(a=t.charAt(n++),a==="%"){if(t.charAt(n)==="u"){if(i=t.slice(n+1,n+5),/^[\da-f]{4}$/i.exec(i)){r+=String.fromCharCode(parseInt(i,16)),n+=5;continue}}else if(i=t.slice(n,n+2),/^[\da-f]{2}$/i.exec(i)){r+=String.fromCharCode(parseInt(i,16)),n+=2;continue}}r+=a}return r}function Be(e,t){se(!t,`The "${e}" cookie has an "expires" property set. This will cause the expires value to not be updated when the session is committed. Instead, you should set the expires value when serializing the cookie. You can use \`commitSession(session, { expires })\` if using a session storage object, or \`cookie.serialize("value", { expires })\` if you're using the cookie directly.`)}function D(e){const t=unescape(encodeURIComponent(e));return Uint8Array.from(t,(r,n)=>t.charCodeAt(n))}function Ye(e){const t=String.fromCharCode.apply(null,e);return decodeURIComponent(escape(t))}function k(...e){const t=new Uint8Array(e.reduce((n,a)=>n+a.length,0));let r=0;for(const n of e)t.set(n,r),r+=n.length;return t}function Ge(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0}function Q(e){return e instanceof Uint8Array?t=>e[t]:e}function M(e,t,r,n,a){const i=Q(e),o=Q(r);for(let s=0;s<a;++s)if(i(t+s)!==o(n+s))return!1;return!0}function Qe(e){const t=new Array(256).fill(e.length);if(e.length>1)for(let r=0;r<e.length-1;r++)t[e[r]]=e.length-1-r;return t}const g=Symbol("Match");class N{constructor(t){this._lookbehind=new Uint8Array,typeof t=="string"?this._needle=t=D(t):this._needle=t,this._lastChar=t[t.length-1],this._occ=Qe(t)}feed(t){let r=0,n;const a=[];for(;r!==t.length;)[r,...n]=this._feed(t,r),a.push(...n);return a}end(){const t=this._lookbehind;return this._lookbehind=new Uint8Array,t}_feed(t,r){const n=[];let a=-this._lookbehind.length;if(a<0){for(;a<0&&a<=t.length-this._needle.length;){const i=this._charAt(t,a+this._needle.length-1);if(i===this._lastChar&&this._memcmp(t,a,this._needle.length-1))return a>-this._lookbehind.length&&n.push(this._lookbehind.slice(0,this._lookbehind.length+a)),n.push(g),this._lookbehind=new Uint8Array,[a+this._needle.length,...n];a+=this._occ[i]}if(a<0)for(;a<0&&!this._memcmp(t,a,t.length-a);)a++;if(a>=0)n.push(this._lookbehind),this._lookbehind=new Uint8Array;else{const i=this._lookbehind.length+a;return i>0&&(n.push(this._lookbehind.slice(0,i)),this._lookbehind=this._lookbehind.slice(i)),this._lookbehind=Uint8Array.from(new Array(this._lookbehind.length+t.length),(o,s)=>this._charAt(t,s-this._lookbehind.length)),[t.length,...n]}}for(a+=r;a<=t.length-this._needle.length;){const i=t[a+this._needle.length-1];if(i===this._lastChar&&t[a]===this._needle[0]&&M(this._needle,0,t,a,this._needle.length-1))return a>r&&n.push(t.slice(r,a)),n.push(g),[a+this._needle.length,...n];a+=this._occ[i]}if(a<t.length){for(;a<t.length&&(t[a]!==this._needle[0]||!M(t,a,this._needle,0,t.length-a));)++a;a<t.length&&(this._lookbehind=t.slice(a))}return a>0&&n.push(t.slice(r,a<t.length?a:t.length)),[t.length,...n]}_charAt(t,r){return r<0?this._lookbehind[this._lookbehind.length+r]:t[r]}_memcmp(t,r,n){return M(this._charAt.bind(this,t),r,this._needle,0,n)}}class Ze{constructor(t,r){this._readableStream=r,this._search=new N(t)}async*[Symbol.asyncIterator](){const t=this._readableStream.getReader();try{for(;;){const n=await t.read();if(n.done)break;yield*this._search.feed(n.value)}const r=this._search.end();r.length&&(yield r)}finally{t.releaseLock()}}}const et=Function.prototype.apply.bind(k,void 0),le=D("--"),C=D(`\r
`);function tt(e){const t=e.split(";").map(n=>n.trim());if(t.shift()!=="form-data")throw new Error('malformed content-disposition header: missing "form-data" in `'+JSON.stringify(t)+"`");const r={};for(const n of t){const a=n.split("=",2);if(a.length!==2)throw new Error("malformed content-disposition header: key-value pair not found - "+n+" in `"+e+"`");const[i,o]=a;if(o[0]==='"'&&o[o.length-1]==='"')r[i]=o.slice(1,-1).replace(/\\"/g,'"');else if(o[0]!=='"'&&o[o.length-1]!=='"')r[i]=o;else if(o[0]==='"'&&o[o.length-1]!=='"'||o[0]!=='"'&&o[o.length-1]==='"')throw new Error("malformed content-disposition header: mismatched quotations in `"+e+"`")}if(!r.name)throw new Error("malformed content-disposition header: missing field name in `"+e+"`");return r}function rt(e){const t=[];let r=!1,n;for(;typeof(n=e.shift())<"u";){const a=n.indexOf(":");if(a===-1)throw new Error("malformed multipart-form header: missing colon");const i=n.slice(0,a).trim().toLowerCase(),o=n.slice(a+1).trim();switch(i){case"content-disposition":r=!0,t.push(...Object.entries(tt(o)));break;case"content-type":t.push(["contentType",o])}}if(!r)throw new Error("malformed multipart-form header: missing content-disposition");return Object.fromEntries(t)}async function nt(e,t){let r=!0,n=!1;const a=[[]],i=new N(C);for(;;){const o=await e.next();if(o.done)throw new Error("malformed multipart-form data: unexpected end of stream");if(r&&o.value!==g&&Ge(o.value.slice(0,2),le))return[void 0,new Uint8Array];let s;if(o.value!==g)s=o.value;else if(!n)s=t;else throw new Error("malformed multipart-form data: unexpected boundary");if(!s.length)continue;r&&(r=!1);const l=i.feed(s);for(const[u,c]of l.entries()){const d=c===g;if(!(!d&&!c.length)){if(n&&d)return l.push(i.end()),[a.filter(p=>p.length).map(et).map(Ye),k(...l.slice(u+1).map(p=>p===g?C:p))];(n=d)?a.push([]):a[a.length-1].push(c)}}}}async function*at(e,t){const r=k(le,D(t)),n=new Ze(r,e)[Symbol.asyncIterator]();for(;;){const i=await n.next();if(i.done)return;if(i.value===g)break}const a=new N(C);for(;;){let u=function(f){const h=[];for(const y of a.feed(f))l&&h.push(C),(l=y===g)||h.push(y);return k(...h)};const[i,o]=await nt(n,r);if(!i)return;async function s(){const f=await n.next();if(f.done)throw new Error("malformed multipart-form data: unexpected end of stream");return f}let l=!1,c=!1;async function d(){const f=await s();let h;if(f.value!==g)h=f.value;else if(!l)h=C;else return c=!0,{value:a.end()};return{value:u(h)}}const p=[{value:u(o)}];for(yield{...rt(i),data:{[Symbol.asyncIterator](){return this},async next(){for(;;){const f=p.shift();if(!f)break;if(f.value.length>0)return f}for(;;){if(c)return{done:c,value:void 0};const f=await d();if(f.value.length>0)return f}}}};!c;)p.push(await d())}}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function it(...e){return async t=>{for(let r of e){let n=await r(t);if(typeof n<"u"&&n!==null)return n}}}async function ot(e,t){let r=e.headers.get("Content-Type")||"",[n,a]=r.split(/\s*;\s*boundary=/);if(!e.body||!a||n!=="multipart/form-data")throw new TypeError("Could not parse content as FormData.");let i=new FormData,o=at(e.body,a);for await(let s of o){if(s.done)break;typeof s.filename=="string"&&(s.filename=s.filename.split(/[/\\]/).pop());let l=await t(s);typeof l<"u"&&l!==null&&i.append(s.name,l)}return i}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let w=function(e){return e.Development="development",e.Production="production",e.Test="test",e}({});function st(e){return e===w.Development||e===w.Production||e===w.Test}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function V(e,t){if(e instanceof Error&&t!==w.Development){let r=new Error("Unexpected Server Error");return r.stack=void 0,r}return e}function Z(e,t){return Object.entries(e).reduce((r,[n,a])=>Object.assign(r,{[n]:V(a,t)}),{})}function O(e,t){let r=V(e,t);return{message:r.message,stack:r.stack}}function ee(e,t){if(!e)return null;let r=Object.entries(e),n={};for(let[a,i]of r)if(E(i))n[a]={...i,__type:"RouteErrorResponse"};else if(i instanceof Error){let o=V(i,t);n[a]={message:o.message,stack:o.stack,__type:"Error",...o.name!=="Error"?{__subType:o.name}:{}}}else n[a]=i;return n}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const X=(e,t={})=>z(e,t),lt=(e,t={})=>Ee(e,t),ue=(e,t=302)=>xe(e,t),ut=(e,t=302)=>ke(e,t);function ct(e){let t=e;return t&&typeof t=="object"&&typeof t.data=="object"&&typeof t.subscribe=="function"&&typeof t.cancel=="function"&&typeof t.resolveData=="function"}function S(e){return e!=null&&typeof e.status=="number"&&typeof e.statusText=="string"&&typeof e.headers=="object"&&typeof e.body<"u"}const dt=new Set([301,302,303,307,308]);function ce(e){return dt.has(e)}function ft(e){return ce(e.status)}function ht(e){return e!=null&&typeof e.then=="function"&&e._tracked===!0}const pt="__deferred_promise:";function mt(e,t,r){let n=new TextEncoder;return new ReadableStream({async start(i){let o={},s=[];for(let[u,c]of Object.entries(e.data))ht(c)?(o[u]=`${pt}${u}`,(typeof c._data<"u"||typeof c._error<"u")&&s.push(u)):o[u]=c;i.enqueue(n.encode(JSON.stringify(o)+`

`));for(let u of s)te(i,n,u,e.data[u],r);let l=e.subscribe((u,c)=>{c&&te(i,n,c,e.data[c],r)});await e.resolveData(t),l(),i.close()}})}function te(e,t,r,n,a){"_error"in n?e.enqueue(t.encode("error:"+JSON.stringify({[r]:n._error instanceof Error?O(n._error,a):n._error})+`

`)):e.enqueue(t.encode("data:"+JSON.stringify({[r]:n._data??null})+`

`))}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function yt(e){return Object.keys(e).reduce((t,r)=>(t[r]=e[r].module,t),{})}var A={exports:{}},R={decodeValues:!0,map:!1,silent:!1};function F(e){return typeof e=="string"&&!!e.trim()}function $(e,t){var r=e.split(";").filter(F),n=r.shift(),a=gt(n),i=a.name,o=a.value;t=t?Object.assign({},R,t):R;try{o=t.decodeValues?decodeURIComponent(o):o}catch(l){console.error("set-cookie-parser encountered an error while decoding a cookie with value '"+o+"'. Set options.decodeValues to false to disable this feature.",l)}var s={name:i,value:o};return r.forEach(function(l){var u=l.split("="),c=u.shift().trimLeft().toLowerCase(),d=u.join("=");c==="expires"?s.expires=new Date(d):c==="max-age"?s.maxAge=parseInt(d,10):c==="secure"?s.secure=!0:c==="httponly"?s.httpOnly=!0:c==="samesite"?s.sameSite=d:s[c]=d}),s}function gt(e){var t="",r="",n=e.split("=");return n.length>1?(t=n.shift(),r=n.join("=")):r=e,{name:t,value:r}}function de(e,t){if(t=t?Object.assign({},R,t):R,!e)return t.map?{}:[];if(e.headers)if(typeof e.headers.getSetCookie=="function")e=e.headers.getSetCookie();else if(e.headers["set-cookie"])e=e.headers["set-cookie"];else{var r=e.headers[Object.keys(e.headers).find(function(a){return a.toLowerCase()==="set-cookie"})];!r&&e.headers.cookie&&!t.silent&&console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."),e=r}if(Array.isArray(e)||(e=[e]),t=t?Object.assign({},R,t):R,t.map){var n={};return e.filter(F).reduce(function(a,i){var o=$(i,t);return a[o.name]=o,a},n)}else return e.filter(F).map(function(a){return $(a,t)})}function wt(e){if(Array.isArray(e))return e;if(typeof e!="string")return[];var t=[],r=0,n,a,i,o,s;function l(){for(;r<e.length&&/\s/.test(e.charAt(r));)r+=1;return r<e.length}function u(){return a=e.charAt(r),a!=="="&&a!==";"&&a!==","}for(;r<e.length;){for(n=r,s=!1;l();)if(a=e.charAt(r),a===","){for(i=r,r+=1,l(),o=r;r<e.length&&u();)r+=1;r<e.length&&e.charAt(r)==="="?(s=!0,r=o,t.push(e.substring(n,i)),n=r):r=i+1}else r+=1;(!s||r>=e.length)&&t.push(e.substring(n,e.length))}return t}A.exports=de;A.exports.parse=de;A.exports.parseString=$;var bt=A.exports.splitCookiesString=wt;/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function St(e,t){let r=t.errors?t.matches.findIndex(i=>t.errors[i.route.id]):-1,n=r>=0?t.matches.slice(0,r+1):t.matches,a;if(r>=0){let{actionHeaders:i,actionData:o,loaderHeaders:s,loaderData:l}=t;t.matches.slice(r).some(u=>{let c=u.route.id;return i[c]&&(!o||o[c]===void 0)?a=i[c]:s[c]&&l[c]===void 0&&(a=s[c]),a!=null})}return n.reduce((i,o,s)=>{let{id:l}=o.route,u=e.routes[l].module,c=t.loaderHeaders[l]||new Headers,d=t.actionHeaders[l]||new Headers,p=a!=null&&s===n.length-1,f=p&&a!==c&&a!==d;if(u.headers==null){let y=new Headers(i);return f&&b(a,y),b(d,y),b(c,y),y}let h=new Headers(u.headers?typeof u.headers=="function"?u.headers({loaderHeaders:c,parentHeaders:i,actionHeaders:d,errorHeaders:p?a:void 0}):u.headers:void 0);return f&&b(a,h),b(d,h),b(c,h),b(i,h),h},new Headers)}function b(e,t){let r=e.get("Set-Cookie");r&&bt(r).forEach(a=>{t.append("Set-Cookie",a)})}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function re(e,t){if(e===!1||e===null||typeof e>"u")throw console.error("The following error is a bug in Remix; please open an issue! https://github.com/remix-run/remix/issues/new"),new Error(t)}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function vt(e,t,r){let n=De(e,t,r);return n?n.map(a=>({params:a.params,pathname:a.pathname,route:a.route})):null}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */async function _t({loadContext:e,action:t,params:r,request:n,routeId:a}){let i=await t({request:he(fe(n)),context:e,params:r});if(i===void 0)throw new Error(`You defined an action for route "${a}" but didn't return anything from your \`action\` function. Please return a value or \`null\`.`);return S(i)?i:X(i)}async function Rt({loadContext:e,loader:t,params:r,request:n,routeId:a}){let i=await t({request:he(fe(n)),context:e,params:r});if(i===void 0)throw new Error(`You defined a loader for route "${a}" but didn't return anything from your \`loader\` function. Please return a value or \`null\`.`);return ct(i)?i.init&&ce(i.init.status||200)?ue(new Headers(i.init.headers).get("Location"),i.init):i:S(i)?i:X(i)}function fe(e){let t=new URL(e.url),r=t.searchParams.getAll("index");t.searchParams.delete("index");let n=[];for(let i of r)i&&n.push(i);for(let i of n)t.searchParams.append("index",i);let a={method:e.method,body:e.body,headers:e.headers,signal:e.signal};return a.body&&(a.duplex="half"),new Request(t.href,a)}function he(e){let t=new URL(e.url);t.searchParams.delete("_data");let r={method:e.method,body:e.body,headers:e.headers,signal:e.signal};return r.body&&(r.duplex="half"),new Request(t.href,r)}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function pe(e){let t={};return Object.values(e).forEach(r=>{let n=r.parentId||"";t[n]||(t[n]=[]),t[n].push(r)}),t}function me(e,t="",r=pe(e)){return(r[t]||[]).map(n=>({...n,children:me(e,n.id,r)}))}function ye(e,t,r="",n=pe(e)){return(n[r]||[]).map(a=>{let i={hasErrorBoundary:a.id==="root"||a.module.ErrorBoundary!=null,id:a.id,path:a.path,loader:a.module.loader?o=>Rt({request:o.request,params:o.params,loadContext:o.context,loader:a.module.loader,routeId:a.id}):void 0,action:a.module.action?o=>_t({request:o.request,params:o.params,loadContext:o.context,action:a.module.action,routeId:a.id}):void 0,handle:a.module.handle};return a.index?{index:!0,...i}:{caseSensitive:a.caseSensitive,children:ye(e,t,a.id,n),...i}})}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Ct={"&":"\\u0026",">":"\\u003e","<":"\\u003c","\u2028":"\\u2028","\u2029":"\\u2029"},Et=/[&><\u2028\u2029]/g;function xt(e){return e.replace(Et,t=>Ct[t])}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function ne(e){return xt(JSON.stringify(e))}var kt={};/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */async function Dt(e,t){if(t??(t=kt.REMIX_DEV_ORIGIN),!t)throw Error("Dev server origin not set");let r=new URL(t);r.pathname="ping";let n=await fetch(r.href,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buildHash:e.assets.version})}).catch(a=>{throw console.error(`Could not reach Remix dev server at ${r}`),a});if(!n.ok)throw console.error(`Could not reach Remix dev server at ${r} (${n.status})`),Error(await n.text())}function Ot(e){console.log(`[REMIX DEV] ${e.assets.version} ready`)}const ge="__remix_devServerHooks";function At(e){globalThis[ge]=e}function ae(){return globalThis[ge]}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function ie(e,t){var r,n;let a=me(e.routes),i=ye(e.routes,e.future),o=st(t)?t:w.Production,s=Pe(i,{basename:e.basename,future:{v7_relativeSplatPath:((r=e.future)===null||r===void 0?void 0:r.v3_relativeSplatPath)===!0,v7_throwAbortReason:((n=e.future)===null||n===void 0?void 0:n.v3_throwAbortReason)===!0}}),l=e.entry.module.handleError||((u,{request:c})=>{o!==w.Test&&!c.signal.aborted&&console.error(E(u)&&u.error?u.error:u)});return{routes:a,dataRoutes:i,serverMode:o,staticHandler:s,errorHandler:l}}const Tt=(e,t)=>{let r,n,a,i,o;return async function(l,u={}){if(r=typeof e=="function"?await e():e,t??(t=r.mode),typeof e=="function"){let m=ie(r,t);n=m.routes,a=m.serverMode,i=m.staticHandler,o=m.errorHandler}else if(!n||!a||!i||!o){let m=ie(r,t);n=m.routes,a=m.serverMode,i=m.staticHandler,o=m.errorHandler}let c=new URL(l.url),d=vt(n,c.pathname,r.basename),p=m=>{if(t===w.Development){var _,j;(_=ae())===null||_===void 0||(j=_.processRequestError)===null||j===void 0||j.call(_,m)}o(m,{context:u,params:d&&d.length>0?d[0].params:{},request:l})},f;if(c.searchParams.has("_data")){let m=c.searchParams.get("_data");if(f=await Pt(a,r,i,m,l,u,p),r.entry.module.handleDataRequest){var h;f=await r.entry.module.handleDataRequest(f,{context:u,params:(d==null||(h=d.find(_=>_.route.id==m))===null||h===void 0?void 0:h.params)||{},request:l})}}else if(d&&d[d.length-1].route.module.default==null&&d[d.length-1].route.module.ErrorBoundary==null)f=await jt(a,i,d.slice(-1)[0].route.id,l,u,p);else{var y,H;let m=t===w.Development?await((y=ae())===null||y===void 0||(H=y.getCriticalCss)===null||H===void 0?void 0:H.call(y,r,c.pathname)):void 0;f=await Ht(a,r,i,l,u,p,m)}return l.method==="HEAD"?new Response(null,{headers:f.headers,status:f.status,statusText:f.statusText}):f}};async function Pt(e,t,r,n,a,i,o){try{let s=await r.queryRoute(a,{routeId:n,requestContext:i});if(ft(s)){let l=new Headers(s.headers),u=l.get("Location");return l.set("X-Remix-Redirect",t.basename&&Oe(u,t.basename)||u),l.set("X-Remix-Status",s.status),l.delete("Location"),s.headers.get("Set-Cookie")!==null&&l.set("X-Remix-Revalidate","yes"),new Response(null,{status:204,headers:l})}if(L in s){let l=s[L],u=mt(l,a.signal,e),c=l.init||{},d=new Headers(c.headers);return d.set("Content-Type","text/remix-deferred"),d.set("X-Remix-Response","yes"),c.headers=d,new Response(u,c)}return s.headers.set("X-Remix-Response","yes"),s}catch(s){if(S(s))return s.headers.set("X-Remix-Catch","yes"),s;if(E(s))return s&&o(s),we(s,e);let l=s instanceof Error||s instanceof DOMException?s:new Error("Unexpected Server Error");return o(l),z(O(l,e),{status:500,headers:{"X-Remix-Error":"yes"}})}}async function Ht(e,t,r,n,a,i,o){let s;try{s=await r.query(n,{requestContext:a})}catch(d){return i(d),new Response(null,{status:500})}if(S(s))return s;s.errors&&(Object.values(s.errors).forEach(d=>{(!E(d)||d.error)&&i(d)}),s.errors=Z(s.errors,e));let l=St(t,s),u={manifest:t.assets,routeModules:yt(t.routes),staticHandlerContext:s,criticalCss:o,serverHandoffString:ne({url:s.location.pathname,basename:t.basename,criticalCss:o,state:{loaderData:s.loaderData,actionData:s.actionData,errors:ee(s.errors,e)},future:t.future,isSpaMode:t.isSpaMode}),future:t.future,isSpaMode:t.isSpaMode,serializeError:d=>O(d,e)},c=t.entry.module.default;try{return await c(n,s.statusCode,l,u,a)}catch(d){i(d);let p=d;if(S(d)){let f;try{let h=d.headers.get("Content-Type");h&&/\bapplication\/json\b/.test(h)?d.body==null?f=null:f=await d.json():f=await d.text(),p=new Ae(d.status,d.statusText,f)}catch{}}s=Te(r.dataRoutes,s,p),s.errors&&(s.errors=Z(s.errors,e)),u={...u,staticHandlerContext:s,serverHandoffString:ne({url:s.location.pathname,basename:t.basename,state:{loaderData:s.loaderData,actionData:s.actionData,errors:ee(s.errors,e)},future:t.future,isSpaMode:t.isSpaMode})};try{return await c(n,s.statusCode,l,u,a)}catch(f){return i(f),be(f,e)}}}async function jt(e,t,r,n,a,i){try{let o=await t.queryRoute(n,{routeId:r,requestContext:a});return re(!(L in o),`You cannot return a \`defer()\` response from a Resource Route.  Did you forget to export a default UI component from the "${r}" route?`),re(S(o),"Expected a Response to be returned from queryRoute"),o}catch(o){return S(o)?(o.headers.set("X-Remix-Catch","yes"),o):E(o)?(o&&i(o),we(o,e)):(i(o),be(o,e))}}function we(e,t){return z(O(e.error||new Error("Unexpected Server Error"),t),{status:e.status,statusText:e.statusText,headers:{"X-Remix-Error":"yes"}})}function be(e,t){let r="Unexpected Server Error";return t!==w.Production&&(r+=`

${String(e)}`),new Response(r,{status:500,headers:{"Content-Type":"text/plain"}})}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function U(e){return`__flash_${e}__`}const q=(e={},t="")=>{let r=new Map(Object.entries(e));return{get id(){return t},get data(){return Object.fromEntries(r)},has(n){return r.has(n)||r.has(U(n))},get(n){if(r.has(n))return r.get(n);let a=U(n);if(r.has(a)){let i=r.get(a);return r.delete(a),i}},set(n,a){r.set(n,a)},flash(n,a){r.set(U(n),a)},unset(n){r.delete(n)}}},Mt=e=>e!=null&&typeof e.id=="string"&&typeof e.data<"u"&&typeof e.has=="function"&&typeof e.get=="function"&&typeof e.set=="function"&&typeof e.flash=="function"&&typeof e.unset=="function",Ut=e=>({cookie:t,createData:r,readData:n,updateData:a,deleteData:i})=>{let o=I(t)?t:e((t==null?void 0:t.name)||"__session",t);return Se(o),{async getSession(s,l){let u=s&&await o.parse(s,l),c=u&&await n(u);return q(c||{},u||"")},async commitSession(s,l){let{id:u,data:c}=s,d=(l==null?void 0:l.maxAge)!=null?new Date(Date.now()+l.maxAge*1e3):(l==null?void 0:l.expires)!=null?l.expires:o.expires;return u?await a(u,c,d):u=await r(c,d),o.serialize(u,l)},async destroySession(s,l){return await i(s.id),o.serialize("",{...l,maxAge:void 0,expires:new Date(0)})}}};function Se(e){se(e.isSigned,`The "${e.name}" cookie is not signed, but session cookies should be signed to prevent tampering on the client before they are sent back to the server. See https://remix.run/utils/cookies#signing-cookies for more information.`)}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Lt=e=>({cookie:t}={})=>{let r=I(t)?t:e((t==null?void 0:t.name)||"__session",t);return Se(r),{async getSession(n,a){return q(n&&await r.parse(n,a)||{})},async commitSession(n,a){let i=await r.serialize(n.data,a);if(i.length>4096)throw new Error("Cookie length will exceed browser maximum. Length: "+i.length);return i},async destroySession(n,a){return r.serialize("",{...a,maxAge:void 0,expires:new Date(0)})}}};/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Ft=e=>({cookie:t}={})=>{let r=new Map;return e({cookie:t,async createData(n,a){let i=Math.random().toString(36).substring(2,10);return r.set(i,{data:n,expires:a}),i},async readData(n){if(r.has(n)){let{data:a,expires:i}=r.get(n);if(!i||i>new Date)return a;i&&r.delete(n)}return null},async updateData(n,a,i){r.set(n,{data:a,expires:i})},async deleteData(n){r.delete(n)}})};/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */class ve extends Error{constructor(t,r){super(`Field "${t}" exceeded upload size of ${r} bytes.`),this.field=t,this.maxBytes=r}}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function $t({filter:e,maxPartSize:t=3e6}={}){return async({filename:r,contentType:n,name:a,data:i})=>{if(e&&!await e({filename:r,contentType:n,name:a}))return;let o=0,s=[];for await(let l of i){if(o+=l.byteLength,o>t)throw new ve(a,t);s.push(l)}return typeof r=="string"?new File(s,r,{type:n}):await new Blob(s,{type:n}).text()}}/**
 * @remix-run/server-runtime v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const zt=Object.freeze(Object.defineProperty({__proto__:null,MaxPartSizeExceededError:ve,broadcastDevReady:Dt,createCookieFactory:Ve,createCookieSessionStorageFactory:Lt,createMemorySessionStorageFactory:Ft,createRequestHandler:Tt,createSession:q,createSessionStorageFactory:Ut,defer:lt,isCookie:I,isSession:Mt,json:X,logDevReady:Ot,redirect:ue,redirectDocument:ut,unstable_composeUploadHandlers:it,unstable_createMemoryUploadHandler:$t,unstable_parseMultipartFormData:ot,unstable_setDevServerHooks:At},Symbol.toStringTag,{value:"Module"}));var It={},J={},v={};const _e=He(zt);var T={};/**
 * @remix-run/cloudflare v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */Object.defineProperty(T,"__esModule",{value:!0});const K=new TextEncoder,Nt=async(e,t)=>{let r=await Re(t,["sign"]),n=K.encode(e),a=await crypto.subtle.sign("HMAC",r,n),i=btoa(String.fromCharCode(...new Uint8Array(a))).replace(/=+$/,"");return e+"."+i},Vt=async(e,t)=>{let r=e.lastIndexOf("."),n=e.slice(0,r),a=e.slice(r+1),i=await Re(t,["verify"]),o=K.encode(n),s=Xt(atob(a));return await crypto.subtle.verify("HMAC",i,s,o)?n:!1};async function Re(e,t){return await crypto.subtle.importKey("raw",K.encode(e),{name:"HMAC",hash:"SHA-256"},!1,t)}function Xt(e){let t=new Uint8Array(e.length);for(let r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t}T.sign=Nt;T.unsign=Vt;/**
 * @remix-run/cloudflare v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */Object.defineProperty(v,"__esModule",{value:!0});var P=_e,oe=T;const W=P.createCookieFactory({sign:oe.sign,unsign:oe.unsign}),qt=P.createCookieSessionStorageFactory(W),Ce=P.createSessionStorageFactory(W),Jt=P.createMemorySessionStorageFactory(Ce);v.createCookie=W;v.createCookieSessionStorage=qt;v.createMemorySessionStorage=Jt;v.createSessionStorage=Ce;/**
 * @remix-run/cloudflare v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */Object.defineProperty(J,"__esModule",{value:!0});var Kt=v;function Wt({cookie:e,kv:t}){return Kt.createSessionStorage({cookie:e,async createData(r,n){for(;;){let a=new Uint8Array(8);crypto.getRandomValues(a);let i=[...a].map(o=>o.toString(16).padStart(2,"0")).join("");if(!await t.get(i,"json"))return await t.put(i,JSON.stringify(r),{expiration:n?Math.round(n.getTime()/1e3):void 0}),i}},async readData(r){let n=await t.get(r);return n?JSON.parse(n):null},async updateData(r,n,a){await t.put(r,JSON.stringify(n),{expiration:a?Math.round(a.getTime()/1e3):void 0})},async deleteData(r){await t.delete(r)}})}J.createWorkersKVSessionStorage=Wt;/**
 * @remix-run/cloudflare v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */(function(e){Object.defineProperty(e,"__esModule",{value:!0});var t=J,r=v,n=_e;e.createWorkersKVSessionStorage=t.createWorkersKVSessionStorage,e.createCookie=r.createCookie,e.createCookieSessionStorage=r.createCookieSessionStorage,e.createMemorySessionStorage=r.createMemorySessionStorage,e.createSessionStorage=r.createSessionStorage,Object.defineProperty(e,"MaxPartSizeExceededError",{enumerable:!0,get:function(){return n.MaxPartSizeExceededError}}),Object.defineProperty(e,"broadcastDevReady",{enumerable:!0,get:function(){return n.broadcastDevReady}}),Object.defineProperty(e,"createRequestHandler",{enumerable:!0,get:function(){return n.createRequestHandler}}),Object.defineProperty(e,"createSession",{enumerable:!0,get:function(){return n.createSession}}),Object.defineProperty(e,"defer",{enumerable:!0,get:function(){return n.defer}}),Object.defineProperty(e,"isCookie",{enumerable:!0,get:function(){return n.isCookie}}),Object.defineProperty(e,"isSession",{enumerable:!0,get:function(){return n.isSession}}),Object.defineProperty(e,"json",{enumerable:!0,get:function(){return n.json}}),Object.defineProperty(e,"logDevReady",{enumerable:!0,get:function(){return n.logDevReady}}),Object.defineProperty(e,"redirect",{enumerable:!0,get:function(){return n.redirect}}),Object.defineProperty(e,"redirectDocument",{enumerable:!0,get:function(){return n.redirectDocument}}),Object.defineProperty(e,"unstable_composeUploadHandlers",{enumerable:!0,get:function(){return n.unstable_composeUploadHandlers}}),Object.defineProperty(e,"unstable_createMemoryUploadHandler",{enumerable:!0,get:function(){return n.unstable_createMemoryUploadHandler}}),Object.defineProperty(e,"unstable_parseMultipartFormData",{enumerable:!0,get:function(){return n.unstable_parseMultipartFormData}})})(It);export{lt as a,ut as b,It as d,X as j,ue as r};
