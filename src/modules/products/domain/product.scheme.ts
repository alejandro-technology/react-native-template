import * as yup from 'yup';
import type { InferType } from 'yup';
import type { SelectOption } from '@components/core/Select';

export const productSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  description: yup
    .string()
    .max(500, 'La descripción debe tener máximo 500 caracteres')
    .defined(),
  price: yup
    .number()
    .transform((value: number, originalValue: unknown) =>
      originalValue === '' || originalValue === null ? NaN : value,
    )
    .typeError('El precio debe ser mayor a 0')
    .min(1, 'El precio debe ser mayor a 0')
    .required('El precio debe ser mayor a 0'),
  type: yup.mixed<SelectOption>().required('El tipo es requerido'),
});

export type ProductFormData = InferType<typeof productSchema>;
