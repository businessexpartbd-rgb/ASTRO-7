// Run with Node; DOM mocks check behavior, not rendered browser/device layout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../src/components/SiteChrome.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
class Element extends EventTarget {
  attrs = new Map(); classes = new Set(); values = new Map(); children = [];
  hidden = false; value = ''; textContent = ''; innerHTML = ''; focused = false;
  style = { setProperty: (key, value) => this.values.set(key, value) };
  classList = { toggle: (key, on) => on ? this.classes.add(key) : this.classes.delete(key) };
  setAttribute(key, value) { this.attrs.set(key, value); }
  getAttribute(key) { return this.attrs.get(key); }
  appendChild(child) { this.children.push(child); }
  focus() { this.focused = true; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 64, height: 64 }; }
}
function setup({ paused = false, reduced = false, storageBlocked = false } = {}) {
  const ids = [...source.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  const nodes = Object.fromEntries(ids.map(id => [id, new Element()]));
  nodes['support-panel'].hidden = true;
  const document = new Element(); document.documentElement = { lang: 'en' };
  document.getElementById = id => nodes[id]; document.createElement = () => new Element();
  const quick = new Element(); quick.setAttribute('data-q', 'Tell me about SEO');
  document.querySelectorAll = selector => selector === '#support-quick [data-q]' ? [quick] : [];
  const media = new Element(); media.matches = reduced;
  const window = new Element(); window.matchMedia = () => media; window.scrollTo = value => window.scrolled = value;
  const storage = new Map(paused ? [['creavix-helper-motion-paused', '1']] : []);
  const localStorage = { getItem: key => { if (storageBlocked) throw Error('blocked'); return storage.get(key); }, setItem: (key, value) => { if (storageBlocked) throw Error('blocked'); storage.set(key, value); } };
  const timers = []; const frames = new Map(); let nextFrame = 0;
  vm.runInNewContext(script, { document, window, localStorage, setTimeout: (callback, delay) => { timers.push({ callback, delay }); },
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; }, cancelAnimationFrame: id => frames.delete(id) });
  const emit = (id, type, data = {}) => { const event = new Event(type, { cancelable: true }); Object.assign(event, data); (typeof id === 'string' ? nodes[id] : id).dispatchEvent(event); return event; };
  return { nodes, document, window, media, storage, frames, timers, quick, emit,
    flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); } };
}
const f = setup(); const n = f.nodes;
assert(n['support-root'].classes.has('is-helper-running'));
const pointer = { isPrimary: true, pointerType: 'mouse', clientX: 64, clientY: 0 };
f.emit('support-open', 'pointermove', pointer); f.emit('support-open', 'pointermove', pointer);
assert.equal(f.frames.size, 1); f.flush(); assert.equal(n['support-robot-look'].values.get('--helper-y'), '8.00deg');
f.emit('support-open', 'pointerleave'); assert.equal(n['support-robot-look'].values.get('--helper-y'), '0deg');
const touch = f.emit('support-open', 'pointermove', { ...pointer, pointerType: 'touch' });
assert(!touch.defaultPrevented); assert.equal(f.frames.size, 0);
f.emit('support-motion-toggle', 'click'); assert(!n['support-root'].classes.has('is-helper-running'));
assert.equal(f.storage.get('creavix-helper-motion-paused'), '1');
assert.equal(n['support-motion-toggle'].attrs.get('aria-pressed'), 'true');
f.emit('support-motion-toggle', 'click'); assert(n['support-root'].classes.has('is-helper-running'));
f.document.hidden = true; f.emit(f.document, 'visibilitychange'); assert(!n['support-root'].classes.has('is-helper-running'));
f.document.hidden = false; f.emit(f.document, 'visibilitychange'); assert(n['support-root'].classes.has('is-helper-running'));
f.media.matches = true; f.emit(f.media, 'change'); assert(!n['support-root'].classes.has('is-helper-running')); assert(n['support-motion-toggle'].hidden);
f.media.matches = false; f.emit(f.media, 'change');
f.emit('support-invite-open', 'click'); assert(!n['support-panel'].hidden); assert(n['support-invite'].hidden);
assert.equal(n['support-open'].attrs.get('aria-expanded'), 'true'); assert(!n['support-root'].classes.has('is-helper-running'));
f.timers.shift().callback(); assert(n['support-input'].focused);
f.emit(f.document, 'keydown', { key: 'Escape' }); assert(n['support-panel'].hidden); assert(n['support-invite-open'].focused);
assert(n['support-root'].classes.has('is-helper-running'));
f.emit('support-open', 'click'); f.timers.shift().callback();
// User content remains text, never interpolated into the answer HTML.
n['support-input'].value = '<img src=x onerror=alert(1)>';
assert(f.emit('support-form', 'submit').defaultPrevented);
assert.equal(n['support-body'].children.at(-1).textContent, '<img src=x onerror=alert(1)>');
assert.equal(n['support-body'].children.at(-1).innerHTML, '');
assert.equal(n['support-input'].value, '');
f.emit(f.quick, 'click'); assert.equal(f.timers.length, 2);
f.timers.shift().callback(); assert(!n['support-typing'].hidden, 'parallel replies keep typing state');
f.timers.shift().callback(); assert(n['support-typing'].hidden);
assert(n['support-body'].children.at(-1).innerHTML.includes('technical SEO'));
assert(n['support-body'].children.at(-1).innerHTML.includes('https://wa.me/8801890484355'));
assert.equal(n['support-status-text'].textContent, 'Instant service guide');
f.emit('support-close', 'click'); assert(n['support-panel'].hidden); assert(n['support-open'].focused);
const stopped = setup({ paused: true }); assert(!stopped.nodes['support-root'].classes.has('is-helper-running'));
const calm = setup({ reduced: true }); assert(!calm.nodes['support-root'].classes.has('is-helper-running'));
const blocked = setup({ storageBlocked: true }); blocked.emit('support-motion-toggle', 'click'); assert(!blocked.nodes['support-root'].classes.has('is-helper-running'));
console.log('PASS: launcher, help label, close/Escape/focus, safe input, replies/quick questions, concurrent replies, WhatsApp, pointer bounds, touch scrolling, pause persistence, reduced motion, hidden tab and blocked storage.');
