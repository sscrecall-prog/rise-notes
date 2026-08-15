
/* RISE NOTES — STEP 14 TEST ENGINE */
(function(){
  const bank=window.RISE_TEST_BANK||[];
  const STORAGE="riseTestHistoryV1";
  let questions=[], index=0, answers={}, remaining=600, timer=null, subject="All";

  const $=s=>document.querySelector(s);
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
  function saveHistory(score,total){
    let h=[];try{h=JSON.parse(localStorage.getItem(STORAGE)||"[]")}catch(e){}
    h.unshift({score,total,subject,at:Date.now()});localStorage.setItem(STORAGE,JSON.stringify(h.slice(0,20)));
  }
  function fmt(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
  function show(id){document.querySelectorAll("[data-test-screen]").forEach(x=>x.classList.add("rise-test-hidden"));$(id).classList.remove("rise-test-hidden")}
  function renderQuestion(){
    const q=questions[index]; if(!q)return submit();
    $("#rise-test-number").textContent=`Question ${index+1} of ${questions.length}`;
    $("#rise-test-timer").textContent=fmt(remaining);
    $("#rise-test-progress-fill").style.width=((index+1)/questions.length*100)+"%";
    $("#rise-test-question").textContent=q.q;
    $("#rise-test-options").innerHTML=q.options.map((o,i)=>`
      <label class="rise-option"><input type="radio" name="answer" value="${i}" ${answers[q.id]===i?"checked":""}><span>${esc(o)}</span></label>
    `).join("");
    $("#rise-test-prev").disabled=index===0;
    $("#rise-test-next").textContent=index===questions.length-1?"Submit Test":"Next";
    $("#rise-test-options").querySelectorAll("input").forEach(r=>r.addEventListener("change",()=>answers[q.id]=Number(r.value)));
  }
  function tick(){
    remaining--;$("#rise-test-timer").textContent=fmt(remaining);
    if(remaining<=0){clearInterval(timer);submit();}
  }
  function start(){
    subject=$("#rise-test-subject").value;
    const count=Number($("#rise-test-count").value)||5;
    let pool=subject==="All"?bank:bank.filter(x=>x.subject===subject);
    questions=shuffle(pool).slice(0,Math.min(count,pool.length));
    if(!questions.length){alert("No questions available for this subject yet.");return}
    index=0;answers={};remaining=600;
    show("#rise-test-run");renderQuestion();
    clearInterval(timer);timer=setInterval(tick,1000);
  }
  function submit(){
    clearInterval(timer);
    let correct=0;
    questions.forEach(q=>{if(answers[q.id]===q.answer)correct++});
    saveHistory(correct,questions.length);
    $("#rise-test-score").textContent=`${correct}/${questions.length}`;
    const pct=Math.round(correct/questions.length*100);
    $("#rise-test-message").textContent=pct>=80?"Strong result.":pct>=50?"Good start. Review the missed questions.":"Review the explanations and retry the test.";
    $("#rise-test-review").innerHTML=questions.map((q,i)=>{
      const a=answers[q.id], ok=a===q.answer;
      return `<div class="rise-review-item ${ok?"correct":"wrong"}">
        <strong>${i+1}. ${esc(q.q)}</strong>
        <div class="rise-review-answer">Your answer: ${a==null?"Not answered":esc(q.options[a])}<br>
        Correct answer: <strong>${esc(q.options[q.answer])}</strong><br>${esc(q.explanation)}</div>
      </div>`;
    }).join("");
    show("#rise-test-result");
  }
  function setup(){
    if(!$("#rise-test-start"))return;
    const subjects=[...new Set(bank.map(x=>x.subject))];
    $("#rise-test-subject").innerHTML='<option value="All">All Subjects</option>'+subjects.map(x=>`<option>${esc(x)}</option>`).join("");
    $("#rise-test-start").addEventListener("click",start);
    $("#rise-test-prev").addEventListener("click",()=>{if(index>0){index--;renderQuestion()}});
    $("#rise-test-next").addEventListener("click",()=>{if(index<questions.length-1){index++;renderQuestion()}else submit()});
    $("#rise-test-retry").addEventListener("click",start);
  }
  document.addEventListener("DOMContentLoaded",setup);
})();
