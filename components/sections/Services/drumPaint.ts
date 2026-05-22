'use client';

import { STAR_SVG_OUTLINE, STAR_SVG_FILLED } from './Star';
import { TOOLS_UNIT_REPEAT, classifyFaceWord } from './constants';

/* Required class names on `styles`: portalMask, portalLetter, accent, tool,
   glyph, ttsep. Typed loosely as the CSS-module index signature so any module
   exposing these keys is accepted without a cast. */
interface DrumPaintDeps {
  bigword: HTMLElement;
  toolsEl: HTMLElement;
  styles: { readonly [key: string]: string };
}

export function createDrumPainter({ bigword, toolsEl, styles }: DrumPaintDeps) {
  /* Pre-parse the star SVGs once per painter; cloning a template is ~10× faster
     than re-parsing `innerHTML` for each of the ~56 separators per face. */
  const starOutlineTpl = document.createElement('template');
  starOutlineTpl.innerHTML = STAR_SVG_OUTLINE;
  const starFilledTpl = document.createElement('template');
  starFilledTpl.innerHTML = STAR_SVG_FILLED;

  function paintBigWord(word: string) {
    const frag = document.createDocumentFragment();
    for (const { ch, accent } of classifyFaceWord(word)) {
      const mask = document.createElement('span');
      mask.className = styles.portalMask;
      const inner = document.createElement('span');
      inner.className = styles.portalLetter;
      if (accent) inner.classList.add(styles.accent);
      inner.textContent = ch;
      mask.appendChild(inner);
      frag.appendChild(mask);
    }
    bigword.replaceChildren(frag);
  }

  /* Tools marquee. The track is two identical back-to-back copies of
     `(tools × TOOLS_UNIT_REPEAT)`; the CSS animation translates by exactly
     one copy's width and loops seamlessly. starIdx resets at the start of
     each copy so the outline/filled alternation aligns at the loop seam. */
  function paintTools(tools: readonly string[]) {
    const frag = document.createDocumentFragment();
    for (let copy = 0; copy < 2; copy++) {
      let starIdx = 0;
      for (let rep = 0; rep < TOOLS_UNIT_REPEAT; rep++) {
        tools.forEach((t) => {
          const item = document.createElement('div');
          item.className = styles.tool;
          const txt = document.createElement('span');
          txt.className = styles.glyph;
          txt.textContent = t;
          item.appendChild(txt);
          const sep = document.createElement('span');
          sep.className = styles.ttsep;
          const tpl = starIdx % 2 === 0 ? starOutlineTpl : starFilledTpl;
          sep.appendChild(tpl.content.cloneNode(true));
          starIdx += 1;
          item.appendChild(sep);
          frag.appendChild(item);
        });
      }
    }
    toolsEl.replaceChildren(frag);
  }

  /* offsetLeft of the half-boundary item equals the cumulative width + gaps of
     the first copy — exactly what the marquee animation needs to translate by.
     One layout read; no getComputedStyle / parseFloat / per-item offsetWidth
     loop. */
  function measureToolsScrollWidth() {
    const items = toolsEl.children;
    if (items.length < 2) return;
    const halfBoundary = items[items.length / 2] as HTMLElement | undefined;
    if (!halfBoundary) return;
    toolsEl.style.setProperty('--scroll-width', `${halfBoundary.offsetLeft}px`);
  }

  /* Reset the marquee animation timing so a freshly-painted face starts
     at translateX(0). Without this, the new content inherits the prior
     face's animation phase and the seam between copies can flicker. */
  function resetToolsAnimation() {
    toolsEl.style.animation = 'none';
    void toolsEl.offsetWidth;
    toolsEl.style.animation = '';
  }

  const getLetters = () =>
    Array.from(bigword.querySelectorAll<HTMLElement>(`.${styles.portalLetter}`));

  return { paintBigWord, paintTools, measureToolsScrollWidth, resetToolsAnimation, getLetters };
}
