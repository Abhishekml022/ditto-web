import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import { db } from '../firebase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import StampaperInfo from '../components/StampaperInfo'
import {
  StepOwner, StepTenant, StepRent, StepHouse,
  StepFlatDetails, StepBankTerms, StepPreview,
  FORMAT_CONFIGS,
} from '../components/AgreementFormSteps'
import {
  StepOwnerMl, StepTenantMl, StepRentMl, StepHouseMl, StepPreviewMl,
  ML_FORMAT_CONFIGS,
} from '../components/MalayalamFormSteps'
import { formatDate, numToWords, numToWordsMl, fmtDate, dateToWords, dateToWordsMlShortYear, addMonths } from '../utils'
import { FORMAT_SPECIFIC, getCommonFields, getSpecificFields } from '../config/formatFields'
import '../App.css'

const FORMAT_IDS = FORMAT_SPECIFIC
const ALL_CONFIGS = { ...FORMAT_CONFIGS, ...ML_FORMAT_CONFIGS }

const KNOWN_AMENITIES = ['Electricity', 'Water', 'Piped Gas', 'WiFi']
const AMENITY_ML_MAP = { Electricity: 'വൈദ്യുതി', Water: 'വെള്ളം', 'Piped Gas': 'പൈപ്പ് ഗ്യാസ്', WiFi: 'വൈഫൈ' }
const AMENITY_ML_TO_EN = Object.fromEntries(Object.entries(AMENITY_ML_MAP).map(([en, ml]) => [ml, en]))
const BUILDING_TYPE_ML_MAP = { House: 'വീട്', Building: 'കെട്ടിടം', Flat: 'ഫ്ലാറ്റ്' }

function buildAmenitiesString(data, isMalayalam) {
  if (isMalayalam) {
    return [
      ...(data.amenities_list || []).map((a) => AMENITY_ML_MAP[a] || a),
      ...(data.amenities_other_checked && data.amenities_other ? [data.amenities_other] : []),
    ].join(', ')
  }
  return [
    ...(data.amenities_list || []),
    ...(data.amenities_other_checked && data.amenities_other ? [data.amenities_other] : []),
  ].join(', ')
}

function enrichFromFirestore(data) {
  if (data.format === 'malayalam-standard') {
    // Reverse-map Malayalam amenities string to English checkbox values
    const parts = (data.amenities || '').split(',').map((s) => s.trim()).filter(Boolean)
    const amenities_list = parts.filter((p) => AMENITY_ML_TO_EN[p]).map((p) => AMENITY_ML_TO_EN[p])
    const otherParts = parts.filter((p) => !AMENITY_ML_TO_EN[p])
    return {
      ...data,
      // Restore _ml fields from the stored base values (base fields hold ML unicode after save)
      owner_name_ml:     data.owner_name_ml     || data.owner_name     || '',
      owner_address_ml:  data.owner_address_ml  || data.owner_address  || '',
      tenant_name_ml:    data.tenant_name_ml    || data.tenant_name    || '',
      tenant_address_ml: data.tenant_address_ml || data.tenant_address || '',
      rent_purpose_ml:   data.rent_purpose_ml   || data.rent_purpose   || '',
      r_jilla_ml:        data.r_jilla_ml        || data.r_jilla        || '',
      r_village_ml:      data.r_village_ml      || data.r_village      || '',
      house_name_ml:     data.house_name_ml     || data.house_name     || '',
      rented_floor_ml:   data.rented_floor_ml   || data.rented_floor   || '',
      building_type_ml:  data.building_type_ml  || BUILDING_TYPE_ML_MAP[data.building_type] || '',
      amenities_list,
      amenities_other: otherParts.join(', '),
      amenities_other_checked: otherParts.length > 0,
    }
  }
  const parts = (data.amenities || '').split(',').map((s) => s.trim()).filter(Boolean)
  const amenities_list = parts.filter((p) => KNOWN_AMENITIES.includes(p))
  const otherParts = parts.filter((p) => !KNOWN_AMENITIES.includes(p))
  return {
    ...data,
    amenities_list,
    amenities_other: otherParts.join(', '),
    amenities_other_checked: otherParts.length > 0,
  }
}

