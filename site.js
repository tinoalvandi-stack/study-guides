/* valentino guides · homepage and class welcome pages. Data lives in site-data.js (loaded first).
   No libraries, no tracking beyond the anonymous Vercel page-view script, nothing leaves the browser
   except the optional feedback form. */
"use strict";
const $=s=>document.querySelector(s);
const el=(t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const REDUCED=matchMedia("(prefers-reduced-motion:reduce)").matches;
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const SITE="https://valentinoguides.com";
const n0=new Date(), TODAY=new Date(n0.getTime()-n0.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const COURSE=document.body.dataset.course||"";
const ICON={
 chev:'<svg class="chev" width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>',
 share:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 10V2M5 5l3-3 3 3"/><path d="M3 8v5.5h10V8"/></svg>',
 guide:'<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2.5h8v7H2z"/><path d="M4 5h4M4 7h3"/></svg>',
 cram:'<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1.5 3 7h3l-1 3.5L9 5H6z"/></svg>',
 pdf:'<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 1.5h4l2.5 2.5v6.5H3z"/><path d="M7 1.5V4h2.5"/></svg>',
 quiz:'<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5 5 9l4.5-6"/></svg>',
 arrow:'<svg class="arr" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
function glyphSvg(name,color,size){
  return '<svg class="glyph" viewBox="0 0 26 26" width="'+size+'" height="'+size+'" aria-hidden="true" style="color:'+color+'">'+
   '<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(G[name]||G.flag)+'</g></svg>';
}
const byId=id=>CLASSES.find(c=>c.id===id);
const isNew=d=>d&&(new Date(TODAY)-new Date(d))/864e5<=7;
const live=()=>FEATURES.filter(f=>(f.end||f.test)>=TODAY).sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||a.test.localeCompare(b.test));
const md=s=>{const x=new Date(s+"T12:00:00");return (x.getMonth()+1)+"/"+x.getDate()};
const due=f=>f.test<TODAY&&f.end?f.end:f.test;
const when=f=>{const d=new Date(f.test+"T12:00:00"),now=new Date(TODAY+"T12:00:00");const days=Math.round((d-now)/864e5);
  return days<=0?"today":days===1?"tomorrow":"in "+days+" days"};

/* ═══ class covers: original layered illustrations, one per class (approved design demo, revision 2) ═══ */
let artSerial=0;
function art(id){
  const n="art"+(++artSerial);
  const P={pre:["#1e514d","#123632","#bce3b0","#f5b792"],apush:["#b76045","#72392e","#f8d7ae","#e99b70"],psych:["#66628b","#35364f","#d6c4fa","#f4bcad"],phys:["#356f85","#193c50","#b5e8df","#efc26e"],bus:["#c59342","#8b572b","#ffe5aa","#f5bc75"],mor:["#81586b","#493948","#edbbca","#e9bd86"],lang:["#7a879b","#414e66","#e4e9f0","#edbd9f"],sem:["#779283","#3c594b","#e1e8ba","#edc699"]};
  const [a,b,c,d]=P[id]||P.sem;
  const defs=`<defs><linearGradient id="${n}bg" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="${n}pt" x2=".8" y2="1"><stop stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient><filter id="${n}sh" x="-50%" y="-50%" width="200%" height="210%"><feDropShadow dx="0" dy="9" stdDeviation="9" flood-color="#14211c" flood-opacity=".24"/></filter></defs>`;
  const bg=`<rect width="480" height="300" fill="url(#${n}bg)"/><circle cx="415" cy="20" r="190" fill="${c}" opacity=".06"/><circle cx="30" cy="305" r="170" fill="${d}" opacity=".05"/>`;
  const grid='<path d="M0 60H480M0 100H480M0 140H480M0 180H480M0 220H480M0 260H480M40 0V300M80 0V300M120 0V300M160 0V300M200 0V300M240 0V300M280 0V300M320 0V300M360 0V300M400 0V300M440 0V300" stroke="white" stroke-opacity=".07" fill="none"/>';
  let s="";
  if(id==="pre"){const pts=[];for(let t=0;t<=Math.PI*2+.01;t+=.008){const r=106*Math.cos(3*t);pts.push(`${(252+r*Math.cos(t)).toFixed(1)},${(154+r*Math.sin(t)).toFixed(1)}`)}
    s=grid+`<g stroke="${c}" fill="none" opacity=".25"><circle cx="252" cy="154" r="115"/><circle cx="252" cy="154" r="74"/><path d="M85 154H401M252 22V288M158 61L346 247M155 247L346 60"/></g><polygon points="${pts.join(" ")}" fill="url(#${n}pt)" stroke="${c}" stroke-width="1.5" filter="url(#${n}sh)"/><circle cx="252" cy="154" r="5" fill="${b}"/><g transform="translate(38 213) rotate(-7)" filter="url(#${n}sh)"><rect width="143" height="47" rx="9" fill="#f4e7cb"/><text x="17" y="30" fill="${b}" font-size="19">r = a cos 3θ</text></g><text x="357" y="66" fill="${c}" font-size="13">90°</text>`}
  if(id==="apush")s=`<circle cx="313" cy="122" r="105" fill="${d}" opacity=".25"/><g transform="translate(75 67) rotate(-9 130 100)" filter="url(#${n}sh)"><rect width="263" height="189" rx="8" fill="#f6dfba"/><path d="M23 146H241M36 157H228M55 133V74M91 133V74M127 133V74M163 133V74M199 133V74M39 68H218L129 23Z" fill="none" stroke="${b}" stroke-width="3"/><path d="M25 175H178" stroke="${a}" stroke-width="2"/></g><g transform="translate(316 194)"><circle r="40" fill="${d}"/><circle r="31" stroke="${b}" fill="none" opacity=".6"/><path d="M-16 0H16M0-16V16" stroke="${b}"/><circle r="8" fill="${b}"/></g><path d="M345 64L382 68M343 77L388 82M341 90L374 94" stroke="${c}" opacity=".7" stroke-width="2"/>`;
  if(id==="psych")s=`<g opacity=".14" fill="none" stroke="${c}"><circle cx="240" cy="155" r="113"/><circle cx="240" cy="155" r="92"/><path d="M52 155H427M240 20V287"/></g><path d="M238 72C197 33 153 67 159 102C113 114 116 174 158 180C146 222 200 252 238 217C273 249 320 222 315 183C358 158 341 103 309 102C315 56 271 38 238 72Z" fill="url(#${n}pt)" filter="url(#${n}sh)"/><g fill="none" stroke="${b}" stroke-width="2.4"><path d="M238 76V214M181 97C213 83 229 119 205 137M284 94C260 91 251 115 263 130C288 126 304 151 288 168M164 150C187 136 203 163 192 178M209 204C194 186 222 158 237 166M265 199C253 181 265 172 280 180"/></g><g stroke="${d}" stroke-width="1.5"><path d="M143 114L87 85M328 149L398 134M281 223L339 265M159 190L102 237"/></g><g fill="${d}"><circle cx="87" cy="85" r="8"/><circle cx="398" cy="134" r="12"/><circle cx="339" cy="265" r="7"/><circle cx="102" cy="237" r="10"/></g>`;
  if(id==="phys")s=grid+`<path d="M55 244H424M70 263V55" stroke="${c}" opacity=".5"/><path d="M82 222Q243 -66 406 214" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="5 7"/><path d="M236 92H294M286 86L294 92 286 98" fill="none" stroke="${d}" stroke-width="2"/>`+[[82,222,9],[126,156,13],[183,109,18],[242,92,24],[303,112,31],[355,155,36],[406,214,42]].map(([x,y,r],i)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${n}pt)" opacity="${(.25+i*.12).toFixed(2)}" filter="url(#${n}sh)"/><circle cx="${x-r*.25}" cy="${y-r*.3}" r="${r*.24}" fill="white" opacity="${(.06+i*.016).toFixed(3)}"/>`).join("");
  if(id==="bus")s=`<g stroke="${c}" stroke-opacity=".2" fill="none"><path d="M46 201L253 280 434 187M46 161L253 240 434 147M46 121L253 200 434 107"/></g>`+[[102,166,50],[183,125,91],[267,69,147]].map(([x,y,h])=>`<g filter="url(#${n}sh)"><path d="M${x} ${y}l48-20 35 15-48 21Z" fill="#ffe7b4"/><path d="M${x} ${y}l35 16v${h}l-35-16Z" fill="${d}"/><path d="M${x+35} ${y+16}l48-21v${h}l-48 21Z" fill="${c}"/></g>`).join("")+`<path d="M98 122L205 70 322 32M310 32H322V44" stroke="${c}" stroke-width="2" fill="none"/>`;
  if(id==="mor")s=`<path d="M127 280V124a113 113 0 0 1 226 0V280Z" fill="${c}" opacity=".15"/><path d="M152 280V127a88 88 0 0 1 176 0V280Z" fill="${c}" opacity=".12"/><path d="M177 280V130a63 63 0 0 1 126 0V280Z" fill="${d}" opacity=".19"/><g stroke="${c}" stroke-width="3" fill="none" filter="url(#${n}sh)"><path d="M240 66V235M188 239H292M151 116H329M169 119L135 179H203ZM311 119L277 179H345Z"/><path d="M135 179Q169 217 203 179M277 179Q311 217 345 179" fill="${d}" stroke="${d}"/></g><circle cx="240" cy="115" r="9" fill="${c}"/>`;
  if(id==="lang")s=`<g transform="translate(108 51) rotate(-10 123 95)" filter="url(#${n}sh)"><rect x="12" y="13" width="249" height="199" rx="8" fill="${d}"/><rect width="249" height="199" rx="8" fill="#f4ead8"/><path d="M28 37H161" stroke="${b}" stroke-width="8"/><path d="M28 66H215M28 82H204M28 98H221M28 130H205M28 146H221M28 162H185" stroke="${b}" opacity=".65" stroke-width="2"/><path d="M24 97H155M106 147H221" stroke="${a}" stroke-width="11" opacity=".22"/><path d="M25 179Q86 158 142 179" stroke="${a}" fill="none" stroke-width="2"/></g><g transform="translate(338 95) rotate(28)"><rect width="12" height="133" rx="3" fill="${b}"/><rect width="12" height="30" rx="3" fill="${d}"/><path d="M0 133L6 151 12 133Z" fill="${c}"/></g>`;
  if(id==="sem")s=`<g stroke="${c}" stroke-opacity=".4" stroke-width="1.5" fill="none"><path d="M91 198L167 89 319 104 376 221 223 228Z M167 89L223 228M319 104L91 198"/></g><g filter="url(#${n}sh)"><path d="M90 74h159a17 17 0 0 1 17 17v79a17 17 0 0 1-17 17h-93l-37 29v-29H90a17 17 0 0 1-17-17V91a17 17 0 0 1 17-17Z" fill="${c}"/><path d="M243 127h139a14 14 0 0 1 14 14v64a14 14 0 0 1-14 14h-17v23l-33-23h-89a14 14 0 0 1-14-14v-64a14 14 0 0 1 14-14Z" fill="${d}"/></g><path d="M105 110H223M105 126H208M105 142H180M260 158H364M260 175H349M260 192H309" stroke="${b}" stroke-opacity=".6" stroke-width="3"/>`;
  return `<svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${defs}${bg}${s}</svg>`;
}
const cover=(c,extra)=>`<div class="cover" data-c="${c.id}"><span class="cover-code">${esc(c.short||c.name)}</span>${art(c.id)}${extra||""}</div>`;

/* ═══ theme ═══ */
const seg=$(".seg"), thumb=seg&&seg.querySelector(".thumb"), segBtns=seg?[...seg.querySelectorAll("button")]:[];
function moveThumb(){if(!seg)return;const on=seg.querySelector('button[aria-pressed="true"]')||segBtns[0];thumb.style.left=on.offsetLeft+"px";thumb.style.width=on.offsetWidth+"px"}
function setTheme(mode){
  const apply=()=>{if(mode==="auto")delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=mode};
  if(document.startViewTransition&&!REDUCED)document.startViewTransition(apply);else apply();
  segBtns.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.set===mode)));moveThumb();
  try{mode==="auto"?localStorage.removeItem("theme"):localStorage.setItem("theme",mode)}catch(e){}
}
segBtns.forEach(b=>b.addEventListener("click",()=>setTheme(b.dataset.set)));
(function(){let saved=null;try{saved=localStorage.getItem("theme")}catch(e){}
  const mode=saved==="light"||saved==="dark"?saved:"auto";
  if(mode!=="auto")document.documentElement.dataset.theme=mode;
  segBtns.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.set===mode)));
})();
requestAnimationFrame(moveThumb);addEventListener("resize",moveThumb);

