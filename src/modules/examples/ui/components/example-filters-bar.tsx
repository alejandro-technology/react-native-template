import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, Modal, Select, Text, TextInput } from '@components/core';
import type { SelectOption } from '@components/core/Select';

import { spacing } from '@theme/index';

import type { ExampleListFilters } from '../../domain/example-query.model';
import type {
  ExampleFilterField,
  ExampleSourceCapabilities,
} from '../../application/example-sources.config';

interface Props {
  capabilities: ExampleSourceCapabilities;
  filters: ExampleListFilters;
  onChange: (filters: ExampleListFilters) => void;
}

function getSelectValue(
  field: ExampleFilterField,
  value: unknown,
): SelectOption | null {
  if (typeof value !== 'string') return null;
  return field.options?.find(option => option.value === value) ?? null;
}

export function ExampleFiltersBar({ capabilities, filters, onChange }: Props) {
  const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);

  if (!capabilities.supportsSearch && !capabilities.supportsFilters) {
    return null;
  }

  const hasAdvancedFilters =
    capabilities.supportsFilters && capabilities.filterFields.length > 0;

  const activeFiltersCount = capabilities.filterFields.reduce(
    (count, field) => {
      const value = filters.advanced?.[field.key];

      if (typeof value === 'string' && value.trim().length > 0) {
        return count + 1;
      }

      return count;
    },
    0,
  );

  function handleFiltersModalClose() {
    setIsFiltersModalVisible(false);
  }

  return (
    <>
      <View style={styles.container}>
        {capabilities.supportsSearch ? (
          <TextInput
            placeholder="Escribe para buscar"
            value={filters.searchText ?? ''}
            onChangeText={searchText => onChange({ ...filters, searchText })}
            leftIcon={<Icon name="search" size={18} color="textSecondary" />}
            fullWidth
            containerStyle={styles.searchInput}
          />
        ) : (
          <View style={styles.searchInput} />
        )}

        {hasAdvancedFilters ? (
          <Button
            variant={activeFiltersCount > 0 ? 'primary' : 'outlined'}
            onPress={() => setIsFiltersModalVisible(true)}
            accessibilityLabel="Abrir filtros"
            style={styles.filterButton}
          >
            <Icon
              name="filter"
              size={18}
              color={activeFiltersCount > 0 ? 'onPrimary' : 'primary'}
            />
          </Button>
        ) : null}
      </View>

      {hasAdvancedFilters ? (
        <Modal
          visible={isFiltersModalVisible}
          onRequestClose={handleFiltersModalClose}
          title="Filtros"
          closeOnBackdropPress
          size="md"
        >
          <View style={styles.modalContent}>
            <Text variant="bodySmall" color="textSecondary">
              Ajusta los filtros disponibles para esta fuente.
            </Text>

            {capabilities.filterFields.map(field => {
              const currentValue = filters.advanced?.[field.key];

              if (field.type === 'text') {
                return (
                  <TextInput
                    key={field.key}
                    label={field.label}
                    placeholder={`Filtrar por ${field.label.toLowerCase()}`}
                    value={typeof currentValue === 'string' ? currentValue : ''}
                    onChangeText={value =>
                      onChange({
                        ...filters,
                        advanced: {
                          ...(filters.advanced ?? {}),
                          [field.key]: value,
                        },
                      })
                    }
                    fullWidth
                  />
                );
              }

              return (
                <Select
                  key={field.key}
                  label={field.label}
                  options={field.options ?? []}
                  value={getSelectValue(field, currentValue)}
                  onChange={option =>
                    onChange({
                      ...filters,
                      advanced: {
                        ...(filters.advanced ?? {}),
                        [field.key]: option?.value ?? undefined,
                      },
                    })
                  }
                  containerStyle={styles.fullWidth}
                />
              );
            })}

            <View style={styles.actions}>
              <Button
                variant="ghost"
                onPress={() =>
                  onChange({
                    ...filters,
                    advanced: {},
                  })
                }
              >
                Limpiar
              </Button>

              <Button variant="primary" onPress={handleFiltersModalClose}>
                Aplicar
              </Button>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  modalContent: {
    gap: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
