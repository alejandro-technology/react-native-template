import React from 'react';
import { useForm } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
// Components
import { spacing } from '@theme/index';
import { Button } from '@components/core';
import type { SelectOption } from '@components/core/Select';
import { TextInput, Select } from '@components/form';
// Domain
import type { Product } from '../../domain/product.model';
import { productSchema, ProductFormData } from '../../domain/product.scheme';

const PRODUCT_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Comida', value: 'comida' },
  { label: 'Bebidas', value: 'bebidas' },
  { label: 'Otros', value: 'otros' },
];

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
  initialData?: Product;
}

export function ProductForm({
  onSubmit,
  isLoading = false,
  initialData,
}: ProductFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      type: initialData
        ? PRODUCT_TYPE_OPTIONS.find(o => o.value === initialData.type) ??
          undefined
        : undefined,
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        control={control}
        name="name"
        label="Nombre"
        placeholder="Ingresa el nombre del producto"
        error={errors.name?.message}
      />

      <TextInput
        control={control}
        name="description"
        label="Descripción"
        placeholder="Ingresa la descripción (opcional)"
        error={errors.description?.message}
        multiline
        numberOfLines={3}
      />

      <TextInput
        control={control}
        name="price"
        label="Precio"
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.price?.message}
      />

      <Select
        control={control}
        name="type"
        label="Tipo"
        placeholder="Selecciona un tipo"
        options={PRODUCT_TYPE_OPTIONS}
        error={errors.type?.message}
      />

      <Button
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        style={styles.button}
      >
        {initialData ? 'Actualizar' : 'Crear'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
});
