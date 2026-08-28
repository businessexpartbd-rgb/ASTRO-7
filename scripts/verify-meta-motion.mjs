// Logic tests with DOM mocks; not a substitute for browser/rendered-device QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const source = fs.readFileSync(new URL('../src/scripts/meta-studio.ts', import.meta.url), 'utf8');
const compiled = transformSync(source, { loader: 'ts', format: 'cjs' }).code;
class Element extends EventTarget {
  attrs = new Map(); classes = new Set(); values = new Map(); hidden = false;
  style = { setProperty: (key, value) => this.values.set(key, value) };
  classList = { toggle: (key, on) => on ? this.classes.add(key) : this.classes.delete(key), remove: key => this.classes.delete(key) };
  setAttribute(key, value) { this.attrs.set(key, value); }
  removeAttribute(key) { this.attrs.delete(key); }
  set tabIndex(value) { this.attrs.set('tabindex', String(value)); }
  getBoundingClientRect() { return { left: 10, top: 20, width: 400, height: 260 }; }
}
function fixture({ reduced = false, supported = true } = {}) {
  const root = new Element();
  const nodes = Object.fromEntries(['scene', 'tilt', 'toggle', 'hint'].map(key => [key, new Element()]));
  root.querySelector = query => nodes[query.match(/data-meta-(\w+)/)[1]];
  const document = new Element();
  const media = new Element(); media.matches = reduced;
  const frames = new Map(); let nextFrame = 0; let observer;
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const window = { matchMedia: () => media, ...(supported ? { IntersectionObserver: Observer } : {}) };
  const module = { exports: {} };
  vm.runInNewContext(compiled, { module, exports: module.exports, document, window, IntersectionObserver: Observer, AbortController,
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id) });
  const dispose = module.exports.enhanceMetaStudio(root);
  const emit = (target, type, data = {}) => {
    const event = new Event(type, { cancelable: true }); Object.assign(event, data); target.dispatchEvent(event); return event;
  };
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
  return { root, ...nodes, document, media, frames, dispose, emit, flush, observer, visible: value => observer.callback([{ isIntersecting: value }]) };
}
const f = fixture();
assert(!f.root.classes.has('is-running'), 'static until in viewport');
f.visible(true); assert(f.root.classes.has('is-running'));
const pointer = { isPrimary: true, button: 0, pointerType: 'mouse', pointerId: 1, clientX: 410, clientY: 20 };
f.emit(f.scene, 'pointermove', pointer); f.emit(f.scene, 'pointermove', pointer);
assert.equal(f.frames.size, 1, 'at most one pending animation frame'); f.flush();
assert.equal(f.tilt.values.get('--meta-rx'), '6.00deg'); assert.equal(f.tilt.values.get('--meta-ry'), '8.00deg');
f.emit(f.scene, 'pointerleave'); assert.equal(f.tilt.values.get('--meta-ry'), '0.00deg');
const touch = { ...pointer, pointerType: 'touch', pointerId: 2 };
assert(!f.emit(f.scene, 'pointerdown', touch).defaultPrevented, 'touch does not block scrolling');
f.flush(); assert.equal(f.tilt.values.get('--meta-ry'), '8.00deg');
f.emit(f.scene, 'pointercancel'); assert.equal(f.tilt.values.get('--meta-ry'), '0.00deg');
f.emit(f.scene, 'pointerdown', { ...touch, isPrimary: false }); assert.equal(f.frames.size, 0);
for (let i = 0; i < 10; i++) f.emit(f.scene, 'keydown', { key: 'ArrowRight' });
f.flush(); assert.equal(f.tilt.values.get('--meta-ry'), '8.00deg', 'keyboard bounded');
f.emit(f.scene, 'keydown', { key: 'Home' }); assert.equal(f.tilt.values.get('--meta-ry'), '0.00deg');
f.emit(f.toggle, 'click'); assert(!f.root.classes.has('is-running')); assert.equal(f.toggle.attrs.get('aria-pressed'), 'true');
f.emit(f.scene, 'pointermove', pointer); assert.equal(f.frames.size, 0, 'pause disables tilt');
f.emit(f.toggle, 'click'); assert(f.root.classes.has('is-running'));
f.document.hidden = true; f.emit(f.document, 'visibilitychange'); assert(!f.root.classes.has('is-running'));
f.document.hidden = false; f.emit(f.document, 'visibilitychange'); assert(f.root.classes.has('is-running'));
f.media.matches = true; f.emit(f.media, 'change'); assert(!f.root.classes.has('is-running')); assert(f.toggle.hidden); assert(!f.scene.attrs.has('tabindex'));
f.media.matches = false; f.emit(f.media, 'change'); assert(f.root.classes.has('is-running'));
f.visible(false); assert(!f.root.classes.has('is-running'));
f.visible(true); f.emit(f.scene, 'pointermove', pointer); f.dispose();
assert.equal(f.frames.size, 0); assert(f.observer.disconnected);
f.emit(f.scene, 'pointermove', pointer); assert.equal(f.frames.size, 0, 'cleanup removes handlers');
const noObserver = fixture({ supported: false }); assert(noObserver.toggle.hidden); assert(!noObserver.scene.attrs.has('tabindex')); noObserver.dispose();
const reduced = fixture({ reduced: true }); reduced.visible(true); assert(!reduced.root.classes.has('is-running')); reduced.dispose();
console.log('PASS: pointer/touch, scroll preservation, keyboard bounds, rAF coalescing, pause, visibility, reduced motion, cleanup and static fallback.');
