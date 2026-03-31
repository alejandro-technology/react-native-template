export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  // null = remove avatar, undefined = don't change, string = set avatar
  avatar?: string | null;
}

export interface UserFilter {
  searchText?: string;
}
