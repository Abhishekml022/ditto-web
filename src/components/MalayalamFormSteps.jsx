// Malayalam agreement form steps.
// Text fields use MlDualInput (EN + ML side-by-side with auto-transliteration).
// Numeric/date fields reuse the same plain inputs as the English form.

import malayalamTemplateUrl from '../assets/templates/Malayalam_Rent_DTT-MAL-01.docx?url'
import { MlDualInput } from './MlDualInput'
import { numToWordsMl, dateToWords, dateToWordsMl, addMonths } from '../utils'
import { getDefaultData } from '../config/formatFields'
import { en } from '../i18n/en'
import { ml } from '../i18n/ml'

// Helper: renders "English label / മലയാളം ലേബൽ"
function L({ k }) {
  return <>{en[k]} <span className="ml-text" style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>/ {ml[k]}</span></>
}

export const RENT_DAYS_ML = [
  '1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th',
  '11th','12th','13th','14th','15th','16th','17th','18th','19th','20th',
  '21st','22nd','23rd','24th','25th','26th','27th','28th','29th','30th','31st',
]

export const AMENITY_OPTIONS_ML = ['Electricity', 'Water', 'Piped Gas', 'WiFi']

// Fixed Malayalam equivalents for dropdown values — sourced from ml.js
const BUILDING_TYPE_ML = { House: ml.buildingHouse, Building: ml.buildingBuilding, Flat: ml.buildingFlat }
const AMENITY_ML = {
  Electricity: ml.amenityElectricity,
  Water: ml.amenityWater,
  'Piped Gas': ml.amenityGas,
  WiFi: ml.amenityWifi,
}

// ── Step 1: Owner ─────────────────────────────────────────────
export function StepOwnerMl({ data, onChange }) {
  return (
    <div className="page-step active">
      <div className="step-heading">
        <span className="ml-text">{ml.stepOwnerHeading}</span>
        <p className="step-subheading">{en.stepOwnerHeading} — {en.stepOwnerSub}</p>
      </div>
      <div className="form-grid">
        <MlDualInput
          label={<>{en.ownerName} <span className="ml-text">/ {ml.ownerName}</span></>}
          name="owner_name"
          value={data?.owner_name || ''}
          mlValue={data?.owner_name_ml || ''}
          onChange={onChange}
          placeholder={en.phOwnerName}
          required
        />
        <div className="input-block">
          <label>{en.ownerAadhaar} <span className="optional-tag">({en.optional})</span></label>
          <input type="text" name="owner_aadhaar" value={data?.owner_aadhaar || ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 12)
              const formatted = digits.replace(/(.{4})/g, '$1 ').trim()
              onChange({ target: { name: 'owner_aadhaar', value: formatted } })
            }}
            maxLength={14} placeholder={en.phOwnerAadhaar} />
        </div>
        <MlDualInput
          label={<>{en.ownerAddress} <span className="ml-text">/ {ml.ownerAddress}</span></>}
          name="owner_address"
          value={data?.owner_address || ''}
          mlValue={data?.owner_address_ml || ''}
          onChange={onChange}
          placeholder="eg: Thrissur District, Thrissur Taluk, Kazhakoottam P.O., Kariyil, Manakkattu Veedu."
          mlPlaceholder="eg: തിരുവനന്തപുരം ജില്ലയിൽ, തിരുവനന്തപുരം താലൂക്കിൽ, കഴക്കൂട്ടം പി.ഒ., കരിയിൽ, മണക്കാട്ടു വീട്."
          rows={3}
          required
        />
      </div>
    </div>
  )
}

