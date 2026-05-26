import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import logo from './assets/images/Logo.png'
import templateUrl from './assets/templates/EnglishDefault.docx?url'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import './App.css'

const TOTAL_STEPS = 5

const RENT_DAYS = [
  '1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th',
  '11th','12th','13th','14th','15th','16th','17th','18th','19th','20th',
  '21st','22nd','23rd','24th','25th','26th','27th','28th','29th','30th','31st',
]

const HUD_STEPS = [
  { id: 1, label: 'Owner Details' },
  { id: 2, label: 'Tenant Details' },
  { id: 3, label: 'Rent & Security' },
  { id: 4, label: 'House & Dates' },
  { id: 5, label: 'Review Preview' },
]

// ── Generate Order ID ─────────────────────────────────────────
function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `DIT-${date}-${rand}`
}
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
  'Seventeen','Eighteen','Nineteen']
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']

function numToWords(n) {
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
  if (n >= 10000000) {
    result += belowThousand(Math.floor(n / 10000000)) + ' Crore '
    n %= 10000000
  }
  if (n >= 100000) {
    result += belowThousand(Math.floor(n / 100000)) + ' Lakh '
    n %= 100000
  }
  if (n >= 1000) {
    result += belowThousand(Math.floor(n / 1000)) + ' Thousand '
    n %= 1000
  }
  if (n > 0) result += belowThousand(n)

  return 'Rupees ' + result.trim() + ' Only'
}
// ── Icons ──────────────────────────────────────────────────────
function IconChevronLeft() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// ── Step 1: Owner Details ──────────────────────────────────────
function StepOwner({ data, onChange }) {
  return (
    <div className="page-step active">
      <div className="step-heading">Owner Details / First Party Details</div>
      <div className="form-grid">
        <div className="input-block">
          <label>Owner Name</label>
          <input
            type="text"
            name="owner_name"
            value={data.owner_name}
            onChange={onChange}
            placeholder="e.g. Rahul Sharma"
            required
          />
        </div>
        <div className="input-block">
          <label>
            Owner Aadhaar Number
            <span className="optional-tag">(Optional)</span>
          </label>
          <input
            type="text"
            name="owner_aadhaar"
            value={data.owner_aadhaar}
            onChange={onChange}
            maxLength={14}
            placeholder="e.g. 0000 0000 0000"
          />
        </div>
        <div className="input-block span-2">
          <label>Owner Address / First Party Address</label>
          <textarea
            name="owner_address"
            value={data.owner_address}
            onChange={onChange}
            rows={3}
            placeholder="Enter owner address"
            required
          />
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Tenant Details ─────────────────────────────────────
function StepTenant({ data, onChange }) {
  return (
    <div className="page-step active">
      <div className="step-heading">Tenant Details / Second Party Details</div>
      <div className="form-grid">
        <div className="input-block">
          <label>Tenant Name</label>
          <input
            type="text"
            name="tenant_name"
            value={data.tenant_name}
            onChange={onChange}
            placeholder="e.g. Amit Kumar"
            required
          />
        </div>
        <div className="input-block">
          <label>
            Tenant Aadhaar Number
            <span className="optional-tag">(Optional)</span>
          </label>
          <input
            type="text"
            name="tenant_aadhaar"
            value={data.tenant_aadhaar}
            onChange={onChange}
            maxLength={14}
            placeholder="e.g. 0000 0000 0000"
          />
        </div>
        <div className="input-block span-2">
          <label>Tenant Address</label>
          <textarea
            name="tenant_address"
            value={data.tenant_address}
            onChange={onChange}
            rows={3}
            placeholder="Enter tenant address"
            required
          />
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Rent & Security ────────────────────────────────────
function StepRent({ data, onChange }) {
  return (
    <div className="page-step active">
      <div className="step-heading">Rent & Security Details</div>
      <div className="form-grid">
        <div className="input-block">
          <label>Monthly Rent (₹)</label>
          <input
            type="number"
            name="rent"
            value={data.rent}
            onChange={onChange}
            className="no-arrows"
            placeholder="e.g. 15000"
            required
          />
          {data.rent && numToWords(data.rent) !== 'N/A' && <span className="amount-words">{numToWords(data.rent)}</span>}
        </div>
        <div className="input-block">
          <label>Security Deposit (₹)</label>
          <input
            type="number"
            name="advance_amt"
            value={data.advance_amt}
            onChange={onChange}
            className="no-arrows"
            placeholder="e.g. 45000"
            required
          />
          {data.advance_amt && numToWords(data.advance_amt) !== 'N/A' && <span className="amount-words">{numToWords(data.advance_amt)}</span>}
        </div>
        <div className="input-block">
          <label>Rent due on (Every month)</label>
          <select name="day_of_rent" value={data.day_of_rent} onChange={onChange}>
            {RENT_DAYS.map((d) => (
              <option key={d} value={d}>{d} day of month</option>
            ))}
          </select>
        </div>
        <div className="input-block">
          <label>Notice Period (Days)</label>
          <input
            type="number"
            name="notice_period"
            value={data.notice_period}
            onChange={onChange}
            required
          />
        </div>
      </div>
    </div>
  )
}

// ── Step 4: Dates & House ──────────────────────────────────────
const AMENITY_OPTIONS = ['Electricity', 'Water', 'Gas Line']

function StepHouse({ data, onChange, onAmenitiesChange }) {
  const handleCheckbox = (item) => {
    const current = data.amenities_list
    const updated = current.includes(item)
      ? current.filter((a) => a !== item)
      : [...current, item]
    onAmenitiesChange(updated)
  }

  return (
    <div className="page-step active">
      <div className="step-heading">Dates & House Specifications</div>
      <div className="form-grid">
        <div className="input-block">
          <label>Agreement Date</label>
          <input
            type="date"
            name="agreement_date"
            value={data.agreement_date}
            onChange={onChange}
            required
          />
        </div>
        <div className="input-block">
          <label>Rent Period (Months)</label>
          <input
            type="number"
            name="duration"
            value={data.duration}
            onChange={onChange}
            required
          />
        </div>
        <div className="input-block">
          <label>Building Type</label>
          <select name="building_type" value={data.building_type} onChange={onChange}>
            <option value="House">House</option>
            <option value="Building">Building</option>
            <option value="Flat">Flat</option>
          </select>
        </div>
        <div className="input-block">
          <label>Rent Purpose</label>
          <input
            type="text"
            name="rent_purpose"
            value={data.rent_purpose}
            onChange={onChange}
            required
          />
        </div>
        <div className="input-block span-2">
          <label>
            Chargeable Amenities
            <span className="optional-tag">payable by tenant</span>
          </label>
          <div className="amenities-checklist">
            {AMENITY_OPTIONS.map((item) => (
              <label key={item} className="amenity-option">
                <input
                  type="checkbox"
                  checked={data.amenities_list.includes(item)}
                  onChange={() => handleCheckbox(item)}
                />
                <span className="amenity-checkmark" />
                {item}
              </label>
            ))}
            <div className="amenity-other">
              <label className="amenity-option">
                <input
                  type="checkbox"
                  checked={data.amenities_other_checked}
                  onChange={() => onAmenitiesChange(data.amenities_list, !data.amenities_other_checked)}
                />
                <span className="amenity-checkmark" />
                Other
              </label>
              {data.amenities_other_checked && (
                <input
                  type="text"
                  className="amenity-other-input"
                  name="amenities_other"
                  value={data.amenities_other}
                  onChange={onChange}
                  placeholder="e.g. Internet, Parking"
                />
              )}
            </div>
          </div>
        </div>
        <div className="input-block span-2">
          <label>Rented House Address</label>
          <textarea
            name="rented_house_address"
            value={data.rented_house_address}
            onChange={onChange}
            rows={3}
            placeholder="Full address of the house being rented out"
            required
          />
        </div>
        <div className="input-block span-2">
          <label>Building TC No</label>
          <input
            type="text"
            name="building_tc_no"
            value={data.building_tc_no}
            onChange={onChange}
            placeholder="e.g. TC 12/3456-1"
            required
          />
        </div>
      </div>
    </div>
  )
}

// ── Step 5: Review Preview ─────────────────────────────────────
function StepPreview({ data }) {
  const formatCurrency = (val) =>
    val ? '₹' + Number(val).toLocaleString('en-IN') : '—'

  const formatDate = (val) => {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="page-step active">
      <div className="step-heading">
        Preview
        <p className="step-subheading">Review all data before submitting</p>
      </div>
      <div className="preview-container">
        <div className="party-preview-grid">
          {/* Owner Card */}
          <div className="party-card landlord-card">
            <div className="party-role-tag">Owner Details / First Party Details</div>
            <div className="party-name">{data.owner_name || '—'}</div>
            <div className="preview-label">Aadhaar No</div>
            <div className="preview-val" style={{ marginBottom: 12 }}>
              {data.owner_aadhaar || 'Not Provided'}
            </div>
            <div className="preview-label">Owner Address / First Party Address</div>
            <div className="party-address-box">{data.owner_address || '—'}</div>
          </div>

          {/* Tenant Card */}
          <div className="party-card tenant-card">
            <div className="party-role-tag">Tenant Details / Second Party Details</div>
            <div className="party-name">{data.tenant_name || '—'}</div>
            <div className="preview-label">Aadhaar No</div>
            <div className="preview-val" style={{ marginBottom: 12 }}>
              {data.tenant_aadhaar || 'Not Provided'}
            </div>
            <div className="preview-label">Tenant Address</div>
            <div className="party-address-box">{data.tenant_address || '—'}</div>
          </div>
        </div>

        <div className="preview-details-board">
          <div className="preview-item">
            <div className="preview-label">Agreement Start Date</div>
            <div className="preview-val">{formatDate(data.agreement_date)}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Rent Period (Months)</div>
            <div className="preview-val">{data.duration ? `${data.duration} Months` : '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Monthly Rent</div>
            <div className="preview-val">{formatCurrency(data.rent)}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Security Deposit</div>
            <div className="preview-val">{formatCurrency(data.advance_amt)}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Rent due on (Every month)</div>
            <div className="preview-val">{data.day_of_rent ? `${data.day_of_rent} of month` : '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Notice Period (Days)</div>
            <div className="preview-val">{data.notice_period ? `${data.notice_period} Days` : '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Building Type</div>
            <div className="preview-val">{data.building_type || '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Rent Purpose</div>
            <div className="preview-val">{data.rent_purpose || '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Amenities Provided</div>
            <div className="preview-val">
              {[...data.amenities_list, ...(data.amenities_other_checked && data.amenities_other ? [data.amenities_other] : [])].join(', ') || '—'}
            </div>
          </div>
          <div className="preview-item full-span">
            <div>
              <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>
                Rented House Address
              </div>
              <div className="preview-val" style={{ marginTop: 4, lineHeight: 1.4 }}>
                {data.rented_house_address || '—'}
              </div>
            </div>
            <div>
              <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>
                Building TC No
              </div>
              <div className="preview-val" style={{ marginTop: 4, lineHeight: 1.4 }}>
                {data.building_tc_no || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef(null)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    owner_name: '',
    owner_aadhaar: '',
    owner_address: '',
    tenant_name: '',
    tenant_aadhaar: '',
    tenant_address: '',
    rent: '',
    advance_amt: '',
    day_of_rent: '5th',
    notice_period: '30',
    agreement_date: '',
    duration: '11',
    building_type: 'House',
    rent_purpose: 'Residential Purpose',
    amenities_list: [],
    amenities_other_checked: false,
    amenities_other: '',
    rented_house_address: '',
    building_tc_no: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAmenitiesChange = (list, otherChecked) => {
    setFormData((prev) => ({
      ...prev,
      amenities_list: list !== undefined ? list : prev.amenities_list,
      amenities_other_checked: otherChecked !== undefined ? otherChecked : prev.amenities_other_checked,
      amenities_other: otherChecked === false ? '' : prev.amenities_other,
    }))
  }

  const validateCurrentStep = () => {
    if (!formRef.current) return true
    // On step 5 (preview) there are no inputs to validate
    if (currentStep === TOTAL_STEPS) return true
    const inputs = formRef.current.querySelectorAll('input[required], textarea[required], select[required]')
    for (const field of inputs) {
      if (!field.checkValidity()) {
        field.reportValidity()
        return false
      }
    }
    return true
  }

  const goNext = () => {
    if (!validateCurrentStep()) return
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  const handleDownload = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(templateUrl)
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)

      const amenitiesFinal = [
        ...formData.amenities_list,
        ...(formData.amenities_other_checked && formData.amenities_other
          ? [formData.amenities_other]
          : []),
      ].join(', ')

      // Save to Firestore before generating doc
      const orderId = generateOrderId()
      await addDoc(collection(db, 'Agreements'), {
        order_id: orderId,
        owner_name: formData.owner_name,
        owner_aadhaar: formData.owner_aadhaar || null,
        owner_address: formData.owner_address,
        tenant_name: formData.tenant_name,
        tenant_aadhaar: formData.tenant_aadhaar || null,
        tenant_address: formData.tenant_address,
        rent: Number(formData.rent),
        advance_amt: Number(formData.advance_amt),
        day_of_rent: formData.day_of_rent,
        notice_period: Number(formData.notice_period),
        agreement_date: formData.agreement_date,
        duration: Number(formData.duration),
        building_type: formData.building_type,
        rent_purpose: formData.rent_purpose,
        amenities: amenitiesFinal,
        rented_house_address: formData.rented_house_address,
        building_tc_no: formData.building_tc_no,
        created_at: serverTimestamp(),
      })

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      const duration = formData.duration
      const rentPeriod = duration ? `${duration} ${Number(duration) === 1 ? 'Month' : 'Months'}` : ''

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
        amenities: amenitiesFinal,
        duration: formData.duration,
        notice_period: formData.notice_period,
        building_tc_no: formData.building_tc_no,
      })

      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      // Convert blob to base64 to pass via router state
      const reader = new FileReader()
      reader.onloadend = () => {
        setIsLoading(false)
        navigate('/success', {
          state: {
            tenantName: formData.tenant_name,
            orderId,
            fileData: reader.result,
            fileName: `Rental_Agreement_${formData.tenant_name}.docx`,
          },
        })
      }
      reader.readAsDataURL(blob)
    } catch (err) {
      console.error('Document generation failed:', err)
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepOwner data={formData} onChange={handleChange} />
      case 2: return <StepTenant data={formData} onChange={handleChange} />
      case 3: return <StepRent data={formData} onChange={handleChange} />
      case 4: return <StepHouse data={formData} onChange={handleChange} onAmenitiesChange={handleAmenitiesChange} />
      case 5: return <StepPreview data={formData} />
      default: return null
    }
  }

  const isLastStep = currentStep === TOTAL_STEPS

  return (
    <>
      {/* Loader overlay */}
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader-box">
            <div className="loader-spinner" />
            <p className="loader-text">Generating your document…</p>
          </div>
        </div>
      )}
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="hero-section">
        <h2>Rental Agreement Workspace</h2>
        <p>Enter the required details to prepare a legally structured rental agreement.</p>
      </section>

      {/* Main App */}
      <main className="app-wrapper">
        <div className="ditto-card">
          {/* Progress HUD */}
          <div className="progress-hud">
            {HUD_STEPS.map(({ id, label }) => {
              const isActive = id === currentStep
              const isCompleted = id < currentStep
              let className = 'hud-step'
              if (isActive) className += ' active'
              if (isCompleted) className += ' completed'
              return (
                <div key={id} className={className}>
                  <div className="step-circle">{id}</div>
                  <div className="step-label">{label}</div>
                </div>
              )
            })}
          </div>

          {/* Form */}
          <form ref={formRef}>
            <div className="form-workspace">
              {renderStep()}

              <div className="actions-footer">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn-action btn-back"
                    onClick={goBack}
                  >
                    <IconChevronLeft />
                    Back
                  </button>
                )}

                {isLastStep ? (
                  <button
                    type="button"
                    className="btn-action btn-next btn-submit"
                    onClick={handleDownload}
                  >
                    Confirm & Download Document
                    <IconCheck />
                  </button>
                ) : (
                  <button type="button" className="btn-action btn-next" onClick={goNext}>
                    Next Step
                    <IconChevronRight />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
