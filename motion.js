(function () {
  window.motionReady = true;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  requestAnimationFrame(function () { root.classList.add('is-loaded'); });

  // Rows ease in as they enter the viewport, staggered within each list.
  var items = document.querySelectorAll('.index li, .jobs li');
  items.forEach(function (li) { li.style.setProperty('--i', Array.prototype.indexOf.call(li.parentNode.children, li)); });
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (li) { li.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (li) { io.observe(li); });
  }

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

  // Hover a project row to see its page, toned to ink. The card trails the pointer with a
  // critically damped follow, always from its current position, so it never jumps.
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var card = document.createElement('figure'), img = new Image(1200, 630);
  card.className = 'preview'; card.setAttribute('aria-hidden', 'true'); img.alt = '';
  card.appendChild(img); document.body.appendChild(card);
  var x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false;
  function follow() {
    var a = reduce ? 1 : 0.18;
    x += (tx - x) * a; y += (ty - y) * a;
    card.style.setProperty('--px', x + 'px'); card.style.setProperty('--py', y + 'px');
    raf = (on || Math.abs(tx - x) + Math.abs(ty - y) > 0.5) ? requestAnimationFrame(follow) : 0;
  }
  // The card rides just above the hovered row, so it never covers the line being read.
  var nav = document.querySelector('.nav');
  function target(e) {
    var w = card.offsetWidth, h = card.offsetHeight, r = e.currentTarget.getBoundingClientRect();
    var top = nav ? nav.getBoundingClientRect().bottom : 0;
    tx = Math.max(16, Math.min(innerWidth - w - 16, e.clientX - w / 2));
    ty = r.top - h - 12 >= top + 8 ? r.top - h - 12 : r.bottom + 12;
  }
  document.querySelectorAll('.row[data-preview]').forEach(function (row) {
    new Image().src = row.dataset.preview;
    row.addEventListener('pointerenter', function (e) {
      if (img.getAttribute('src') !== row.dataset.preview) img.src = row.dataset.preview;
      target(e);
      if (!on) { x = tx; y = ty; }
      on = true; card.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(follow);
    });
    row.addEventListener('pointermove', target);
    row.addEventListener('pointerleave', function () { on = false; card.classList.remove('is-on'); });
  });
})();