function IconLeft() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}
function IconRight() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

// ── Read-only view ────────────────────────────────────────────
function OrderPreview({ data }) {
  const isFlat = data.format === 'english-flat'
  const isMalayalam = data.format === 'malayalam-standard'
  const fmtC = (v) => v ? '₹' + Number(v).toLocaleString('en-IN') : '—'
  const fmtD = (v) => formatDate(v)
  return (
    <div className="preview-container">
      <div className="party-preview-grid">
        <div className="party-card landlord-card">
          <div className="party-role-tag">
            Owner / Lessor{isMalayalam && <span className="ml-text"> / ഉടമസ്ഥൻ</span>}
          </div>
          <div className={`party-name${isMalayalam ? ' ml-text' : ''}`}>{data.owner_name || '—'}</div>
          {isFlat
            ? <><div className="preview-label">Relation</div><div className="preview-val" style={{ marginBottom: 12 }}>{data.owner_co || '—'}</div></>
            : <><div className="preview-label">Aadhaar No</div><div className="preview-val" style={{ marginBottom: 12 }}>{data.owner_aadhaar || 'Not Provided'}</div></>
          }
          <div className="preview-label">Address</div>
          <div className={`party-address-box${isMalayalam ? ' ml-text' : ''}`}>{data.owner_address || '—'}</div>
        </div>
        <div className="party-card tenant-card">
          <div className="party-role-tag">
            Tenant / Lessee{isMalayalam && <span className="ml-text"> / വാടകക്കാരൻ</span>}
          </div>
          <div className={`party-name${isMalayalam ? ' ml-text' : ''}`}>{data.tenant_name || '—'}</div>
          {isFlat
            ? <><div className="preview-label">Relation</div><div className="preview-val" style={{ marginBottom: 12 }}>{data.tenant_co || '—'}</div></>
            : <><div className="preview-label">Aadhaar No</div><div className="preview-val" style={{ marginBottom: 12 }}>{data.tenant_aadhaar || 'Not Provided'}</div></>
          }
          <div className="preview-label">Address</div>
          <div className={`party-address-box${isMalayalam ? ' ml-text' : ''}`}>{data.tenant_address || '—'}</div>
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
        <div className="preview-item"><div className="preview-label">Start Date</div><div className="preview-val">{fmtD(data.agreement_date)}</div></div>
        {isFlat && <div className="preview-item"><div className="preview-label">End Date</div><div className="preview-val">{fmtD(data.agreement_end_date)}</div></div>}
        <div className="preview-item"><div className="preview-label">Rent Period</div><div className="preview-val">{data.duration ? `${data.duration} Months` : '—'}</div></div>
        <div className="preview-item"><div className="preview-label">Monthly Rent</div><div className="preview-val">{fmtC(data.rent)}</div></div>
        <div className="preview-item"><div className="preview-label">Security Deposit</div><div className="preview-val">{fmtC(data.advance_amt)}</div></div>
        <div className="preview-item"><div className="preview-label">Notice Period</div><div className="preview-val">{data.notice_period ? `${data.notice_period} Days` : '—'}</div></div>
        <div className="preview-item">
          <div className="preview-label">Rent Purpose{isMalayalam && <span className="ml-text"> / ഉദ്ദേശ്യം</span>}</div>
          <div className={`preview-val${isMalayalam ? ' ml-text' : ''}`}>{data.rent_purpose || '—'}</div>
        </div>
        {!isFlat && (
          <>
            <div className="preview-item">
              <div className="preview-label">Building Type{isMalayalam && <span className="ml-text"> / കെട്ടിടം</span>}</div>
              <div className="preview-val">{data.building_type || '—'}</div>
            </div>
            <div className="preview-item"><div className="preview-label">Rent Due On</div><div className="preview-val">{data.day_of_rent ? `${data.day_of_rent} of month` : '—'}</div></div>
          </>
        )}
        {isFlat && <>
          <div className="preview-item"><div className="preview-label">Rent Increase</div><div className="preview-val">{data.r_p_increase || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">Increase After</div><div className="preview-val">{data.i_period || '—'}</div></div>
        </>}
        <div className="preview-item">
          <div className="preview-label">Amenities{isMalayalam && <span className="ml-text"> / സൗകര്യങ്ങൾ</span>}</div>
          <div className={`preview-val${isMalayalam ? ' ml-text' : ''}`}>{data.amenities || '—'}</div>
        </div>
      </div>

      <div className="preview-section-title">Property Details</div>
      <div className="preview-details-board">
        {isFlat ? <>
          <div className="preview-item"><div className="preview-label">Flat No</div><div className="preview-val">{data.flat_no || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">Floor</div><div className="preview-val">{data.floor_no || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">Tower / Block</div><div className="preview-val">{data.tower_no || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">BHK Type</div><div className="preview-val">{data.bhk || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">Area</div><div className="preview-val">{data.area || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">Occupants</div><div className="preview-val">{data.occupants || '—'}</div></div>
          <div className="preview-item full-span">
            <div><div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Apartment / Flat Name</div><div className="preview-val" style={{ marginTop: 4 }}>{data.flat_name || '—'}</div></div>
            <div><div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Flat Address</div><div className="preview-val" style={{ marginTop: 4 }}>{data.flat_address || '—'}</div></div>
          </div>
        </> : isMalayalam ? (
          <div className="preview-item full-span">
            <div>
              <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>District / ജില്ല</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>{data.r_jilla || '—'}</div>
            </div>
            <div>
              <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Village / ഗ്രാമം</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>{data.r_village || '—'}</div>
            </div>
            <div>
              <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>House Name / വീടിന്റെ പേര്</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>{data.house_name || '—'}</div>
            </div>
            <div>
              <div className="preview-label">No. of Floors / നിലകൾ</div>
              <div className="preview-val" style={{ marginTop: 4 }}>{data.no_of_floors || '—'}</div>
            </div>
            <div>
              <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Rented Floor / Portion</div>
              <div className="preview-val ml-text" style={{ marginTop: 4 }}>{data.rented_floor || '—'}</div>
            </div>
            <div>
              <div className="preview-label">Building TC No</div>
              <div className="preview-val" style={{ marginTop: 4 }}>{data.building_tc_no || '—'}</div>
            </div>
          </div>
        ) : (
          <div className="preview-item full-span">
            <div><div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Rented House Address</div><div className="preview-val" style={{ marginTop: 4 }}>{data.rented_house_address || '—'}</div></div>
            <div><div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Building TC No</div><div className="preview-val" style={{ marginTop: 4 }}>{data.building_tc_no || '—'}</div></div>
          </div>
        )}
      </div>

      {isFlat && <>
        <div className="preview-section-title">Bank Details</div>
        <div className="preview-details-board">
          <div className="preview-item"><div className="preview-label">Account Holder</div><div className="preview-val">{data.account_name || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">Account No</div><div className="preview-val">{data.account_no || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">IFSC Code</div><div className="preview-val">{data.bank_ifsc || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">Bank Name</div><div className="preview-val">{data.bank_name || '—'}</div></div>
          <div className="preview-item"><div className="preview-label">Branch</div><div className="preview-val">{data.branch_name || '—'}</div></div>
        </div>
      </>}

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
      {data.format !== 'malayalam-standard' && (
        <StampaperInfo ownerName={data.owner_name} ownerAddress={data.owner_address} tenantName={data.tenant_name} tenantAddress={data.tenant_address} tenantMobile={data.tenant_mobile} stampPaperAmount={data?.stamp_paper_amount} />
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [editData, setEditData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editStep, setEditStep] = useState(1)
  const [editDeclared, setEditDeclared] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const editFormRef = useRef(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, 'orders', id))
        if (!snap.exists()) { setError('Order not found.'); return }
        const enriched = enrichFromFirestore(snap.data())
        setOrder(enriched)
        setEditData(enriched)
      } catch (err) {
        console.error(err)
        setError('Failed to load order.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAmenitiesChange = (list, otherChecked) => {
    setEditData((prev) => ({
      ...prev,
      amenities_list: list,
      amenities_other_checked: otherChecked !== undefined ? otherChecked : prev.amenities_other_checked,
      amenities_other: otherChecked === false ? '' : prev.amenities_other,
    }))
  }

  const fmt = order?.format || 'english-standard'
  const isMalayalam = fmt === 'malayalam-standard'
  const config = ALL_CONFIGS[fmt] || FORMAT_CONFIGS['english-standard']
  const TOTAL_STEPS = config.steps.length

  const validateStep = () => {
    if (!editFormRef.current) return true
    const inputs = editFormRef.current.querySelectorAll('input[required], textarea[required], select[required]')
    for (const field of inputs) {
      if (!field.checkValidity()) { field.reportValidity(); return false }
    }
    return true
  }

  const goNext = () => { if (!validateStep()) return; setEditStep((s) => Math.min(s + 1, TOTAL_STEPS)) }
  const goBack = () => setEditStep((s) => Math.max(s - 1, 1))

  const startEdit = () => {
    setEditData(order)
    setEditStep(1)
    setEditDeclared(false)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditData(order)
    setEditStep(1)
    setEditDeclared(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const amenities = buildAmenitiesString(editData, isMalayalam)

      // Malayalam: store ML unicode under the standard field keys (mirrors new-form logic)
      const dbData = isMalayalam ? {
        ...editData,
        owner_name:     editData.owner_name_ml    || editData.owner_name,
        owner_address:  editData.owner_address_ml || editData.owner_address,
        tenant_name:    editData.tenant_name_ml   || editData.tenant_name,
        tenant_address: editData.tenant_address_ml || editData.tenant_address,
        rent_purpose:   editData.rent_purpose_ml  || editData.rent_purpose,
        r_jilla:        editData.r_jilla_ml       || editData.r_jilla,
        r_village:      editData.r_village_ml     || editData.r_village,
        house_name:     editData.house_name_ml    || editData.house_name,
        rented_floor:   editData.rented_floor_ml  || editData.rented_floor,
      } : editData

      await updateDoc(doc(db, 'orders', id), {
        amenities,
        ...getCommonFields(dbData),
        ...Object.fromEntries(
          Object.entries(getSpecificFields(fmt, dbData))
            .filter(([key]) => !key.endsWith('_ml'))
        ),
      })

      // Re-enrich saved data so read-only view and next edit are consistent
      const updated = enrichFromFirestore({ ...dbData, amenities, format: fmt })
      setOrder(updated)
      setEditData(updated)
      setIsEditing(false)
      setEditStep(1)
      setEditDeclared(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const tplUrl = ALL_CONFIGS[fmt]?.templateUrl
      const amenities = buildAmenitiesString(order, isMalayalam)
      const duration = order.duration
      const rentPeriod = duration ? `${duration} ${Number(duration) === 1 ? 'Month' : 'Months'}` : ''
      const endDate = order.agreement_end_date || addMonths(order.agreement_date, duration)

      const response = await fetch(tplUrl)
      const zip = new PizZip(await response.arrayBuffer())
      const docx = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

      if (isMalayalam) {
        docx.render({
          owner_name: order.owner_name,
          owner_address: order.owner_address,
          owner_aadhaar_number: order.owner_aadhaar ? `(ആധാർ നം: ${order.owner_aadhaar})` : '',
          tenant_name: order.tenant_name,
          tenant_address: order.tenant_address,
          tenant_aadhaar_number: order.tenant_aadhaar ? `(ആധാർ നം: ${order.tenant_aadhaar})` : '',
          r_jilla: order.r_jilla || '',
          r_village: order.r_village || '',
          house_name: order.house_name || '',
          no_of_floors: order.no_of_floors
            ? (String(order.no_of_floors) === '1' ? '1 നില' : `${order.no_of_floors} നിലകൾ`)
            : '',
          rented_floor: order.rented_floor || '',
          building_tc_no: order.building_tc_no || '',
          rented_house_address: [order.house_name, order.r_village].filter(Boolean).join(', '),
          building_type: order.building_type || '',
          rent_purpose: order.rent_purpose || '',
          agreement_date: fmtDate(order.agreement_date),
          s_date_words: dateToWordsMlShortYear(order.agreement_date),
          e_date_words: dateToWordsMlShortYear(endDate),
          agreement_edate: fmtDate(endDate),
          rent: Number(order.rent).toLocaleString('en-IN'),
          rent_words: numToWordsMl(order.rent),
          advance_amt: Number(order.advance_amt).toLocaleString('en-IN'),
          advance_word: numToWordsMl(order.advance_amt),
          day_of_rent: order.day_of_rent || '5th',
          rent_period: String(order.duration || ''),
          rent_period_words: numToWordsMl(order.duration).replace(' രൂപ മാത്രം', ''),
          duration: rentPeriod,
          notice_period: String(order.notice_period),
          amenities,
          owner_co: '', tenant_co: '', flat_no: '', floor_no: '', tower_no: '',
          flat_name: '', flat_address: '', bhk: '', area: '',
          occupants: `${order.tenant_name} and family`,
          account_name: '', account_no: '', bank_name: '', branch_name: '', bank_ifsc: '',
          r_p_increase: '', i_period: '',
        })
      } else {
        docx.render({
          agreement_date: fmtDate(order.agreement_date),
          owner_name: order.owner_name,
          owner_address: order.owner_address,
          owner_aadhaar_number: order.owner_aadhaar ? `(Aadhaar No: ${order.owner_aadhaar})` : '',
          tenant_name: order.tenant_name,
          tenant_address: order.tenant_address,
          tenant_aadhaar_number: order.tenant_aadhaar ? `(Aadhaar No: ${order.tenant_aadhaar})` : '',
          rented_house_address: order.rented_house_address || '',
          building_type: order.building_type || '',
          building_tc_no: order.building_tc_no || '',
          rent_purpose: order.rent_purpose,
          rent_period: rentPeriod,
          rent: Number(order.rent).toLocaleString('en-IN'),
          rent_words: numToWords(order.rent),
          day_of_rent: order.day_of_rent || '5th',
          advance_amt: Number(order.advance_amt).toLocaleString('en-IN'),
          advance_word: numToWords(order.advance_amt),
          amenities,
          duration: rentPeriod,
          notice_period: String(order.notice_period),
          s_date_words: dateToWords(order.agreement_date),
          e_date_words: dateToWords(endDate),
          agreement_edate: fmtDate(endDate),
          owner_co: order.owner_co || '',
          tenant_co: order.tenant_co || '',
          flat_no: order.flat_no || '',
          floor_no: order.floor_no || '',
          tower_no: order.tower_no || '',
          flat_name: order.flat_name || '',
          flat_address: order.flat_address || '',
          bhk: order.bhk || '',
          area: order.area || '',
          occupants: order.occupants || `${order.tenant_name} and family`,
          account_name: order.account_name || '',
          account_no: order.account_no || '',
          bank_name: order.bank_name || '',
          branch_name: order.branch_name || '',
          bank_ifsc: order.bank_ifsc || '',
          r_p_increase: order.r_p_increase || '',
          i_period: order.i_period || '',
        })
      }

      saveAs(
        docx.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        isMalayalam
          ? `VadakaKaraar_${order.owner_name}_${order.tenant_name}.docx`
          : `Rent_Agreement_${order.owner_name}_${order.tenant_name}.docx`
      )
    } catch (err) {
      console.error(err)
    } finally {
      setIsDownloading(false)
    }
  }

  // ── Render step for edit mode ──────────────────────────────────
  const renderEditStep = () => {
    if (isMalayalam) {
      switch (editStep) {
        case 1: return <StepOwnerMl data={editData} onChange={handleChange} />
        case 2: return <StepTenantMl data={editData} onChange={handleChange} />
        case 3: return <StepRentMl data={editData} onChange={handleChange} />
        case 4: return <StepHouseMl data={editData} onChange={handleChange} onAmenitiesChange={handleAmenitiesChange} />
        case 5: return <StepPreviewMl data={editData} declared={editDeclared} onDeclaredChange={setEditDeclared} isEdit />
        default: return null
      }
    }
    if (fmt === 'english-flat') {
      switch (editStep) {
        case 1: return <StepOwner data={editData} onChange={handleChange} format={fmt} />
        case 2: return <StepTenant data={editData} onChange={handleChange} format={fmt} />
        case 3: return <StepRent data={editData} onChange={handleChange} format={fmt} />
        case 4: return <StepHouse data={editData} onChange={handleChange} onAmenitiesChange={handleAmenitiesChange} format={fmt} />
        case 5: return <StepFlatDetails data={editData} onChange={handleChange} />
        case 6: return <StepBankTerms data={editData} onChange={handleChange} />
        case 7: return <StepPreview data={editData} format={fmt} declared={editDeclared} onDeclaredChange={setEditDeclared} isEdit />
        default: return null
      }
    }
    switch (editStep) {
      case 1: return <StepOwner data={editData} onChange={handleChange} format={fmt} />
      case 2: return <StepTenant data={editData} onChange={handleChange} format={fmt} />
      case 3: return <StepRent data={editData} onChange={handleChange} format={fmt} />
      case 4: return <StepHouse data={editData} onChange={handleChange} onAmenitiesChange={handleAmenitiesChange} format={fmt} />
      case 5: return <StepPreview data={editData} format={fmt} declared={editDeclared} onDeclaredChange={setEditDeclared} isEdit />
      default: return null
    }
  }

  if (loading) return (
    <><Header /><div className="orders-state" style={{ paddingTop: 160 }}>
      <div className="loader-spinner" style={{ margin: '0 auto' }} /><p>Loading order…</p>
    </div></>
  )
  if (error) return (
    <><Header /><div className="orders-state orders-state--error" style={{ paddingTop: 160 }}><p>{error}</p></div></>
  )

  const fmtInfo = FORMAT_IDS[fmt] || FORMAT_IDS['english-standard']

  return (
    <>
      {isDownloading && (
        <div className="loader-overlay">
          <div className="loader-box"><div className="loader-spinner" /><p className="loader-text">Generating document…</p></div>
        </div>
      )}
      {saveSuccess && (
        <div className="download-toast">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Changes saved successfully
        </div>
      )}

      <Header />

      <div className="orders-page">
        <div className="orders-header">
          <div>
            <button className="order-detail-back" onClick={isEditing ? cancelEdit : () => navigate('/orders')}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {isEditing ? 'Cancel Edit' : 'My Orders'}
            </button>
            <h2 style={{ marginTop: 8 }}>{isEditing ? 'Edit Order' : 'Order Details'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="order-badge">{order.order_id || '—'}</span>
              <span className="order-format-chip">{fmtInfo.displayId} · {fmtInfo.label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                {order.created_at
                  ? (order.created_at.toDate ? order.created_at.toDate() : new Date(order.created_at))
                      .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : ''}
              </span>
            </div>
          </div>
          {!isEditing && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-action btn-back" onClick={startEdit}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                Edit
              </button>
              <button className="btn-action btn-next" onClick={handleDownload}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
            </div>
          )}
        </div>

        <div className="ditto-card" style={{ marginBottom: 40 }}>
          {isEditing ? (
            <>
              <div className="progress-hud">
                {config.steps.map(({ id, label }) => {
                  const isActive = id === editStep
                  const isCompleted = id < editStep
                  let cls = 'hud-step'
                  if (isActive) cls += ' active'
                  if (isCompleted) cls += ' completed'
                  return (
                    <div key={id} className={cls}>
                      <div className="step-circle">{id}</div>
                      <div className="step-label">{label}</div>
                    </div>
                  )
                })}
              </div>
              <form ref={editFormRef}>
                <div className="form-workspace">
                  {renderEditStep()}
                  <div className="actions-footer">
                    {editStep > 1 && (
                      <button type="button" className="btn-action btn-back" onClick={goBack}>
                        <IconLeft />Back
                      </button>
                    )}
                    {editStep < TOTAL_STEPS ? (
                      <button type="button" className="btn-action btn-next" onClick={goNext}>
                        Next Step<IconRight />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`btn-action btn-submit${!editDeclared ? ' btn-disabled' : ''}`}
                        onClick={editDeclared ? handleSave : undefined}
                        disabled={!editDeclared || isSaving}
                      >
                        {isSaving ? 'Saving…' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="form-workspace">
              <OrderPreview data={order} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
