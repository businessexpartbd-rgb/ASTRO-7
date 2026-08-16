/* Light motion observer — reviews included, no permanent will-change */
(function () {
  'use strict';
  function boot() {
    try {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      document.querySelectorAll('.grid-3, .grid-2, .video-grid, .mag-grid, .reviews-layout, .reviews-main').forEach(function (grid) {
        var cards = grid.querySelectorAll('.glass-card, .mag-card, .video-card, .reviews-summary, .review-form-card');
        cards.forEach(function (el, i) {
          el.classList.add('mag-card');
          el.classList.add(i % 2 === 0 ? 'mag-left' : 'mag-right');
          el.style.setProperty('--mag-delay', Math.min(i, 5) * 45 + 'ms');
        });
      });

      document.querySelectorAll('.glass-card:not(.mag-card), .reviews-summary:not(.mag-card), .review-form-card:not(.mag-card)').forEach(function (el, i) {
        el.classList.add('mag-card');
        el.classList.add(i % 2 === 0 ? 'mag-left' : 'mag-right');
        el.style.setProperty('--mag-delay', Math.min(i, 4) * 50 + 'ms');
      });

      document.querySelectorAll('h1, h2, h3, .eyebrow, .gallery-title, .form-heading').forEach(function (el) {
        el.classList.add('title-rise');
      });

      var targets = document.querySelectorAll('.mag-card, .title-rise, .reveal, .reviews-summary, .review-form-card');

      if (reduce || !('IntersectionObserver' in window)) {
        targets.forEach(function (el) {
          el.classList.add('is-in', 'visible');
        });
        return;
      }

      var io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            if (e.isIntersecting) {
              e.target.classList.add('is-in', 'visible');
              io.unobserve(e.target);
            }
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
      );

      targets.forEach(function (el) {
        io.observe(el);
      });
    } catch (err) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
