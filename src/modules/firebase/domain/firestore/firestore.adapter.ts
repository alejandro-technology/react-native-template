import { FirestoreDocument } from './firestore.model';

export function firestoreCollectionAdapter<T>(data: FirestoreDocument[]): T[] {
  return data.map(doc => ({
    id: doc.id,
    ...doc.data,
  })) as T[];
}
