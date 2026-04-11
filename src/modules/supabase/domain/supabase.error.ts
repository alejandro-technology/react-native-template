import type { PostgrestError } from '@supabase/supabase-js';

export function manageSupabaseError(
  error: PostgrestError | null | unknown,
): Error {
  if (error === null || error === undefined) {
    return new Error('Error desconocido de Supabase');
  }

  if (error instanceof Error) {
    return error;
  }

  const pgError = error as PostgrestError;
  const message = pgError?.message || pgError?.details || 'Error de Supabase';
  return new Error(message);
}
