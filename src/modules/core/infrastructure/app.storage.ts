import { create } from 'zustand';

interface State {
  modal: ModalState & {
    visible: boolean;
    open: (params: ModalState) => void;
    close: () => void;
  };
}

type ModalState = {
  entityId: string;
  entityName: string;
  entityType: string;
};

const initialState: State = {
  modal: {
    visible: false,
    entityId: '',
    entityName: '',
    entityType: '',
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
          entityId: '',
          entityName: '',
          entityType: '',
        },
      })),
    open: ({ entityId, entityName, entityType }: ModalState) =>
      set(state => ({
        modal: {
          ...state.modal,
          visible: true,
          entityId,
          entityName,
          entityType,
        },
      })),
  },
}));
