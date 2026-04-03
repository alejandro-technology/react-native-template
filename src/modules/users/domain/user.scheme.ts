import * as yup from 'yup';
import type { InferType } from 'yup';

export const userSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
  phone: yup
    .string()
    .required('El teléfono es requerido')
    .max(20, 'El teléfono debe tener máximo 20 caracteres'),
  role: yup
    .string()
    .required('El rol es requerido')
    .max(50, 'El rol debe tener máximo 50 caracteres'),
  avatar: yup.string().nullable().default(null),
  birthDate: yup.date().required('La fecha de nacimiento es requerida'),
  termsAccepted: yup
    .boolean()
    .required()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
    .default(false),
});

export type UserFormData = InferType<typeof userSchema>;
