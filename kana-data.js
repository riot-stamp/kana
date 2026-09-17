/**
 * Hiragana data for the V1 trainer.
 *
 * Only the 46 basic hiragana are listed here — no dakuten, handakuten,
 * combination kana (きゃ etc.), small kana (っ etc.), or katakana.
 *
 * Rows mirror how they're grouped and toggled in the UI. Each kana entry
 * is { kana, romaji }: romaji[0] is the spelling shown on screen, and any
 * further entries are accepted alternate spellings (e.g. both Hepburn and
 * Kunrei-shiki). Everything in `romaji` is matched case-insensitively;
 * the kana character itself is always also accepted as input.
 *
 * This file only holds data — app.js contains no kana-specific logic, so
 * adding dakuten, katakana, or word practice later just means adding
 * more rows/entries here.
 */

const KANA_ROWS = [
  {
    id: 'a',
    kana: [
      { kana: 'あ', romaji: ['a'] },
      { kana: 'い', romaji: ['i'] },
      { kana: 'う', romaji: ['u'] },
      { kana: 'え', romaji: ['e'] },
      { kana: 'お', romaji: ['o'] },
    ],
  },
  {
    id: 'ka',
    kana: [
      { kana: 'か', romaji: ['ka'] },
      { kana: 'き', romaji: ['ki'] },
      { kana: 'く', romaji: ['ku'] },
      { kana: 'け', romaji: ['ke'] },
      { kana: 'こ', romaji: ['ko'] },
    ],
  },
  {
    id: 'sa',
    kana: [
      { kana: 'さ', romaji: ['sa'] },
      { kana: 'し', romaji: ['shi', 'si'] },
      { kana: 'す', romaji: ['su'] },
      { kana: 'せ', romaji: ['se'] },
      { kana: 'そ', romaji: ['so'] },
    ],
  },
  {
    id: 'ta',
    kana: [
      { kana: 'た', romaji: ['ta'] },
      { kana: 'ち', romaji: ['chi', 'ti'] },
      { kana: 'つ', romaji: ['tsu', 'tu'] },
      { kana: 'て', romaji: ['te'] },
      { kana: 'と', romaji: ['to'] },
    ],
  },
  {
    id: 'na',
    kana: [
      { kana: 'な', romaji: ['na'] },
      { kana: 'に', romaji: ['ni'] },
      { kana: 'ぬ', romaji: ['nu'] },
      { kana: 'ね', romaji: ['ne'] },
      { kana: 'の', romaji: ['no'] },
    ],
  },
  {
    id: 'ha',
    kana: [
      { kana: 'は', romaji: ['ha'] },
      { kana: 'ひ', romaji: ['hi'] },
      { kana: 'ふ', romaji: ['fu', 'hu'] },
      { kana: 'へ', romaji: ['he'] },
      { kana: 'ほ', romaji: ['ho'] },
    ],
  },
  {
    id: 'ma',
    kana: [
      { kana: 'ま', romaji: ['ma'] },
      { kana: 'み', romaji: ['mi'] },
      { kana: 'む', romaji: ['mu'] },
      { kana: 'め', romaji: ['me'] },
      { kana: 'も', romaji: ['mo'] },
    ],
  },
  {
    id: 'ya',
    kana: [
      { kana: 'や', romaji: ['ya'] },
      { kana: 'ゆ', romaji: ['yu'] },
      { kana: 'よ', romaji: ['yo'] },
    ],
  },
  {
    id: 'ra',
    kana: [
      { kana: 'ら', romaji: ['ra'] },
      { kana: 'り', romaji: ['ri'] },
      { kana: 'る', romaji: ['ru'] },
      { kana: 'れ', romaji: ['re'] },
      { kana: 'ろ', romaji: ['ro'] },
    ],
  },
  {
    id: 'wa',
    kana: [
      { kana: 'わ', romaji: ['wa'] },
      { kana: 'を', romaji: ['wo', 'o'] },
    ],
  },
  {
    id: 'n',
    kana: [{ kana: 'ん', romaji: ['n', 'nn'] }],
  },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KANA_ROWS };
}
