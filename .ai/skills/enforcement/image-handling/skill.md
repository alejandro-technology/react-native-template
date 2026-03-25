---
name: image-handling
category: enforcement
layer: cross-cutting
priority: medium
last_updated: 2026-03-25
tags:
  - images
  - camera
  - gallery
  - upload
  - compression
  - cache
triggers:
  - 'Adding image features'
  - 'Implementing image upload'
  - 'Image picker integration'
  - 'Image optimization'
description: Enforce image handling patterns for selection (camera/gallery), compression, upload to Firebase Storage or HTTP, caching, placeholders, and permission management.
---

# Image Handling Skill

Enforces consistent patterns for image selection, processing, upload, display, and caching.

## When to Use

- Implementing image picker (camera or gallery)
- Uploading images to Firebase Storage or REST API
- Displaying remote images with caching
- Adding avatar or photo features
- Optimizing image loading performance

## Architecture Overview

```
┌────────────────────────────────────────────────────┐
│  UI Layer                                           │
│  ┌──────────────┐  ┌─────────────────────┐        │
│  │ ImagePicker  │  │ CachedImage         │        │
│  │ Component    │  │ Component           │        │
│  └──────┬───────┘  └─────────────────────┘        │
├─────────┼─────────────────────────────────────────┤
│  Application Layer                                  │
│  ┌──────┴───────┐  ┌─────────────────────┐        │
│  │ useImagePick │  │ useImageUpload      │        │
│  │ hook         │  │ mutation            │        │
│  └──────┬───────┘  └──────────┬──────────┘        │
├─────────┼─────────────────────┼───────────────────┤
│  Infrastructure Layer                               │
│  ┌──────┴───────┐  ┌─────────┴──────────┐        │
│  │ Image Picker │  │ Storage Service    │        │
│  │ Service      │  │ (Firebase/HTTP)    │        │
│  └──────────────┘  └────────────────────┘        │
├────────────────────────────────────────────────────┤
│  Domain Layer                                       │
│  ┌──────────────────────────────────────────┐     │
│  │ ImageAsset model, compression config      │     │
│  └──────────────────────────────────────────┘     │
└────────────────────────────────────────────────────┘
```

## Rules

### R1: Define Image Types in Domain Layer

```typescript
// ✅ CORRECT: Domain model for images
// src/modules/{feature}/domain/image.model.ts (or in the feature model)
export interface ImageAsset {
  uri: string;
  fileName: string;
  type: string;       // MIME type: 'image/jpeg', 'image/png'
  fileSize: number;   // Bytes
  width: number;
  height: number;
}

export interface ImageUploadResult {
  url: string;
  path: string;       // Storage path for deletion
}

export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,           // 0-1
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;
```

### R2: Image Picker with Permissions

Use `react-native-image-picker` with proper permission handling.

```typescript
// ✅ CORRECT: Image picker service
// src/modules/{feature}/infrastructure/image-picker.service.ts
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import type { ImageAsset } from '../domain/image.model';
import { IMAGE_CONFIG } from '../domain/image.model';

const commonOptions: CameraOptions & ImageLibraryOptions = {
  mediaType: 'photo',
  maxWidth: IMAGE_CONFIG.MAX_WIDTH,
  maxHeight: IMAGE_CONFIG.MAX_HEIGHT,
  quality: IMAGE_CONFIG.QUALITY,
  includeBase64: false,
};

function parseResponse(response: ImagePickerResponse): ImageAsset | Error {
  if (response.didCancel) {
    return new Error('Selección cancelada');
  }

  if (response.errorCode) {
    switch (response.errorCode) {
      case 'camera_unavailable':
        return new Error('La cámara no está disponible');
      case 'permission':
        return new Error('Permiso denegado para acceder a la cámara');
      default:
        return new Error(response.errorMessage ?? 'Error al seleccionar imagen');
    }
  }

  const asset = response.assets?.[0];
  if (!asset?.uri) {
    return new Error('No se pudo obtener la imagen');
  }

  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `image_${Date.now()}.jpg`,
    type: asset.type ?? 'image/jpeg',
    fileSize: asset.fileSize ?? 0,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
  };
}

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') return true; // Handled by Info.plist

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Permiso de cámara',
      message: 'La app necesita acceso a tu cámara para tomar fotos',
      buttonPositive: 'Aceptar',
      buttonNegative: 'Cancelar',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export const imagePickerService = {
  async pickFromCamera(): Promise<ImageAsset | Error> {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return new Error('Permiso de cámara denegado');
    }
    const response = await launchCamera(commonOptions);
    return parseResponse(response);
  },

  async pickFromGallery(): Promise<ImageAsset | Error> {
    const response = await launchImageLibrary(commonOptions);
    return parseResponse(response);
  },

  showPickerOptions(
    onCamera: () => void,
    onGallery: () => void,
  ): void {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        { text: 'Cámara', onPress: onCamera },
        { text: 'Galería', onPress: onGallery },
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  },
};
```