// ── Step 2: Tenant ────────────────────────────────────────────
export function StepTenantMl({ data, onChange }) {
  return (
    <div className="page-step active">
      <div className="step-heading">
        <span className="ml-text">{ml.stepTenantHeading}</span>
        <p className="step-subheading">{en.stepTenantHeading} — {en.stepTenantSub}</p>
      </div>
      <div className="form-grid">
        <MlDualInput
          label={<>{en.tenantName} <span className="ml-text">/ {ml.tenantName}</span></>}
          name="tenant_name"
          value={data?.tenant_name || ''}
          mlValue={data?.tenant_name_ml || ''}
          onChange={onChange}
          placeholder={en.phTenantName}
          required
        />
        <div className="input-block">
          <label>{en.tenantAadhaar} <span className="optional-tag">({en.optional})</span></label>
          <input type="text" name="tenant_aadhaar" value={data?.tenant_aadhaar || ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 12)
              const formatted = digits.replace(/(.{4})/g, '$1 ').trim()
              onChange({ target: { name: 'tenant_aadhaar', value: formatted } })
            }}
            maxLength={14} placeholder={en.phTenantAadhaar} />
        </div>
        <MlDualInput
          label={<>{en.tenantAddress} <span className="ml-text">/ {ml.tenantAddress}</span></>}
          name="tenant_address"
          value={data?.tenant_address || ''}
          mlValue={data?.tenant_address_ml || ''}
          onChange={onChange}
          placeholder="eg: Thrissur District, Thrissur Taluk, Kazhakoottam P.O., Kariyil, Manakkattu Veedu."
          mlPlaceholder="eg: തിരുവനന്തപുരം ജില്ലയിൽ, തിരുവനന്തപുരം താലൂക്കിൽ, കഴക്കൂട്ടം പി.ഒ., കരിയിൽ, മണക്കാട്ടു വീട്."
          rows={3}
          required
        />
      </div>
    </div>
  )
}

// ── Step 3: Rent & Security (numbers only — same as English) ──
export function StepRentMl({ data, onChange }) {
  return (
    <div className="page-step active">
      <div className="step-heading">
        <span className="ml-text">{ml.stepRentHeading}</span>
        <p className="step-subheading">{en.stepRentHeading} — {en.stepRentSub}</p>
      </div>
      <div className="form-grid">
        <div className="input-block">
          <label>{en.monthlyRent} <span className="ml-text">/ {ml.monthlyRent}</span></label>
          <input type="number" name="rent" value={data?.rent || ''} onChange={onChange}
            className="no-arrows" placeholder={en.phRent} required />
          {numToWordsMl(data?.rent) &&
            <span className="amount-words ml-text">{numToWordsMl(data?.rent)}</span>}
        </div>
        <div className="input-block">
          <label>{en.securityDeposit} <span className="ml-text">/ {ml.securityDeposit}</span></label>
          <input type="number" name="advance_amt" value={data?.advance_amt || ''} onChange={onChange}
            className="no-arrows" placeholder={en.phDeposit} required />
          {numToWordsMl(data?.advance_amt) &&
            <span className="amount-words ml-text">{numToWordsMl(data?.advance_amt)}</span>}
        </div>
        <div className="input-block">
          <label>{en.rentDueOn} <span className="ml-text">/ {ml.rentDueOn}</span></label>
          <select name="day_of_rent" value={data?.day_of_rent || '5th'} onChange={onChange}>
            {RENT_DAYS_ML.map((d) => <option key={d} value={d}>{d} {en.dayOfMonth}</option>)}
          </select>
        </div>
        <div className="input-block">
          <label>{en.noticePeriod} <span className="ml-text">/ {ml.noticePeriod}</span></label>
          <input type="number" name="notice_period" value={data?.notice_period || ''} onChange={onChange} required />
        </div>
      </div>
    </div>
  )
}

