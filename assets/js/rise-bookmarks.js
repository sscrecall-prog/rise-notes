
/* RISE NOTES — STEP 9 BOOKMARK ENGINE */
(function(){
  const KEY="riseStudyProgressV1";
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}};
  const write=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  function chapters(){const d=read();d.chapters=d.chapters||{};return d}
  function idFor(url){return btoa(unescape(encodeURIComponent(url))).replace(/[^a-zA-Z0-9]/g,"").slice(0,40)||"chapter"}
  function currentMeta(){
    const h=document.querySelector("h1")||document.querySelector("title");
    const subject=document.querySelector("[data-subject]")?.dataset.subject||"Study";
    return {title:(h?.textContent||"Chapter").trim(),subject,url:location.href};
  }
  function toggle(btn){
    const meta=currentMeta(), d=chapters(), id=idFor(meta.url);
    const item=d.chapters[id]||{};
    item.title=meta.title; item.subject=meta.subject; item.url=meta.url;
    item.bookmarked=!item.bookmarked;
    if(item.bookmarked && item.completed && !item.revision){
      item.revision={interval:1,nextAt:Date.now()+86400000,lastRevisedAt:null,revisions:0};
    }
    item.updatedAt=Date.now();
    d.chapters[id]=item; write(d); updateButtons();
    if(window.RiseProgress) window.RiseProgress.refresh();
    renderLibrary();
  }
  function updateButtons(){
    const meta=currentMeta(), d=chapters(), id=idFor(meta.url);
    const saved=!!d.chapters[id]?.bookmarked;
    document.querySelectorAll("[data-rise-save]").forEach(b=>{
      b.classList.toggle("is-saved",saved);
      b.setAttribute("aria-pressed",saved?"true":"false");
      b.innerHTML=saved?"★ Saved":"☆ Save";
    });
  }
  function injectButton(){
    if(document.querySelector("[data-rise-save]")) return;
    const h=document.querySelector("h1");
    if(!h)return;
    const b=document.createElement("button");b.type="button";b.className="rise-save-btn";b.dataset.riseSave="1";
    b.addEventListener("click",()=>toggle(b)); b.innerHTML="☆ Save";
    h.insertAdjacentElement("afterend",b); updateButtons();
  }
  function renderLibrary(){
    const box=document.querySelector("[data-rise-library]");
    if(!box)return;
    const d=chapters(), all=Object.values(d.chapters).filter(x=>x.bookmarked);
    const subject=(box.querySelector("[data-library-filter]")?.value||"").toLowerCase();
    const list=all.filter(x=>!subject||String(x.subject||"").toLowerCase()===subject);
    const subjects=[...new Set(all.map(x=>x.subject).filter(Boolean))].sort();
    const select=box.querySelector("[data-library-filter]");
    if(select){
      const current=select.value;
      select.innerHTML='<option value="">All subjects</option>'+subjects.map(s=>`<option>${esc(s)}</option>`).join("");
      select.value=current;
    }
    const target=box.querySelector("[data-library-list]");
    if(!target)return;
    if(!list.length){target.innerHTML='<div class="rise-library-empty">No saved chapters yet. Open a chapter and press <strong>☆ Save</strong>.</div>';return}
    target.innerHTML=list.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).map(x=>{
      const id=idFor(x.url);
      return `<div class="rise-library-item">
        <a href="${esc(x.url)}"><div class="rise-library-subject">${esc(x.subject||"Study")}</div>
        <div class="rise-library-title">${esc(x.title)}</div></a>
        <button class="rise-library-remove" data-remove="${id}">Remove</button>
      </div>`;
    }).join("");
    target.querySelectorAll("[data-remove]").forEach(btn=>btn.addEventListener("click",()=>{
      const d=chapters(); if(d.chapters[btn.dataset.remove]) d.chapters[btn.dataset.remove].bookmarked=false;
      write(d); renderLibrary(); updateButtons(); if(window.RiseProgress)window.RiseProgress.refresh();
    }));
  }
  function setupLibrary(){
    const box=document.querySelector("[data-rise-library]");if(!box)return;
    box.querySelector("[data-library-filter]")?.addEventListener("change",renderLibrary);
    renderLibrary();
  }
  document.addEventListener("DOMContentLoaded",()=>{
    injectButton(); setupLibrary(); updateButtons();
  });
})();
