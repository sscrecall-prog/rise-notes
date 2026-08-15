
(function(){
  const panel=document.querySelector('.practice-panel');
  if(!panel) return;
  const questions=[...panel.querySelectorAll('.practice-q')];
  const key='sunnyrise-practice-'+(panel.dataset.practiceKey||location.pathname);
  const result=panel.querySelector('.practice-result');
  const scoreEl=panel.querySelector('.practice-score');
  let saved={}; try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}
  questions.forEach((q,i)=>{
    const savedAns=saved[i];
    if(savedAns!=null){const r=q.querySelector('input[value="'+CSS.escape(String(savedAns))+'"]'); if(r){r.checked=true;q.classList.add('answered');r.closest('.practice-option').classList.add('selected');}}
    q.querySelectorAll('input').forEach(r=>r.addEventListener('change',()=>{
      q.querySelectorAll('.practice-option').forEach(x=>x.classList.remove('selected'));r.closest('.practice-option').classList.add('selected');
      saved[i]=r.value;localStorage.setItem(key,JSON.stringify(saved));
    }));
  });
  function grade(){
    let score=0,answered=0;
    questions.forEach((q,i)=>{
      const picked=q.querySelector('input:checked');
      q.querySelectorAll('.practice-option').forEach(o=>o.classList.remove('correct','wrong'));
      if(!picked)return;
      answered++;
      const correct=q.dataset.answer;
      if(picked.value===correct){score++;picked.closest('.practice-option').classList.add('correct');q.querySelector('.practice-feedback').textContent='✓ Correct — '+q.dataset.explanation;}
      else {picked.closest('.practice-option').classList.add('wrong');const c=q.querySelector('input[value="'+CSS.escape(correct)+'"]');if(c)c.closest('.practice-option').classList.add('correct');q.querySelector('.practice-feedback').textContent='✗ Not correct — '+q.dataset.explanation;}
      q.classList.add('answered');
    });
    scoreEl.textContent=score+'/'+questions.length;
    if(answered){result.classList.add('show');result.innerHTML='<strong>Practice result:</strong> '+score+' / '+questions.length+' correct. '+(score===questions.length?'Perfect recall.':'Review the marked answers and retry.');}
    localStorage.setItem(key,JSON.stringify(saved));
  }
  panel.querySelector('[data-grade]').addEventListener('click',grade);
  panel.querySelector('[data-reset]').addEventListener('click',()=>{localStorage.removeItem(key);location.reload();});
})();
