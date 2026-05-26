import { useLocation, useNavigate } from 'react-router-dom'
import { saveAs } from 'file-saver'
import logo from '../assets/images/Logo.png'
import '../App.css'

export default function Success() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const tenantName = state?.tenantName || 'the tenant'
  const orderId = state?.orderId
  const fileData = state?.fileData
  const fileName = state?.fileName || 'Rental_Agreement.docx'

  const handleDownload = () => {
    if (!fileData) return
    // Convert base64 data URL back to blob
    fetch(fileData)
      .then((res) => res.blob())
      .then((blob) => saveAs(blob, fileName))
  }

  return (
    <>
      <header className="site-header">
        <a href="/" className="brand-logo">
          <img src={logo} alt="Ditto" className="brand-logo-img" />
        </a>
        <ul className="nav-links">
          <li><a href="/" className="active">Agreement Dashboard</a></li>
          <li><a href="#">Templates Directory</a></li>
          <li><a href="#">Cloud Sync Backup</a></li>
          <li><a href="#">Shop Settings</a></li>
        </ul>
        <a href="#" className="header-cta">Version 0.1</a>
      </header>

      <div className="success-page">
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

          <button className="btn-action btn-submit" onClick={handleDownload}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Agreement
          </button>

          <button
            className="btn-action btn-back"
            style={{ marginTop: 4 }}
            onClick={() => navigate('/')}
          >
            Create New Agreement
          </button>
        </div>
      </div>
    </>
  )
}
