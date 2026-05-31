import { useState, useEffect, useRef } from 'react'

// Malayalam font applied via CSS class .ml-text (defined in index.css)

async function fetchSuggestions(word) {
  if (!word) return []
  try {
    const res = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=ml-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`
    )
    const data = await res.json()
    if (data?.[0] === 'SUCCESS') return data[1]?.[0]?.[1]?.slice(0, 5) ?? []
  } catch {}
  return []
}

// Non-empty words only (handles spaces + newlines)
function getWords(text) {
  return text ? text.split(/\s+/).filter(Boolean) : []
}

// Which word (0-indexed) the cursor sits in, using any whitespace as delimiter
function wordIdxAtCursor(text, cursorPos) {
  const before = text.slice(0, cursorPos)
  const wordsBefore = before.split(/\s+/).filter(Boolean)
  return /\s$/.test(before) || !before.trim()
    ? wordsBefore.length
    : Math.max(0, wordsBefore.length - 1)
}

// Rebuild ML text using EN text's whitespace structure.
// Every non-whitespace token in EN is replaced with the corresponding ML word.
// Whitespace (spaces, newlines) is preserved as-is.
// Falls back to the original EN token when the ML slot is empty (e.g. TC numbers).
function rebuildMlText(enText, mlWords) {
  let idx = 0
  return enText.replace(/\S+/g, (enToken) => mlWords[idx++] || enToken)
}

/**
 * Side-by-side English + Malayalam input — works for both name (single-line)
 * and address (textarea) fields.
 *
 * - Cursor-aware: suggestions update for whichever word the cursor is in,
 *   including middle-of-text edits.
 * - Auto-applies top suggestion after 300 ms of no typing.
 * - Click a chip to pick a different suggestion.
 * - Whitespace structure (spaces, newlines) from EN is preserved in ML.
 * - ML word count stays in sync: deleting EN words trims the ML tail.
 */
export function MlDualInput({
  label,
  name,
  value = '',
  mlValue = '',
  onChange,
  placeholder = '',
  mlPlaceholder = 'മലയാളം',
  required = false,
  optional = false,
  rows,
}) {
  const isTextarea = Boolean(rows)
  const [suggestions, setSuggestions] = useState([])
  const [activeWordIdx, setActiveWordIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  // Always-current refs so async callbacks never read stale values
  const mlRef  = useRef(mlValue)
  const enRef  = useRef(value)
  const activeWordIdxRef = useRef(0)

  mlRef.current          = mlValue
  enRef.current          = value
  activeWordIdxRef.current = activeWordIdx

  const enWords  = getWords(value)
  const activeWord = enWords[activeWordIdx] ?? ''

  // ── Cursor tracking ──────────────────────────────────────────
  const updateCursor = (e) => {
    const idx = wordIdxAtCursor(e.target.value, e.target.selectionStart)
    setActiveWordIdx(idx)
    activeWordIdxRef.current = idx
  }

  // ── Handlers ─────────────────────────────────────────────────
  const handleEnChange = (e) => {
    onChange({ target: { name, value: e.target.value } })
    updateCursor(e)
  }

  const handleMlChange = (e) => {
    onChange({ target: { name: `${name}_ml`, value: e.target.value } })
  }

  const handleSuggClick = (sugg) => {
    const pos     = activeWordIdxRef.current
    const mlWords = getWords(mlRef.current)
    while (mlWords.length <= pos) mlWords.push('')
    mlWords[pos] = sugg
    onChange({ target: { name: `${name}_ml`, value: rebuildMlText(enRef.current, mlWords) } })
  }

  // ── onBlur: flush transliteration for all words not yet in ML ──
  // When the user tabs/clicks away from the EN field, any words that haven't
  // been transliterated yet (ML slot is empty or still the EN word) get
  // fetched and filled in one pass.
  const handleEnBlur = async () => {
    const enWords = getWords(enRef.current)
    if (!enWords.length) return
    const mlWords = [...getWords(mlRef.current)]

    // Find positions where ML is missing or still the English word
    const missing = enWords
      .map((w, i) => (!mlWords[i] || mlWords[i] === w ? i : -1))
      .filter(i => i >= 0)

    if (!missing.length) return

    // Fetch all missing words in parallel
    const results = await Promise.all(missing.map(i => fetchSuggestions(enWords[i])))
    let changed = false
    missing.forEach((pos, idx) => {
      const sugg = results[idx].filter(s => s !== enWords[pos])
      if (sugg.length) {
        while (mlWords.length <= pos) mlWords.push('')
        mlWords[pos] = sugg[0]
        changed = true
      }
    })
    if (changed) {
      onChange({
        target: {
          name: `${name}_ml`,
          value: rebuildMlText(enRef.current, mlWords),
        },
      })
    }
  }
  // When EN words are deleted, trim the orphaned tail from ML.
  // rebuildMlText preserves EN's whitespace structure in the trimmed result.
  useEffect(() => {
    const enCount = getWords(value).length
    const mlWords = getWords(mlRef.current)

    if (!enCount) {
      if (mlRef.current.trim()) onChange({ target: { name: `${name}_ml`, value: '' } })
      return
    }
    if (mlWords.length > enCount) {
      onChange({
        target: {
          name: `${name}_ml`,
          value: rebuildMlText(value, mlWords.slice(0, enCount)),
        },
      })
    }
  }, [value])   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch suggestions + auto-apply top result (debounced) ────
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!activeWord) { setSuggestions([]); return }

    const capturedWord = activeWord
    const capturedPos  = activeWordIdxRef.current

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      const mlSugg = (await fetchSuggestions(capturedWord)).filter(s => s !== capturedWord)
      setSuggestions([...mlSugg, capturedWord])   // English word always at the end
      setLoading(false)

      if (!mlSugg.length) return   // no Malayalam suggestion → don't auto-apply

      // Guard: only write if the word at capturedPos hasn't changed
      if (getWords(enRef.current)[capturedPos] !== capturedWord) return

      const mlWords = getWords(mlRef.current)
      while (mlWords.length <= capturedPos) mlWords.push('')
      mlWords[capturedPos] = mlSugg[0]   // auto-apply top Malayalam suggestion only
      onChange({
        target: {
          name: `${name}_ml`,
          value: rebuildMlText(enRef.current, mlWords),
        },
      })
    }, 300)

    return () => clearTimeout(timerRef.current)
  }, [activeWord])   // eslint-disable-line react-hooks/exhaustive-deps

  const Tag = isTextarea ? 'textarea' : 'input'

  return (
    <div className="input-block span-2 ml-dual-block">
      <label>
        {label}
        {optional && <span className="optional-tag">(Optional)</span>}
      </label>

      <div className="ml-dual-fields">
        <div className="ml-field-wrap">
          <span className="ml-lang-badge">EN</span>
          <Tag
            type={isTextarea ? undefined : 'text'}
            name={name}
            value={value}
            onChange={handleEnChange}
            onBlur={handleEnBlur}
            onKeyUp={updateCursor}
            onClick={updateCursor}
            onSelect={updateCursor}
            placeholder={placeholder}
            required={required}
            rows={rows}
          />
        </div>
        <div className="ml-field-wrap">
          <span className="ml-lang-badge ml-lang-badge--ml">ML</span>
          <Tag
            name={`${name}_ml`}
            value={mlValue}
            onChange={handleMlChange}
            placeholder={mlPlaceholder}
            rows={rows}
            className="ml-text"
          />
        </div>
      </div>

      {activeWord && (loading || suggestions.length > 0) && (
        <div className="ml-suggestions">
          {loading
            ? <span className="ml-suggestions-label">Fetching…</span>
            : <>
                <span className="ml-suggestions-label">"{activeWord}" →</span>
                <div className="ml-suggestions-chips">
                  {suggestions.map((s, i) => {
                    const isEn = s === activeWord
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`ml-sugg-chip${i === 0 && !isEn ? ' ml-sugg-chip--top' : ''}${isEn ? ' ml-sugg-chip--en' : ''}${!isEn ? ' ml-text' : ''}`}
                        onClick={() => handleSuggClick(s)}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </>
          }
        </div>
      )}
    </div>
  )
}
