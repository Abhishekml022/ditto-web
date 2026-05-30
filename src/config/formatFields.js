// ── Fields shared by every format ─────────────────────────────
export const COMMON_DEFAULT_DATA = {
  owner_name: '', owner_address: '',
  tenant_name: '', tenant_address: '', tenant_mobile: '',
  rent: '', advance_amt: '', notice_period: '30',
  agreement_date: '', duration: '11',
  rent_purpose: 'Residential Purpose',
  amenities_list: ['Electricity'], amenities_other_checked: false, amenities_other: '',
  stamp_paper_amount: '',
}

// ── Per-format unique field definitions ────────────────────────
export const FORMAT_SPECIFIC = {
  'english-standard': {
    label: 'Standard Rental Agreement',
    displayId: 'DTT-001',
    defaults: {
      owner_aadhaar: '',
      tenant_aadhaar: '',
      day_of_rent: '5th',
      building_type: 'House',
      rented_house_address: '',
      building_tc_no: '',
    },
  },
  'english-standard-classic': {
    label: 'Standard Agreement (Classic)',
    displayId: 'DTT-003',
    defaults: {
      owner_aadhaar: '',
      tenant_aadhaar: '',
      day_of_rent: '5th',
      building_type: 'House',
      rented_house_address: '',
      building_tc_no: '',
    },
  },
  'english-flat': {
    label: 'Flat Rental Agreement',
    displayId: 'DTT-002',
    defaults: {
      owner_co: '',
      tenant_co: '',
      agreement_end_date: '',
      end_date_manual: false,
      r_p_increase: '5%',
      i_period: '11 Months',
      flat_no: '', floor_no: '', tower_no: '', flat_name: '', flat_address: '',
      bhk: '', area: '', occupants: '',
      account_name: '', account_no: '', bank_name: '', branch_name: '', bank_ifsc: '',
    },
  },
}

// ── Helpers ────────────────────────────────────────────────────

/** Full defaultData object for initialising a form */
export function getDefaultData(formatId) {
  return { ...COMMON_DEFAULT_DATA, ...(FORMAT_SPECIFIC[formatId]?.defaults ?? {}) }
}

/** Extract only the format-specific fields from a data object (for Firestore writes) */
export function getSpecificFields(formatId, data) {
  return Object.keys(FORMAT_SPECIFIC[formatId]?.defaults ?? {}).reduce((acc, key) => {
    acc[key] = data[key] ?? ''
    return acc
  }, {})
}

/** Extract only the common fields from a data object (for Firestore writes) */
export function getCommonFields(data) {
  return {
    owner_name: data.owner_name,
    owner_address: data.owner_address,
    tenant_name: data.tenant_name,
    tenant_address: data.tenant_address,
    tenant_mobile: data.tenant_mobile || '',
    rent: Number(data.rent),
    advance_amt: Number(data.advance_amt),
    notice_period: Number(data.notice_period),
    agreement_date: data.agreement_date,
    duration: Number(data.duration),
    rent_purpose: data.rent_purpose,
    stamp_paper_amount: data?.stamp_paper_amount ?? '',
  }
}
