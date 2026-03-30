import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit as limitConstraint,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import type {
  UpdateData,
  WithFieldValue,
} from '@react-native-firebase/firestore';
import { manageFirebaseError } from '../domain/firebase.error';
import type { FirestoreRepository } from '../domain/firestore/firestore.repository';
import type {
  CreateDocumentPayload,
  DeleteDocumentPayload,
  FirestoreCollection,
  FirestoreDocument,
  GetDocumentPayload,
  ListDocumentsPayload,
  UpdateDocumentPayload,
} from '../domain/firestore/firestore.model';

class FirebaseFirestoreService implements FirestoreRepository {
  private firestore = getFirestore();

  async create<T>(
    payload: CreateDocumentPayload<T>,
  ): Promise<FirestoreDocument<T> | Error> {
    try {
      const collectionRef = collection(this.firestore, payload.collection);
      const documentData = payload.data as WithFieldValue<
        Record<string, unknown>
      >;
      let docRef;

      if (payload.id) {
        docRef = doc(collectionRef, payload.id);
        await setDoc(docRef, documentData);
      } else {
        docRef = await addDoc(collectionRef, documentData);
      }

      const snapshot = await getDoc(docRef);

      return {
        id: snapshot.id,
        data: snapshot.data() as T,
        exists: Boolean(snapshot.exists),
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async get<T>(
    payload: GetDocumentPayload,
  ): Promise<FirestoreDocument<T> | Error> {
    try {
      const collectionRef = collection(this.firestore, payload.collection);
      const docRef = doc(collectionRef, payload.id);
      const snapshot = await getDoc(docRef);

      return {
        id: snapshot.id,
        data: snapshot.data() as T,
        exists: Boolean(snapshot.exists),
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update<T>(payload: UpdateDocumentPayload<T>): Promise<void | Error> {
    try {
      const collectionRef = collection(this.firestore, payload.collection);
      const docRef = doc(collectionRef, payload.id);
      await updateDoc(
        docRef,
        payload.data as UpdateData<Record<string, unknown>>,
      );
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(payload: DeleteDocumentPayload): Promise<void | Error> {
    try {
      const collectionRef = collection(this.firestore, payload.collection);
      const docRef = doc(collectionRef, payload.id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async list<T>(
    payload: ListDocumentsPayload,
  ): Promise<FirestoreCollection<T> | Error> {
    try {
      const collectionRef = collection(this.firestore, payload.collection);
      let firestoreQuery = query(collectionRef);

      if (payload.where) {
        payload.where.forEach(condition => {
          firestoreQuery = query(
            firestoreQuery,
            where(condition.field, condition.operator, condition.value),
          );
        });
      }

      if (payload.orderBy) {
        payload.orderBy.forEach(order => {
          firestoreQuery = query(
            firestoreQuery,
            orderBy(order.field, order.direction),
          );
        });
      }

      if (payload.limit) {
        firestoreQuery = query(firestoreQuery, limitConstraint(payload.limit));
      }

      if (payload.startAfter) {
        const startAfterRef = doc(collectionRef, payload.startAfter as string);
        const startAfterDoc = await getDoc(startAfterRef);
        firestoreQuery = query(firestoreQuery, startAfter(startAfterDoc));
      }

      const snapshot = await getDocs(firestoreQuery);

      return {
        docs: snapshot.docs.map(
          (snapshotDoc: {
            id: string;
            exists: boolean;
            data: () => unknown;
          }) => ({
            id: snapshotDoc.id,
            data: snapshotDoc.data() as T,
            exists: Boolean(snapshotDoc.exists),
          }),
        ),
        size: snapshot.size,
        empty: snapshot.empty,
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function createFirestoreService(): FirestoreRepository {
  return new FirebaseFirestoreService();
}

export default createFirestoreService();
