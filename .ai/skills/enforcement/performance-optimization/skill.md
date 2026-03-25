---
name: performance-optimization
category: enforcement
layer: cross-cutting
priority: medium
last_updated: 2026-03-25
tags:
  - flashlist
  - memoization
  - re-renders
  - animations
  - optimization
triggers:
  - 'Building lists'
  - 'Optimizing re-renders'
  - 'Performance-sensitive code'
description: Enforce performance best practices for lists, memoization, animations, and render optimization. Use when building lists, optimizing re-renders, or reviewing performance-sensitive code.
---

# Performance Optimization Skill

Enforces React Native performance patterns for lists, rendering, and animations.

## When to Use

- Building list screens
- Optimizing component re-renders
- Adding animations
- Reviewing performance-sensitive code
- Profiling render cycles

## List Performance

### FlashList Over FlatList

This project uses `@shopify/flash-list` (v2.2.2) for all list rendering:

```typescript
import { FlashList, ListRenderItem } from '@shopify/flash-list';

// Extract renderItem outside component to prevent re-creation
const renderProductItem: ListRenderItem<ProductEntity> = ({ item }) => (
  <ProductItem product={item} />
);

export function ProductList({ searchText }: ProductListProps) {
  const { data: products } = useProducts({ searchText });

  return (
    <FlashList
      data={products}
      keyExtractor={item => item.id}
      renderItem={renderProductItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}
```

### List Optimization Rules

| Rule                                           | Why                                          |
| ---------------------------------------------- | -------------------------------------------- |
| `renderItem` defined outside component         | Prevents function re-creation on each render |
| `keyExtractor` uses stable `item.id`           | Prevents unnecessary re-mounts               |
| `ItemSeparatorComponent` is a shared component | Reused across all lists                      |
| `keyboardShouldPersistTaps="handled"`          | Taps work while keyboard is visible          |
| `keyboardDismissMode="on-drag"`                | Keyboard dismisses on scroll                 |

## Component Memoization

### Item Components Use `React.memo`

```typescript
export const ProductItem = React.memo(function ProductItem({
  product,
}: ProductItemProps) {
  // Component body
});
```

### When to Use `React.memo`

| Use `React.memo`                  | Don't Use `React.memo`                    |
| --------------------------------- | ----------------------------------------- |
| List item components              | Top-level view components                 |
| Components receiving stable props | Components with frequently changing props |
| Components with expensive renders | Simple wrapper components                 |

### When to Use `useMemo` / `useCallback`

```typescript
// useMemo: Expensive computations
const filteredItems = useMemo(
  () => items.filter(item => item.name.includes(search)),
  [items, search],
);

// useCallback: Stable function references for memoized children
const handlePress = useCallback(() => {
  navigate(Routes.Detail, { id: item.id });
}, [item.id]);
```

## Search Debouncing

All search inputs use debounced values to prevent excessive API calls:

```typescript
export function ProductsListView() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500); // 500ms delay

  return (
    <>
      <Header searchText={searchText} setSearchText={setSearchText} />
      <ProductList searchText={debouncedSearch} />
    </>
  );
}
```

## Animation Performance

### Layout-Level Animations (Not View-Level)

`useFocusFadeIn` is used **only in `RootLayout`**. Individual views and list items do NOT use animation hooks directly — the fade-in animation is inherited from the layout.

```typescript
// CORRECT: RootLayout handles the fade-in animation automatically
<RootLayout padding="md" onPress={goBack} title="Detalle">
  <View>{/* content animates via layout */}</View>
</RootLayout>

// WRONG: Using useFocusFadeIn in individual views or list items
const { animatedStyle } = useFocusFadeIn({ ... });
<Animated.View style={animatedStyle}>{/* ... */}</Animated.View>

// WRONG: Mount-based animation
useEffect(() => {
  Animated.timing(opacity, { toValue: 1, duration: 600 }).start();
}, []);
```

### List Items — No Animation Hooks

List items are simple, memoized components without animation wrappers:

```typescript
export const ProductItem = React.memo(function ProductItem({
  product,
}: ProductItemProps) {
  return (
    <Card onPress={handlePress}>
      <View style={styles.info}>
        <Text variant="h3">{product.name}</Text>
      </View>
    </Card>
  );
});
```

### Animation Best Practices

| Practice                              | Why                                       |
| ------------------------------------- | ----------------------------------------- |
| Use `useNativeDriver: true`           | Runs on UI thread, not JS thread          |
| Animation at layout level only        | Consistent behavior, less boilerplate     |
| No animation hooks in list items      | Better performance, simpler components    |
| Use focus hooks over mount effects    | Replays correctly on navigation           |

## React Query Performance

### Automatic Cache Management

React Query handles caching, deduplication, and background refetching:

```typescript
// Multiple components using same query = single network request
const { data } = useProducts({ searchText }); // Component A
const { data } = useProducts({ searchText }); // Component B (uses cache)
```

### Conditional Fetching

```typescript
// Don't fetch until we have an ID
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: async () => {
      /* ... */
    },
    enabled: enabled && Boolean(id), // Prevents unnecessary fetches
  });
}
```

## Validation Rules

| Rule | Description                                              |
| ---- | -------------------------------------------------------- |
| R1   | Use FlashList, never FlatList                            |
| R2   | `renderItem` defined outside component body              |
| R3   | List item components wrapped in `React.memo`             |
| R4   | Search inputs use `useDebounce(value, 500)`              |
| R5   | Animations handled at layout level (`RootLayout`), not in individual views |
| R6   | List items do NOT use animation hooks — keep them simple and memoized      |
| R7   | `keyExtractor` uses stable entity `id`                   |
| R8   | React Query `enabled` guards prevent unnecessary fetches |

## Anti-Patterns

```typescript
// WRONG: FlatList instead of FlashList
<FlatList data={products} renderItem={...} />

// WRONG: renderItem defined inside component (re-created every render)
export function ProductList() {
  const renderItem = ({ item }) => <ProductItem product={item} />;
  return <FlashList renderItem={renderItem} />;
}

// WRONG: No debounce on search
<TextInput onChangeText={text => fetchProducts(text)} />

// WRONG: useEffect-based animation
useEffect(() => { fadeIn(); }, []);

// WRONG: Inline styles in list items
<View style={{ padding: 12, margin: 8 }}>{/* Re-creates object every render */}</View>
```
