/**
 * Shared labeled text / picker fields for matrimonial forms.
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

/**
 * Labeled text input.
 * @param {object} props
 */
export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  multiline = false,
  keyboardType = 'default',
  maxLength,
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );
}

/**
 * Labeled picker select.
 * @param {object} props
 */
export function FormPicker({
  label,
  value,
  onValueChange,
  options,
  required = false,
  placeholder = 'Select',
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={value} onValueChange={onValueChange} style={styles.picker}>
          <Picker.Item label={placeholder} value="" />
          {options.map((opt) => {
            const itemValue = typeof opt === 'string' ? opt : opt.value;
            const itemLabel = typeof opt === 'string' ? opt : opt.label;
            return <Picker.Item key={itemValue} label={itemLabel} value={itemValue} />;
          })}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  input: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  textArea: {
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.gray900,
  },
});
