/**
 * Sectioned field groups for the Pratyashi Parichay form.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';
import { FormField, FormPicker } from './FormFields';
import { PhotoPickerGrid, SignaturePicker } from './PhotoPickers';
import {
  SPECIAL_STATUS_OPTIONS,
  COMPLEXION_OPTIONS,
  RASHI_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  MOTHER_STATUS_OPTIONS,
  DECLARATION_TEXT,
} from '../../utils/matrimonialForm';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  GENDER_OPTIONS,
  EDUCATION_LEVELS,
  GOTRAS,
  CITIES,
} from '../../utils/constants';

/**
 * Updates one form key.
 * @param {Function} setForm
 * @param {string} key
 */
const setter = (setForm, key) => (value) =>
  setForm((prev) => ({ ...prev, [key]: value }));

/** Candidate photos section */
export function PhotosSection({ photos, setPhotos }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Candidate Photographs</Text>
      <PhotoPickerGrid photos={photos} setPhotos={setPhotos} maxPhotos={2} />
    </Card>
  );
}

/** Fields 1–5: identity, birth, appearance, education, work */
export function CandidateBasicsSection({ form, setForm }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Candidate Details</Text>
      <FormField
        label="Candidate name (प्रत्याशी का नाम)"
        required
        value={form.candidate_name}
        onChangeText={setter(setForm, 'candidate_name')}
      />
      <FormPicker
        label="Gotra (गोत्र)"
        required
        value={form.gotra}
        onValueChange={setter(setForm, 'gotra')}
        options={GOTRAS}
      />
      <FormPicker
        label="Gender"
        required
        value={form.gender}
        onValueChange={setter(setForm, 'gender')}
        options={GENDER_OPTIONS}
      />
      <FormField
        label="Date of birth (जन्मतिथि)"
        required
        placeholder="YYYY-MM-DD"
        value={form.date_of_birth}
        onChangeText={setter(setForm, 'date_of_birth')}
      />
      <FormField
        label="Birth time (जन्म समय)"
        required
        placeholder="e.g. 10:30 AM"
        value={form.birth_time}
        onChangeText={setter(setForm, 'birth_time')}
      />
      <FormField
        label="Birth place (जन्म स्थान)"
        required
        value={form.birth_place}
        onChangeText={setter(setForm, 'birth_place')}
      />
      <FormPicker
        label="District (जिला)"
        required
        value={form.district}
        onValueChange={setter(setForm, 'district')}
        options={CITIES}
      />
      <FormField
        label="Height (ऊँचाई)"
        required
        placeholder="e.g. 5'6&quot;"
        value={form.height}
        onChangeText={setter(setForm, 'height')}
      />
      <FormPicker
        label="Complexion (रंग)"
        required
        value={form.complexion}
        onValueChange={setter(setForm, 'complexion')}
        options={COMPLEXION_OPTIONS}
      />
      <FormPicker
        label="Blood group"
        required
        value={form.blood_group}
        onValueChange={setter(setForm, 'blood_group')}
        options={BLOOD_GROUP_OPTIONS}
      />
      <FormPicker
        label="Rashi (राशि)"
        required
        value={form.rashi}
        onValueChange={setter(setForm, 'rashi')}
        options={RASHI_OPTIONS}
      />
      <FormPicker
        label="Educational qualification (शैक्षणिक योग्यता)"
        required
        value={form.education}
        onValueChange={setter(setForm, 'education')}
        options={EDUCATION_LEVELS}
      />
      <FormField
        label="Business/service name (व्यवसाय/सर्विस)"
        required
        value={form.business_service_name}
        onChangeText={setter(setForm, 'business_service_name')}
      />
      <FormField
        label="Annual income (वार्षिक आय)"
        required
        value={form.annual_income}
        onChangeText={setter(setForm, 'annual_income')}
      />
    </Card>
  );
}

/** Field 6: brothers / sisters counts */
export function SiblingsSection({ form, setForm }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Brothers & Sisters (excluding candidate)</Text>
      <FormField
        label="Brothers — married (विवाहित)"
        keyboardType="number-pad"
        value={form.brothers_married}
        onChangeText={setter(setForm, 'brothers_married')}
      />
      <FormField
        label="Brothers — unmarried (अविवाहित)"
        keyboardType="number-pad"
        value={form.brothers_unmarried}
        onChangeText={setter(setForm, 'brothers_unmarried')}
      />
      <FormField
        label="Sisters — married (विवाहित)"
        keyboardType="number-pad"
        value={form.sisters_married}
        onChangeText={setter(setForm, 'sisters_married')}
      />
      <FormField
        label="Sisters — unmarried (अविवाहित)"
        keyboardType="number-pad"
        value={form.sisters_unmarried}
        onChangeText={setter(setForm, 'sisters_unmarried')}
      />
    </Card>
  );
}

