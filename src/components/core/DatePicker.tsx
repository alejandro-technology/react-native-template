import React, { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  View,
  ViewStyle,
  TextInput as RNTextInput,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { TextInput } from './TextInput';
import { useTheme } from '@theme/index';
import {
  DatePickerMode,
  DatePickerVariant,
  getDatePickerStyle,
  getPickerTextColor,
  getPickerBackgroundColor,
} from '@theme/components/DatePicker.styles';
import { Text } from './Text';
import { BorderRadiusToken } from '@theme/borders';
import { AnimatedPressable } from './AnimatedPressable';

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode?: DatePickerMode;
  variant?: DatePickerVariant;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  borderRadius?: BorderRadiusToken;
  containerStyle?: ViewStyle;
}

export const DatePicker = forwardRef<RNTextInput, DatePickerProps>(
  (props: DatePickerProps, ref) => {
    const {
      value,
      onChange,
      mode = 'date',
      minimumDate,
      maximumDate,
      placeholder,
      label,
      error,
      helperText,
      disabled,
      ...textInputProps
    } = props;

    const theme = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    const styles = getDatePickerStyle({ mode: theme.mode });
    const textColor = getPickerTextColor(theme.mode);
    const backgroundColor = getPickerBackgroundColor(theme.mode);

    const formatDate = (date: Date): string => {
      if (mode === 'time') {
        return date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      if (mode === 'datetime') {
        return date.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
        if (Platform.OS === 'ios') {
          setShowPicker(false);
        }
      } else if (event.type === 'dismissed') {
        setShowPicker(false);
      }
    };

    const handlePress = () => {
      if (!disabled) {
        setShowPicker(true);
      }
    };

    const handleConfirm = () => {
      setShowPicker(false);
    };

    const handleCancel = () => {
      setShowPicker(false);
    };

    const displayValue = value
      ? formatDate(value)
      : placeholder ||
        (mode === 'time' ? 'Seleccionar hora' : 'Seleccionar fecha');

    return (
      <View>
        <AnimatedPressable onPress={handlePress} style={styles.iconButton}>
          <TextInput
            ref={ref}
            label={label}
            error={error}
            helperText={helperText}
            value={displayValue}
            pointerEvents="none"
            rightIcon={
              <Text style={styles.icon}>{mode === 'time' ? '🕐' : '📅'}</Text>
            }
            placeholderTextColor={styles.placeholder.color}
            {...textInputProps}
            onPressIn={handlePress}
          />
        </AnimatedPressable>

        {showPicker && (
          <View style={styles.pickerContainer}>
            {Platform.OS === 'ios' && (
              <View style={styles.pickerHeader}>
                <Pressable onPress={handleCancel} style={styles.pickerButton}>
                  <Text color="textSecondary">Cancelar</Text>
                </Pressable>
                <Pressable onPress={handleConfirm} style={styles.pickerButton}>
                  <Text color="primary" style={styles.pickerButtonText}>
                    Listo
                  </Text>
                </Pressable>
              </View>
            )}
            <DateTimePicker
              value={value || new Date()}
              mode={mode === 'datetime' ? 'date' : mode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              textColor={textColor}
              themeVariant={theme.mode as 'light' | 'dark'}
              style={[styles.picker, { backgroundColor }]}
            />
            {Platform.OS === 'ios' && mode === 'datetime' && (
              <View style={styles.pickerHeader}>
                <View style={styles.pickerButton} />
                <DateTimePicker
                  value={value || new Date()}
                  mode="time"
                  display="spinner"
                  onChange={handleChange}
                  textColor={textColor}
                  themeVariant={theme.mode as 'light' | 'dark'}
                  style={[styles.pickerTime, { backgroundColor }]}
                />
                <View style={styles.pickerButton} />
              </View>
            )}
          </View>
        )}
      </View>
    );
  },
);
