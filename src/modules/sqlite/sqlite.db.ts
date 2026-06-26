import { open } from 'react-native-nitro-sqlite';
import { migrations } from './sqlite.migrations';

// Abrimos la base de datos (por default se guarda en el directorio Documentos del dispositivo)
export const sqliteDb = open({ name: 'rnkit.sqlite' });

/**
 * Inicializa la base de datos y corre las migraciones pendientes.
 * Esta función es sincrónica y se ejecuta una vez al cargar este módulo.
 */
function initDatabase() {
  try {
    // 1. Crear tabla de migraciones si no existe
    sqliteDb.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE,
        executed_at TEXT
      )
    `);

    // 2. Leer migraciones aplicadas
    const { results } = sqliteDb.execute('SELECT id, name FROM _migrations');
    const appliedIds = new Set(results.map((row: any) => row.id as number));

    // 3. Filtrar las pendientes y aplicarlas secuencialmente
    const pendingMigrations = migrations.filter(m => !appliedIds.has(m.id));

    if (pendingMigrations.length > 0) {
      // Execute pending migrations
      for (const migration of pendingMigrations) {
        // Ejecutamos cada migración de manera independiente en sync
        // Ya que DDL (CREATE TABLE) a veces no se lleva bien con transactions
        // en algunas versiones de SQLite embebidas sin pragmas específicos.
        sqliteDb.execute(migration.up);

        sqliteDb.execute(
          'INSERT INTO _migrations (id, name, executed_at) VALUES (?, ?, ?)',
          [migration.id, migration.name, new Date().toISOString()],
        );
        console.log(`[SQLite] Migración aplicada: ${migration.name}`);
      }
    }
  } catch (error) {
    console.error('[SQLite] Error corriendo migraciones:', error);
  }
}

// Inicializamos la DB de forma síncrona
initDatabase();
