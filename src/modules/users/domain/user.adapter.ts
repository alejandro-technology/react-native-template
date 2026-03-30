import { CreateUserPayload, User, UserEntity } from './user.model';
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

export function userEntityToUserAdapter(data: UserEntity): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    createdAt: new Date(data.createdAt.seconds * 1000),
    updatedAt: new Date(data.updatedAt.seconds * 1000),
  };
}

export function userEntityToUsersAdapter(data: UserEntity[]): User[] {
  return data.map(userEntityToUserAdapter);
}
