import{a as l,j as n}from"./components-Y4Kc-98A.js";import{c as p,b as m}from"./heading-Cfboomy2.js";import{t as i,a as r}from"./theme-DlsysgG7.js";const w="/assets/black-ops-one-BmN5PRvP.woff2",g="/assets/gotham-bold-italic-C_msAlmW.woff2",k="/assets/gotham-bold-D1kvQ7KV.woff2",$="/assets/gotham-book-italic-Bm2IEtSK.woff2",b="/assets/gotham-book-Bnaws0Ef.woff2",G="/assets/gotham-medium-italic-Dok430ou.woff2",T="/assets/gotham-medium-0VT3RO8I.woff2",x="/assets/ipa-gothic-DimHCOud.woff2",c=l.createContext({}),E=({theme:t="dark",children:a,className:h,as:u="div",toggleTheme:y,...d})=>{const s=B(),f=!s.theme;return n.jsxs(c.Provider,{value:{theme:t,toggleTheme:y||s.toggleTheme},children:[f&&a,!f&&n.jsx(u,{className:p(h),"data-theme":t,...d,children:a})]})};function B(){return l.useContext(c)}function o(t){return t.replace(/\s\s+/g," ")}function e(t){return o(Object.keys(t).map(a=>`--${a}: ${t[a]};`).join(`

`))}function P(){return o(Object.keys(m).map(t=>`
        @media (max-width: ${m[t]}px) {
          :root {
            ${e(i[t])}
          }
        }
      `).join(`
`))}const j=o(`
  @layer theme, base, components, layout;
`),O=o(`
  :root {
    ${e(i.base)}
  }

  ${P()}

  [data-theme='dark'] {
    ${e(r.dark)}
  }

  [data-theme='light'] {
    ${e(r.light)}
  }
`),v=o(`
  @font-face {
    font-family: Gotham;
    font-weight: 400;
    src: url(${b}) format('woff2');
    font-display: block;
    font-style: normal;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 400;
    src: url(${$}) format('woff2');
    font-display: block;
    font-style: italic;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 500;
    src: url(${T}) format('woff2');
    font-display: block;
    font-style: normal;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 500;
    src: url(${G}) format('woff2');
    font-display: block;
    font-style: italic;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 700;
    src: url(${k}) format('woff2');
    font-display: block;
    font-style: normal;
  }

  @font-face {
    font-family: Gotham;
    font-weight: 700;
    src: url(${g}) format('woff2');
    font-display: block;
    font-style: italic;
  }

  @font-face {
    font-family: IPA Gothic;
    font-weight: 400;
    src: url(${x}) format('woff2');
    font-display: swap;
    font-style: normal;
  }

  @font-face {
    font-family: 'Black Ops One';
    font-weight: 400;
    src: url(${w}) format('woff2');
    font-display: swap;
    font-style: normal;
  }
`),R=o(`
  ${j}

  @layer theme {
    ${O}
    ${v}
  }
`);export{w as B,T as G,E as T,b as a,R as t,B as u};
