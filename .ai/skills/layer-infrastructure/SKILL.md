---
name: layer-infrastructure
description: Create the infrastructure layer for a Clean Architecture module (service factory, HTTP, Mock, Firebase implementations).
license: MIT
compatibility: opencode
metadata:
  layer: infrastructure
  workflow: scaffold
  output: src/modules/{module}/infrastructure/**
---

# Infrastructure Layer

Create the infrastructure layer for entity `$ARGUMENTS`.

## Files to Create

```
src/modules/{module}/infrastructure/
  {entity}.service.ts          # Factory (singleton)
  {entity}.http.service.ts     # HTTP implementation
  {entity}.mock.service.ts     # Mock implementation
  {entity}.firebase.service.ts # Firebase implementation
```

## Step 1: `{entity}.service.ts` (Factory)

```typescript
import { {Entity}Repository } from '../domain/{entity}.repository';
import {entity}HttpService from './{entity}.http.service';
import {entity}FirebaseService from './{entity}.firebase.service';
import {entity}MockService from './{entity}.mock.service';
import { CONFIG } from '@config/config';

function create{Entity}Service(): {Entity}Repository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return {entity}HttpService;
    case 'firebase':
      return {entity}FirebaseService;
    case 'mock':
      return {entity}MockService;
    default:
      throw new Error(`Unknown service provider: ${CONFIG.SERVICE_PROVIDER}`);
  }
}

export default create{Entity}Service();
```

## Step 2: `{entity}.http.service.ts`

```typescript
import axiosService from '@modules/network/infrastructure/axios.service';
import { manageAxiosError } from '@modules/network/domain/network.error';
import { API_ROUTES } from '@config/api.routes';
import { {Entity}Repository } from '../domain/{entity}.repository';
import type {
  Create{Entity}Payload,
  {Entity},
  {Entity}Filter,
  Update{Entity}Payload,
} from '../domain/{entity}.model';

class {Entity}HttpService implements {Entity}Repository {
  async getAll(filter?: {Entity}Filter): Promise<{Entity}[] | Error> {
    try {
      const params = filter?.searchText ? { search: filter.searchText } : {};
      const response = await axiosService.get<{Entity}[]>(API_ROUTES.{ENTITIES}, {
        params,
      });
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async getById(id: string): Promise<{Entity} | Error> {
    try {
      const response = await axiosService.get<{Entity}>(
        `${API_ROUTES.{ENTITIES}}/${id}`,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async create(data: Create{Entity}Payload): Promise<{Entity} | Error> {
    try {
      const response = await axiosService.post<{Entity}>(
        API_ROUTES.{ENTITIES},
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async update(id: string, data: Update{Entity}Payload): Promise<{Entity} | Error> {
    try {
      const response = await axiosService.patch<{Entity}>(
        `${API_ROUTES.{ENTITIES}}/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await axiosService.delete(`${API_ROUTES.{ENTITIES}}/${id}`);
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

function create{Entity}HttpService(): {Entity}Repository {
  return new {Entity}HttpService();
}

export default create{Entity}HttpService();
```

## Step 3: `{entity}.mock.service.ts`

```typescript
import { {Entity}Repository } from '../domain/{entity}.repository';
import type {
  Create{Entity}Payload,
  {Entity},
  {Entity}Filter,
  Update{Entity}Payload,
} from '../domain/{entity}.model';

class {Entity}MockService implements {Entity}Repository {
  database: {Entity}[] = [];

  getAll(filter?: {Entity}Filter): Promise<{Entity}[] | Error> {
    let results = this.database;
    if (filter?.searchText) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(filter.searchText!.toLowerCase()),
      );
    }
    return Promise.resolve(results);
  }

  getById(id: string): Promise<{Entity} | Error> {
    const item = this.database.find(i => i.id === id);
    if (!item) {
      return Promise.resolve(new Error('{Entity} no encontrado'));
    }
    return Promise.resolve(item);
  }

  create(data: Create{Entity}Payload): Promise<{Entity} | Error> {
    const now = new Date();
    const newItem: {Entity} = {
      id: String(Date.now()),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.database.push(newItem);
    return Promise.resolve(newItem);
  }

  update(id: string, data: Update{Entity}Payload): Promise<{Entity} | Error> {
    const index = this.database.findIndex(i => i.id === id);
    if (index === -1) {
      return Promise.resolve(new Error('{Entity} no encontrado'));
    }
    const updated = {
      ...this.database[index],
      ...data,
      updatedAt: new Date(),
    };
    this.database[index] = updated;
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<void | Error> {
    const index = this.database.findIndex(i => i.id === id);
    if (index === -1) {
      return Promise.resolve(new Error('{Entity} no encontrado'));
    }
    this.database.splice(index, 1);
    return Promise.resolve();
  }
}

function create{Entity}MockService(): {Entity}Repository {
  return new {Entity}MockService();
}

export default create{Entity}MockService();
```

## Step 4: `{entity}.firebase.service.ts`

```typescript
import { Timestamp } from '@react-native-firebase/firestore';
import { firestoreService } from '@modules/firebase';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { firestoreCollectionAdapter } from '@modules/firebase/domain/firestore/firestore.adapter';
import { COLLECTIONS } from '@config/collections.routes';
import { {Entity}Repository } from '../domain/{entity}.repository';
import type {
  Create{Entity}Payload,
  {Entity},
  {Entity}Filter,
  Update{Entity}Payload,
} from '../domain/{entity}.model';

// Firebase document type (uses Timestamp instead of Date)
interface {Entity}FirebaseDoc {
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface {Entity}FirebaseEntity extends {Entity}FirebaseDoc {
  id: string;
}

// Adapter: Firebase → Domain
function to{Entity}(entity: {Entity}FirebaseEntity): {Entity} {
  return {
    ...entity,
    createdAt: new Date(entity.createdAt.seconds * 1000),
    updatedAt: new Date(entity.updatedAt.seconds * 1000),
  };
}

class {Entity}FirebaseService implements {Entity}Repository {
  private collection = COLLECTIONS.{ENTITIES};

  async getAll(filter?: {Entity}Filter): Promise<{Entity}[] | Error> {
    try {
      const result = await firestoreService.getCollection<{Entity}FirebaseDoc>({
        collection: this.collection,
      });
      if (result instanceof Error) return result;

      let items = firestoreCollectionAdapter(result).map(to{Entity});

      if (filter?.searchText) {
        items = items.filter(item =>
          item.name.toLowerCase().includes(filter.searchText!.toLowerCase()),
        );
      }

      return items;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getById(id: string): Promise<{Entity} | Error> {
    try {
      const result = await firestoreService.get<{Entity}FirebaseDoc>({
        collection: this.collection,
        id,
      });
      if (result instanceof Error) return result;
      if (!result) return new Error('{Entity} no encontrado');

      return to{Entity}({ ...result, id });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(data: Create{Entity}Payload): Promise<{Entity} | Error> {
    try {
      const now = Timestamp.now();
      const doc: {Entity}FirebaseDoc = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const result = await firestoreService.create<{Entity}FirebaseDoc>({
        collection: this.collection,
        data: doc,
      });
      if (result instanceof Error) return result;

      return to{Entity}({ ...doc, id: result.id });
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(id: string, data: Update{Entity}Payload): Promise<{Entity} | Error> {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      const result = await firestoreService.update({
        collection: this.collection,
        id,
        data: updateData,
      });
      if (result instanceof Error) return result;

      return this.getById(id);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      const result = await firestoreService.delete({
        collection: this.collection,
        id,
      });
      if (result instanceof Error) return result;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function create{Entity}FirebaseService(): {Entity}Repository {
  return new {Entity}FirebaseService();
}

export default create{Entity}FirebaseService();
```

## Reference

- Example module: `src/modules/products/infrastructure/`
