import { getPageTranslations } from '../data/translations';

declare global {
  interface Window { creavixSetLanguage: (language: 'en' | 'bn') => void; }
}

(() => {
  'use strict';
  const STORAGE_KEY = 'creavix-language';
  const path = location.pathname.replace(/\/$/, '') || '/';
  const dictionary = getPageTranslations(path);
  const textOriginals = new WeakMap<Text, string>();
  const attributeOriginals = new WeakMap<Element, Record<string, string>>();
  const translatableAttributes = ['placeholder', 'title', 'aria-label'];

  const readLanguage = (): 'en' | 'bn' => {
    try { return localStorage.getItem(STORAGE_KEY) === 'bn' ? 'bn' : 'en'; }
    catch { return 'en'; }
  };
  const rememberLanguage = (language: 'en' | 'bn') => {
    try { localStorage.setItem(STORAGE_KEY, language); } catch {}
  };
  const isSkipped = (element: Element | null) => !element || Boolean(element.closest('script, style, code, pre, svg, .support-root, [data-i18n-skip], [translate="no"]'));

  const translateTextNode = (node: Text, language: 'en' | 'bn') => {
    if (!node.parentElement || isSkipped(node.parentElement)) return;
    if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue || '');
    const original = textOriginals.get(node) || '';
    const trimmed = original.replace(/\s+/g, ' ').trim();
    if (!trimmed) return;
    const translated = language === 'bn' ? dictionary[trimmed] : '';
    if (language === 'bn' && translated) {
      const leading = (original.match(/^\s*/) || [''])[0];
      const trailing = (original.match(/\s*$/) || [''])[0];
      node.nodeValue = leading + translated + trailing;
    } else node.nodeValue = original;
  };

  const translateAttributes = (element: Element, language: 'en' | 'bn') => {
    if (isSkipped(element)) return;
    const saved = attributeOriginals.get(element) || {};
    translatableAttributes.forEach((name) => {
      if (!element.hasAttribute(name)) return;
      if (!(name in saved)) saved[name] = element.getAttribute(name) || '';
      const original = saved[name];
      element.setAttribute(name, language === 'bn' && dictionary[original] ? dictionary[original] : original);
    });
    attributeOriginals.set(element, saved);
  };

  const paintControls = (language: 'en' | 'bn') => {
    document.documentElement.lang = language;
    document.documentElement.dataset.siteLanguage = language;
    document.querySelectorAll<HTMLElement>('[data-language-toggle]').forEach((button) => {
      button.dataset.activeLanguage = language;
      button.setAttribute('aria-pressed', language === 'bn' ? 'true' : 'false');
      button.setAttribute('aria-label', language === 'bn' ? 'Switch website to English' : 'ওয়েবসাইট বাংলায় পড়ুন');
    });
  };

  const translateDocument = (language: 'en' | 'bn') => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) translateTextNode(node as Text, language);
    document.querySelectorAll('[placeholder], [title], [aria-label]').forEach((element) => translateAttributes(element, language));
  };

  window.creavixSetLanguage = (language) => {
    const selected = language === 'bn' ? 'bn' : 'en';
    rememberLanguage(selected);
    paintControls(selected);
    translateDocument(selected);
    document.dispatchEvent(new CustomEvent('creavix:language-change', { detail: { language: selected } }));
  };

  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest('[data-language-toggle]');
    if (!button) return;
    event.preventDefault();
    window.creavixSetLanguage(readLanguage() === 'bn' ? 'en' : 'bn');
  });
  window.creavixSetLanguage(readLanguage());
})();

