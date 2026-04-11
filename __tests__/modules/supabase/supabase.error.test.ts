import { manageSupabaseError } from '../../../src/modules/supabase/domain/supabase.error';

describe('manageSupabaseError', () => {
  it('debe retornar error generico cuando recibe null', () => {
    const result = manageSupabaseError(null);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Error desconocido de Supabase');
  });

  it('debe retornar error generico cuando recibe undefined', () => {
    const result = manageSupabaseError(undefined);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Error desconocido de Supabase');
  });

  it('debe retornar la instancia de Error sin modificar', () => {
    const originalError = new Error('error original');
    const result = manageSupabaseError(originalError);

    expect(result).toBe(originalError);
    expect(result.message).toBe('error original');
  });

  it('debe mapear PostgrestError usando el campo message', () => {
    const pgError = {
      message: 'duplicate key value violates unique constraint',
      details: 'Key (email)=(test@test.com) already exists.',
      hint: '',
      code: '23505',
    };

    const result = manageSupabaseError(pgError);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('duplicate key value violates unique constraint');
  });

  it('debe usar el campo details cuando message no esta disponible', () => {
    const pgError = {
      message: '',
      details: 'no rows returned',
      hint: '',
      code: 'PGRST116',
    };

    const result = manageSupabaseError(pgError);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('no rows returned');
  });

  it('debe retornar error generico cuando el objeto no tiene message ni details', () => {
    const result = manageSupabaseError({ code: 'UNKNOWN' });

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Error de Supabase');
  });

  it('debe manejar un string como error', () => {
    const result = manageSupabaseError('algo salio mal');

    expect(result).toBeInstanceOf(Error);
  });
});
