jest.mock('@modules/supabase', () => ({
  supabaseClient: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      resend: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    rpc: jest.fn(),
  },
  manageSupabaseError: jest.fn((error: unknown) => new Error(String(error))),
}));

import supabaseAuthService from '../../../../src/modules/authentication/infrastructure/auth.supabase.service';

describe('SupabaseAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStoredToken (REQ-AUTHHTTP-005)', () => {
    it('should return null — Supabase provider does not expose an HTTP JWT', () => {
      const result = supabaseAuthService.getStoredToken?.();

      expect(result).toBeNull();
    });
  });
});