/* ═══ toast, share, recent ═══ */
let toastT=0;
function toast(msg){const t=$("#toast");if(!t)return;t.textContent=msg;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),1600)}
async function share(url,title){
  const u=url.startsWith("http")?url:SITE+url;
  if(navigator.share){try{await navigator.share({title:title,url:u});return}catch(e){if(e.name==="AbortError")return}}
  try{await navigator.clipboard.writeText(u);toast("link copied")}catch(e){prompt("copy this link",u)}
}
function recordOpen(c,u){
  const list=store.get("recent",[]).filter(r=>r.u!==u.url);
  list.unshift({u:u.url,t:u.t,c:c.id,ts:Date.now()});
  store.set("recent",list.slice(0,6));
}
/* one unit row: the guide plus its extras as chips, a share button and a chevron */
function guideLink(c,u,opts){
  opts=opts||{};
  const a=el("a","unit"); a.href=u.url; a.target="_blank"; a.rel="noopener noreferrer";
  if(opts.num){const nm=el("span","unum",String(opts.num).padStart(2,"0"));a.append(nm)}
  else if(opts.glyph){const s=el("span","ug");s.innerHTML=glyphSvg(c.glyph,c.c,20);a.append(s)}
  const rt=el("span","rt"), ut=el("span","ut");
  if(opts.cls){const s=el("span","eyebrow");s.textContent=c.name;s.style.color=c.c;rt.append(s)}
  ut.append(el("span","lt",u.t));
  if(isNew(u.added)&&!opts.noNew)ut.append(el("span","new","new"));
  rt.append(ut);
  if(opts.meta)rt.append(el("span","ld",opts.meta));
  if(u.extras&&u.extras.length&&!opts.compact){
    const kinds=el("span","kinds");
    const mk=(kind,label,url,main)=>{const k=el("a","kind"+(main?" main":""));k.href=url;k.target="_blank";k.rel="noopener noreferrer";
      k.innerHTML=ICON[kind]+esc(label);k.addEventListener("click",e=>{e.stopPropagation();recordOpen(c,u)});return k};
    kinds.append(mk("guide","guide",u.url,true));
    u.extras.forEach(x=>kinds.append(mk(x.kind,x.t,x.url,false)));
    rt.append(kinds);
  }
  a.append(rt);
  a.addEventListener("click",()=>recordOpen(c,u));
  if(!opts.compact){
    const sh=el("button","shr"); sh.type="button"; sh.innerHTML=ICON.share; sh.setAttribute("aria-label","share "+u.t);
    sh.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();share(u.url,c.name+" · "+u.t)});
    a.append(sh);
  }
  const ch=el("span","chw"); ch.innerHTML=ICON.chev; a.append(ch.firstChild);
  return a;
}
/* an up-next card */
function nextCard(f){
  const c=byId(f.classId); if(!c)return null;
  const a=el("a","hero"); a.href=f.url; a.target="_blank"; a.rel="noopener noreferrer";
  a.style.setProperty("--k",c.c);
  a.innerHTML='<span class="hrow">'+glyphSvg(c.glyph,c.c,20)+'<span class="hmeta"><span class="hk"></span><span class="hc">'+when(f)+'</span></span>'+
    '<span class="chip due">'+md(f.test<TODAY&&f.end?f.end:f.test)+(f.end&&f.test>=TODAY?"–"+md(f.end):"")+'</span></span><span class="htitle"></span>'+
    (f.note?'<span class="hnote"></span>':'')+'<span class="go">open the guide'+ICON.arrow+'</span>';
  a.querySelector(".hk").textContent=c.name; a.querySelector(".htitle").textContent=f.title;
  if(f.note)a.querySelector(".hnote").textContent=f.note;
  a.addEventListener("click",()=>recordOpen(c,{url:f.url,t:f.title}));
  return a;
}
function classCounts(c){
  const g=c.units.length, x=c.units.reduce((n,u)=>n+(u.extras||[]).length,0);
  return g?g+(g===1?" study guide":" study guides")+(x?" · "+x+(x===1?" extra":" extras"):""):"no guides yet";
}

