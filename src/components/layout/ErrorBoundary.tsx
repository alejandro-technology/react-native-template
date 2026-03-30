import { View, StyleSheet } from 'react-native';
import React, { Component, ErrorInfo, PropsWithChildren } from 'react';
// Components
import { Text } from '@components/core/Text';
import { Button } from '@components/core/Button';
// Theme
import { spacing } from '@theme/spacing';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text variant="h3" style={styles.title}>
            Algo salió mal
          </Text>
          <Text variant="body" color="textSecondary" style={styles.message}>
            La aplicación encontró un error inesperado. Por favor, intenta de
            nuevo.
          </Text>
          {__DEV__ && this.state.error && (
            <Text variant="caption" color="error" style={styles.errorDetail}>
              {this.state.error.message}
            </Text>
          )}
          <Button variant="primary" size="lg" onPress={this.handleRetry}>
            Reintentar
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorDetail: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
