import { CreateUserPayload, UpdateUserPayload } from './user.model';
import type { UserFormData } from './user.scheme';

export function userFormToPayloadAdapter(
  form: UserFormData,
): CreateUserPayload {
  return {
    name: form.name,
    email: form.email,
    phone: form.phone,
    role: form.role,
    // null means "no avatar", undefined means "not set"
    avatar: form.avatar === null ? undefined : form.avatar ?? undefined,
    birthDate: form.birthDate ?? undefined,
    termsAccepted: form.termsAccepted,
  };
}

export function userFormToUpdatePayloadAdapter(
  form: UserFormData,
): UpdateUserPayload {
  return {
    name: form.name,
    email: form.email,
    phone: form.phone,
    role: form.role,
    // Important: null means "remove avatar", must be passed as null
    // undefined means "don't change avatar"
    avatar: form.avatar,
    birthDate: form.birthDate ?? undefined,
  };
}
