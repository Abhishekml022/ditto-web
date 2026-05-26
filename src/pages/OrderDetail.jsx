import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import { db } from '../firebase'
import templateUrl from '../assets/templates/EnglishDefault.docx?url'
import Header from '../components/Header'
import { formatCurrency, formatDate, generateDocxBlob } from '../utils'
import '../App.css'

const RENT_DAYS = [
  '1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th',
  '11th','12th','13th','14th','15th','16th','17th','18th','19th','20th',
  '21st','22nd','23rd','24th','25th','26th','27th','28th','29th','30th','31st',
]
const AMENITY_OPTIONS = ['Electricity', 'Water', 'Gas Line']

// ── Read-only Preview ─────────────────────────────────────────
function OrderPreview({ data }) {
  return (
    <div className="preview-container">
      <div className="party-preview-grid">
        <div className="party-card landlord-card">
          <div className="party-role-tag">Owner / First Party</div>
          <div className="party-name">{data.owner_name || '—'}</div>
          <div className="preview-label">Aadhaar No</div>
          <div className="preview-val" style={{ marginBottom: 12 }}>{data.owner_aadhaar || 'Not Provided'}</div>
          <div className="preview-label">Address</div>
          <div className="party-address-box">{data.owner_address || '—'}</div>
        </div>
        <div className="party-card tenant-card">
          <div className="party-role-tag">Tenant / Second Party</div>
          <div className="party-name">{data.tenant_name || '—'}</div>
          <div className="preview-label">Aadhaar No</div>
          <div className="preview-val" style={{ marginBottom: 12 }}>{data.tenant_aadhaar || 'Not Provided'}</div>
          <div className="preview-label">Address</div>
          <div className="party-address-box">{data.tenant_address || '—'}</div>
        </div>
      </div>

      <div className="preview-details-board">
        <div className="preview-item">
          <div className="preview-label">Agreement Date</div>
          <div className="preview-val">{formatDate(data.agreement_date)}</div>
        </div>
        <div className="preview-item">
          <div className="preview-label">Rent Period</div>
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
          <div className="preview-label">Rent Due On</div>
          <div className="preview-val">{data.day_of_rent ? `${data.day_of_rent} of month` : '—'}</div>
        </div>
        <div className="preview-item">
          <div className="preview-label">Notice Period</div>
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
          <div className="preview-label">Amenities</div>
          <div className="preview-val">{data.amenities || '—'}</div>
        </div>
        <div className="preview-item full-span">
          <div>
            <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Rented House Address</div>
            <div className="preview-val" style={{ marginTop: 4, lineHeight: 1.4 }}>{data.rented_house_address || '—'}</div>
          </div>
          <div>
            <div className="preview-label" style={{ color: 'var(--brand-primary)' }}>Building TC No</div>
            <div className="preview-val" style={{ marginTop: 4, lineHeight: 1.4 }}>{data.building_tc_no || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Edit Form ─────────────────────────────────────────────────
function EditForm({ data, onChange, onAmenitiesChange }) {
  const amenitiesList = data.amenities_list || []
  const otherChecked = data.amenities_other_checked || false

  const handleCheckbox = (item) => {
    const updated = amenitiesList.includes(item)
      ? amenitiesList.filter((a) => a !== item)
      : [...amenitiesList, item]
    onAmenitiesChange(updated, otherChecked)
  }

  return (
    <div className="form-grid" style={{ marginTop: 8 }}>
      {/* Owner */}
      <div className="input-block">
        <label>Owner Name</label>
        <input type="text" name="owner_name" value={data.owner_name || ''} onChange={onChange} required />
      </div>
      <div className="input-block">
        <label>Owner Aadhaar <span className="optional-tag">(Optional)</span></label>
        <input type="text" name="owner_aadhaar" value={data.owner_aadhaar || ''} onChange={onChange} maxLength={14} />
      </div>
      <div className="input-block span-2">
        <label>Owner Address</label>
        <textarea name="owner_address" value={data.owner_address || ''} onChange={onChange} rows={2} required />
      </div>

      {/* Tenant */}
      <div className="input-block">
        <label>Tenant Name</label>
        <input type="text" name="tenant_name" value={data.tenant_name || ''} onChange={onChange} required />
      </div>
      <div className="input-block">
        <label>Tenant Aadhaar <span className="optional-tag">(Optional)</span></label>
        <input type="text" name="tenant_aadhaar" value={data.tenant_aadhaar || ''} onChange={onChange} maxLength={14} />
      </div>
      <div className="input-block span-2">
        <label>Tenant Address</label>
        <textarea name="tenant_address" value={data.tenant_address || ''} onChange={onChange} rows={2} required />
      </div>

      {/* Rent */}
      <div className="input-block">
        <label>Monthly Rent (₹)</label>
        <input type="number" name="rent" value={data.rent || ''} onChange={onChange} className="no-arrows" required />
      </div>
      <div className="input-block">
        <label>Security Deposit (₹)</label>
        <input type="number" name="advance_amt" value={data.advance_amt || ''} onChange={onChange} className="no-arrows" required />
      </div>
      <div className="input-block">
        <label>Rent Due On</label>
        <select name="day_of_rent" value={data.day_of_rent || '5th'} onChange={onChange}>
          {RENT_DAYS.map((d) => <option key={d} value={d}>{d} day of month</option>)}
        </select>
      </div>
      <div className="input-block">
        <label>Notice Period (Days)</label>
        <input type="number" name="notice_period" value={data.notice_period || ''} onChange={onChange} required />
      </div>

      {/* House */}
      <div className="input-block">
        <label>Agreement Start Date</label>
        <input type="date" name="agreement_date" value={data.agreement_date || ''} onChange={onChange} required />
      </div>
      <div className="input-block">
        <label>Rent Period (Months)</label>
        <input type="number" name="duration" value={data.duration || ''} onChange={onChange} required />
      </div>
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
        <input type="text" name="rent_purpose" value={data.rent_purpose || ''} onChange={onChange} required />
      </div>

      {/* Amenities */}
      <div className="input-block span-2">
        <label>Chargeable Amenities <span className="optional-tag">payable by tenant</span></label>
        <div className="amenities-checklist">
          {AMENITY_OPTIONS.map((item) => (
            <label key={item} className="amenity-option">
              <input type="checkbox" checked={amenitiesList.includes(item)} onChange={() => handleCheckbox(item)} />
              <span className="amenity-checkmark" />
              {item}
            </label>
          ))}
          <div className="amenity-other">
            <label className="amenity-option">
              <input type="checkbox" checked={otherChecked} onChange={() => onAmenitiesChange(amenitiesList, !otherChecked)} />
              <span className="amenity-checkmark" />
              Other
            </label>
            {otherChecked && (
              <input
                type="text"
                className="amenity-other-input"
                name="amenities_other"
                value={data.amenities_other || ''}
                onChange={onChange}
                placeholder="e.g. Internet, Parking"
              />
            )}
          </div>
        </div>
      </div>

      <div className="input-block span-2">
        <label>Rented House Address</label>
        <textarea name="rented_house_address" value={data.rented_house_address || ''} onChange={onChange} rows={2} required />
      </div>
      <div className="input-block span-2">
        <label>Building TC No</label>
        <input type="text" name="building_tc_no" value={data.building_tc_no || ''} onChange={onChange} />
      </div>
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
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, 'Agreements', id))
        if (!snap.exists()) { setError('Order not found.'); return }
        const data = snap.data()
        // Reconstruct amenities_list from the stored amenities string
        const knownAmenities = ['Electricity', 'Water', 'Gas Line']
        const amenitiesStr = data.amenities || ''
        const parts = amenitiesStr.split(',').map((s) => s.trim()).filter(Boolean)
        const amenities_list = parts.filter((p) => knownAmenities.includes(p))
        const otherParts = parts.filter((p) => !knownAmenities.includes(p))
        const amenities_other = otherParts.join(', ')
        const amenities_other_checked = otherParts.length > 0

        const enriched = { ...data, amenities_list, amenities_other, amenities_other_checked }
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
      amenities_other_checked: otherChecked,
      amenities_other: otherChecked ? prev.amenities_other : '',
    }))
  }

  const buildAmenitiesString = (data) => [
    ...(data.amenities_list || []),
    ...(data.amenities_other_checked && data.amenities_other ? [data.amenities_other] : []),
  ].join(', ')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const amenities = buildAmenitiesString(editData)
      const payload = {
        owner_name: editData.owner_name,
        owner_aadhaar: editData.owner_aadhaar || null,
        owner_address: editData.owner_address,
        tenant_name: editData.tenant_name,
        tenant_aadhaar: editData.tenant_aadhaar || null,
        tenant_address: editData.tenant_address,
        rent: Number(editData.rent),
        advance_amt: Number(editData.advance_amt),
        day_of_rent: editData.day_of_rent,
        notice_period: Number(editData.notice_period),
        agreement_date: editData.agreement_date,
        duration: Number(editData.duration),
        building_type: editData.building_type,
        rent_purpose: editData.rent_purpose,
        amenities,
        rented_house_address: editData.rented_house_address,
        building_tc_no: editData.building_tc_no || '',
      }
      await updateDoc(doc(db, 'Agreements', id), payload)
      const updated = { ...editData, amenities }
      setOrder(updated)
      setEditData(updated)
      setIsEditing(false)
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
      const blob = await generateDocxBlob(
        { ...order, amenities: buildAmenitiesString(order) },
        templateUrl, Docxtemplater, PizZip
      )
      saveAs(blob, `Rental_Agreement_${order.tenant_name}.docx`)
    } catch (err) {
      console.error(err)
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) return (
    <div className="orders-state" style={{ paddingTop: 160 }}>
      <div className="loader-spinner" style={{ margin: '0 auto' }} />
      <p>Loading order…</p>
    </div>
  )

  if (error) return (
    <div className="orders-state orders-state--error" style={{ paddingTop: 160 }}>
      <p>{error}</p>
    </div>
  )

  return (
    <>
      {/* Loader overlay for download */}
      {isDownloading && (
        <div className="loader-overlay">
          <div className="loader-box">
            <div className="loader-spinner" />
            <p className="loader-text">Generating document…</p>
          </div>
        </div>
      )}

      {/* Save success toast */}
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
        {/* Page header */}
        <div className="orders-header">
          <div>
            <button className="order-detail-back" onClick={() => navigate('/orders')}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              All Orders
            </button>
            <h2 style={{ marginTop: 8 }}>Order Details</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span className="order-badge">{order.order_id || '—'}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                {order.created_at
                  ? (order.created_at.toDate ? order.created_at.toDate() : new Date(order.created_at))
                      .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : ''}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {isEditing ? (
              <>
                <button className="btn-action btn-back" onClick={() => { setIsEditing(false); setEditData(order) }}>
                  Cancel
                </button>
                <button className="btn-action btn-submit" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button className="btn-action btn-back" onClick={() => setIsEditing(true)}>
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
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="ditto-card" style={{ marginBottom: 40 }}>
          <div className="form-workspace">
            {isEditing
              ? <EditForm data={editData} onChange={handleChange} onAmenitiesChange={handleAmenitiesChange} />
              : <OrderPreview data={order} />
            }
          </div>
        </div>
      </div>
    </>
  )
}
