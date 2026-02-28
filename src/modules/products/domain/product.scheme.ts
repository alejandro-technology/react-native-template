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
  price: z.string().min(0, { message: 'El precio no puede ser negativo' }),
});

export type ProductFormData = z.infer<typeof productSchema>;
