import { pgTable, text, serial, integer, boolean, json, timestamp, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table schema for datasets
export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("ri-database-2-line"),
  isDefault: boolean("is_default").default(false),
  tables: json("tables").notNull().$type<TableDefinition[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table schema for saved queries
export const savedQueries = pgTable("saved_queries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  datasetId: integer("dataset_id").references(() => datasets.id),
  sql: text("sql").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table schema for custom tables
export const customTables = pgTable("custom_tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  schema: json("schema").notNull().$type<TableSchema>(),
  data: json("data").notNull().$type<unknown[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
});

export const insertSavedQuerySchema = createInsertSchema(savedQueries).omit({
  id: true,
  createdAt: true,
});

export const insertCustomTableSchema = createInsertSchema(customTables).omit({
  id: true,
  createdAt: true,
});

// Define types
export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;

export type SavedQuery = typeof savedQueries.$inferSelect;
export type InsertSavedQuery = z.infer<typeof insertSavedQuerySchema>;

export type CustomTable = typeof customTables.$inferSelect;
export type InsertCustomTable = z.infer<typeof insertCustomTableSchema>;

// Additional types for table definitions
export type ColumnType = 'TEXT' | 'INTEGER' | 'REAL' | 'NUMERIC' | 'BOOLEAN' | 'BLOB' | 'DATE' | 'DATETIME';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencesTable?: string;
  referencesColumn?: string;
  notNull?: boolean;
  defaultValue?: string;
}

export interface TableSchema {
  columns: ColumnDefinition[];
}

export interface TableDefinition extends TableSchema {
  name: string;
  data: unknown[];
}

export interface QueryResult {
  columns: string[];
  values: unknown[][];
  executionTime: number;
}

export interface AiSuggestion {
  id: string;
  message: string;
  suggestions: string[];
}
