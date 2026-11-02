/* valentino guides · homepage and class welcome pages. Data lives in site-data.js (loaded first).
   No libraries, no tracking beyond the anonymous Vercel page-view script, nothing leaves the browser
   except the optional feedback form. */
"use strict";
/* Public listing policy: preserve archived source data, omit the former Spanish course. */
const PUBLIC_CLASSES = CLASSES.filter(c => c.id !== "span");
const PUBLIC_FEATURES = FEATURES.filter(f => f.classId !== "span");
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
 audio:'<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.8 4.6h2l3-2.4v7.6l-3-2.4h-2z"/><path d="M9 4.2a2.6 2.6 0 0 1 0 3.6"/></svg>',
 box:'<svg class="bx" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect class="bxr" x="1.3" y="1.3" width="11.4" height="11.4" rx="3.2"/><path class="bxc" d="M4 7.2 6.1 9.3 10 4.9"/></svg>',
 arrow:'<svg class="arr" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
function glyphSvg(name,color,size){
  return '<svg class="glyph" viewBox="0 0 26 26" width="'+size+'" height="'+size+'" aria-hidden="true" style="color:'+color+'">'+
   '<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(G[name]||G.flag)+'</g></svg>';
}
const byId=id=>PUBLIC_CLASSES.find(c=>c.id===id);
const isNew=d=>d&&(new Date(TODAY)-new Date(d))/864e5<=7;
const live=()=>PUBLIC_FEATURES.filter(f=>(f.end||f.test)>=TODAY).sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||a.test.localeCompare(b.test));
const md=s=>{const x=new Date(s+"T12:00:00");return (x.getMonth()+1)+"/"+x.getDate()};
const due=f=>f.test<TODAY&&f.end?f.end:f.test;
const when=f=>{const d=new Date(f.test+"T12:00:00"),now=new Date(TODAY+"T12:00:00");const days=Math.round((d-now)/864e5);
  return days<=0?"today":days===1?"tomorrow":"in "+days+" days"};

/* ═══ class covers: the paper stack. One original line drawing per class on a pale sheet that shows the selected class
   and its newest guide (approved minimal revision, November 1 2026). The drawing is aria-hidden and never needed to navigate; only the pause button is exposed.
   CSS transitions, no animation loop: nothing runs while idle. "pause motion" and prefers-reduced-motion keep it still. ═══ */
const DIAG={
 sem:'<path d="M30 30h165v70H75l-30 25v-25H30zM85 70h150v70h-30l20 25-50-25H85"/>',
 bus:'<path d="M40 155V20m0 135h200M55 137 205 38M55 40l150 95"/>',
 mor:'<circle cx="135" cy="90" r="62"/><path d="m94 89 27 27 55-58"/>',
 pre:'<path d="M20 90h230M135 10v160M35 140C80 140 75 28 130 28s50 120 100 120"/>',
 apush:'<path d="m40 62 95-40 95 40H40m5 92h180M65 76v64m47-64v64m47-64v64m47-64v64"/>',
 psych:'<circle cx="135" cy="88" r="64"/><path d="M135 25v127M88 43c50 7 25 70 47 73m49-73c-50 7-25 70-47 73M80 88h110"/>',
 lang:'<path d="M35 35c40-12 70-12 100 3 30-15 60-15 100-3v115c-40-12-70-12-100 3-30-15-60-15-100-3zM135 38v115M53 60h60m-60 20h60m42-20h60m-60 20h60"/>',
 phys:'<path d="M24 149H252M55 160V10" opacity=".25"/><rect x="103" y="65" width="64" height="57"/><path d="M135 65V12m-6 8 6-8 6 8M167 94h75m-8-6 8 6-8 6M135 122v47m-6-8 6 8 6-8M103 94H36m8-6-8 6 8 6"/></g><g fill="#195bdb" stroke="none" font-family="Arial,Helvetica,sans-serif" font-size="12"><text x="144" y="24">N</text><text x="219" y="82">F</text><text x="144" y="164">mg</text><text x="39" y="82">f</text>'
};
const MOTION_OFF=()=>REDUCED||store.get("motion","")==="paused";
function makeStack(host){
  if(!host)return {show(){}};
  host.removeAttribute("aria-hidden");
  host.innerHTML='<div class="orbit" aria-hidden="true"></div><div class="stack" aria-hidden="true"><div class="paper"><div class="plabel">valentino guides</div></div>'+
    '<div class="paper"><div class="plabel">practice / cram sheet</div></div><div class="paper"><div class="plabel"><span class="pc"></span><span class="pn"></span></div>'+
    '<div class="ptitle"></div><svg class="pdiag" viewBox="0 0 270 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"></svg>'+
    '<div class="pfoot"><span>study guide</span><span>→</span></div></div></div>';
  const stack=host.querySelector(".stack"), mb=el("button","motion"); mb.type="button";
  if(!REDUCED)host.append(mb);
  let paused=MOTION_OFF(), raf=0, fanT=0, cur="";
  const paint=()=>{host.classList.toggle("still",paused);mb.textContent=paused?"resume motion":"pause motion";mb.setAttribute("aria-pressed",String(paused))};
  mb.addEventListener("click",()=>{paused=!paused;store.set("motion",paused?"paused":"");stack.style.transform="";paint()});
  paint();
  host.addEventListener("pointermove",e=>{if(paused||e.pointerType!=="mouse"||raf)return;raf=requestAnimationFrame(()=>{raf=0;
    const b=host.getBoundingClientRect(),px=(e.clientX-b.left)/b.width-.5,py=(e.clientY-b.top)/b.height-.5;
    stack.style.transform=`rotateX(${(12-py*9).toFixed(2)}deg) rotateY(${(-23+px*12).toFixed(2)}deg) rotateZ(9deg)`})});
  host.addEventListener("pointerleave",()=>{stack.style.transform=""});
  return {show(c,title,num){
    const key=c.id+"|"+title+"|"+num; if(key===cur)return; cur=key;
    host.querySelector(".pc").textContent=c.name.toLowerCase();
    host.querySelector(".pn").textContent=num;
    const t=host.querySelector(".ptitle"); t.textContent=title.toLowerCase(); t.classList.toggle("long",title.length>26);
    host.querySelector(".pdiag").innerHTML='<g stroke="#195bdb" stroke-width="'+(c.id==="phys"?1.7:2)+'">'+(DIAG[c.id]||DIAG.sem)+'</g>';
    if(!paused){stack.classList.add("fan");clearTimeout(fanT);fanT=setTimeout(()=>stack.classList.remove("fan"),450)}
  }};
}

