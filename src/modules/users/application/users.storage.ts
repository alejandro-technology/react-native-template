import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
// Config
import { mmkvStorage, mmkvReviver } from '@config/storage';
// Domain
import type { User, UserFilter } from '../domain/user.model';

interface UsersState {
  // Estado
  users: User[];

  // CRUD Operations
  addUser: (user: User) => void;
  getUsers: (filter?: UserFilter) => User[];
  getUserById: (id: string) => User | undefined;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  clearUsers: () => void;
}

const initialState = {
  users: [],
};

export const useUsersStorage = create<UsersState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Create
      addUser: (user: User) =>
        set(state => ({
          users: [...state.users, user],
        })),

      // Read (all)
      getUsers: filter => {
        let users = get().users;

        if (filter?.searchText) {
          users = users.filter(u =>
            u.name.toLowerCase().includes(filter.searchText!.toLowerCase()),
          );
        }

        return users;
      },

      // Read (by id)
      getUserById: (id: string) => {
        return get().users.find(user => user.id === id);
      },

      // Update
      updateUser: (id: string, updates: Partial<User>) =>
        set(state => ({
          users: state.users.map(user =>
            user.id === id
              ? { ...user, ...updates, updatedAt: new Date() }
              : user,
          ),
        })),

      // Delete
      deleteUser: (id: string) =>
        set(state => ({
          users: state.users.filter(user => user.id !== id),
        })),

      // Clear all
      clearUsers: () => set({ users: [] }),
    }),
    {
      name: 'users-storage',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: state => ({
        users: state.users,
      }),
      onRehydrateStorage: () => state => {
        if (state?.users) {
          // Revivir fechas en usuarios
          state.users = state.users.map(user => ({
            ...user,
            createdAt: mmkvReviver('createdAt', user.createdAt) as Date,
            updatedAt: mmkvReviver('updatedAt', user.updatedAt) as Date,
          }));
        }
      },
    },
  ),
);
