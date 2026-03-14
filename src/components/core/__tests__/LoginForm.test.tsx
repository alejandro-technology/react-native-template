/**
 * Ejemplo avanzado: Testear un formulario de login completo
 * Demuestra:
 * - Integración con react-hook-form
 * - Validación de formularios
 * - Manejo de estados asíncronos
 * - Testing de flujos completos
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@utils/test-utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput } from '../TextInput';
import { Button } from '../Button';
import { View } from 'react-native';

// Schema de validación
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email es inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Componente de formulario de ejemplo
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <View testID="login-form">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Email"
            placeholder="email@ejemplo.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="email-input"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            testID="password-input"
          />
        )}
      />

      <Button
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        testID="submit-button"
      >
        Iniciar Sesión
      </Button>
    </View>
  );
}

describe('LoginForm - Ejemplo Avanzado', () => {
  it('debe renderizar todos los campos del formulario', () => {
    const onSubmitMock = jest.fn();
    const { getByTestId, getByText } = render(
      <LoginForm onSubmit={onSubmitMock} />
    );

    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Contraseña')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('debe mostrar errores de validación cuando los campos están vacíos', async () => {
    const onSubmitMock = jest.fn();
    const { getByTestId, findByText } = render(
      <LoginForm onSubmit={onSubmitMock} />
    );

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    // Esperar a que aparezcan los mensajes de error
    expect(await findByText('El email es requerido')).toBeTruthy();
    expect(
      await findByText('La contraseña debe tener al menos 6 caracteres')
    ).toBeTruthy();

    // No debe llamar al submit si hay errores
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('debe mostrar error cuando el email es inválido', async () => {
    const onSubmitMock = jest.fn();
    const { getByTestId, findByText } = render(
      <LoginForm onSubmit={onSubmitMock} />
    );

    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'correo-invalido');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    expect(await findByText('El email es inválido')).toBeTruthy();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('debe permitir enviar el formulario con datos válidos', async () => {
    const onSubmitMock = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(<LoginForm onSubmit={onSubmitMock} />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const submitButton = getByTestId('submit-button');

    // Ingresar datos válidos
    fireEvent.changeText(emailInput, 'usuario@ejemplo.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Enviar formulario
    fireEvent.press(submitButton);

    // Esperar a que se llame al submit con los datos correctos
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalled();
    });

    // Verificar los datos enviados (react-hook-form pasa un segundo argumento event)
    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      email: 'usuario@ejemplo.com',
      password: 'password123',
    });
  });

  it('debe mostrar estado de loading durante el submit', async () => {
    // Crear un submit que tarda un poco
    const onSubmitMock = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { getByTestId, UNSAFE_getByType } = render(
      <LoginForm onSubmit={onSubmitMock} />
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const submitButton = getByTestId('submit-button');

    fireEvent.changeText(emailInput, 'usuario@ejemplo.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);

    // Debe mostrar el ActivityIndicator mientras está submitting
    const ActivityIndicator = require('react-native').ActivityIndicator;
    await waitFor(() => {
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    // Esperar a que termine
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalled();
    });
  });

  // Nota: Para testing de errores de servidor en producción,
  // sería mejor testear el componente completo que maneja el error
  // y muestra un mensaje al usuario, en lugar de solo verificar
  // que se llama la función.
});
