// Manglish → Malayalam Unicode transliterator
// Handles: consonants, vowels (letter & matra forms), conjuncts, virama placement.
// Accuracy is intentionally "good starting point" — user is expected to review and edit.

// Consonants: checked longest-first to handle digraphs correctly.
const CONSONANTS = [
  ['nch', 'ഞ്ച'], ['ksh', 'ക്ഷ'], ['nth', 'ന്ത'], ['ndh', 'ന്ദ'],
  ['zh',  'ഴ'],  ['sh',  'ശ'],  ['kh',  'ഖ'],  ['gh',  'ഘ'],
  ['ng',  'ങ'],  ['ch',  'ച'],  ['jh',  'ഝ'],  ['nj',  'ഞ'],
  ['Th',  'ഠ'],  ['Dh',  'ഢ'],  ['th',  'ത'],  ['dh',  'ദ'],
  ['ph',  'ഫ'],  ['bh',  'ഭ'],
  ['k',   'ക'],  ['g',   'ഗ'],  ['c',   'ക'],  ['j',   'ജ'],
  ['T',   'ട'],  ['D',   'ഡ'],  ['N',   'ണ'],
  ['t',   'ത'],  ['d',   'ദ'],  ['n',   'ന'],
  ['p',   'പ'],  ['f',   'ഫ'],  ['b',   'ബ'],  ['m',   'മ'],
  ['y',   'യ'],  ['R',   'റ'],  ['r',   'ര'],
  ['L',   'ള'],  ['l',   'ല'],
  ['v',   'വ'],  ['w',   'വ'],
  ['s',   'സ'],  ['h',   'ഹ'],
]

// Vowels: [roman, full-letter form, matra/sign form]
// Long variants first so digraphs match before singles.
const VOWELS = [
  ['aa', 'ആ', 'ാ'],  ['ee', 'ഈ', 'ീ'],  ['ii', 'ഈ', 'ീ'],
  ['oo', 'ഊ', 'ൂ'],  ['uu', 'ഊ', 'ൂ'],  ['ai', 'ഐ', 'ൈ'],
  ['au', 'ഔ', 'ൌ'],  ['ow', 'ഔ', 'ൌ'],
  ['A',  'ആ', 'ാ'],  ['I',  'ഈ', 'ീ'],  ['U',  'ഊ', 'ൂ'],
  ['E',  'ഏ', 'േ'],  ['O',  'ഓ', 'ോ'],
  ['a',  'അ', ''],   // inherent 'a' — matra is empty string (no sign needed)
  ['i',  'ഇ', 'ി'],  ['u',  'ഉ', 'ു'],
  ['e',  'എ', 'െ'],  ['o',  'ഒ', 'ൊ'],
]

const VIRAMA = '്'
const PASSTHROUGH = /^[\s\d.,\-/()"':;%₹#@!?+*=<>[\]{}|\\^~`]/

function matchConsonant(str) {
  for (const [rom, ml] of CONSONANTS) {
    if (str.startsWith(rom)) return { rom, ml }
  }
  return null
}

function matchVowel(str) {
  for (const [rom, letter, sign] of VOWELS) {
    if (str.startsWith(rom)) return { rom, letter, sign }
  }
  return null
}

export function manglishToMl(input) {
  if (!input) return ''
  const out = []
  let i = 0
  let prevWasConsonant = false

  while (i < input.length) {
    const rem = input.slice(i)

    // Pass through spaces, numbers, punctuation unchanged
    if (PASSTHROUGH.test(rem[0])) {
      if (prevWasConsonant) out.push(VIRAMA)
      out.push(rem[0])
      prevWasConsonant = false
      i++
      continue
    }

    const con = matchConsonant(rem)
    if (con) {
      const afterCon = input.slice(i + con.rom.length)
      const vow = matchVowel(afterCon)

      if (vow) {
        // Consonant + vowel: close any pending virama then output consonant + matra
        if (prevWasConsonant) out.push(VIRAMA)
        out.push(con.ml)
        out.push(vow.sign)      // empty string for inherent 'a' — no matra
        prevWasConsonant = false
        i += con.rom.length + vow.rom.length
      } else {
        // Consonant not followed by vowel: emit consonant, defer virama to next iteration
        if (prevWasConsonant) out.push(VIRAMA)
        out.push(con.ml)
        prevWasConsonant = true
        i += con.rom.length
      }
      continue
    }

    const vow = matchVowel(rem)
    if (vow) {
      // Standalone vowel (start of word / after space): use full letter form
      if (prevWasConsonant) out.push(VIRAMA)
      out.push(vow.letter)
      prevWasConsonant = false
      i += vow.rom.length
      continue
    }

    // Unrecognised character — pass through
    if (prevWasConsonant) out.push(VIRAMA)
    out.push(rem[0])
    prevWasConsonant = false
    i++
  }

  if (prevWasConsonant) out.push(VIRAMA)
  return out.join('')
}
