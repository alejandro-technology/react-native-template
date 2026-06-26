export function manageSqliteError(error: unknown): Error {
  if (error === null || error === undefined) {
    return new Error('Error desconocido de SQLite');
  }

  if (error instanceof Error) {
    return error;
  }

  // Si el error es de tipo objeto y tiene propiedad message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Error((error as { message: string }).message);
  }

  return new Error(String(error));
}
