
/* RISE NOTES — STEP 6 PROGRESS ENGINE */
(function () {
  const KEY = "riseStudyProgressV1";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch (_) { return {}; }
  }

  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function chapterState() {
    return read().chapters || {};
  }

  function completedCount() {
    return Object.values(chapterState()).filter(x => x && x.completed).length;
  }

  function bookmarkCount() {
    return Object.values(chapterState()).filter(x => x && x.bookmarked).length;
  }

  function scoreValues() {
    return Object.values(chapterState())
      .map(x => typeof x.bestScore === "number" ? x.bestScore : null)
      .filter(x => x !== null);
  }

  function averageScore() {
    const a = scoreValues();
    return a.length ? Math.round(a.reduce((s,x)=>s+x,0)/a.length) : 0;
  }

  function renderGlobal() {
    document.querySelectorAll("[data-rise-global-progress]").forEach(el => {
      const total = Number(el.dataset.total || 0);
      const done = completedCount();
      const pct = total ? Math.min(100, Math.round(done / total * 100)) : 0;
      el.textContent = pct + "%";
    });
  }

  function renderPanel(panel) {
    const total = Number(panel.dataset.total || 0);
    const done = completedCount();
    const pct = total ? Math.min(100, Math.round(done / total * 100)) : 0;

    const fill = panel.querySelector("[data-progress-fill]");
    const percent = panel.querySelector("[data-progress-percent]");
    const completed = panel.querySelector("[data-completed-count]");
    const bookmarks = panel.querySelector("[data-bookmark-count]");
    const avg = panel.querySelector("[data-average-score]");

    if (fill) fill.style.width = pct + "%";
    if (percent) percent.textContent = pct + "%";
    if (completed) completed.textContent = done;
    if (bookmarks) bookmarks.textContent = bookmarkCount();
    if (avg) avg.textContent = averageScore() + "%";
  }

  function renderSubjects(panel) {
    const rows = panel.querySelectorAll("[data-subject-progress]");
    rows.forEach(row => {
      const total = Number(row.dataset.total || 0);
      const subject = row.dataset.subject || "";
      const states = chapterState();
      const done = Object.entries(states).filter(([k,v]) =>
        v && v.completed && (!subject || v.subject === subject)
      ).length;
      const pct = total ? Math.min(100, Math.round(done / total * 100)) : 0;
      const fill = row.querySelector(".rise-mini-fill");
      const value = row.querySelector("[data-subject-percent]");
      if (fill) fill.style.width = pct + "%";
      if (value) value.textContent = pct + "%";
    });
  }

  function ensurePanel() {
    const target = document.querySelector("[data-rise-dashboard-progress]");
    if (!target) return;
    renderPanel(target);
    renderSubjects(target);
  }

  window.RiseProgress = {
    get: read,
    save: write,
    completedCount,
    bookmarkCount,
    averageScore,
    refresh: function () {
      renderGlobal();
      ensurePanel();
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderGlobal();
    ensurePanel();
  });
})();
