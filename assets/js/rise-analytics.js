
/* RISE NOTES — STEP 10 ANALYTICS ENGINE */
(function(){
  const KEY="riseStudyProgressV1";
  const ACT="riseStudyActivityV1";
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||"{}")}catch(e){return {}}};
  const chapters=()=>read(KEY).chapters||{};
  const activity=()=>Array.isArray(read(ACT))?read(ACT):[];

  function addActivity(type, title, meta){
    let a=activity();
    a.unshift({type,title,meta,at:Date.now()});
    a=a.slice(0,30);
    localStorage.setItem(ACT,JSON.stringify(a));
  }

  function minutesSince(at){return Math.max(0,Math.round((Date.now()-at)/60000))}
  function render(){
    const root=document.querySelector("[data-rise-analytics]");
    if(!root)return;
    const vals=Object.values(chapters());
    const completed=vals.filter(x=>x.completed);
    const saved=vals.filter(x=>x.bookmarked);
    const scores=vals.map(x=>x.bestScore).filter(x=>typeof x==="number");
    const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
    const sessions=vals.reduce((n,x)=>n+(Number(x.studyMinutes)||0),0);

    root.querySelector("[data-analytics-completed]").textContent=completed.length;
    root.querySelector("[data-analytics-saved]").textContent=saved.length;
    root.querySelector("[data-analytics-score]").textContent=avg+"%";
    root.querySelector("[data-analytics-time]").textContent=sessions+" min";

    const strong=root.querySelector("[data-analytics-strong]");
    const weak=root.querySelector("[data-analytics-weak]");
    const bySubject={};
    completed.forEach(x=>{
      const s=x.subject||"Other"; bySubject[s]=(bySubject[s]||0)+1;
    });
    const pairs=Object.entries(bySubject).sort((a,b)=>b[1]-a[1]);
    strong.innerHTML=pairs.length
      ? pairs.slice(0,5).map(([s,n])=>`<div class="rise-topic-row"><span class="rise-topic-name">${escapeHtml(s)}</span><div class="rise-topic-track"><div class="rise-topic-fill strong" style="width:${Math.min(100,n*20)}%"></div></div><b>${n}</b></div>`).join("")
      : '<div class="rise-analytics-empty">Complete a few chapters to see your strongest subjects.</div>';

    const weakScores=vals.filter(x=>typeof x.bestScore==="number").sort((a,b)=>a.bestScore-b.bestScore);
    weak.innerHTML=weakScores.length
      ? weakScores.slice(0,5).map(x=>`<div class="rise-topic-row"><span class="rise-topic-name">${escapeHtml(x.title||"Chapter")}</span><div class="rise-topic-track"><div class="rise-topic-fill" style="width:${Math.max(4,x.bestScore)}%"></div></div><b>${x.bestScore}%</b></div>`).join("")
      : '<div class="rise-analytics-empty">Complete a practice attempt to identify revision priorities.</div>';

    const list=root.querySelector("[data-analytics-activity]");
    const a=activity();
    list.innerHTML=a.length?a.slice(0,8).map(x=>{
      const ago=minutesSince(x.at);
      const when=ago<1?"just now":ago<60?ago+" min ago":Math.round(ago/60)+" hr ago";
      return `<div class="rise-activity-item"><span><b>${escapeHtml(x.title||"Study activity")}</b></span><span>${escapeHtml(x.type||"Activity")} · ${when}</span></div>`;
    }).join(""):'<div class="rise-analytics-empty">Your recent study actions will appear here.</div>';
  }

  function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

  window.RiseAnalytics={addActivity,refresh:render};

  document.addEventListener("risePlannerChanged",()=>render());
  document.addEventListener("DOMContentLoaded",()=>{
    render();
    document.addEventListener("click",e=>{
      const save=e.target.closest("[data-rise-save]");
      if(save) setTimeout(()=>{addActivity("Saved","Chapter saved");render()},50);
    });
  });
})();
