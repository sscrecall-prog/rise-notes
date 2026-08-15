
/* RISE NOTES — STEP 7 NAVIGATION ENGINE */
(function(){
  const KEY="riseLastStudyV1";
  const chapterKey="riseStudyProgressV1";

  function getLast(){
    try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){return null}
  }
  function setLast(data){localStorage.setItem(KEY,JSON.stringify(data))}
  function progress(){
    try{return JSON.parse(localStorage.getItem(chapterKey)||"{}")}catch(e){return {}}
  }
  function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

  function injectNav(){
    if(document.querySelector(".rise-topbar")) return;
    const path=location.pathname.replace(/\\/g,"/");
    const rootDepth=(path.split("/").filter(Boolean).length>1)? "../".repeat(path.split("/").filter(Boolean).length-1):"";
    const home=rootDepth+"index.html";
    const progressUrl=rootDepth+"progress.html";
    const nav=document.createElement("div");
    nav.className="rise-topbar";
    nav.innerHTML=`<nav class="rise-nav" aria-label="Study navigation">
      <a class="rise-brand" href="${home}">RISE NOTES</a>
      <div class="rise-nav-links">
        <a class="rise-nav-link" data-nav="home" href="${home}">Dashboard</a>
        <a class="rise-nav-link" data-nav="subjects" href="${home}#subjects">Subjects</a>
        <a class="rise-nav-link" data-nav="progress" href="${progressUrl}">Progress</a>
        <a class="rise-nav-link" data-nav="library" href="${home}bookmarks.html">Library</a>
      </div>
      <button class="rise-menu-btn" type="button" aria-expanded="false" aria-label="Open menu">Menu</button>
    </nav>`;
    document.body.prepend(nav);
    const btn=nav.querySelector(".rise-menu-btn"), links=nav.querySelector(".rise-nav-links");
    btn.addEventListener("click",()=>{const open=links.classList.toggle("is-open");btn.setAttribute("aria-expanded",open)});
    const lower=path.toLowerCase();
    const active=lower.includes("progress")?"progress":lower.includes("bookmarks")?"library":(lower.endsWith("index.html")||lower==="/")?"home":"subjects";
    const a=nav.querySelector(`[data-nav="${active}"]`); if(a)a.classList.add("is-active");

    const bottom=document.createElement("nav");
    bottom.className="rise-bottom-nav";
    bottom.innerHTML=`<div class="rise-bottom-nav-inner">
      <a class="rise-bottom-link" href="${home}">⌂<br>Home</a>
      <a class="rise-bottom-link" href="${home}#subjects">▦<br>Subjects</a>
      <a class="rise-bottom-link" href="${progressUrl}">◔<br>Progress</a>
      <a class="rise-bottom-link" href="${home}bookmarks.html">★<br>Library</a>
    </div>`;
    document.body.appendChild(bottom);
  }

  function continueWidget(){
    const target=document.querySelector("[data-rise-continue]");
    if(!target)return;
    const last=getLast();
    if(!last || !last.url){
      target.innerHTML=`<div class="rise-continue-head"><div class="rise-continue-title">Continue Studying</div></div>
        <div class="rise-continue-card"><div><div class="rise-continue-name">Start your first chapter</div>
        <div class="rise-continue-meta">Open a subject and begin learning.</div></div>
        <a class="rise-continue-btn" href="#subjects">Browse Subjects</a></div>`;
      return;
    }
    target.innerHTML=`<div class="rise-continue-head"><div class="rise-continue-title">Continue Studying</div>
      <a class="rise-continue-link" href="${esc(last.url)}">Resume →</a></div>
      <div class="rise-continue-card"><div><div class="rise-continue-meta">${esc(last.subject||"Study")}</div>
      <div class="rise-continue-name">${esc(last.title||"Continue your chapter")}</div>
      <div class="rise-continue-meta">Pick up where you left off.</div></div>
      <a class="rise-continue-btn" href="${esc(last.url)}">Continue</a></div>`;
  }

  function recordPage(){
    const title=(document.querySelector("h1")||document.querySelector("title"));
    if(!title)return;
    const isChapter=!location.pathname.endsWith("/index.html") || document.querySelector(".study-session,.chapter-content,[data-chapter]");
    if(!isChapter)return;
    const subject=document.querySelector("[data-subject]")?.dataset.subject||"";
    setLast({title:(title.textContent||"").trim(),subject,url:location.href,updatedAt:Date.now()});
  }

  document.addEventListener("DOMContentLoaded",()=>{
    injectNav(); continueWidget(); recordPage();
  });
})();