/* ═══ theme: one compact button cycling auto → light → dark. localStorage "theme" keeps "auto", "light" or "dark";
   auto removes the override and follows the system. New visitors (nothing saved) start dark, as before. ═══ */
const THEMES=["auto","light","dark"], thm=$("#thm");
const TICON={
 auto:'<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 2a7 7 0 0 1 0 14z" fill="currentColor"/></svg>',
 light:'<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="3.4"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4"/></svg>',
 dark:'<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M14.6 11.4A6.5 6.5 0 0 1 6.6 3.4a6.5 6.5 0 1 0 8 8z"/></svg>'};
function paintTheme(mode){
  if(!thm)return; const next=THEMES[(THEMES.indexOf(mode)+1)%THEMES.length];
  thm.innerHTML=TICON[mode]; thm.dataset.mode=mode; thm.title="theme: "+mode;
  thm.setAttribute("aria-label","theme: "+mode+". switch to "+next);
}
function setTheme(mode){
  const apply=()=>{if(mode==="auto")delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=mode};
  if(document.startViewTransition&&!REDUCED)document.startViewTransition(apply);else apply();
  paintTheme(mode);
  try{localStorage.setItem("theme",mode)}catch(e){}
}
(function(){let saved=null;try{saved=localStorage.getItem("theme")}catch(e){}
  const mode=saved==="light"||saved==="auto"?saved:"dark";
  if(mode!=="auto")document.documentElement.dataset.theme=mode;else delete document.documentElement.dataset.theme;
  paintTheme(mode);
  if(thm)thm.addEventListener("click",()=>setTheme(THEMES[(THEMES.indexOf(thm.dataset.mode||mode)+1)%THEMES.length]));
})();

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
/* studied ticks: kept in this browser only, never sent anywhere */
const studied=()=>new Set(store.get("studied",[]));
function setStudied(url,on){const s=studied();if(on)s.add(url);else s.delete(url);store.set("studied",[...s])}
/* lesson topics from site-topics.js (generated by tools/sync-guides.mjs): TOPICS["/guide"] = [[lesson title, key terms…], …], lesson n at #s-n */
const baseUrl=u=>String(u).split("#")[0];
const topicsOf=u=>(typeof TOPICS!=="undefined"&&TOPICS[baseUrl(u.url)])||[];
/* printable practice (tests, quizzes, exams, prompt sets) gets bold chips; keys, audio and study sheets do not */
const isPractice=t=>/\b(tests?|quiz(?:zes)?|exams?|prompts?)\b/i.test(t)&&!/\bkey\b|audio|script/i.test(t);
/* one unit row: the guide plus its extras as chips, a share button and a chevron */
function guideLink(c,u,opts){
  opts=opts||{};
  const a=el("a","unit"); a.href=opts.href||u.url; a.target="_blank"; a.rel="noopener noreferrer";
  if(opts.num){const nm=el("span","unum",String(opts.num).padStart(2,"0"));a.append(nm)}
  else if(opts.glyph){const s=el("span","ug");s.innerHTML=glyphSvg(c.glyph,c.c,20);a.append(s)}
  const rt=el("span","rt"), ut=el("span","ut");
  if(opts.cls){const s=el("span","eyebrow");s.textContent=c.name;s.style.color=c.c;rt.append(s)}
  ut.append(el("span","lt",u.t));
  if(isNew(u.added)&&!opts.noNew)ut.append(el("span","new","new"));
  rt.append(ut);
  if(opts.cls&&c.warn)rt.append(el("span","uwarn",c.warn));
  if(opts.meta)rt.append(el("span","ld",opts.meta));
  if(opts.topics){const tp=topicsOf(u).slice(0,3).map(l=>l[0]);if(tp.length){const t=el("span","ltp",tp.join(" · "));t.title=tp.join(" · ");rt.append(t)}}
  const hasX=u.extras&&u.extras.length&&!opts.compact;
  if(hasX||opts.check){
    const kinds=el("span","kinds");
    const mk=(kind,label,url,main)=>{const k=el("a","kind"+(main?" main":""));k.href=url;k.target="_blank";k.rel="noopener noreferrer";
      k.innerHTML=ICON[kind]+esc(label);k.addEventListener("click",e=>{e.stopPropagation();recordOpen(c,u)});return k};
    if(hasX){kinds.append(mk("guide","Guide",u.url,true));appendExtras(kinds,u.extras,mk,null)}
    if(opts.check){
      /* studied: a toggle kept in this browser only */
      const on0=studied().has(u.url); if(on0)a.classList.add("done");
      const ck=el("button","kind stud"+(on0?" on":"")); ck.type="button"; ck.innerHTML=ICON.box+"Studied";
      ck.setAttribute("aria-pressed",String(on0)); ck.setAttribute("aria-label","Studied: "+u.t);
      ck.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();const on=ck.getAttribute("aria-pressed")!=="true";
        setStudied(u.url,on);ck.setAttribute("aria-pressed",String(on));ck.classList.toggle("on",on);a.classList.toggle("done",on)});
      /* share sits in the chip row on class pages, so phone rows keep their width for the title and chips */
      const sc=el("button","kind shc"); sc.type="button"; sc.innerHTML=ICON.share+"Share"; sc.setAttribute("aria-label","share "+u.t);
      sc.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();share(u.url,c.name+" · "+u.t)});
      kinds.append(ck,sc);
    }
    rt.append(kinds);
  }
  a.append(rt);
  a.addEventListener("click",()=>recordOpen(c,u));
  if(!opts.compact&&!opts.check){
    const sh=el("button","shr"); sh.type="button"; sh.innerHTML=ICON.share; sh.setAttribute("aria-label","share "+u.t);
    sh.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();share(u.url,c.name+" · "+u.t)});
    a.append(sh);
  }
  const ch=el("span","chw"); ch.innerHTML=ICON.chev; a.append(ch.firstChild);
  return a;
}
/* extras as chips, labelled as written; versions of one test (same g) share one labelled group of short chips,
   and so does a run of lettered practice files ("Practice test A (PDF)", "… B (PDF)" → "Practice tests (PDF)" A B), as in the guide's own strip */
