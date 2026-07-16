import{a2 as p,b as m,a3 as d,a4 as w,a as i,a5 as f}from"./components-Y4Kc-98A.js";/**
 * @remix-run/react v2.7.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let n="positions";function g({getKey:o,...a}){let{isSpaMode:l}=p(),r=m(),u=d();w({getKey:o,storageKey:n});let c=i.useMemo(()=>{if(!o)return null;let e=o(r,u);return e!==r.key?e:null},[]);if(l)return null;let y=((e,S)=>{if(!window.history.state||!window.history.state.key){let t=Math.random().toString(32).slice(2);window.history.replaceState({key:t},"")}try{let s=JSON.parse(sessionStorage.getItem(e)||"{}")[S||window.history.state.key];typeof s=="number"&&window.scrollTo(0,s)}catch(t){console.error(t),sessionStorage.removeItem(e)}}).toString();return i.createElement("script",f({},a,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${y})(${JSON.stringify(n)}, ${JSON.stringify(c)})`}}))}export{g as S};
