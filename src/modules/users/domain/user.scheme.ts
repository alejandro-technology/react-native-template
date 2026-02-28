import z from 'zod';

export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido'),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .max(20, 'El teléfono debe tener máximo 20 caracteres'),
  role: z
    .string()
    .min(1, 'El rol es requerido')
    .max(50, 'El rol debe tener máximo 50 caracteres'),
});

export type UserFormData = z.infer<typeof userSchema>;
