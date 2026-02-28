import z from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre debe tener máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción debe tener máximo 500 caracteres')
    .optional(),
  price: z.coerce.number().min(1, 'El precio debe ser mayor a 0'),
});

export type ProductFormData = z.infer<typeof productSchema>;
