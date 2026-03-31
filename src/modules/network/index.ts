export { manageAxiosError } from './domain/network.error';
export { AXIOS_MESSAGES } from './domain/network.messages';

// NetInfo
export type {
  NetInfoState,
  ConnectionType,
  CellularGeneration,
} from './domain/netinfo.model';
export type { NetInfoRepository } from './domain/netinfo.repository';
export { useNetInfo, useIsConnected } from './application/use-netinfo';
