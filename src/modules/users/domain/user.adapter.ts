import { CreateUserPayload, UserEntity } from './user.model';
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

export function userEntityAdapter(data: UserEntity): UserEntity {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
