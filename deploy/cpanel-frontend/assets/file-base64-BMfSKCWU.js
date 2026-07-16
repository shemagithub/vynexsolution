async function f(t){const n=await t.arrayBuffer(),a=new Uint8Array(n);let e="";for(let r=0;r<a.length;r+=32768)e+=String.fromCharCode(...a.subarray(r,r+32768));return btoa(e)}export{f};
