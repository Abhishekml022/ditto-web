import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import mammoth from 'mammoth'
import Header from '../components/Header'
import Footer from '../components/Footer'
import mainTemplateUrl from '../assets/templates/English_main.docx?url'
import defaultTemplateUrl from '../assets/templates/EnglishDefault.docx?url'
import flatTemplateUrl from '../assets/templates/English_Flat_asset.docx?url'
import malayalamTemplateUrl from '../assets/templates/Malayalam_Rent_DTT-MAL-01.docx?url'
import '../App.css'

// ── Dummy data per template ────────────────────────────────────
const DUMMY_DEFAULT = {
  agreement_date: '01-06-2026',
  agreement_edate: '30-04-2027',
  s_date_words: '1st day of June 2026',
  e_date_words: '30th day of April 2027',
  owner_name: 'Rajesh Kumar Sharma',
  owner_address: '12, MG Road, Koramangala, Bengaluru, Karnataka – 560034',
  owner_aadhaar_number: '(Aadhaar No: 4521 8763 0912)',
  tenant_name: 'Priya Venkataraman',
  tenant_address: '45, 2nd Cross, Indiranagar, Bengaluru, Karnataka – 560038',
  tenant_aadhaar_number: '(Aadhaar No: 7834 2190 5647)',
  rented_house_address: 'Flat No. 3B, Sunrise Apartments, 78 HSR Layout, Sector 2, Bengaluru, Karnataka – 560102',
  building_type: 'Flat',
  building_tc_no: 'TC 14/2891-3',
  rent_purpose: 'Residential Purpose',
  rent_period: '11 Months',
  rent: '18,000',
  rent_words: 'Rupees Eighteen Thousand Only',
  day_of_rent: '5th',
  advance_amt: '54,000',
  advance_word: 'Rupees Fifty Four Thousand Only',
  amenities: 'Electricity, Water',
  duration: '11 Months',
  notice_period: '30',
}

const DUMMY_FLAT = {
  agreement_date: '01-06-2026',
  agreement_edate: '30-04-2027',
  s_date_words: '1st day of June 2026',
  e_date_words: '30th day of April 2027',
  owner_name: 'Rajesh Kumar Sharma',
  owner_co: 'S/o Late Mohan Kumar Sharma',
  owner_address: '12, MG Road, Koramangala, Bengaluru, Karnataka – 560034',
  tenant_name: 'Priya Venkataraman',
  tenant_co: 'D/o Suresh Venkataraman',
  tenant_address: '45, 2nd Cross, Indiranagar, Bengaluru, Karnataka – 560038',
  flat_no: '3B',
  floor_no: '3rd',
  tower_no: 'Tower A',
  flat_name: 'Sunrise Apartments',
  flat_address: '78 HSR Layout, Sector 2, Bengaluru, Karnataka – 560102',
  bhk: '2BHK',
  area: '1,050 sq.ft.',
  rent_purpose: 'Residential Purpose',
  rent_period: '11 Months',
  rent: '18,000',
  rent_words: 'Rupees Eighteen Thousand Only',
  advance_amt: '54,000',
  advance_word: 'Rupees Fifty Four Thousand Only',
  amenities: 'Electricity, Water, Maintenance',
  account_name: 'Rajesh Kumar Sharma',
  account_no: 'XXXX XXXX 4821',
  bank_name: 'HDFC Bank',
  branch_name: 'Koramangala Branch',
  bank_ifsc: 'HDFC0001234',
  r_p_increase: '5%',
  i_period: '11 Months',
  occupants: 'Priya Venkataraman and family',
  notice_period: '30',
}

// ── Template definitions ───────────────────────────────────────
const DUMMY_MALAYALAM = {
  // Dates
  agreement_date: '01-06-2026',
  s_date_words: 'ഇരുപത്തിആറാം വർഷം ജൂൺ മാസം ഒന്നാം തീയതി',
  // Rent period
  rent_period: '11',
  rent_period_words: 'പതിനൊന്ന്',
  notice_period: 'മൂന്ന് മാസം മുൻപ്',
  // Property
  r_village: 'തൃശ്ശൂർ',
  building_tc_no: 'TC 14/2891-3',
  house_name: 'ശ്രീലക്ഷ്മി ഭവൻ',
  no_of_floors: '2',
  rented_floor: 'ഒന്നാം നില',
  // Owner
  owner_name: 'രാജേഷ് കുമാർ ശർമ്മ',
  owner_address: '12, എം.ജി. റോഡ്, കൊറമംഗല, ബെംഗളൂരു – 560034',
  // Tenant
  tenant_name: 'പ്രിയ വെങ്കിടരാമൻ',
  tenant_address: '45, 2-ആം ക്രോസ്, ഇന്ദിരാനഗർ, ബെംഗളൂരു – 560038',
  // Financials
  rent: '18,000',
  rent_words: 'പതിനെട്ടായിരം രൂപ മാത്രം',
  advance_amt: '54,000',
  advance_word: 'അൻപത്തിനാലായിരം രൂപ മാത്രം',
  // Misc
  rent_purpose: 'കുടുംബ താമസത്തിന്',
  amenities: 'കറണ്ട് ചാർജ്ജ്, വാട്ടർ ചാർജ്ജ്',
}

