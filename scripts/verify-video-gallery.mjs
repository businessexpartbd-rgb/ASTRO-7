// Playback ownership and CSS contracts. Browser QA is reported separately.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { transformSync } from 'esbuild';
const source = fs.readFileSync(new URL('../src/scripts/video-gallery.ts', import.meta.url), 'utf8');
const compiled = transformSync(source, { loader: 'ts', format: 'cjs' }).code;
class Element extends EventTarget {
  dataset = {}; attrs = new Map(); classes = new Set(); children = []; hidden = false;
  style = { overflow: '', setProperty: (k,v) => this.attrs.set(k,v), removeProperty: k => this.attrs.delete(k) };
  classList = { toggle: (k,on) => on ? this.classes.add(k) : this.classes.delete(k), remove: k => this.classes.delete(k) };
  isConnected = true; focused = 0; top = 200; textContent = ''; open = false;
  setAttribute(k,v) { this.attrs.set(k,v); } removeAttribute(k) { this.attrs.delete(k); }
  focus() { this.focused++; } getBoundingClientRect() { return { top: this.top }; }
  replaceChildren(...nodes) { this.children = nodes; } appendChild(node) { this.children.push(node); }
  get firstElementChild() { return this.children[0] || null; }
  showModal() { this.open = true; } close() { this.open = false; this.dispatchEvent(new Event('close')); }
}
function fixture({ reduced = false, short = false, supported = true } = {}) {
  const root = new Element(), dialog = new Element(), document = new Element(), window = new Element();
  if (!supported) dialog.showModal = undefined;
  const nodes = Object.fromEntries(['mount','title','status','external','close','fullscreen','prev','next'].map(k => [k,new Element()]));
  root.querySelector = q => q === '[data-dialog]' ? dialog : nodes[q.slice(6,-1)];
  const ids = ['Tu9qAT9c2Ek','rlY4Ih68DHM','FvWyFDNAAPY','6RaKnCSXZhM','4ryJaLx6o0k','UlNoCAs69vg'];
  const links = ids.map(id => { const e = new Element(); e.dataset.vid = id; e.href = 'https://www.youtube.com/watch?v=' + id; return e; });
  const items = ids.map((_,i) => {const e = new Element(); e.top = 100+i*300;return e;});
  const picks = ids.map(() => new Element());
  root.querySelectorAll = q => q === '[data-watch]' ? links : q === '[data-item]' ? items : picks;
  document.documentElement = new Element(); document.documentElement.style.overflow = 'clip';
  document.hidden = false; document.fullscreenEnabled = true; document.fullscreenElement = null;
  document.exitFullscreen = async () => { document.fullscreenElement = null; };
  dialog.requestFullscreen = async () => { document.fullscreenElement = dialog; };
  const created = []; document.createElement = tag => { assert.equal(tag,'iframe'); const e = new Element(); created.push(e); return e; };
  const motion = new Element();motion.matches = reduced;
  const small = new Element();small.matches = short;
  window.matchMedia = q => q.includes('reduced') ? motion : small;
  window.getComputedStyle = () => ({ top: '100px' });
  let observer;
  class Observer { constructor(cb) { this.cb=cb;observer=this; } observe() {} disconnect() { this.disconnected=true; } }
  window.IntersectionObserver = Observer;
  const frames = new Map(); let nextFrame = 0;
  const module = { exports: {} };
  vm.runInNewContext(compiled, { module, exports:module.exports, window, document, location:{origin:'https://www.creavixit.com'},
    IntersectionObserver:Observer, AbortController,
    requestAnimationFrame: cb => { frames.set(++nextFrame,cb);return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id) });
  const dispose = module.exports.enhanceVideoGallery(root);
  const emit = (target,type,data={}) => {const event = new Event(type,{cancelable:true});Object.assign(event,data);target.dispatchEvent(event);return event;};
  const click = (target, more={}) => emit(target,'click',{button:0,...more});
  const flush = () => {const queued=[...frames.values()];frames.clear();queued.forEach(cb=>cb());};
  return {root,dialog,document,window,...nodes,links,items,picks,created,motion,small,observer,frames,dispose,emit,click,flush};
}
const f = fixture();
assert.equal(f.created.length,0,'No iframe or autoplay before user activation');
assert(!f.root.classes.has('is-in-view'),'Offscreen wave paused');
f.observer.cb([{isIntersecting:true}]);f.flush();assert(f.root.classes.has('is-in-view'));
f.click(f.links[0]);assert(f.dialog.open);assert.equal(f.created.length,1);assert.equal(f.mount.children.length,1);
assert.equal(f.document.documentElement.style.overflow,'hidden');assert.equal(f.close.focused,1);
const first=f.mount.firstElementChild;
assert(first.src.includes('youtube-nocookie.com/embed/Tu9qAT9c2Ek?autoplay=1&controls=1'));
assert(first.src.includes('origin=https%3A%2F%2Fwww.creavixit.com'));assert(first.allowFullscreen);
assert(!f.root.classes.has('is-in-view'),'Waves paused while player open');
f.click(f.picks[0]);assert.equal(f.created.length,1,'Same video never duplicates/reloads');
f.click(f.picks[1]);assert.equal(f.mount.children.length,1);assert.notEqual(f.mount.firstElementChild,first);
assert.equal(f.picks[1].attrs.get('aria-pressed'),'true');
f.emit(first,'load');assert.equal(f.status.textContent,'Loading player…','Stale load cannot change current status');
f.emit(f.mount.firstElementChild,'load');assert(f.status.textContent.includes('Press play'));
f.click(f.next);assert(f.mount.firstElementChild.src.includes('FvWyFDNAAPY'));
f.click(f.prev);assert(f.mount.firstElementChild.src.includes('rlY4Ih68DHM'));
f.click(f.picks[5]);f.click(f.next);assert(f.mount.firstElementChild.src.includes('Tu9qAT9c2Ek'),'Picker wraps');
f.emit(f.dialog,'cancel');assert(!f.dialog.open);assert.equal(f.mount.children.length,0,'Escape destroys player');
assert.equal(f.document.documentElement.style.overflow,'clip');assert.equal(f.links[0].focused,1);
const count=f.created.length;assert(!f.click(f.links[0],{ctrlKey:true}).defaultPrevented);assert.equal(f.created.length,count);
f.click(f.links[3]);f.document.hidden=true;f.emit(f.document,'visibilitychange');
assert(!f.dialog.open);assert.equal(f.mount.children.length,0,'Hidden tab cannot keep audio playing');
f.document.hidden=false;f.emit(f.document,'visibilitychange');assert.equal(f.mount.children.length,0,'No automatic resume');
f.items[0].top=100;f.items[1].top=100;f.items[2].top=100;
f.emit(f.window,'scroll');f.emit(f.window,'scroll');assert.equal(f.frames.size,1);f.flush();
assert(f.items[0].classes.has('is-under'));assert.equal(f.links[0].tabIndex,-1);
assert.equal(f.links[2].tabIndex,0);assert.equal(f.links[3].tabIndex,0,'Future films remain keyboard accessible');
f.items[1].top=400;f.items[2].top=700;f.emit(f.window,'scroll');f.flush();
assert(!f.items[0].classes.has('is-under'),'Reverse scroll unstacks previous film');
f.motion.matches=true;f.emit(f.motion,'change');assert(f.links.every(l=>l.tabIndex===0));assert(!f.root.classes.has('is-in-view'));
f.motion.matches=false;f.small.matches=true;f.emit(f.small,'change');assert(f.items.every(i=>!i.classes.has('is-under')));
f.click(f.links[1]);f.click(f.fullscreen);await Promise.resolve();assert.equal(f.document.fullscreenElement,f.dialog);
f.click(f.close);await Promise.resolve();assert.equal(f.document.fullscreenElement,null);
f.click(f.links[2]);f.emit(f.window,'pagehide');assert.equal(f.mount.children.length,0);
f.links[4].dataset.vid='invalid/id';const before=f.created.length;f.click(f.links[4]);assert.equal(f.created.length,before);
f.dispose();assert(f.observer.disconnected);assert.equal(f.frames.size,0);
f.click(f.links[0]);assert.equal(f.mount.children.length,0,'Cleanup removes all handlers');
const unsupported=fixture({supported:false});assert(!unsupported.click(unsupported.links[0]).defaultPrevented,'No dialog support keeps original YouTube links');
const markup=fs.readFileSync(new URL('../src/components/FeaturedVideoStack.astro',import.meta.url),'utf8');
assert(markup.includes('.fvs-item{position:sticky;top:var(--pin)'),'Shared-parent sticky items');
assert(markup.includes('content-visibility:visible;contain:none'),'Sticky stack not clipped by global containment');
assert(markup.includes('::backdrop{background:#071525ad;backdrop-filter:blur(14px)'));
assert(markup.includes('prefers-reduced-motion:reduce'));
assert(markup.includes('minmax(44px,1fr)'),'Mobile picker touch targets stay at least 44px');
assert(!markup.includes('data-player>'),'No per-card players');
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
assert.equal([...html.matchAll(/data-watch /g)].length,6,'Exactly six original watch links in built homepage');
assert(!/<iframe[^>]+youtube-nocookie/.test(html),'No preloaded YouTube players');
console.log('PASS: six original films; one deferred iframe; switching/close/Escape/visibility/pagehide/fullscreen; focus and scroll restoration; reversible stack; reduced motion; 44px controls; cleanup and no-JS fallback.');
