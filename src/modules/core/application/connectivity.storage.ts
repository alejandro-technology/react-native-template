import { create } from 'zustand';

interface ConnectivityState {
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useConnectivityStore = create<ConnectivityState>()(set => ({
  isConnected: true,
  setConnected: (connected: boolean) => set({ isConnected: connected }),
}));

export const useIsConnected = () =>
  useConnectivityStore(state => state.isConnected);
