import React from 'react';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';

import { Text } from '@components/core';
import { spacing } from '@theme/index';
import { borderRadius } from '@theme/borders';
import { useTheme } from '@theme/index';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ComponentCard from './ComponentCard';
import { COMPONENTS_CONFIG } from './componentsConfig';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import {
  ExamplesRoutes,
  type ExamplesStackParamList,
} from '@navigation/routes/examples.routes';
import { ProductsRoutes, UsersRoutes, RootRoutes } from '@navigation/routes';
import { useNavigationRoot } from '@navigation/hooks';

function LandingView() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ExamplesStackParamList>>();
  const { navigate } = useNavigationRoot();
  const { mode } = useTheme();

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
            6
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
          <Text variant="h3" color="primary">
            {mode === 'dark' ? '🌙' : '☀️'}
          </Text>
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
        {COMPONENTS_CONFIG.map(component => (
          <ComponentCard
            key={component.title}
            title={component.title}
            description={component.description}
            icon={component.icon}
            color={component.color}
            onPress={() => {
              if (component.screen in ExamplesRoutes) {
                navigation.navigate(component.screen as ExamplesRoutes);
              } else if (component.screen in ProductsRoutes) {
                navigate(RootRoutes.Products, {
                  screen: ProductsRoutes.ProductList,
                });
              } else if (component.screen in UsersRoutes) {
                navigate(RootRoutes.Users, {
                  screen: UsersRoutes.UserList,
                });
              }
            }}
          />
        ))}
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
  footer: {
    marginTop: spacing['2xl'],
    paddingTop: spacing.lg,
  },
  footerContent: {
    alignItems: 'center',
  },
});

export default LandingView;
