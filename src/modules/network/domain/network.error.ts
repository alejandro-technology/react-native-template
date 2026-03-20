import { AxiosError } from 'axios';
import { AXIOS_MESSAGES } from './network.messages';

export function manageAxiosError(error: unknown) {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') {
      return new Error(AXIOS_MESSAGES.TIMEOUT);
    }

    if (error.code?.includes('ERR_NETWORK')) {
      return new Error(AXIOS_MESSAGES.NETWORK_ERROR);
    }

    if (error.code?.includes('ECONNREFUSED')) {
      return new Error(AXIOS_MESSAGES.CONNECTION_REFUSED);
    }

    const status = error.response?.status;

    if (status === 400) {
      if (error.response?.data?.errors) {
        const e = new Error(JSON.stringify(error.response?.data?.errors));
        e.name = 'FormError';
        return e;
      }

      if (error.response?.data?.message?.includes('Duplicate identifier')) {
        const e = new Error(error.response.data.message);
        e.name = 'DuplicateIdentifierError';
        return e;
      }

      return new Error(AXIOS_MESSAGES.BAD_REQUEST);
    }

    if (status === 401) {
      const e = new Error(AXIOS_MESSAGES.UNAUTHORIZED);
      e.name = 'UnauthorizedError';
      return e;
    }

    if (status === 403) {
      const e = new Error(AXIOS_MESSAGES.FORBIDDEN);
      e.name = 'ForbiddenError';
      return e;
    }

    if (status === 404) {
      const e = new Error(AXIOS_MESSAGES.NOT_FOUND);
      e.name = 'NotFoundError';
      return e;
    }

    if (status === 409) {
      const e = new Error(
        error.response?.data?.message || AXIOS_MESSAGES.CONFLICT,
      );
      e.name = 'ConflictError';
      return e;
    }

    if (status === 429) {
      const e = new Error(AXIOS_MESSAGES.RATE_LIMIT);
      e.name = 'RateLimitError';
      return e;
    }

    if (status && status >= 500) {
      return new Error(AXIOS_MESSAGES.SERVER_ERROR);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    return new Error(error.message + ' - ' + error.code);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(AXIOS_MESSAGES.UNKNOWN_ERROR);
}
