/** Poster-first gallery. A single mount owns the only playable iframe. */
export function enhanceVideoGallery(root: HTMLElement) {
  const dialog = root.querySelector<HTMLDialogElement>('[data-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') return () => {};
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-watch]'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-item]'));
  const picks = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-select]'));
  const mount = root.querySelector<HTMLElement>('[data-mount]')!;
  const title = root.querySelector<HTMLElement>('[data-title]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const external = root.querySelector<HTMLAnchorElement>('[data-external]')!;
  const closeButton = root.querySelector<HTMLButtonElement>('[data-close]')!;
  const fullButton = root.querySelector<HTMLButtonElement>('[data-fullscreen]')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const short = window.matchMedia('(max-height: 500px)');
  const abort = new AbortController();
  const options = { signal: abort.signal };
  let current = -1;
  let opener: HTMLElement | null = null;
  let oldOverflow: string | null = null;
  let restoreFocus = true;
  let frame = 0;
  let visible = !('IntersectionObserver' in window);
  let disposed = false;

  const unlock = () => {
    mount.replaceChildren(); // Destruction stops playback, even if the API has not loaded.
    current = -1;
    if (oldOverflow !== null) {
      document.documentElement.style.overflow = oldOverflow;
      oldOverflow = null;
    }
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  };
  const close = (focus = true) => {
    restoreFocus = focus;
    if (document.fullscreenElement === dialog) document.exitFullscreen?.().catch(() => {});
    if (dialog.open) dialog.close();
    unlock();
    syncMotion();
  };
  const openAt = (index: number, source?: HTMLElement) => {
    if (disposed || !links.length) return;
    const next = (index + links.length) % links.length;
    const id = links[next]?.dataset.vid;
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    if (dialog.open && next === current) return;
    if (!dialog.open) {
      opener = source || links[next];
      restoreFocus = true;
      dialog.showModal();
      oldOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    }
    mount.replaceChildren(); // Remove the previous film BEFORE creating another.
    current = next;
    title.textContent = 'Cinematic video ' + (next + 1) + ' / ' + links.length;
    status.textContent = 'Loading player…';
    external.href = links[next].href;
    picks.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
    const iframe = document.createElement('iframe');
    iframe.title = 'Creavix cinematic video ' + (next + 1);
    iframe.width = '1280';
    iframe.height = '720';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&controls=1&rel=0&playsinline=1&enablejsapi=1&fs=1&origin=' +
      encodeURIComponent(location.origin);
    iframe.addEventListener('load', () => {
      if (mount.firstElementChild === iframe) status.textContent = 'Press play if your browser asks.';
    }, { once: true, signal: abort.signal });
    iframe.addEventListener('error', () => {
      if (mount.firstElementChild === iframe) status.textContent = 'Player unavailable. Use Watch on YouTube.';
    }, { once: true, signal: abort.signal });
    mount.appendChild(iframe);
    if (source) closeButton.focus({ preventScroll: true });
    syncMotion();
  };

  links.forEach((link, i) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      // Preserve explicit "open in another tab" gestures.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      openAt(i, link);
    }, options);
  });
  picks.forEach((button, i) => button.addEventListener('click', () => openAt(i), options));
  root.querySelector('[data-prev]')!.addEventListener('click', () => openAt(current - 1), options);
  root.querySelector('[data-next]')!.addEventListener('click', () => openAt(current + 1), options);
  closeButton.addEventListener('click', () => close(), options);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }, options);
  dialog.addEventListener('close', () => { if (!dialog.open) { unlock(); syncMotion(); } }, options);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); }, options);
  fullButton.hidden = typeof dialog.requestFullscreen !== 'function' || !document.fullscreenEnabled;
  fullButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === dialog) await document.exitFullscreen();
      else await dialog.requestFullscreen();
    } catch { status.textContent = 'Fullscreen is unavailable here; the large player remains open.'; }
  }, options);
  document.addEventListener('fullscreenchange', () => {
    fullButton.setAttribute('aria-label', document.fullscreenElement === dialog ? 'Exit fullscreen' : 'Enter fullscreen');
  }, options);

  function updateStack() {
    // Media changes may call this directly while a scroll frame is queued.
    cancelAnimationFrame(frame);
    frame = 0;
    const flat = reduced.matches || short.matches;
    const pin = parseFloat(window.getComputedStyle(items[0]).top) || 0;
    // Read layout once per frame, then write only depth/classes.
    const tops = flat ? [] : items.map(item => item.getBoundingClientRect().top);
    let front = 0;
    tops.forEach((top, i) => { if (top <= pin + 2) front = i; });
    items.forEach((item, i) => {
      const under = !flat && i < front;
      item.classList.toggle('is-under', under);
      item.style.setProperty('--depth', String(under ? Math.min(front - i, 5) : 0));
      links[i].tabIndex = under ? -1 : 0;
      // No inaccessible offscreen future films: keyboard navigation can reach them.
      if (under) links[i].setAttribute('aria-hidden', 'true');
      else links[i].removeAttribute('aria-hidden');
    });
  }
  function schedule() {
    if (frame || disposed || !visible || document.hidden || dialog.open) return;
    frame = requestAnimationFrame(updateStack);
  }
  function syncMotion() {
    root.classList.toggle('is-in-view', visible && !document.hidden && !dialog.open && !reduced.matches);
    schedule();
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncMotion();
  }) : null;
  observer?.observe(root);
  window.addEventListener('scroll', schedule, { ...options, passive: true });
  window.addEventListener('resize', schedule, { ...options, passive: true });
  reduced.addEventListener('change', () => { updateStack(); syncMotion(); }, options);
  short.addEventListener('change', updateStack, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && dialog.open) close(false);
    syncMotion();
  }, options);
  window.addEventListener('pagehide', () => close(false), options);
  updateStack();
  syncMotion();
  return () => {
    disposed = true;
    abort.abort();
    observer?.disconnect();
    cancelAnimationFrame(frame);
    close(false);
    root.classList.remove('is-in-view');
    items.forEach(item => { item.classList.remove('is-under'); item.style.removeProperty('--depth'); });
    links.forEach(link => { link.tabIndex = 0; link.removeAttribute('aria-hidden'); link.removeAttribute('aria-haspopup'); });
  };
}
