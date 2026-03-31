import { FirestoreDocument } from './firestore.model';

export function firestoreCollectionAdapter<T extends object>(
  data: FirestoreDocument<T>[],
): Array<T & { id: string }> {
  return data.map(doc => ({
    id: doc.id,
    ...doc.data,
  }));
}
