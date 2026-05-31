import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './context/AuthContext'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import './App.css'
import {
  StepOwner, StepTenant, StepRent, StepHouse, StepFlatDetails, StepBankTerms, StepPreview,
  FORMAT_CONFIGS,
} from './components/AgreementFormSteps'
import {
  StepOwnerMl, StepTenantMl, StepRentMl, StepHouseMl, StepPreviewMl,
  ML_FORMAT_CONFIGS,
} from './components/MalayalamFormSteps'
import { numToWords, numToWordsMl, fmtDate, dateToWords, dateToWordsMl, dateToWordsMlShortYear, addMonths, generateOrderId } from './utils'
import { getCommonFields, getSpecificFields, FORMAT_SPECIFIC } from './config/formatFields'

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

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const selectedFormat = location.state?.formatId || 'english-standard'
  const ALL_CONFIGS = { ...FORMAT_CONFIGS, ...ML_FORMAT_CONFIGS }
  const config = ALL_CONFIGS[selectedFormat] || FORMAT_CONFIGS['english-standard']
  const TOTAL_STEPS = config.steps.length

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [declared, setDeclared] = useState(false)
  const formRef = useRef(null)

  const prefillData = location.state?.prefillData
  const [formData, setFormData] = useState(
    prefillData ? { ...config.defaultData, ...prefillData } : config.defaultData
  )

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
    if (currentStep === TOTAL_STEPS) return true
    const inputs = formRef.current.querySelectorAll('input[required], textarea[required], select[required]')
    for (const field of inputs) {
      if (!field.checkValidity()) { field.reportValidity(); return false }
    }
    return true
  }

  const goNext = () => { if (!validateCurrentStep()) return; setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS)) }
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(config.templateUrl)
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)

      const amenitiesFinal = [
        ...formData.amenities_list,
        ...(formData.amenities_other_checked && formData.amenities_other ? [formData.amenities_other] : []),
      ].join(', ')

      const orderId = generateOrderId()
      const duration = formData.duration
      const rentPeriod = duration ? `${duration} ${Number(duration) === 1 ? 'Month' : 'Months'}` : ''
      const endDate = formData.agreement_end_date || addMonths(formData.agreement_date, duration)

      const isMalayalam = selectedFormat.startsWith('malayalam-')

      const AMENITY_ML_MAP = { Electricity: 'കറണ്ട് ചാർജ്ജ്', Water: 'വാട്ടർ ചാർജ്ജ്', 'Piped Gas': 'പൈപ്പ് ഗ്യാസ് ചാർജ്ജ്', WiFi: 'വൈഫൈ ചാർജ്ജ്' }
      const amenitiesFinalMl = isMalayalam
        ? [...formData.amenities_list.map((a) => AMENITY_ML_MAP[a] || a),
           ...(formData.amenities_other_checked && formData.amenities_other ? [formData.amenities_other] : [])].join(', ')
        : amenitiesFinal

      const BUILDING_TYPE_ML_MAP = { House: 'വീട്', Building: 'കെട്ടിടം', Flat: 'ഫ്ലാറ്റ്' }

      const templateVars = isMalayalam ? {
        // Text fields: use Malayalam unicode values (fall back to English if not set)
        owner_name: formData.owner_name_ml || formData.owner_name,
        owner_address: formData.owner_address_ml || formData.owner_address,
        owner_aadhaar_number: formData.owner_aadhaar ? `ആധാർ നമ്പർ: ${formData.owner_aadhaar}` : '',
        tenant_name: formData.tenant_name_ml || formData.tenant_name,
        tenant_address: formData.tenant_address_ml || formData.tenant_address,
        tenant_aadhaar_number: formData.tenant_aadhaar ? `ആധാർ നമ്പർ: ${formData.tenant_aadhaar}` : '',
        // Property fields — new Malayalam template keys
        r_jilla: formData.r_jilla_ml || formData.r_jilla || '',
        r_village: formData.r_village_ml || formData.r_village || '',
        house_name: formData.house_name_ml || formData.house_name || '',
        no_of_floors: formData.no_of_floors
          ? (String(formData.no_of_floors) === '1' ? '1 നില' : `${formData.no_of_floors} നിലകൾ`)
          : '',
        rented_floor: formData.rented_floor_ml || formData.rented_floor || '',
        building_tc_no: formData.building_tc_no || '',
        // Keep rented_house_address for any legacy placeholders
        rented_house_address: [
          formData.house_name_ml || formData.house_name,
          formData.r_village_ml || formData.r_village,
        ].filter(Boolean).join(', '),
        building_type: formData.building_type_ml || BUILDING_TYPE_ML_MAP[formData.building_type] || formData.building_type || '',
        rent_purpose: formData.rent_purpose_ml || formData.rent_purpose,
        // Dates in Malayalam — s_date_words uses short year (template already has "രണ്ടായിരത്തി")
        agreement_date: fmtDate(formData.agreement_date),
        s_date_words: dateToWordsMlShortYear(formData.agreement_date),
        e_date_words: dateToWordsMlShortYear(endDate),
        agreement_edate: fmtDate(endDate),
        // Amounts — numbers stay numeric, words in Malayalam
        rent: Number(formData.rent).toLocaleString('en-IN'),
        rent_words: numToWordsMl(formData.rent),
        advance_amt: Number(formData.advance_amt).toLocaleString('en-IN'),
        advance_word: numToWordsMl(formData.advance_amt),
        day_of_rent: formData.day_of_rent || '5th',
        // Rent period: numeric and in words
        rent_period: String(formData.duration || ''),
        rent_period_words: numToWordsMl(formData.duration).replace(' രൂപ മാത്രം', ''),
        duration: rentPeriod,
        notice_period: String(formData.notice_period),
        amenities: amenitiesFinalMl,
        // Flat fields (empty for standard format)
        owner_co: '', tenant_co: '', flat_no: '', floor_no: '', tower_no: '',
        flat_name: '', flat_address: '', bhk: '', area: '',
        occupants: `${formData.tenant_name_ml || formData.tenant_name} and family`,
        account_name: '', account_no: '', bank_name: '', branch_name: '', bank_ifsc: '',
        r_p_increase: '', i_period: '',
      } : {
        agreement_date: fmtDate(formData.agreement_date),
        owner_name: formData.owner_name,
        owner_address: formData.owner_address,
        owner_aadhaar_number: formData.owner_aadhaar ? `(Aadhaar No: ${formData.owner_aadhaar})` : '',
        tenant_name: formData.tenant_name,
        tenant_address: formData.tenant_address,
        tenant_aadhaar_number: formData.tenant_aadhaar ? `(Aadhaar No: ${formData.tenant_aadhaar})` : '',
        rented_house_address: formData.rented_house_address || '',
        building_type: formData.building_type || '',
        building_tc_no: formData.building_tc_no || '',
        rent_purpose: formData.rent_purpose,
        rent_period: rentPeriod,
        rent: Number(formData.rent).toLocaleString('en-IN'),
        rent_words: numToWords(formData.rent),
        day_of_rent: formData.day_of_rent || '5th',
        advance_amt: Number(formData.advance_amt).toLocaleString('en-IN'),
        advance_word: numToWords(formData.advance_amt),
        amenities: amenitiesFinal,
        duration: rentPeriod,
        notice_period: String(formData.notice_period),
        s_date_words: dateToWords(formData.agreement_date),
        e_date_words: dateToWords(endDate),
        agreement_edate: fmtDate(endDate),
        owner_co: formData.owner_co || '',
        tenant_co: formData.tenant_co || '',
        flat_no: formData.flat_no || '',
        floor_no: formData.floor_no || '',
        tower_no: formData.tower_no || '',
        flat_name: formData.flat_name || '',
        flat_address: formData.flat_address || '',
        bhk: formData.bhk || '',
        area: formData.area || '',
        occupants: formData.occupants || `${formData.tenant_name} and family`,
        account_name: formData.account_name || '',
        account_no: formData.account_no || '',
        bank_name: formData.bank_name || '',
        branch_name: formData.branch_name || '',
        bank_ifsc: formData.bank_ifsc || '',
        r_p_increase: formData.r_p_increase || '',
        i_period: formData.i_period || '',
      }

      // For Malayalam format, common text fields must store the Malayalam unicode
      // values (not English). Build a patched data object so getCommonFields picks
      // up the ML values under the standard keys — no _ml keys go to the DB.
      const dbData = isMalayalam ? {
        ...formData,
        owner_name:    formData.owner_name_ml    || formData.owner_name,
        owner_address: formData.owner_address_ml || formData.owner_address,
        tenant_name:   formData.tenant_name_ml   || formData.tenant_name,
        tenant_address: formData.tenant_address_ml || formData.tenant_address,
        rent_purpose:  formData.rent_purpose_ml  || formData.rent_purpose,
        r_jilla:       formData.r_jilla_ml       || formData.r_jilla,
        r_village:     formData.r_village_ml     || formData.r_village,
        house_name:    formData.house_name_ml    || formData.house_name,
        rented_floor:  formData.rented_floor_ml  || formData.rented_floor,
      } : formData

      await addDoc(collection(db, 'orders'), {
        order_id: orderId,
        format: selectedFormat,
        uid: user?.uid || null,
        created_at: serverTimestamp(),
        order_status: 0,
        amenities: isMalayalam ? amenitiesFinalMl : amenitiesFinal,
        ...getCommonFields(dbData),
        // For Malayalam, only write format-specific fields that are NOT _ml variants
        ...Object.fromEntries(
          Object.entries(getSpecificFields(selectedFormat, dbData))
            .filter(([key]) => !key.endsWith('_ml'))
        ),
      })

      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
      doc.render(templateVars)

      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      const reader = new FileReader()
      reader.onloadend = () => {
        setIsLoading(false)
        navigate('/success', {
          state: {
            tenantName: formData.tenant_name,
            tenantAddress: formData.tenant_address,
            ownerName: formData.owner_name,
            ownerAddress: formData.owner_address,
            orderId,
            fileData: reader.result,
            fileName: isMalayalam
              ? `VadakaKaraar_${formData.owner_name}_${formData.tenant_name}.docx`
              : `Rent_Agreement_${formData.owner_name}_${formData.tenant_name}.docx`,
            formData: { ...formData },
            selectedFormat,
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
    if (selectedFormat === 'malayalam-standard') {
      switch (currentStep) {
        case 1: return <StepOwnerMl data={formData} onChange={handleChange} />
        case 2: return <StepTenantMl data={formData} onChange={handleChange} />
        case 3: return <StepRentMl data={formData} onChange={handleChange} />
        case 4: return <StepHouseMl data={formData} onChange={handleChange} onAmenitiesChange={handleAmenitiesChange} />
        case 5: return <StepPreviewMl data={formData} declared={declared} onDeclaredChange={setDeclared} />
        default: return null
      }
    }
    if (selectedFormat === 'english-flat') {
      switch (currentStep) {
        case 1: return <StepOwner data={formData} onChange={handleChange} format={selectedFormat} />
        case 2: return <StepTenant data={formData} onChange={handleChange} format={selectedFormat} />
        case 3: return <StepRent data={formData} onChange={handleChange} format={selectedFormat} />
        case 4: return <StepHouse data={formData} onChange={handleChange} onAmenitiesChange={handleAmenitiesChange} format={selectedFormat} />
        case 5: return <StepFlatDetails data={formData} onChange={handleChange} />
        case 6: return <StepBankTerms data={formData} onChange={handleChange} />
        case 7: return <StepPreview data={formData} format={selectedFormat} declared={declared} onDeclaredChange={setDeclared} />
        default: return null
      }
    }
    switch (currentStep) {
      case 1: return <StepOwner data={formData} onChange={handleChange} format={selectedFormat} />
      case 2: return <StepTenant data={formData} onChange={handleChange} format={selectedFormat} />
      case 3: return <StepRent data={formData} onChange={handleChange} format={selectedFormat} />
      case 4: return <StepHouse data={formData} onChange={handleChange} onAmenitiesChange={handleAmenitiesChange} format={selectedFormat} />
      case 5: return <StepPreview data={formData} format={selectedFormat} declared={declared} onDeclaredChange={setDeclared} />
      default: return null
    }
  }

  const isLastStep = currentStep === TOTAL_STEPS

  return (
    <>
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader-box">
            <div className="loader-spinner" />
            <p className="loader-text">Generating your document…</p>
          </div>
        </div>
      )}
      <Header />
      <section className="hero-section">
        <h2>Rental Agreement Workspace</h2>
        <p>Enter the required details to prepare a legally structured rental agreement.</p>
        {FORMAT_SPECIFIC[selectedFormat] && (
          <div className="format-indicator">
            <span className="format-indicator-id">{FORMAT_SPECIFIC[selectedFormat].displayId}</span>
            <span className="format-indicator-name">{FORMAT_SPECIFIC[selectedFormat].label}</span>
          </div>
        )}
      </section>
      <main className="app-wrapper">
        <div className="ditto-card">
          <div className="progress-hud">
            {config.steps.map(({ id, label }) => {
              const isActive = id === currentStep
              const isCompleted = id < currentStep
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
          <form ref={formRef}>
            <div className="form-workspace">
              {renderStep()}
              <div className="actions-footer">
                {currentStep > 1 && (
                  <button type="button" className="btn-action btn-back" onClick={goBack}>
                    <IconChevronLeft />Back
                  </button>
                )}
                {isLastStep ? (
                  <button type="button"
                    className={`btn-action btn-next btn-submit${!declared ? ' btn-disabled' : ''}`}
                    onClick={declared ? handleDownload : undefined}
                    disabled={!declared}
                  >
                    Confirm & Download Document<IconCheck />
                  </button>
                ) : (
                  <button type="button" className="btn-action btn-next" onClick={goNext}>
                    Next Step<IconChevronRight />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
