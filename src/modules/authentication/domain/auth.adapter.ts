import {
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
  AuthUser,
} from './auth.model';
import { RegisterFormData, SignInFormData } from './auth.scheme';

/**
 * Convierte datos del formulario de registro a payload de API
 */
export function signUpFormToPayloadAdapter(
  form: RegisterFormData,
): SignUpPayload {
  return {
    email: form.email,
    password: form.password,
    displayName: form.nombreCompleto,
  };
}

/**
 * Extrae AuthUser de la respuesta de registro
 */
export function signUpResponseAdapter(response: SignUpResponse): AuthUser {
  return response.user;
}

/**
 * Convierte datos del formulario de login a payload de API
 */
export function signInFormToPayloadAdapter(
  form: SignInFormData,
): SignInPayload {
  return {
    email: form.email,
    password: form.password,
  };
}

/**
 * Extrae AuthUser de la respuesta de login
 */
export function signInResponseAdapter(response: SignInResponse): AuthUser {
  return response.user;
}
