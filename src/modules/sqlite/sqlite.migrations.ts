export interface Migration {
  id: number;
  name: string;
  up: string;
}

export const migrations: Migration[] = [
  {
    id: 1,
    name: '001_initial_schema',
    up: `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        price REAL,
        type TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT,
        avatar TEXT,
        birth_date TEXT,
        terms_accepted INTEGER,
        created_at TEXT,
        updated_at TEXT
      );
    `,
  },
];
