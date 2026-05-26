// ── Number to Words (Indian system) ───────────────────────────
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
  'Seventeen','Eighteen','Nineteen']
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']

export function numToWords(n) {
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
  if (n >= 10000000) { result += belowThousand(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000 }
  if (n >= 100000)   { result += belowThousand(Math.floor(n / 100000))   + ' Lakh ';  n %= 100000   }
  if (n >= 1000)     { result += belowThousand(Math.floor(n / 1000))     + ' Thousand '; n %= 1000  }
  if (n > 0) result += belowThousand(n)

  return 'Rupees ' + result.trim() + ' Only'
}

// ── Generate Order ID ─────────────────────────────────────────
export function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `DIT-${date}-${rand}`
}

// ── Format currency ───────────────────────────────────────────
export function formatCurrency(val) {
  return val ? '₹' + Number(val).toLocaleString('en-IN') : '—'
}

// ── Format date string ────────────────────────────────────────
export function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ── Generate docx blob from data ──────────────────────────────
export async function generateDocxBlob(formData, templateUrl, Docxtemplater, PizZip) {
  const response = await fetch(templateUrl)
  const arrayBuffer = await response.arrayBuffer()
  const zip = new PizZip(arrayBuffer)

  const duration = formData.duration
  const rentPeriod = duration ? `${duration} ${Number(duration) === 1 ? 'Month' : 'Months'}` : ''

  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

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
    amenities: formData.amenities,
    duration: String(formData.duration),
    notice_period: String(formData.notice_period),
    building_tc_no: formData.building_tc_no || '',
  })

  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}
