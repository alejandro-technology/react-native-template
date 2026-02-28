import React from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Components
import { Button, Text } from '@components/core';
import { TextInput } from '@components/form';
// Schema
import {
  SignInFormData,
  signInSchema,
} from '@modules/authentication/domain/auth.scheme';
// Application
import { useSigninMutation } from '@modules/authentication/application/auth.mutations';
// Theme
import { spacing } from '@theme/spacing';

/**
 * Formulario de inicio de sesión de usuario
 */
export default function SignInForm() {
  const { control, handleSubmit } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate } = useSigninMutation();

  const onSubmit = (data: SignInFormData) => {
    mutate(data);
  };

  return (
    <View style={styles.form}>
      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Credenciales
        </Text>
        <View style={styles.inputGroup}>
          <TextInput
            name="email"
            control={control}
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Text>📧</Text>}
            fullWidth
          />
          <TextInput
            name="password"
            control={control}
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            secureTextEntry
            autoCapitalize="none"
            leftIcon={<Text>🔑</Text>}
            fullWidth
          />
        </View>
      </View>

      <View style={styles.submitSection}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          fullWidth
        >
          Iniciar sesión
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  inputGroup: {
    gap: spacing.md,
    padding: spacing.sm,
  },
  submitSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
