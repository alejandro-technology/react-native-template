import { Timestamp } from '@react-native-firebase/firestore';
// Firebase
import { firestoreService } from '@modules/firebase';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { firestoreCollectionAdapter } from '@modules/firebase/domain/firestore/firestore.adapter';
// Domain
import type {
  CreateProductPayload,
  ProductEntity,
  ProductFirebase,
  ProductFilter,
  UpdateProductPayload,
} from '../domain/product.model';
import { ProductRepository } from '../domain/product.repository';
// Config
import { COLLECTIONS } from '@config/collections.routes';

class ProductFirebaseService implements ProductRepository {
  async getAll(filter?: ProductFilter): Promise<ProductEntity[] | Error> {
    try {
      const result = await firestoreService.list<ProductFirebase>({
        collection: COLLECTIONS.PRODUCTS,
      });
      if (result instanceof Error) {
        return result;
      }

      const products = firestoreCollectionAdapter<ProductEntity>(result.docs);
      if (filter?.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        return products.filter(
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
      const result = await firestoreService.get<ProductFirebase>({
        collection: COLLECTIONS.PRODUCTS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('Producto no encontrado');
      }
      const productEntity: ProductEntity = {
        id,
        ...result.data,
      };

      return productEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: CreateProductPayload): Promise<ProductEntity | Error> {
    try {
      const now = new Date();
      const result = await firestoreService.create<ProductFirebase>({
        collection: COLLECTIONS.PRODUCTS,
        data: {
          ...data,
          description: data.description ?? '',
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        },
      });
      if (result instanceof Error) {
        return result;
      }

      if (!result.data) {
        return new Error('No se pudo crear el producto');
      }

      const productEntity: ProductEntity = {
        id: result.id,
        ...result.data,
      };

      return productEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(
    id: string,
    data: UpdateProductPayload,
  ): Promise<ProductEntity | Error> {
    try {
      const now = new Date();

      const updateResult = await firestoreService.update<
        Omit<ProductEntity, 'id'>
      >({
        collection: COLLECTIONS.PRODUCTS,
        id,
        data: {
          ...data,
          updatedAt: Timestamp.fromDate(now),
        },
      });
      if (updateResult instanceof Error) {
        return updateResult;
      }

      const result = await firestoreService.get<ProductFirebase>({
        collection: COLLECTIONS.PRODUCTS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('Producto no encontrado');
      }

      const productEntity: ProductEntity = {
        id: result.id,
        ...result.data,
      };
      return productEntity;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const result = await firestoreService.delete({
        collection: COLLECTIONS.PRODUCTS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function createProductFirebaseService(): ProductRepository {
  return new ProductFirebaseService();
}

export default createProductFirebaseService();
