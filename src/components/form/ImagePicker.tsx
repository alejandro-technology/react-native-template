import React from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
// Components
import {
  ImagePicker as ImagePickerCore,
  ImagePickerProps as ImagePickerCoreProps,
} from '../core/ImagePicker';

interface ImagePickerProps<T extends FieldValues = any>
  extends Omit<ImagePickerCoreProps, 'value' | 'onChange'> {
  control: Control<T>;
  name: Path<T>;
}

export const ImagePicker = React.forwardRef<
  typeof ImagePickerCore,
  ImagePickerProps
>(
  (
    {
      label,
      name,
      control,
      placeholder,
      error: errorProp,
      displayName,
      userId,
    },
    _ref,
  ) => {
    const {
      field: { value, onChange },
      fieldState: { error },
    } = useController({ name, control });

    const handleChange = React.useCallback(
      (uri: string | null) => {
        onChange(uri);
      },
      [onChange],
    );

    return (
      <ImagePickerCore
        label={label}
        placeholder={placeholder}
        error={error?.message || errorProp}
        value={value}
        onChange={handleChange}
        displayName={displayName}
        userId={userId}
      />
    );
  },
);