const FORMATS = [
  {
    formatId: 'DTT-001',
    id: 'english-standard',
    templateUrl: mainTemplateUrl,
    dummyData: DUMMY_DEFAULT,
    name: 'Standard Rental Agreement',
    language: 'English',
    badge: 'Most Popular',
    badgeColor: '#4f46e5',
    description:
      'A comprehensive English rental agreement covering all standard clauses — rent, security deposit, notice period, amenities, and termination terms.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    formatId: 'DTT-MAL-01',
    id: 'malayalam-standard',
    templateUrl: malayalamTemplateUrl,
    dummyData: DUMMY_MALAYALAM,
    name: 'Standard Rental Agreement (Malayalam)',
    language: 'Malayalam',
    badge: 'New',
    badgeColor: '#dc2626',
    description:
      'Type in English, see Malayalam (Unicode) side-by-side with live transliteration. Edit the Malayalam directly before generating the document.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="34" fontFamily="serif" fill="currentColor">മ</text>
      </svg>
    ),
  },
  {
    formatId: 'DTT-002',
    id: 'english-flat',
    templateUrl: flatTemplateUrl,
    dummyData: DUMMY_FLAT,
    name: 'Flat Rental Agreement',
    language: 'English',
    badge: 'New',
    badgeColor: '#10b981',
    description:
      'Designed specifically for apartment and flat rentals — includes flat details, bank account for rent transfer, rent escalation clause, and occupant count.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    formatId: 'DTT-003',
    id: 'english-standard-classic',
    templateUrl: defaultTemplateUrl,
    dummyData: DUMMY_DEFAULT,
    name: 'Standard Agreement (Classic)',
    language: 'English',
    badge: null,
    badgeColor: '#64748b',
    description:
      'The original standard English rental agreement template — covers rent, security deposit, notice period, amenities, and termination terms.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
]

