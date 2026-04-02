import { useAppStorage } from '@modules/core/application/app.storage';
import { act } from '@testing-library/react-native';

describe('useAppStorage - Zustand Store', () => {
  beforeEach(() => {
    // Resetear el store antes de cada test
    const { modal, toast } = useAppStorage.getState();
    act(() => {
      modal.close();
      toast.hide();
    });
  });

  describe('Modal', () => {
    it('debe iniciar con modal oculto', () => {
      const { modal } = useAppStorage.getState();
      expect(modal.visible).toBe(false);
      expect(modal.params).toBeNull();
    });

    it('debe abrir modal delete con los parámetros correctos', () => {
      const onConfirm = jest.fn();
      act(() => {
        useAppStorage.getState().modal.open({
          type: 'delete',
          entityName: 'Laptop HP',
          entityType: 'producto',
          onConfirm,
        });
      });

      const { modal } = useAppStorage.getState();
      expect(modal.visible).toBe(true);
      expect(modal.params).not.toBeNull();
      expect(modal.params?.type).toBe('delete');
      if (modal.params?.type === 'delete') {
        expect(modal.params.entityName).toBe('Laptop HP');
        expect(modal.params.entityType).toBe('producto');
        expect(modal.params.onConfirm).toBe(onConfirm);
      }
    });

    it('debe abrir modal success con los parámetros correctos', () => {
      act(() => {
        useAppStorage.getState().modal.open({
          type: 'success',
          title: 'Operación exitosa',
          message: 'El producto fue creado correctamente',
        });
      });

      const { modal } = useAppStorage.getState();
      expect(modal.visible).toBe(true);
      expect(modal.params?.type).toBe('success');
      if (modal.params?.type === 'success') {
        expect(modal.params.title).toBe('Operación exitosa');
        expect(modal.params.message).toBe(
          'El producto fue creado correctamente',
        );
      }
    });

    it('debe abrir modal information con los parámetros correctos', () => {
      act(() => {
        useAppStorage.getState().modal.open({
          type: 'information',
          title: 'Información',
          message: 'Este campo es requerido',
        });
      });

      const { modal } = useAppStorage.getState();
      expect(modal.visible).toBe(true);
      expect(modal.params?.type).toBe('information');
      if (modal.params?.type === 'information') {
        expect(modal.params.title).toBe('Información');
        expect(modal.params.message).toBe('Este campo es requerido');
      }
    });

    it('debe cerrar modal y limpiar estado', () => {
      const onConfirm = jest.fn();
      act(() => {
        useAppStorage.getState().modal.open({
          type: 'delete',
          entityName: 'Test',
          entityType: 'item',
          onConfirm,
        });
      });

      act(() => {
        useAppStorage.getState().modal.close();
      });

      const { modal } = useAppStorage.getState();
      expect(modal.visible).toBe(false);
      expect(modal.params).toBeNull();
    });
  });

  describe('Toast', () => {
    it('debe iniciar con toast oculto', () => {
      const { toast } = useAppStorage.getState();
      expect(toast.visible).toBe(false);
      expect(toast.message).toBe('');
      expect(toast.type).toBe('info');
      expect(toast.duration).toBe(3000);
      expect(toast.position).toBe('bottom');
    });

    it('debe mostrar toast con parámetros obligatorios', () => {
      act(() => {
        useAppStorage.getState().toast.show({
          message: 'Guardado exitosamente',
          type: 'success',
        });
      });

      const { toast } = useAppStorage.getState();
      expect(toast.visible).toBe(true);
      expect(toast.message).toBe('Guardado exitosamente');
      expect(toast.type).toBe('success');
      expect(toast.duration).toBe(3000);
      expect(toast.position).toBe('bottom');
    });

    it('debe mostrar toast con parámetros opcionales', () => {
      act(() => {
        useAppStorage.getState().toast.show({
          message: 'Error de red',
          type: 'error',
          duration: 5000,
          position: 'bottom',
        });
      });

      const { toast } = useAppStorage.getState();
      expect(toast.visible).toBe(true);
      expect(toast.message).toBe('Error de red');
      expect(toast.type).toBe('error');
      expect(toast.duration).toBe(5000);
      expect(toast.position).toBe('bottom');
    });

    it('debe ocultar toast y resetear estado', () => {
      act(() => {
        useAppStorage.getState().toast.show({
          message: 'Test',
          type: 'info',
        });
      });

      act(() => {
        useAppStorage.getState().toast.hide();
      });

      const { toast } = useAppStorage.getState();
      expect(toast.visible).toBe(false);
      expect(toast.message).toBe('');
      expect(toast.type).toBe('info');
      expect(toast.duration).toBe(3000);
      expect(toast.position).toBe('bottom');
    });

    it('debe soportar los tres tipos de toast', () => {
      const types: Array<'success' | 'error' | 'info'> = [
        'success',
        'error',
        'info',
      ];
      types.forEach(type => {
        act(() => {
          useAppStorage.getState().toast.show({ message: 'Test', type });
        });
        expect(useAppStorage.getState().toast.type).toBe(type);
      });
    });
  });
});
