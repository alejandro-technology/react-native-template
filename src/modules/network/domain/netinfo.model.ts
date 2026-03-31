export type ConnectionType =
  | 'none'
  | 'unknown'
  | 'wifi'
  | 'cellular'
  | 'bluetooth'
  | 'ethernet'
  | 'wimax'
  | 'vpn'
  | 'other';

export type CellularGeneration = 'unknown' | '2g' | '3g' | '4g' | '5g';

export interface NetInfoState {
  type: ConnectionType;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isWifiEnabled: boolean | null;
  details: {
    isConnectionExpensive: boolean;
    cellularGeneration?: CellularGeneration;
    ssid?: string;
    bssid?: string;
    strength?: number;
    ipAddress?: string;
    subnet?: string;
    frequency?: number;
  };
}

export interface NetInfoRepository {
  getState(): Promise<NetInfoState | Error>;
  addListener(callback: (state: NetInfoState) => void): () => void;
  isConnected(): Promise<boolean>;
}