const SER=/^(practice (?:test|quiz|exam))\s+([A-Z])\s*\(PDF\)$/i, PLUR={test:"tests",quiz:"quizzes",exam:"exams"};
function appendExtras(box,xs,mk,pick){
  for(let i=0;i<xs.length;){const x=xs[i];
    const m=!x.g&&SER.exec(x.t);
    if(m){let j=i;while(j<xs.length&&!xs[j].g){const mm=SER.exec(xs[j].t);if(!mm||mm[1].toLowerCase()!==m[1].toLowerCase())break;j++}
      if(j-i>1){const lab=m[1].replace(/(test|quiz|exam)$/i,w=>PLUR[w.toLowerCase()])+" (PDF)";
        const g=el("span","kgrp prac"); g.setAttribute("role","group"); g.setAttribute("aria-label",lab);
        const l=el("span","kgl"); l.innerHTML=ICON.pdf; l.append(document.createTextNode(lab)); g.append(l);
        xs.slice(i,j).forEach(y=>{const k=mk(y.kind,SER.exec(y.t)[2],y.url,pick===y);k.querySelector("svg")?.remove();k.setAttribute("aria-label",y.t);g.append(k)});
        box.append(g); i=j; continue}}
    if(!x.g){const k=mk(x.kind,x.t,x.url,pick===x);if(x.kind==="pdf"&&isPractice(x.t))k.classList.add("prac");box.append(k);i++;continue}
    let j=i;while(j<xs.length&&xs[j].g===x.g)j++;
    const g=el("span","kgrp"+(isPractice(x.g)?" prac":"")); g.setAttribute("role","group"); g.setAttribute("aria-label",x.g);
    const l=el("span","kgl"); l.innerHTML=ICON[x.kind]||""; l.append(document.createTextNode(x.g)); g.append(l);
    xs.slice(i,j).forEach(y=>{const k=mk(y.kind,y.s||y.t,y.url,pick===y);k.querySelector("svg")?.remove();k.setAttribute("aria-label",y.g+", "+y.t);g.append(k)});
    box.append(g); i=j}
}
/* countdown ring: the arc is the days left out of two weeks, so it shrinks as the test gets close; on the day it is full and shows the class icon */
function ring(f,c){
  const days=Math.max(0,Math.round((new Date(f.test+"T12:00:00")-new Date(TODAY+"T12:00:00"))/864e5));
  const R=19, C=2*Math.PI*R, len=days?C*Math.min(days,14)/14:C;
  return '<span class="ring'+(days?"":" now")+'" aria-hidden="true"><svg viewBox="0 0 44 44" width="44" height="44"><circle class="rt" cx="22" cy="22" r="'+R+'"/>'+
    '<circle class="ra" cx="22" cy="22" r="'+R+'" stroke-dasharray="'+len.toFixed(2)+' '+C.toFixed(2)+'" style="--len:'+len.toFixed(2)+'"/></svg>'+
    (days?'<b>'+days+'</b>':glyphSvg(c.glyph,"var(--k)",18))+'</span>';
}
/* an up-next card */
function nextCard(f){
  const c=byId(f.classId); if(!c)return null;
  const a=el("a","hero"); a.href=f.url; a.target="_blank"; a.rel="noopener noreferrer";
  a.style.setProperty("--k",c.c);
  const span=md(f.test<TODAY&&f.end?f.end:f.test)+(f.end&&f.test>=TODAY?"–"+md(f.end):"");
  a.innerHTML='<span class="hrow">'+ring(f,c)+'<span class="hmeta"><span class="hk"></span><span class="hc">'+when(f)+' · '+span+'</span></span></span><span class="htitle"></span>'+
    (f.note?'<span class="hnote"></span>':'')+'<span class="go">open the guide'+ICON.arrow+'</span>';
  a.querySelector(".hk").textContent=c.name; a.querySelector(".htitle").textContent=f.title;
  if(f.note)a.querySelector(".hnote").textContent=f.note;
  a.addEventListener("click",()=>recordOpen(c,{url:f.url,t:f.title}));
  return a;
}
function classCounts(c){
  const g=c.units.length, p=c.units.reduce((n,u)=>n+(u.extras||[]).filter(x=>x.kind==="pdf").length,0);
  return g?g+(g===1?" study guide":" study guides")+(p?" · "+p+(p===1?" practice PDF":" practice PDFs"):""):"no guides yet";
}

/* ═══ up next calendar: civil-date helpers (pure; tests in tools/test-calendar.mjs) ═══
   Dates are civil days as "YYYY-MM-DD". "Today" is the America/Los_Angeles calendar day, whatever the viewer's own time zone;
   all arithmetic runs on UTC midnights, so DST changes and the viewer's offset never shift a day. Events come only from the
   public FEATURES entries of public classes (Spanish excluded), each pointing at a listed guide; test..end is inclusive.
   An entry may carry unconfirmed:true to stay out of the calendar until its date is confirmed. */
const CAL_TZ="America/Los_Angeles";
const DOW=["mon","tue","wed","thu","fri","sat","sun"], DOW_LONG=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const MON=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"],
      MON_LONG=["january","february","march","april","may","june","july","august","september","october","november","december"];
function civilToday(now,tz){
  const p={}; new Intl.DateTimeFormat("en-US",{timeZone:tz||CAL_TZ,year:"numeric",month:"2-digit",day:"2-digit"})
    .formatToParts(now||new Date()).forEach(x=>{p[x.type]=x.value});
  return p.year+"-"+p.month+"-"+p.day;
}
const dayMs=k=>Date.UTC(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10));
const validDay=k=>typeof k==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(k)&&new Date(dayMs(k)).toISOString().slice(0,10)===k;
const addDays=(k,n)=>new Date(dayMs(k)+n*864e5).toISOString().slice(0,10);
const dowOf=k=>(new Date(dayMs(k)).getUTCDay()+6)%7;
const mondayOf=k=>addDays(k,-dowOf(k));
const dnum=k=>+k.slice(8,10), mon=k=>MON[+k.slice(5,7)-1];
function calEvents(features,classes){
  return features.map(f=>{
    if(!f||f.unconfirmed||!validDay(f.test))return null;
    const c=classes.find(x=>x.id===f.classId);
    if(!c||!c.units.some(u=>baseUrl(u.url)===baseUrl(f.url)))return null;
    const end=validDay(f.end)&&f.end>=f.test?f.end:f.test;
    return {c:c,f:f,start:f.test,end:end,url:f.url,t:f.title,sub:String(f.title).replace(/\s+study guide$/i,"").replace(/\s+guide$/i,"")};
  }).filter(Boolean).sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end));
}
const onDay=(e,k)=>e.start<=k&&k<=e.end;
const inWeek=(e,ws)=>e.start<=addDays(ws,6)&&e.end>=ws;
/* the current Monday–Sunday week, unless nothing in it is still ahead and the next week has a test */
function defaultWeek(today,evs){
  const cur=mondayOf(today), nxt=addDays(cur,7);
  if(evs.some(e=>inWeek(e,cur)&&e.end>=today))return cur;
  return evs.some(e=>inWeek(e,nxt))?nxt:cur;
}
function weekLabel(ws){const we=addDays(ws,6);return mon(ws)+" "+dnum(ws)+"–"+(mon(we)!==mon(ws)?mon(we)+" ":"")+dnum(we)}
function rangeLabel(e){return DOW[dowOf(e.start)]+" "+dnum(e.start)+(e.end!==e.start?"–"+(mon(e.end)!==mon(e.start)?mon(e.end)+" ":"")+dnum(e.end):"")}
const longDay=k=>DOW_LONG[dowOf(k)]+", "+MON_LONG[+k.slice(5,7)-1]+" "+dnum(k);
/* end of calendar helpers */

