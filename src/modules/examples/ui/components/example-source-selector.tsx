import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Select } from '@components/core';
import type { SelectOption } from '@components/core/Select';

import { spacing } from '@theme/index';

import type { ExampleDataSource } from '../../domain/example-source.model';
import { EXAMPLE_SOURCE_DEFINITIONS } from '../../application/example-sources.config';

interface Props {
  source: ExampleDataSource;
  onChange: (source: ExampleDataSource) => void;
}

const options: SelectOption[] = EXAMPLE_SOURCE_DEFINITIONS.map(source => ({
  label: source.label,
  value: source.source,
}));

export function ExampleSourceSelector({ source, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Select
        label="Fuente de datos"
        modalTitle="Seleccionar API"
        options={options}
        value={options.find(option => option.value === source) ?? null}
        onChange={option => {
          if (!option) return;
          onChange(option.value as ExampleDataSource);
        }}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
