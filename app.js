/**
 * Kana Typing Trainer — application logic.
 *
 * No kana-specific data lives here; everything about individual
 * characters and how rows are grouped comes from KANA_SECTIONS
 * (kana-data.js). This file only knows about sections, rows, and their
 * { kana, romaji } shape, so it shouldn't need to change as that data
 * grows further.
 *
 * All visual "Game Juice" effects live in juice.js (GameJuice). This
 * file only ever calls into it at the moment something happens
 * (correct answer, wrong answer, a keystroke); it never waits for it.
 * State updates and input handling below are synchronous regardless of
 * whether Game Juice is on, off, or mid-transition.
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

  // Metadata (script + structural kind) per kana character, derived once
  // from which section/row it came from. Game Juice uses this to give
  // dakuten/handakuten/small/combination kana — and hiragana vs.
  // katakana — a distinct but restrained motion flavor. Matching and
  // weighting never consult this; it is purely presentational.
  const kanaMeta = new Map();

  function classifyRow(section, row) {
    const script = section.id.startsWith('katakana') ? 'katakana' : 'hiragana';
    let kind = 'basic';
    if (section.id.includes('combo')) kind = 'combo';
    else if (section.id.includes('small')) kind = 'small';
    else if (section.id.includes('dakuten')) {
      kind = row.id === 'pa' || row.id === 'k-pa' ? 'handakuten' : 'dakuten';
    }
    return { script, kind };
  }

  // Purely in-memory, never displayed, never persisted, reset whenever
  // the active pool changes. Not a scoring system — it only powers one
  // occasional, slightly stronger animation when every currently-enabled
  // kana has been answered correctly at least once in the current pass.
  let sessionSeen = new Set();

  function resetSessionProgress() {
    sessionSeen = new Set();
  }

  function trackSessionProgress(entry, pool) {
    sessionSeen.add(entry.kana);
    if (pool.length >= 5 && pool.every((k) => sessionSeen.has(k.kana))) {
      sessionSeen = new Set();
      return true;
    }
    return false;
  }

  // Re-focusing the answer input after a tap elsewhere (a row checkbox,
  // a "select all" button, a settings tab, ...) is a convenience so
  // people can keep typing without hunting for the field again.
  // `preventScroll` matters on mobile: without it, focusing an input
  // above the fold snaps the page back to the top the moment you tap a
  // checkbox further down.
  function refocusInput() {
    dom.input.focus({ preventScroll: true });
  }

  function scheduleIdleCheck() {
    window.clearTimeout(idleTimeoutId);
    GameJuice.setIdle(dom.primary, false);
    idleTimeoutId = window.setTimeout(() => {
      if (dom.input.value === '') GameJuice.setIdle(dom.primary, true);
    }, 1200);
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
        const meta = classifyRow(section, row);
        row.kana.forEach((entry) => kanaMeta.set(entry.kana, meta));
      });
    });

    buildRowSections();
    buildGameJuiceToggle();
    bindEvents();
    GameJuice.onChange((animating) => {
      if (!animating) clearActiveJuiceEffects();
    });
    advanceToNextKana();
    dom.input.focus();
    scheduleIdleCheck();
  }

  // Belt-and-suspenders for "immediately enable/disable": called the
  // moment Game Juice is turned off, or the OS switches on reduced
  // motion, so an effect that happened to be mid-flight at that exact
  // instant doesn't keep playing to completion.
  function clearActiveJuiceEffects() {
    dom.primary.classList.remove(
      'juice-pop', 'juice-pop--small', 'juice-exit', 'juice-enter', 'juice-combo',
      'script-hiragana', 'script-katakana', 'juice-idle'
    );
    if (dom.secondary) dom.secondary.classList.remove('juice-exit', 'juice-enter');
    if (dom.targetCell) dom.targetCell.classList.remove('juice-wrong', 'juice-sweep');
    if (dom.input) dom.input.classList.remove('juice-key-tick', 'juice-input-resolve');
    if (dom.juiceLayer) dom.juiceLayer.innerHTML = '';
  }

  // ---- Selection pool -----------------------------------------------

  function getAllRows() {
    return KANA_SECTIONS.flatMap((section) => section.rows);
  }

  function getActivePool() {
    return getAllRows()
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

  function pickNextKana(pool, previous) {
    let candidates = pool;
    if (pool.length > 1 && previous) {
      const withoutPrevious = pool.filter((k) => k.kana !== previous.kana);
      if (withoutPrevious.length > 0) candidates = withoutPrevious;
    }
    const total = candidates.reduce((sum, k) => sum + getWeight(k.kana), 0);
    let roll = Math.random() * total;
    for (const candidate of candidates) {
      roll -= getWeight(candidate.kana);
      if (roll <= 0) return candidate;
    }
    return candidates[candidates.length - 1];
  }

  // Chooses the next kana into state.current (or null if nothing is
  // enabled). Pure selection — no painting — so callers can decide
  // separately, and immediately, when/how to render it.
  function pickNext() {
    const pool = getActivePool();
    if (pool.length === 0) {
      state.current = null;
      return null;
    }
    const previous = state.current;
    state.current = pickNextKana(pool, previous);
    return pool;
  }

  function paintCurrent(pool) {
    if (!pool) {
      renderEmptyState();
      return;
    }
    dom.emptyMessage.hidden = true;
    dom.targetCell.hidden = false;
    dom.input.disabled = false;
    renderTarget();
  }

  function advanceToNextKana() {
    paintCurrent(pickNext());
  }

  function renderEmptyState() {
    dom.emptyMessage.hidden = false;
    dom.targetCell.hidden = true;
    dom.secondary.hidden = true;
    dom.input.value = '';
    dom.input.disabled = true;
  }

  function renderTarget() {
    if (!state.current) return;
    const mode = state.displayMode;

    if (mode === 'kana') {
      setPrimaryKana(state.current.kana);
      dom.secondary.hidden = true;
      dom.secondary.textContent = '';
    } else if (mode === 'kana-romaji') {
      setPrimaryKana(state.current.kana);
      dom.secondary.hidden = false;
      dom.secondary.textContent = state.current.romaji[0];
    } else {
      setPrimaryRomaji(state.current.romaji[0]);
      dom.secondary.hidden = true;
      dom.secondary.textContent = '';
    }
  }

  // Combination kana (2 characters: a base kana + small ya/yu/yo) render
  // as two spans so Game Juice can animate them "assembling" into the
  // full glyph. Every other kana renders as plain text, exactly as
  // before — this only branches for the combination case.
  function setPrimaryKana(kana) {
    dom.primary.lang = 'ja';
    if (kana.length === 2) {
      dom.primary.textContent = '';
      const main = document.createElement('span');
      main.className = 'kana-part kana-part--main';
      main.textContent = kana[0];
      const small = document.createElement('span');
      small.className = 'kana-part kana-part--small';
      small.textContent = kana[1];
      dom.primary.append(main, small);
    } else {
      dom.primary.textContent = kana;
    }
  }

  function setPrimaryRomaji(romaji) {
    dom.primary.lang = '';
    dom.primary.textContent = romaji;
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
    const meta = kanaMeta.get(finished.kana) || { script: 'hiragana', kind: 'basic' };
    const poolBefore = getActivePool();
    const sweep = trackSessionProgress(finished, poolBefore);

    decayWeightCorrect(finished);
    dom.input.value = '';
    GameJuice.playInputResolve(dom.input);
    scheduleIdleCheck();

    const pool = pickNext();

    GameJuice.playCorrectTransition({
      primaryEl: dom.primary,
      secondaryEl: dom.secondary,
      layer: dom.juiceLayer,
      script: meta.script,
      kind: meta.kind,
      sweep,
      onSwap: () => paintCurrent(pool),
    });
  }

  function handleIncorrect() {
    bumpWeightIncorrect(state.current);
    showWrongFeedback();
    GameJuice.playWrongFeedback(dom.targetCell);
    dom.input.value = '';
    scheduleIdleCheck();
  }

  // ---- Row selection (grouped into collapsible sections) -------------

  function onRowSelectionChanged() {
    resetSessionProgress();
    GameJuice.invalidatePendingTransition();
    const pool = getActivePool();
    if (pool.length === 0) {
      state.current = null;
      paintCurrent(null);
    } else if (!state.current || !pool.includes(state.current)) {
      state.current = pickNextKana(pool, state.current);
      paintCurrent(pool);
    }
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

      const checkboxesInSection = [];

      const selectAllBtn = document.createElement('button');
      selectAllBtn.type = 'button';
      selectAllBtn.className = 'text-button';
      selectAllBtn.textContent = 'Select all';
      selectAllBtn.addEventListener('click', () => {
        checkboxesInSection.forEach((checkbox) => {
          checkbox.checked = true;
          state.enabledRows[checkbox.dataset.rowId] = true;
        });
        onRowSelectionChanged();
        refocusInput();
      });

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'text-button';
      clearBtn.textContent = 'Clear';
      clearBtn.addEventListener('click', () => {
        checkboxesInSection.forEach((checkbox) => {
          checkbox.checked = false;
          state.enabledRows[checkbox.dataset.rowId] = false;
        });
        onRowSelectionChanged();
        refocusInput();
      });

      actions.append(selectAllBtn, clearBtn);
      details.appendChild(actions);

      const rowList = document.createElement('div');
      rowList.className = 'row-list';
      section.rows.forEach((row) => {
        const { label, checkbox } = buildRowCheckbox(row);
        checkboxesInSection.push(checkbox);
        rowList.appendChild(label);
      });
      details.appendChild(rowList);

      dom.rowSections.appendChild(details);
    });
  }

  // ---- Game Juice toggle ------------------------------------------

  function buildGameJuiceToggle() {
    const radios = document.querySelectorAll('input[name="game-juice"]');
    const current = GameJuice.isEnabled() ? 'on' : 'off';
    radios.forEach((radio) => {
      radio.checked = radio.value === current;
      radio.addEventListener('change', () => {
        if (radio.checked) {
          GameJuice.setEnabled(radio.value === 'on');
          refocusInput();
        }
      });
    });
  }

  // ---- Event wiring --------------------------------------------------

  function bindEvents() {
    dom.input.addEventListener('input', () => {
      GameJuice.playInputTick(dom.input);
      scheduleIdleCheck();
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
