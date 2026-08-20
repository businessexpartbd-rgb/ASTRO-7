/** Creavix — performance, zoom policy, lazy media, fast touch */
(function () {
  'use strict';
  try {
    /* ── Viewport zoom policy ── */
    var meta = document.getElementById('viewport-meta');
    function isDesktopMode() {
      var w = window.innerWidth || document.documentElement.clientWidth || 0;
      return w >= 768;
    }
    function applyZoomPolicy() {
      if (!meta) return;
      if (isDesktopMode()) {
        meta.setAttribute(
          'content',
          'width=device-width, initial-scale=1, viewport-fit=cover'
        );
      } else {
        meta.setAttribute(
          'content',
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        );
      }
    }
    applyZoomPolicy();
    var resizeTimer;
    window.addEventListener(
      'resize',
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyZoomPolicy, 120);
      },
      { passive: true }
    );
    window.addEventListener(
      'orientationchange',
      function () {
        setTimeout(applyZoomPolicy, 200);
      },
      { passive: true }
    );
    document.addEventListener(
      'gesturestart',
      function (e) {
        if (!isDesktopMode()) e.preventDefault();
      },
      { passive: false }
    );
    document.addEventListener(
      'gesturechange',
      function (e) {
        if (!isDesktopMode()) e.preventDefault();
      },
      { passive: false }
    );

    /* ── Ensure all content images are lazy except explicit eager ── */
    function markLazyImages() {
      var imgs = document.querySelectorAll('img:not([loading])');
      for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        if (img.closest('header, .navbar, .logo, .topbar')) continue;
        img.setAttribute('loading', 'lazy');
        if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
      }
    }
    markLazyImages();

    /* ── Native lazy + IO fallback for data-src ── */
    function hydrateLazy() {
      var nodes = document.querySelectorAll('[data-src]');
      if (!nodes.length) return;
      function load(el) {
        var src = el.getAttribute('data-src');
        if (!src) return;
        if (el.tagName === 'IMG') {
          el.src = src;
        } else if (el.tagName === 'IFRAME') {
          el.src = src;
        } else {
          el.style.backgroundImage = 'url(' + src + ')';
        }
        el.removeAttribute('data-src');
        el.classList.add('is-loaded');
      }
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) {
                load(en.target);
                io.unobserve(en.target);
              }
            });
          },
          { rootMargin: '200px 0px', threshold: 0.01 }
        );
        nodes.forEach(function (n) {
          io.observe(n);
        });
      } else {
        nodes.forEach(load);
      }
    }
    hydrateLazy();

    /* ── Prefetch internal links on hover / touchstart (fast navigation) ── */
    var prefetched = Object.create(null);
    function prefetch(href) {
      if (!href || prefetched[href]) return;
      if (href.indexOf('http') === 0 && href.indexOf(location.origin) !== 0) return;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('wa.me') !== -1)
        return;
      prefetched[href] = 1;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'document';
      document.head.appendChild(link);
    }
    document.addEventListener(
      'pointerdown',
      function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var href = a.getAttribute('href');
        if (href && href.charAt(0) === '/') prefetch(href);
      },
      { passive: true, capture: true }
    );

    /* ── Smooth passive scroll listener helper (no jank) ── */
    /* count-up numbers when visible */
    function runCountUps() {
      var els = document.querySelectorAll('.count-up[data-count]');
      if (!els.length) return;
      function animate(el) {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        var target = el.getAttribute('data-count') || '0';
        var num = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
        var suffix = String(target).replace(/[0-9.]/g, '');
        var start = 0;
        var dur = 900;
        var t0 = null;
        function frame(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = num % 1 === 0 ? Math.round(start + (num - start) * eased) : (start + (num - start) * eased).toFixed(1);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) {
                animate(en.target);
                cio.unobserve(en.target);
              }
            });
          },
          { threshold: 0.3 }
        );
        els.forEach(function (el) {
          cio.observe(el);
        });
      } else {
        els.forEach(animate);
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runCountUps, { once: true });
    } else {
      runCountUps();
    }

    /* ── Idle: warm YouTube DNS only when needed ── */
    function warmVideoHosts() {
      ['https://www.youtube-nocookie.com', 'https://i.ytimg.com'].forEach(function (origin) {
        var l = document.createElement('link');
        l.rel = 'dns-prefetch';
        l.href = origin;
        document.head.appendChild(l);
      });
    }
    if ('requestIdleCallback' in window) {
      requestIdleCallback(warmVideoHosts, { timeout: 2500 });
    } else {
      setTimeout(warmVideoHosts, 1800);
    }

    /* ── Touch: remove 300ms delay feel via CSS already; reinforce fast click on buttons ── */
    document.documentElement.classList.add('js-ready');
  } catch (err) {
    /* never crash the page */
  }
})();
