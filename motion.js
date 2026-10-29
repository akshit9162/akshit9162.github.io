(function () {
  window.motionReady = true;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  requestAnimationFrame(function () { root.classList.add('is-loaded'); });

  // Each chapter unmasks its page once as it enters, then its text follows in a short stagger.
  var chapters = document.querySelectorAll('.chapter');
  chapters.forEach(function (c) {
    Array.prototype.forEach.call(c.querySelectorAll('.chapter__text > *'), function (el, i) { el.style.setProperty('--i', i); });
  });
  // A scroll check rather than an observer: a fast scroll or an anchor jump past a chapter
  // still unmasks it, so nothing above the fold is ever left hidden.
  var pending = Array.prototype.slice.call(chapters), ticking = false;
  function check() {
    ticking = false;
    var edge = innerHeight * 0.88;
    pending = pending.filter(function (c) {
      if (c.getBoundingClientRect().top < edge) { c.classList.add('is-in'); return false; }
      return true;
    });
    if (!pending.length) removeEventListener('scroll', onScroll);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
  if (reduce) { chapters.forEach(function (c) { c.classList.add('is-in'); }); }
  else { addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); check(); }

  // Replay one real skillscout run: recommendations climb to 216 while the high-risk count
  // lands on 89. Only the totals were recorded, so both climb evenly.
  var REC = 216, FLAG = 89, MS = 2600;
  var recEl = document.querySelector('[data-rec]'), flagEl = document.querySelector('[data-flag]');
  function play() {
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / MS), e = 1 - Math.pow(1 - k, 3);
      recEl.textContent = Math.round(REC * e);
      flagEl.textContent = Math.round(FLAG * e);
      if (k < 1) requestAnimationFrame(frame);
    }
    recEl.textContent = 0; flagEl.textContent = 0;
    requestAnimationFrame(frame);
  }
  if (recEl && flagEl && !reduce) setTimeout(play, 400);
})();
