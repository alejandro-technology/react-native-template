import {
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
  UserEntity,
} from './auth.model';
import { RegisterFormData, SignInFormData } from './auth.scheme';

/**
 * Convierte datos del formulario de registro a payload de API
 */
export function signUpPayloadAdapter(form: RegisterFormData): SignUpPayload {
  return {
    email: form.email,
    password: form.password,
    displayName: form.nombreCompleto,
  };
}

/**
 * Extrae UserEntity de la respuesta de registro
 */
export function signUpResponseAdapter(response: SignUpResponse): UserEntity {
  return response.user;
}

/**
 * Convierte datos del formulario de login a payload de API
 */
export function signInPayloadAdapter(form: SignInFormData): SignInPayload {
  return {
    email: form.email,
    password: form.password,
  };
}

/**
 * Extrae UserEntity de la respuesta de login
 */
export function signInResponseAdapter(response: SignInResponse): UserEntity {
  return response.user;
}
