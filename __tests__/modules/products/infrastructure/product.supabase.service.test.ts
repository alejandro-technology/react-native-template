jest.mock('@modules/supabase', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  manageSupabaseError: jest.fn((e: unknown) => new Error(String(e))),
}));

import productService from '../../../../src/modules/products/infrastructure/product.supabase.service';
import { supabaseClient, manageSupabaseError } from '@modules/supabase';

const mockFrom = supabaseClient.from as jest.Mock;
const mockManageError = manageSupabaseError as jest.Mock;

// Builds a chainable Supabase query mock that resolves to `resolvedValue`
// when awaited directly (getAll/delete) or via .single() (getById/create/update).
type ProductQueryChain = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  ilike: jest.Mock;
  or: jest.Mock;
  single: jest.Mock;
  then: (resolve: any, reject?: any) => Promise<unknown>;
};

function createQueryChain(resolvedValue: unknown) {
  const chain: ProductQueryChain = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    ilike: jest.fn(),
    or: jest.fn(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    // Makes the chain itself awaitable (used by getAll and delete)
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
  chain.ilike.mockReturnValue(chain);
  chain.or.mockReturnValue(chain);

  return chain;
}

const mockProductRow = {
  id: '1',
  name: 'Producto Test',
  description: 'Descripcion test',
  price: 15000,
  type: 'comida',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

const expectedProduct = {
  id: '1',
  name: 'Producto Test',
  description: 'Descripcion test',
  price: 15000,
  type: 'comida',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
};

describe('ProductSupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockManageError.mockImplementation((e: unknown) => new Error(String(e)));
  });

  describe('getAll', () => {
    it('debe retornar lista de productos sin filtro', async () => {
      const chain = createQueryChain({ data: [mockProductRow], error: null });
      mockFrom.mockReturnValue(chain);

      const result = await productService.getAll();

      expect(result).toEqual([expectedProduct]);
      expect(mockFrom).toHaveBeenCalledWith('products');
      expect(chain.select).toHaveBeenCalledWith('*');
    });

    it('debe aplicar filtro ilike cuando hay searchText', async () => {
      const chain = createQueryChain({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      await productService.getAll({ searchText: 'pizza' });

      expect(chain.ilike).toHaveBeenCalledWith('name', '%pizza%');
    });

    it('no debe aplicar filtro cuando searchText esta vacio', async () => {
      const chain = createQueryChain({ data: [mockProductRow], error: null });
      mockFrom.mockReturnValue(chain);

      await productService.getAll({ searchText: '' });

      expect(chain.ilike).not.toHaveBeenCalled();
    });

    it('debe retornar Error cuando Supabase retorna error', async () => {
      const pgError = { message: 'DB error', details: '' };
      const chain = createQueryChain({ data: null, error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await productService.getAll();

      expect(mockManageError).toHaveBeenCalledWith(pgError);
      expect(result).toBeInstanceOf(Error);
    });

    it('debe retornar lista vacia si no hay productos', async () => {
      const chain = createQueryChain({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      const result = await productService.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('debe retornar el producto por id', async () => {
      const chain = createQueryChain({ data: mockProductRow, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await productService.getById('1');

      expect(result).toEqual(expectedProduct);
      expect(chain.eq).toHaveBeenCalledWith('id', '1');
      expect(chain.single).toHaveBeenCalled();
    });

    it('debe retornar Error cuando el producto no existe', async () => {
      const pgError = {
        message: 'JSON object requested, multiple (or no) rows returned',
        code: 'PGRST116',
      };
      const chain = createQueryChain({ data: null, error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await productService.getById('999');

      expect(mockManageError).toHaveBeenCalledWith(pgError);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('create', () => {
    it('debe insertar el producto y retornarlo', async () => {
      const chain = createQueryChain({ data: mockProductRow, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await productService.create({
        name: 'Producto Test',
        description: 'Descripcion test',
        price: 15000,
        type: 'comida',
      });

      expect(result).toEqual(expectedProduct);
      expect(chain.insert).toHaveBeenCalledWith({
        name: 'Producto Test',
        description: 'Descripcion test',
        price: 15000,
        type: 'comida',
      });
    });

    it('debe usar string vacio como descripcion si no se proporciona', async () => {
      const chain = createQueryChain({ data: mockProductRow, error: null });
      mockFrom.mockReturnValue(chain);

      await productService.create({
        name: 'Test',
        price: 5000,
        type: 'bebidas',
      });

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ description: '' }),
      );
    });

    it('debe retornar Error cuando falla la insercion', async () => {
      const pgError = { message: 'insert error', details: '' };
      const chain = createQueryChain({ data: null, error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await productService.create({
        name: 'Test',
        price: 1000,
        type: 'otros',
      });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('update', () => {
    it('debe actualizar el producto con los campos proporcionados', async () => {
      const chain = createQueryChain({ data: mockProductRow, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await productService.update('1', {
        name: 'Nuevo nombre',
        price: 20000,
      });

      expect(result).toEqual(expectedProduct);
      expect(chain.update).toHaveBeenCalledWith({
        name: 'Nuevo nombre',
        price: 20000,
      });
      expect(chain.eq).toHaveBeenCalledWith('id', '1');
    });

    it('debe ignorar campos undefined en el payload', async () => {
      const chain = createQueryChain({ data: mockProductRow, error: null });
      mockFrom.mockReturnValue(chain);

      await productService.update('1', { name: 'Nuevo nombre' });

      const updatePayload = chain.update.mock.calls[0][0];
      expect(Object.keys(updatePayload)).toEqual(['name']);
    });

    it('debe retornar Error cuando falla la actualizacion', async () => {
      const pgError = { message: 'update failed', details: '' };
      const chain = createQueryChain({ data: null, error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await productService.update('1', { name: 'Test' });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('delete', () => {
    it('debe eliminar el producto y retornar undefined', async () => {
      const chain = createQueryChain({ error: null });
      mockFrom.mockReturnValue(chain);

      const result = await productService.delete('1');

      expect(result).toBeUndefined();
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('id', '1');
    });

    it('debe retornar Error cuando falla la eliminacion', async () => {
      const pgError = { message: 'delete failed', details: '' };
      const chain = createQueryChain({ error: pgError });
      mockFrom.mockReturnValue(chain);

      const result = await productService.delete('1');

      expect(result).toBeInstanceOf(Error);
    });
  });
});
