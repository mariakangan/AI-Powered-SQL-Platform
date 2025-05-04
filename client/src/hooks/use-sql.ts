import { useState, useEffect } from 'react';
import { createDatabase, createTables, executeQuery } from '@/lib/sqljs';
import { TableDefinition, QueryResult } from '@shared/schema';
import { Database } from 'sql.js';

interface UseSQLResult {
  database: Database | null;
  isLoading: boolean;
  error: Error | null;
  runQuery: (sql: string) => Promise<QueryResult>;
  loadDataset: (tables: TableDefinition[]) => Promise<boolean>;
}

export function useSQL(): UseSQLResult {
  const [database, setDatabase] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initDB = async () => {
      try {
        const db = await createDatabase();
        if (isMounted) {
          setDatabase(db);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    };

    initDB();

    return () => {
      isMounted = false;
      if (database) {
        database.close();
      }
    };
  }, []);

  const runQuery = async (sql: string): Promise<QueryResult> => {
    if (!database) {
      throw new Error('Database not initialized');
    }

    try {
      const startTime = performance.now();
      const results = database.exec(sql);
      const executionTime = performance.now() - startTime;

      if (results.length === 0) {
        return {
          columns: [],
          values: [],
          executionTime
        };
      }

      return {
        columns: results[0].columns,
        values: results[0].values,
        executionTime
      };
    } catch (error) {
      throw error;
    }
  };

  const loadDataset = async (tables: TableDefinition[]): Promise<boolean> => {
    if (!database) {
      throw new Error('Database not initialized');
    }

    try {
      setIsLoading(true);
      
      // Clear existing tables first
      const existingTables = database.exec("SELECT name FROM sqlite_master WHERE type='table';");
      if (existingTables.length > 0 && existingTables[0].values.length > 0) {
        for (const [tableName] of existingTables[0].values) {
          if (tableName !== 'sqlite_sequence') {
            database.exec(`DROP TABLE IF EXISTS ${tableName};`);
          }
        }
      }
      
      // Create new tables
      await createTables(database, tables);
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return false;
    }
  };

  return {
    database,
    isLoading,
    error,
    runQuery,
    loadDataset
  };
}
