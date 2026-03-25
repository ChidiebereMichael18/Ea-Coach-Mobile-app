import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, shadows } from '../../styles/colors';

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.gray[200];
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'danger': return colors.danger;
      case 'outline': return 'transparent';
      case 'ghost': return colors.primaryGhost;
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.gray[400];
    if (variant === 'outline' || variant === 'ghost') return colors.primary;
    return colors.white;
  };

  const getBorderColor = () => {
    if (disabled) return colors.gray[200];
    if (variant === 'outline') return colors.primary;
    return 'transparent';
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: 10, paddingHorizontal: 18 };
      case 'large': return { paddingVertical: 18, paddingHorizontal: 32 };
      default: return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 13;
      case 'large': return 17;
      default: return 15;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          ...getPadding(),
        },
        variant === 'primary' && !disabled && shadows.primary,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default Button;