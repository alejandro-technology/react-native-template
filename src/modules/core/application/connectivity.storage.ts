import { create } from 'zustand';

interface ConnectivityState {
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useConnectivityStore = create<ConnectivityState>()(set => ({
  isConnected: true,
  setConnected: (connected: boolean) => set({ isConnected: connected }),
}));

// Getter to read connectivity outside React render/hook context (useful for tests and non-react code)
export const getIsConnected = () => useConnectivityStore.getState().isConnected;

// Hook to subscribe to connectivity inside React components
export const useIsConnected = () =>
  useConnectivityStore(state => state.isConnected);
