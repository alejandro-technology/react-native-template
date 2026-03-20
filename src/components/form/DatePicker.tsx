import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
// Components
import {
  DatePicker as DatePickerCore,
  DatePickerProps as DatePickerPropsCore,
} from '@components/core';

// -----------------------------------------------------------------------------

interface DatePickerProps<T extends FieldValues = any>
  extends Omit<DatePickerPropsCore, 'value' | 'onChange'> {
  control: Control<T>;
  name: Path<T>;
}

export const DatePicker = React.forwardRef<RNTextInput, DatePickerProps>(
  ({ name, control, ...rest }, ref) => {
    const {
      field: { value, onChange },
      fieldState: { error },
    } = useController({ name, control });

    return (
      <DatePickerCore
        ref={ref}
        error={error?.message}
        {...rest}
        value={value}
        onChange={onChange}
      />
    );
  },
);
