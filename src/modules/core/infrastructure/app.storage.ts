import { create } from 'zustand';

type ModalOpenParams = {
  entityName: string;
  entityType: string;
  onConfirm: () => Promise<void>;
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
}));
