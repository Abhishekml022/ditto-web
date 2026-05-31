// ── Number to Words (Indian system) ───────────────────────────
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
  'Seventeen','Eighteen','Nineteen']
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']

export function numToWords(n) {
  if (!n || isNaN(n) || Number(n) <= 0) return 'N/A'
  n = Math.floor(Number(n))
  if (n === 0) return 'Zero'

  function belowHundred(num) {
    if (num < 20) return ones[num]
    return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
  }

  function belowThousand(num) {
    if (num < 100) return belowHundred(num)
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + belowHundred(num % 100) : '')
  }

  let result = ''
  if (n >= 10000000) { result += belowThousand(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000 }
  if (n >= 100000)   { result += belowThousand(Math.floor(n / 100000))   + ' Lakh ';  n %= 100000   }
  if (n >= 1000)     { result += belowThousand(Math.floor(n / 1000))     + ' Thousand '; n %= 1000  }
  if (n > 0) result += belowThousand(n)

  return 'Rupees ' + result.trim() + ' Only'
}

// ── Date helpers ──────────────────────────────────────────────
export function fmtDate(val) {
  if (!val) return ''
  const [y, m, d] = val.split('-')
  return `${d}-${m}-${y}`
}

export function ordinal(n) {
  const s = ['th','st','nd','rd'], v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function dateToWords(val) {
  if (!val) return ''
  const d = new Date(val + 'T00:00:00')
  return `${ordinal(d.getDate())} day of ${d.toLocaleDateString('en-IN', { month: 'long' })} ${d.getFullYear()}`
}

export function addMonths(dateStr, months) {
  if (!dateStr || !months) return ''
  const d = new Date(dateStr + 'T00:00:00')
  d.setMonth(d.getMonth() + Number(months))
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// ── Generate Order ID ─────────────────────────────────────────
export function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `DIT-${date}-${rand}`
}

// ── Malayalam number to words (bank-cheque standard) ─────────
//
// Grammar rules applied:
//  • Hundreds followed by more digits use "-റ്റി" connector:
//      നൂറ്  → നൂറ്റി,  ഇരുനൂറ് → ഇരുനൂറ്റി,  അഞ്ഞൂറ് → അഞ്ഞൂറ്റി  etc.
//  • Thousands followed by more digits use "-ത്തി" connector:
//      ആയിരം → ആയിരത്തി,  അയ്യായിരം → അയ്യായിരത്തി  etc.
//  • Lakhs / crores followed by more digits also use "-ത്തി".
//  • 8 × 1000 = എണ്ണായിരം  (NOT എട്ടായിരം — bank-cheque rule).
//  • 1 as a leading unit = ഒരു  (not ഒന്ന്).
//  • Always ends with "രൂപ മാത്രം".

const ML_ONES = [
  '', 'ഒന്ന്', 'രണ്ട്', 'മൂന്ന്', 'നാല്', 'അഞ്ച്',
  'ആറ്', 'ഏഴ്', 'എട്ട്', 'ഒൻപത്', 'പത്ത്',
  'പതിനൊന്ന്', 'പന്ത്രണ്ട്', 'പതിമൂന്ന്', 'പതിനാല്', 'പതിനഞ്ച്',
  'പതിനാറ്', 'പതിനേഴ്', 'പതിനെട്ട്', 'പത്തൊൻപത്',
]
const ML_TENS = ['', '', 'ഇരുപത്', 'മുപ്പത്', 'നാൽപ്പത്', 'അൻപത്', 'അറുപത്', 'എഴുപത്', 'എൺപത്', 'തൊണ്ണൂറ്']

// Standalone hundred words (used when no remainder follows).
const ML_HUNDREDS = [
  '', 'നൂറ്', 'ഇരുനൂറ്', 'മുന്നൂറ്', 'നാനൂറ്',
  'അഞ്ഞൂറ്', 'അറുനൂറ്', 'എഴുനൂറ്', 'എണ്ണൂറ്', 'തൊള്ളായിരം',
]

// Connector forms used when a hundred is followed by more digits.
// Target: നൂറ് → നൂറ്റി,  അഞ്ഞൂറ് → അഞ്ഞൂറ്റി
//
// Unicode: source ends in റ (U+0D31) + ് (U+0D4D).
// Target appends only റ (U+0D31) + ി (U+0D3F) — the existing ് bridges them
// into the conjunct റ്റ, giving the correct rendering റ്റി.
// Exception: തൊള്ളായിരം (900) ends in ം — use addConnector (→ ത്തി) instead.
function hundredConnector(word) {
  const last = word.charCodeAt(word.length - 1)
  if (last === 0x0D02) {        // anusvara ം  — e.g. തൊള്ളായിരം (900)
    return word.slice(0, -1) + 'ത്തി'
  }
  return word + '\u0D31\u0D3F'  // append  റ + ി  (the ് is already in word)
}

// For 21–99: ones fuse with the tens stem via sandhi.
// Each entry: [vowel_sign | null, tail]
//   null  → consonant-initial ones word → insert 'ി' between stem and ones
//   ''    → inherent-a initial → no vowel sign, just append tail
//   other → Malayalam vowel sign to append to stem before tail
const ML_ONES_SANDHI = [
  null,
  ['ൊ', 'ന്ന്'],    // 1: ഒ → ൊ
  [null, 'രണ്ട്'],  // 2: ര (consonant-initial) → ി + രണ്ട്
  [null, 'മൂന്ന്'], // 3: മ (consonant-initial) → ി + മൂന്ന്
  [null, 'നാല്'],   // 4: ന (consonant-initial) → ി + നാല്
  ['', 'ഞ്ച്'],     // 5: അ (inherent) → ഞ്ച്
  ['ാ', 'റ്'],      // 6: ആ → ാ
  ['േ', 'ഴ്'],      // 7: ഏ → േ
  ['െ', 'ട്ട്'],    // 8: എ → െ
  ['ൊ', 'ൻപത്'],   // 9: ഒ → ൊ
]

// Returns the Malayalam word for 0–99.
function belowHundredMl(n) {
  if (n === 0) return ''
  if (n < 20) return ML_ONES[n]
  const t = Math.floor(n / 10), o = n % 10
  if (o === 0) return ML_TENS[t]
  const stem = ML_TENS[t]
  const sandhi = ML_ONES_SANDHI[o]
  if (sandhi[0] === null) return stem + 'ത' + 'ി' + ML_ONES[o]
  return stem + 'ത' + sandhi[0] + sandhi[1]
}

// Returns the Malayalam word for 0–999 (standalone, no connector).
function belowThousandMl(n) {
  if (n < 100) return belowHundredMl(n)
  const h = Math.floor(n / 100), rest = n % 100
  if (rest === 0) return ML_HUNDREDS[h]
  return hundredConnector(ML_HUNDREDS[h]) + ' ' + belowHundredMl(rest)
}

// ── Thousand-word table ───────────────────────────────────────
// Irregular / idiomatic forms that cannot be derived mechanically.
const ML_THOUSAND_SPECIAL = {
  1:  'ആയിരം',           // 1,000
  3:  'മൂവായിരം',        // 3,000  (moonnu → moova)
  5:  'അയ്യായിരം',       // 5,000  (anchu  → ayya)
  8:  'എണ്ണായിരം',       // 8,000  (bank-cheque rule: NOT എട്ടായിരം)
  10: 'പതിനായിരം',       // 10,000 (pathu  → pathin)
  15: 'പതിനയ്യായിരം',    // 15,000 (pathinanju → pathinayya)
  18: 'പതിനെണ്ണായിരം',   // 18,000 (bank-cheque rule: mirrors 8 → എണ്ണ)
}

// General rule for other multiples of 1,000:
//   strip trailing ് from the ones/tens word → append ായിരം
// e.g. 25 → ഇരുപത്തിയയ്യായിരം  (tens-connector ത്തി + യ + അയ്യ)
// e.g. 35 → മുപ്പത്തിയയ്യായിരം
// For x5 (25,35,45,55,65,75,85,95): tens stem + ത്തി + യ + അയ്യായിരം
function thousandWord(n) {
  if (ML_THOUSAND_SPECIAL[n]) return ML_THOUSAND_SPECIAL[n]
  // Special rule: ones digit is 5 and n is a two-digit tens+5 compound (20–95)
  if (n > 19 && n % 10 === 5) {
    const stem = ML_TENS[Math.floor(n / 10)]  // e.g. ഇരുപത്, മുപ്പത്, തൊണ്ണൂറ്
    // Most tens end in ത് → connector is തി (giving ത്തി).
    // Exception: തൊണ്ണൂറ് (90) ends in റ് → append റ + ി (renders as റ്റി).
    const connector = stem.endsWith('\u0D31\u0D4D') ? '\u0D31\u0D3F' : 'തി'
    return stem + connector + 'യയ്യായിരം'
  }
  const word = belowHundredMl(n)
  const base = word.endsWith('്') ? word.slice(0, -1) : word
  return base + 'ായിരം'
}

// ── Connector: appended when a unit is followed by more digits ─
// Rule: strip trailing ് (virama) → append ത്തി
// Works for: ആയിരം (ം → ത്തി), ലക്ഷം (ം → ത്തി),
//            അയ്യായിരം (ം → ത്തി), etc.
function addConnector(word) {
  if (!word.length) return word
  const last = word.charCodeAt(word.length - 1)

  if (last === 0x0D02) {           // anusvara ം  (thousands / lakhs / crores)
    return word.slice(0, -1) + 'ത്തി'
  }
  if (last === 0x0D4D) {           // virama ്  (e.g. some tens/ones endings)
    return word.slice(0, -1) + 'ത്തി'
  }
  return word + 'ത്തി'
}

// "ഒന്ന്" sounds wrong as a leading unit prefix — use "ഒരു".
const ML_ONE_PREFIX   = 'ഒരു'
const ML_LAKH_PREFIX  = { 1: ML_ONE_PREFIX }
const ML_CRORE_PREFIX = { 1: ML_ONE_PREFIX }

export function numToWordsMl(n) {
  if (!n || isNaN(n) || Number(n) <= 0) return ''
  n = Math.floor(Number(n))
  const parts = []

  // ── Crores ────────────────────────────────────────────────
  if (n >= 10000000) {
    const c = Math.floor(n / 10000000)
    const w = (ML_CRORE_PREFIX[c] ?? belowThousandMl(c)) + ' കോടി'
    n %= 10000000
    parts.push(n > 0 ? addConnector(w) : w)
  }

  // ── Lakhs ─────────────────────────────────────────────────
  if (n >= 100000) {
    const c = Math.floor(n / 100000)
    const w = (ML_LAKH_PREFIX[c] ?? belowThousandMl(c)) + ' ലക്ഷം'
    n %= 100000
    parts.push(n > 0 ? addConnector(w) : w)
  }

  // ── Thousands ─────────────────────────────────────────────
  if (n >= 1000) {
    const w = thousandWord(Math.floor(n / 1000))
    n %= 1000
    parts.push(n > 0 ? addConnector(w) : w)
  }

  // ── Hundreds ──────────────────────────────────────────────
  if (n >= 100) {
    const h = Math.floor(n / 100)
    n %= 100
    // Say "ഒരു നൂറ്" only when a higher unit (thousands/lakhs/crores) already
    // precedes it — e.g. "ഇരുപതായിരത്തി ഒരു നൂറ്".
    // When 100 is the leading unit, use bare "നൂറ്" — e.g. "നൂറ് രൂപ മാത്രം".
    const hundredWord = (h === 1 && parts.length > 0) ? 'ഒരുനൂറ്' : ML_HUNDREDS[h]
    // Use connector form (-റ്റി) when digits follow, standalone form otherwise.
    parts.push(n > 0 ? hundredConnector(hundredWord) : hundredWord)
  }

  // ── Below 100 ─────────────────────────────────────────────
  // Use belowHundredMl which produces the correct sandhi compound (e.g. ഇരുപത്തഞ്ച്).
  if (n > 0) parts.push(belowHundredMl(n))

  return parts.join(' ') + ' രൂപ മാത്രം'
}

// ── Malayalam date formatting ─────────────────────────────────
const ML_MONTHS = [
  '', 'ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ', 'മേയ്',
  'ജൂൺ', 'ജൂലൈ', 'ഓഗസ്റ്റ്', 'സെപ്തംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ',
]

// Malayalam ordinal day words (1–31)
const ML_DAY_ORDINALS = [
  '', 'ഒന്നാം', 'രണ്ടാം', 'മൂന്നാം', 'നാലാം', 'അഞ്ചാം',
  'ആറാം', 'ഏഴാം', 'എട്ടാം', 'ഒൻപതാം', 'പത്താം',
  'പതിനൊന്നാം', 'പന്ത്രണ്ടാം', 'പതിമൂന്നാം', 'പതിനാലാം', 'പതിനഞ്ചാം',
  'പതിനാറാം', 'പതിനേഴാം', 'പതിനെട്ടാം', 'പത്തൊൻപതാം', 'ഇരുപതാം',
  'ഇരുപത്തൊന്നാം', 'ഇരുപത്തിരണ്ടാം', 'ഇരുപത്തിമൂന്നാം', 'ഇരുപത്തിനാലാം', 'ഇരുപത്തിഅഞ്ചാം',
  'ഇരുപത്തിആറാം', 'ഇരുപത്തിഏഴാം', 'ഇരുപത്തിഎട്ടാം', 'ഇരുപത്തിഒൻപതാം', 'മുപ്പതാം',
  'മുപ്പത്തൊന്നാം',
]

// Converts a year number to the Malayalam ordinal stem used in agreements.
// The year remainder (tens + ones) must NOT use the sandhi-fused form from
// belowHundredMl — instead tens and ones stay separate joined by "ി".
// e.g. 2026 → "രണ്ടായിരത്തി ഇരുപത്തിആറ്"  (NOT "ഇരുപത്താറ്")
// e.g. 2025 → "രണ്ടായിരത്തി ഇരുപത്തിഅഞ്ച്"
// e.g. 2030 → "രണ്ടായിരത്തി മുപ്പത്"
function yearRemainderMl(n) {
  // n is 0–999 (the part after the thousands)
  if (n === 0) return ''
  if (n < 20) return ML_ONES[n]
  const t = Math.floor(n / 10), o = n % 10
  if (o === 0) return ML_TENS[t]
  // Tens end in ത് — append തി + ones to form the ത്തി connector correctly.
  // e.g. ഇരുപത് + തി + ആറ് = ഇരുപത്തിആറ്  (NOT ഇരുപത്ി which renders broken)
  return ML_TENS[t] + 'തി' + ML_ONES[o]
}

function yearToWordsMl(year) {
  let n = Math.floor(year)
  const parts = []

  if (n >= 1000) {
    const w = thousandWord(Math.floor(n / 1000))
    n %= 1000
    parts.push(n > 0 ? addConnector(w) : w)
  }
  if (n > 0) parts.push(yearRemainderMl(n))

  return parts.join(' ')
}

// Returns the full Malayalam date string used in agreements:
// e.g. 2026-01-01 → "രണ്ടായിരത്തി ഇരുപത്തിആറാം വർഷം ജനുവരി മാസം ഒന്നാം തീയതി"
export function dateToWordsMl(val) {
  if (!val) return ''
  const d = new Date(val + 'T00:00:00')
  const day   = d.getDate()
  const month = ML_MONTHS[d.getMonth() + 1]
  const year  = d.getFullYear()
  const yearStem = yearToWordsMl(year)
  // To form the ordinal: strip trailing ് then append ാം (vowel sign + anusvara).
  // e.g. ഇരുപത്തിആറ് → ഇരുപത്തിആറ + ാം = ഇരുപത്തിആറാം  ✓
  // Using ആം (independent vowel) would give ഇരുപത്തിആറആം  ✗
  const yearOrdinal = (yearStem.endsWith('്') ? yearStem.slice(0, -1) : yearStem) + 'ാം'
  const dayWord = ML_DAY_ORDINALS[day] || `${day}ആം`
  return `${yearOrdinal} വർഷം ${month} മാസം ${dayWord} തീയതി`
}

// Returns a SHORT Malayalam date string for templates that already have
// "രണ്ടായിരത്തി" (the thousands part) pre-printed in the document.
// Only the year remainder (tens+ones ordinal) + month + day is returned.
// e.g. 2026-06-01 → "ഇരുപത്തിആറാം വർഷം ജൂൺ മാസം ഒന്നാം തീയതി"
// e.g. 2030-01-15 → "മുപ്പതാം വർഷം ജനുവരി മാസം പതിനഞ്ചാം തീയതി"
export function dateToWordsMlShortYear(val) {
  if (!val) return ''
  const d = new Date(val + 'T00:00:00')
  const day   = d.getDate()
  const month = ML_MONTHS[d.getMonth() + 1]
  const year  = d.getFullYear()
  // Only the sub-thousand remainder (e.g. 26 from 2026)
  const remainder = year % 1000
  const stem = remainder > 0 ? yearRemainderMl(remainder) : ''
  const yearOrdinal = stem
    ? (stem.endsWith('്') ? stem.slice(0, -1) : stem) + 'ാം'
    : ''
  const dayWord = ML_DAY_ORDINALS[day] || `${day}ആം`
  return yearOrdinal
    ? `${yearOrdinal} വർഷം ${month} മാസം ${dayWord} തീയതി`
    : `${month} മാസം ${dayWord} തീയതി`
}

// ── Format currency ───────────────────────────────────────────
export function formatCurrency(val) {
  return val ? '₹' + Number(val).toLocaleString('en-IN') : '—'
}

// ── Format date string ────────────────────────────────────────
export function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ── Generate docx blob from data ──────────────────────────────
export async function generateDocxBlob(formData, templateUrl, Docxtemplater, PizZip) {
  const response = await fetch(templateUrl)
  const arrayBuffer = await response.arrayBuffer()
  const zip = new PizZip(arrayBuffer)

  const duration = formData.duration
  const rentPeriod = duration ? `${duration} ${Number(duration) === 1 ? 'Month' : 'Months'}` : ''

  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

  doc.render({
    agreement_date: formData.agreement_date
      ? new Date(formData.agreement_date).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
      : '',
    owner_name: formData.owner_name,
    owner_address: formData.owner_address,
    owner_aadhaar_number: formData.owner_aadhaar ? `(Aadhaar No: ${formData.owner_aadhaar})` : '',
    tenant_name: formData.tenant_name,
    tenant_address: formData.tenant_address,
    tenant_aadhaar_number: formData.tenant_aadhaar ? `(Aadhaar No: ${formData.tenant_aadhaar})` : '',
    rented_house_address: formData.rented_house_address,
    building_type: formData.building_type,
    rent_purpose: formData.rent_purpose,
    rent_period: rentPeriod,
    rent: Number(formData.rent).toLocaleString('en-IN'),
    rent_words: numToWords(formData.rent),
    day_of_rent: formData.day_of_rent,
    advance_amt: Number(formData.advance_amt).toLocaleString('en-IN'),
    advance_word: numToWords(formData.advance_amt),
    amenities: formData.amenities,
    duration: String(formData.duration),
    notice_period: String(formData.notice_period),
    building_tc_no: formData.building_tc_no || '',
  })

  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}
