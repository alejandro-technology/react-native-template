import { create } from 'zustand';
import type {
  ModalOpenParams,
  ToastPosition,
  ToastShowParams,
  ToastType,
} from '../domain/app.model';

export type SearchbarStorage = 'users' | 'products' | '';

interface State {
  modal: {
    visible: boolean;
    params: ModalOpenParams | null;
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
  onboarding: {
    enabled: boolean;
    completed: boolean;
    steps: number;
    step: number;
  };
  searchbar: {
    [key in SearchbarStorage]: {
      searchText: string;
      setSearchText: (text: string) => void;
    };
  };
}

const initialState: State = {
  modal: {
    visible: false,
    params: null,
    open: () => {},
    close: () => {},
  },
  toast: {
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    position: 'bottom',
    show: () => {},
    hide: () => {},
  },
  onboarding: {
    enabled: false,
    completed: false,
    steps: 0,
    step: 0,
  },
  searchbar: {
    '': {
      searchText: '',
      setSearchText: () => {},
    },
    users: {
      searchText: '',
      setSearchText: () => {},
    },
    products: {
      searchText: '',
      setSearchText: () => {},
    },
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
          params: null,
        },
      })),
    open: (params: ModalOpenParams) =>
      set(state => ({
        modal: {
          ...state.modal,
          visible: true,
          params,
        },
      })),
  },
  toast: {
    ...initialState.toast,
    show: ({
      message,
      type,
      duration = initialState.toast.duration,
      position = initialState.toast.position,
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
          type: initialState.toast.type,
          duration: initialState.toast.duration,
          position: initialState.toast.position,
        },
      })),
  },
}));
