import { useState } from 'react'

export default function StampaperInfo({ ownerName, ownerAddress, tenantName, tenantAddress, tenantMobile, stampPaperAmount }) {
  const [copied, setCopied] = useState(false)

  const stamppaperText = `FOR STAMPPAPER${stampPaperAmount ? `\nRs.${stampPaperAmount}` : ''}

FIRST PARTY (OWNER)
${ownerName || '—'}
${ownerAddress || '—'}

SECOND PARTY (TENANT)
${tenantName || '—'}
${tenantAddress || '—'}${tenantMobile ? `\nContact: ${tenantMobile}` : ''}`

  const handleCopy = () => {
    navigator.clipboard.writeText(stamppaperText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="stampaper-info-section">
      <div className="stampaper-header">
        <h3>Stampaper Info</h3>
        <button className="btn-copy" onClick={handleCopy} title="Copy to clipboard">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="stampaper-content">
        <pre>{stamppaperText}</pre>
      </div>
    </div>
  )
}
