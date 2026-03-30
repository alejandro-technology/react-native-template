export interface FirestoreDocument<T = Record<string, unknown>> {
  id: string;
  data: T;
  exists: boolean;
}

export interface FirestoreCollection<T = Record<string, unknown>> {
  docs: FirestoreDocument<T>[];
  size: number;
  empty: boolean;
}

export interface CreateDocumentPayload<T> {
  collection: string;
  data: T;
  id?: string;
}

export interface UpdateDocumentPayload<T> {
  collection: string;
  id: string;
  data: Partial<T>;
}

export interface DeleteDocumentPayload {
  collection: string;
  id: string;
}

export interface GetDocumentPayload {
  collection: string;
  id: string;
}

export interface ListDocumentsPayload {
  collection: string;
  where?: {
    field: string;
    operator:
      | '=='
      | '<'
      | '<='
      | '>'
      | '>='
      | 'array-contains'
      | 'in'
      | 'array-contains-any';
    value: unknown;
  }[];
  orderBy?: {
    field: string;
    direction?: 'asc' | 'desc';
  }[];
  limit?: number;
  startAfter?: unknown;
}

export interface FirestoreRepository {
  create<T>(
    payload: CreateDocumentPayload<T>,
  ): Promise<FirestoreDocument<T> | Error>;
  get<T>(payload: GetDocumentPayload): Promise<FirestoreDocument<T> | Error>;
  update<T>(payload: UpdateDocumentPayload<T>): Promise<void | Error>;
  delete(payload: DeleteDocumentPayload): Promise<void | Error>;
  list<T>(
    payload: ListDocumentsPayload,
  ): Promise<FirestoreCollection<T> | Error>;
}
