export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  birthDate?: Date;
  termsAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  birthDate?: Date;
  termsAccepted: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  // null = remove avatar, undefined = don't change, string = set avatar
  avatar?: string | null;
  birthDate?: Date;
}

export interface UserFilter {
  searchText?: string;
}
