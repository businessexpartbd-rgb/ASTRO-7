/* Motion + book-flip video observer */
(function () {
  'use strict';
  function boot() {
    try {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      document.querySelectorAll('.grid-3, .grid-2, .mag-grid, .reviews-layout, .reviews-main').forEach(function (grid) {
        var cards = grid.querySelectorAll('.glass-card, .mag-card, .reviews-summary, .review-form-card');
        cards.forEach(function (el, i) {
          el.classList.add('mag-card');
          el.classList.add(i % 2 === 0 ? 'mag-left' : 'mag-right');
          el.style.setProperty('--mag-delay', Math.min(i, 5) * 40 + 'ms');
        });
      });

      document.querySelectorAll('.glass-card:not(.mag-card)').forEach(function (el, i) {
        el.classList.add('mag-card');
        el.classList.add(i % 2 === 0 ? 'mag-left' : 'mag-right');
        el.style.setProperty('--mag-delay', Math.min(i, 4) * 45 + 'ms');
      });

      document.querySelectorAll('h1, h2, h3, .eyebrow, .gallery-title, .form-heading').forEach(function (el) {
        el.classList.add('title-rise');
      });

      /* Global editorial motion hierarchy: hero title -> supporting copy -> actions. */
      var heroRoots = document.querySelectorAll('.hero, [class*="-hero"], [class*="hero-"]');
      heroRoots.forEach(function (hero) {
        var title = hero.querySelector('h1');
        if (title) {
          title.classList.remove('title-rise');
          title.classList.add('motion-hero-title');
          title.style.setProperty('--motion-delay', '20ms');
        }
        hero.querySelectorAll('p:not(.eyebrow), .lead, [class*="subtitle"], [class*="subhead"]').forEach(function (el, i) {
          if (i > 2 || el.closest('article')) return;
          el.classList.add('motion-copy');
          el.style.setProperty('--motion-delay', 80 + Math.min(i, 2) * 45 + 'ms');
        });
        hero.querySelectorAll('.btn, [class*="actions"] > a, [class*="actions"] > button').forEach(function (el, i) {
          el.classList.add('motion-action');
          el.style.setProperty('--motion-delay', 150 + Math.min(i, 3) * 40 + 'ms');
        });
      });

      document.querySelectorAll('section header > p, section [class*="-center"] > p, section [class*="-head"] > p').forEach(function (el, i) {
        if (el.classList.contains('eyebrow') || el.closest('article')) return;
        el.classList.add('motion-copy');
        el.style.setProperty('--motion-delay', Math.min(i % 3, 2) * 35 + 'ms');
      });

      document.querySelectorAll('main .btn, body > section .btn').forEach(function (el, i) {
        if (el.classList.contains('motion-action')) return;
        el.classList.add('motion-action');
        el.style.setProperty('--motion-delay', Math.min(i % 4, 3) * 35 + 'ms');
      });

      /* Stagger video cards for book-flip */
      document.querySelectorAll('.video-grid').forEach(function (grid) {
        grid.querySelectorAll('.video-card').forEach(function (el, i) {
          el.style.setProperty('--flip-delay', Math.min(i, 8) * 55 + 'ms');
        });
      });

      var targets = document.querySelectorAll('.mag-card, .title-rise, .motion-hero-title, .motion-copy, .motion-action, .reveal, .reviews-summary, .review-form-card');
      var videos = document.querySelectorAll('.video-card');

      if (reduce || !('IntersectionObserver' in window)) {
        targets.forEach(function (el) { el.classList.add('is-in', 'visible'); });
        videos.forEach(function (el) { el.classList.add('flip-in'); });
        return;
      }

      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (e.isIntersecting) {
            e.target.classList.add('is-in', 'visible');
            io.unobserve(e.target);
          }
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

      targets.forEach(function (el) { io.observe(el); });

      /* Video: flip in when entering, flip out when leaving upward */
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('flip-in');
            e.target.classList.remove('flip-out');
          } else if (e.boundingClientRect.top < 0) {
            e.target.classList.remove('flip-in');
            e.target.classList.add('flip-out');
          } else {
            e.target.classList.remove('flip-in');
            e.target.classList.remove('flip-out');
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

      videos.forEach(function (el) { vio.observe(el); });
    } catch (err) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
