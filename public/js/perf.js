/** Creavix — performance + magnetic white cards + lazy media */
(function () {
  'use strict';
  try {
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

    function hydrateLazy() {
      var nodes = document.querySelectorAll('[data-src]');
      if (!nodes.length) return;
      function load(el) {
        var src = el.getAttribute('data-src');
        if (!src) return;
        if (el.tagName === 'IMG') el.src = src;
        else if (el.tagName === 'IFRAME') el.src = src;
        else el.style.backgroundImage = 'url(' + src + ')';
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
          var val =
            num % 1 === 0
              ? Math.round(start + (num - start) * eased)
              : (start + (num - start) * eased).toFixed(1);
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

    /* ── Magnetic card pull on scroll (smooth, GPU-friendly) ── */
    function initMagnetCards() {
      var reduced =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var cards = document.querySelectorAll('[data-magnetic]');
      if (!cards.length) return;

      var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      var wideScreen = (window.innerWidth || 0) >= 1024;
      if (reduced || !finePointer || !wideScreen) {
        cards.forEach(function (c) {
          c.classList.add('is-magnet');
        });
        return;
      }

      var active = [];
      var ticking = false;

      function measure() {
        var vh = window.innerHeight || 1;
        var center = vh * 0.45;
        for (var i = 0; i < active.length; i++) {
          var card = active[i];
          var r = card.getBoundingClientRect();
          var mid = r.top + r.height * 0.5;
          var dist = Math.abs(mid - center);
          var range = vh * 0.55;
          var t = Math.max(0, 1 - dist / range);
          /* ease-out */
          var eased = 1 - Math.pow(1 - t, 2.4);

          card.classList.toggle('is-magnet', eased > 0.15);
          card.classList.toggle('is-magnet-strong', eased > 0.72);

          if (!card.classList.contains('is-hover')) {
            var y = (1 - eased) * 22;
            var s = 0.975 + eased * 0.03;
            card.style.transform =
              'translate3d(0,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')';
            card.style.opacity = String(0.88 + eased * 0.12);
          }
        }
      }

      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          measure();
          ticking = false;
        });
      }

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (en) {
              var el = en.target;
              if (en.isIntersecting) {
                if (active.indexOf(el) === -1) active.push(el);
              } else {
                var ix = active.indexOf(el);
                if (ix !== -1) active.splice(ix, 1);
                el.classList.remove('is-magnet', 'is-magnet-strong');
                el.style.transform = '';
                el.style.opacity = '';
              }
            });
            onScroll();
          },
          { rootMargin: '12% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
        );
        cards.forEach(function (c) {
          io.observe(c);
        });
      } else {
        cards.forEach(function (c) {
          c.classList.add('is-magnet');
          active.push(c);
        });
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();

      /* hover lock so magnet doesn't fight :hover */
      cards.forEach(function (c) {
        c.addEventListener(
          'pointerenter',
          function () {
            c.classList.add('is-hover');
            c.style.transform = '';
            c.style.opacity = '';
          },
          { passive: true }
        );
        c.addEventListener(
          'pointerleave',
          function () {
            c.classList.remove('is-hover');
            onScroll();
          },
          { passive: true }
        );
      });
    }

    function boot() {
      runCountUps();
      initMagnetCards();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
      boot();
    }

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

    document.documentElement.classList.add('js-ready');
  } catch (err) {
    /* never crash */
  }
})();
