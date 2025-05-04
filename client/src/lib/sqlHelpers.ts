import { TableDefinition } from '@shared/schema';

// Sample datasets
export const sampleDatasets: {
  id: number;
  name: string;
  description: string;
  icon: string;
  isDefault: boolean;
  tables: TableDefinition[];
}[] = [
  {
    id: 1,
    name: 'Accommodations',
    description: 'Sample dataset for accommodations and their amenities',
    icon: 'ri-home-line',
    isDefault: true,
    tables: [
      {
        name: 'accommodations',
        schema: {
          columns: [
            { name: 'id', type: 'INTEGER', isPrimaryKey: true, notNull: true },
            { name: 'name', type: 'TEXT', notNull: true },
            { name: 'price_per_night', type: 'REAL', notNull: true },
            { name: 'rating', type: 'REAL' },
            { name: 'location', type: 'TEXT' },
            { name: 'description', type: 'TEXT' },
            { name: 'distance_to_center', type: 'REAL' }
          ]
        },
        data: [
          { id: 1, name: 'Cozy Studio Apartment', price_per_night: 45, rating: 4.3, location: 'Downtown', description: 'A cozy studio perfect for solo travelers', distance_to_center: 0.5 },
          { id: 2, name: 'Budget Hostel Room', price_per_night: 32, rating: 4.0, location: 'City Center', description: 'Affordable option with basic amenities', distance_to_center: 0.8 },
          { id: 3, name: 'Student Housing Unit', price_per_night: 58, rating: 4.1, location: 'University District', description: 'Great for students and academics', distance_to_center: 2.3 },
          { id: 4, name: 'Affordable Guest Room', price_per_night: 65, rating: 4.5, location: 'Suburbs', description: 'Clean and comfortable guest room', distance_to_center: 5.1 },
          { id: 5, name: 'Budget Inn Room', price_per_night: 79, rating: 4.0, location: 'Highway Exit', description: 'Convenient location for roadtrippers', distance_to_center: 7.6 },
          { id: 6, name: 'Shared Apartment', price_per_night: 85, rating: 4.2, location: 'Historic District', description: 'Shared space with local hosts', distance_to_center: 1.2 }
        ]
      },
      {
        name: 'amenities',
        schema: {
          columns: [
            { name: 'id', type: 'INTEGER', isPrimaryKey: true, notNull: true },
            { name: 'accommodation_id', type: 'INTEGER', isForeignKey: true, referencesTable: 'accommodations', referencesColumn: 'id' },
            { name: 'wifi', type: 'BOOLEAN', defaultValue: 'FALSE' },
            { name: 'pool', type: 'BOOLEAN', defaultValue: 'FALSE' },
            { name: 'kitchen', type: 'BOOLEAN', defaultValue: 'FALSE' },
            { name: 'workspace', type: 'BOOLEAN', defaultValue: 'FALSE' },
            { name: 'pets_allowed', type: 'BOOLEAN', defaultValue: 'FALSE' }
          ]
        },
        data: [
          { id: 1, accommodation_id: 1, wifi: true, pool: false, kitchen: true, workspace: true, pets_allowed: false },
          { id: 2, accommodation_id: 2, wifi: true, pool: false, kitchen: true, workspace: false, pets_allowed: false },
          { id: 3, accommodation_id: 3, wifi: true, pool: false, kitchen: true, workspace: true, pets_allowed: false },
          { id: 4, accommodation_id: 4, wifi: true, pool: true, kitchen: true, workspace: false, pets_allowed: true },
          { id: 5, accommodation_id: 5, wifi: true, pool: true, kitchen: true, workspace: false, pets_allowed: true },
          { id: 6, accommodation_id: 6, wifi: true, pool: false, kitchen: true, workspace: true, pets_allowed: false }
        ]
      },
      {
        name: 'reviews',
        schema: {
          columns: [
            { name: 'id', type: 'INTEGER', isPrimaryKey: true, notNull: true },
            { name: 'accommodation_id', type: 'INTEGER', isForeignKey: true, referencesTable: 'accommodations', referencesColumn: 'id' },
            { name: 'user_id', type: 'INTEGER' },
            { name: 'rating', type: 'INTEGER', notNull: true },
            { name: 'comment', type: 'TEXT' },
            { name: 'created_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' }
          ]
        },
        data: [
          { id: 1, accommodation_id: 1, user_id: 101, rating: 5, comment: 'Great location and amenities!', created_at: '2023-01-15' },
          { id: 2, accommodation_id: 1, user_id: 102, rating: 4, comment: 'Clean but a bit noisy.', created_at: '2023-02-20' },
          { id: 3, accommodation_id: 2, user_id: 103, rating: 4, comment: 'Good value for money.', created_at: '2023-03-10' },
          { id: 4, accommodation_id: 3, user_id: 104, rating: 5, comment: 'Perfect for my research trip.', created_at: '2023-02-28' },
          { id: 5, accommodation_id: 4, user_id: 105, rating: 5, comment: 'Lovely hosts and beautiful area!', created_at: '2023-04-05' },
          { id: 6, accommodation_id: 5, user_id: 106, rating: 3, comment: 'Convenient but basic.', created_at: '2023-03-22' },
          { id: 7, accommodation_id: 6, user_id: 107, rating: 4, comment: 'Great location, shared spaces are clean.', created_at: '2023-01-30' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Transportation',
    description: 'Sample dataset for transportation options',
    icon: 'ri-bus-line',
    isDefault: true,
    tables: [
      {
        name: 'transport_options',
        schema: {
          columns: [
            { name: 'id', type: 'INTEGER', isPrimaryKey: true, notNull: true },
            { name: 'type', type: 'TEXT', notNull: true },
            { name: 'name', type: 'TEXT', notNull: true },
            { name: 'cost_per_day', type: 'REAL' },
            { name: 'availability', type: 'TEXT' }
          ]
        },
        data: [
          { id: 1, type: 'Car', name: 'Economy Car Rental', cost_per_day: 25.99, availability: 'High' },
          { id: 2, type: 'Car', name: 'Luxury Car Rental', cost_per_day: 89.99, availability: 'Medium' },
          { id: 3, type: 'Bike', name: 'City Bike Share', cost_per_day: 9.99, availability: 'High' },
          { id: 4, type: 'Public', name: 'Metro Pass', cost_per_day: 8.00, availability: 'High' },
          { id: 5, type: 'Public', name: 'Bus Pass', cost_per_day: 5.00, availability: 'High' },
          { id: 6, type: 'Scooter', name: 'Electric Scooter Rental', cost_per_day: 15.50, availability: 'Medium' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Restaurants',
    description: 'Sample dataset for restaurants and cafes',
    icon: 'ri-restaurant-line',
    isDefault: true,
    tables: [
      {
        name: 'restaurants',
        schema: {
          columns: [
            { name: 'id', type: 'INTEGER', isPrimaryKey: true, notNull: true },
            { name: 'name', type: 'TEXT', notNull: true },
            { name: 'cuisine', type: 'TEXT' },
            { name: 'price_range', type: 'TEXT' },
            { name: 'rating', type: 'REAL' },
            { name: 'location', type: 'TEXT' }
          ]
        },
        data: [
          { id: 1, name: 'Local Bistro', cuisine: 'French', price_range: '$$$', rating: 4.7, location: 'Downtown' },
          { id: 2, name: 'Quick Bites', cuisine: 'Fast Food', price_range: '$', rating: 3.9, location: 'City Center' },
          { id: 3, name: 'Pasta Palace', cuisine: 'Italian', price_range: '$$', rating: 4.3, location: 'Historic District' },
          { id: 4, name: 'Sushi Express', cuisine: 'Japanese', price_range: '$$', rating: 4.5, location: 'Waterfront' },
          { id: 5, name: 'Taco Truck', cuisine: 'Mexican', price_range: '$', rating: 4.6, location: 'University District' },
          { id: 6, name: 'Green Leaf', cuisine: 'Vegetarian', price_range: '$$', rating: 4.2, location: 'Suburbs' }
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Activities',
    description: 'Sample dataset for travel activities',
    icon: 'ri-route-line',
    isDefault: true,
    tables: [
      {
        name: 'activities',
        schema: {
          columns: [
            { name: 'id', type: 'INTEGER', isPrimaryKey: true, notNull: true },
            { name: 'name', type: 'TEXT', notNull: true },
            { name: 'type', type: 'TEXT' },
            { name: 'cost', type: 'REAL' },
            { name: 'duration_hours', type: 'REAL' },
            { name: 'rating', type: 'REAL' },
            { name: 'location', type: 'TEXT' }
          ]
        },
        data: [
          { id: 1, name: 'City Walking Tour', type: 'Tour', cost: 15.00, duration_hours: 2, rating: 4.5, location: 'Downtown' },
          { id: 2, name: 'Museum Visit', type: 'Cultural', cost: 12.00, duration_hours: 3, rating: 4.7, location: 'Museum District' },
          { id: 3, name: 'Sunset Boat Cruise', type: 'Leisure', cost: 45.00, duration_hours: 1.5, rating: 4.8, location: 'Harbor' },
          { id: 4, name: 'Mountain Hike', type: 'Adventure', cost: 0.00, duration_hours: 4, rating: 4.6, location: 'National Park' },
          { id: 5, name: 'Local Cooking Class', type: 'Workshop', cost: 65.00, duration_hours: 3, rating: 4.9, location: 'City Center' },
          { id: 6, name: 'Bicycle Nature Tour', type: 'Adventure', cost: 25.00, duration_hours: 2.5, rating: 4.4, location: 'Riverside' }
        ]
      }
    ]
  }
];

// Sample SQL queries
export const sampleQueries = [
  {
    id: 1,
    name: 'Budget Options',
    description: 'Find affordable accommodations under $100',
    datasetId: 1,
    sql: `SELECT a.name, a.price_per_night, a.rating, a.location
FROM accommodations a
WHERE a.price_per_night < 100
ORDER BY a.price_per_night ASC;`
  },
  {
    id: 2,
    name: 'Pool & WiFi Filter',
    description: 'Find places with pool and WiFi',
    datasetId: 1,
    sql: `SELECT a.name, a.price_per_night, a.rating, a.location,
       amenities.wifi, amenities.pool
FROM accommodations a
JOIN amenities ON a.id = amenities.accommodation_id
WHERE amenities.wifi = TRUE
  AND amenities.pool = TRUE
ORDER BY a.rating DESC;`
  }
];

// Function to get table creation SQL
export const getTableCreationSQL = (table: TableDefinition): string => {
  let sql = `CREATE TABLE ${table.name} (\n`;
  
  const columns = table.schema.columns.map(col => {
    let colDef = `  ${col.name} ${col.type}`;
    
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
  
  sql += columns.join(',\n');
  sql += '\n);';
  
  return sql;
};

// Function to get insert statements for table data
export const getInsertSQL = (table: TableDefinition): string => {
  if (!table.data || table.data.length === 0) {
    return '';
  }
  
  const firstRow = table.data[0] as Record<string, any>;
  const columns = Object.keys(firstRow);
  
  let sql = `INSERT INTO ${table.name} (${columns.join(', ')})\nVALUES\n`;
  
  const rows = table.data.map(row => {
    const values = columns.map(col => {
      const val = (row as Record<string, any>)[col];
      if (typeof val === 'string') {
        return `'${val.replace(/'/g, "''")}'`; // Escape single quotes
      } else if (val === null) {
        return 'NULL';
      } else if (typeof val === 'boolean') {
        return val ? 'TRUE' : 'FALSE';
      } else {
        return String(val);
      }
    });
    
    return `(${values.join(', ')})`;
  });
  
  sql += rows.join(',\n');
  sql += ';';
  
  return sql;
};

// Get the full SQL for creating and populating a dataset
export const getDatasetSQL = (tables: TableDefinition[]): string => {
  let sql = '';
  
  // First create tables
  for (const table of tables) {
    sql += getTableCreationSQL(table) + '\n\n';
  }
  
  // Then insert data
  for (const table of tables) {
    sql += getInsertSQL(table) + '\n\n';
  }
  
  return sql;
};
