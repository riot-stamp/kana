/**
 * Kana Typing Trainer — application logic.
 *
 * No kana-specific data lives here; everything about individual
 * characters and how rows are grouped comes from KANA_SECTIONS
 * (kana-data.js).
 *
 * Visual feedback ("juice": a pop, a ripple, a shake, a soft transition
 * between kana) is always on and lives inline below — it's motion only,
 * never affects correctness, and always respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  const state = {
    enabledRows: {},
    weights: {},
    current: null,
    displayMode: 'kana',
    submissionMode: 'auto',
  };

  const dom = {};
  let wrongTimeoutId = null;
  let idleTimeoutId = null;

  function refocusInput() {
    // preventScroll matters on mobile: without it, focusing an input
    // above the fold snaps the page back to the top the moment you tap
    // a checkbox further down.
    dom.input.focus({ preventScroll: true });
  }

  function init() {
    dom.targetCell = document.getElementById('target-cell');
    dom.juiceLayer = document.getElementById('juice-layer');
    dom.primary = document.getElementById('target-primary');
    dom.secondary = document.getElementById('target-secondary');
    dom.emptyMessage = document.getElementById('empty-message');
    dom.input = document.getElementById('answer-input');
    dom.form = document.getElementById('answer-form');
    dom.feedback = document.getElementById('feedback');
    dom.rowSections = document.getElementById('row-sections');

    KANA_SECTIONS.forEach((section) => {
      section.rows.forEach((row) => {
        state.enabledRows[row.id] = !!section.defaultEnabled;
      });
    });

    buildRowSections();
    bindEvents();
    advanceToNextKana();
    dom.input.focus();
    scheduleIdle();
  }

  // ---- Selection pool -----------------------------------------------

  function getActivePool() {
    return KANA_SECTIONS.flatMap((section) => section.rows)
      .filter((row) => state.enabledRows[row.id])
      .flatMap((row) => row.kana);
  }

  function getWeight(kana) {
    return state.weights[kana] || 1;
  }

  function bumpWeightIncorrect(entry) {
    // Simple additive weighting, capped so one bad streak can't dominate
    // the whole session. Deliberately not a spaced-repetition scheduler.
    state.weights[entry.kana] = Math.min(getWeight(entry.kana) + 2, 12);
  }

  function decayWeightCorrect(entry) {
    state.weights[entry.kana] = Math.max(1, getWeight(entry.kana) - 1);
  }

  function pickNext() {
    const pool = getActivePool();
    if (pool.length === 0) {
      state.current = null;
      return;
    }
    let candidates = pool;
    if (pool.length > 1 && state.current) {
      const withoutPrevious = pool.filter((k) => k.kana !== state.current.kana);
      if (withoutPrevious.length > 0) candidates = withoutPrevious;
    }
    const total = candidates.reduce((sum, k) => sum + getWeight(k.kana), 0);
    let roll = Math.random() * total;
    state.current = candidates.find((k) => (roll -= getWeight(k.kana)) <= 0) || candidates[candidates.length - 1];
  }

  // Always reflects the live state.current, never a stale captured
  // value — safe to call from a deferred callback (e.g. after a juice
  // transition) even if the row selection changed in the meantime.
  function paintCurrent() {
    if (!state.current) {
      dom.emptyMessage.hidden = false;
      dom.targetCell.hidden = true;
      dom.secondary.hidden = true;
      dom.input.value = '';
      dom.input.disabled = true;
      return;
    }
    dom.emptyMessage.hidden = true;
    dom.targetCell.hidden = false;
    dom.input.disabled = false;
    renderTarget();
  }

  function advanceToNextKana() {
    pickNext();
    paintCurrent();
  }

  function renderTarget() {
    const mode = state.displayMode;
    const kana = state.current.kana;

    if (mode === 'romaji') {
      dom.primary.lang = '';
      dom.primary.textContent = state.current.romaji[0];
    } else if (kana.length === 2) {
      // Combination kana (base + small ya/yu/yo): two spans so the
      // "assembly" animation can animate them separately.
      dom.primary.lang = 'ja';
      dom.primary.textContent = '';
      const main = document.createElement('span');
      main.className = 'kana-part kana-part--main';
      main.textContent = kana[0];
      const small = document.createElement('span');
      small.className = 'kana-part kana-part--small';
      small.textContent = kana[1];
      dom.primary.append(main, small);
    } else {
      dom.primary.lang = 'ja';
      dom.primary.textContent = kana;
    }

    const showRomaji = mode === 'kana-romaji';
    dom.secondary.hidden = !showRomaji;
    dom.secondary.textContent = showRomaji ? state.current.romaji[0] : '';
  }

  // ---- Matching ----------------------------------------------------

  function isExactMatch(entry, raw) {
    const trimmed = raw.trim();
    if (!trimmed) return false;
    if (trimmed === entry.kana) return true;
    const lower = trimmed.toLowerCase();
    return entry.romaji.some((r) => r.toLowerCase() === lower);
  }

  // Used in Auto mode to tell "still typing a valid answer" apart from
  // "already wrong" without waiting for an explicit submit action: if
  // what's typed so far can't be the start of ANY accepted answer, it
  // can never become correct by typing more, so it counts as incorrect.
  function canStillMatch(entry, raw) {
    const trimmed = raw.trim();
    if (!trimmed) return true;
    if (entry.kana.startsWith(trimmed)) return true;
    const lower = trimmed.toLowerCase();
    return entry.romaji.some((r) => r.toLowerCase().startsWith(lower));
  }

  // ---- Visual feedback (motion only; never affects correctness) ------
  //
  // Always on. The only thing that can suppress it is the OS-level
  // prefers-reduced-motion setting, checked fresh every time — a
  // MediaQueryList's `.matches` is always live, so no change-listener
  // is needed just to read it.

  const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const motionOK = () => !(reduceMotionQuery && reduceMotionQuery.matches);
  const isKatakana = (kana) => /[\u30a0-\u30ff]/.test(kana);

  // Adds a class, removes it once its animation finishes, and forces a
  // reflow first so the same effect can retrigger back-to-back.
  function pulse(el, className) {
    if (!motionOK() || !el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    el.addEventListener('animationend', () => el.classList.remove(className), { once: true });
  }

  function ripple() {
    if (!motionOK() || !dom.juiceLayer) return;
    const el = document.createElement('span');
    el.className = 'juice-ripple';
    dom.juiceLayer.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  // Leave the just-answered kana -> paint the next one -> let it enter.
  // `onSwap` always runs; only *when* it runs depends on motion being
  // on. Input handling never waits on this.
  function playCorrect(finished, onSwap) {
    if (!motionOK()) {
      onSwap();
      return;
    }
    dom.primary.classList.remove('juice-leave', 'juice-sharp');
    void dom.primary.offsetWidth;
    dom.primary.classList.add('juice-leave');
    if (isKatakana(finished.kana)) dom.primary.classList.add('juice-sharp');
    ripple();
    // ponytail: relies on animationend rather than a setTimeout
    // fallback; if a browser ever fails to fire it, add one then.
    dom.primary.addEventListener(
      'animationend',
      () => {
        dom.primary.classList.remove('juice-leave', 'juice-sharp');
        onSwap();
        const combo = state.current && state.current.kana.length === 2;
        dom.primary.classList.add('juice-enter');
        if (combo) dom.primary.classList.add('juice-combo');
        dom.primary.addEventListener(
          'animationend',
          () => dom.primary.classList.remove('juice-enter', 'juice-combo'),
          { once: true }
        );
      },
      { once: true }
    );
  }

  function scheduleIdle() {
    window.clearTimeout(idleTimeoutId);
    dom.primary.classList.remove('juice-idle');
    idleTimeoutId = window.setTimeout(() => {
      if (dom.input.value === '' && motionOK()) dom.primary.classList.add('juice-idle');
    }, 1200);
  }

  // ---- Feedback ------------------------------------------------------

  function showWrongFeedback() {
    dom.feedback.textContent = 'Wrong!';
    dom.feedback.classList.add('is-visible');
    window.clearTimeout(wrongTimeoutId);
    wrongTimeoutId = window.setTimeout(() => {
      dom.feedback.classList.remove('is-visible');
    }, 1000);
  }

  function handleCorrect() {
    const finished = state.current;
    decayWeightCorrect(finished);
    dom.input.value = '';
    pulse(dom.input, 'juice-resolve');
    scheduleIdle();
    pickNext();
    playCorrect(finished, paintCurrent);
  }

  function handleIncorrect() {
    bumpWeightIncorrect(state.current);
    showWrongFeedback();
    pulse(dom.targetCell, 'juice-wrong');
    dom.input.value = '';
    scheduleIdle();
  }

  // ---- Row selection (grouped into collapsible sections) -------------

  function onRowSelectionChanged() {
    const pool = getActivePool();
    if (!state.current || !pool.includes(state.current)) pickNext();
    paintCurrent();
  }

  function buildRowCheckbox(row) {
    const label = document.createElement('label');
    label.className = 'kana-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!state.enabledRows[row.id];
    checkbox.className = 'kana-row-checkbox';
    checkbox.dataset.rowId = row.id;
    checkbox.setAttribute('aria-label', `Row: ${row.kana.map((k) => k.kana).join(', ')}`);

    const chars = document.createElement('span');
    chars.className = 'kana-row-chars';
    chars.lang = 'ja';
    chars.textContent = row.kana.map((k) => k.kana).join('  ');

    label.append(checkbox, chars);

    checkbox.addEventListener('change', () => {
      state.enabledRows[row.id] = checkbox.checked;
      onRowSelectionChanged();
      refocusInput();
    });

    return { label, checkbox };
  }

  function buildRowSections() {
    dom.rowSections.innerHTML = '';

    KANA_SECTIONS.forEach((section) => {
      const details = document.createElement('details');
      details.className = 'row-section';
      if (section.defaultEnabled) details.open = true;

      const summary = document.createElement('summary');
      summary.textContent = section.label;
      details.appendChild(summary);

      const actions = document.createElement('div');
      actions.className = 'row-section-actions';
      const checkboxes = [];

      const setAll = (checked) => {
        checkboxes.forEach((cb) => {
          cb.checked = checked;
          state.enabledRows[cb.dataset.rowId] = checked;
        });
        onRowSelectionChanged();
        refocusInput();
      };

      const selectAllBtn = document.createElement('button');
      selectAllBtn.type = 'button';
      selectAllBtn.className = 'text-button';
      selectAllBtn.textContent = 'Select all';
      selectAllBtn.addEventListener('click', () => setAll(true));

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'text-button';
      clearBtn.textContent = 'Clear';
      clearBtn.addEventListener('click', () => setAll(false));

      actions.append(selectAllBtn, clearBtn);
      details.appendChild(actions);

      const rowList = document.createElement('div');
      rowList.className = 'row-list';
      section.rows.forEach((row) => {
        const { label, checkbox } = buildRowCheckbox(row);
        checkboxes.push(checkbox);
        rowList.appendChild(label);
      });
      details.appendChild(rowList);

      dom.rowSections.appendChild(details);
    });
  }

  // ---- Event wiring --------------------------------------------------

  function bindEvents() {
    dom.input.addEventListener('input', () => {
      pulse(dom.input, 'juice-tick');
      scheduleIdle();
      if (state.submissionMode !== 'auto' || !state.current) return;
      const val = dom.input.value;
      if (isExactMatch(state.current, val)) {
        handleCorrect();
      } else if (!canStillMatch(state.current, val)) {
        handleIncorrect();
      }
    });

    dom.form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!state.current) return;
      const val = dom.input.value;
      if (!val.trim()) return;
      if (isExactMatch(state.current, val)) {
        handleCorrect();
      } else {
        handleIncorrect();
      }
    });

    document.querySelectorAll('input[name="display-mode"]').forEach((radio) => {
      radio.addEventListener('change', (event) => {
        if (event.target.checked) {
          state.displayMode = event.target.value;
          renderTarget();
          refocusInput();
        }
      });
    });

    document.querySelectorAll('input[name="submission-mode"]').forEach((radio) => {
      radio.addEventListener('change', (event) => {
        if (event.target.checked) {
          state.submissionMode = event.target.value;
          refocusInput();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Optional PWA layer: the app has zero network calls either way, so it
  // already works offline without this. Registration simply fails
  // silently where it isn't supported (e.g. a file:// URL).
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    });
  }
})();
