import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
// Components
import { Button, Text, Icon } from '@components/core';
import { Checkbox, DatePicker, Select, TextInput } from '@components/form';
// Schema
import {
  RegisterFormData,
  registerSchema,
} from '@modules/authentication/domain/auth.scheme';
// Theme
import { spacing } from '@theme/spacing';

export default function SignUpForm() {
  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      nombreCompleto: '',
      email: '',
      password: '',
      confirmPassword: '',
      fechaNacimiento: undefined,
      pais: undefined,
      aceptaTerminos: false,
      recibirNewsletter: false,
    },
  });

  const onSubmit = (_data: RegisterFormData) => {
    // TODO: Implement signup mutation
  };

  return (
    <View style={styles.form}>
      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Información Personal
        </Text>
        <View style={styles.inputGroup}>
          <TextInput
            name="nombreCompleto"
            control={control}
            label="Nombre completo"
            placeholder="Ingrese su nombre completo"
            autoCapitalize="words"
            leftIcon={<Icon name="user" size={16} />}
            fullWidth
          />
          <TextInput
            name="email"
            control={control}
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Icon name="email" size={16} />}
            fullWidth
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Seguridad
        </Text>
        <View style={styles.inputGroup}>
          <TextInput
            name="password"
            control={control}
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            autoCapitalize="none"
            leftIcon={<Icon name="key" size={16} />}
            helperText="Debe tener al menos 8 caracteres, una mayúscula y un número"
            fullWidth
          />
          <TextInput
            name="confirmPassword"
            control={control}
            label="Confirmar contraseña"
            placeholder="Repita su contraseña"
            secureTextEntry
            autoCapitalize="none"
            leftIcon={<Icon name="lock" size={16} />}
            fullWidth
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Información Adicional
        </Text>
        <View style={styles.inputGroup}>
          <DatePicker
            name="fechaNacimiento"
            control={control}
            label="Fecha de nacimiento"
            placeholder="Seleccione su fecha de nacimiento"
            mode="date"
            maximumDate={new Date()}
            fullWidth
          />
          <Select
            name="pais"
            control={control}
            label="País"
            placeholder="Seleccione su país"
            options={paisesOptions}
            modalTitle="Seleccionar país"
            fullWidth
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Preferencias
        </Text>
        <View style={styles.checkboxGroup}>
          <Checkbox
            name="aceptaTerminos"
            control={control}
            label="Acepto los términos y condiciones"
            variant="primary"
            size="md"
          />
          <Checkbox
            name="recibirNewsletter"
            control={control}
            label="Deseo recibir newsletters y promociones"
            variant="primary"
            size="md"
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
          Registrarse
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
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
  checkboxGroup: {
    gap: spacing.md,
    padding: spacing.sm,
  },
  submitSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
const paisesOptions = [
  { label: 'Argentina', value: 'AR' },
  { label: 'Bolivia', value: 'BO' },
  { label: 'Chile', value: 'CL' },
  { label: 'Colombia', value: 'CO' },
  { label: 'Ecuador', value: 'EC' },
  { label: 'España', value: 'ES' },
  { label: 'México', value: 'MX' },
  { label: 'Perú', value: 'PE' },
  { label: 'Uruguay', value: 'UY' },
  { label: 'Venezuela', value: 'VE' },
];
