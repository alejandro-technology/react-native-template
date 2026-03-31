import { Timestamp } from '@react-native-firebase/firestore';
// Firebase
import { firestoreService } from '@modules/firebase';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { firestoreCollectionAdapter } from '@modules/firebase/domain/firestore/firestore.adapter';
// Domain
import type {
  CreateProductPayload,
  Product,
  ProductFilter,
  UpdateProductPayload,
} from '../domain/product.model';
import { ProductRepository } from '../domain/product.repository';
// Config
import { COLLECTIONS } from '@config/collections.routes';

interface ProductFirebaseDoc {
  name: string;
  description: string;
  price: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ProductFirebaseEntity extends ProductFirebaseDoc {
  id: string;
}

function toProduct(entity: ProductFirebaseEntity): Product {
  return {
    ...entity,
    createdAt: new Date(entity.createdAt.seconds * 1000),
    updatedAt: new Date(entity.updatedAt.seconds * 1000),
  };
}

class ProductFirebaseService implements ProductRepository {
  async getAll(filter?: ProductFilter): Promise<Product[] | Error> {
    try {
      // NOTE: Firestore doesn't support full-text search or OR queries across multiple fields.
      // For production apps requiring search, consider integrating Algolia or a similar service.
      // The current approach uses client-side filtering which works for small datasets.
      // We apply a limit to prevent downloading excessive data.
      const result = await firestoreService.list<ProductFirebaseDoc>({
        collection: COLLECTIONS.PRODUCTS,
        limit: 100, // Prevent excessive reads
      });
      if (result instanceof Error) {
        return result;
      }

      const entities = firestoreCollectionAdapter<ProductFirebaseDoc>(
        result.docs,
      );
      const products = entities.map(toProduct);

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

  async getById(id: string): Promise<Product | Error> {
    try {
      const result = await firestoreService.get<ProductFirebaseDoc>({
        collection: COLLECTIONS.PRODUCTS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('Producto no encontrado');
      }

      return toProduct({ id, ...result.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: CreateProductPayload): Promise<Product | Error> {
    try {
      const now = new Date();
      const result = await firestoreService.create<ProductFirebaseDoc>({
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

      return toProduct({ id: result.id, ...result.data });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(
    id: string,
    data: UpdateProductPayload,
  ): Promise<Product | Error> {
    try {
      const now = new Date();

      const updateResult = await firestoreService.update<ProductFirebaseDoc>({
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

      const result = await firestoreService.get<ProductFirebaseDoc>({
        collection: COLLECTIONS.PRODUCTS,
        id,
      });
      if (result instanceof Error) {
        return result;
      }
      if (!result.exists || !result.data) {
        return new Error('Producto no encontrado');
      }

      return toProduct({ id: result.id, ...result.data });
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
