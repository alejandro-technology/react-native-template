import { User } from './user.model';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  birth_date: string | null;
  terms_accepted: boolean | number; // SQLite stores as 0/1, Supabase as boolean
  created_at: string;
  updated_at: string;
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    avatar: row.avatar ?? undefined,
    birthDate: row.birth_date ? new Date(row.birth_date) : undefined,
    termsAccepted: !!row.terms_accepted,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
