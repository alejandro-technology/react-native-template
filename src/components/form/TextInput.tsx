import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
// Components
import {
  TextInput as TextInputCore,
  TextInputProps as TextInputCoreProps,
} from '../core/TextInput';

// -----------------------------------------------------------------------------

interface TextInputProps<T extends FieldValues = any>
  extends TextInputCoreProps {
  control: Control<T>;
  name: Path<T>;
}

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ label, name, control, ...rest }, ref) => {
    const {
      field: { value, onChange },
      fieldState: { error },
    } = useController({ name, control });

    const onChangeText = React.useCallback(
      (text: string) => {
        onChange(text);
      },
      [onChange],
    );

    return (
      <TextInputCore
        ref={ref}
        label={label}
        error={error?.message}
        value={value ? String(value) : ''}
        onChangeText={onChangeText}
        {...rest}
      />
    );
  },
);