/* ═══ up next calendar: one week strip and its agenda (approved November 1 2026). Arrows change the week and clear the
   day; a day filters the agenda (again to clear); the range label shows the whole week. Left/right/Home/End move between
   days with one tab stop. The default week follows Pacific "today" on a day change or when the page comes back, unless
   the reader has browsed to another week. All text goes in with textContent. ═══ */
function makeCalendar(root,evs,now){
  const prev=root.querySelector("#calprev"), next=root.querySelector("#calnext"), lab=root.querySelector("#callabel"),
        days=root.querySelector("#caldays"), agenda=root.querySelector("#calagenda");
  let today=civilToday(now()), ws=defaultWeek(today,evs), sel=null, browsed=false;
  const btns=()=>[...days.children];
  function render(focusKey){
    const we=addDays(ws,6);
    lab.textContent=weekLabel(ws);
    lab.setAttribute("aria-label","show every test, "+longDay(ws)+" to "+longDay(we));
    const stop=sel||(today>=ws&&today<=we?today:ws);
    days.replaceChildren();
    for(let i=0;i<7;i++){
      const key=addDays(ws,i), n=evs.filter(e=>onDay(e,key)).length;
      const b=el("button","day"+(n?" has":"")+(key===today?" today":"")); b.type="button"; b.dataset.date=key;
      b.setAttribute("aria-pressed",String(sel===key)); b.tabIndex=key===stop?0:-1;
      if(key===today)b.setAttribute("aria-current","date");
      b.setAttribute("aria-label",longDay(key)+(key===today?", today":"")+", "+(n?n+(n===1?" test":" tests"):"no tests listed"));
      const dot=el("span","dot"); dot.setAttribute("aria-hidden","true");
      b.append(el("span","dow",DOW[i]),el("span","date",String(dnum(key))),dot);
      b.addEventListener("click",()=>{sel=sel===key?null:key;render(key)});
      b.addEventListener("keydown",e=>{
        const k={ArrowRight:1,ArrowLeft:-1}[e.key], all=btns(); let j=null;
        if(k)j=(i+k+7)%7; else if(e.key==="Home")j=0; else if(e.key==="End")j=6;
        if(j===null)return; e.preventDefault(); all.forEach((x,m)=>{x.tabIndex=m===j?0:-1}); all[j].focus();
      });
      days.append(b);
    }
    const list=sel?evs.filter(e=>onDay(e,sel)):evs.filter(e=>inWeek(e,ws));
    agenda.replaceChildren();
    list.forEach(e=>{
      const a=el("a","evt"); a.href=e.url; a.target="_blank"; a.rel="noopener noreferrer";
      const t=el("time",null,rangeLabel(e)); t.setAttribute("datetime",e.start);
      const tx=el("span","etx"); tx.append(el("b",null,e.c.name),el("small",null,e.sub));
      const ar=el("span","earr","→"); ar.setAttribute("aria-hidden","true");
      a.append(t,tx,ar); a.addEventListener("click",()=>recordOpen(e.c,{url:e.url,t:e.t}));
      agenda.append(a);
    });
    if(!list.length)agenda.append(el("p","cnone",sel?"no tests listed for this day.":"no tests listed for this week."));
    if(focusKey){const f=btns().find(b=>b.dataset.date===focusKey)||btns().find(b=>b.tabIndex===0);if(f)f.focus()}
  }
  const go=n=>{ws=addDays(ws,7*n);sel=null;browsed=ws!==defaultWeek(today,evs);render()};
  prev.addEventListener("click",()=>go(-1)); next.addEventListener("click",()=>go(1));
  lab.addEventListener("click",()=>{sel=null;render()});
  /* a new Pacific day, or the page coming back: move today, and the default week unless the reader browsed to a week
     or picked a day. Focus survives the re-render: a focused day returns to that day (or the week's tab stop), a focused
     agenda link to the same guide's new link, or to the range label when that guide has left the view. */
  function refresh(){
    const t=civilToday(now()); if(t===today)return false;
    today=t;
    if(!browsed&&!sel)ws=defaultWeek(today,evs);
    const a=document.activeElement, day=btns().find(b=>b===a), link=a&&a.parentNode===agenda&&a.className==="evt"?a.getAttribute("href"):null;
    render(day?day.dataset.date:null);
    if(link){const n=[...agenda.children].find(x=>x.className==="evt"&&x.getAttribute("href")===link);(n||lab).focus()}
    return true;
  }
  render();
  return {refresh:refresh,state:()=>({today:today,ws:ws,sel:sel,browsed:browsed})};
}
/* end of calendar controller */

