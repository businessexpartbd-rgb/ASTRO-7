/* Magnetic card + title observer — one pass, passive scroll friendly */
(function () {
  'use strict';
  function boot() {
    try {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Assign left/right from center line (odd/even in each grid)
      document.querySelectorAll('.grid-3, .grid-2, .video-grid, .mag-grid').forEach(function (grid) {
        var cards = grid.querySelectorAll('.glass-card, .mag-card, .video-card');
        cards.forEach(function (el, i) {
          el.classList.add('mag-card');
          el.classList.add(i % 2 === 0 ? 'mag-left' : 'mag-right');
          el.style.setProperty('--mag-delay', (i % 6) * 70 + 'ms');
        });
      });

      // Standalone glass cards not in grid
      document.querySelectorAll('.glass-card:not(.mag-card)').forEach(function (el, i) {
        el.classList.add('mag-card');
        el.classList.add(i % 2 === 0 ? 'mag-left' : 'mag-right');
        el.style.setProperty('--mag-delay', (i % 4) * 80 + 'ms');
      });

      // Titles
      document.querySelectorAll('h1, h2, h3, .eyebrow, .gallery-title').forEach(function (el) {
        if (!el.classList.contains('title-rise')) el.classList.add('title-rise');
      });

      if (reduce) {
        document.querySelectorAll('.mag-card, .title-rise, .reveal').forEach(function (el) {
          el.classList.add('is-in', 'visible');
        });
        return;
      }

      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.mag-card, .title-rise, .reveal').forEach(function (el) {
          el.classList.add('is-in', 'visible');
        });
        return;
      }

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('is-in', 'visible');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );

      document.querySelectorAll('.mag-card, .title-rise, .reveal').forEach(function (el) {
        io.observe(el);
      });
    } catch (err) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
