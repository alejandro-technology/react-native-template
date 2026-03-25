import React from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { Text, Button } from '@components/core';
import { RootLayout } from '@components/layout';
import SignInForm from './components/signin/SignInForm';
// Navigation
import { useNavigationAuthentication } from '@navigation/hooks';
import { AuthenticationRoutes } from '@navigation/routes';
// Theme
import { spacing } from '@theme/index';

/**
 * Vista principal de inicio de sesion de usuario
 */
export default function SignInView() {
  const { navigate } = useNavigationAuthentication();

  return (
    <RootLayout padding="md">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1">Inicio de sesion</Text>
          <Text variant="body" color="textSecondary">
            Ingrese sus credenciales para acceder a su cuenta
          </Text>
        </View>

        <SignInForm />

        <View style={styles.footer}>
          <Text variant="body" color="textSecondary">
            ¿No tienes cuenta?
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => navigate(AuthenticationRoutes.SignUp)}
          >
            Registrarse
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
