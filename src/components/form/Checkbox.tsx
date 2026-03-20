import React from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { Checkbox as CheckboxCore } from '@components/core';

interface CheckboxProps<T extends FieldValues = any>
  extends Omit<
    React.ComponentProps<typeof CheckboxCore>,
    'checked' | 'onChange'
  > {
  control: Control<T>;
  name: Path<T>;
}

export function Checkbox({ name, control, ...rest }: CheckboxProps) {
  const {
    field: { value, onChange },
  } = useController({ name, control });

  const handleChange = React.useCallback(
    (checked: boolean) => {
      onChange(checked);
    },
    [onChange],
  );

  return <CheckboxCore {...rest} checked={!!value} onChange={handleChange} />;
}
