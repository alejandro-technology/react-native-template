// Domain
export type {
  AuthUser,
  AuthStatus,
  AuthState,
  SignUpPayload,
  SignUpResponse,
  SignInPayload,
  SignInResponse,
  AuthStateChangeCallback,
  AuthStateUnsubscribe,
} from './domain/auth.model';

export type { AuthRepository } from './domain/auth.repository';

export {
  signInFormToPayloadAdapter,
  signUpResponseAdapter,
  signUpFormToPayloadAdapter,
  signInResponseAdapter,
} from './domain/auth.adapter';

// Infrastructure
export { default as authService } from './infrastructure/auth.service';
export { useAuthStorage, authSelectors } from './application/auth.storage';

// Application
export { authQueryKeys, useCurrentUser } from './application/auth.queries';

export {
  useSignupMutation,
  useSigninMutation,
  useSignoutMutation,
  useSendEmailVerificationMutation,
  useSendPasswordResetEmailMutation,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from './application/auth.mutations';

// UI
export {
  AuthProvider,
  useAuth,
  useIsAuthenticated,
  useCurrentAuthUser,
} from './ui/providers/AuthProvider';
