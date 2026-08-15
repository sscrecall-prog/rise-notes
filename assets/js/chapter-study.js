(function(){
  const path=location.pathname.replace(/\\/g,'/');
  const parts=path.split('/').filter(Boolean);
  const subject=parts.length>1 ? parts[parts.length-2] : 'study';
  const file=parts[parts.length-1] || 'chapter';
  const key='rise-study-'+subject+'-'+file;
  const state=JSON.parse(localStorage.getItem(key)||'{}');
  document.body.classList.add('chapter-study-page');

  const main=document.querySelector('main') || document.querySelector('.container') || document.querySelector('.content') || document.body;
  const h1=document.querySelector('h1');
  const title=(h1 ? h1.textContent : document.title).replace(/SUNNY RISE/gi,'').trim();
  let sections=[...main.querySelectorAll('.section, section')].filter(s=>s.querySelector('h2'));
  if(!sections.length) sections=[...main.querySelectorAll('.sec-title')].filter(s=>s.querySelector('h2'));
  const sectionIds=sections.map((s,i)=>{if(!s.id)s.id='study-section-'+(i+1);return s.id});

  const bar=document.createElement('div');
  bar.className='chapter-study-bar';
  bar.innerHTML=`<div class="chapter-study-inner">
    <div class="chapter-study-meta"><div class="chapter-study-kicker">${subject.replace(/[-_]/g,' ')} • Study Session</div><div class="chapter-study-title">${title}</div></div>
    <div class="chapter-study-actions">
      <a class="study-action" href="../index.html">← Subject</a>
      <button class="study-action" id="chapterBookmark" type="button">🔖 Bookmark</button>
      <button class="study-action primary" id="chapterComplete" type="button">✓ Mark Complete</button>
    </div>
    <div class="chapter-progress"><span id="chapterProgressText">0% studied</span><div class="chapter-progress-track"><div class="chapter-progress-fill" id="chapterProgressFill"></div></div><span>${sections.length} topics</span></div>
  </div>`;
  main.parentNode.insertBefore(bar,main);

  const roadmap=document.createElement('div');
  roadmap.className='study-roadmap';
  roadmap.innerHTML=`<div class="study-roadmap-item">📖 Learn<small>Read the chapter</small></div><div class="study-roadmap-item">🧠 Key Concepts<small>Focus on headings</small></div><div class="study-roadmap-item">📝 Examples<small>Review explanations</small></div><div class="study-roadmap-item">⚡ Quick Revision<small>Jump between topics</small></div><div class="study-roadmap-item">🎯 Practice<small>Practice module next</small></div>`;
  bar.after(roadmap);

  const revision=document.createElement('section');
  revision.className='study-revision';
  const links=sections.slice(0,24).map((s,i)=>{const h=s.querySelector('h2');return `<li><a href="#${s.id}">${String(i+1).padStart(2,'0')} · ${h.textContent.trim()}</a></li>`}).join('');
  revision.innerHTML=`<h2>⚡ Quick Revision — Topics</h2><ul class="study-revision-list">${links || '<li>No section list available.</li>'}</ul>`;
  roadmap.after(revision);

  const practice=document.createElement('div');
  practice.className='study-practice-note';
  practice.innerHTML='<strong>🎯 Practice:</strong> This chapter is now structured for study. MCQs, short-answer practice, and chapter tests will be added as the next study-system layer — no fake questions are being inserted here.';
  revision.after(practice);

  const completeBtn=document.getElementById('chapterComplete');
  const bookmarkBtn=document.getElementById('chapterBookmark');
  const progressText=document.getElementById('chapterProgressText');
  const progressFill=document.getElementById('chapterProgressFill');

  function save(){localStorage.setItem(key,JSON.stringify(state));}
  function update(){
    const pct=state.completed ? 100 : Math.min(95,Math.round((state.read||0)/Math.max(sections.length,1)*100));
    progressFill.style.width=pct+'%'; progressText.textContent=pct+'% studied';
    completeBtn.classList.toggle('active',!!state.completed); completeBtn.textContent=state.completed?'✓ Completed':'✓ Mark Complete';
    bookmarkBtn.classList.toggle('active',!!state.bookmarked); bookmarkBtn.textContent=state.bookmarked?'🔖 Bookmarked':'🔖 Bookmark';
  }
  completeBtn.onclick=function(){state.completed=!state.completed;state.read=state.completed?sections.length:(state.read||0);save();update()};
  bookmarkBtn.onclick=function(){state.bookmarked=!state.bookmarked;save();update()};

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){const i=sections.indexOf(e.target);if(i>=0&&!state.completed){state.read=Math.max(state.read||0,i+1);save();update()}}});
  },{threshold:.25});
  sections.forEach(s=>observer.observe(s));
  update();
})();