/** Fields 7–12: parents, addresses, contact */
export function FamilyContactSection({ form, setForm }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Family & Contact</Text>
      <FormField
        label="Father/guardian name (पिता/अभिभावक)"
        required
        value={form.father_guardian_name}
        onChangeText={setter(setForm, 'father_guardian_name')}
      />
      <FormField
        label="Mobile (मोबाइल)"
        required
        keyboardType="phone-pad"
        maxLength={10}
        value={form.father_mobile}
        onChangeText={setter(setForm, 'father_mobile')}
      />
      <FormField
        label="Father's business/service details"
        required
        multiline
        value={form.father_business_details}
        onChangeText={setter(setForm, 'father_business_details')}
      />
      <FormField
        label="Father's annual income"
        required
        value={form.father_annual_income}
        onChangeText={setter(setForm, 'father_annual_income')}
      />
      <FormField
        label="Full business/office address"
        required
        multiline
        value={form.business_office_address}
        onChangeText={setter(setForm, 'business_office_address')}
      />
      <FormField
        label="Mother's name (माता का नाम)"
        required
        value={form.mother_name}
        onChangeText={setter(setForm, 'mother_name')}
      />
      <FormPicker
        label="Homemaker / service (गृहणी/सर्विस)"
        required
        value={form.mother_homemaker_or_service}
        onValueChange={setter(setForm, 'mother_homemaker_or_service')}
        options={MOTHER_STATUS_OPTIONS}
      />
      <FormField
        label="Full residential address (निवास का पूर्ण पता)"
        required
        multiline
        value={form.residential_address}
        onChangeText={setter(setForm, 'residential_address')}
      />
      <FormField
        label="Email (ई-मेल)"
        required
        keyboardType="email-address"
        value={form.email}
        onChangeText={setter(setForm, 'email')}
      />
      <FormField
        label="WhatsApp number (व्हाट्सअप मो. नं.)"
        required
        keyboardType="phone-pad"
        maxLength={10}
        value={form.whatsapp_number}
        onChangeText={setter(setForm, 'whatsapp_number')}
      />
    </Card>
  );
}

/** Special section for widowed / divorced / separated / disabled */
export function SpecialInfoSection({ form, setForm }) {
  const toggleStatus = (value) => {
    setForm((prev) => {
      const set = new Set(prev.special_statuses || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, special_statuses: Array.from(set) };
    });
  };

  const show = (form.special_statuses || []).length > 0;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>
        Other info (if widowed / divorced / separated / disabled)
      </Text>
      <Text style={styles.hint}>Select all that apply</Text>
      <View style={styles.chipRow}>
        {SPECIAL_STATUS_OPTIONS.map((opt) => {
          const active = (form.special_statuses || []).includes(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleStatus(opt.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {show && (
        <View style={{ marginTop: SPACING.md }}>
          <FormField
            label="Previous husband/wife name"
            value={form.previous_spouse_name}
            onChangeText={setter(setForm, 'previous_spouse_name')}
          />
          <FormField
            label="Previous spouse mobile"
            keyboardType="phone-pad"
            value={form.previous_spouse_mobile}
            onChangeText={setter(setForm, 'previous_spouse_mobile')}
          />
          <FormField
            label="Previous father-in-law name and address"
            multiline
            value={form.previous_father_in_law_name_address}
            onChangeText={setter(setForm, 'previous_father_in_law_name_address')}
          />
          <FormField
            label="Previous father-in-law mobile"
            keyboardType="phone-pad"
            value={form.previous_father_in_law_mobile}
            onChangeText={setter(setForm, 'previous_father_in_law_mobile')}
          />
          <FormField
            label="Sons — count"
            keyboardType="number-pad"
            value={form.sons_count}
            onChangeText={setter(setForm, 'sons_count')}
          />
          <FormField
            label="Sons — ages"
            placeholder="e.g. 12, 8"
            value={form.sons_ages}
            onChangeText={setter(setForm, 'sons_ages')}
          />
          <FormField
            label="Daughters — count"
            keyboardType="number-pad"
            value={form.daughters_count}
            onChangeText={setter(setForm, 'daughters_count')}
          />
          <FormField
            label="Daughters — ages"
            placeholder="e.g. 10, 6"
            value={form.daughters_ages}
            onChangeText={setter(setForm, 'daughters_ages')}
          />
          {(form.special_statuses || []).includes('disabled') && (
            <FormField
              label="Disability details (दिव्यांगता का विवरण)"
              multiline
              value={form.disability_details}
              onChangeText={setter(setForm, 'disability_details')}
            />
          )}
        </View>
      )}
    </Card>
  );
}

/** Vachan patra / declaration + signatures */
export function DeclarationSection({
  form,
  setForm,
  parentSignatureUri,
  setParentSignatureUri,
  candidateSignatureUri,
  setCandidateSignatureUri,
}) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Declaration (वचन पत्र)</Text>
      <Text style={styles.declaration}>{DECLARATION_TEXT}</Text>

      <FormField
        label="Date (दिनांक)"
        required
        placeholder="YYYY-MM-DD"
        value={form.declaration_date}
        onChangeText={setter(setForm, 'declaration_date')}
      />

      <SignaturePicker
        label="Parent/guardian signature (पिता/माता के हस्ताक्षर)"
        uri={parentSignatureUri}
        onChange={setParentSignatureUri}
      />
      <SignaturePicker
        label="Candidate signature (प्रत्याशी के हस्ताक्षर)"
        uri={candidateSignatureUri}
        onChange={setCandidateSignatureUri}
      />

      <TouchableOpacity
        style={styles.acceptRow}
        onPress={() =>
          setForm((prev) => ({
            ...prev,
            declaration_accepted: !prev.declaration_accepted,
          }))
        }
      >
        <Ionicons
          name={form.declaration_accepted ? 'checkbox' : 'square-outline'}
          size={24}
          color={COLORS.primary}
        />
        <Text style={styles.acceptText}>
          I accept this declaration and confirm the details are true *
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  declaration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  acceptText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray800,
    fontWeight: '600',
  },
});
