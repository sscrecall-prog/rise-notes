
/* RISE NOTES — STEP 12 DAILY STUDY PLANNER */
(function(){
  const KEY="riseDailyPlanV1";
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}};
  const write=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const todayKey=()=>{const d=new Date();return d.toISOString().slice(0,10)};
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const state=()=>{const d=read();d[todayKey()]=d[todayKey()]||{items:[]};return d};

  function add(title,subject,minutes){
    if(!title.trim())return;
    const d=state();
    d[todayKey()].items.push({
      id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),
      title:title.trim(),subject:subject||"General",minutes:Math.max(5,Number(minutes)||30),
      done:false
    });
    write(d);render();
  }
  function toggle(id){
    const d=state(), x=d[todayKey()].items.find(x=>x.id===id);
    if(x)x.done=!x.done;
    write(d);render();
  }
  function remove(id){
    const d=state();
    d[todayKey()].items=d[todayKey()].items.filter(x=>x.id!==id);
    write(d);render();
  }

  function render(){
    const box=document.querySelector("[data-rise-planner]");if(!box)return;
    const items=state()[todayKey()].items||[];
    const done=items.filter(x=>x.done).length;
    const planned=items.reduce((n,x)=>n+Number(x.minutes||0),0);
    const completedMinutes=items.filter(x=>x.done).reduce((n,x)=>n+Number(x.minutes||0),0);
    const pct=items.length?Math.round(done/items.length*100):0;

    const list=box.querySelector("[data-plan-list]");
    list.innerHTML=items.length?items.map(x=>`
      <div class="rise-plan-item">
        <input class="rise-plan-check" type="checkbox" ${x.done?"checked":""} data-plan-toggle="${esc(x.id)}" aria-label="Mark ${esc(x.title)} complete">
        <div>
          <div class="rise-plan-name">${esc(x.title)}</div>
          <div class="rise-plan-meta">${esc(x.subject)} · ${x.minutes} min</div>
        </div>
        <button class="rise-plan-remove" type="button" data-plan-remove="${esc(x.id)}">Remove</button>
      </div>`).join("")
      : '<div class="rise-planner-empty">No study goals for today. Add your first subject or chapter above.</div>';

    box.querySelector("[data-plan-fill]").style.width=pct+"%";
    box.querySelector("[data-plan-percent]").textContent=pct+"%";
    box.querySelector("[data-plan-summary]").textContent=`${done}/${items.length} goals · ${completedMinutes}/${planned} min`;

    list.querySelectorAll("[data-plan-toggle]").forEach(el=>el.addEventListener("change",()=>toggle(el.dataset.planToggle)));
    list.querySelectorAll("[data-plan-remove]").forEach(el=>el.addEventListener("click",()=>remove(el.dataset.planRemove)));
  }

  function setup(){
    const box=document.querySelector("[data-rise-planner]");if(!box)return;
    const dateEl=box.querySelector("[data-plan-date]");
    if(dateEl)dateEl.textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
    const form=box.querySelector("[data-plan-form]");
    form.addEventListener("submit",e=>{
      e.preventDefault();
      add(
        form.querySelector("[name=title]").value,
        form.querySelector("[name=subject]").value,
        form.querySelector("[name=minutes]").value
      );
      form.reset();
      form.querySelector("[name=minutes]").value=30;
    });
    box.querySelectorAll("[data-plan-preset]").forEach(b=>b.addEventListener("click",()=>{
      form.querySelector("[name=title]").value=b.dataset.planPreset;
    }));
    render();
  }

  window.RisePlanner={add,render};
  document.addEventListener("DOMContentLoaded",setup);
})();