**Key rules:**
- Returns `ImageAsset | Error` following the project's error pattern
- Permission messages in Spanish
- Uses `IMAGE_CONFIG` constants — no hardcoded values
- Compression happens at pick time via `maxWidth`/`maxHeight`/`quality`

### R3: Image Upload Service (Factory Pattern)

```typescript
// ✅ CORRECT: Firebase Storage upload
// src/modules/{feature}/infrastructure/image-upload.firebase.service.ts
import storage from '@react-native-firebase/storage';
import type { ImageAsset, ImageUploadResult } from '../domain/image.model';

class FirebaseImageUploadService {
  async upload(
    image: ImageAsset,
    storagePath: string,
  ): Promise<ImageUploadResult | Error> {
    try {
      const ref = storage().ref(storagePath);
      await ref.putFile(image.uri);
      const url = await ref.getDownloadURL();

      return { url, path: storagePath };
    } catch (error) {
      return new Error('Error al subir la imagen');
    }
  }

  async delete(storagePath: string): Promise<void | Error> {
    try {
      await storage().ref(storagePath).delete();
    } catch (error) {
      return new Error('Error al eliminar la imagen');
    }
  }
}

export default new FirebaseImageUploadService();
```

```typescript
// ✅ CORRECT: HTTP upload (multipart/form-data)
// src/modules/{feature}/infrastructure/image-upload.http.service.ts
import { axiosService } from '@modules/network/infrastructure/axios.service';
import { manageAxiosError } from '@modules/network/infrastructure/axios.error';
import type { ImageAsset, ImageUploadResult } from '../domain/image.model';

class HttpImageUploadService {
  async upload(
    image: ImageAsset,
    endpoint: string,
  ): Promise<ImageUploadResult | Error> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: image.fileName,
        type: image.type,
      } as any);

      const response = await axiosService.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return {
        url: response.data.url,
        path: response.data.path,
      };
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async delete(imagePath: string): Promise<void | Error> {
    try {
      await axiosService.delete(`/images/${encodeURIComponent(imagePath)}`);
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

export default new HttpImageUploadService();
```

### R4: Application Layer Hook

```typescript
// ✅ CORRECT: Image upload mutation
// src/modules/{feature}/application/{feature}-image.mutations.ts
import { useMutation } from '@tanstack/react-query';
import type { ImageAsset } from '../domain/image.model';
import imageUploadService from '../infrastructure/image-upload.service';

export function use{Feature}ImageUpload() {
  return useMutation({
    mutationFn: async ({ image, path }: { image: ImageAsset; path: string }) => {
      const result = await imageUploadService.upload(image, path);
      if (result instanceof Error) throw result;
      return result;
    },
  });
}
```

```typescript
// ✅ CORRECT: Image picker hook
// src/hooks/useImagePicker.ts
import { useState, useCallback } from 'react';
import type { ImageAsset } from '@modules/{feature}/domain/image.model';
import { imagePickerService } from '@modules/{feature}/infrastructure/image-picker.service';

export function useImagePicker() {
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFromCamera = useCallback(async () => {
    setError(null);
    const result = await imagePickerService.pickFromCamera();
    if (result instanceof Error) {
      setError(result.message);
      return;
    }
    setImage(result);
  }, []);

  const pickFromGallery = useCallback(async () => {
    setError(null);
    const result = await imagePickerService.pickFromGallery();
    if (result instanceof Error) {
      setError(result.message);
      return;
    }
    setImage(result);
  }, []);

  const showPicker = useCallback(() => {
    imagePickerService.showPickerOptions(pickFromCamera, pickFromGallery);
  }, [pickFromCamera, pickFromGallery]);

  const clear = useCallback(() => {
    setImage(null);
    setError(null);
  }, []);

  return { image, error, pickFromCamera, pickFromGallery, showPicker, clear };
}
```

