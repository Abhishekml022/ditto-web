import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { saveAs } from 'file-saver'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import StampaperInfo from '../components/StampaperInfo'
import '../App.css'

export default function Success() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const formData = state?.formData
  const selectedFormat = state?.selectedFormat
  const isMalayalam = selectedFormat === 'malayalam-standard'

  const tenantName = (isMalayalam ? formData?.tenant_name_ml : null) || state?.tenantName || 'the tenant'
  const orderId = state?.orderId
  const fileData = state?.fileData
  const fileName = state?.fileName || 'Rental_Agreement.docx'
  const ownerName = state?.ownerName || ''
  const ownerAddress = state?.ownerAddress || ''
  const tenantAddress = state?.tenantAddress || ''
  const tenantMobile = state?.formData?.tenant_mobile || ''
  const stampPaperAmount = state?.formData?.stamp_paper_amount || '500'

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const handleDownload = () => {
    if (!fileData) return
    fetch(fileData)
      .then((res) => res.blob())
      .then((blob) => saveAs(blob, fileName))
  }

  const handleSaveDetails = async () => {
    if (!formData || !user) return
    setSaving(true)
    setSaveError(false)
    try {
      const name = [formData.owner_name, formData.tenant_name].filter(Boolean).join(' / ') || 'Saved Template'
      await addDoc(collection(db, 'saved_details'), {
        uid: user.uid,
        format: selectedFormat || 'english-standard',
        name,
        created_at: serverTimestamp(),
        ...formData,
      })
      setSaved(true)
    } catch (err) {
      console.error('Failed to save details:', err)
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header />

      {saved && (
        <div className="download-toast">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Details saved to Saved Orders
        </div>
      )}

      <div className="success-page">
        <div className="success-layout">

          {/* ── Left: Agreement card ── */}
          <div className="success-card">
            <div className="success-icon">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2>Agreement Ready</h2>
            <p>
              The rental agreement for <strong>{tenantName}</strong> has been
              generated successfully. Download it below.
            </p>

            {orderId && (
              <div className="order-id-box">
                <span className="order-id-label">Order ID</span>
                <span className="order-id-value">{orderId}</span>
              </div>
            )}

            <div className="success-actions">
              <button className="btn-action btn-submit" onClick={handleDownload}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Agreement
              </button>

              {formData && !saved && (
                <button className="btn-action btn-back" onClick={handleSaveDetails} disabled={saving}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                  {saving ? 'Saving…' : 'Save to Saved Orders'}
                </button>
              )}

              {saved && (
                <button className="btn-action btn-back" style={{ opacity: 0.6, cursor: 'default' }} disabled>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Saved to Orders
                </button>
              )}

              {saveError && (
                <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>Failed to save. Please try again.</p>
              )}

              <button className="btn-action btn-back" onClick={() => navigate('/')}>
                Create New Agreement
              </button>
            </div>
          </div>

          {/* ── Right: Stamp paper card ── */}
          {!isMalayalam && (ownerName || tenantName) && (
            <div className="success-stamppaper-card">
              <div className="success-stamppaper-header">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span>Stamp Paper Details</span>
                {stampPaperAmount && (
                  <span className="success-stamppaper-amt">Rs. {stampPaperAmount}</span>
                )}
              </div>
              <StampaperInfo
                ownerName={ownerName}
                ownerAddress={ownerAddress}
                tenantName={tenantName}
                tenantAddress={tenantAddress}
                tenantMobile={tenantMobile}
                stampPaperAmount={stampPaperAmount}
              />
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}
