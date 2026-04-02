jest.mock('react-native-config', () => ({
  API_URL: 'https://api.example.com',
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

function loadAxiosServiceModule() {
  jest.resetModules();

  const axiosModule = require('axios');
  const mockCreate = axiosModule.default.create as jest.Mock;

  mockCreate.mockReset();

  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  mockCreate.mockReturnValue(mockAxiosInstance);

  const axiosService = require('@modules/network/infrastructure/axios.service');

  return {
    ...axiosService,
    mockCreate,
    mockAxiosInstance,
  };
}

describe('AxiosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear instancia con configuracion por defecto', () => {
    const { createAxiosInstance, mockCreate } = loadAxiosServiceModule();

    createAxiosInstance();

    expect(mockCreate).toHaveBeenLastCalledWith({
      baseURL: undefined,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  it('debe crear instancia con configuracion personalizada', () => {
    const { createAxiosInstance, mockCreate } = loadAxiosServiceModule();

    createAxiosInstance({
      baseURL: 'https://custom.example.com',
      timeout: 5000,
      headers: {
        Authorization: 'Bearer token',
      },
    });

    expect(mockCreate).toHaveBeenLastCalledWith({
      baseURL: 'https://custom.example.com',
      timeout: 5000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      },
    });
  });

  it('debe retornar la instancia singleton con getAxiosClient', () => {
    const { axiosClient, getAxiosClient, mockCreate, mockAxiosInstance } =
      loadAxiosServiceModule();

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(axiosClient).toBe(mockAxiosInstance);
    expect(getAxiosClient()).toBe(axiosClient);
  });
});
