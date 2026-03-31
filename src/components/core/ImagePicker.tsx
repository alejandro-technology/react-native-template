import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, Linking } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
  CameraOptions,
  MediaType,
} from 'react-native-image-picker';
// Components
import { Avatar } from './Avatar';
import { Text } from './Text';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { AnimatedPressable } from './AnimatedPressable';
// Theme
import { useTheme, spacing, borderRadius } from '@theme/index';
// Permissions
import { usePermission } from '@modules/core';

export interface ImagePickerProps {
  value?: string | null;
  onChange: (uri: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  displayName: string;
  userId?: string;
}

export function ImagePicker({
  value,
  onChange,
  label,
  placeholder = 'Toca para seleccionar imagen',
  error,
  displayName,
  userId = 'default',
}: ImagePickerProps) {
  const theme = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const { checkAndRequest: checkCamera } = usePermission('camera');
  const { checkAndRequest: checkLibrary } = usePermission('photoLibrary');

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  const handleImageResponse = useCallback(
    (response: {
      didCancel?: boolean;
      errorCode?: string;
      errorMessage?: string;
      assets?: Array<{ uri?: string }>;
    }) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        console.warn('Image picker error:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          onChange(asset.uri);
        }
      }
    },
    [onChange],
  );

  const handleOpenCamera = useCallback(async () => {
    setShowOptions(false);

    const options: CameraOptions = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
      saveToPhotos: true,
    };

    const result = await checkCamera();
    if (result.status === 'granted') {
      launchCamera(options, handleImageResponse);
    } else {
      handleOpenSettings();
    }
  }, [checkCamera, handleImageResponse, handleOpenSettings]);

  const handleOpenGallery = useCallback(async () => {
    setShowOptions(false);

    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
      selectionLimit: 1,
    };

    const result = await checkLibrary();
    if (result.status === 'granted') {
      launchImageLibrary(options, handleImageResponse);
    } else {
      handleOpenSettings();
    }
  }, [checkLibrary, handleImageResponse, handleOpenSettings]);

  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="caption" style={styles.label}>
          {label}
        </Text>
      )}

      <View style={styles.content}>
        <Pressable
          onPress={() => setShowOptions(true)}
          style={styles.avatarContainer}
        >
          <Avatar
            name={displayName}
            userId={userId}
            imageUrl={value || undefined}
            size="xl"
          />
          <View style={styles.overlay}>
            <Icon name="camera" size={16} color="onPrimary" />
          </View>
        </Pressable>

        <View style={styles.info}>
          <Text variant="body" style={styles.placeholder}>
            {placeholder}
          </Text>
          {value && (
            <Pressable onPress={handleRemove} style={styles.removeButton}>
              <Icon name="close" size={14} color="error" />
              <Text variant="caption" style={{ color: theme.colors.error }}>
                Eliminar
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {error && (
        <Text variant="caption" style={{ color: theme.colors.error }}>
          {error}
        </Text>
      )}

      <Modal
        visible={showOptions}
        onRequestClose={() => setShowOptions(false)}
        title="Seleccionar foto"
        size="sm"
        closeOnBackdropPress
      >
        <View style={styles.optionsContainer}>
          <AnimatedPressable
            onPress={handleOpenCamera}
            style={styles.optionButton}
          >
            <Icon name="camera" size={24} color="text" />
            <Text variant="body" style={styles.optionText}>
              Cámara
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleOpenGallery}
            style={styles.optionButton}
          >
            <Icon name="image" size={24} color="text" />
            <Text variant="body" style={styles.optionText}>
              Galería
            </Text>
          </AnimatedPressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  placeholder: {
    opacity: 0.7,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  optionsContainer: {
    gap: spacing.xs,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  optionText: {
    fontWeight: '500',
  },
});
