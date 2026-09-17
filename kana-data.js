/**
 * Kana data for the trainer.
 *
 * Structure: KANA_SECTIONS -> each section has rows -> each row has kana
 * entries. Sections group rows for the collapsible UI (e.g. "Hiragana
 * basics" vs "Hiragana combinations"); rows are the checkbox unit, same
 * as before. Each kana entry is { kana, romaji }: romaji[0] is the
 * spelling shown on screen, any further entries are accepted alternate
 * spellings (Hepburn + common Kunrei-shiki variants, or the "x"/"l"
 * prefix convention IMEs use for standalone small kana). Everything in
 * `romaji` is matched case-insensitively; the kana character itself is
 * always also accepted as input.
 *
 * app.js has no kana-specific logic in it — adding more sections/rows
 * here is the only thing needed to extend the trainer further.
 */

const KANA_SECTIONS = [
  {
    id: 'hiragana-basic',
    label: 'Hiragana basics',
    defaultEnabled: true,
    rows: [
      { id: 'a', kana: [
        { kana: 'あ', romaji: ['a'] },
        { kana: 'い', romaji: ['i'] },
        { kana: 'う', romaji: ['u'] },
        { kana: 'え', romaji: ['e'] },
        { kana: 'お', romaji: ['o'] },
      ]},
      { id: 'ka', kana: [
        { kana: 'か', romaji: ['ka'] },
        { kana: 'き', romaji: ['ki'] },
        { kana: 'く', romaji: ['ku'] },
        { kana: 'け', romaji: ['ke'] },
        { kana: 'こ', romaji: ['ko'] },
      ]},
      { id: 'sa', kana: [
        { kana: 'さ', romaji: ['sa'] },
        { kana: 'し', romaji: ['shi', 'si'] },
        { kana: 'す', romaji: ['su'] },
        { kana: 'せ', romaji: ['se'] },
        { kana: 'そ', romaji: ['so'] },
      ]},
      { id: 'ta', kana: [
        { kana: 'た', romaji: ['ta'] },
        { kana: 'ち', romaji: ['chi', 'ti'] },
        { kana: 'つ', romaji: ['tsu', 'tu'] },
        { kana: 'て', romaji: ['te'] },
        { kana: 'と', romaji: ['to'] },
      ]},
      { id: 'na', kana: [
        { kana: 'な', romaji: ['na'] },
        { kana: 'に', romaji: ['ni'] },
        { kana: 'ぬ', romaji: ['nu'] },
        { kana: 'ね', romaji: ['ne'] },
        { kana: 'の', romaji: ['no'] },
      ]},
      { id: 'ha', kana: [
        { kana: 'は', romaji: ['ha'] },
        { kana: 'ひ', romaji: ['hi'] },
        { kana: 'ふ', romaji: ['fu', 'hu'] },
        { kana: 'へ', romaji: ['he'] },
        { kana: 'ほ', romaji: ['ho'] },
      ]},
      { id: 'ma', kana: [
        { kana: 'ま', romaji: ['ma'] },
        { kana: 'み', romaji: ['mi'] },
        { kana: 'む', romaji: ['mu'] },
        { kana: 'め', romaji: ['me'] },
        { kana: 'も', romaji: ['mo'] },
      ]},
      { id: 'ya', kana: [
        { kana: 'や', romaji: ['ya'] },
        { kana: 'ゆ', romaji: ['yu'] },
        { kana: 'よ', romaji: ['yo'] },
      ]},
      { id: 'ra', kana: [
        { kana: 'ら', romaji: ['ra'] },
        { kana: 'り', romaji: ['ri'] },
        { kana: 'る', romaji: ['ru'] },
        { kana: 'れ', romaji: ['re'] },
        { kana: 'ろ', romaji: ['ro'] },
      ]},
      { id: 'wa', kana: [
        { kana: 'わ', romaji: ['wa'] },
        { kana: 'を', romaji: ['wo', 'o'] },
      ]},
      { id: 'n', kana: [{ kana: 'ん', romaji: ['n', 'nn'] }] },
    ],
  },

  {
    id: 'hiragana-dakuten',
    label: 'Hiragana dakuten & handakuten',
    defaultEnabled: false,
    rows: [
      { id: 'ga', kana: [
        { kana: 'が', romaji: ['ga'] },
        { kana: 'ぎ', romaji: ['gi'] },
        { kana: 'ぐ', romaji: ['gu'] },
        { kana: 'げ', romaji: ['ge'] },
        { kana: 'ご', romaji: ['go'] },
      ]},
      { id: 'za', kana: [
        { kana: 'ざ', romaji: ['za'] },
        { kana: 'じ', romaji: ['ji', 'zi'] },
        { kana: 'ず', romaji: ['zu'] },
        { kana: 'ぜ', romaji: ['ze'] },
        { kana: 'ぞ', romaji: ['zo'] },
      ]},
      { id: 'da', kana: [
        { kana: 'だ', romaji: ['da'] },
        { kana: 'ぢ', romaji: ['ji', 'di'] },
        { kana: 'づ', romaji: ['zu', 'du'] },
        { kana: 'で', romaji: ['de'] },
        { kana: 'ど', romaji: ['do'] },
      ]},
      { id: 'ba', kana: [
        { kana: 'ば', romaji: ['ba'] },
        { kana: 'び', romaji: ['bi'] },
        { kana: 'ぶ', romaji: ['bu'] },
        { kana: 'べ', romaji: ['be'] },
        { kana: 'ぼ', romaji: ['bo'] },
      ]},
      { id: 'pa', kana: [
        { kana: 'ぱ', romaji: ['pa'] },
        { kana: 'ぴ', romaji: ['pi'] },
        { kana: 'ぷ', romaji: ['pu'] },
        { kana: 'ぺ', romaji: ['pe'] },
        { kana: 'ぽ', romaji: ['po'] },
      ]},
    ],
  },

  {
    id: 'hiragana-small',
    label: 'Hiragana small kana',
    defaultEnabled: false,
    rows: [
      { id: 'small-tsu', kana: [{ kana: 'っ', romaji: ['xtsu', 'ltsu'] }] },
      { id: 'small-vowels', kana: [
        { kana: 'ぁ', romaji: ['xa', 'la'] },
        { kana: 'ぃ', romaji: ['xi', 'li'] },
        { kana: 'ぅ', romaji: ['xu', 'lu'] },
        { kana: 'ぇ', romaji: ['xe', 'le'] },
        { kana: 'ぉ', romaji: ['xo', 'lo'] },
      ]},
      { id: 'small-ya', kana: [
        { kana: 'ゃ', romaji: ['xya', 'lya'] },
        { kana: 'ゅ', romaji: ['xyu', 'lyu'] },
        { kana: 'ょ', romaji: ['xyo', 'lyo'] },
      ]},
    ],
  },

  {
    id: 'hiragana-combo',
    label: 'Hiragana combinations',
    defaultEnabled: false,
    rows: [
      { id: 'kya', kana: [
        { kana: 'きゃ', romaji: ['kya'] },
        { kana: 'きゅ', romaji: ['kyu'] },
        { kana: 'きょ', romaji: ['kyo'] },
      ]},
      { id: 'sha', kana: [
        { kana: 'しゃ', romaji: ['sha', 'sya'] },
        { kana: 'しゅ', romaji: ['shu', 'syu'] },
        { kana: 'しょ', romaji: ['sho', 'syo'] },
      ]},
      { id: 'cha', kana: [
        { kana: 'ちゃ', romaji: ['cha', 'tya'] },
        { kana: 'ちゅ', romaji: ['chu', 'tyu'] },
        { kana: 'ちょ', romaji: ['cho', 'tyo'] },
      ]},
      { id: 'nya', kana: [
        { kana: 'にゃ', romaji: ['nya'] },
        { kana: 'にゅ', romaji: ['nyu'] },
        { kana: 'にょ', romaji: ['nyo'] },
      ]},
      { id: 'hya', kana: [
        { kana: 'ひゃ', romaji: ['hya'] },
        { kana: 'ひゅ', romaji: ['hyu'] },
        { kana: 'ひょ', romaji: ['hyo'] },
      ]},
      { id: 'mya', kana: [
        { kana: 'みゃ', romaji: ['mya'] },
        { kana: 'みゅ', romaji: ['myu'] },
        { kana: 'みょ', romaji: ['myo'] },
      ]},
      { id: 'rya', kana: [
        { kana: 'りゃ', romaji: ['rya'] },
        { kana: 'りゅ', romaji: ['ryu'] },
        { kana: 'りょ', romaji: ['ryo'] },
      ]},
      { id: 'gya', kana: [
        { kana: 'ぎゃ', romaji: ['gya'] },
        { kana: 'ぎゅ', romaji: ['gyu'] },
        { kana: 'ぎょ', romaji: ['gyo'] },
      ]},
      { id: 'ja', kana: [
        { kana: 'じゃ', romaji: ['ja', 'zya'] },
        { kana: 'じゅ', romaji: ['ju', 'zyu'] },
        { kana: 'じょ', romaji: ['jo', 'zyo'] },
      ]},
      { id: 'bya', kana: [
        { kana: 'びゃ', romaji: ['bya'] },
        { kana: 'びゅ', romaji: ['byu'] },
        { kana: 'びょ', romaji: ['byo'] },
      ]},
      { id: 'pya', kana: [
        { kana: 'ぴゃ', romaji: ['pya'] },
        { kana: 'ぴゅ', romaji: ['pyu'] },
        { kana: 'ぴょ', romaji: ['pyo'] },
      ]},
    ],
  },

  {
    id: 'katakana-basic',
    label: 'Katakana basics',
    defaultEnabled: false,
    rows: [
      { id: 'k-a', kana: [
        { kana: 'ア', romaji: ['a'] },
        { kana: 'イ', romaji: ['i'] },
        { kana: 'ウ', romaji: ['u'] },
        { kana: 'エ', romaji: ['e'] },
        { kana: 'オ', romaji: ['o'] },
      ]},
      { id: 'k-ka', kana: [
        { kana: 'カ', romaji: ['ka'] },
        { kana: 'キ', romaji: ['ki'] },
        { kana: 'ク', romaji: ['ku'] },
        { kana: 'ケ', romaji: ['ke'] },
        { kana: 'コ', romaji: ['ko'] },
      ]},
      { id: 'k-sa', kana: [
        { kana: 'サ', romaji: ['sa'] },
        { kana: 'シ', romaji: ['shi', 'si'] },
        { kana: 'ス', romaji: ['su'] },
        { kana: 'セ', romaji: ['se'] },
        { kana: 'ソ', romaji: ['so'] },
      ]},
      { id: 'k-ta', kana: [
        { kana: 'タ', romaji: ['ta'] },
        { kana: 'チ', romaji: ['chi', 'ti'] },
        { kana: 'ツ', romaji: ['tsu', 'tu'] },
        { kana: 'テ', romaji: ['te'] },
        { kana: 'ト', romaji: ['to'] },
      ]},
      { id: 'k-na', kana: [
        { kana: 'ナ', romaji: ['na'] },
        { kana: 'ニ', romaji: ['ni'] },
        { kana: 'ヌ', romaji: ['nu'] },
        { kana: 'ネ', romaji: ['ne'] },
        { kana: 'ノ', romaji: ['no'] },
      ]},
      { id: 'k-ha', kana: [
        { kana: 'ハ', romaji: ['ha'] },
        { kana: 'ヒ', romaji: ['hi'] },
        { kana: 'フ', romaji: ['fu', 'hu'] },
        { kana: 'ヘ', romaji: ['he'] },
        { kana: 'ホ', romaji: ['ho'] },
      ]},
      { id: 'k-ma', kana: [
        { kana: 'マ', romaji: ['ma'] },
        { kana: 'ミ', romaji: ['mi'] },
        { kana: 'ム', romaji: ['mu'] },
        { kana: 'メ', romaji: ['me'] },
        { kana: 'モ', romaji: ['mo'] },
      ]},
      { id: 'k-ya', kana: [
        { kana: 'ヤ', romaji: ['ya'] },
        { kana: 'ユ', romaji: ['yu'] },
        { kana: 'ヨ', romaji: ['yo'] },
      ]},
      { id: 'k-ra', kana: [
        { kana: 'ラ', romaji: ['ra'] },
        { kana: 'リ', romaji: ['ri'] },
        { kana: 'ル', romaji: ['ru'] },
        { kana: 'レ', romaji: ['re'] },
        { kana: 'ロ', romaji: ['ro'] },
      ]},
      { id: 'k-wa', kana: [
        { kana: 'ワ', romaji: ['wa'] },
        { kana: 'ヲ', romaji: ['wo', 'o'] },
      ]},
      { id: 'k-n', kana: [{ kana: 'ン', romaji: ['n', 'nn'] }] },
    ],
  },

  {
    id: 'katakana-dakuten',
    label: 'Katakana dakuten & handakuten',
    defaultEnabled: false,
    rows: [
      { id: 'k-ga', kana: [
        { kana: 'ガ', romaji: ['ga'] },
        { kana: 'ギ', romaji: ['gi'] },
        { kana: 'グ', romaji: ['gu'] },
        { kana: 'ゲ', romaji: ['ge'] },
        { kana: 'ゴ', romaji: ['go'] },
      ]},
      { id: 'k-za', kana: [
        { kana: 'ザ', romaji: ['za'] },
        { kana: 'ジ', romaji: ['ji', 'zi'] },
        { kana: 'ズ', romaji: ['zu'] },
        { kana: 'ゼ', romaji: ['ze'] },
        { kana: 'ゾ', romaji: ['zo'] },
      ]},
      { id: 'k-da', kana: [
        { kana: 'ダ', romaji: ['da'] },
        { kana: 'ヂ', romaji: ['ji', 'di'] },
        { kana: 'ヅ', romaji: ['zu', 'du'] },
        { kana: 'デ', romaji: ['de'] },
        { kana: 'ド', romaji: ['do'] },
      ]},
      { id: 'k-ba', kana: [
        { kana: 'バ', romaji: ['ba'] },
        { kana: 'ビ', romaji: ['bi'] },
        { kana: 'ブ', romaji: ['bu'] },
        { kana: 'ベ', romaji: ['be'] },
        { kana: 'ボ', romaji: ['bo'] },
      ]},
      { id: 'k-pa', kana: [
        { kana: 'パ', romaji: ['pa'] },
        { kana: 'ピ', romaji: ['pi'] },
        { kana: 'プ', romaji: ['pu'] },
        { kana: 'ペ', romaji: ['pe'] },
        { kana: 'ポ', romaji: ['po'] },
      ]},
    ],
  },

  {
    id: 'katakana-combo',
    label: 'Katakana combinations',
    defaultEnabled: false,
    rows: [
      { id: 'k-kya', kana: [
        { kana: 'キャ', romaji: ['kya'] },
        { kana: 'キュ', romaji: ['kyu'] },
        { kana: 'キョ', romaji: ['kyo'] },
      ]},
      { id: 'k-sha', kana: [
        { kana: 'シャ', romaji: ['sha', 'sya'] },
        { kana: 'シュ', romaji: ['shu', 'syu'] },
        { kana: 'ショ', romaji: ['sho', 'syo'] },
      ]},
      { id: 'k-cha', kana: [
        { kana: 'チャ', romaji: ['cha', 'tya'] },
        { kana: 'チュ', romaji: ['chu', 'tyu'] },
        { kana: 'チョ', romaji: ['cho', 'tyo'] },
      ]},
      { id: 'k-nya', kana: [
        { kana: 'ニャ', romaji: ['nya'] },
        { kana: 'ニュ', romaji: ['nyu'] },
        { kana: 'ニョ', romaji: ['nyo'] },
      ]},
      { id: 'k-hya', kana: [
        { kana: 'ヒャ', romaji: ['hya'] },
        { kana: 'ヒュ', romaji: ['hyu'] },
        { kana: 'ヒョ', romaji: ['hyo'] },
      ]},
      { id: 'k-mya', kana: [
        { kana: 'ミャ', romaji: ['mya'] },
        { kana: 'ミュ', romaji: ['myu'] },
        { kana: 'ミョ', romaji: ['myo'] },
      ]},
      { id: 'k-rya', kana: [
        { kana: 'リャ', romaji: ['rya'] },
        { kana: 'リュ', romaji: ['ryu'] },
        { kana: 'リョ', romaji: ['ryo'] },
      ]},
      { id: 'k-gya', kana: [
        { kana: 'ギャ', romaji: ['gya'] },
        { kana: 'ギュ', romaji: ['gyu'] },
        { kana: 'ギョ', romaji: ['gyo'] },
      ]},
      { id: 'k-ja', kana: [
        { kana: 'ジャ', romaji: ['ja', 'zya'] },
        { kana: 'ジュ', romaji: ['ju', 'zyu'] },
        { kana: 'ジョ', romaji: ['jo', 'zyo'] },
      ]},
      { id: 'k-bya', kana: [
        { kana: 'ビャ', romaji: ['bya'] },
        { kana: 'ビュ', romaji: ['byu'] },
        { kana: 'ビョ', romaji: ['byo'] },
      ]},
      { id: 'k-pya', kana: [
        { kana: 'ピャ', romaji: ['pya'] },
        { kana: 'ピュ', romaji: ['pyu'] },
        { kana: 'ピョ', romaji: ['pyo'] },
      ]},
    ],
  },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KANA_SECTIONS };
}
