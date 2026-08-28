/* Progressive enhancement: readable first, motion second. No dependencies. */
(function () {
  'use strict';
  function boot() {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)');
    var targets = document.querySelectorAll('main h2, main h3, main .eyebrow, main .reveal, .brand-service-card, .pf-card');
    document.querySelectorAll('.reveal').forEach(function (element) { element.classList.add('visible', 'is-in'); });
    document.querySelectorAll('.video-card').forEach(function (element) { element.classList.add('flip-in'); });
    if (reduce.matches || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!entry.target.parentElement.closest('.brand-enter')) entry.target.classList.add('brand-enter');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    targets.forEach(function (element) {
      if (!element.closest('[data-meta-studio]') && element.getBoundingClientRect().top > innerHeight * 0.85) observer.observe(element);
    });
    var icons = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle('brand-icon-active', entry.isIntersecting); });
    }, { threshold: 0.05 });
    document.querySelectorAll('.live-icon').forEach(function (element) { icons.observe(element); });
    document.addEventListener('visibilitychange', function () { document.documentElement.toggleAttribute('data-page-hidden', document.hidden); });
    reduce.addEventListener('change', function () {
      if (reduce.matches) {
        observer.disconnect(); icons.disconnect();
        document.querySelectorAll('.brand-enter, .brand-icon-active').forEach(function (element) { element.classList.remove('brand-enter', 'brand-icon-active'); });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
