---
category: infrastructure
priority: high
tags: [services, providers, http, firebase, mock, keychain, security]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Servicios de Infrastructure

La capa `infrastructure/` implementa contratos del dominio usando el patrón de providers del proyecto.

---

## Regla 1: Todo módulo CRUD usa factory `http | firebase | mock`

**SIEMPRE**: un feature CRUD debe tener:

```text
infrastructure/
├── {feature}.service.ts
├── {feature}.http.service.ts
├── {feature}.firebase.service.ts
└── {feature}.mock.service.ts
```

### Factory obligatorio

- lee `CONFIG.SERVICE_PROVIDER`
- retorna el singleton del provider
- el único `throw` permitido en infrastructure está en el `default` del factory

```typescript
function createProductService(): ProductRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return productHttpService;
    case 'firebase':
      return productFirebaseService;
    case 'mock':
      return productMockService;
    default:
      throw new Error(
        `Unknown product service provider: ${CONFIG.SERVICE_PROVIDER}`,
      );
  }
}
```

---

## Regla 2: Los providers siguen el patrón actual del proyecto

### HTTP

- usa `axiosService`
- usa `API_ROUTES`
- maneja errores con `manageAxiosError`
- soporta callback `setAuthExpiredCallback` para notificar logout

### Firebase

- usa wrappers compartidos como `firestoreService`
- usa `manageFirebaseError`
- no usa SDK raw en módulos feature si ya existe wrapper compartido
- **IMPORTANTE**: Firestore no soporta búsqueda full-text ni OR queries. Para datasets grandes:
  - Usar `limit` para evitar reads excesivos
  - Considerar Algolia/Elasticsearch para búsqueda avanzada

### Mock

- implementa el mismo contrato del repositorio
- respeta exactamente el shape del dominio, especialmente `Date`
- **NUNCA**: almacenar passwords en plaintext en producción

### Regla transversal

**SIEMPRE**: los métodos async retornan `Promise<T | Error>` o `Promise<void | Error>`, nunca lanzan excepciones.

---

## Regla 3: Seguridad en storage

**SIEMPRE**: datos sensibles deben usar almacenamiento seguro.

### MMKV con encriptación

```typescript
// Inicializar al inicio de la app (en AppProvider)
await initSecureStorage();

// Obtener instancia segura
const secureStorage = getSecureStorage();
```

### Keychain/Keystore

- `react-native-keychain` para almacenar la encryption key de MMKV
- La key se genera aleatoriamente y se almacena en el keychain del OS
- En iOS: `ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY`
- Fallback para development donde Keychain no está disponible

### Cómo verificar

```bash
# Infrastructure no lanza throw dentro de métodos async
grep "throw" src/modules/*/infrastructure/*.service.ts

# Servicios Firebase de features usan wrappers compartidos
grep -r "firestoreService" src/modules/*/infrastructure/*.firebase.service.ts

# Storage seguro se inicializa
grep -r "initSecureStorage" src/providers/AppProvider.tsx
```

---

## Regla 4: Token refresh con logout sync

**SIEMPRE**: cuando el token refresh falla, el `AxiosService` notifica al auth store.

### Patrón

```typescript
// En axios.service.ts
setAuthExpiredCallback(() => {
  // Notificar al auth store que la sesión expiró
});

// En AuthProvider.tsx
useEffect(() => {
  axiosService.setAuthExpiredCallback(() => {
    setUnauthenticated();
  });
  return () => {
    axiosService.setAuthExpiredCallback(null);
  };
}, []);
```

---

## SSL Pinning (Opcional para Producción)

Para apps enterprise que requieren seguridad adicional, considere implementar SSL certificate pinning en `AxiosService`.

### Opción 1: Usando `react-native-ssl-pinning`

```bash
bun add react-native-ssl-pinning
```

```typescript
// En axios.service.ts
import { SSLPinning } from 'react-native-ssl-pinning';

// Configurar en constructor
SSLPinning.setCertificates({
  certs: ['cert1', 'cert2'], // hashes SHA-256 de certificados
});
```

### Consideraciones

- Mantener certificados actualizados antes de que expiren
- Tener mecanismo de rotación de certificados
- Considerar fallback para development/staging
- Documentar los certificados en el repo (no las private keys)

### Recursos

- [OWASP Certificate Pinning Guide](https://owasp.org/www-community-mobile/Mobile_Top_10_2014-M3)
- [React Native SSL Pinning](https://github.com/maxs15/react-native-ssl-pinning)

**Referencias**:
- `src/modules/products/infrastructure/product.service.ts`
- `src/modules/products/infrastructure/product.http.service.ts`
- `src/modules/products/infrastructure/product.firebase.service.ts`
- `src/modules/products/infrastructure/product.mock.service.ts`
- `src/modules/network/infrastructure/axios.service.ts`
- `src/config/storage.ts`
