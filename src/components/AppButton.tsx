import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function AppButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
}: AppButtonProps): React.JSX.Element {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'danger' && styles.dangerButton,
    disabled && styles.disabledButton,
  ];
  const textStyle = [
    styles.label,
    variant === 'secondary' && styles.secondaryLabel,
    variant === 'danger' && styles.dangerLabel,
    disabled && styles.disabledLabel,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled}}
      android_ripple={disabled ? undefined : {color: colors.primaryDark}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [buttonStyle, pressed && !disabled && styles.pressed]}>
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  secondaryButton: {
    backgroundColor: colors.primaryLight,
  },
  dangerButton: {
    backgroundColor: colors.dangerLight,
  },
  disabledButton: {
    backgroundColor: '#E2E6E4',
  },
  pressed: {
    opacity: 0.82,
    transform: [{scale: 0.99}],
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: colors.primaryDark,
  },
  dangerLabel: {
    color: colors.danger,
  },
  disabledLabel: {
    color: '#818B87',
  },
});
