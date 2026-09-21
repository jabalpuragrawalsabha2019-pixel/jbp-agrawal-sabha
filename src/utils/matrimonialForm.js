/**
 * Constants and helpers for the official Pratyashi Parichay matrimonial form.
 */

export const SPECIAL_STATUS_OPTIONS = [
  { value: 'widowed', label: 'Widowed (विधुर/विधवा)' },
  { value: 'divorced', label: 'Divorced (तलाकशुदा)' },
  { value: 'separated', label: 'Separated' },
  { value: 'disabled', label: 'Disabled (दिव्यांग)' },
];

export const COMPLEXION_OPTIONS = [
  'Fair',
  'Wheatish',
  'Dusky',
  'Dark',
  'Other',
];

export const RASHI_OPTIONS = [
  'Mesh (Aries)',
  'Vrishabh (Taurus)',
  'Mithun (Gemini)',
  'Kark (Cancer)',
  'Simha (Leo)',
  'Kanya (Virgo)',
  'Tula (Libra)',
  'Vrishchik (Scorpio)',
  'Dhanu (Sagittarius)',
  'Makar (Capricorn)',
  'Kumbh (Aquarius)',
  'Meen (Pisces)',
];

export const BLOOD_GROUP_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Unknown',
];

export const MOTHER_STATUS_OPTIONS = [
  'Homemaker (गृहणी)',
  'Service (सर्विस)',
  'Business',
  'Other',
];

/** Official vachan-patra / declaration text from the paper form. */
export const DECLARATION_TEXT =
  'मैं आवेदनकर्ता यह वचन देता/देती हूँ कि इस आवेदन पत्र में दिये गए विवरण पूर्णतः सत्य एवं सही हैं तथा इसकी प्रमाणिकता के लिए मैं स्वयं उत्तरदायी हूं। मैंने इस आवेदन पत्र में निर्देशित नियम एवं शर्तें पढ़ लिए हैं एवं मैं उनका पालन करते हुए प्रतिबद्ध हूँ। किसी भी स्थिति में जबलपुर अग्रवाल सभा, जबलपुर किसी भी प्रकार से उत्तरदायी नहीं होगी। इसके लिए मैं स्वयं उत्तरदायी रहूँगा/रहूंगी।';

/**
 * Empty form state matching every official form field.
 * @returns {object}
 */
