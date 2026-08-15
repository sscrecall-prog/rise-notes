
/* RISE NOTES — STEP 8 SEARCH */
(function(){
  const index = window.RISE_SEARCH_INDEX || [];
  const norm = s => String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
  const esc = s => String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

  function score(item,q){
    const t=norm(item.title), s=norm(item.subject), x=norm(item.text);
    let n=0;
    q.forEach(w=>{
      if(t.includes(w)) n+=12;
      if(s.includes(w)) n+=8;
      if(x.includes(w)) n+=2;
    });
    return n;
  }

  function setup(){
    const input=document.querySelector("[data-rise-search-input]");
    const results=document.querySelector("[data-rise-search-results]");
    const count=document.querySelector("[data-rise-search-count]");
    if(!input||!results)return;

    function render(){
      const raw=input.value.trim();
      const q=norm(raw).split(/\s+/).filter(Boolean);
      if(!q.length){
        results.innerHTML='<div class="rise-search-empty">Search chapters, topics, subjects or keywords.</div>';
        if(count) count.textContent="";
        return;
      }
      const found=index.map(x=>({...x,_score:score(x,q)}))
        .filter(x=>x._score>0).sort((a,b)=>b._score-a._score).slice(0,30);
      if(count) count.textContent=found.length+" result"+(found.length===1?"":"s");
      if(!found.length){
        results.innerHTML='<div class="rise-search-empty"><strong>No results.</strong><br>Try a broader keyword or a subject name.</div>';
        return;
      }
      const baseDepth=location.pathname.split("/").filter(Boolean).length>1
        ? "../".repeat(location.pathname.split("/").filter(Boolean).length-1) : "";
      results.innerHTML=found.map(x=>{
        const url=baseDepth+x.url;
        return `<a class="rise-search-result" href="${esc(url)}">
          <div class="rise-search-result-top"><span>${esc(x.subject||"Study")}</span></div>
          <h3>${esc(x.title)}</h3>
          <p>${esc(x.text.slice(0,180))}${x.text.length>180?"…":""}</p>
        </a>`;
      }).join("");
    }

    input.addEventListener("input",render);
    input.addEventListener("keydown",e=>{if(e.key==="Escape"){input.value="";render();input.blur()}});
    render();
  }

  document.addEventListener("DOMContentLoaded",setup);
})();
