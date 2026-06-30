---
trigger: model_decision
---

# Dependencies Rules

The template relies on a curated set of libraries chosen for performance,
security, and New Architecture compatibility. Do not reach for a generic React
Native primitive when an approved library exists, and do not add a dependency
that duplicates one already in the stack.

## Core Mandates

1. **Use the approved library.** The mandated replacements below are not
   suggestions — the generic primitive is forbidden where a replacement exists.
2. **No duplication.** Before installing anything, check whether an approved
   dependency already covers the need.
3. **New Architecture first.** Every native dependency must be compatible with
   the React Native New Architecture (Fabric/TurboModules).
4. **Wrap transport/native libraries.** Access HTTP, connectivity, permissions,
   and similar capabilities through their module service wrapper, not directly.

## Mandated Replacements

| Concern | Do NOT use | Use |
|---|---|---|
| Lists | `FlatList`, `SectionList` | `FlashList` (`@shopify/flash-list`) |
| Images | `Image` | `react-native-fast-image`; SVG via `react-native-svg` |
| Local storage | `AsyncStorage` | `react-native-mmkv` |
| Client state | raw Context for app state | `zustand` (+ MMKV when persisted) |
| Server state | `useEffect` + `fetch`/`axios` | `@tanstack/react-query` |

## Approved Stack by Area

- **Forms & validation:** `react-hook-form` + `yup` + `@hookform/resolvers/yup`.
- **Navigation:** `@react-navigation/native` + `@react-navigation/native-stack`,
  strongly typed.
- **Security:** `react-native-keychain` (tokens), `jail-monkey` (root/jailbreak
  detection in `SecureProvider`).
- **Network & backend:** `axios` (wrapped in the `network` module),
  `@react-native-community/netinfo` (wrapped), `@react-native-firebase/*`,
  Supabase client, SQLite — each resolved through `CONFIG.SERVICE_PROVIDER`.
- **Config & env:** `react-native-config` (`CONFIG` in `src/config/config.ts`).
- **File & hardware:** `react-native-image-picker`,
  `react-native-permissions` (wrapped), `@react-native-community/datetimepicker`.

## Do Not

- Do not use a forbidden primitive from the replacements table.
- Do not call `axios`, NetInfo, or permissions APIs directly from feature code —
  go through the module wrapper.
- Do not add a library that overlaps an approved one.
- Do not introduce a native dependency without verifying New Architecture support.

## See Also

- Backend selection: [`architecture.md`](./architecture.md)
- Storage and persistence: [`state-management.md`](./state-management.md)

## Enforcement Checklist

Before committing, verify:
- [ ] Lists use `FlashList` (`@shopify/flash-list`) — never `FlatList` or `SectionList`
- [ ] Images use `FastImage` (`react-native-fast-image`) — never `Image` from react-native
- [ ] SVGs imported as components via `react-native-svg`
- [ ] Local storage uses `react-native-mmkv` — never `AsyncStorage`
- [ ] Sensitive data (tokens, passwords) uses `react-native-keychain`
- [ ] Forms use `react-hook-form` + `yup` + `@hookform/resolvers/yup`
- [ ] Server state uses `@tanstack/react-query` — never `useEffect + axios` for queries
- [ ] Global app state uses `zustand` — not raw Context
- [ ] HTTP calls go through the shared axios instance in `@modules/network`
- [ ] Connectivity checks use `getIsConnected()` or `useNetInfo()` from `@modules/network`

## Automated Audit

Run before committing to catch violations automatically:

```bash
# Note: Replace <AGENT_DIR> with your active agent directory (e.g., .agents, .opencode, .claude)
./<AGENT_DIR>/scripts/audit-deps.sh

# Scan a specific directory
./<AGENT_DIR>/scripts/audit-deps.sh src/modules/orders/
```
