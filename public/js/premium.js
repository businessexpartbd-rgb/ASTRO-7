/* Count-up + title class when visible */
(function () {
  'use strict';
  function animateCount(el) {
    var raw = el.getAttribute('data-count') || el.textContent || '0';
    var suffix = '';
    var numStr = String(raw).replace(/[^0-9.]/g, '');
    if (String(raw).indexOf('+') !== -1) suffix = '+';
    if (String(raw).indexOf('%') !== -1) suffix = '%';
    if (/\/5/.test(String(raw))) {
      el.textContent = String(raw);
      return;
    }
    if (/h$/i.test(String(raw).trim())) suffix = 'h';
    var target = parseFloat(numStr);
    if (!isFinite(target)) return;
    var start = 0;
    var duration = 1400;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      if (target >= 100) el.textContent = Math.round(val).toLocaleString() + suffix;
      else if (target % 1 !== 0) el.textContent = val.toFixed(1) + suffix;
      else el.textContent = Math.round(val) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) {
        n.textContent = n.getAttribute('data-count');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    nodes.forEach(function (n) {
      n.textContent = '0';
      io.observe(n);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
