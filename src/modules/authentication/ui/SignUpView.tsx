import React from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { Text, Button } from '@components/core';
import { RootLayout } from '@components/layout';
import SignUpForm from './components/signup/SignUpForm';
// Navigation
import { useNavigationAuthentication } from '@navigation/hooks';
import { AuthenticationRoutes } from '@navigation/routes';
// Theme
import { spacing } from '@theme/index';

export default function SignUpView() {
  const { navigate } = useNavigationAuthentication();

  return (
    <RootLayout
      title="Registrarse"
      padding="lg"
      rightOptions={[{ icon: 'button' }, { icon: 'warning' }]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1">Registro de Usuario</Text>
          <Text variant="body" color="textSecondary">
            Complete el formulario para crear su cuenta
          </Text>
        </View>

        <SignUpForm />

        <View style={styles.footer}>
          <Text variant="body" color="textSecondary">
            ¿Ya tienes cuenta?
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => navigate(AuthenticationRoutes.SignIn)}
          >
            Iniciar sesión
          </Button>
        </View>
      </View>
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
});