/* ═══ homepage ═══ */
if(!COURSE){
  /* up next */
  (function(){
    const L=live(); if(!L.length)return;
    $("#upnext").hidden=false; $("#upn").textContent=L.length+(L.length===1?" test":" tests");
    L.forEach(f=>{const a=nextCard(f);if(a)$("#feat").append(a)});
  })();
  /* recent */
  window.drawRecent=function(){
    const list=store.get("recent",[]).map(r=>({r:r,c:byId(r.c)})).filter(x=>x.c).slice(0,3);
    const sec=$("#recent"), box=$("#recentlist"); box.innerHTML="";
    if(!list.length){sec.hidden=true;return}
    sec.hidden=false;
    list.forEach(x=>box.append(guideLink(x.c,{t:x.r.t,url:x.r.u},{glyph:true,cls:true,noNew:true,compact:true})));
  };
  $("#recentclr").addEventListener("click",()=>{store.set("recent",[]);drawRecent();toast("cleared")});
  drawRecent(); addEventListener("pageshow",drawRecent);
  /* class catalog: classes with guides first, then the ones still to come */
  (function(){
    const L=live();
    const list=[...CLASSES.filter(c=>c.units.length),...CLASSES.filter(c=>!c.units.length)];
    list.forEach((c,i)=>{
      const a=el("a","ccard rise"+(c.units.length?"":" empty")); a.href=c.page; a.style.setProperty("--i",i);
      const nx=L.find(f=>f.classId===c.id);
      a.innerHTML=cover(c,'<span class="cover-arrow">'+ICON.arrow+'</span>')+
        '<span class="cbody"><span class="ctitle"></span><span class="cmeta"></span>'+(nx?'<span class="cnext"></span>':'')+'</span>';
      a.querySelector(".ctitle").textContent=c.name;
      a.querySelector(".cmeta").textContent=classCounts(c);
      if(nx)a.querySelector(".cnext").textContent="test "+when(nx)+" · "+md(due(nx));
      a.setAttribute("aria-label",c.name+", "+classCounts(c));
      $("#catalog").append(a);
    });
    $("#cty").textContent=CLASSES.length+" classes · "+CLASSES.reduce((n,c)=>n+c.units.length,0)+" guides";
  })();
  /* decorative covers beside the heading (desktop only) */
  (function(){const h=$("#homeart");if(!h)return;h.innerHTML='<div class="note b">'+cover(byId("apush"))+'</div><div class="note f">'+cover(byId("pre"))+'</div><span class="note-cap">a fresh look,<br>one class at a time.</span>'})();
  /* fast find */
  const ALIAS={apush:["apush","ush","history","us history","american history","hist"],phys:["physics","phys","kinematics","science"],
    psych:["psych","psychology"],bus:["business","bus","biz","principles"],mor:["morality","religion","theology","catholic","church","social justice"],
    pre:["precalc","precal","pre calc","math","precalculus","trig","vectors","calc","trigonometry","polar"],lang:["lang","english"],sem:["seminar","sem"]};
  const KINDW={cram:["cram","cheat sheet","cheat","one pager","sheet","summary"],pdf:["practice","worksheet","pdf","problems","homework"],quiz:["quiz","quizzes","questions"]};
  const norm=x=>String(x).toLowerCase().replace(/[’']/g,"").replace(/[–—]/g,"-").replace(/[^a-z0-9/&\s-]/g," ")
    .replace(/(\d)\s*\/\s*([a-z])\b/g,"$1$2").replace(/\bu\s?(\d)/g,"unit $1").replace(/\bunit(\d)/g,"unit $1").replace(/\bch(?:apters?)?\.?\s?(\d)/g,"ch $1").replace(/\s+/g," ").trim();
  const INDEX=[];
  CLASSES.forEach(c=>c.units.forEach(u=>INDEX.push({c:c,u:u,title:norm(u.t),cls:norm(c.name),abbr:norm(c.abbr||""),al:ALIAS[c.id]||[],
    ex:(u.extras||[]).map(x=>({x:x,t:norm(x.t)})),added:u.added||""})));
  function rank(query){
    const q=norm(query); if(!q)return {hits:[],q:q};
    const words=q.split(" ");
    const recent=store.get("recent",[]).map(r=>r.u);
    const lv=live().map(f=>f.url);
    const classOnly=CLASSES.find(c=>norm(c.name)===q||norm(c.abbr||"")===q||(ALIAS[c.id]||[]).includes(q));
    let kind=null; for(const k in KINDW)if(KINDW[k].some(w=>q===w||q.includes(w)))kind=k;
    const hits=[];
    INDEX.forEach(it=>{
      let s=0;
      const hasKind=kind&&it.ex.some(e=>e.x.kind===kind);
      const hay=[it.title,it.cls,it.abbr,...it.al,...it.ex.map(e=>e.t),...(hasKind?KINDW[kind]:[])].join(" ");
      if(it.title===q||it.cls+" "+it.title===q)s+=100;
      if(classOnly&&it.c===classOnly)s+=60;
      if(it.title.startsWith(q)||(it.abbr&&(it.abbr+" "+it.title).startsWith(q)))s+=45;
      const hit=words.filter(w=>hay.includes(w)||it.al.some(a=>a.startsWith(w))||it.cls.split(" ").some(cw=>cw.startsWith(w))).length;
      if(hit===words.length)s+=30; else if(hit)s+=8*hit; else return;
      let pick=null;
      if(kind){const e=it.ex.find(e=>e.x.kind===kind); if(e){s+=20;pick=e.x}}
      if(recent.includes(it.u.url))s+=8;
      if(lv.includes(it.u.url))s+=6;
      hits.push({it:it,s:s,pick:pick});
    });
    hits.sort((a,b)=>b.s-a.s||(b.it.added>a.it.added?1:b.it.added<a.it.added?-1:0)||(recent.indexOf(a.it.u.url)+1||99)-(recent.indexOf(b.it.u.url)+1||99));
    return {hits:hits,q:q,classOnly:classOnly,kind:kind};
  }
  const find=$("#find"), findw=$("#findw"), hint=$("#hint");
  let SEL=0, LAST=[];
  function topCard(h){
    const c=h.it.c,u=h.it.u,pick=h.pick;
    const a=el("a","topm"); a.href=(pick||u).url; a.target="_blank"; a.rel="noopener noreferrer";
    a.style.setProperty("--k",c.c);
    const eyebrow=el("span","eyebrow",c.name); eyebrow.style.color=c.c;
    a.append(eyebrow,el("span","tt",u.t));
    if(u.extras&&u.extras.length){
      const kinds=el("span","kinds");
      const mk=(kind,label,url,main)=>{const k=el("a","kind"+(main?" main":""));k.href=url;k.target="_blank";k.rel="noopener noreferrer";
        k.innerHTML=ICON[kind]+esc(label);k.addEventListener("click",e=>{e.stopPropagation();recordOpen(c,u)});return k};
      kinds.append(mk("guide","guide",u.url,!pick));
      u.extras.forEach(x=>kinds.append(mk(x.kind,x.t,x.url,pick===x)));
      a.append(kinds);
    }
    const go=el("span","go"); go.innerHTML=(pick?"open "+esc(pick.t):"open the study guide")+ICON.arrow;
    a.append(go);
    a.addEventListener("click",()=>recordOpen(c,u));
    return a;
  }
  function runSearch(){
    const raw=find.value.trim();
    findw.classList.toggle("has",!!raw); document.body.classList.toggle("searching",!!raw); hint.hidden=!!raw;
    if(!raw){LAST=[];return}
    const r=rank(raw); LAST=r.hits; SEL=0;
    const top=$("#top"), box=$("#inlinelist"), empty=$("#empty");
    top.innerHTML=""; box.innerHTML=""; empty.innerHTML="";
    $("#tophd").hidden=!r.hits.length; $("#otherhd").hidden=r.hits.length<2; box.hidden=r.hits.length<2;
    $("#tophd h3").textContent=r.hits.length&&r.hits[0].s<30?"closest match":"top match";
    if(!r.hits.length){
      const d=el("div","nores");
      const p=el("p"); p.append("no guide found for “"+raw+"”."); d.append(p);
      const sug=el("div","sugs");
      CLASSES.filter(c=>c.units.length).forEach(c=>{const b=el("button","eg",(c.abbr||c.name).toLowerCase());b.type="button";b.dataset.q=(c.abbr||c.name).toLowerCase();sug.append(b)});
      d.append(el("span","sl","try a class:"),sug);
      const req=el("button","reqg","can’t find it? request a guide"); req.type="button"; req.addEventListener("click",()=>{if(window.openFeedback)window.openFeedback("rq")});
      d.append(req); empty.append(d); $("#inlinen").textContent=""; return;
    }
    $("#inlinen").textContent=r.hits.length+(r.hits.length===1?" guide":" guides");
    top.append(topCard(r.hits[0]));
    r.hits.slice(1,8).forEach(h=>box.append(guideLink(h.it.c,h.it.u,{glyph:true,cls:true,compact:true})));
  }
  function openTop(){const h=LAST[SEL]; if(!h)return; recordOpen(h.it.c,h.it.u); window.open((h.pick||h.it.u).url,"_blank","noopener")}
  find.addEventListener("input",runSearch);
  findw.addEventListener("submit",e=>{e.preventDefault();openTop()});
  $("#findclr").addEventListener("click",()=>{find.value="";runSearch();find.focus()});
  find.addEventListener("keydown",e=>{
    if(e.key==="Escape"){find.value="";runSearch();find.blur();return}
    if(!LAST.length)return;
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();SEL=(SEL+(e.key==="ArrowDown"?1:-1)+LAST.length)%LAST.length;
      const rows=[$("#top .topm"),...$("#inlinelist").querySelectorAll(".unit")];rows.forEach((r,i)=>r&&r.classList.toggle("sel",i===SEL));}
  });
  document.addEventListener("click",e=>{const b=e.target.closest(".eg"); if(!b)return; find.value=b.dataset.q; runSearch(); find.focus()});
  const focusFind=()=>{find.scrollIntoView({block:"center",behavior:REDUCED?"auto":"smooth"});find.focus({preventScroll:true})};
  $("#searchOpen").addEventListener("click",focusFind);
  addEventListener("keydown",e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();focusFind()}
    if(e.key==="/"&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)){e.preventDefault();focusFind()}
  });
  if(location.hash==="#find")setTimeout(focusFind,120);
  $("#browse").addEventListener("click",e=>{e.preventDefault();$("#classes").scrollIntoView({behavior:REDUCED?"auto":"smooth",block:"start"})});

  /* feedback + request a guide */
  (function(){
    const FORM="https://docs.google.com/forms/d/e/1FAIpQLSfQ5elBMrus2Kv3GGbnliZ-VN3lhgjMbgetnqPRYhuYX1vKNA/formResponse";
    const PICKS=["hard to find things","too long","want more classes","want flashcards","want quizzes","looks off on my phone","other…"];
    const fb=$("#fb"), card=$("#fbcard"), pill=$("#fbpill"), form=$("#fbform"),
          starsEl=$(".stars"), picksEl=$("#fbpicks"), note=$("#fbnote"), send=$("#fbsend");
    let stars=0, picked=new Set(), busy=false;
    const STAR='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>';
    for(let i=1;i<=5;i++){
      const b=el("button"); b.type="button"; b.innerHTML=STAR; b.dataset.v=i;
      b.setAttribute("role","radio"); b.setAttribute("aria-label",i+(i===1?" star":" stars"));
      b.onclick=()=>{stars=i; paint(); check()};
      starsEl.append(b);
    }
    PICKS.forEach(p=>{
      const b=el("button","pick",p); b.type="button"; b.setAttribute("aria-pressed","false");
      b.onclick=()=>{
        const on=!picked.has(p); on?picked.add(p):picked.delete(p);
        b.setAttribute("aria-pressed",String(on));
        if(p==="other…"){note.classList.toggle("show",on); if(on)note.focus()}
        check();
      };
      picksEl.append(b);
    });
    function paint(){[...starsEl.children].forEach((b,i)=>{b.classList.toggle("lit",i<stars);b.setAttribute("aria-checked",String(i===stars-1))})}
    function check(){ send.disabled=busy||!(stars||picked.size||note.value.trim()) }
    note.addEventListener("input",check);
    function open(tab){
      fb.classList.add("on"); pill.setAttribute("aria-expanded","true"); card.setAttribute("aria-hidden","false");
      if(tab)setTab(tab); else requestAnimationFrame(fThumb);
      setTimeout(()=>card.focus({preventScroll:true}),60);
    }
    let close=function(){
      fb.classList.remove("on"); pill.setAttribute("aria-expanded","false"); card.setAttribute("aria-hidden","true");
      pill.focus({preventScroll:true});
    };
    const fseg=$("#fbseg"), fthumb=fseg.querySelector(".thumb"), fbtns=[...fseg.querySelectorAll("button")];
    function fThumb(){const on=fseg.querySelector('button[aria-pressed="true"]')||fbtns[0];fthumb.style.left=on.offsetLeft+"px";fthumb.style.width=on.offsetWidth+"px"}
    function setTab(t){fbtns.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tab===t)));fb.classList.toggle("rq",t==="rq");requestAnimationFrame(fThumb)}
    fbtns.forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
    addEventListener("resize",fThumb);
    pill.onclick=()=>open(); window.openFeedback=t=>open(t);
    $("#fbclose").onclick=()=>close();
    const q=new URLSearchParams(location.search);
    if(location.hash==="#request"||q.has("request"))setTimeout(()=>open("rq"),900);
    else if(location.hash==="#feedback"||q.has("feedback"))setTimeout(()=>open(),900);
    addEventListener("keydown",e=>{ if(e.key==="Escape"&&fb.classList.contains("on"))close() });
    addEventListener("pointerdown",e=>{ if(fb.classList.contains("on")&&!fb.contains(e.target))close() });
    form.addEventListener("submit",async e=>{
      e.preventDefault(); if(busy)return;
      if(form.botcheck.value)return;
      busy=true; send.textContent="sending…"; check();
      const picks=[...picked].filter(p=>p!=="other…");
      const data=new URLSearchParams();
      data.set("entry.576362932",stars?stars+"/5":"none");
      data.set("entry.1638729526",picks.length?picks.join(", "):"none");
      data.set("entry.1486272230",(note.value.trim()||"none")+"\npage: "+location.pathname);
      try{
        await fetch(FORM,{method:"POST",mode:"no-cors",body:data});
        fb.classList.add("sent");
        setTimeout(()=>{close(); setTimeout(()=>{
          fb.classList.remove("sent"); stars=0; picked.clear(); note.value=""; note.classList.remove("show");
          paint(); [...picksEl.children].forEach(b=>b.setAttribute("aria-pressed","false"));
          busy=false; send.textContent="send"; check();
        },400)},1800);
      }catch(_){busy=false; send.textContent="try again"; check()}
    });
    const rq=$("#rqform"), rqsend=$("#rqsend"), rqodds=$("#rqodds"), wantEl=$("#rqwant"), cls=rq.cls;
    const WANTS=["cram sheet","summary of my notes","practice questions","full guide"];
    let want=new Set(), rbusy=false;
    CLASSES.forEach(c=>{const o=el("option",null,c.name);o.value=c.name;cls.append(o)});
    const oth=el("option",null,"a class i'm not in"); oth.value="other"; cls.append(oth);
    WANTS.forEach(w=>{
      const b=el("button","pick",w); b.type="button"; b.setAttribute("aria-pressed","false");
      b.onclick=()=>{const on=!want.has(w); on?want.add(w):want.delete(w); b.setAttribute("aria-pressed",String(on)); rcheck()};
      wantEl.append(b);
    });
    const mine=()=>cls.value&&cls.value!=="other";
    const clsname=$("#rqclsname");
    const clsLabel=()=>mine()?cls.value:rq.clsname.value.trim()+" (not my class)";
    function odds(){
      if(!cls.value){rqodds.textContent="";rqodds.classList.remove("no");return}
      rqodds.classList.toggle("no",!mine());
      rqodds.textContent=mine()?"i'm in this class, so decent odds.":"not my class. from your notes i can do a cram sheet or a summary, not a full guide.";
      if(!mine()&&want.has("full guide")){want.delete("full guide");[...wantEl.children].forEach(b=>{if(b.textContent==="full guide")b.setAttribute("aria-pressed","false")})}
      [...wantEl.children].forEach(b=>{if(b.textContent==="full guide")b.disabled=!mine()});
    }
    cls.addEventListener("change",()=>{cls.classList.toggle("ph",!cls.value);clsname.hidden=cls.value!=="other";if(!clsname.hidden)clsname.focus();odds();rcheck()});
    function rcheck(){
      const ok=rq.name.value.trim()&&rq.ig.value.trim()&&cls.value&&(mine()||rq.clsname.value.trim())&&rq.teacher.value.trim()&&rq.lesson.value.trim()&&want.size;
      rqsend.disabled=rbusy||!ok;
    }
    rq.addEventListener("input",rcheck);
    rq.addEventListener("submit",async e=>{
      e.preventDefault(); if(rbusy)return;
      if(rq.botcheck.value)return;
      rbusy=true; rqsend.textContent="sending…"; rcheck();
      const data=new URLSearchParams();
      data.set("entry.576362932","request");
      data.set("entry.1638729526","guide request · "+clsLabel());
      data.set("entry.1486272230",["name: "+rq.name.value.trim(),"ig: @"+rq.ig.value.trim().replace(/^@/,""),"class: "+clsLabel(),
        "teacher: "+rq.teacher.value.trim(),"unit: "+rq.lesson.value.trim(),"wants: "+[...want].join(", "),"page: "+location.pathname].join("\n"));
      try{await fetch(FORM,{method:"POST",mode:"no-cors",body:data});fb.classList.add("sent")}
      catch(_){rbusy=false; rqsend.textContent="try again"; rcheck()}
    });
    const _close=close;
    close=function(){
      _close();
      if(fb.classList.contains("sent")&&fb.classList.contains("rq")){
        setTimeout(()=>{fb.classList.remove("sent"); rq.reset(); cls.classList.add("ph"); clsname.hidden=true; want.clear();
          [...wantEl.children].forEach(b=>b.setAttribute("aria-pressed","false")); odds(); rbusy=false; rqsend.textContent="next: send files"; rcheck(); setTab("fb")},400);
      }
    };
  })();
}

