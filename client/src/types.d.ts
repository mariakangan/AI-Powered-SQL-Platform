// Global type definitions for the project

// SQL.js type definitions
declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): Array<{columns: string[], values: any[][]}>;
    close(): void;
  }
  
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }
  
  function initSqlJs(config?: {locateFile?: (file: string) => string}): Promise<SqlJsStatic>;
  export default initSqlJs;
}