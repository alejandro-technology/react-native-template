export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface UserFilter {
  searchText?: string;
}
