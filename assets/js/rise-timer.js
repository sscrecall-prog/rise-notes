
/* RISE NOTES — STEP 11 STUDY TIMER */
(function(){
  const STATE="riseTimerStateV1", PROGRESS="riseStudyProgressV1", ACT="riseStudyActivityV1";
  let timer=null;

  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const now=()=>Date.now();

  function pageMeta(){
    const h=document.querySelector("h1")||document.querySelector("title");
    return {title:(h?.textContent||"Study Session").trim(),subject:document.querySelector("[data-subject]")?.dataset.subject||"Study"};
  }

  function state(){
    return read(STATE,{running:false,startedAt:null,elapsed:0,title:"Study Session",subject:"Study"});
  }

  function seconds(){
    const s=state();
    return Math.max(0,Math.floor((s.elapsed + (s.running && s.startedAt ? now()-s.startedAt : 0))/1000));
  }

  function fmt(sec){
    sec=Math.max(0,sec|0);
    const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;
    return [h,m,s].map((x,i)=>i===0?String(x).padStart(2,"0"):String(x).padStart(2,"0")).join(":");
  }

  function setState(s){write(STATE,s)}

  function recordActivity(title, minutes){
    let a=read(ACT,[]);
    if(!Array.isArray(a))a=[];
    a.unshift({type:"Study session",title,meta:minutes+" min",at:now()});
    write(ACT,a.slice(0,30));
  }

  function addMinutesToChapter(title,subject,minutes){
    const d=read(PROGRESS,{});
    d.chapters=d.chapters||{};
    const url=location.href;
    const id=btoa(unescape(encodeURIComponent(url))).replace(/[^a-zA-Z0-9]/g,"").slice(0,40)||"chapter";
    const x=d.chapters[id]||{};
    x.title=title;x.subject=subject;x.url=url;
    x.studyMinutes=(Number(x.studyMinutes)||0)+minutes;
    x.updatedAt=now();
    d.chapters[id]=x;
    write(PROGRESS,d);
  }

  function render(){
    const box=document.querySelector("[data-rise-timer]"); if(!box)return;
    const s=state();
    box.querySelector("[data-timer-clock]").textContent=fmt(seconds());
    box.querySelector("[data-timer-status]").textContent=s.running?"Session running":"Session paused";
    const start=box.querySelector("[data-timer-start]"), pause=box.querySelector("[data-timer-pause]");
    start.disabled=!!s.running; pause.disabled=!s.running;
  }

  function start(){
    const s=state();
    if(s.running)return;
    const meta=pageMeta();
    s.running=true;s.startedAt=now();s.title=meta.title;s.subject=meta.subject;
    setState(s); render();
    clearInterval(timer);timer=setInterval(render,1000);
  }

  function pause(){
    const s=state();
    if(!s.running)return;
    s.elapsed += now()-s.startedAt;s.startedAt=null;s.running=false;setState(s);
    clearInterval(timer);render();
  }

  function finish(){
    const s=state();
    let sec=seconds();
    if(sec<60){pause();return;}
    if(s.running){s.elapsed += now()-s.startedAt;s.startedAt=null;s.running=false;}
    const minutes=Math.max(1,Math.round(s.elapsed/60000));
    addMinutesToChapter(s.title,s.subject,minutes);
    recordActivity(s.title,minutes);
    localStorage.removeItem(STATE);
    clearInterval(timer);render();
    const status=document.querySelector("[data-timer-status]");
    if(status)status.textContent="Session saved — "+minutes+" min";
    if(window.RiseAnalytics)window.RiseAnalytics.refresh();
  }

  function reset(){
    localStorage.removeItem(STATE);clearInterval(timer);render();
  }

  function setup(){
    const box=document.querySelector("[data-rise-timer]");if(!box)return;
    box.querySelector("[data-timer-start]")?.addEventListener("click",start);
    box.querySelector("[data-timer-pause]")?.addEventListener("click",pause);
    box.querySelector("[data-timer-finish]")?.addEventListener("click",finish);
    box.querySelector("[data-timer-reset]")?.addEventListener("click",reset);
    render();
    const s=state();
    if(s.running){clearInterval(timer);timer=setInterval(render,1000)}
  }
  window.RiseTimer={start,pause,finish,reset};
  document.addEventListener("DOMContentLoaded",setup);
})();
