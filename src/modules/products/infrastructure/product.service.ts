import firestore from '@react-native-firebase/firestore';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { ProductRepository } from '../domain/product.repository';
import type {
  CreateProductPayload,
  ProductEntity,
  ProductFilter,
  UpdateProductPayload,
} from '../domain/product.model';
import { COLLECTIONS } from '@config/collections.routes';

class ProductService implements ProductRepository {
  private firestore = firestore();

  async getAll(filter?: ProductFilter): Promise<ProductEntity[] | Error> {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.PRODUCTS)
        .get();

      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductEntity[];

      if (filter?.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        products = products.filter(
          p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.id.toLowerCase().includes(searchLower),
        );
      }

      return products;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getById(id: string): Promise<ProductEntity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.PRODUCTS).doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return new Error('Producto no encontrado');
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as ProductEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: CreateProductPayload): Promise<ProductEntity | Error> {
    try {
      const now = new Date().toISOString();
      const docRef = await this.firestore.collection(COLLECTIONS.PRODUCTS).add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      const snapshot = await docRef.get();

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as ProductEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(
    id: string,
    data: UpdateProductPayload,
  ): Promise<ProductEntity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.PRODUCTS).doc(id);
      const now = new Date().toISOString();

      await docRef.update({
        ...data,
        updatedAt: now,
      });

      const snapshot = await docRef.get();

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as ProductEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.PRODUCTS).doc(id);
      await docRef.delete();
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function createProductService(): ProductRepository {
  return new ProductService();
}

export default createProductService();