/* ═══ homepage ═══ */
if(!COURSE){
  /* up next: the week calendar beside the class index (replaces the old list on this page; class pages keep their rows) */
  (function(){
    const root=$("#cal"); if(!root)return;
    root.hidden=false;
    const cal=makeCalendar(root,calEvents(PUBLIC_FEATURES,PUBLIC_CLASSES),()=>new Date());
    const check=()=>{if(document.visibilityState!=="hidden")cal.refresh()};
    addEventListener("pageshow",check); addEventListener("focus",check); document.addEventListener("visibilitychange",check);
    setInterval(check,60000);
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
  /* class index: numbered rows, classes with guides first, then the ones still to come. Each row names the newest real guide,
     quietly adds the next test date, "2 of 6 studied" and any class notice, and sets the paper stack on hover or keyboard focus. */
  (function(){
    const L=live(), stack=makeStack($("#homeart"));
    const list=[...PUBLIC_CLASSES.filter(c=>c.units.length),...PUBLIC_CLASSES.filter(c=>!c.units.length)];
    const rows=[];
    const fill=(a,c)=>{
      const S=studied(), box=a.querySelector(".latest"), nx=L.find(f=>f.classId===c.id), done=c.units.filter(u=>S.has(u.url)).length;
      box.textContent=c.units.length?c.units[0].t:"no guides yet";
      if(nx){box.append(" · ");box.append(el("span","q","test "+md(due(nx))))}
      if(done){box.append(" · ");box.append(el("span","ok",done+" of "+c.units.length+" studied"))}
      if(c.warn)box.append(el("span","uwarn",c.warn));
    };
    const pick=(a,c,n)=>{rows.forEach(r=>r.classList.toggle("on",r===a));stack.show(c,c.units.length?c.units[0].t:"soon",n)};
    list.forEach((c,i)=>{
      const n=String(i+1).padStart(2,"0"), a=el("a","crow"); a.href=c.page; a.dataset.cls=c.id;
      a.innerHTML='<span class="num" aria-hidden="true"></span><span class="cname"></span><span class="latest"></span><span class="go" aria-hidden="true">→</span>';
      a.querySelector(".num").textContent=n; a.querySelector(".cname").textContent=c.name;
      fill(a,c);
      a.addEventListener("pointerenter",()=>pick(a,c,n)); a.addEventListener("focusin",()=>pick(a,c,n));
      rows.push(a); $("#catalog").append(a);
    });
    $("#cty").textContent=PUBLIC_CLASSES.length+" classes · "+PUBLIC_CLASSES.reduce((n,c)=>n+c.units.length,0)+" guides";
    /* start on the class with the soonest test, else the first row */
    const first=L.length?list.findIndex(c=>c.id===L[0].classId):0, s=Math.max(0,first);
    if(list[s]){stack.show(list[s],list[s].units.length?list[s].units[0].t:"soon",String(s+1).padStart(2,"0"))}
    $("#catalog").addEventListener("pointerleave",()=>rows.forEach(r=>r.classList.remove("on")));
    /* studied ticks change on class pages; refresh when this page comes back */
    addEventListener("pageshow",()=>rows.forEach(a=>fill(a,byId(a.dataset.cls))));
  })();
  /* fast find */
  const ALIAS={apush:["apush","ush","history","us history","american history","hist"],phys:["physics","phys","kinematics","science"],
    psych:["psych","psychology"],bus:["business","bus","biz","principles"],mor:["morality","religion","theology","catholic","church","social justice"],
    pre:["precalc","precal","pre calc","math","precalculus","trig","vectors","calc","trigonometry","polar"],lang:["lang","english"],sem:["seminar","sem"],
    span:["spanish","span","ap spanish","espanol","uc scout","ucscout","scout"]};
  const KINDW={cram:["cram","cheat sheet","cheat","one pager","sheet","summary"],pdf:["practice","worksheet","pdf","problems","homework"],quiz:["quiz","quizzes","questions"],audio:["audio","listening","listen","mp3"]};
  const norm=x=>String(x).toLowerCase().replace(/[’']/g,"").replace(/[–—]/g,"-").replace(/[^a-z0-9/&\s-]/g," ")
    .replace(/(\d)\s*\/\s*([a-z])\b/g,"$1$2").replace(/\bu\s?(\d)/g,"unit $1").replace(/\bunit(\d)/g,"unit $1").replace(/\bch(?:apters?)?\.?\s?(\d)/g,"ch $1").replace(/\s+/g," ").trim();
  const INDEX=[];
  PUBLIC_CLASSES.forEach(c=>c.units.forEach(u=>INDEX.push({c:c,u:u,title:norm(u.t),cls:norm(c.name),abbr:norm(c.abbr||""),al:ALIAS[c.id]||[],
    ex:(u.extras||[]).map(x=>({x:x,t:norm(x.t)})),added:u.added||"",
    tp:topicsOf(u).map((l,i)=>({n:i+1,raw:l[0],title:norm(l[0]).split(" "),tok:norm(l.join(" ")).split(" ")}))})));
  const STOP=new Set(["the","and","of","for","to","in","on","with","what","how","why","is","are","a","an","vs"]);
  /* the lesson whose title, key terms or test line hold every word the unit itself does not; title words count more */
  function lessonFor(it,rest){
    let best=null,bs=0;
    for(const l of it.tp){
      if(!rest.every(w=>l.tok.some(t=>t.startsWith(w))))continue;
      const sc=1+rest.filter(w=>l.title.some(t=>t.startsWith(w))).length/rest.length;
      if(sc>bs){bs=sc;best=l}
    }
    return best?{l:best,sc:bs}:null;
  }
  function rank(query){
    const q=norm(query); if(!q)return {hits:[],q:q};
    const words=q.split(" ");
    const recent=store.get("recent",[]).map(r=>r.u);
    const lv=live().map(f=>f.url);
    const classOnly=PUBLIC_CLASSES.find(c=>norm(c.name)===q||norm(c.abbr||"")===q||(ALIAS[c.id]||[]).includes(q));
    let kind=null; for(const k in KINDW)if(KINDW[k].some(w=>q===w||q.includes(w)))kind=k;
    const hits=[];
    INDEX.forEach(it=>{
      let s=0;
      const hasKind=kind&&it.ex.some(e=>e.x.kind===kind);
      const hay=[it.title,it.cls,it.abbr,...it.al,...it.ex.map(e=>e.t),...(hasKind?KINDW[kind]:[])].join(" ");
      if(it.title===q||it.cls+" "+it.title===q)s+=100;
      if(classOnly&&it.c===classOnly)s+=60;
      if(it.title.startsWith(q)||(it.abbr&&(it.abbr+" "+it.title).startsWith(q)))s+=45;
      const tok=hay.split(" ");
      const inMain=w=>tok.some(t=>t.startsWith(w))||it.al.some(a=>a.startsWith(w))||it.cls.split(" ").some(cw=>cw.startsWith(w));
      const rest=words.filter(w=>!inMain(w)), hit=words.length-rest.length;
      const key=rest.filter(w=>!STOP.has(w));
      const les=key.length&&key.some(w=>w.length>2)?lessonFor(it,key):null;
      /* a lesson match ranks under a unit whose own title has every word, but still counts as a top match */
      if(!rest.length)s+=30; else if(les)s+=24+(les.sc>=2?4:0); else if(hit)s+=8*hit; else return;
      let pick=null;
      if(kind){const e=it.ex.find(e=>e.x.kind===kind); if(e){s+=20;pick=e.x}}
      if(recent.includes(it.u.url))s+=8;
      if(lv.includes(it.u.url))s+=6;
      hits.push({it:it,s:s,pick:pick,les:les?les.l:null});
    });
    hits.sort((a,b)=>b.s-a.s||(b.it.added>a.it.added?1:b.it.added<a.it.added?-1:0)||(recent.indexOf(a.it.u.url)+1||99)-(recent.indexOf(b.it.u.url)+1||99));
    return {hits:hits,q:q,classOnly:classOnly,kind:kind};
  }
  const find=$("#find"), findw=$("#findw"), hint=$("#hint");
  let SEL=0, LAST=[];
  /* Keep the keyboard selection, outline included, clear of the sticky bar and the window's bottom edge.
     The bar is measured on every move, so a resized or rewrapped bar is never stale. */
  function keepSelClear(r){
    const cs=getComputedStyle(r), pad=8+(cs.outlineStyle==="none"?0:Math.max(0,(parseFloat(cs.outlineWidth)||0)+(parseFloat(cs.outlineOffset)||0)));
    const bar=$(".bar"), top=Math.max(0,bar?bar.getBoundingClientRect().bottom:0)+pad, bottom=innerHeight-pad;
    r.style.scrollMarginTop=top+"px"; r.style.scrollMarginBottom=pad+"px";
    r.scrollIntoView({block:"nearest",behavior:"auto"});
    /* where scrollIntoView ignores scroll-margin, apply the same clearance directly */
    const b=r.getBoundingClientRect();
    if(b.top<top)scrollBy(0,b.top-top); else if(b.bottom>bottom)scrollBy(0,Math.min(b.bottom-bottom,b.top-top));
  }
  function topCard(h){
    const c=h.it.c,u=h.it.u,pick=h.pick;
    const a=el("a","topm"); a.href=(pick||u).url; a.target="_blank"; a.rel="noopener noreferrer";
    a.style.setProperty("--k",c.c);
    const eyebrow=el("span","eyebrow",c.name); eyebrow.style.color=c.c;
    a.append(eyebrow,el("span","tt",u.t));
    if(c.warn)a.append(el("span","uwarn",c.warn));
    if(h.les&&!pick){a.href=baseUrl(u.url)+"#s-"+h.les.n;const l=el("span","tles");l.append(el("span","tln","lesson "+h.les.n),document.createTextNode(h.les.raw));a.append(l)}
    if(u.extras&&u.extras.length){
      const kinds=el("span","kinds");
      const mk=(kind,label,url,main)=>{const k=el("a","kind"+(main?" main":""));k.href=url;k.target="_blank";k.rel="noopener noreferrer";
        k.innerHTML=ICON[kind]+esc(label);k.addEventListener("click",e=>{e.stopPropagation();recordOpen(c,u)});return k};
      kinds.append(mk("guide","guide",u.url,!pick));
      appendExtras(kinds,u.extras,mk,pick);
      a.append(kinds);
    }
    const go=el("span","go"); go.innerHTML=(pick?"open "+esc(pick.t):h.les?"open this lesson":"open the study guide")+ICON.arrow;
    a.append(go);
    a.addEventListener("click",()=>recordOpen(c,u));
    return a;
  }
  function runSearch(){
    const raw=find.value.trim();
    $("#searchSelection").textContent="";
    findw.classList.toggle("has",!!raw); document.body.classList.toggle("searching",!!raw); hint.hidden=!!raw;
    if(!raw){LAST=[];return}
    const r=rank(raw); LAST=r.hits; SEL=0;
    const top=$("#top"), box=$("#inlinelist"), empty=$("#empty");
    top.innerHTML=""; box.innerHTML=""; empty.innerHTML="";
    $("#tophd").hidden=!r.hits.length; $("#otherhd").hidden=r.hits.length<2; box.hidden=r.hits.length<2;
    $("#tophd h2, #tophd h3").textContent=r.hits.length&&r.hits[0].s<30&&!r.hits[0].les?"closest match":"top match";
    if(!r.hits.length){
      const d=el("div","nores");
      const p=el("p"); p.append("no guide found for “"+raw+"”."); d.append(p);
      const sug=el("div","sugs");
      PUBLIC_CLASSES.filter(c=>c.units.length).forEach(c=>{const b=el("button","eg",(c.abbr||c.name).toLowerCase());b.type="button";b.dataset.q=(c.abbr||c.name).toLowerCase();sug.append(b)});
      d.append(el("span","sl","try a class:"),sug);
      const req=el("button","reqg","can’t find it? request a guide"); req.type="button"; req.addEventListener("click",()=>{if(window.openFeedback)window.openFeedback("rq")});
      d.append(req); empty.append(d); $("#inlinen").textContent=""; return;
    }
    $("#inlinen").textContent=r.hits.length+(r.hits.length===1?" guide":" guides");
    top.append(topCard(r.hits[0]));
    r.hits.slice(1).forEach(h=>box.append(guideLink(h.it.c,h.it.u,h.les?{glyph:true,cls:true,compact:true,href:baseUrl(h.it.u.url)+"#s-"+h.les.n,meta:"lesson "+h.les.n+" · "+h.les.raw}:{glyph:true,cls:true,compact:true})));
  }
  function openTop(){const h=LAST[SEL]; if(!h)return; recordOpen(h.it.c,h.it.u); window.open(h.pick?h.pick.url:h.les?baseUrl(h.it.u.url)+"#s-"+h.les.n:h.it.u.url,"_blank","noopener")}
  find.addEventListener("input",runSearch);
  findw.addEventListener("submit",e=>{e.preventDefault();openTop()});
  $("#findclr").addEventListener("click",()=>{find.value="";runSearch();find.focus()});
  find.addEventListener("keydown",e=>{
    if(e.key==="Escape"){find.value="";runSearch();find.blur();return}
    if(!LAST.length)return;
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();SEL=(SEL+(e.key==="ArrowDown"?1:-1)+LAST.length)%LAST.length;
      const rows=[$("#top .topm"),...$("#inlinelist").querySelectorAll(".unit")];rows.forEach((r,i)=>{if(!r)return;r.classList.toggle("sel",i===SEL);if(i===SEL)r.setAttribute("aria-current","true");else r.removeAttribute("aria-current")});
      if(rows[SEL])keepSelClear(rows[SEL]);
      const hit=LAST[SEL];$("#searchSelection").textContent="Result "+(SEL+1)+" of "+LAST.length+": "+hit.it.c.name+", "+hit.it.u.t+(hit.les?", lesson "+hit.les.n+", "+hit.les.raw:"")+". Press Enter to open.";}
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
    /* status line (role=status): sending, sent, and why a send failed. Google Forms sends no CORS headers,
       so a no-cors POST only proves the entry left the browser, never that the form saved it; the wording says exactly that. */
    const stat=$("#fbstatus");
    const say=(msg,kind)=>{stat.textContent=msg||"";stat.className="fbstat"+(kind?" "+kind:"")};
    const TIMEOUT=15000;
    const FAIL={offline:"you're offline, so nothing was sent. what you wrote is still here; try again once you're connected.",
      timeout:"no answer after 15 seconds, so it may not have gone through. what you wrote is still here; try again.",
      network:"couldn't send. check your connection and try again. what you wrote is still here."};
    async function post(data){
      if(navigator.onLine===false){const x=new Error("offline");x.kind="offline";throw x}
      const ac=typeof AbortController==="function"?new AbortController():null;
      const t=ac?setTimeout(()=>ac.abort(),TIMEOUT):0;
      try{await fetch(FORM,{method:"POST",mode:"no-cors",body:data,signal:ac?ac.signal:undefined})}
      catch(e){const x=new Error(e&&e.message||"network");x.kind=ac&&ac.signal.aborted?"timeout":"network";throw x}
      finally{clearTimeout(t)}
    }
    const STAR='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>';
    for(let i=1;i<=5;i++){
      const b=el("button"); b.type="button"; b.innerHTML=STAR; b.dataset.v=i;
      b.setAttribute("role","radio"); b.setAttribute("aria-label",i+(i===1?" star":" stars"));
      b.onclick=()=>{stars=i; paint(); check()};
      starsEl.append(b);
    }
    /* radio group keys: arrows select the next or previous rating and move focus to it (roving tabindex) */
    starsEl.addEventListener("keydown",e=>{
      const bs=[...starsEl.children], i=bs.indexOf(document.activeElement); if(i<0)return;
      const k={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key]; let j=null;
      if(k)j=(i+k+bs.length)%bs.length; else if(e.key==="Home")j=0; else if(e.key==="End")j=bs.length-1;
      if(j===null)return; e.preventDefault(); stars=j+1; paint(); check(); bs[j].focus();
    });
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
    function paint(){[...starsEl.children].forEach((b,i)=>{b.classList.toggle("lit",i<stars);b.setAttribute("aria-checked",String(i===stars-1));b.tabIndex=(stars?i===stars-1:i===0)?0:-1})}
    paint();
    function check(){ send.disabled=busy||!(stars||picked.size||note.value.trim()) }
    note.addEventListener("input",check);
    function open(tab){
      fb.classList.add("on"); pill.setAttribute("aria-expanded","true"); card.setAttribute("aria-hidden","false");
      if(!fb.classList.contains("sent"))say("");
      if(tab)setTab(tab); else requestAnimationFrame(fThumb);
      setTimeout(()=>card.focus({preventScroll:true}),60);
    }
    let close=function(){
      fb.classList.remove("on"); pill.setAttribute("aria-expanded","false"); card.setAttribute("aria-hidden","true");
      pill.focus({preventScroll:true});
    };
    /* tabs: aria-selected, one tab in the Tab order, its panel shown; arrows, Home and End switch tabs */
    const fseg=$("#fbseg"), fthumb=fseg.querySelector(".thumb"), fbtns=[...fseg.querySelectorAll('[role="tab"]')];
    function fThumb(){const on=fseg.querySelector('[aria-selected="true"]')||fbtns[0];fthumb.style.left=on.offsetLeft+"px";fthumb.style.width=on.offsetWidth+"px"}
    function setTab(t,focus){
      fbtns.forEach(b=>{const on=b.dataset.tab===t;b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;
        const p=document.getElementById(b.getAttribute("aria-controls")); if(p)p.hidden=!on; if(on&&focus)b.focus()});
      fb.classList.toggle("rq",t==="rq"); if(!fb.classList.contains("sent"))say(""); requestAnimationFrame(fThumb);
    }
    fbtns.forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
    fseg.addEventListener("keydown",e=>{
      const i=fbtns.indexOf(document.activeElement); if(i<0)return;
      const k={ArrowRight:1,ArrowLeft:-1}[e.key]; let j=null;
      if(k)j=(i+k+fbtns.length)%fbtns.length; else if(e.key==="Home")j=0; else if(e.key==="End")j=fbtns.length-1;
      if(j===null)return; e.preventDefault(); setTab(fbtns[j].dataset.tab,true);
    });
    addEventListener("resize",fThumb);
    pill.onclick=()=>open(); window.openFeedback=t=>open(t);
    document.querySelectorAll("[data-fb]").forEach(b=>b.addEventListener("click",()=>open(b.dataset.fb)));
    $("#fbclose").onclick=()=>close();
    const q=new URLSearchParams(location.search);
    if(location.hash==="#request"||q.has("request"))setTimeout(()=>open("rq"),900);
    else if(location.hash==="#feedback"||q.has("feedback"))setTimeout(()=>open(),900);
    addEventListener("keydown",e=>{ if(e.key==="Escape"&&fb.classList.contains("on"))close() });
    addEventListener("pointerdown",e=>{ if(fb.classList.contains("on")&&!fb.contains(e.target))close() });
    form.addEventListener("submit",async e=>{
      e.preventDefault(); if(busy)return;
      if(form.botcheck.value)return;
      busy=true; send.textContent="sending…"; say("sending…","quiet"); check();
      const picks=[...picked].filter(p=>p!=="other…");
      const data=new URLSearchParams();
      data.set("entry.576362932",stars?stars+"/5":"none");
      data.set("entry.1638729526",picks.length?picks.join(", "):"none");
      data.set("entry.1486272230",(note.value.trim()||"none")+"\npage: "+location.pathname);
      try{
        await post(data);
        fb.classList.add("sent");
        say("sent. it left your browser, but this page can't confirm the form saved it.","quiet");
        setTimeout(()=>{close(); setTimeout(()=>{
          fb.classList.remove("sent"); stars=0; picked.clear(); note.value=""; note.classList.remove("show");
          paint(); [...picksEl.children].forEach(b=>b.setAttribute("aria-pressed","false"));
          busy=false; send.textContent="send"; say(""); check();
        },400)},3200);
      }catch(err){busy=false; send.textContent="try again"; say(FAIL[err.kind]||FAIL.network,"err"); check()}
    });
    const rq=$("#rqform"), rqsend=$("#rqsend"), rqodds=$("#rqodds"), wantEl=$("#rqwant"), cls=rq.cls;
    const WANTS=["cram sheet","summary of my notes","practice questions","full guide"];
    let want=new Set(), rbusy=false;
    PUBLIC_CLASSES.forEach(c=>{const o=el("option",null,c.name);o.value=c.name;cls.append(o)});
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
      rbusy=true; rqsend.textContent="sending…"; say("sending…","quiet"); rcheck();
      const data=new URLSearchParams();
      data.set("entry.576362932","request");
      data.set("entry.1638729526","guide request · "+clsLabel());
      data.set("entry.1486272230",["name: "+rq.name.value.trim(),"ig: @"+rq.ig.value.trim().replace(/^@/,""),"class: "+clsLabel(),
        "teacher: "+rq.teacher.value.trim(),"unit: "+rq.lesson.value.trim(),"wants: "+[...want].join(", "),"page: "+location.pathname].join("\n"));
      try{await post(data);fb.classList.add("sent");say("sent. now dm the files. this page can't confirm the request arrived, so your dm is what confirms it.","quiet")}
      catch(err){rbusy=false; rqsend.textContent="try again"; say(FAIL[err.kind]||FAIL.network,"err"); rcheck()}
    });
    const _close=close;
    close=function(){
      _close();
      if(fb.classList.contains("sent")&&fb.classList.contains("rq")){
        setTimeout(()=>{fb.classList.remove("sent"); rq.reset(); cls.classList.add("ph"); clsname.hidden=true; want.clear();
          [...wantEl.children].forEach(b=>b.setAttribute("aria-pressed","false")); odds(); rbusy=false; rqsend.textContent="next: send files"; rcheck(); say(""); setTab("fb")},400);
      }
    };
  })();
}

/* ═══ class welcome page: heading and counts, quiet up-next rows, every guide as a numbered row (chips, studied, share),
   and the paper stack beside the list on wide screens, following the hovered or focused guide ═══ */
if(COURSE){
  const c=byId(COURSE);
  const main=$("#main");
  if(!c){main.insertAdjacentHTML("beforeend",'<p class="lost">this class is not on the site. <a href="/">see all classes</a></p>')}
  else{
    document.documentElement.style.setProperty("--k",c.c);
    const L=live().filter(f=>f.classId===c.id);
    const n=c.units.length, pdfs=c.units.reduce((k,u)=>k+(u.extras||[]).filter(x=>x.kind==="pdf").length,0),
          cram=c.units.reduce((k,u)=>k+(u.extras||[]).filter(x=>x.kind==="cram").length,0),
          quiz=c.units.reduce((k,u)=>k+(u.extras||[]).filter(x=>x.kind==="quiz").length,0),
          audio=c.units.reduce((k,u)=>k+(u.extras||[]).filter(x=>x.kind==="audio").length,0);
    const facts=[n?n+(n===1?" study guide":" study guides"):"",cram?cram+(cram===1?" cram sheet":" cram sheets"):"",pdfs?pdfs+" practice "+(pdfs===1?"pdf":"pdfs"):"",quiz?quiz+(quiz===1?" quiz":" quizzes"):"",audio?audio+(audio===1?" audio page":" audio pages"):""].filter(Boolean);
    const grid=el("div","cgrid"), col=el("div","ccol"), art=el("div","cart");
    const head=el("header","chead"); head.append(el("h1",null,c.name));
    if(facts.length)head.append(el("p","cfacts",facts.join(" · ")));
    if(c.warn)head.append(el("p","cwarn",c.warn));
    col.append(head);
    if(L.length){
      const nx=el("section","cnext"); nx.setAttribute("aria-label","up next");
      L.forEach(f=>{const a=nextCard(f);if(a)nx.append(a)});
      col.append(nx);
    }
    if(!n){
      const e=el("section","emptyc");
      e.innerHTML='<h2>no guides here yet</h2><p></p><a href="/#classes">see all classes</a><a href="/?request">request a guide</a>';
      e.querySelector("p").textContent="There are no "+c.name+" guides on the site so far. When one is made, it shows up here first.";
      col.append(e);
    }else{
      const list=el("section","units"); list.setAttribute("aria-labelledby","uh");
      list.innerHTML='<div class="sh"><h2 id="uh">study guides</h2><span class="shx"></span></div>';
      list.querySelector(".shx").textContent=String(n).padStart(2,"0");
      const grp=el("div","group"), stack=makeStack(art);
      c.units.forEach((u,i)=>{const lv=L.find(f=>f.url===u.url), num=String(n-i).padStart(2,"0");
        const row=guideLink(c,u,{num:n-i,topics:true,check:true,meta:lv?"test "+when(lv)+" · "+md(due(lv)):(u.added?"added "+md(u.added):"")});
        const show=()=>stack.show(c,u.t,num);
        row.addEventListener("pointerenter",show); row.addEventListener("focusin",show);
        grp.append(row)});
      list.append(grp); col.append(list);
      const lead=L.length?c.units.find(u=>u.url===L[0].url)||c.units[0]:c.units[0];
      stack.show(c,lead.t,String(n-c.units.indexOf(lead)).padStart(2,"0"));
    }
    grid.append(col,art); main.append(grid);
  }
  const sb=$("#searchOpen"); if(sb)sb.addEventListener("click",()=>{location.href="/#find"});
}

/* ═══ offline copies: sw.js is network first and only answers from its saved copy when there is no connection ═══ */
if("serviceWorker" in navigator&&isSecureContext)addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

/* ═══ bar shadow on scroll ═══ */
(function(){const bar=$("#bar");if(!bar)return;let raf=0;const tick=()=>{raf=0;bar.classList.toggle("stuck",scrollY>6)};
  addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(tick)},{passive:true});tick()})();
