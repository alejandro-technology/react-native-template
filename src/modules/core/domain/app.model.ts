export type ModalType = 'delete' | 'success' | 'information';

export type ModalDeleteParams = {
  type: 'delete';
  entityName: string;
  entityType: string;
  onConfirm: () => Promise<void>;
};

export type ModalSuccessParams = {
  type: 'success';
  title: string;
  message: string;
  onClose?: () => void;
};

export type ModalInformationParams = {
  type: 'information';
  title: string;
  message: string;
  onClose?: () => void;
};

export type ModalOpenParams =
  | ModalDeleteParams
  | ModalSuccessParams
  | ModalInformationParams;

export type ToastType = 'success' | 'error' | 'info';
export type ToastPosition = 'top' | 'bottom';

export type ToastShowParams = {
  message: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
};
