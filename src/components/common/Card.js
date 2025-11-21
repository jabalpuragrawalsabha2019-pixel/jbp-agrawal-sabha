// src/components/common/Card.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../utils/constants';

const Card = ({
  children,
  onPress,
  variant = 'default',
  style,
  padding = 'md',
}) => {
  const Component = onPress ? TouchableOpacity : View;

  const cardStyles = [
    styles.card,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    style,
  ];

  return (
    <Component
      style={cardStyles}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },

  // Variants
  default: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  elevated: {
    ...SHADOWS.lg,
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  gradient: {
    borderWidth: 0,
  },

  // Padding
  paddingSm: {
    padding: SPACING.sm,
  },
  paddingMd: {
    padding: SPACING.md,
  },
  paddingLg: {
    padding: SPACING.lg,
  },
  paddingXl: {
    padding: SPACING.xl,
  },
  paddingNone: {
    padding: 0,
  },
});

export default Card;