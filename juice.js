/**
 * Game Juice — centralized, purely-visual feedback layer.
 *
 * Everything in this file is presentational. It never decides whether an
 * answer is correct, never touches matching/weighting logic, and never
 * blocks or delays input handling — callers update state and clear the
 * input immediately; this module only ever delays *when new text is
 * painted* for a transition, using a token guard so a fast typist who
 * triggers several transitions in a row never sees a stale one land.
 *
 * Effective animation = the persisted preference AND NOT
 * prefers-reduced-motion. Both are re-checked on every call, and the
 * reduced-motion media query is watched live, so a change either way
 * takes effect immediately without a reload.
 */

const GameJuice = (function () {
  'use strict';

  const STORAGE_KEY = 'kana-trainer:game-juice';

  const TIMING = {
    micro: 130, // the "pop" itself
    exit: 110, // outgoing kana
    enter: 190, // incoming kana
    standard: 220, // wrong-answer shake, input resolve flash
    special: 340, // session-sweep flourish
    tick: 110, // per-keystroke input tick
  };

  // ---- Preference + reduced-motion ------------------------------------

  let enabled = readPreference();
  const listeners = [];

  function readPreference() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'on') return true;
      if (stored === 'off') return false;
    } catch (err) {
      /* localStorage unavailable (private mode, etc.) — fall through to default */
    }
    return true; // default on; reduced-motion still overrides at call time
  }

  function writePreference(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
    } catch (err) {
      /* Nothing we can do — preference just won't survive a reload. */
    }
  }

  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function prefersReducedMotion() {
    return !!(reducedMotionQuery && reducedMotionQuery.matches);
  }

  if (reducedMotionQuery) {
    const handleChange = () => listeners.forEach((fn) => fn(shouldAnimate()));
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', handleChange);
    } else if (reducedMotionQuery.addListener) {
      reducedMotionQuery.addListener(handleChange); // Safari < 14
    }
  }

  function isEnabled() {
    return enabled;
  }

  function setEnabled(value) {
    enabled = !!value;
    writePreference(enabled);
    listeners.forEach((fn) => fn(shouldAnimate()));
  }

  function shouldAnimate() {
    return enabled && !prefersReducedMotion();
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  // ---- Small DOM helpers -----------------------------------------------

  function runClass(el, className, duration) {
    if (!el) return;
    el.classList.remove(className);
    // Force reflow so the class can be re-added and re-trigger its
    // animation even if it was already present a moment ago.
    // eslint-disable-next-line no-unused-expressions
    el.offsetWidth;
    el.classList.add(className);
    window.setTimeout(() => el.classList.remove(className), duration);
  }

  function spawnRipple(layer, { tone = 'accent', size = 1 } = {}) {
    if (!layer) return;
    const ripple = document.createElement('span');
    ripple.className = `juice-ripple juice-ripple--${tone}`;
    ripple.style.setProperty('--juice-ripple-scale', String(size));
    layer.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    // Safety net in case animationend never fires (e.g. tab backgrounded).
    window.setTimeout(() => ripple.remove(), TIMING.special + 200);
  }

  function spawnParticles(layer, count, { tone = 'accent' } = {}) {
    if (!layer) return;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = `juice-particle juice-particle--${tone}`;
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
      const distance = 14 + Math.random() * 12;
      particle.style.setProperty('--juice-px', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--juice-py', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--juice-rot', `${Math.round(Math.random() * 60 - 30)}deg`);
      particle.style.animationDelay = `${Math.round(Math.random() * 40)}ms`;
      layer.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
      window.setTimeout(() => particle.remove(), TIMING.special + 200);
    }
  }

  // ---- Correct-answer sequence -------------------------------------

  let transitionToken = 0;

  function invalidatePendingTransition() {
    transitionToken++;
  }

  /**
   * Orchestrates: pop the current glyph -> exit -> (onSwap paints the new
   * kana) -> enter. `onSwap` always runs, with or without animation; the
   * only difference is *when*. Input handling is never gated on this.
   *
   * options: { primaryEl, secondaryEl, layer, script, kind, sweep, onSwap }
   */
  function playCorrectTransition(options) {
    const { primaryEl, secondaryEl, layer, script, kind, sweep, onSwap } = options;
    const token = ++transitionToken;
    const stillCurrent = () => token === transitionToken;

    if (!shouldAnimate()) {
      onSwap();
      return;
    }

    setScriptFlavor(primaryEl, script);

    const popClass = kind === 'small' ? 'juice-pop juice-pop--small' : 'juice-pop';
    primaryEl.classList.add(...popClass.split(' '));

    const tone = kindTone(kind);
    const particleCount = sweep ? 8 : kind === 'basic' ? 0 : kind === 'small' ? 3 : 5;
    if (kind === 'dakuten') {
      spawnRipple(layer, { tone });
      window.setTimeout(() => spawnRipple(layer, { tone, size: 0.7 }), 55);
    } else if (kind === 'handakuten') {
      spawnRipple(layer, { tone, size: 1.25 });
    } else {
      spawnRipple(layer, { tone, size: sweep ? 1.5 : 1 });
    }
    if (particleCount > 0) spawnParticles(layer, particleCount, { tone });
    if (sweep) primaryEl.closest('.target-cell').classList.add('juice-sweep');

    window.setTimeout(() => {
      if (!stillCurrent()) return;
      primaryEl.classList.remove(...popClass.split(' '));
      primaryEl.classList.add('juice-exit');
      if (secondaryEl) secondaryEl.classList.add('juice-exit');

      window.setTimeout(() => {
        if (!stillCurrent()) return;
        primaryEl.classList.remove('juice-exit');
        if (secondaryEl) secondaryEl.classList.remove('juice-exit');

        onSwap();

        primaryEl.classList.add('juice-enter');
        if (secondaryEl) secondaryEl.classList.add('juice-enter');
        if (kind === 'combo') primaryEl.classList.add('juice-combo');

        window.setTimeout(() => {
          if (!stillCurrent()) return;
          primaryEl.classList.remove('juice-enter', 'juice-combo');
          if (secondaryEl) secondaryEl.classList.remove('juice-enter');
          const cell = primaryEl.closest('.target-cell');
          if (cell) cell.classList.remove('juice-sweep');
        }, TIMING.enter + 40);
      }, TIMING.exit);
    }, TIMING.micro);
  }

  function kindTone(kind) {
    if (kind === 'dakuten' || kind === 'handakuten') return 'ink';
    return 'accent';
  }

  function setScriptFlavor(el, script) {
    if (!el) return;
    el.classList.toggle('script-hiragana', script === 'hiragana');
    el.classList.toggle('script-katakana', script === 'katakana');
  }

  // ---- Wrong-answer feedback -----------------------------------------

  function playWrongFeedback(cellEl) {
    if (!shouldAnimate()) return;
    runClass(cellEl, 'juice-wrong', TIMING.standard);
  }

  // ---- Input tick / resolve -------------------------------------------

  function playInputTick(inputEl) {
    if (!shouldAnimate()) return;
    runClass(inputEl, 'juice-key-tick', TIMING.tick);
  }

  function playInputResolve(inputEl) {
    if (!shouldAnimate()) return;
    runClass(inputEl, 'juice-input-resolve', TIMING.standard);
  }

  // ---- Idle breathing ---------------------------------------------------

  function setIdle(primaryEl, idle) {
    if (!primaryEl) return;
    primaryEl.classList.toggle('juice-idle', idle && shouldAnimate());
  }

  return {
    TIMING,
    isEnabled,
    setEnabled,
    shouldAnimate,
    onChange,
    playCorrectTransition,
    invalidatePendingTransition,
    playWrongFeedback,
    playInputTick,
    playInputResolve,
    setIdle,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameJuice };
}
