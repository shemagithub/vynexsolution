import{a as i,j as n}from"./components-Y4Kc-98A.js";import{c as w,b as m}from"./heading-DCDhetbK.js";import{t as l,a as r}from"./theme-DwLs_dWQ.js";const p="/assets/gotham-bold-italic-C_msAlmW.woff2",g="/assets/gotham-bold-D1kvQ7KV.woff2",k="/assets/gotham-book-italic-Bm2IEtSK.woff2",$="/assets/gotham-book-Bnaws0Ef.woff2",b="/assets/gotham-medium-italic-Dok430ou.woff2",G="/assets/gotham-medium-0VT3RO8I.woff2",T="/assets/ipa-gothic-DimHCOud.woff2",c=i.createContext({}),E=({theme:t="dark",children:e,className:h,as:u="div",toggleTheme:d,...y})=>{const s=x(),f=!s.theme;return n.jsxs(c.Provider,{value:{theme:t,toggleTheme:d||s.toggleTheme},children:[f&&e,!f&&n.jsx(u,{className:w(h),"data-theme":t,...y,children:e})]})};function x(){return i.useContext(c)}function o(t){return t.replace(/\s\s+/g," ")}function a(t){return o(Object.keys(t).map(e=>`--${e}: ${t[e]};`).join(`

`))}function j(){return o(Object.keys(m).map(t=>`
        @media (max-width: ${m[t]}px) {
          :root {
            ${a(l[t])}
          }
        }
      `).join(`
`))}const I=o(`
  @layer theme, base, components, layout;
`),P=o(`
  :root {
    ${a(l.base)}
  }

  ${j()}

  [data-theme='dark'] {
    ${a(r.dark)}
  }

  [data-theme='light'] {
    ${a(r.light)}
  }
`),v=o(`
  @font-face {
    font-family: Gotham;
    font-weight: 400;
    src: url(${$}) format('woff2');
    font-display: block;
    font-style: normal;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 400;
    src: url(${k}) format('woff2');
    font-display: block;
    font-style: italic;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 500;
    src: url(${G}) format('woff2');
    font-display: block;
    font-style: normal;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 500;
    src: url(${b}) format('woff2');
    font-display: block;
    font-style: italic;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 700;
    src: url(${g}) format('woff2');
    font-display: block;
    font-style: normal;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 700;
    src: url(${p}) format('woff2');
    font-display: block;
    font-style: italic;
  }

  @font-face {
    font-family: IPA Gothic;
    font-weight: 400;
    src: url(${T}) format('woff2');
    font-display: swap;
    font-style: normal;
  }
`),O=o(`
  ${I}

  @layer theme {
    ${P}
    ${v}
  }
`);export{G,E as T,$ as a,O as t,x as u};
