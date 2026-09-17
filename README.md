# Hiragana Typing Trainer

An offline, single-purpose typing trainer for the 46 basic hiragana characters. No dakuten, no combination kana, no small kana, no katakana — see Scope below.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | All styling — light and dark themes via `prefers-color-scheme`, no external fonts |
| `kana-data.js` | The 46 kana, grouped into rows, each with its accepted romaji spellings |
| `app.js` | All application logic — selection, matching, weighting, rendering |
| `manifest.json`, `service-worker.js`, `icon-192.png`, `icon-512.png` | Optional PWA layer (installable, cached for offline launches) |

## Running it

There's no build step and no network calls, so you can:

- **Open it directly** — double-click `index.html`, or open it from a file manager on Android. The trainer works fully this way. Only the "install to home screen" / service-worker caching layer needs a real server, since browsers block service worker registration on `file://` — the app quietly skips it and works anyway.
- **Serve it locally** — e.g. `python3 -m http.server` from this folder, then visit `http://localhost:8000`, to get the full installable PWA experience.
- **Host it anywhere static** — GitHub Pages, Netlify, etc. Keep all files in the same folder; every reference between them is a relative path.

## Design notes

- **Accepted answers are explicit data, not derived.** Each kana in `kana-data.js` lists its own accepted spellings (e.g. し → `shi`, `si`). Matching only lowercases for comparison — it never guesses at romanization. Add dakuten, katakana, or word practice later by extending that one file; `app.js` has no kana-specific logic in it.
- **Weighting is intentionally simple.** A wrong answer adds +2 to that kana's selection weight (capped at 12); each correct answer for it decays the weight back down by 1. It's a weighted random pick, not spaced repetition.
- **Auto mode checks every keystroke.** Rather than waiting for a "submit," a keystroke that can no longer be the start of *any* accepted answer (e.g. typing `sx` when the answer is `shi`/`si`) is treated as a completed wrong attempt. Manual mode only checks when you press Enter (or the Android keyboard's "done" action).
- **Visual design** is built around *genkouyoushi* (原稿用紙), the squared paper used to practice writing kana by hand — one bordered cell frames the character being practiced, and everything else (tabs, the input's underline, the row list) stays flat and quiet so the target stays the visual focus.

## Known limitations (by design, for V1)

No stats, timers, levels, accounts, sound, or persistence — practice state resets each time the page loads. These were explicitly out of scope; the data/logic split above is meant to make adding them later straightforward without a rewrite.
