import { 
  Dataset, 
  InsertDataset, 
  SavedQuery, 
  InsertSavedQuery, 
  CustomTable, 
  InsertCustomTable, 
  AiSuggestion 
} from '@shared/schema';
import { sampleDatasets, sampleQueries } from '../client/src/lib/sqlHelpers';

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Dataset operations
  getDatasets(): Promise<Dataset[]>;
  getDataset(id: number): Promise<Dataset | undefined>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  
  // Saved query operations
  getSavedQueries(): Promise<SavedQuery[]>;
  getSavedQuery(id: number): Promise<SavedQuery | undefined>;
  createSavedQuery(query: InsertSavedQuery): Promise<SavedQuery>;
  
  // Custom table operations
  getCustomTables(): Promise<CustomTable[]>;
  getCustomTable(id: number): Promise<CustomTable | undefined>;
  createCustomTable(table: InsertCustomTable): Promise<CustomTable>;
  
  // User operations - kept from original template
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private datasets: Map<number, Dataset>;
  private savedQueries: Map<number, SavedQuery>;
  private customTables: Map<number, CustomTable>;
  private users: Map<number, User>;
  
  private datasetCurrentId: number;
  private queryCurrentId: number;
  private tableCurrentId: number;
  private userCurrentId: number;

  constructor() {
    this.datasets = new Map();
    this.savedQueries = new Map();
    this.customTables = new Map();
    this.users = new Map();
    
    this.datasetCurrentId = 1;
    this.queryCurrentId = 1;
    this.tableCurrentId = 1;
    this.userCurrentId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Add sample datasets
    for (const dataset of sampleDatasets) {
      this.datasets.set(dataset.id, {
        ...dataset,
        createdAt: new Date()
      });
      this.datasetCurrentId = Math.max(this.datasetCurrentId, dataset.id + 1);
    }
    
    // Add sample queries
    for (const query of sampleQueries) {
      this.savedQueries.set(query.id, {
        ...query,
        createdAt: new Date()
      });
      this.queryCurrentId = Math.max(this.queryCurrentId, query.id + 1);
    }
  }

  // Dataset operations
  async getDatasets(): Promise<Dataset[]> {
    return Array.from(this.datasets.values());
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = this.datasetCurrentId++;
    const dataset: Dataset = { 
      ...insertDataset, 
      id,
      createdAt: new Date()
    };
    this.datasets.set(id, dataset);
    return dataset;
  }

  // Saved query operations
  async getSavedQueries(): Promise<SavedQuery[]> {
    return Array.from(this.savedQueries.values());
  }

  async getSavedQuery(id: number): Promise<SavedQuery | undefined> {
    return this.savedQueries.get(id);
  }

  async createSavedQuery(insertQuery: InsertSavedQuery): Promise<SavedQuery> {
    const id = this.queryCurrentId++;
    const query: SavedQuery = { 
      ...insertQuery, 
      id,
      createdAt: new Date()
    };
    this.savedQueries.set(id, query);
    return query;
  }

  // Custom table operations
  async getCustomTables(): Promise<CustomTable[]> {
    return Array.from(this.customTables.values());
  }

  async getCustomTable(id: number): Promise<CustomTable | undefined> {
    return this.customTables.get(id);
  }

  async createCustomTable(insertTable: InsertCustomTable): Promise<CustomTable> {
    const id = this.tableCurrentId++;
    const table: CustomTable = { 
      ...insertTable, 
      id,
      createdAt: new Date()
    };
    this.customTables.set(id, table);
    return table;
  }

  // User operations - kept from original template
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

// Keep the User type from the original template
import { users, type User, type InsertUser } from "@shared/schema";

export const storage = new MemStorage();
