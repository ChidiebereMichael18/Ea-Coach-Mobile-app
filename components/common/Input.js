import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { colors } from '../../styles/colors';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  error,
  keyboardType,
  autoCapitalize,
  editable = true,
  multiline = false,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        error && styles.inputError,
        !editable && styles.inputDisabled,
      ]}>
        {leftIcon && (
          <View style={styles.leftIconWrap}>
            <Icon name={leftIcon} size={18} color={error ? colors.danger : colors.gray[400]} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon && { paddingLeft: 0 },
            rightIcon && { paddingRight: 0 },
            multiline && { minHeight: 80, textAlignVertical: 'top' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconWrap}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={rightIcon} size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[100],
  },
  leftIconWrap: {
    marginRight: 12,
  },
  rightIconWrap: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.gray[800],
    paddingVertical: 14,
    fontWeight: '500',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default Input;