/* ═══ class welcome page ═══ */
if(COURSE){
  const c=byId(COURSE);
  const main=$("#main");
  if(!c){main.innerHTML='<p class="lost">this class is not on the site. <a href="/">see all classes</a></p>'}
  else{
    document.documentElement.style.setProperty("--k",c.c);
    const L=live().filter(f=>f.classId===c.id);
    const n=c.units.length, pdfs=c.units.reduce((k,u)=>k+(u.extras||[]).filter(x=>x.kind==="pdf").length,0),
          cram=c.units.reduce((k,u)=>k+(u.extras||[]).filter(x=>x.kind==="cram").length,0),
          quiz=c.units.reduce((k,u)=>k+(u.extras||[]).filter(x=>x.kind==="quiz").length,0);
    const facts=[n?n+(n===1?" study guide":" study guides"):"",cram?cram+(cram===1?" cram sheet":" cram sheets"):"",pdfs?pdfs+" practice "+(pdfs===1?"pdf":"pdfs"):"",quiz?quiz+(quiz===1?" quiz or game":" quizzes and games"):""].filter(Boolean);
    const hero=el("section","chero");
    hero.dataset.c=c.id;
    hero.innerHTML=`<div class="ccopy"><span class="welcome">welcome to</span><h1></h1><p class="blurb"></p>`+
      (facts.length?`<ul class="facts">${facts.map(f=>`<li>${esc(f)}</li>`).join("")}</ul>`:"")+
      `<div class="cta"></div></div>`+cover(c);
    hero.querySelector("h1").textContent=c.name;
    hero.querySelector(".blurb").textContent=c.blurb||"";
    const cta=hero.querySelector(".cta");
    if(n){const first=L[0]||null;
      const b=el("a","btn"); b.href=first?first.url:c.units[0].url; b.target="_blank"; b.rel="noopener noreferrer";
      b.innerHTML=esc(first?"open "+first.title.replace(/ study guide$/i,"")+" · test "+md(due(first)):"open the newest guide")+ICON.arrow;
      b.addEventListener("click",()=>recordOpen(c,first?{url:first.url,t:first.title}:c.units[0]));
      cta.append(b);
    }
    main.append(hero);
    if(!n){
      const e=el("section","emptyc");
      e.innerHTML='<h2>no guides here yet</h2><p>there are no '+esc(c.name)+' guides on the site so far. when one is made it shows up on this page first. in the meantime, the other classes are one tap away.</p><div class="cta"><a class="btn" href="/#classes">see all classes'+ICON.arrow+'</a><a class="btn ghost" href="/?request">request a guide</a></div>';
      main.append(e);
    }else{
      const grid=el("div","cgrid2");
      const side=el("aside","cside");
      if(L.length){
        side.innerHTML='<div class="sh"><h3>up next</h3></div>';
        L.forEach(f=>{const a=nextCard(f);if(a)side.append(a)});
      }
      const tips=el("div","howto");
      tips.innerHTML='<div class="sh"><h3>how to use a guide</h3></div><ol><li><b>focus on these ideas</b> is the short version of the whole guide.</li><li>lessons run heaviest first; <b>jump to topic</b> lists them, and the ones marked <i>tested most</i> come first.</li><li>answer every <b>on the test</b> question before you check it.</li><li>finish with <b>try practice</b>; <i>retry missed</i> loops back to what you got wrong.</li></ol>';
      side.append(tips);
      const list=el("section","units");
      list.innerHTML='<div class="sh"><h3>study guides</h3><span class="shx">newest first</span></div>';
      const grp=el("div","group");
      c.units.forEach((u,i)=>{const lv=L.find(f=>f.url===u.url);grp.append(guideLink(c,u,{num:n-i,meta:lv?"test "+when(lv)+" · "+md(due(lv)):(u.added?"added "+md(u.added):"")}))});
      list.append(grp);
      grid.append(list,side);
      main.append(grid);
    }
  }
  const sb=$("#searchOpen"); if(sb)sb.addEventListener("click",()=>{location.href="/#find"});
}

/* ═══ bar shadow on scroll ═══ */
(function(){const bar=$("#bar");if(!bar)return;let raf=0;const tick=()=>{raf=0;bar.classList.toggle("stuck",scrollY>6)};
  addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(tick)},{passive:true});tick()})();