// ── Step 4: House & Dates ─────────────────────────────────────
export function StepHouseMl({ data, onChange, onAmenitiesChange }) {
  const amenitiesList = data?.amenities_list || []

  const handleCheckbox = (item) => {
    const updated = amenitiesList.includes(item)
      ? amenitiesList.filter((a) => a !== item)
      : [...amenitiesList, item]
    onAmenitiesChange(updated)
  }

  const handleDateOrDuration = (e) => {
    onChange(e)
    const { name, value } = e.target
    const startDate = name === 'agreement_date' ? value : data?.agreement_date
    const duration  = name === 'duration'        ? value : data?.duration
    if (startDate && duration) {
      const computed = addMonths(startDate, duration)
      onChange({ target: { name: 'agreement_end_date', value: computed } })
    }
  }

  // Keep building_type_ml in sync with building_type dropdown
  const handleBuildingType = (e) => {
    onChange(e)
    onChange({ target: { name: 'building_type_ml', value: BUILDING_TYPE_ML[e.target.value] || e.target.value } })
  }

  return (
    <div className="page-step active">
      <div className="step-heading">
        <span className="ml-text">{ml.stepHouseHeading}</span>
        <p className="step-subheading">{en.stepHouseHeading} — {en.stepHouseSub}</p>
      </div>
      <div className="form-grid">
        <div className="input-block">
          <label>{en.agreementStartDate} <span className="ml-text">/ {ml.agreementStartDate}</span></label>
          <input type="date" name="agreement_date" value={data?.agreement_date || ''}
            onChange={handleDateOrDuration} required />
          {data?.agreement_date && (
            <>
              <span className="amount-words">{dateToWords(data.agreement_date)}</span>
              <span className="amount-words ml-text">{dateToWordsMl(data.agreement_date)}</span>
            </>
          )}
        </div>
        <div className="input-block">
          <label>{en.rentPeriod} <span className="ml-text">/ {ml.rentPeriod}</span></label>
          <input type="number" name="duration" value={data?.duration || ''}
            onChange={handleDateOrDuration} required />
        </div>
        <div className="input-block">
          <label>{en.buildingType} <span className="ml-text">/ {ml.buildingType}</span></label>
          <select name="building_type" value={data?.building_type || 'Building'} onChange={handleBuildingType}>
            <option value="House">{ml.optHouse}</option>
            <option value="Building">{ml.optBuilding}</option>
            <option value="Flat">{ml.optFlat}</option>
          </select>
        </div>
        <MlDualInput
          label={<>{en.rentPurpose} <span className="ml-text">/ {ml.rentPurpose}</span></>}
          name="rent_purpose"
          value={data?.rent_purpose || ''}
          mlValue={data?.rent_purpose_ml || ''}
          onChange={onChange}
          placeholder={en.phRentPurpose}
          required
        />
        <div className="input-block span-2">
          <label>
            {en.chargeableAmenities} <span className="ml-text">/ {ml.chargeableAmenities}</span>
            {' '}<span className="optional-tag ml-text">({ml.amenitiesNote})</span>
          </label>
          <div className="amenities-checklist">
            {AMENITY_OPTIONS_ML.map((item) => (
              <label key={item} className="amenity-option">
                <input type="checkbox" checked={amenitiesList.includes(item)}
                  onChange={() => handleCheckbox(item)} />
                <span className="amenity-checkmark" />
                {item} <span className="ml-text" style={{ marginLeft: 4, color: 'var(--text-secondary)' }}>({AMENITY_ML[item]})</span>
              </label>
            ))}
            <div className="amenity-other">
              <label className="amenity-option">
                <input type="checkbox" checked={data?.amenities_other_checked || false}
                  onChange={() => onAmenitiesChange(amenitiesList, !data?.amenities_other_checked)} />
                <span className="amenity-checkmark" />
                {en.other} <span className="ml-text">/ {ml.other}</span>
              </label>
              {data?.amenities_other_checked && (
                <input type="text" className="amenity-other-input" name="amenities_other"
                  value={data?.amenities_other || ''} onChange={onChange} placeholder="e.g. Internet, Parking" />
              )}
            </div>
          </div>
        </div>
        <div className="form-section-header span-2">
          <span className="ml-text">വാടക വീടിന്റെ വിവരങ്ങൾ</span>
          <span className="form-section-header-sub">Rented Property Details</span>
        </div>
        <MlDualInput
          label={<>District <span className="ml-text">/ ജില്ല</span></>}
          name="r_jilla"
          value={data?.r_jilla || ''}
          mlValue={data?.r_jilla_ml || ''}
          onChange={onChange}
          placeholder="e.g. Thrissur"
          required
        />
        <MlDualInput
          label={<>Village / നഗരം <span className="ml-text">/ ഗ്രാമം</span></>}
          name="r_village"
          value={data?.r_village || ''}
          mlValue={data?.r_village_ml || ''}
          onChange={onChange}
          placeholder="e.g. Thrissur"
          required
        />
        <MlDualInput
          label={<>House Name <span className="ml-text">/ വീടിന്റെ പേര്</span></>}
          name="house_name"
          value={data?.house_name || ''}
          mlValue={data?.house_name_ml || ''}
          onChange={onChange}
          placeholder="e.g. Sreelakshmi Bhavan"
          required
        />
        <div className="input-block">
          <label>No. of Floors <span className="ml-text">/ നിലകളുടെ എണ്ണം</span></label>
          <input type="text" name="no_of_floors" value={data?.no_of_floors || ''}
            onChange={onChange} placeholder="e.g. 2" required />
        </div>
        <MlDualInput
          label={<>Rented Floor / Portion <span className="ml-text">/ വാടകക്ക് നൽകുന്ന ഭാഗം</span></>}
          name="rented_floor"
          value={data?.rented_floor || ''}
          mlValue={data?.rented_floor_ml || ''}
          onChange={onChange}
          placeholder="e.g. Ground Floor / ഗ്രൗണ്ട് ഫ്ലോർ"
          required
        />
        <div className="input-block">
          <label>{en.buildingTcNo} <span className="optional-tag">({en.optional})</span></label>
          <input type="text" name="building_tc_no" value={data?.building_tc_no || ''}
            onChange={onChange} placeholder={en.phTcNo} />
        </div>
        <div className="input-block">
          <label>{en.contactNumber} <span className="ml-text">/ {ml.contactNumber}</span></label>
          <input type="tel" name="tenant_mobile" value={data?.tenant_mobile || ''}
            onChange={onChange} maxLength={10} placeholder={en.phContact} required />
        </div>
        <div className="input-block">
          <label>{en.stampPaperAmount} <span className="ml-text">/ {ml.stampPaperAmount}</span></label>
          <select name="stamp_paper_amount" value={data?.stamp_paper_amount || ''} onChange={onChange} required>
            <option value="" disabled>{en.optStampNone}</option>
            <option value="500">{en.optStamp500}</option>
            <option value="200">{en.optStamp200}</option>
          </select>
        </div>
      </div>
    </div>
  )
}

