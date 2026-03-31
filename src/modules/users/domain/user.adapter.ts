import { CreateUserPayload } from './user.model';
import type { UserFormData } from './user.scheme';

export function userFormToPayloadAdapter(
  form: UserFormData,
): CreateUserPayload {
  return {
    name: form.name,
    email: form.email,
    phone: form.phone,
    role: form.role,
  };
}
