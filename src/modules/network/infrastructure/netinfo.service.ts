import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState as RNNetInfoState } from '@react-native-community/netinfo';
import type { NetInfoRepository, NetInfoState } from '../domain/netinfo.model';

function mapConnectionType(type: string): NetInfoState['type'] {
  const validTypes: NetInfoState['type'][] = [
    'none',
    'unknown',
    'wifi',
    'cellular',
    'bluetooth',
    'ethernet',
    'wimax',
    'vpn',
    'other',
  ];
  return validTypes.includes(type as NetInfoState['type'])
    ? (type as NetInfoState['type'])
    : 'unknown';
}

function mapCellularGeneration(generation: string | null | undefined) {
  const validGenerations = ['unknown', '2g', '3g', '4g', '5g'] as const;
  return validGenerations.includes(
    generation as (typeof validGenerations)[number],
  )
    ? (generation as (typeof validGenerations)[number])
    : 'unknown';
}

function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

function mapState(state: RNNetInfoState): NetInfoState {
  const isConnectionExpensive =
    'isConnectionExpensive' in state
      ? (state as { isConnectionExpensive?: boolean }).isConnectionExpensive
      : false;
  const details =
    'details' in state
      ? (state as { details?: Record<string, unknown> }).details
      : undefined;

  return {
    type: mapConnectionType(state.type),
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable,
    isWifiEnabled: state.isWifiEnabled ?? null,
    details: {
      isConnectionExpensive: isConnectionExpensive ?? false,
      cellularGeneration:
        state.type === 'cellular'
          ? mapCellularGeneration(
              details?.cellularGeneration as string | null | undefined,
            )
          : undefined,
      ssid:
        state.type === 'wifi'
          ? nullToUndefined(details?.ssid as string | null | undefined)
          : undefined,
      bssid:
        state.type === 'wifi'
          ? nullToUndefined(details?.bssid as string | null | undefined)
          : undefined,
      strength:
        state.type === 'wifi'
          ? nullToUndefined(details?.strength as number | null | undefined)
          : undefined,
      ipAddress:
        state.type === 'wifi'
          ? nullToUndefined(details?.ipAddress as string | null | undefined)
          : undefined,
      subnet:
        state.type === 'wifi'
          ? nullToUndefined(details?.subnet as string | null | undefined)
          : undefined,
      frequency:
        state.type === 'wifi'
          ? nullToUndefined(details?.frequency as number | null | undefined)
          : undefined,
    },
  };
}

class NetInfoService implements NetInfoRepository {
  async getState(): Promise<NetInfoState | Error> {
    try {
      const state = await NetInfo.fetch();
      return mapState(state);
    } catch (error) {
      return new Error(
        error instanceof Error
          ? error.message
          : 'Error al obtener estado de conexión',
      );
    }
  }

  addListener(callback: (state: NetInfoState) => void): () => void {
    return NetInfo.addEventListener(state => {
      callback(mapState(state));
    });
  }

  async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch {
      return false;
    }
  }
}

function createNetInfoService(): NetInfoRepository {
  return new NetInfoService();
}

export default createNetInfoService();
