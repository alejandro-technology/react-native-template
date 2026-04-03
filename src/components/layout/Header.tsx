import React from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import {
  AnimatedPressable,
  Button,
  Icon,
  IconName,
  Text,
  TextInput,
} from '@components/core';
// Theme
import { useTheme, spacing } from '@theme/index';
import { useAppStorage } from '@modules/core';
import { Searchbar } from '@modules/core/application/app.storage';

interface HeaderProps {
  title: string;
  onPress?: () => void;
  pressIcon?: IconName;
  searchbar?: Searchbar;
  onPressFilter?: () => void;
}

export function Header(props: HeaderProps) {
  const { onPress, onPressFilter } = props;
  const { title, searchbar = '', pressIcon } = props;
  const {
    colors: { surface, border },
  } = useTheme();
  const { searchText, setSearchText } = useAppStorage(
    state => state.searchbar[searchbar] || {},
  );

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: surface, borderBottomColor: border },
      ]}
    >
      <View style={styles.header}>
        <Text variant="h1">{title}</Text>
        {onPress && (
          <AnimatedPressable onPress={onPress} testID="header-action-button">
            <Icon name={pressIcon || 'menu'} size={spacing.lg} />
          </AnimatedPressable>
        )}
      </View>

      <View style={styles.searchbar}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar usuarios..."
          containerStyle={styles.searchInput}
        />
        {onPressFilter && (
          <Button
            onPress={onPressFilter}
            style={styles.filter}
            variant="outlined"
          >
            <Icon name="filter" size={spacing.base} />
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  filter: {
    padding: spacing.md,
  },
});
