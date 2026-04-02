import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';

import ComponentCard from './components/ComponentCard';
import { Text, Icon, Button } from '@components/core';
import { useSignoutMutation } from '@modules/authentication/application/auth.mutations';

import { spacing } from '@theme/index';
import { useTheme } from '@theme/index';
import { borderRadius } from '@theme/borders';

import { COMPONENTS_CONFIG } from './components/componentsConfig';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { PrivateRoutes, ProductsRoutes, UsersRoutes } from '@navigation/routes';

function AuthExampleView() {
  const { navigate } = useNavigation();
  const { mode } = useTheme();
  const { mutate: signout, isPending: isSigningOut } = useSignoutMutation();

  const { opacityAnim, translateYAnim } = useHeroAnimation();

  const heroStyle = {
    opacity: opacityAnim,
    transform: [{ translateY: translateYAnim }],
  };

  return (
    <ScrollView
      contentContainerStyle={styles.landingContainer}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Animated.View style={[styles.heroSection, heroStyle]}>
        <View style={styles.badge}>
          <Text variant="caption" color="primary" transform="uppercase">
            React Native
          </Text>
        </View>
        <Text variant="h1" align="center" style={styles.heroTitle}>
          Component
          <Text color="primary"> Library</Text>
        </Text>
        <Text
          variant="body"
          align="center"
          color="textSecondary"
          style={styles.heroSubtitle}
        >
          Explore and test our components
        </Text>
      </Animated.View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text variant="h3" color="primary">
            9
          </Text>
          <Text variant="caption" color="textSecondary">
            Components
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text variant="h3" color="primary">
            20+
          </Text>
          <Text variant="caption" color="textSecondary">
            Variants
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon
            name={mode === 'dark' ? 'moon' : 'sun'}
            size={22}
            color="primary"
          />
          <Text variant="caption" color="textSecondary">
            {mode}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text variant="h5" color="textSecondary" transform="uppercase">
          Available Components
        </Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.cardsContainer}>
        {COMPONENTS_CONFIG.filter(component => component.auth).map(
          component => (
            <ComponentCard
              key={component.title}
              title={component.title}
              description={component.description}
              icon={component.icon}
              color={component.color}
              onPress={() => {
                if (component.screen in ProductsRoutes) {
                  const args = [
                    PrivateRoutes.Products,
                    { screen: component.screen },
                  ] as const;
                  navigate(...(args as never));
                } else if (component.screen in UsersRoutes) {
                  const args = [
                    PrivateRoutes.Users,
                    { screen: component.screen },
                  ] as const;
                  navigate(...(args as never));
                }
              }}
            />
          ),
        )}
      </View>

      <View style={styles.logoutContainer}>
        <Button
          variant="outlined"
          size="lg"
          fullWidth
          loading={isSigningOut}
          onPress={() => signout()}
        >
          Cerrar sesión
        </Button>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Text variant="caption" color="textSecondary" align="center">
            Built with React Native • TypeScript • Jest
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  landingContainer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  heroTitle: {
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    maxWidth: 280,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginLeft: spacing.md,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  logoutContainer: {
    marginTop: spacing.xl,
  },
  footer: {
    marginTop: spacing['2xl'],
    paddingTop: spacing.lg,
  },
  footerContent: {
    alignItems: 'center',
  },
});

export default AuthExampleView;
