import React, { PropsWithChildren } from 'react';
import {
  Modal as RNModal,
  Pressable,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { useTheme } from '@theme/index';
import { BorderRadiusToken } from '@theme/borders';
import { ModalSize, getModalStyle } from '@theme/components/Modal.styles';
import { Text } from './Text';

interface ModalProps extends PropsWithChildren {
  visible: boolean;
  onRequestClose?: () => void;
  title?: string;
  icon?: React.ReactNode;
  onPressIcon?: () => void;
  size?: ModalSize;
  borderRadius?: BorderRadiusToken;
  closeOnBackdropPress?: boolean;
  style?: ViewStyle;
  overlayStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
}

export function Modal(props: ModalProps) {
  const {
    visible,
    onRequestClose,
    children,
    title,
    icon,
    onPressIcon,
    size = 'md',
    borderRadius,
    closeOnBackdropPress = false,
    style: customStyle,
    overlayStyle,
    headerStyle,
    titleStyle,
    contentStyle,
  } = props;

  const theme = useTheme();

  const styles = getModalStyle({
    mode: theme.mode,
    size,
    borderRadius,
  });

  const shouldRenderHeader = !!title || !!icon;

  return (
    <RNModal
      animationType="fade"
      presentationStyle="overFullScreen"
      visible={visible}
      onRequestClose={onRequestClose}
      transparent
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <View style={[styles.overlay, overlayStyle]}>
        {closeOnBackdropPress && onRequestClose && (
          <Pressable
            testID="modal-backdrop"
            style={styles.backdrop}
            onPress={onRequestClose}
          />
        )}
        <View style={[styles.container, customStyle]}>
          {shouldRenderHeader && (
            <View
              style={headerStyle ? [styles.header, headerStyle] : styles.header}
            >
              {icon && (
                <Pressable
                  onPress={onPressIcon}
                  style={styles.iconButton}
                  disabled={!onPressIcon}
                >
                  {icon}
                </Pressable>
              )}
              {title && (
                <Text
                  style={titleStyle ? [styles.title, titleStyle] : styles.title}
                >
                  {title}
                </Text>
              )}
            </View>
          )}
          <View
            style={
              shouldRenderHeader ? [styles.content, contentStyle] : contentStyle
            }
          >
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}
