
/* RISE NOTES — STEP 15 LIBRARY ENGINE */
(function(){
  const KEY="riseStudyProgressV1";
  let activeSubject="All";

  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}};
  const write=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const chapters=()=>{const d=read();d.chapters=d.chapters||{};return d.chapters};
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const day=86400000;

  function idFor(url){
    return btoa(unescape(encodeURIComponent(url||"chapter"))).replace(/[^a-zA-Z0-9]/g,"").slice(0,40)||"chapter";
  }
  function dueLabel(x){
    if(!x.revision || !x.revision.nextAt) return x.completed ? "Completed" : "Saved";
    const diff=x.revision.nextAt-Date.now();
    if(diff<=0) return "Revision due";
    const days=Math.ceil(diff/day);
    return days===1 ? "Revision tomorrow" : `Revision in ${days} days`;
  }
  function description(x){
    if(x.subject) return `${x.subject} study material saved for quick access.`;
    return "Saved study material for quick access.";
  }
  function render(){
    const box=document.querySelector("[data-rise-library]");
    if(!box)return;
    const all=Object.values(chapters()).filter(x=>x.bookmarked);
    const q=(box.querySelector("[data-library-search]")?.value||"").trim().toLowerCase();
    const filtered=all.filter(x=>{
      const subject=String(x.subject||"General");
      const hay=`${x.title||""} ${subject} ${x.url||""}`.toLowerCase();
      return (activeSubject==="All"||subject===activeSubject) && (!q||hay.includes(q));
    }).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));

    const subjects=[...new Set(all.map(x=>x.subject||"General"))].sort();
    const filterWrap=box.querySelector("[data-library-filters]");
    if(filterWrap){
      filterWrap.innerHTML=`<button class="rise-library-filter ${activeSubject==="All"?"is-active":""}" data-library-filter="All">All</button>`+
        subjects.map(s=>`<button class="rise-library-filter ${activeSubject===s?"is-active":""}" data-library-filter="${esc(s)}">${esc(s)}</button>`).join("");
      filterWrap.querySelectorAll("[data-library-filter]").forEach(b=>b.addEventListener("click",()=>{
        activeSubject=b.dataset.libraryFilter;render();
      }));
    }

    box.querySelector("[data-library-count]").textContent=all.length;
    box.querySelector("[data-library-subject-count]").textContent=subjects.length;
    const due=all.filter(x=>x.revision && x.revision.nextAt && x.revision.nextAt<=Date.now()).length;
    box.querySelector("[data-library-due]").textContent=due;

    const grid=box.querySelector("[data-library-grid]");
    const empty=box.querySelector("[data-library-empty]");
    if(!filtered.length){
      grid.innerHTML="";
      empty.style.display="block";
      return;
    }
    empty.style.display="none";
    grid.innerHTML=filtered.map(x=>{
      const url=x.url||"#";
      const id=idFor(url);
      const label=dueLabel(x);
      const practice=(typeof x.bestScore==="number")?`Best ${x.bestScore}%`:"Practice ready";
      return `<article class="rise-library-card">
        <div class="rise-library-card-top">
          <span class="rise-library-subject">${esc(x.subject||"General")}</span>
          <span class="rise-library-saved">★ Saved</span>
        </div>
        <h3>${esc(x.title||"Saved Chapter")}</h3>
        <p>${esc(description(x))}</p>
        <div class="rise-library-meta">
          <span class="rise-library-tag">${esc(label)}</span>
          <span class="rise-library-tag">${esc(practice)}</span>
        </div>
        <div class="rise-library-actions">
          <a class="rise-library-btn primary" href="${esc(url)}">Open Chapter</a>
          <a class="rise-library-btn" href="${esc(url)}#quick-revision">Revise</a>
          <button class="rise-library-btn" type="button" data-library-remove="${esc(id)}">Remove</button>
        </div>
      </article>`;
    }).join("");

    grid.querySelectorAll("[data-library-remove]").forEach(btn=>btn.addEventListener("click",()=>{
      const d=read();d.chapters=d.chapters||{};
      const item=d.chapters[btn.dataset.libraryRemove];
      if(item){item.bookmarked=false;item.updatedAt=Date.now();write(d)}
      render();
      if(window.RiseProgress)window.RiseProgress.refresh();
    }));
  }

  function setup(){
    const box=document.querySelector("[data-rise-library]");if(!box)return;
    box.querySelector("[data-library-search]")?.addEventListener("input",render);
    render();
  }

  window.RiseLibrary={render};
  document.addEventListener("DOMContentLoaded",setup);
})();
