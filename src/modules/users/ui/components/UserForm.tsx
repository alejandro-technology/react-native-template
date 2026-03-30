import React from 'react';
import { useForm } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
// Components
import { spacing } from '@theme/index';
import { Button } from '@components/core';
import { TextInput } from '@components/form';
// Domain
import type { User } from '../../domain/user.model';
import { userSchema, UserFormData } from '../../domain/user.scheme';

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  isLoading?: boolean;
  initialData?: User;
}

export function UserForm({
  onSubmit,
  isLoading = false,
  initialData,
}: UserFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      role: initialData?.role || '',
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        control={control}
        name="name"
        label="Nombre"
        placeholder="Ingresa el nombre del usuario"
        error={errors.name?.message}
      />

      <TextInput
        control={control}
        name="email"
        label="Email"
        placeholder="ejemplo@correo.com"
        error={errors.email?.message}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        control={control}
        name="phone"
        label="Teléfono"
        placeholder="+1 234 567 8900"
        error={errors.phone?.message}
        keyboardType="phone-pad"
      />

      <TextInput
        control={control}
        name="role"
        label="Rol"
        placeholder="Ej: Administrador, Usuario, etc."
        error={errors.role?.message}
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
