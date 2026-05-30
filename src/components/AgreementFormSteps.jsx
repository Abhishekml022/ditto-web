import mainTemplateUrl from '../assets/templates/English_main.docx?url'
import defaultTemplateUrl from '../assets/templates/EnglishDefault.docx?url'
import flatTemplateUrl from '../assets/templates/English_Flat_asset.docx?url'
import { numToWords, dateToWords, addMonths } from '../utils'
import { getDefaultData } from '../config/formatFields'

export const RENT_DAYS = [
  '1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th',
  '11th','12th','13th','14th','15th','16th','17th','18th','19th','20th',
  '21st','22nd','23rd','24th','25th','26th','27th','28th','29th','30th','31st',
]

export const AMENITY_OPTIONS = ['Electricity', 'Water', 'Piped Gas', 'WiFi']

// ── Step 1: Owner ─────────────────────────────────────────────
export function StepOwner({ data, onChange, format }) {
  const isFlat = format === 'english-flat'
  return (
    <div className="page-step active">
      <div className="step-heading">Owner / Lessor Details
        <p className="step-subheading">Details of the property owner who is renting out the premises</p>
      </div>
      <div className="form-grid">
        <div className="input-block">
          <label>Owner Name</label>
          <input type="text" name="owner_name" value={data.owner_name || ''}
            onChange={onChange} placeholder="e.g. Rahul Sharma" required />
        </div>
        {isFlat ? (
          <div className="input-block">
            <label>S/o or D/o <span className="optional-tag">(Optional)</span></label>
            <input type="text" name="owner_co" value={data.owner_co || ''}
              onChange={onChange} placeholder="e.g. S/o Mohan Sharma" />
          </div>
        ) : (
          <div className="input-block">
            <label>Owner Aadhaar <span className="optional-tag">(Optional)</span></label>
            <input type="text" name="owner_aadhaar" value={data.owner_aadhaar || ''}
              onChange={onChange} maxLength={14} placeholder="e.g. 0000 0000 0000" />
          </div>
        )}
        <div className="input-block span-2">
          <label>Owner Address</label>
          <textarea name="owner_address" value={data.owner_address || ''}
            onChange={onChange} rows={3} placeholder="Enter owner address" required />
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Tenant ────────────────────────────────────────────
export function StepTenant({ data, onChange, format }) {
  const isFlat = format === 'english-flat'
  return (
    <div className="page-step active">
      <div className="step-heading">Tenant / Lessee Details
        <p className="step-subheading">Details of the person who will be occupying the property</p>
      </div>
      <div className="form-grid">
        <div className="input-block">
          <label>Tenant Name</label>
          <input type="text" name="tenant_name" value={data.tenant_name || ''}
            onChange={onChange} placeholder="e.g. Amit Kumar" required />
        </div>
        {isFlat ? (
          <div className="input-block">
            <label>S/o or D/o <span className="optional-tag">(Optional)</span></label>
            <input type="text" name="tenant_co" value={data.tenant_co || ''}
              onChange={onChange} placeholder="e.g. D/o Suresh Kumar" />
          </div>
        ) : (
          <div className="input-block">
            <label>Tenant Aadhaar <span className="optional-tag">(Optional)</span></label>
            <input type="text" name="tenant_aadhaar" value={data.tenant_aadhaar || ''}
              onChange={onChange} maxLength={14} placeholder="e.g. 0000 0000 0000" />
          </div>
        )}
        <div className="input-block span-2">
          <label>Tenant Address</label>
          <textarea name="tenant_address" value={data.tenant_address || ''}
            onChange={onChange} rows={3} placeholder="Enter tenant address" required />
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Rent & Security ───────────────────────────────────
export function StepRent({ data, onChange, format }) {
  const isFlat = format === 'english-flat'
  return (
    <div className="page-step active">
      <div className="step-heading">Rent & Security Details
        <p className="step-subheading">Monthly rent amount, security deposit, and payment terms</p>
      </div>
      <div className="form-grid">
        <div className="input-block">
          <label>Monthly Rent (₹)</label>
          <input type="number" name="rent" value={data.rent || ''} onChange={onChange}
            className="no-arrows" placeholder="e.g. 15000" required />
          {data.rent && numToWords(data.rent) !== 'N/A' &&
            <span className="amount-words">{numToWords(data.rent)}</span>}
        </div>
        <div className="input-block">
          <label>Security Deposit (₹)</label>
          <input type="number" name="advance_amt" value={data.advance_amt || ''} onChange={onChange}
            className="no-arrows" placeholder="e.g. 45000" required />
          {data.advance_amt && numToWords(data.advance_amt) !== 'N/A' &&
            <span className="amount-words">{numToWords(data.advance_amt)}</span>}
        </div>
        {!isFlat && (
          <div className="input-block">
            <label>Rent due on (Every month)</label>
            <select name="day_of_rent" value={data.day_of_rent || '5th'} onChange={onChange}>
              {RENT_DAYS.map((d) => <option key={d} value={d}>{d} day of month</option>)}
            </select>
          </div>
        )}
        <div className="input-block">
          <label>Notice Period (Days)</label>
          <input type="number" name="notice_period" value={data.notice_period || ''}
            onChange={onChange} required />
        </div>
        {isFlat && (
          <>
            <div className="input-block">
              <label>Rent Increase Applicable <span className="optional-tag">(%)</span></label>
              <input type="text" name="r_p_increase" value={data.r_p_increase || ''}
                onChange={onChange} placeholder="e.g. 5%" />
            </div>
            <div className="input-block">
              <label>Increase Applicable After</label>
              <input type="text" name="i_period" value={data.i_period || ''}
                onChange={onChange} placeholder="e.g. 11 Months" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Step 4: House & Dates ─────────────────────────────────────
export function StepHouse({ data, onChange, onAmenitiesChange, format }) {
  const isFlat = format === 'english-flat'
  const amenitiesList = data.amenities_list || []

  const handleCheckbox = (item) => {
    const updated = amenitiesList.includes(item)
      ? amenitiesList.filter((a) => a !== item)
      : [...amenitiesList, item]
    onAmenitiesChange(updated)
  }

  const handleDateOrDuration = (e) => {
    onChange(e)
    const { name, value } = e.target
    const startDate = name === 'agreement_date' ? value : data.agreement_date
    const duration  = name === 'duration'        ? value : data.duration
    if (startDate && duration && !data.end_date_manual) {
      const computed = addMonths(startDate, duration)
      onChange({ target: { name: 'agreement_end_date', value: computed } })
    }
  }

  const handleEndDate = (e) => {
    onChange({ target: { name: 'end_date_manual', value: true } })
    onChange(e)
  }

  return (
    <div className="page-step active">
      <div className="step-heading">Dates & Property Details
        <p className="step-subheading">Agreement duration, start date, property type, and chargeable amenities</p>
      </div>
      <div className="form-grid">
        <div className="input-block">
          <label>Agreement Start Date</label>
          <input type="date" name="agreement_date" value={data.agreement_date || ''}
            onChange={handleDateOrDuration} required />
          {data.agreement_date && <span className="amount-words">{dateToWords(data.agreement_date)}</span>}
        </div>
        <div className="input-block">
          <label>Rent Period (Months)</label>
          <input type="number" name="duration" value={data.duration || ''}
            onChange={handleDateOrDuration} required />
        </div>
        {isFlat && (
          <div className="input-block">
            <label>Agreement End Date
              {!data.end_date_manual && data.agreement_end_date &&
                <span className="optional-tag">auto-filled</span>}
            </label>
            <input type="date" name="agreement_end_date"
              value={data.agreement_end_date || ''}
              onChange={handleEndDate} required />
            {data.agreement_end_date && <span className="amount-words">{dateToWords(data.agreement_end_date)}</span>}
          </div>
        )}
        {!isFlat && (
          <>
            <div className="input-block">
              <label>Building Type</label>
              <select name="building_type" value={data.building_type || 'House'} onChange={onChange}>
                <option value="House">House</option>
                <option value="Building">Building</option>
                <option value="Flat">Flat</option>
              </select>
            </div>
            <div className="input-block">
              <label>Rent Purpose</label>
              <input type="text" name="rent_purpose" value={data.rent_purpose || ''}
                onChange={onChange} required />
            </div>
          </>
        )}
        {isFlat && (
          <div className="input-block">
            <label>Rent Purpose</label>
            <input type="text" name="rent_purpose" value={data.rent_purpose || ''}
              onChange={onChange} required />
          </div>
        )}
        <div className="input-block span-2">
          <label>Chargeable Amenities <span className="optional-tag">payable by tenant</span></label>
          <div className="amenities-checklist">
            {AMENITY_OPTIONS.map((item) => (
              <label key={item} className="amenity-option">
                <input type="checkbox" checked={amenitiesList.includes(item)}
                  onChange={() => handleCheckbox(item)} />
                <span className="amenity-checkmark" />{item}
              </label>
            ))}
            <div className="amenity-other">
              <label className="amenity-option">
                <input type="checkbox" checked={data.amenities_other_checked || false}
                  onChange={() => onAmenitiesChange(amenitiesList, !data.amenities_other_checked)} />
                <span className="amenity-checkmark" />Other
              </label>
              {data.amenities_other_checked && (
                <input type="text" className="amenity-other-input" name="amenities_other"
                  value={data.amenities_other || ''} onChange={onChange} placeholder="e.g. Internet, Parking" />
              )}
            </div>
          </div>
        </div>
        {!isFlat && (
          <>
            <div className="input-block span-2">
              <label>Rented House Address</label>
              <textarea name="rented_house_address" value={data.rented_house_address || ''}
                onChange={onChange} rows={3} placeholder="Full address of the house being rented out" required />
            </div>
            <div className="input-block span-2">
              <label>Building TC No <span className="optional-tag">(Optional)</span></label>
              <input type="text" name="building_tc_no" value={data.building_tc_no || ''}
                onChange={onChange} placeholder="e.g. TC 12/3456-1" />
            </div>
            <div className="input-block">
              <label>Contact Number</label>
              <input type="tel" name="tenant_mobile" value={data.tenant_mobile || ''}
                onChange={onChange} maxLength={10} placeholder="e.g. 9876543210" required />
            </div>
          </>
        )}
        <div className="input-block">
          <label>Stamp Paper Amount</label>
          <select name="stamp_paper_amount" value={data?.stamp_paper_amount || ''} onChange={onChange} required>
            <option value="" disabled>Select amount</option>
            <option value="500">Rs. 500 (Recommended)</option>
            <option value="200">Rs. 200</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ── Step 5 (flat): Flat Details ───────────────────────────────
export function StepFlatDetails({ data, onChange }) {
  return (
    <div className="page-step active">
      <div className="step-heading">Flat Details
        <p className="step-subheading">Specific details about the flat — unit number, floor, type, area, and occupants</p>
      </div>
      <div className="form-grid">
        <div className="input-block">
          <label>Flat No</label>
          <input type="text" name="flat_no" value={data.flat_no || ''}
            onChange={onChange} placeholder="e.g. 3B" required />
        </div>
        <div className="input-block">
          <label>Floor No</label>
          <input type="text" name="floor_no" value={data.floor_no || ''}
            onChange={onChange} placeholder="e.g. 3rd" required />
        </div>
        <div className="input-block">
          <label>Tower / Block <span className="optional-tag">(Optional)</span></label>
          <input type="text" name="tower_no" value={data.tower_no || ''}
            onChange={onChange} placeholder="e.g. Tower A" />
        </div>
        <div className="input-block">
          <label>BHK Type</label>
          <input type="text" name="bhk" value={data.bhk || ''}
            onChange={onChange} placeholder="e.g. 2BHK" required />
        </div>
        <div className="input-block">
          <label>Area (sq.ft.)</label>
          <input type="text" name="area" value={data.area || ''}
            onChange={onChange} placeholder="e.g. 1050 sq.ft." required />
        </div>
        <div className="input-block">
          <label>Occupants</label>
          <input type="text" name="occupants"
            value={data.occupants || (data.tenant_name ? `${data.tenant_name} and family` : '')}
            onChange={onChange} placeholder="e.g. Amit Kumar and family" required />
        </div>
        <div className="input-block span-2">
          <label>Apartment / Flat Name</label>
          <input type="text" name="flat_name" value={data.flat_name || ''}
            onChange={onChange} placeholder="e.g. Sunrise Apartments" required />
        </div>
        <div className="input-block span-2">
          <label>Flat Address</label>
          <textarea name="flat_address" value={data.flat_address || ''}
            onChange={onChange} rows={3} placeholder="Full address of the flat" required />
        </div>
        <div className="input-block">
          <label>Contact Number</label>
          <input type="tel" name="tenant_mobile" value={data.tenant_mobile || ''}
            onChange={onChange} maxLength={10} placeholder="e.g. 9876543210" required />
        </div>
      </div>
    </div>
  )
}

// ── Step 6 (flat): Bank & Terms ───────────────────────────────
export function StepBankTerms({ data, onChange }) {
  return (
    <div className="page-step active">
      <div className="step-heading">Bank Details & Terms
        <p className="step-subheading">Owner's bank account for rent transfer and renewal terms</p>
      </div>
      <div className="form-grid">
        <div className="input-block span-2">
          <label>Account Holder Name</label>
          <input type="text" name="account_name" value={data.account_name || ''}
            onChange={onChange} placeholder="Name on bank account" required />
        </div>
        <div className="input-block">
          <label>Account Number</label>
          <input type="text" name="account_no" value={data.account_no || ''}
            onChange={onChange} placeholder="e.g. XXXX XXXX 4821" required />
        </div>
        <div className="input-block">
          <label>IFSC Code</label>
          <input type="text" name="bank_ifsc" value={data.bank_ifsc || ''}
            onChange={onChange} placeholder="e.g. HDFC0001234" required />
        </div>
        <div className="input-block">
          <label>Bank Name</label>
          <input type="text" name="bank_name" value={data.bank_name || ''}
            onChange={onChange} placeholder="e.g. HDFC Bank" required />
        </div>
        <div className="input-block">
          <label>Branch Name</label>
          <input type="text" name="branch_name" value={data.branch_name || ''}
            onChange={onChange} placeholder="e.g. Koramangala Branch" required />
        </div>
      </div>
    </div>
  )
}

// ── Step N: Review ────────────────────────────────────────────
export function StepPreview({ data, format, declared, onDeclaredChange, isEdit }) {
  const isFlat = format === 'english-flat'
  const fmtC = (v) => v ? '₹' + Number(v).toLocaleString('en-IN') : '—'
  const fmtD = (v) => {
    if (!v) return '—'
    return new Date(v + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  const amenitiesFinal = [
    ...(data.amenities_list || []),
    ...(data.amenities_other_checked && data.amenities_other ? [data.amenities_other] : []),
  ].join(', ')

  return (
    <div className="page-step active">
      <div className="step-heading">
        Review & Confirm
        <p className="step-subheading">Verify every detail carefully — these will be printed in the agreement exactly as shown</p>
      </div>
      <div className="preview-container">
        <div className="party-preview-grid">
          <div className="party-card landlord-card">
            <div className="party-role-tag">Owner / Lessor</div>
            <div className="party-name">{data.owner_name || '—'}</div>
            {isFlat ? (
              <><div className="preview-label">Relation</div>
                <div className="preview-val" style={{ marginBottom: 12 }}>{data.owner_co || '—'}</div></>
            ) : (
              <><div className="preview-label">Aadhaar No</div>
                <div className="preview-val" style={{ marginBottom: 12 }}>{data.owner_aadhaar || 'Not Provided'}</div></>
            )}
            <div className="preview-label">Address</div>
            <div className="party-address-box">{data.owner_address || '—'}</div>
          </div>
          <div className="party-card tenant-card">
            <div className="party-role-tag">Tenant / Lessee</div>
            <div className="party-name">{data.tenant_name || '—'}</div>
            {isFlat ? (
              <><div className="preview-label">Relation</div>
                <div className="preview-val" style={{ marginBottom: 12 }}>{data.tenant_co || '—'}</div></>
            ) : (
              <><div className="preview-label">Aadhaar No</div>
                <div className="preview-val" style={{ marginBottom: 12 }}>{data.tenant_aadhaar || 'Not Provided'}</div></>
            )}
            <div className="preview-label">Address</div>
            <div className="party-address-box">{data.tenant_address || '—'}</div>
          </div>
        </div>

        {data.tenant_mobile && (
          <div className="preview-contact-row">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span className="preview-contact-label">Contact</span>
            <span className="preview-contact-val">{data.tenant_mobile}</span>
          </div>
        )}

        <div className="preview-section-title">Rent & Agreement Terms</div>
        <div className="preview-details-board">
          <div className="preview-item">
            <div className="preview-label">Start Date</div>
            <div className="preview-val">{fmtD(data.agreement_date)}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">End Date</div>
            <div className="preview-val">{isFlat ? fmtD(data.agreement_end_date) : (data.duration ? `After ${data.duration} Months` : '—')}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Rent Period</div>
            <div className="preview-val">{data.duration ? `${data.duration} Months` : '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Monthly Rent</div>
            <div className="preview-val">{fmtC(data.rent)}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Security Deposit</div>
            <div className="preview-val">{fmtC(data.advance_amt)}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Notice Period</div>
            <div className="preview-val">{data.notice_period ? `${data.notice_period} Days` : '—'}</div>
          </div>
          <div className="preview-item">
            <div className="preview-label">Rent Purpose</div>
            <div className="preview-val">{data.rent_purpose || '—'}</div>
          </div>
          {!isFlat && (
            <>
              <div className="preview-item">
                <div className="preview-label">Building Type</div>
                <div className="preview-val">{data.building_type || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Rent Due On</div>
                <div className="preview-val">{data.day_of_rent ? `${data.day_of_rent} of month` : '—'}</div>
              </div>
            </>
          )}
          {isFlat && (
            <>
              <div className="preview-item">
                <div className="preview-label">Rent Increase</div>
                <div className="preview-val">{data.r_p_increase || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Increase After</div>
                <div className="preview-val">{data.i_period || '—'}</div>
              </div>
            </>
          )}
          <div className="preview-item">
            <div className="preview-label">Amenities</div>
            <div className="preview-val">{amenitiesFinal || 'None'}</div>
          </div>
        </div>

        <div className="preview-section-title">Property Details</div>
        <div className="preview-details-board">
          {isFlat ? (
            <>
              <div className="preview-item">
                <div className="preview-label">Flat No</div>
                <div className="preview-val">{data.flat_no || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Floor</div>
                <div className="preview-val">{data.floor_no || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Tower / Block</div>
                <div className="preview-val">{data.tower_no || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">BHK Type</div>
                <div className="preview-val">{data.bhk || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Area</div>
                <div className="preview-val">{data.area || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Occupants</div>
                <div className="preview-val">{data.occupants || (data.tenant_name ? `${data.tenant_name} and family` : '—')}</div>
              </div>
              <div className="preview-item full-span">
                <div>
                  <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Apartment / Flat Name</div>
                  <div className="preview-val" style={{ marginTop: 4 }}>{data.flat_name || '—'}</div>
                </div>
                <div>
                  <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Flat Address</div>
                  <div className="preview-val" style={{ marginTop: 4 }}>{data.flat_address || '—'}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="preview-item full-span">
              <div>
                <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Rented House Address</div>
                <div className="preview-val" style={{ marginTop: 4 }}>{data.rented_house_address || '—'}</div>
              </div>
              <div>
                <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Building TC No</div>
                <div className="preview-val" style={{ marginTop: 4 }}>{data.building_tc_no || '—'}</div>
              </div>
            </div>
          )}
        </div>

        {isFlat && (
          <>
            <div className="preview-section-title">Bank Details</div>
            <div className="preview-details-board">
              <div className="preview-item">
                <div className="preview-label">Account Holder</div>
                <div className="preview-val">{data.account_name || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Account No</div>
                <div className="preview-val">{data.account_no || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">IFSC Code</div>
                <div className="preview-val">{data.bank_ifsc || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Bank Name</div>
                <div className="preview-val">{data.bank_name || '—'}</div>
              </div>
              <div className="preview-item">
                <div className="preview-label">Branch</div>
                <div className="preview-val">{data.branch_name || '—'}</div>
              </div>
            </div>
          </>
        )}

        {data?.stamp_paper_amount && (
          <div className="preview-stamppaper-banner">
            <div className="preview-stamppaper-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="preview-stamppaper-content">
              <div className="preview-stamppaper-title">Stamp Paper Required</div>
              <div className="preview-stamppaper-sub">Purchase before getting the agreement printed</div>
            </div>
            <div className="preview-stamppaper-amount">Rs. {data.stamp_paper_amount}</div>
          </div>
        )}

        <label className={`preview-declaration ${declared ? 'preview-declaration--checked' : ''}`}>
          <input type="checkbox" checked={declared} onChange={(e) => onDeclaredChange(e.target.checked)} />
          <span className="amenity-checkmark" />
          <span className="preview-declaration-text">
            {isEdit
              ? 'I confirm that the updated details above are correct and want to save the changes.'
              : <>I confirm that all the details entered above are correct. I understand that once submitted, these details will be printed in the agreement and <strong>cannot be changed</strong>.</>
            }
          </span>
        </label>
      </div>
    </div>
  )
}

// ── Format configs ────────────────────────────────────────────
export const FORMAT_CONFIGS = {
  'english-standard': {
    templateUrl: mainTemplateUrl,
    steps: [
      { id: 1, label: 'Owner Details' },
      { id: 2, label: 'Tenant Details' },
      { id: 3, label: 'Rent & Security' },
      { id: 4, label: 'House & Dates' },
      { id: 5, label: 'Review' },
    ],
    defaultData: getDefaultData('english-standard'),
  },
  'english-standard-classic': {
    templateUrl: defaultTemplateUrl,
    steps: [
      { id: 1, label: 'Owner Details' },
      { id: 2, label: 'Tenant Details' },
      { id: 3, label: 'Rent & Security' },
      { id: 4, label: 'House & Dates' },
      { id: 5, label: 'Review' },
    ],
    defaultData: getDefaultData('english-standard-classic'),
  },
  'english-flat': {
    templateUrl: flatTemplateUrl,
    steps: [
      { id: 1, label: 'Owner Details' },
      { id: 2, label: 'Tenant Details' },
      { id: 3, label: 'Rent & Security' },
      { id: 4, label: 'Dates & Purpose' },
      { id: 5, label: 'Flat Details' },
      { id: 6, label: 'Bank & Terms' },
      { id: 7, label: 'Review' },
    ],
    defaultData: getDefaultData('english-flat'),
  },
}
