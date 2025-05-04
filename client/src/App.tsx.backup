import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { initSql, createDatabase, executeQuery as execSql } from "./lib/sqljs";
import { Pencil, Settings } from "lucide-react";

// Types for our tables
interface TableColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isNotNull?: boolean;
}

interface CustomTable {
  name: string;
  columns: TableColumn[];
  records: Record<string, any>[];
}

// SQL App with user-defined tables
function SqlApp() {
  const [activeTab, setActiveTab] = useState<string>("query");
  const [sql, setSql] = useState("SELECT * FROM accommodations WHERE price_per_night < 200");
  const [result, setResult] = useState<{ columns: string[], values: any[][], executionTime?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userTables, setUserTables] = useState<CustomTable[]>([]);
  const [createTableDialogOpen, setCreateTableDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableColumns, setNewTableColumns] = useState("");
  const [aiTablePrompt, setAiTablePrompt] = useState("");
  const [aiDataPrompt, setAiDataPrompt] = useState("");
  const [selectedTable, setSelectedTable] = useState("accommodations");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  
  // Sample data to display for SQL queries
  const sampleData = {
    accommodations: [
      { id: 1, name: 'Beach House', location: 'Miami', price_per_night: 250.00, rating: 4.8, has_wifi: true, has_pool: true },
      { id: 2, name: 'Mountain Cabin', location: 'Denver', price_per_night: 175.50, rating: 4.6, has_wifi: true, has_pool: false },
      { id: 3, name: 'City Apartment', location: 'New York', price_per_night: 300.00, rating: 4.2, has_wifi: true, has_pool: false },
      { id: 4, name: 'Lake House', location: 'Chicago', price_per_night: 225.00, rating: 4.7, has_wifi: true, has_pool: true },
      { id: 5, name: 'Desert Retreat', location: 'Phoenix', price_per_night: 150.00, rating: 4.4, has_wifi: true, has_pool: true }
    ]
  };

  // Load sample user tables on first render
  useEffect(() => {
    const studentsTable: CustomTable = {
      name: "students",
      columns: [
        { name: "id", type: "INTEGER", isPrimary: true },
        { name: "name", type: "TEXT", isNotNull: true },
        { name: "age", type: "INTEGER" },
        { name: "grade", type: "TEXT" },
        { name: "enrolled", type: "BOOLEAN" }
      ],
      records: [
        { id: 1, name: "John Doe", age: 18, grade: "A", enrolled: true },
        { id: 2, name: "Jane Smith", age: 19, grade: "B", enrolled: true },
        { id: 3, name: "Mike Johnson", age: 20, grade: "C", enrolled: false }
      ]
    };
    setUserTables([studentsTable]);
  }, []);

  // SQL execution - enhanced to support all SQL operations
  const executeQuery = async () => {
    if (!sql.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    setResult(null);
    
    try {
      console.log("Starting SQL execution");
      
      // Initialize SQL.js using the fixed initialization
      const SQL = await initSql();
      console.log("SQL initialized");
      
      // Create a new database
      const db = new SQL.Database();
      console.log("Database created");
      
      // Create the built-in accommodations table
      const accommodationSQL = `
      CREATE TABLE accommodations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        price_per_night REAL NOT NULL,
        rating REAL,
        has_wifi BOOLEAN,
        has_pool BOOLEAN
      );

      INSERT INTO accommodations VALUES (1, 'Sunny Beach Resort', 'Florida', 250.00, 4.5, 1, 1);
      INSERT INTO accommodations VALUES (2, 'Mountain Lodge', 'Colorado', 175.50, 4.2, 1, 0);
      INSERT INTO accommodations VALUES (3, 'City Center Hotel', 'New York', 350.00, 4.8, 1, 1);
      `;
      
      try {
        db.exec(accommodationSQL);
        console.log("Accommodation table created");
      } catch (err) {
        console.log("Accommodation table setup error (likely already exists):", err);
      }
      
      // Create all user-defined tables
      for (const table of userTables) {
        try {
          // Create the table
          const createSQL = generateTableSchema(table);
          db.exec(createSQL);
          console.log(`Table ${table.name} created`);
          
          // Insert records if they exist
          if (table.records && table.records.length > 0) {
            for (const record of table.records) {
              const columns = Object.keys(record).join(', ');
              const placeholders = Object.keys(record).map(() => '?').join(', ');
              const values = Object.values(record);
              
              const insertSQL = `INSERT INTO ${table.name} (${columns}) VALUES (${placeholders});`;
              db.run(insertSQL, values);
            }
            console.log(`${table.records.length} records inserted into ${table.name}`);
          }
        } catch (err) {
          console.error(`Error creating table ${table.name}:`, err);
        }
      }
      
      // Start time for measuring execution
      const startTime = performance.now();
      
      // Get lowercase SQL for pattern matching
      const sqlLower = sql.toLowerCase().trim();
      
      // Check if it's a DROP TABLE operation
      const isDropTable = /^drop\s+table\s+/i.test(sqlLower);
      
      // Check if it's a DML operation (INSERT, UPDATE, DELETE, CREATE, ALTER)
      const isDML = /^(insert|update|delete|create|alter)\s+/i.test(sqlLower);
      
      try {
        // Special handling for DROP TABLE
        if (isDropTable) {
          // Extract the table name from DROP TABLE statement
          const dropTableMatch = sqlLower.match(/^drop\s+table\s+(?:if\s+exists\s+)?([`"']?)(\w+)\1/i);
          
          if (dropTableMatch && dropTableMatch[2]) {
            const tableName = dropTableMatch[2];
            console.log(`Executing DROP TABLE for ${tableName}`);
            
            // Execute the DROP TABLE statement
            db.run(sql);
            const endTime = performance.now();
            
            // Update in-memory state by removing the dropped table
            const updatedTables = userTables.filter(t => 
              t.name.toLowerCase() !== tableName.toLowerCase()
            );
            
            // If we successfully removed a table from memory
            if (updatedTables.length < userTables.length) {
              setUserTables(updatedTables);
              
              toast({
                title: "Table dropped",
                description: `Table '${tableName}' has been dropped successfully`
              });
            } else {
              toast({
                title: "Table dropped",
                description: `Operation completed in ${(endTime - startTime).toFixed(2)}ms`
              });
            }
            
            // Set an empty result since the table is gone
            setResult({
              columns: [],
              values: [],
              executionTime: endTime - startTime
            });
            return;
          }
        }
          
        console.log(`Executing ${isDML ? 'DML' : 'SELECT'} query: ${sql}`);
          
          if (isDML) {
            // For DML operations, use run() instead of exec()
            db.run(sql);
            const endTime = performance.now();
            
            // Determine which operation was performed
            let operation = "unknown";
            if (/^insert\s+/i.test(sqlLower)) operation = "Insert";
            else if (/^update\s+/i.test(sqlLower)) operation = "Update";
            else if (/^delete\s+/i.test(sqlLower)) operation = "Delete";
            else if (/^(create|alter)\s+/i.test(sqlLower)) operation = "Schema update";
            
            toast({
              title: `${operation} successful`,
              description: `${operation} operation completed in ${(endTime - startTime).toFixed(2)}ms`
            });
            
            // After INSERT/UPDATE/DELETE, try to show the updated data
            const tableNameRegex = /^(?:insert\s+into|update|delete\s+from)\s+([`"']?)(\w+)\1/i;
            const match = sqlLower.match(tableNameRegex);
          
          if (match && match[2]) {
            const tableName = match[2];
            try {
              console.log(`Getting updated data for ${tableName}`);
              // Get the updated data from the table
              const selectResult = db.exec(`SELECT * FROM ${tableName}`);
              
              // Update our in-memory state for any type of DML operation
              const tableIndex = userTables.findIndex(t => 
                t.name.toLowerCase() === tableName.toLowerCase()
              );
              
              if (tableIndex !== -1) {
                // Create a copy of user tables
                const updatedTables = [...userTables];
                
                if (selectResult.length > 0 && selectResult[0].values.length > 0) {
                  console.log(`Updated data received: ${selectResult[0].values.length} rows`);
                  
                  // Convert SQL results back to record objects
                  const updatedRecords = selectResult[0].values.map((row: any[], i: number) => {
                    const record: Record<string, any> = {};
                    selectResult[0].columns.forEach((col: string, j: number) => {
                      record[col] = row[j];
                    });
                    return record;
                  });
                  
                  // Update in-memory state with the updated records
                  updatedTables[tableIndex].records = updatedRecords;
                  setUserTables(updatedTables);
                  console.log(`In-memory table updated with ${updatedRecords.length} records`);
                  
                  // Set result for display
                  setResult({
                    columns: selectResult[0].columns,
                    values: selectResult[0].values,
                    executionTime: endTime - startTime
                  });
                } else {
                  console.log(`No data found for ${tableName} after operation - clearing records`);
                  
                  // If there's no data after a DELETE operation, clear the records
                  updatedTables[tableIndex].records = [];
                  setUserTables(updatedTables);
                  console.log(`In-memory records cleared for ${tableName}`);
                  
                  // Set empty result for display
                  setResult({
                    columns: [],
                    values: [],
                    executionTime: endTime - startTime
                  });
                  
                  // Double check if this was a DELETE operation
                  if (/^delete\s+/i.test(sqlLower)) {
                    // Inform the user all records were deleted
                    toast({
                      title: "Records deleted",
                      description: `All records in the '${tableName}' table have been deleted`
                    });
                  }
                }
              } else {
                console.log(`Table ${tableName} not found in user tables`);
                
                // Still display results if available
                if (selectResult.length > 0) {
                  setResult({
                    columns: selectResult[0].columns,
                    values: selectResult[0].values,
                    executionTime: endTime - startTime
                  });
                }
              }
            } catch (err) {
              console.log(`Couldn't fetch updated data for ${tableName}:`, err);
            }
          }
        }
        
        if (!isDropTable && !isDML) {
          // For SELECT queries, use exec()
          const queryResult = db.exec(sql);
          const endTime = performance.now();
          
          if (queryResult.length > 0) {
            console.log(`SELECT result: ${queryResult[0].values.length} rows, ${queryResult[0].columns.length} columns`);
            setResult({
              columns: queryResult[0].columns,
              values: queryResult[0].values,
              executionTime: endTime - startTime
            });
          } else {
            // Empty result set
            console.log('SELECT query returned empty result');
            toast({
              title: "Query executed",
              description: `Query returned no results (${(endTime - startTime).toFixed(2)}ms)`
            });
            setResult({
              columns: [],
              values: [],
              executionTime: endTime - startTime
            });
          }
        }
      } catch (err) {
        console.error('Query execution error:', err);
        setError(String(err));
      } finally {
        // Close the database connection
        db.close();
        console.log("Database connection closed");
      }
    } catch (err) {
      console.error('SQL.js initialization error:', err);
      setError(String(err));
    }
  };

  // Smart table name generator based on user input or defaults
  const generateSmartTableName = (input: string): string => {
    // Extract meaningful words from the input
    const words = input.toLowerCase().split(/\s+/);
    
    // Look for common table name indicators
    const tableTypes = [
      "user", "customer", "product", "item", "order", "transaction", 
      "employee", "staff", "movie", "film", "book", "student", 
      "course", "inventory", "payment", "account", "post", "comment"
    ];
    
    // Find matching words
    for (const type of tableTypes) {
      if (words.some(w => w.includes(type))) {
        // If the word is exactly the type, use it, otherwise add "s" if needed
        return type + (type.endsWith('s') ? '' : 's');
      }
    }
    
    // Default names based on character count of the input
    const defaultNames = ["data_table", "custom_table", "user_table", "records", "items"];
    return defaultNames[input.length % defaultNames.length];
  };
  
  // AI assistance for table creation - more flexible approach
  const generateTableWithAI = async () => {
    try {
      // Get the prompt or use a default value
      const prompt = aiTablePrompt.trim() || "Create a simple data table";
      
      // For this demo, we'll handle table generation locally to ensure it always works
      // In a real app with working API, you would call the OpenAI API here
      
      // Generate table name based on the prompt or use a default
      let tableName = generateSmartTableName(prompt);
      
      // Generate columns based on table name
      const columns = getColumnSuggestions(tableName);
      
      // Set the values
      setNewTableName(tableName);
      setNewTableColumns(columns);
      
      // Show success message and clear prompt
      toast({
        title: "Table structure suggested",
        description: `Created suggestions for '${tableName}' table.`,
      });
      
      // Don't clear prompt, might be useful for reference
      // setAiTablePrompt("");
      
      // Create the table immediately
      createTableFromSuggestion(tableName, columns);
    } catch (error) {
      console.error('Error generating table:', error);
      
      // Create a basic table even when there's an error
      const fallbackName = "data_table";
      const fallbackColumns = `id INTEGER PRIMARY KEY,
name TEXT,
description TEXT,
created_at TEXT`;
      
      // Create the fallback table
      createTableFromSuggestion(fallbackName, fallbackColumns);
      
      toast({
        title: "Created basic table structure",
        description: "Created a default table structure with basic columns.",
        variant: "default"
      });
    }
  };

  // Helper function to check if a table name already exists (case-insensitive)
  const tableNameExists = (name: string): boolean => {
    // Convert to lowercase for case-insensitive comparison
    const nameLower = name.toLowerCase();
    
    // Check existing tables (case-insensitive)
    return userTables.some(table => table.name.toLowerCase() === nameLower) || 
           nameLower === "accommodations"; // Don't allow overriding the built-in table
  };
  
  // Generate a unique table name if the suggested one already exists
  const getUniqueTableName = (baseName: string): string => {
    let uniqueName = baseName;
    let counter = 1;
    
    // Keep trying with numbers appended until we find a unique name
    while (tableNameExists(uniqueName)) {
      uniqueName = `${baseName}_${counter}`;
      counter++;
    }
    
    return uniqueName;
  };

  // Helper function to create a table from suggested name and columns
  const createTableFromSuggestion = (tableName: string, columnsText: string) => {
    try {
      if (!tableName.trim()) {
        toast({
          title: "Invalid table name",
          description: "Please provide a valid table name",
          variant: "destructive"
        });
        return;
      }
      
      // Check if table name already exists (case-insensitive)
      if (tableNameExists(tableName)) {
        // Get a unique name
        const uniqueName = getUniqueTableName(tableName);
        
        toast({
          title: "Table name already exists",
          description: `Created table with name '${uniqueName}' instead`,
          variant: "default"
        });
        
        tableName = uniqueName;
      }
      
      // Parse the columns input
      const columnDefinitions = columnsText.split(',').map(col => {
        const trimmed = col.trim();
        
        // Extract column name (everything before the first space)
        const firstSpaceIndex = trimmed.indexOf(' ');
        if (firstSpaceIndex <= 0) {
          // If no space found or name is empty, use a default
          return { 
            name: `column_${Math.floor(Math.random() * 1000)}`, 
            type: 'TEXT' 
          };
        }
        
        const name = trimmed.substring(0, firstSpaceIndex);
        const rest = trimmed.substring(firstSpaceIndex + 1);
        
        // Determine type - look for common SQL types in the rest
        const typesRegex = /INTEGER|TEXT|REAL|BOOLEAN|DATE|BLOB|VARCHAR|NUMERIC/i;
        const typeMatch = rest.match(typesRegex);
        const type = typeMatch ? typeMatch[0].toUpperCase() : 'TEXT'; // Default to TEXT if no type found
        
        // Check for constraints
        const isPrimary = trimmed.toLowerCase().includes('primary key');
        const isNotNull = trimmed.toLowerCase().includes('not null');
        
        return { name, type, isPrimary, isNotNull };
      });
      
      // Create a new table with empty records
      const newTable: CustomTable = {
        name: tableName,
        columns: columnDefinitions,
        records: []
      };
      
      setUserTables([...userTables, newTable]);
      
      toast({
        title: "Table created successfully",
        description: `Your table '${tableName}' is ready for use`
      });
      
      // Automatically switch to query tab and set up a SELECT query
      setSql(`SELECT * FROM ${tableName}`);
      setActiveTab("query");
    } catch (error) {
      console.error('Error creating table from suggestion:', error);
      toast({
        title: "Error creating table",
        description: "Something went wrong with the table creation. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get column suggestions based on table name
  const getColumnSuggestions = (tableName: string): string => {
    const nameLower = tableName.toLowerCase();
    
    if (nameLower.includes('user') || nameLower.includes('customer')) {
      return `id INTEGER PRIMARY KEY,
name TEXT,
email TEXT,
age INTEGER,
signup_date TEXT,
is_active BOOLEAN`;
    } 
    else if (nameLower.includes('product') || nameLower.includes('item')) {
      return `id INTEGER PRIMARY KEY,
name TEXT,
description TEXT,
price REAL,
category TEXT,
in_stock INTEGER`;
    }
    else if (nameLower.includes('order') || nameLower.includes('transaction')) {
      return `id INTEGER PRIMARY KEY,
customer_id INTEGER,
order_date TEXT,
total_amount REAL,
status TEXT,
payment_method TEXT`;
    }
    else if (nameLower.includes('employee') || nameLower.includes('staff')) {
      return `id INTEGER PRIMARY KEY,
name TEXT,
position TEXT,
salary REAL,
hire_date TEXT,
department TEXT`;
    }
    else if (nameLower.includes('movie') || nameLower.includes('film')) {
      return `id INTEGER PRIMARY KEY,
title TEXT,
director TEXT,
release_year INTEGER,
genre TEXT,
rating REAL`;
    }
    else if (nameLower.includes('book')) {
      return `id INTEGER PRIMARY KEY,
title TEXT,
author TEXT,
publication_year INTEGER,
genre TEXT,
is_available BOOLEAN`;
    }
    else if (nameLower.includes('student')) {
      return `id INTEGER PRIMARY KEY,
name TEXT,
age INTEGER,
grade TEXT,
major TEXT,
gpa REAL`;
    }
    else {
      return `id INTEGER PRIMARY KEY,
name TEXT,
description TEXT,
created_at TEXT,
value REAL`;
    }
  };

  // Create new table - more flexible version with duplicate name checking
  const createTable = () => {
    if (!newTableName.trim()) {
      toast({
        title: "Table name required",
        description: "Please enter a name for your table",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check for table name duplication (case-insensitive)
      let finalTableName = newTableName;
      
      if (tableNameExists(finalTableName)) {
        // Get a unique name
        finalTableName = getUniqueTableName(newTableName);
        
        toast({
          title: "Table name already exists",
          description: `Created table with name '${finalTableName}' instead`,
          variant: "default"
        });
      }
      
      // Use default columns if none provided
      let columnsToUse = newTableColumns.trim();
      
      if (!columnsToUse) {
        // If no columns are specified, create a simple table with id and name
        columnsToUse = "id INTEGER PRIMARY KEY, name TEXT";
        toast({
          title: "Default columns used",
          description: "Created table with basic id and name columns"
        });
      }
      
      // More flexible parsing - handle various formats
      const columnDefinitions = columnsToUse.split(',').map(col => {
        const trimmed = col.trim();
        
        // Extract column name (everything before the first space)
        const firstSpaceIndex = trimmed.indexOf(' ');
        if (firstSpaceIndex <= 0) {
          // If no space found or name is empty, use a default
          return { 
            name: `column_${Math.floor(Math.random() * 1000)}`, 
            type: 'TEXT' 
          };
        }
        
        const name = trimmed.substring(0, firstSpaceIndex);
        const rest = trimmed.substring(firstSpaceIndex + 1);
        
        // Determine type - look for common SQL types in the rest
        const typesRegex = /INTEGER|TEXT|REAL|BOOLEAN|DATE|BLOB|VARCHAR|NUMERIC/i;
        const typeMatch = rest.match(typesRegex);
        const type = typeMatch ? typeMatch[0].toUpperCase() : 'TEXT'; // Default to TEXT if no type found
        
        // Check for constraints
        const isPrimary = trimmed.toLowerCase().includes('primary key');
        const isNotNull = trimmed.toLowerCase().includes('not null');
        
        return { name, type, isPrimary, isNotNull };
      });
      
      // Create a new table with empty records
      const newTable: CustomTable = {
        name: finalTableName,
        columns: columnDefinitions,
        records: []
      };
      
      setUserTables([...userTables, newTable]);
      setCreateTableDialogOpen(false);
      setNewTableName("");
      setNewTableColumns("");
      
      toast({
        title: "Table created successfully",
        description: `Your table '${finalTableName}' is ready for use`
      });
      
      // Automatically switch to query tab and set up a SELECT query
      setSql(`SELECT * FROM ${finalTableName};`);
      setActiveTab("query");
      
    } catch (error) {
      console.error('Error creating table:', error);
      // More friendly error message
      toast({
        title: "Couldn't create table",
        description: "We had trouble with the column format. Try using simpler definitions like 'id INTEGER, name TEXT'",
        variant: "destructive"
      });
    }
  };

  // Enhanced sample data generator with better duplicate detection
  const generateSampleData = (tableName: string, count: number = 5): Record<string, any>[] => {
    const lowerName = tableName.toLowerCase();
    const records: Record<string, any>[] = [];
    
    // Get table structure information
    let startId = 1;
    let tableColumns: TableColumn[] = [];
    
    try {
      // Find the table in our user tables array
      const tableInfo = userTables.find(t => t.name === tableName);
      
      // Get the columns from the table
      tableColumns = tableInfo?.columns || [];
      
      // Calculate next ID from existing records using our improved function
      if (tableInfo?.records && tableInfo.records.length > 0) {
        // Get all IDs as numbers
        const numericIds: number[] = [];
        tableInfo.records.forEach(record => {
          const id = parseInt(String(record.id || '0'), 10);
          if (!isNaN(id)) {
            numericIds.push(id);
          }
        });
        
        // Find max ID
        if (numericIds.length > 0) {
          startId = Math.max(...numericIds) + 1;
        }
      }
      
      console.log(`Generating data for ${tableName} with starting ID: ${startId}`);
    } catch (error) {
      console.error("Error determining table structure:", error);
      // Use default startId of 1 and empty columns
    }
    
    // Function to create customized records based on table name
    if (lowerName.includes('user') || lowerName.includes('customer') || lowerName.includes('employee')) {
      const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'Robert', 'Emma', 'David', 'Olivia', 'Daniel', 'Sophia'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
      
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const record: Record<string, any> = {
          id: startId + i,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        };
        
        // Add fields based on available columns
        if (tableColumns.some((c: TableColumn) => c.name === 'age' || c.name === 'user_age')) {
          record.age = 20 + Math.floor(Math.random() * 40);
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'signup_date' || c.name === 'created_at' || c.name === 'join_date')) {
          const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
          const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
          record.signup_date = `2023-${month}-${day}`;
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'is_active' || c.name === 'active')) {
          record.is_active = Math.random() > 0.2; // 80% chance of being active
        }
        
        records.push(record);
      }
    } 
    else if (lowerName.includes('product') || lowerName.includes('item') || lowerName.includes('inventory')) {
      const productTypes = ['Laptop', 'Smartphone', 'Headphones', 'Monitor', 'Keyboard', 'Mouse', 'Tablet', 'Camera', 'Printer', 'Speaker'];
      const categories = ['Electronics', 'Computers', 'Accessories', 'Audio', 'Gaming', 'Office'];
      
      for (let i = 0; i < count; i++) {
        const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
        const brand = ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Logitech'][Math.floor(Math.random() * 6)];
        
        const record: Record<string, any> = {
          id: startId + i,
          name: `${brand} ${productType} ${1000 + i}`,
        };
        
        // Add fields based on columns
        if (tableColumns.some((c: TableColumn) => c.name === 'description' || c.name === 'details')) {
          record.description = `High-quality ${productType.toLowerCase()} from ${brand} with premium features`;
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'price')) {
          record.price = 49.99 + (Math.floor(Math.random() * 20) * 25);
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'category')) {
          record.category = categories[Math.floor(Math.random() * categories.length)];
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'in_stock' || c.name === 'stock' || c.name === 'quantity')) {
          record.in_stock = Math.floor(Math.random() * 100);
        }
        
        records.push(record);
      }
    }
    else if (lowerName.includes('order') || lowerName.includes('transaction')) {
      for (let i = 0; i < count; i++) {
        const record: Record<string, any> = {
          id: startId + i,
          order_number: `ORD-${10000 + i}`,
        };
        
        if (tableColumns.some((c: TableColumn) => c.name === 'customer_id' || c.name === 'user_id')) {
          record.customer_id = 100 + Math.floor(Math.random() * 10);
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'amount' || c.name === 'total')) {
          record.amount = (10 + Math.floor(Math.random() * 15) * 5.99).toFixed(2);
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'date' || c.name === 'order_date')) {
          const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
          const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
          record.date = `2023-${month}-${day}`;
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'status')) {
          record.status = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'][Math.floor(Math.random() * 5)];
        }
        
        records.push(record);
      }
    }
    else if (lowerName.includes('student') || lowerName.includes('course')) {
      const studentNames = ['Alice Cooper', 'Bob Smith', 'Charlie Brown', 'David Jones', 'Eva Miller', 
                          'Frank Thomas', 'Grace Lee', 'Hannah White', 'Ian Green', 'Julia Martinez'];
      
      for (let i = 0; i < count; i++) {
        const record: Record<string, any> = {
          id: startId + i,
          name: studentNames[i % studentNames.length],
        };
        
        if (tableColumns.some((c: TableColumn) => c.name === 'age')) {
          record.age = 18 + Math.floor(Math.random() * 8);
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'grade')) {
          record.grade = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'][Math.floor(Math.random() * 7)];
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'enrolled' || c.name === 'active')) {
          record.enrolled = Math.random() > 0.1; // 90% chance of being enrolled
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'major' || c.name === 'course')) {
          const majors = ['Computer Science', 'Business', 'Engineering', 'Mathematics', 'Biology', 'Psychology'];
          record.major = majors[Math.floor(Math.random() * majors.length)];
        }
        
        records.push(record);
      }
    }
    else if (lowerName === 'accommodations') {
      // Already have accommodations data, just return empty array
      return [];
    }
    else {
      // Generic data for any other table type
      for (let i = 0; i < count; i++) {
        // Start with id and name fields which are almost always present
        const record: Record<string, any> = {
          id: startId + i,
          name: `Item ${startId + i}`,
        };
        
        // Add other common fields if they exist in the columns
        if (tableColumns.some((c: TableColumn) => c.name === 'description' || c.name === 'details')) {
          record.description = `Description for item ${startId + i}`;
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'created_at' || c.name === 'date')) {
          const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
          const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
          record.created_at = `2023-${month}-${day}`;
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'type' || c.name === 'category')) {
          record.type = ['Type A', 'Type B', 'Type C'][i % 3];
        }
        
        if (tableColumns.some((c: TableColumn) => c.name === 'value' || c.name === 'amount')) {
          record.value = (Math.random() * 1000).toFixed(2);
        }
        
        records.push(record);
      }
    }
    
    // Ensure we never create records with fields that don't match the schema
    if (tableColumns.length > 0) {
      const validColumnNames = tableColumns.map((col: TableColumn) => col.name);
      
      // Filter each record to only include valid columns
      return records.map(record => {
        const validRecord: Record<string, any> = {};
        Object.keys(record).forEach(key => {
          if (validColumnNames.includes(key)) {
            validRecord[key] = record[key];
          }
        });
        return validRecord;
      });
    }
    
    return records;
  };

  // Check for duplicate IDs in table - enhanced to handle any ID type
  const hasDuplicateId = (records: Record<string, any>[], newId: any): boolean => {
    return records.some(record => {
      // Convert both to same type for comparison
      const recordId = String(record.id || '').trim();
      const newIdStr = String(newId || '').trim();
      return recordId === newIdStr;
    });
  };
  
  // Find highest ID in existing records - enhanced to be more robust
  const getNextAvailableId = (records: Record<string, any>[]): number => {
    if (records.length === 0) return 1;
    
    // Find highest existing ID, handling various formats
    let maxId = 0;
    
    // First pass - collect all numeric IDs
    const numericIds: number[] = [];
    records.forEach(record => {
      const id = parseInt(String(record.id || '0'), 10);
      if (!isNaN(id)) {
        numericIds.push(id);
      }
    });
    
    // Find max or return 1 if none found
    if (numericIds.length > 0) {
      maxId = Math.max(...numericIds);
    }
    
    return maxId + 1;
  };
  
  // Generate insert data with AI - more flexible approach with duplicate checking
  const generateDataWithAI = async () => {
    // Only require a table selection, data prompt is optional
    if (!selectedTable) {
      toast({
        title: "Select a table",
        description: "Please select a table to generate data for",
        variant: "destructive"
      });
      return;
    }
    
    // Find the table
    const tableIdx = userTables.findIndex(t => t.name === selectedTable);
    const isBuiltIn = selectedTable === "accommodations";
    
    // Skip if it's the built-in accommodations table
    if (isBuiltIn) {
      toast({
        title: "Built-in data",
        description: "The accommodations table already has sample data you can query",
        variant: "default"
      });
      
      setSql(`SELECT * FROM accommodations`);
      setActiveTab("query");
      return;
    }
    
    // If table doesn't exist, show error
    if (tableIdx === -1) {
      toast({
        title: "Table not found",
        description: "This table doesn't exist yet. Create it first in the 'Create Tables' tab.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Set loading state
      setIsRunning(true);
      
      // Get existing records
      const existingRecords = userTables[tableIdx].records || [];
      
      // Generate some data based on the table name
      const recordCount = 3 + (aiDataPrompt.length % 3); // Use prompt length to vary count 3-5
      const generatedData = generateSampleData(selectedTable, recordCount);
      
      if (generatedData.length > 0) {
        // Update the in-memory table first
        const updatedTables = [...userTables];
        
        // Either append or replace existing data based on context clues in the prompt
        const prompt = aiDataPrompt.toLowerCase();
        const shouldReplace = prompt.includes('replace') || 
                             prompt.includes('clear') || 
                             prompt.includes('new set');
        
        let finalRecords = [];
        
        if (shouldReplace || existingRecords.length === 0) {
          // Replace all data
          finalRecords = generatedData;
          updatedTables[tableIdx].records = generatedData;
        } else {
          // Check for duplicates and adjust IDs if needed
          const dedupedData = generatedData.map(newRecord => {
            // If the record has an ID and it's a duplicate
            if (newRecord.id !== undefined && hasDuplicateId(existingRecords, newRecord.id)) {
              // Generate a new unique ID
              const nextId = getNextAvailableId(existingRecords);
              return { ...newRecord, id: nextId };
            }
            return newRecord;
          });
          
          // Append to existing data (with deduped IDs)
          finalRecords = dedupedData;
          updatedTables[tableIdx].records = [
            ...existingRecords,
            ...dedupedData
          ];
        }
        
        setUserTables(updatedTables);
        
        // Create a single INSERT statement with multiple VALUES clauses
        let insertSQL = '';

        // Generate the INSERT SQL statement
        // We'll use the direct approach of inserting multiple records in one SQL statement
        const columns = finalRecords.length > 0 ? Object.keys(finalRecords[0]).join(', ') : '';
        
        if (columns && finalRecords.length > 0) {
          // Start with a DELETE statement if replacing existing data
          if (shouldReplace) {
            toast({
              title: "Replacing data",
              description: "Clearing existing data before inserting new records"
            });
            
            // Run a direct DELETE statement first
            const deleteSQL = `DELETE FROM ${selectedTable};`;
            setSql(deleteSQL);
            
            try {
              await executeQuery();
              console.log("Successfully deleted existing data");
            } catch (error) {
              console.error("Error deleting existing data:", error);
            }
          }
          
          // Now build the INSERT statement with multiple values
          insertSQL = `INSERT INTO ${selectedTable} (${columns}) VALUES `;
          
          const valuesClauses = finalRecords.map(record => {
            const values = Object.values(record).map(val => {
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`; // Escape single quotes
              if (typeof val === 'boolean') return val ? 1 : 0;
              return val;
            }).join(', ');
            
            return `(${values})`;
          });
          
          insertSQL += valuesClauses.join(',\n') + ';';
          
          console.log("Generated INSERT SQL:", insertSQL);
          
          // Execute the INSERT statement
          setSql(insertSQL);
          
          try {
            await executeQuery();
            console.log("Successfully inserted new data");
          } catch (error) {
            console.error("Error inserting data:", error);
          }
        } else {
          console.error("No columns or records found to create INSERT statement");
        }
        
        // Show success message
        toast({
          title: "Data generated successfully",
          description: `${generatedData.length} records have been ${shouldReplace ? 'replaced' : 'inserted into'} the '${selectedTable}' table.`
        });
        
        // Update SQL to view the new data and switch to query tab
        setSql(`SELECT * FROM ${selectedTable};`);
        setActiveTab("query");
        
        // Execute the SELECT query to verify data was inserted
        setTimeout(async () => {
          try {
            setError(null);
            setResult(null);
            await executeQuery();
          } catch (err) {
            console.error('Error executing verification query:', err);
            setError(String(err));
          }
        }, 100);
      } else {
        toast({
          title: "No data generated",
          description: "Please try a different table or description.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error generating data:', error);
      
      // Provide a more helpful message
      toast({
        title: "Something went wrong",
        description: "We couldn't generate data for this table. Try using simpler table structures.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Get AI help for query writing
  const getAiQueryHelp = async () => {
    try {
      const availableTables = [
        "accommodations",
        ...userTables.map(t => t.name)
      ];
      
      // Simulate AI response
      const suggestions = [
        `SELECT * FROM ${selectedTable}`,
        `SELECT id, name FROM ${selectedTable}`,
        `SELECT * FROM ${selectedTable} ORDER BY id DESC LIMIT 5`
      ];
      
      toast({
        title: "AI Query Suggestions",
        description: "Here are some queries you can try:"
      });
      
      // Show each suggestion in a toast
      suggestions.forEach(suggestion => {
        toast({
          title: "Suggested Query",
          description: suggestion,
          action: (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setSql(suggestion);
                toast({
                  title: "Query applied",
                  description: "The suggested query has been added to the editor."
                });
              }}
            >
              Use
            </Button>
          )
        });
      });
    } catch (error) {
      console.error('Failed to get AI query help:', error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestions",
        variant: "destructive"
      });
    }
  };

  // Generate SQL schema for a custom table
  const generateTableSchema = (table: CustomTable): string => {
    return `CREATE TABLE ${table.name} (
  ${table.columns.map(col => {
    let def = `${col.name} ${col.type}`;
    if (col.isPrimary) def += ' PRIMARY KEY';
    if (col.isNotNull) def += ' NOT NULL';
    return def;
  }).join(',\n  ')}
);`;
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">SQL Practice Platform</h1>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {
              // Export all tables as JSON for backup
              const exportData = {
                tables: userTables,
                version: '1.0',
                exportDate: new Date().toISOString()
              };
              
              const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `sql_practice_data_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              toast({
                title: "Data exported",
                description: "Your tables and data have been exported"
              });
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Data
          </Button>
        </div>
      </header>
      
      <Tabs defaultValue="query" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="query">Write SQL Queries</TabsTrigger>
          <TabsTrigger value="create">Create Tables</TabsTrigger>
          <TabsTrigger value="insert">Insert Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="query" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="mb-2 flex justify-between items-center">
                <label htmlFor="sqlQuery" className="text-sm font-medium">
                  SQL Query:
                </label>
                <div className="flex items-center space-x-2">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="h-8 w-[150px]">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accommodations">accommodations</SelectItem>
                      {userTables.map(table => (
                        <SelectItem key={table.name} value={table.name}>{table.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <textarea
                id="sqlQuery"
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm h-44"
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                placeholder="Enter your SQL query here..."
              />
              
              <div className="flex flex-wrap gap-2 mt-3 mb-4">
                <Button 
                  onClick={() => {
                    setError(null);
                    setResult(null);
                    
                    // We'll use a try-catch to ensure errors are handled properly
                    try {
                      // Using setTimeout to ensure it doesn't block the UI
                      setTimeout(async () => {
                        try {
                          await executeQuery();
                        } catch (err) {
                          console.error('Error executing query:', err);
                          setError(String(err));
                        }
                      }, 0);
                    } catch (err) {
                      console.error('Error initializing query:', err);
                      setError(String(err));
                    }
                  }}
                >
                  Run Query
                </Button>
                <Button variant="outline" onClick={getAiQueryHelp}>Get AI Query Help</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSql(`SELECT * FROM ${selectedTable};`);
                    // Execute the query immediately using the same safe pattern
                    setError(null);
                    setResult(null);
                    
                    setTimeout(async () => {
                      try {
                        await executeQuery();
                      } catch (err) {
                        console.error('Error executing query:', err);
                        setError(String(err));
                      }
                    }, 100);
                  }}
                >
                  View All Data
                </Button>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="text-red-600 font-medium mb-1">Error</h3>
                  <pre className="text-sm whitespace-pre-wrap">{error}</pre>
                </div>
              )}
              
              {result && result.columns.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Results:</h3>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">
                        {result.values.length} record{result.values.length !== 1 ? 's' : ''} returned
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1"
                        onClick={() => {
                          try {
                            // Create CSV content
                            const headers = result.columns.join(',');
                            const rows = result.values.map(row => row.join(',')).join('\n');
                            const csvContent = `${headers}\n${rows}`;
                            
                            // Create a blob and download link
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            
                            // Set up download
                            link.setAttribute('href', url);
                            link.setAttribute('download', `${selectedTable}_results.csv`);
                            link.style.visibility = 'hidden';
                            
                            // Trigger download
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            toast({
                              title: "Results saved",
                              description: `Saved ${result.values.length} records as CSV file`
                            });
                          } catch (err) {
                            console.error('Error saving results:', err);
                            toast({
                              title: "Error saving results",
                              description: "Failed to save query results",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Save Results
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-100">
                          {result.columns.map((col, i) => (
                            <th key={i} className="py-2 px-4 border-b text-left font-medium text-sm group relative">
                              <div className="flex items-center gap-1">
                                <span>{col}</span>
                                <div className="invisible group-hover:visible">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      // Get current column type
                                      const tableInfo = userTables.find(t => t.name === selectedTable);
                                      const columnInfo = tableInfo?.columns.find(c => c.name === col);
                                      const currentType = columnInfo?.type || "TEXT";
                                      
                                      // Create dropdown to select new type
                                      const newType = window.prompt(
                                        `Change data type for ${col} (currently ${currentType}).\n\nOptions: TEXT, INTEGER, REAL, NUMERIC, BOOLEAN, BLOB, DATE, DATETIME`,
                                        currentType
                                      );
                                      
                                      if (newType && ["TEXT", "INTEGER", "REAL", "NUMERIC", "BOOLEAN", "BLOB", "DATE", "DATETIME"].includes(newType.toUpperCase())) {
                                        // Generate ALTER TABLE SQL
                                        const alterSql = `ALTER TABLE ${selectedTable} ALTER COLUMN ${col} TYPE ${newType.toUpperCase()};`;
                                        
                                        // Set the SQL
                                        setSql(alterSql);
                                        
                                        // Execute the SQL
                                        setTimeout(() => {
                                          executeQuery()
                                            .then(() => {
                                              // Update the table definition in memory
                                              if (tableInfo) {
                                                const updatedTables = [...userTables];
                                                const tableIdx = updatedTables.findIndex(t => t.name === selectedTable);
                                                
                                                if (tableIdx >= 0 && columnInfo) {
                                                  const columnIdx = updatedTables[tableIdx].columns.findIndex(c => c.name === col);
                                                  if (columnIdx >= 0) {
                                                    updatedTables[tableIdx].columns[columnIdx].type = newType.toUpperCase();
                                                    setUserTables(updatedTables);
                                                  }
                                                }
                                              }
                                              
                                              toast({
                                                title: "Column type changed",
                                                description: `The column ${col} type has been updated to ${newType.toUpperCase()}.`
                                              });
                                              
                                              // Refresh the data
                                              setSql(`SELECT * FROM ${selectedTable};`);
                                              
                                              // Execute the query after a short delay
                                              setTimeout(() => {
                                                executeQuery();
                                              }, 100);
                                            })
                                            .catch((err) => {
                                              console.error('Error changing column type:', err);
                                              toast({
                                                title: "Error",
                                                description: "Failed to change column type. This might be due to incompatible data or SQL limitations.",
                                                variant: "destructive"
                                              });
                                            });
                                        }, 100);
                                      } else if (newType) {
                                        toast({
                                          title: "Invalid type",
                                          description: "Please select a valid data type.",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                  >
                                    <Settings className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.values.length > 0 ? (
                          result.values.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              {row.map((cell, j) => (
                                <td key={j} className="py-2 px-4 text-sm relative group">
                                  <div className="flex items-center">
                                    <span className="inline-block mr-2">{String(cell)}</span>
                                    <div className="invisible group-hover:visible">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          // Create a modal or popover to edit this specific cell
                                          const newValue = window.prompt(`Edit value for ${result.columns[j]}:`, String(cell));
                                          if (newValue !== null) {
                                            // Clone the current result to avoid mutation
                                            const newValues = [...result.values];
                                            newValues[i] = [...row];
                                            newValues[i][j] = newValue;
                                            
                                            // Update the result with new values
                                            setResult({
                                              ...result,
                                              values: newValues
                                            });
                                            
                                            // Generate and execute update SQL
                                            const idColumn = result.columns.findIndex(col => col.toLowerCase() === 'id');
                                            const idValue = idColumn >= 0 ? row[idColumn] : null;
                                            
                                            if (idValue !== null && selectedTable) {
                                              // Make sure to properly format the value for SQL (quotes for text, etc.)
                                              const formattedValue = isNaN(Number(newValue)) ? `'${newValue}'` : newValue;
                                              const updateSql = `UPDATE ${selectedTable} SET ${result.columns[j]} = ${formattedValue} WHERE id = ${idValue};`;
                                              
                                              // Set the SQL and execute later
                                              setSql(updateSql);
                                              
                                              // Execute the update using our existing function
                                              setTimeout(() => {
                                                executeQuery()
                                                  .then(() => {
                                                    toast({
                                                      title: "Value updated",
                                                      description: "The cell value has been updated successfully."
                                                    });
                                                  })
                                                  .catch((err) => {
                                                    console.error('Error updating value:', err);
                                                    toast({
                                                      title: "Error",
                                                      description: "Failed to update the value. Check console for details.",
                                                      variant: "destructive"
                                                    });
                                                  });
                                              }, 100);
                                            }
                                          }
                                        }}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td 
                              colSpan={result.columns.length} 
                              className="py-8 text-center text-gray-500"
                            >
                              No data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="font-medium mb-2">Quick Queries</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start text-left font-mono text-xs"
                    onClick={() => {
                      setSql(`SELECT * FROM ${selectedTable};`);
                    }}
                  >
                    SELECT * FROM {selectedTable};
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start text-left font-mono text-xs"
                    onClick={() => {
                      setSql(`SELECT * FROM ${selectedTable} LIMIT 5;`);
                    }}
                  >
                    SELECT * FROM {selectedTable} LIMIT 5;
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start text-left font-mono text-xs"
                    onClick={() => {
                      setSql(`SELECT COUNT(*) AS total FROM ${selectedTable};`);
                    }}
                  >
                    SELECT COUNT(*) AS total FROM {selectedTable};
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium mb-2">SQL Basics</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium mb-1">SELECT</div>
                    <code className="block bg-gray-100 p-1 rounded text-xs">
                      SELECT column1, column2 FROM table;
                    </code>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-1">WHERE</div>
                    <code className="block bg-gray-100 p-1 rounded text-xs">
                      SELECT * FROM table WHERE condition;
                    </code>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-1">ORDER BY</div>
                    <code className="block bg-gray-100 p-1 rounded text-xs">
                      SELECT * FROM table ORDER BY column DESC;
                    </code>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-1">JOIN</div>
                    <code className="block bg-gray-100 p-1 rounded text-xs">
                      SELECT * FROM table1 JOIN table2 ON table1.id = table2.id;
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-md border border-green-100">
                <h3 className="font-medium mb-1">SQL Tips</h3>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>• Use <strong>semicolons</strong> to end your queries</li>
                  <li>• <strong>Column names</strong> are case-sensitive</li>
                  <li>• Use <strong>LIMIT</strong> to restrict large results</li>
                  <li>• Try the <strong>AI Help</strong> for complex queries</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="create" className="mt-4">
          <div className="mb-6 grid gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Create a New Table</h3>
              <p className="text-sm text-gray-600 mb-4">
                You can create a table manually or let AI suggest a structure for you.
              </p>
              
              <div className="grid gap-4">
                <div>
                  <div className="flex justify-between">
                    <Label htmlFor="aiTablePrompt">
                      Describe your table <span className="text-xs text-gray-500">(optional)</span>:
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-6"
                      onClick={() => setAiTablePrompt("")}
                    >
                      Clear
                    </Button>
                  </div>
                  <Textarea 
                    id="aiTablePrompt"
                    placeholder="Type anything like 'user profiles' or 'product inventory' or leave empty for a basic table structure"
                    value={aiTablePrompt}
                    onChange={(e) => setAiTablePrompt(e.target.value)}
                    className="mt-1"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Enter any description or just click one of the buttons below to create a table.
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 border rounded-md hover:bg-gray-50">
                    <h4 className="font-medium mb-2">Quick Create</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Instantly create a table based on your description or using default structure.
                    </p>
                    <Button 
                      className="w-full"
                      onClick={generateTableWithAI}
                    >
                      Create Table Now
                    </Button>
                  </div>
                  
                  <div className="p-3 border rounded-md hover:bg-gray-50">
                    <h4 className="font-medium mb-2">Custom Create</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Define your table structure in detail, then create or open the editor for more options.
                    </p>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        placeholder="Table name (e.g., users, products)"
                        value={newTableName}
                        onChange={(e) => {
                          const name = e.target.value;
                          setNewTableName(name);
                          
                          // Auto-suggest columns when table name changes
                          if (name && !newTableColumns.trim()) {
                            // Only suggest if columns field is empty
                            const suggestedColumns = getColumnSuggestions(name);
                            setNewTableColumns(suggestedColumns);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            createTable();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        variant="default"
                        onClick={createTable}
                      >
                        Create Table
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Generate a name if empty
                        if (!newTableName.trim()) {
                          const name = aiTablePrompt.trim() ? 
                            generateSmartTableName(aiTablePrompt) : 
                            "data_table";
                          setNewTableName(name);
                          
                          // Generate columns based on name
                          const columns = getColumnSuggestions(name);
                          setNewTableColumns(columns);
                        }
                        
                        // Open dialog
                        setCreateTableDialogOpen(true);
                      }}
                    >
                      Open Advanced Editor
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-2">Quick Table Templates</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-10 border"
                      onClick={() => {
                        setAiTablePrompt("users with email and profile details");
                        generateTableWithAI();
                      }}
                    >
                      Users
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-10 border"
                      onClick={() => {
                        setAiTablePrompt("products with price and inventory");
                        generateTableWithAI();
                      }}
                    >
                      Products
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-10 border"
                      onClick={() => {
                        setAiTablePrompt("orders with customer info and dates");
                        generateTableWithAI();
                      }}
                    >
                      Orders
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-10 border"
                      onClick={() => {
                        setAiTablePrompt("student grades and courses");
                        generateTableWithAI();
                      }}
                    >
                      Students
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={() => setCreateTableDialogOpen(true)}>
                Create Table Manually
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Your Custom Tables:</h3>
              {userTables.length > 0 ? (
                <div className="grid gap-4">
                  {userTables.map(table => (
                    <div key={table.name} className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">{table.name}</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {generateTableSchema(table)}
                      </pre>
                      <div className="mt-2 text-sm text-gray-500">
                        {table.records.length} records
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setSql(`SELECT * FROM ${table.name}`);
                          setActiveTab("query");
                          // Execute the query immediately using the same safe pattern
                          setError(null);
                          setResult(null);
                          
                          setTimeout(async () => {
                            try {
                              await executeQuery();
                            } catch (err) {
                              console.error('Error executing query:', err);
                              setError(String(err));
                            }
                          }, 100);
                        }}
                      >
                        Query This Table
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-gray-500">You haven't created any custom tables yet.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insert" className="mt-4">
          <div className="mb-6 grid gap-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Insert Data with AI Help</h3>
              <p className="text-sm text-gray-600 mb-4">
                Describe the data you want, and AI will generate it for your selected table.
              </p>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="tableSelect">Select a table:</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accommodations">accommodations</SelectItem>
                      {userTables.map(table => (
                        <SelectItem key={table.name} value={table.name}>{table.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <Label htmlFor="aiDataPrompt">
                      Describe your data needs <span className="text-xs text-gray-500">(optional)</span>:
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-6"
                      onClick={() => setAiDataPrompt("")}
                    >
                      Clear
                    </Button>
                  </div>
                  <Textarea 
                    id="aiDataPrompt"
                    placeholder="Optional: Describe what kind of data you want, or leave empty for default data"
                    value={aiDataPrompt}
                    onChange={(e) => setAiDataPrompt(e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    You can leave this empty and data will be generated automatically based on the table type.
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiDataPrompt("Generate 5 records with realistic data for testing")}
                    >
                      Test Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiDataPrompt("Replace all existing data with 3 new records")}
                    >
                      Replace Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAiDataPrompt("Add some diverse test cases with various values")}
                    >
                      Add Variety
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={generateDataWithAI}>
                    Generate Data with AI
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium mb-3">Manual Data Entry</h3>
              
              <div className="grid gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Write Custom INSERT Statement</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    You can write your own INSERT statement to add specific data to your table.
                  </p>
                  
                  <div className="p-3 bg-gray-100 rounded-md text-sm font-mono overflow-x-auto">
                    {`INSERT INTO ${selectedTable} (column1, column2, ...)\nVALUES (value1, value2, ...);`}
                  </div>
                  
                  <Button 
                    className="mt-3"
                    onClick={() => {
                      // Create customized insert template based on the selected table
                      if (!selectedTable) {
                        toast({
                          title: "No table selected",
                          description: "Please select a table from the dropdown first",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      let insertTemplate = `INSERT INTO ${selectedTable} `;
                      
                      // Get selected table structure if available
                      const table = userTables.find(t => t.name.toLowerCase() === selectedTable.toLowerCase());
                      const isAccommodations = selectedTable.toLowerCase() === 'accommodations';
                      
                      if (table && table.columns.length > 0) {
                        // If we have schema information, create a proper insert statement with sample values
                        const columnNames = table.columns.map(col => col.name).join(', ');
                        // Create appropriate values based on column types
                        const valuePlaceholders = table.columns.map(col => {
                          // Choose appropriate values based on column type
                          const type = col.type.toUpperCase();
                          if (type.includes('INT')) return '1';
                          if (type.includes('REAL') || type.includes('NUM')) return '0.0';
                          if (type.includes('BOOL')) return 'true';
                          if (type.includes('DATE')) return "'2023-01-01'";
                          return "'sample value'"; // Default to string for TEXT and others
                        }).join(', ');
                        
                        insertTemplate += `(${columnNames}) VALUES (${valuePlaceholders});`;
                      } 
                      else if (isAccommodations) {
                        // Use accommodation-specific template
                        insertTemplate += `(id, name, location, price_per_night, rating, has_wifi, has_pool) 
VALUES (10, 'Mountain Retreat', 'Colorado', 150.00, 4.7, true, false);`;
                      }
                      else {
                        // Generic template with common column names
                        insertTemplate += `(id, name, description) VALUES (1, 'Sample Item', 'Sample description');`;
                      }
                      
                      setSql(insertTemplate);
                      setActiveTab("query");
                      
                      toast({
                        title: "INSERT template created",
                        description: "Edit the values as needed, then run the query to insert data",
                        variant: "default"
                      });
                    }}
                  >
                    Create INSERT Template
                  </Button>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-2">Example INSERT Statements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <div className="font-medium">Add a Single Record:</div>
                      <code className="text-xs">
                        INSERT INTO students (id, name, age, grade) VALUES (6, 'Alex Johnson', 20, 'B+');
                      </code>
                    </div>
                    
                    <div className="p-2 bg-gray-100 rounded-md">
                      <div className="font-medium">Add Multiple Records:</div>
                      <code className="text-xs">
                        INSERT INTO products (id, name, price) VALUES<br />
                        (1, 'Laptop', 999.99),<br />
                        (2, 'Mouse', 25.50),<br />
                        (3, 'Keyboard', 55.75);
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-md border border-blue-100">
              <h3 className="text-md font-medium mb-2">Quick Tips for Data Entry</h3>
              <ul className="space-y-1 text-sm">
                <li>• Use <strong>AI generation</strong> for quickly creating realistic test data</li>
                <li>• Create your own <strong>INSERT statements</strong> for precise control</li>
                <li>• Remember to check the table schema to see the required columns</li>
                <li>• After inserting data, run <code className="bg-blue-100 px-1 rounded">SELECT * FROM tablename</code> to verify</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-lg font-medium mb-2">Available Schemas</h3>
        <Tabs defaultValue="accommodations">
          <TabsList className="mb-4">
            <TabsTrigger value="accommodations">accommodations</TabsTrigger>
            {userTables.map(table => (
              <TabsTrigger key={table.name} value={table.name}>{table.name}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="accommodations">
            <pre className="text-sm overflow-x-auto p-3 bg-gray-100 rounded-md">
              {`CREATE TABLE accommodations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  price_per_night REAL NOT NULL,
  rating REAL,
  has_wifi BOOLEAN,
  has_pool BOOLEAN
);`}
            </pre>
          </TabsContent>
          
          {userTables.map(table => (
            <TabsContent key={table.name} value={table.name}>
              <pre className="text-sm overflow-x-auto p-3 bg-gray-100 rounded-md">
                {generateTableSchema(table)}
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Create Table Dialog */}
      <Dialog open={createTableDialogOpen} onOpenChange={setCreateTableDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a New Table</DialogTitle>
            <DialogDescription>
              Define your table structure by entering a table name and column definitions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={newTableName}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewTableName(name);
                  
                  // Auto-suggest columns when table name changes
                  if (name && !newTableColumns.trim()) {
                    // Only suggest if columns field is empty
                    const suggestedColumns = getColumnSuggestions(name);
                    setNewTableColumns(suggestedColumns);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    createTable();
                  }
                }}
                placeholder="e.g., users, products, orders..."
              />
              <div className="mt-1 text-xs text-gray-500 space-y-1">
                <p>Tip: Table name will suggest appropriate columns. Try names like "users", "products", "orders", etc.</p>
                <p><strong>Shortcut:</strong> Press Enter to quickly create the table.</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="tableColumns">
                  Column Definitions <span className="text-xs text-gray-500">(optional)</span>
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setNewTableColumns("")}
                  className="text-xs h-6"
                >
                  Clear
                </Button>
              </div>
              <Textarea
                id="tableColumns"
                value={newTableColumns}
                onChange={(e) => setNewTableColumns(e.target.value)}
                onKeyDown={(e) => {
                  // Ctrl+Enter or Cmd+Enter to create table
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    createTable();
                  }
                }}
                placeholder="Enter column definitions or leave empty for default columns. Press Ctrl+Enter to create table."
                className="min-h-[150px] font-mono text-sm"
              />
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p><strong>Format:</strong> columnName type [constraints], ...</p>
                <p><strong>Example:</strong> id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL</p>
                <p><strong>Common types:</strong> INTEGER, TEXT, REAL, BOOLEAN, DATE</p>
                <p><strong>Note:</strong> Leave empty to use default columns (id, name)</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Column Templates</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNewTableColumns(`id INTEGER PRIMARY KEY,
name TEXT NOT NULL,
email TEXT,
created_at TEXT`)}
                >
                  User Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNewTableColumns(`id INTEGER PRIMARY KEY,
name TEXT NOT NULL,
price REAL,
category TEXT,
in_stock BOOLEAN`)}
                >
                  Product Catalog
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNewTableColumns(`id INTEGER PRIMARY KEY,
student_id INTEGER,
course_name TEXT,
grade TEXT,
semester TEXT`)}
                >
                  Student Grades
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNewTableColumns(`id INTEGER PRIMARY KEY,
title TEXT,
content TEXT,
author TEXT,
published_date TEXT`)}
                >
                  Blog Posts
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTable}>
              Create Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SqlApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
