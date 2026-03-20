import { create } from 'zustand';

type ModalOpenParams = {
  entityName: string;
  entityType: string;
  onConfirm: () => Promise<void>;
};

export type ToastType = 'success' | 'error' | 'info';
export type ToastPosition = 'top' | 'bottom';

type ToastShowParams = {
  message: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
};

interface State {
  modal: {
    visible: boolean;
    entityName: string;
    entityType: string;
    onConfirm: (() => Promise<void>) | null;
    open: (params: ModalOpenParams) => void;
    close: () => void;
  };
  toast: {
    visible: boolean;
    message: string;
    type: ToastType;
    duration: number;
    position: ToastPosition;
    show: (params: ToastShowParams) => void;
    hide: () => void;
  };
}

const initialState: State = {
  modal: {
    visible: false,
    entityName: '',
    entityType: '',
    onConfirm: null,
    open: () => {},
    close: () => {},
  },
  toast: {
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    position: 'top',
    show: () => {},
    hide: () => {},
  },
};

export const useAppStorage = create<State>()(set => ({
  ...initialState,
  modal: {
    ...initialState.modal,
    close: () =>
      set(state => ({
        modal: {
          ...state.modal,
          visible: false,
          entityName: '',
          entityType: '',
          onConfirm: null,
        },
      })),
    open: ({ entityName, entityType, onConfirm }: ModalOpenParams) =>
      set(state => ({
        modal: {
          ...state.modal,
          visible: true,
          entityName,
          entityType,
          onConfirm,
        },
      })),
  },
  toast: {
    ...initialState.toast,
    show: ({
      message,
      type,
      duration = 3000,
      position = 'top',
    }: ToastShowParams) =>
      set(state => ({
        toast: {
          ...state.toast,
          visible: true,
          message,
          type,
          duration,
          position,
        },
      })),
    hide: () =>
      set(state => ({
        toast: {
          ...state.toast,
          visible: false,
          message: '',
          type: 'info',
          duration: 3000,
          position: 'top',
        },
      })),
  },
}));
