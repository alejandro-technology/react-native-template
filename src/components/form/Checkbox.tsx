import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
// Components
import { Checkbox as CheckboxCore, Text } from '@components/core';
// Theme
import { useTheme, spacing } from '@theme/index';

interface CheckboxProps<T extends FieldValues = any>
  extends Omit<
    React.ComponentProps<typeof CheckboxCore>,
    'checked' | 'onChange'
  > {
  control: Control<T>;
  name: Path<T>;
  error?: string;
}

export function Checkbox({ name, control, error, ...rest }: CheckboxProps) {
  const {
    field: { value, onChange },
  } = useController({ name, control });
  const { colors } = useTheme();

  const handleChange = React.useCallback(
    (checked: boolean) => {
      onChange(checked);
    },
    [onChange],
  );

  return (
    <View style={styles.wrapper}>
      <CheckboxCore {...rest} checked={!!value} onChange={handleChange} />
      {error && (
        <Text variant="caption" style={{ color: colors.error }}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
});
