import { useEffect, useState } from 'react';
import SQL from 'sql.js';
import type { Database } from 'sql.js';

let sqlPromise: Promise<any> | null = null;

// Initialize SQL.js
export const initSql = async () => {
  if (!sqlPromise) {
    // Initialize sql.js
    sqlPromise = SQL({
      // When loading remotely, specify the path
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
  }
  
  return await sqlPromise;
};

// Create a new database
export const createDatabase = async (): Promise<Database> => {
  const SQL = await initSql();
  return new SQL.Database();
};

// Execute SQL query and get results
export const executeQuery = async (db: Database, query: string): Promise<{
  columns: string[];
  values: unknown[][];
  executionTime: number;
}> => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    const startTime = performance.now();
    const results = db.exec(query);
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

// Create tables from schema
export const createTables = async (db: Database, tables: any[]): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    // First, create all tables
    for (const table of tables) {
      let createTableSql = `CREATE TABLE ${table.name} (`;
      
      const columnDefs = table.schema.columns.map((col: any) => {
        let colDef = `${col.name} ${col.type}`;
        
        if (col.isPrimaryKey) {
          colDef += ' PRIMARY KEY';
        }
        
        if (col.notNull) {
          colDef += ' NOT NULL';
        }
        
        if (col.defaultValue !== undefined) {
          colDef += ` DEFAULT ${col.defaultValue}`;
        }
        
        return colDef;
      });
      
      createTableSql += columnDefs.join(', ');
      createTableSql += ');';
      
      db.exec(createTableSql);
    }
    
    // Then, add foreign key constraints if SQLite supports it
    for (const table of tables) {
      for (const column of table.schema.columns) {
        if (column.isForeignKey && column.referencesTable && column.referencesColumn) {
          const alterTableSql = `
            ALTER TABLE ${table.name}
            ADD FOREIGN KEY (${column.name})
            REFERENCES ${column.referencesTable}(${column.referencesColumn});
          `;
          try {
            db.exec(alterTableSql);
          } catch (e) {
            console.warn('Foreign key constraint not supported in this version of SQLite', e);
          }
        }
      }
    }
    
    // Finally, insert data
    for (const table of tables) {
      if (table.data && table.data.length > 0) {
        for (const row of table.data) {
          const columns = Object.keys(row).join(', ');
          const placeholders = Object.keys(row).map(() => '?').join(', ');
          const values = Object.values(row);
          
          const insertSql = `INSERT INTO ${table.name} (${columns}) VALUES (${placeholders});`;
          db.run(insertSql, values);
        }
      }
    }
  } catch (error) {
    throw error;
  }
};

// Hook to handle database initialization
export function useDatabase() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        const database = await createDatabase();
        if (mounted) {
          setDb(database);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      mounted = false;
      db?.close();
    };
  }, []);
  
  return { db, loading, error };
}
