/** Progressive enhancement: event-driven tilt, no perpetual JavaScript render loop. */
export function enhanceMetaStudio(root: HTMLElement): () => void {
  const scene = root.querySelector<HTMLElement>('[data-meta-scene]');
  const tilt = root.querySelector<HTMLElement>('[data-meta-tilt]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-meta-toggle]');
  const hint = root.querySelector<HTMLElement>('[data-meta-hint]');
  if (!scene || !tilt || !toggle) return () => {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const options = { signal: events.signal };
  const supported = 'IntersectionObserver' in window;
  let visible = false;
  let paused = false;
  let rx = 0;
  let ry = 0;
  let frame = 0;
  let pointer: number | null = null;
  const allowed = () => visible && !paused && !reduced.matches && !document.hidden;
  const paint = () => {
    frame = 0;
    tilt.style.setProperty('--meta-rx', `${rx.toFixed(2)}deg`);
    tilt.style.setProperty('--meta-ry', `${ry.toFixed(2)}deg`);
  };
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    rx = ry = 0;
    paint();
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  const sync = () => {
    const running = allowed();
    root.classList.toggle('is-running', running);
    toggle.hidden = reduced.matches || !supported;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
    if (hint) hint.hidden = reduced.matches || !supported;
    if (reduced.matches || !supported) {
      scene.removeAttribute('tabindex');
      scene.removeAttribute('role');
      scene.removeAttribute('aria-label');
    } else {
      scene.tabIndex = 0;
      scene.setAttribute('role', 'group');
      scene.setAttribute('aria-label', 'Interactive Meta illustration. Use arrow keys to tilt; Home to reset.');
    }
    if (!running) reset();
  };
  // Without IntersectionObserver retain a static illustration, not offscreen animation.
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { threshold: 0.08 }) : null;
  observer?.observe(scene);
  const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
  const point = (event: PointerEvent) => {
    if (!allowed() || !event.isPrimary) return;
    if (event.pointerType !== 'mouse' && event.pointerId !== pointer) return;
    const box = scene.getBoundingClientRect();
    if (!box.width || !box.height) return;
    rx = clamp((0.5 - (event.clientY - box.top) / box.height) * 12, 6);
    ry = clamp(((event.clientX - box.left) / box.width - 0.5) * 16, 8);
    schedule();
  };
  scene.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || !allowed()) return;
    pointer = event.pointerId;
    point(event);
  }, { ...options, passive: true });
  scene.addEventListener('pointermove', point, { ...options, passive: true });
  ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(type => scene.addEventListener(type, reset, options));
  scene.addEventListener('keydown', event => {
    if (!allowed()) return;
    const keys: Record<string, [number, number]> = { ArrowUp: [2, 0], ArrowDown: [-2, 0], ArrowLeft: [0, -2], ArrowRight: [0, 2] };
    if (event.key === 'Home') { event.preventDefault(); reset(); return; }
    const delta = keys[event.key];
    if (!delta) return;
    event.preventDefault();
    rx = clamp(rx + delta[0], 6);
    ry = clamp(ry + delta[1], 8);
    schedule();
  }, options);
  toggle.addEventListener('click', () => { paused = !paused; sync(); }, options);
  document.addEventListener('visibilitychange', sync, options);
  reduced.addEventListener('change', sync, options);
  sync();
  return () => { events.abort(); observer?.disconnect(); reset(); root.classList.remove('is-running'); };
}
