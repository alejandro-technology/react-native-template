import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabaseClient, manageSupabaseError } from '@modules/supabase';
import type { AuthRepository } from '../domain/auth.repository';
import type {
  SignUpPayload,
  SignUpResponse,
  SignInPayload,
  SignInResponse,
  AuthUser,
  AuthStateChangeCallback,
  AuthStateUnsubscribe,
} from '../domain/auth.model';

function pickString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function supabaseUserToEntity(user: SupabaseUser | null): AuthUser | null {
  if (!user) {
    return null;
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    id: user.id,
    email: user.email ?? '',
    displayName:
      pickString(metadata.display_name) ??
      pickString(metadata.full_name) ??
      pickString(metadata.name),
    photoURL:
      pickString(metadata.avatar_url) ??
      pickString(metadata.picture) ??
      pickString(metadata.photo_url),
    emailVerified: Boolean(user.email_confirmed_at),
    createdAt: user.created_at ? new Date(user.created_at) : null,
    lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
  };
}

class SupabaseAuthService implements AuthRepository {
  async signup(data: SignUpPayload): Promise<SignUpResponse | Error> {
    try {
      const { data: authData, error } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: data.displayName
          ? {
              data: {
                display_name: data.displayName,
                full_name: data.displayName,
              },
            }
          : undefined,
      });

      if (error) {
        return manageSupabaseError(error);
      }

      const user = supabaseUserToEntity(authData.user);
      if (!user) {
        return new Error('No se pudo obtener el usuario recién registrado.');
      }

      return { user };
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    try {
      const { data: authData, error } =
        await supabaseClient.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) {
        return manageSupabaseError(error);
      }

      const user = supabaseUserToEntity(authData.user);
      if (!user) {
        return new Error('No se pudo obtener el usuario autenticado.');
      }

      return { user };
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async signout(): Promise<void | Error> {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        return manageSupabaseError(error);
      }
      return;
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null | Error> {
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) {
        return manageSupabaseError(error);
      }
      return supabaseUserToEntity(data.user);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  onAuthStateChanged(callback: AuthStateChangeCallback): AuthStateUnsubscribe {
    const { data } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        callback(supabaseUserToEntity(session?.user ?? null));
      },
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }

  async sendEmailVerification(): Promise<void | Error> {
    try {
      const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();
      if (userError) {
        return manageSupabaseError(userError);
      }

      const email = userData.user?.email;
      if (!email) {
        return new Error('No hay usuario autenticado.');
      }

      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        return manageSupabaseError(error);
      }
      return;
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void | Error> {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
      if (error) {
        return manageSupabaseError(error);
      }
      return;
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async updateProfile(data: {
    displayName?: string;
    photoURL?: string;
  }): Promise<AuthUser | Error> {
    try {
      const metadata: Record<string, string> = {};
      if (data.displayName !== undefined) {
        metadata.display_name = data.displayName;
        metadata.full_name = data.displayName;
      }
      if (data.photoURL !== undefined) {
        metadata.avatar_url = data.photoURL;
      }

      const { data: updatedData, error } = await supabaseClient.auth.updateUser(
        { data: metadata },
      );

      if (error) {
        return manageSupabaseError(error);
      }

      const user = supabaseUserToEntity(updatedData.user);
      if (!user) {
        return new Error('No se pudo obtener el usuario actualizado.');
      }
      return user;
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async deleteAccount(): Promise<void | Error> {
    try {
      const { error } = await supabaseClient.rpc('delete_user');
      if (error) {
        return manageSupabaseError(error);
      }

      const { error: signOutError } = await supabaseClient.auth.signOut();
      if (signOutError) {
        return manageSupabaseError(signOutError);
      }
      return;
    } catch (error) {
      return manageSupabaseError(error);
    }
  }
}

function createSupabaseAuthService(): AuthRepository {
  return new SupabaseAuthService();
}

export default createSupabaseAuthService();
