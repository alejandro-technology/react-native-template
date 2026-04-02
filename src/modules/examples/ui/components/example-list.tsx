import React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';

import {
  EmptyState,
  ErrorState,
  ItemSeparatorComponent,
  LoadingState,
  OfflineBanner,
} from '@components/layout';
import { Icon } from '@components/core';
import { useIsConnected } from '@modules/network/application/connectivity.storage';

import { spacing } from '@theme/index';

import type { ExampleListItem } from '../../domain/example-list-item.model';
import { ExampleListItem as ExampleListItemView } from './example-list-item';

interface Props {
  items?: ExampleListItem[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  hasNextPage?: boolean;
}

const renderItem: ListRenderItem<ExampleListItem> = ({ item }) => (
  <ExampleListItemView item={item} />
);

export function ExampleList({
  items,
  isLoading,
  isError,
  error,
  isRefetching,
  onRefresh,
  onEndReached,
  hasNextPage,
}: Props) {
  const isConnected = useIsConnected();

  if (isLoading) {
    return <LoadingState message="Cargando lista..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message || 'No se pudieron cargar los datos'}
        onRetry={onRefresh}
      />
    );
  }

  if (!items?.length) {
    return (
      <EmptyState
        title="Sin resultados"
        message="No se encontraron elementos"
        icon={<Icon name="package" size={42} />}
      />
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => `${item.source}-${item.id}`}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(isRefetching)}
            onRefresh={onRefresh}
          />
        }
        onEndReached={isConnected && hasNextPage ? onEndReached : undefined}
        onEndReachedThreshold={0.6}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
  },
});