export function createEmptyMatrimonialForm() {
  return {
    candidate_name: '',
    gotra: '',
    gender: '',
    date_of_birth: '',
    birth_time: '',
    birth_place: '',
    district: '',
    height: '',
    complexion: '',
    blood_group: '',
    rashi: '',
    education: '',
    business_service_name: '',
    annual_income: '',
    brothers_married: '0',
    brothers_unmarried: '0',
    sisters_married: '0',
    sisters_unmarried: '0',
    father_guardian_name: '',
    father_mobile: '',
    father_business_details: '',
    father_annual_income: '',
    business_office_address: '',
    mother_name: '',
    mother_homemaker_or_service: '',
    residential_address: '',
    email: '',
    whatsapp_number: '',
    special_statuses: [],
    previous_spouse_name: '',
    previous_spouse_mobile: '',
    previous_father_in_law_name_address: '',
    previous_father_in_law_mobile: '',
    sons_count: '',
    sons_ages: '',
    daughters_count: '',
    daughters_ages: '',
    disability_details: '',
    declaration_accepted: false,
    declaration_date: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Computes age in years from YYYY-MM-DD date of birth.
 * @param {string} dob
 * @returns {number|null}
 */
export function ageFromDob(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

/**
 * Validates required Pratyashi Parichay fields.
 * @param {object} form
 * @param {string[]} photos
 * @returns {{ok: boolean, message?: string}}
 */
export function validateMatrimonialForm(form, photos) {
  const required = [
    ['candidate_name', 'Candidate name'],
    ['gotra', 'Gotra'],
    ['gender', 'Gender'],
    ['date_of_birth', 'Date of birth'],
    ['birth_time', 'Birth time'],
    ['birth_place', 'Birth place'],
    ['district', 'District'],
    ['height', 'Height'],
    ['complexion', 'Complexion'],
    ['blood_group', 'Blood group'],
    ['rashi', 'Rashi'],
    ['education', 'Educational qualification'],
    ['business_service_name', 'Business/service name'],
    ['annual_income', 'Annual income'],
    ['father_guardian_name', 'Father/guardian name'],
    ['father_mobile', 'Father/guardian mobile'],
    ['father_business_details', "Father's business/service details"],
    ['father_annual_income', "Father's annual income"],
    ['business_office_address', 'Full business/office address'],
    ['mother_name', "Mother's name"],
    ['mother_homemaker_or_service', 'Mother homemaker/service'],
    ['residential_address', 'Full residential address'],
    ['email', 'Email'],
    ['whatsapp_number', 'WhatsApp number'],
  ];

  for (const [key, label] of required) {
    if (!String(form[key] || '').trim()) {
      return { ok: false, message: `${label} is required` };
    }
  }

  if (photos.length < 2) {
    return {
      ok: false,
      message: 'Please upload 2 recent colour photographs of the candidate',
    };
  }

  if (!form.declaration_accepted) {
    return { ok: false, message: 'Please accept the declaration (वचन पत्र)' };
  }

  if (!form.declaration_date) {
    return { ok: false, message: 'Declaration date is required' };
  }

  const age = ageFromDob(form.date_of_birth);
  if (age == null || age < 18 || age > 100) {
    return { ok: false, message: 'Candidate must be between 18 and 100 years' };
  }

  return { ok: true };
}

/**
 * Builds the DB payload from form state + uploaded assets.
 * @param {object} form
 * @param {object} opts
 * @returns {object}
 */
export function buildMatrimonialPayload(form, opts) {
  const {
    userId,
    photoUrls,
    parentSignatureUrl = null,
    candidateSignatureUrl = null,
  } = opts;

  const age = ageFromDob(form.date_of_birth);
  const toInt = (v) => {
    const n = parseInt(String(v ?? '0'), 10);
    return Number.isFinite(n) ? n : 0;
  };

  const brothersMarried = toInt(form.brothers_married);
  const brothersUnmarried = toInt(form.brothers_unmarried);
  const sistersMarried = toInt(form.sisters_married);
  const sistersUnmarried = toInt(form.sisters_unmarried);

  const familySummary = [
    `Brothers: ${brothersMarried} married, ${brothersUnmarried} unmarried`,
    `Sisters: ${sistersMarried} married, ${sistersUnmarried} unmarried`,
    `(excluding candidate)`,
  ].join('. ');

  return {
    user_id: userId,
    candidate_name: form.candidate_name.trim(),
    gender: form.gender,
    gotra: form.gotra.trim(),
    date_of_birth: form.date_of_birth,
    birth_time: form.birth_time.trim(),
    birth_place: form.birth_place.trim(),
    district: form.district.trim(),
    // Keep legacy filter columns populated
    city: form.district.trim(),
    age,
    height: form.height.trim(),
    complexion: form.complexion.trim(),
    blood_group: form.blood_group.trim(),
    rashi: form.rashi.trim(),
    education: form.education.trim(),
    business_service_name: form.business_service_name.trim(),
    occupation: form.business_service_name.trim(),
    annual_income: form.annual_income.trim(),
    brothers_married: brothersMarried,
    brothers_unmarried: brothersUnmarried,
    sisters_married: sistersMarried,
    sisters_unmarried: sistersUnmarried,
    family_details: familySummary,
    father_guardian_name: form.father_guardian_name.trim(),
    father_mobile: form.father_mobile.trim(),
    father_business_details: form.father_business_details.trim(),
    father_annual_income: form.father_annual_income.trim(),
    business_office_address: form.business_office_address.trim(),
    mother_name: form.mother_name.trim(),
    mother_homemaker_or_service: form.mother_homemaker_or_service.trim(),
    residential_address: form.residential_address.trim(),
    email: form.email.trim(),
    whatsapp_number: form.whatsapp_number.trim(),
    special_statuses: form.special_statuses || [],
    previous_spouse_name: form.previous_spouse_name?.trim() || null,
    previous_spouse_mobile: form.previous_spouse_mobile?.trim() || null,
    previous_father_in_law_name_address:
      form.previous_father_in_law_name_address?.trim() || null,
    previous_father_in_law_mobile:
      form.previous_father_in_law_mobile?.trim() || null,
    sons_count: form.sons_count === '' ? null : toInt(form.sons_count),
    sons_ages: form.sons_ages?.trim() || null,
    daughters_count:
      form.daughters_count === '' ? null : toInt(form.daughters_count),
    daughters_ages: form.daughters_ages?.trim() || null,
    disability_details: form.disability_details?.trim() || null,
    declaration_accepted: true,
    declaration_date: form.declaration_date,
    parent_signature_url: parentSignatureUrl,
    candidate_signature_url: candidateSignatureUrl,
    photos: photoUrls,
    status: 'pending',
  };
}
