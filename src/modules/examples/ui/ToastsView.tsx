import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Text } from '@components/core';
import { spacing } from '@theme/index';
import { useAppStorage } from '@modules/core/application/app.storage';

export default function ToastsView() {
  const show = useAppStorage(state => state.toast.show);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Tipos
        </Text>
        <View style={styles.column}>
          <Button
            variant="primary"
            onPress={() =>
              show({
                message: 'Operacion realizada con exito',
                type: 'success',
              })
            }
          >
            Toast Success
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              show({
                message: 'Ocurrio un error inesperado',
                type: 'error',
              })
            }
          >
            Toast Error
          </Button>
          <Button
            variant="outlined"
            onPress={() =>
              show({
                message: 'Tienes 3 notificaciones pendientes',
                type: 'info',
              })
            }
          >
            Toast Info
          </Button>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Posicion
        </Text>
        <View style={styles.column}>
          <Button
            variant="primary"
            onPress={() =>
              show({
                message: 'Aparece arriba',
                type: 'success',
                position: 'top',
              })
            }
          >
            Posicion Top
          </Button>
          <Button
            variant="primary"
            onPress={() =>
              show({
                message: 'Aparece abajo',
                type: 'success',
                position: 'bottom',
              })
            }
          >
            Posicion Bottom
          </Button>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Duracion
        </Text>
        <View style={styles.column}>
          <Button
            variant="outlined"
            onPress={() =>
              show({
                message: 'Desaparece rapido (1s)',
                type: 'info',
                duration: 1000,
              })
            }
          >
            Duracion corta (1s)
          </Button>
          <Button
            variant="outlined"
            onPress={() =>
              show({
                message: 'Duracion normal (3s)',
                type: 'info',
                duration: 3000,
              })
            }
          >
            Duracion normal (3s)
          </Button>
          <Button
            variant="outlined"
            onPress={() =>
              show({
                message: 'Permanece mas tiempo (5s)',
                type: 'info',
                duration: 5000,
              })
            }
          >
            Duracion larga (5s)
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  column: {
    gap: spacing.md,
  },
});