const ML_DIGITS = ['൦','൧','൨','൩','൪','൫','൬','൭','൮','൯']
function toMlNumerals(str) {
  return String(str).replace(/[0-9]/g, d => ML_DIGITS[+d])
}
function fmtDateMl(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`
}

// ── Step 5: Review ────────────────────────────────────────────
export function StepPreviewMl({ data, declared, onDeclaredChange, isEdit }) {
  const fmtC = (v) => v ? '₹' + Number(v).toLocaleString('en-IN') : '—'
  const amenitiesFinal = [
    ...(data?.amenities_list || []).map((a) => AMENITY_ML[a] || a),
    ...(data?.amenities_other_checked && data?.amenities_other ? [data.amenities_other] : []),
  ].join(', ')

  const warn = <span style={{ color: '#f59e0b' }} className="ml-text">{ml.warnMlNotSet}</span>

  return (
    <div className="page-step active">
      <div className="step-heading">
        {en.stepReviewHeading}
        <p className="step-subheading ml-text">{ml.stepReviewSub}</p>
      </div>
      <div className="preview-container">
        <div className="party-preview-grid">
          <div className="party-card landlord-card">
            <div className="party-role-tag">{en.reviewOwner} <span className="ml-text">/ {ml.reviewOwner}</span></div>
            <div className="party-name ml-text">{data?.owner_name_ml || data?.owner_name || warn}</div>
            <div className="preview-label">{en.aadhaarNo} <span className="ml-text">/ {ml.aadhaarNo}</span></div>
            <div className="preview-val" style={{ marginBottom: 12 }}>{data?.owner_aadhaar || en.notProvided}</div>
            <div className="preview-label">{en.address} <span className="ml-text">/ {ml.address}</span></div>
            <div className="party-address-box ml-text">{data?.owner_address_ml || data?.owner_address || warn}</div>
          </div>
          <div className="party-card tenant-card">
            <div className="party-role-tag">{en.reviewTenant} <span className="ml-text">/ {ml.reviewTenant}</span></div>
            <div className="party-name ml-text">{data?.tenant_name_ml || data?.tenant_name || warn}</div>
            <div className="preview-label">{en.aadhaarNo} <span className="ml-text">/ {ml.aadhaarNo}</span></div>
            <div className="preview-val" style={{ marginBottom: 12 }}>{data?.tenant_aadhaar || en.notProvided}</div>
            <div className="preview-label">{en.address} <span className="ml-text">/ {ml.address}</span></div>
            <div className="party-address-box ml-text">{data?.tenant_address_ml || data?.tenant_address || warn}</div>
          </div>
        </div>

        {data?.tenant_mobile && (
          <div className="preview-contact-row">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span className="preview-contact-label">{en.contact} <span className="ml-text">/ {ml.contact}</span></span>
            <span className="preview-contact-val">{data.tenant_mobile}</span>
          </div>
        )}

        <div className="preview-section-title">{en.rentAndTerms} <span className="ml-text">/ {ml.rentAndTerms}</span></div>
        <div className="preview-details-board">
          <div className="preview-item">
            <div className="preview-label">{en.startDate} <span className="ml-text">/ {ml.startDate}</span></div>
            <div className="preview-val ml-text">{fmtDateMl(data?.agreement_date)}</div>
            {data?.agreement_date && (
              <div className="preview-val ml-text" style={{ fontSize: '0.82em', opacity: 0.7, marginTop: 2 }}>
                {dateToWordsMl(data.agreement_date)}
              </div>
            )}
          </div>
          <div className="preview-item">
            <div className="preview-label">{en.rentPeriodLabel} <span className="ml-text">/ {ml.rentPeriodLabel}</span></div>
            <div className="preview-val ml-text">{data?.duration ? `${data.duration} മാസം` : '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">{en.monthlyRentLabel} <span className="ml-text">/ {ml.monthlyRentLabel}</span></div>
            <div className="preview-val">{fmtC(data?.rent)}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">{en.securityDepositLabel} <span className="ml-text">/ {ml.securityDepositLabel}</span></div>
            <div className="preview-val">{fmtC(data?.advance_amt)}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">{en.noticePeriodLabel} <span className="ml-text">/ {ml.noticePeriodLabel}</span></div>
            <div className="preview-val ml-text">{data?.notice_period ? `${data.notice_period} ദിവസം` : '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">{en.buildingTypeLabel} <span className="ml-text">/ {ml.buildingTypeLabel}</span></div>
            <div className="preview-val ml-text">{data?.building_type_ml || BUILDING_TYPE_ML[data?.building_type] || '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">{en.rentPurposeLabel} <span className="ml-text">/ {ml.rentPurposeLabel}</span></div>
            <div className="preview-val ml-text">{data?.rent_purpose_ml || data?.rent_purpose || '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">{en.amenitiesLabel} <span className="ml-text">/ {ml.amenitiesLabel}</span></div>
            <div className="preview-val ml-text">{amenitiesFinal || ml.none}</div>
          </div>
        </div>

        <div className="preview-section-title">{en.propertyDetails} <span className="ml-text">/ {ml.propertyDetails}</span></div>
        <div className="preview-details-board">
          <div className="preview-item full-span">
            <div>
              <div className="preview-label">District / ജില്ല</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>
                {data?.r_jilla_ml || data?.r_jilla || warn}
              </div>
            </div>
            <div>
              <div className="preview-label">Village / ഗ്രാമം</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>
                {data?.r_village_ml || data?.r_village || warn}
              </div>
            </div>
            <div>
              <div className="preview-label">House Name / വീടിന്റെ പേര്</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>
                {data?.house_name_ml || data?.house_name || warn}
              </div>
            </div>
            <div>
              <div className="preview-label">No. of Floors / നിലകൾ</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>
                {data?.no_of_floors
                  ? (String(data.no_of_floors) === '1' ? '1 നില' : `${data.no_of_floors} നിലകൾ`)
                  : '—'}
              </div>
            </div>
            <div>
              <div className="preview-label">Rented Floor / Portion / വാടകക്ക് നൽകുന്ന ഭാഗം</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>
                {data?.rented_floor_ml || data?.rented_floor || warn}
              </div>
            </div>
            <div>
              <div className="preview-label">{en.buildingTcLabel} <span className="ml-text">/ {ml.buildingTcLabel}</span></div>
              <div className="preview-val" style={{ marginTop: 4 }}>{data?.building_tc_no || '—'}</div>
            </div>
          </div>
        </div>

        {data?.stamp_paper_amount && (
          <div className="preview-stamppaper-banner">
            <div className="preview-stamppaper-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="preview-stamppaper-content">
              <div className="preview-stamppaper-title ml-text">{ml.stampPaperRequired}</div>
              <div className="preview-stamppaper-sub ml-text">{ml.stampPaperSub}</div>
            </div>
            <div className="preview-stamppaper-amount">Rs. {data.stamp_paper_amount}</div>
          </div>
        )}

        <label className={`preview-declaration ${declared ? 'preview-declaration--checked' : ''}`}>
          <input type="checkbox" checked={declared} onChange={(e) => onDeclaredChange(e.target.checked)} />
          <span className="amenity-checkmark" />
          <span className="preview-declaration-text ml-text">
            {isEdit ? ml.declarationEdit : ml.declarationNew}
          </span>
        </label>
      </div>
    </div>
  )
}

// ── Format config ─────────────────────────────────────────────
export const ML_FORMAT_CONFIGS = {
  'malayalam-standard': {
    templateUrl: malayalamTemplateUrl,
    steps: [
      { id: 1, label: 'ഉടമസ്ഥൻ' },
      { id: 2, label: 'വാടകക്കാരൻ' },
      { id: 3, label: 'വാടക & ഡെപ്പോസിറ്റ്' },
      { id: 4, label: 'വീടും തീയതിയും' },
      { id: 5, label: 'Review' },
    ],
    defaultData: getDefaultData('malayalam-standard'),
  },
}
