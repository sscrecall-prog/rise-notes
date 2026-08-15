
/* RISE NOTES — STEP 13 REVISION ENGINE */
(function(){
  const KEY="riseStudyProgressV1";
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}};
  const write=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const DAY=86400000;

  function data(){const d=read();d.chapters=d.chapters||{};return d}
  function ensureRevision(x){
    if(!x.revision) {
      x.revision={interval:1,nextAt:Date.now()+DAY,lastRevisedAt:null,revisions:0};
    }
    return x.revision;
  }
  function markChapterCompleted(){
    const d=data();
    Object.values(d.chapters).forEach(x=>{
      if(x.completed && !x.revision) ensureRevision(x);
    });
    write(d);
  }
  function dueItems(filter="due"){
    markChapterCompleted();
    const d=data(), now=Date.now();
    return Object.values(d.chapters).filter(x=>{
      if(!x.completed) return false;
      const r=ensureRevision(x);
      if(filter==="all") return true;
      return r.nextAt<=now;
    }).sort((a,b)=>ensureRevision(a).nextAt-ensureRevision(b).nextAt);
  }
  function scheduleAfterRevision(x){
    const r=ensureRevision(x);
    // Spaced intervals: 1, 3, 7, 14, 30 days.
    const intervals=[1,3,7,14,30];
    const idx=Math.min(r.revisions,intervals.length-1);
    r.interval=intervals[idx];
    r.lastRevisedAt=Date.now();
    r.revisions=(r.revisions||0)+1;
    r.nextAt=Date.now()+r.interval*DAY;
  }
  function revise(id){
    const d=data(), x=d.chapters[id];
    if(!x)return;
    scheduleAfterRevision(x);
    write(d);
    render();
    if(window.RiseAnalytics) window.RiseAnalytics.refresh();
  }
  function idFor(x){
    return btoa(unescape(encodeURIComponent(x.url||x.title||"chapter"))).replace(/[^a-zA-Z0-9]/g,"").slice(0,40)||"chapter";
  }
  function formatDue(ts){
    const diff=ts-Date.now();
    if(diff<=0)return "Due now";
    const days=Math.ceil(diff/DAY);
    return days===1?"Due tomorrow":"Due in "+days+" days";
  }
  function render(){
    document.querySelectorAll("[data-rise-revision]").forEach(box=>{
      const filter=box.querySelector("[data-revision-filter].is-active")?.dataset.revisionFilter||"due";
      const items=dueItems(filter);
      const list=box.querySelector("[data-revision-list]");
      if(!list)return;
      if(!items.length){
        list.innerHTML=filter==="due"
          ? '<div class="rise-revision-empty">Nothing is due right now. Complete more chapters and they will enter the revision cycle.</div>'
          : '<div class="rise-revision-empty">No completed chapters are available yet.</div>';
      } else {
        list.innerHTML=items.map(x=>{
          const id=idFor(x), r=ensureRevision(x);
          return `<article class="rise-revision-item">
            <div>
              <div class="rise-revision-subject">${esc(x.subject||"Study")}</div>
              <div class="rise-revision-name">${esc(x.title||"Chapter")}</div>
              <div class="rise-revision-due">${formatDue(r.nextAt)} · ${r.revisions||0} revision${(r.revisions||0)===1?"":"s"} completed</div>
            </div>
            <div class="rise-revision-actions">
              <a class="rise-revision-btn" href="${esc(x.url||"#")}">Open Chapter</a>
              <button class="rise-revision-btn primary" data-revise="${esc(id)}">Mark Revised</button>
            </div>
          </article>`;
        }).join("");
      }
      list.querySelectorAll("[data-revise]").forEach(b=>b.addEventListener("click",()=>revise(b.dataset.revise)));
      box.querySelectorAll("[data-revision-filter]").forEach(b=>b.addEventListener("click",()=>{
        box.querySelectorAll("[data-revision-filter]").forEach(x=>x.classList.remove("is-active"));
        b.classList.add("is-active"); render();
      }));
    });
  }

  function setup(){
    // Existing completed chapters from earlier steps get a revision date now.
    markChapterCompleted();
    render();
  }
  window.RiseRevision={render,markChapterCompleted};
  document.addEventListener("DOMContentLoaded",setup);
})();