// ── Hook: load & render a specific docx → HTML ────────────────
function useDocxPreview(format) {
  const [html, setHtml] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(format.templateUrl)
        const arrayBuffer = await res.arrayBuffer()

        const zip = new PizZip(arrayBuffer)
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
        doc.render(format.dummyData)

        const filledBuffer = doc.getZip().generate({ type: 'arraybuffer' })
        const result = await mammoth.convertToHtml({ arrayBuffer: filledBuffer })

        // Strip per-page signature lines — the flat template puts both names
        // in the same <p> with no separator: "Rajesh Kumar SharmaPriva Venkataraman"
        // The default template puts them with a space: "Rajesh Kumar Sharma Priya Venkataraman"
        // Both cases: the paragraph text is ONLY the two names, nothing else.
        // The final LESSOR/LESSEE block has each name in its OWN paragraph — those are kept.
        const ownerName = format.dummyData.owner_name.trim()
        const tenantName = format.dummyData.tenant_name.trim()
        const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
        let cleaned = result.value.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (match) => {
          const text = stripTags(match)
          // Remove if paragraph is exactly both names together (with or without space)
          if (
            text === `${ownerName} ${tenantName}` ||
            text === `${tenantName} ${ownerName}` ||
            text === `${ownerName}${tenantName}` ||
            text === `${tenantName}${ownerName}`
          ) return ''
          return match
        })

        // DTT-001: strip role label paragraphs like "(LANDLORD) (TENANT)" from HTML preview only
        if (format.id === 'english-standard') {
          cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (match) => {
            const text = stripTags(match)
            if (/^(\(\s*(landlord|tenant|lessor|lessee)\s*\)\s*)+$/i.test(text)) return ''
            return match
          })
        }

        // Center the "RENTAL AGREEMENT" heading (English templates)
        cleaned = cleaned.replace(
          /<p([^>]*)>((?:<[^>]+>)*\s*RENTAL AGREEMENT\s*(?:<\/[^>]+>)*)<\/p>/i,
          '<p$1 style="text-align:center">$2</p>'
        )

        // Center the Malayalam heading (വാടക കരാർ / any all-caps Malayalam heading paragraph)
        if (format.id === 'malayalam-standard') {
          cleaned = cleaned.replace(
            /<p([^>]*)>((?:<(?:strong|b)[^>]*>)[^<]*(?:<\/(?:strong|b)>))<\/p>/gi,
            (match, attrs, inner) => {
              const text = stripTags(inner).trim()
              // Target short bold-only paragraphs that are the document title
              if (text.length > 0 && text.length < 60 && !text.includes('\n')) {
                return `<p${attrs} style="text-align:center">${inner}</p>`
              }
              return match
            }
          )
        }

        if (!cancelled) setHtml(cleaned)
      } catch (err) {
        console.error('Preview generation failed:', err)
        if (!cancelled) setError('Could not load preview. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [format.id])

  return { html, loading, error }
}

// ── Preview Modal ──────────────────────────────────────────────
function PreviewModal({ format, onClose, onSelect }) {
  const { html, loading, error } = useDocxPreview(format)

  return (
    <div className="format-modal-overlay" onClick={onClose}>
      <div className="format-modal" onClick={(e) => e.stopPropagation()}>
        <div className="format-modal-header">
          <div>
            <div className="format-modal-title">{format.name}</div>
            <div className="format-modal-subtitle">Read-only preview with sample data</div>
          </div>
          <button className="format-modal-close" onClick={onClose} aria-label="Close preview">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="format-modal-doc-wrap">
          {loading && (
            <div className="format-preview-state">
              <div className="loader-spinner" />
              <p>Loading document preview…</p>
            </div>
          )}
          {error && (
            <div className="format-preview-state format-preview-state--error">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p>{error}</p>
            </div>
          )}
          {html && !loading && (
            <div className="format-modal-doc-wrap-inner">
              <div
                className="format-modal-doc docx-rendered"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <div className="doc-preview-dummy-notice">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                This preview uses sample data. Your actual agreement will contain the details you provide.
              </div>
            </div>
          )}
        </div>

        <div className="format-modal-footer">
          <button className="btn-action btn-back" onClick={onClose}>
            Back to Formats
          </button>
          <button className="btn-action btn-next" onClick={() => onSelect(format)}>
            Use This Format
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function AgreementFormats() {
  const navigate = useNavigate()
  const [previewFormat, setPreviewFormat] = useState(null)

  const handleSelect = (format) => {
    navigate('/new', { state: { formatId: format.id } })
  }

  return (
    <>
      <Header />

      <div className="formats-page">
        <div className="formats-page-header">
          <button className="order-detail-back" onClick={() => navigate('/')}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          <div className="formats-page-hero">
            <h2>Choose an Agreement Format</h2>
            <p>Select a format that suits your requirement. Preview the document before proceeding.</p>
          </div>
        </div>

        <div className="formats-grid">
          {FORMATS.map((format) => (
            <div key={format.id} className="format-card">
              {/* Format ID chip */}
              <div className="format-card-id">{format.formatId}</div>

              {format.badge && (
                <div
                  className="format-card-badge"
                  style={{
                    background: format.badgeColor + '18',
                    color: format.badgeColor,
                    border: `1px solid ${format.badgeColor}30`,
                  }}
                >
                  {format.badge}
                </div>
              )}

              <div
                className="format-card-icon"
                style={{ background: format.badgeColor + '15', color: format.badgeColor }}
              >
                {format.icon}
              </div>

              <div className="format-card-body">
                <div className="format-card-name">{format.name}</div>
                <div className="format-card-lang">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                  {format.language}
                </div>
                <div className="format-card-desc">{format.description}</div>
              </div>

              <div className="format-card-actions">
                <button className="btn-format-preview" onClick={() => setPreviewFormat(format)}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Preview Format
                </button>
                <button className="btn-format-select" onClick={() => handleSelect(format)}>
                  Use This Format
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Coming Soon */}
          <div className="format-card format-card--coming-soon">
            <div className="format-card-icon" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="format-card-body">
              <div className="format-card-name" style={{ color: '#94a3b8' }}>More Formats Coming Soon</div>
              <div className="format-card-desc" style={{ color: '#cbd5e1' }}>
                Additional formats including Hindi and commercial lease agreements are being prepared.
              </div>
            </div>
            <div className="format-coming-soon-pill">Coming Soon</div>
          </div>
        </div>
      </div>

      {previewFormat && (
        <PreviewModal
          format={previewFormat}
          onClose={() => setPreviewFormat(null)}
          onSelect={handleSelect}
        />
      )}
      <Footer />
    </>
  )
}
