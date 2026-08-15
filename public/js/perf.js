/** Creavix performance + viewport zoom policy + crash guards */
(function () {
  'use strict';
  try {
    var meta = document.getElementById('viewport-meta');
    function isDesktopMode() {
      var w = window.innerWidth || document.documentElement.clientWidth || 0;
      // Native mobile: ~320–500. Desktop mode / desktop: typically 768+
      // Request Desktop Site often forces ~980–1280 layout width
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

    // Block multi-touch pinch zoom on mobile (when not desktop mode)
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
  } catch (err) {
    /* never crash the page */
  }
})();
