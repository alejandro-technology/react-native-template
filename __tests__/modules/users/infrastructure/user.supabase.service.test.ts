jest.mock('@modules/supabase', () => ({
  supabaseClient: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
  manageSupabaseError: jest.fn((e: unknown) => new Error(String(e))),
}));

import userService from '../../../../src/modules/users/infrastructure/user.supabase.service';
import { supabaseClient, manageSupabaseError } from '@modules/supabase';

const mockFrom = supabaseClient.from as jest.Mock;
const mockStorageFrom = supabaseClient.storage.from as jest.Mock;
const mockManageError = manageSupabaseError as jest.Mock;

type UserQueryChain = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  or: jest.Mock;
  single: jest.Mock;
  then: (resolve: any, reject?: any) => Promise<unknown>;
};

function createQueryChain(resolvedValue: unknown) {
  const chain: UserQueryChain = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    or: jest.fn(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    then(resolve: any, reject?: any) {
      return new Promise<unknown>(res => res(resolvedValue)).then(
        resolve,
        reject,
      );
    },
  };

  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.or.mockReturnValue(chain);

  return chain;
}

const mockUserRow = {
  id: 'user-1',
  name: 'Ana García',
  email: 'ana@test.com',
  phone: '3001234567',
  role: 'admin',
  avatar: null,
  birth_date: null,
  terms_accepted: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

const expectedUser = {
  id: 'user-1',
  name: 'Ana García',
  email: 'ana@test.com',
  phone: '3001234567',
  role: 'admin',
  avatar: undefined,
  birthDate: undefined,
  termsAccepted: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
};

const createPayload = {
  name: 'Ana García',
  email: 'ana@test.com',
  phone: '3001234567',
  role: 'admin',
  termsAccepted: true,
};

describe('UserSupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockManageError.mockImplementation((e: unknown) => new Error(String(e)));
  });

  describe('getAll', () => {
    it('debe retornar lista de usuarios sin filtro', async () => {
      const chain = createQueryChain({ data: [mockUserRow], error: null });
      mockFrom.mockReturnValue(chain);

      const result = await userService.getAll();

      expect(result).toEqual([expectedUser]);
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(chain.select).toHaveBeenCalledWith('*');
    });

    it('debe aplicar filtro OR en multiples columnas cuando hay searchText', async () => {
      const chain = createQueryChain({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      await userService.getAll({ searchText: 'ana' });

      expect(chain.or).toHaveBeenCalledWith(
        expect.stringContaining('name.ilike.%ana%'),
      );
      expect(chain.or).toHaveBeenCalledWith(
        expect.stringContaining('email.ilike.%ana%'),
      );
    });

    it('no debe aplicar filtro cuando searchText esta vacio', async () => {
      const chain = createQueryChain({ data: [mockUserRow], error: null });
      mockFrom.mockReturnValue(chain);

      await userService.getAll({ searchText: '' });

      expect(chain.or).not.toHaveBeenCalled();
    });

    it('debe retornar Error cuando Supabase retorna error', async () => {
      const pgError = { message: 'DB error', details: '' };
      const chain = createQueryChain({ data: null, error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await userService.getAll();

      expect(mockManageError).toHaveBeenCalledWith(pgError);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('getById', () => {
    it('debe retornar el usuario por id', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await userService.getById('user-1');

      expect(result).toEqual(expectedUser);
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-1');
      expect(chain.single).toHaveBeenCalled();
    });

    it('debe mapear birth_date y avatar cuando existen', async () => {
      const rowWithExtras = {
        ...mockUserRow,
        avatar: 'https://example.com/avatar.jpg',
        birth_date: '1990-06-15T00:00:00.000Z',
      };
      const chain = createQueryChain({ data: rowWithExtras, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await userService.getById('user-1');

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.avatar).toBe('https://example.com/avatar.jpg');
        expect(result.birthDate).toEqual(new Date('1990-06-15T00:00:00.000Z'));
      }
    });

    it('debe retornar Error cuando el usuario no existe', async () => {
      const pgError = { message: 'no rows', code: 'PGRST116' };
      const chain = createQueryChain({ data: null, error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await userService.getById('inexistente');

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('create', () => {
    it('debe crear usuario sin avatar y retornarlo', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await userService.create(createPayload);

      expect(result).toEqual(expectedUser);
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ana García',
          email: 'ana@test.com',
          terms_accepted: true,
        }),
      );
    });

    it('debe incluir birth_date como ISO string si se proporciona', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      await userService.create({
        ...createPayload,
        birthDate: new Date('1990-01-15T00:00:00.000Z'),
      });

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          birth_date: '1990-01-15T00:00:00.000Z',
        }),
      );
    });

    it('debe crear usuario con avatar URL remota (sin upload)', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      await userService.create({
        ...createPayload,
        avatar: 'https://example.com/photo.jpg',
      });

      // Remote URL -> avatar still not uploaded (passed as-is in the final update)
      // The initial insert does NOT include avatar
      expect(chain.insert).toHaveBeenCalledWith(
        expect.not.objectContaining({ avatar: expect.anything() }),
      );
    });

    it('debe subir avatar local y actualizar el usuario con la URL', async () => {
      const insertedRow = { ...mockUserRow, id: 'user-new', avatar: null };
      const updatedRow = {
        ...insertedRow,
        avatar: 'https://storage.url/user-new/avatars/123.jpg',
      };

      const insertChain = createQueryChain({ data: insertedRow, error: null });
      const updateChain = createQueryChain({ data: updatedRow, error: null });

      mockFrom
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(updateChain);

      const mockBucket = {
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://storage.url/user-new/avatars/123.jpg' },
        }),
      };
      mockStorageFrom.mockReturnValue(mockBucket);

      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(new Blob(['fake-image'])),
      }) as jest.Mock;

      const result = await userService.create({
        ...createPayload,
        avatar: 'file:///local/avatar.jpg',
      });

      expect(global.fetch).toHaveBeenCalledWith('file:///local/avatar.jpg');
      expect(mockBucket.upload).toHaveBeenCalled();
      expect(mockBucket.getPublicUrl).toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.avatar).toBe(
          'https://storage.url/user-new/avatars/123.jpg',
        );
      }
    });

    it('debe retornar Error cuando falla la insercion', async () => {
      const pgError = { message: 'insert failed', details: '' };
      const chain = createQueryChain({ data: null, error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await userService.create(createPayload);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('update', () => {
    it('debe actualizar los campos del usuario', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await userService.update('user-1', {
        name: 'Nuevo Nombre',
        phone: '3009876543',
      });

      expect(result).toEqual(expectedUser);
      expect(chain.update).toHaveBeenCalledWith({
        name: 'Nuevo Nombre',
        phone: '3009876543',
      });
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('debe ignorar campos undefined en el payload de update', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      await userService.update('user-1', { name: 'Solo nombre' });

      const updatePayload = chain.update.mock.calls[0][0];
      expect(Object.keys(updatePayload)).toEqual(['name']);
    });

    it('debe setear avatar a null cuando se pasa null (eliminar avatar)', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      await userService.update('user-1', { avatar: null });

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ avatar: null }),
      );
    });

    it('debe pasar avatar remoto como esta sin upload', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      await userService.update('user-1', {
        avatar: 'https://cdn.example.com/photo.jpg',
      });

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar: 'https://cdn.example.com/photo.jpg',
        }),
      );
      expect(mockStorageFrom).not.toHaveBeenCalled();
    });

    it('debe subir avatar local y actualizar con la URL resultante', async () => {
      const chain = createQueryChain({ data: mockUserRow, error: null });
      mockFrom.mockReturnValue(chain);

      const mockBucket = {
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://storage.url/user-1/avatars/456.jpg' },
        }),
      };
      mockStorageFrom.mockReturnValue(mockBucket);

      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(new Blob(['fake-image'])),
      }) as jest.Mock;

      await userService.update('user-1', {
        avatar: 'file:///local/new-avatar.jpg',
      });

      expect(mockBucket.upload).toHaveBeenCalled();
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar: 'https://storage.url/user-1/avatars/456.jpg',
        }),
      );
    });

    it('debe retornar Error cuando falla la actualizacion', async () => {
      const pgError = { message: 'update failed', details: '' };
      const chain = createQueryChain({ data: null, error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await userService.update('user-1', { name: 'Test' });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('delete', () => {
    it('debe eliminar el usuario y retornar undefined', async () => {
      const chain = createQueryChain({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await userService.delete('user-1');

      expect(result).toBeUndefined();
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('debe retornar Error cuando falla la eliminacion', async () => {
      const pgError = { message: 'delete failed', details: '' };
      const chain = createQueryChain({ error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await userService.delete('user-1');

      expect(result).toBeInstanceOf(Error);
    });
  });
});
