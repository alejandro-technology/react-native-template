// Supabase
import { supabaseClient, manageSupabaseError } from '@modules/supabase';
// Config
import { COLLECTIONS } from '@config/collections.routes';
// Domain
import { UserRepository } from '../domain/user.repository';
import type {
  CreateUserPayload,
  User,
  UserFilter,
  UpdateUserPayload,
} from '../domain/user.model';

const AVATARS_BUCKET = 'avatars';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  birth_date: string | null;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    avatar: row.avatar ?? undefined,
    birthDate: row.birth_date ? new Date(row.birth_date) : undefined,
    termsAccepted: row.terms_accepted,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

async function uploadAvatarIfNeeded(
  userId: string,
  avatar: string | undefined | null,
): Promise<string | undefined> {
  if (!avatar) {
    return undefined;
  }

  // If it's already a remote URL (http/https), return as-is
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }

  // Upload local file to Supabase Storage
  const path = `${userId}/avatars/${Date.now()}.jpg`;

  // React Native local URIs need to be fetched as a blob before upload
  let fileBlob: Blob;
  try {
    const response = await fetch(avatar);
    fileBlob = await response.blob();
  } catch {
    console.warn('Failed to read local avatar file:', avatar);
    return undefined;
  }

  const { error: uploadError } = await supabaseClient.storage
    .from(AVATARS_BUCKET)
    .upload(path, fileBlob, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: false,
    });

  if (uploadError) {
    console.warn(
      'Failed to upload avatar to Supabase Storage:',
      uploadError.message,
    );
    return undefined;
  }

  const { data } = supabaseClient.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

class UserSupabaseService implements UserRepository {
  async getAll(filter?: UserFilter): Promise<User[] | Error> {
    try {
      // NOTE: Supabase supports full-text search via .textSearch() on tsvector columns.
      // The current approach uses ilike across multiple columns which works for small datasets.
      // For production apps requiring scalable search, consider configuring a tsvector index.
      let query = supabaseClient.from(COLLECTIONS.USERS).select('*');

      if (filter?.searchText) {
        const search = `%${filter.searchText}%`;
        query = query.or(
          `name.ilike.${search},email.ilike.${search},phone.ilike.${search},role.ilike.${search}`,
        );
      }

      const { data, error } = await query;

      if (error) {
        return manageSupabaseError(error);
      }

      return (data as UserRow[]).map(toUser);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async getById(id: string): Promise<User | Error> {
    try {
      const { data, error } = await supabaseClient
        .from(COLLECTIONS.USERS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return manageSupabaseError(error);
      }

      return toUser(data as UserRow);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async create(payload: CreateUserPayload): Promise<User | Error> {
    try {
      // Insert first without avatar to get the generated userId
      const { data, error } = await supabaseClient
        .from(COLLECTIONS.USERS)
        .insert({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
          birth_date: payload.birthDate?.toISOString() ?? null,
          terms_accepted: payload.termsAccepted,
        })
        .select()
        .single();

      if (error) {
        return manageSupabaseError(error);
      }

      const createdUser = data as UserRow;

      // Upload avatar now that we have the real userId
      if (payload.avatar) {
        const avatarUrl = await uploadAvatarIfNeeded(
          createdUser.id,
          payload.avatar,
        );
        if (avatarUrl) {
          const { data: updatedData, error: updateError } = await supabaseClient
            .from(COLLECTIONS.USERS)
            .update({ avatar: avatarUrl })
            .eq('id', createdUser.id)
            .select()
            .single();

          if (!updateError && updatedData) {
            return toUser(updatedData as UserRow);
          }
        }
      }

      return toUser(createdUser);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async update(id: string, payload: UpdateUserPayload): Promise<User | Error> {
    try {
      const updateData: Partial<Omit<UserRow, 'id' | 'created_at'>> = {};

      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.email !== undefined) updateData.email = payload.email;
      if (payload.phone !== undefined) updateData.phone = payload.phone;
      if (payload.role !== undefined) updateData.role = payload.role;
      if (payload.birthDate !== undefined) {
        updateData.birth_date = payload.birthDate.toISOString();
      }
      if (payload.avatar !== undefined) {
        if (payload.avatar === null) {
          // null = remove avatar
          updateData.avatar = null;
        } else {
          // Upload if local, return as-is if remote
          updateData.avatar =
            (await uploadAvatarIfNeeded(id, payload.avatar)) ?? null;
        }
      }

      const { data, error } = await supabaseClient
        .from(COLLECTIONS.USERS)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return manageSupabaseError(error);
      }

      return toUser(data as UserRow);
    } catch (error) {
      return manageSupabaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const { error } = await supabaseClient
        .from(COLLECTIONS.USERS)
        .delete()
        .eq('id', id);

      if (error) {
        return manageSupabaseError(error);
      }

      return;
    } catch (error) {
      return manageSupabaseError(error);
    }
  }
}

function createUserSupabaseService(): UserRepository {
  return new UserSupabaseService();
}

export default createUserSupabaseService();