### R5: Cached Image Display

Use `react-native-fast-image` for efficient image caching and display.

```typescript
// ✅ CORRECT: Cached image component
// src/components/core/CachedImage.tsx
import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import FastImage, { type Source } from 'react-native-fast-image';
import { useTheme, spacing } from '@theme/index';

interface CachedImageProps {
  uri: string;
  width: number;
  height: number;
  borderRadius?: number;
  fallback?: React.ReactNode;
  priority?: 'low' | 'normal' | 'high';
}

export function CachedImage({
  uri,
  width,
  height,
  borderRadius = 0,
  fallback,
  priority = 'normal',
}: CachedImageProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) return <>{fallback}</>;

  const priorityMap = {
    low: FastImage.priority.low,
    normal: FastImage.priority.normal,
    high: FastImage.priority.high,
  };

  return (
    <View style={{ width, height, borderRadius, overflow: 'hidden' }}>
      <FastImage
        source={{
          uri,
          priority: priorityMap[priority],
          cache: FastImage.cacheControl.immutable,
        }}
        style={{ width, height }}
        resizeMode={FastImage.resizeMode.cover}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        accessibilityRole="image"
      />
      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
          }}
        >
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

// ❌ INCORRECT: Using plain Image without caching
import { Image } from 'react-native';
<Image source={{ uri: imageUrl }} /> // No caching, no loading state
```

### R6: Image Validation Before Upload

Always validate images before uploading.

```typescript
// ✅ CORRECT: Validation in domain layer
// src/modules/{feature}/domain/image.model.ts
export function validateImage(asset: ImageAsset): Error | null {
  if (asset.fileSize > IMAGE_CONFIG.MAX_FILE_SIZE) {
    return new Error(
      `La imagen es muy grande (${(asset.fileSize / 1024 / 1024).toFixed(1)} MB). Máximo: ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024} MB`,
    );
  }

  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(asset.type as any)) {
    return new Error(
      `Formato no soportado: ${asset.type}. Usa JPG, PNG o WebP`,
    );
  }

  return null;
}
```

### R7: iOS and Android Permission Configuration

Ensure `Info.plist` and `AndroidManifest.xml` have required permissions.

**iOS** (`ios/{AppName}/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>La app necesita acceso a tu cámara para tomar fotos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>La app necesita acceso a tu galería para seleccionar fotos</string>
```

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<!-- For Android < 13 -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
```

## Verification Checklist

```bash
# 1. Image config defined in domain
grep -r "IMAGE_CONFIG\|ImageAsset" src/modules/*/domain/
# Should have typed config and model

# 2. Picker uses T | Error pattern
grep -rn "ImageAsset | Error" src/modules/*/infrastructure/*picker*
# Should follow project error pattern

# 3. Upload uses factory pattern
grep -r "CONFIG.SERVICE_PROVIDER" src/modules/*/infrastructure/*upload*
# Should have provider switching

# 4. FastImage used instead of plain Image
grep -rn "from 'react-native-fast-image'" src/components/
# Should have cached image component

# 5. Permissions configured
grep -r "NSCameraUsageDescription" ios/*/Info.plist
grep -r "CAMERA" android/app/src/main/AndroidManifest.xml
# Both platforms should have permission entries

# 6. No hardcoded image sizes or quality
grep -rn "quality: 0\.\|maxWidth: [0-9]" src/modules/*/infrastructure/*picker*
# Values should come from IMAGE_CONFIG
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `react-native-image-picker` | Camera and gallery access |
| `react-native-fast-image` | Cached image display |
| `@react-native-firebase/storage` | Firebase Storage uploads |

## References

- Firebase Storage service: `src/modules/firebase/infrastructure/`
- Error pattern: `.ai/skills/enforcement/error-handling/skill.md`
- Service factory: `.ai/skills/enforcement/api-layer/skill.md`
- Existing avatar: `src/components/core/Avatar.tsx`
