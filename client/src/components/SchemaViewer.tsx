import React, { useState } from 'react';
import { TableDefinition } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SchemaViewerProps {
  tables: TableDefinition[];
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ tables }) => {
  const [activeTab, setActiveTab] = useState('tables');
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 h-full overflow-hidden flex flex-col">
      <div className="border-b border-gray-300 dark:border-gray-600 p-3 flex justify-between items-center">
        <h3 className="font-medium">Schema</h3>
        <Tabs defaultValue="tables" className="w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 h-8">
            <TabsTrigger value="tables" className="text-xs">Tables</TabsTrigger>
            <TabsTrigger value="relations" className="text-xs">Relations</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ScrollArea className="overflow-y-auto p-4 flex-1">
        {activeTab === 'tables' ? (
          <>
            {tables.map((table, index) => (
              <div key={table.name} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{table.name}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {index === 0 ? 'Primary table' : 'Related table'}
                  </span>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Column</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Attributes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {table.schema.columns.map((column) => (
                        <tr key={column.name}>
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{column.name}</td>
                          <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">{column.type}</td>
                          <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                            {column.isPrimaryKey && 'PRIMARY KEY '}
                            {column.isForeignKey && 'FOREIGN KEY '}
                            {column.notNull && 'NOT NULL '}
                            {column.defaultValue && `DEFAULT ${column.defaultValue}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Table Relationships</h4>
            
            {tables.reduce<React.ReactNode[]>((acc, table) => {
              const foreignKeys = table.schema.columns.filter(
                (col) => col.isForeignKey && col.referencesTable
              );
              
              if (foreignKeys.length === 0) return acc;
              
              foreignKeys.forEach((fk) => {
                acc.push(
                  <div key={`${table.name}-${fk.name}`} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                    <div className="flex items-center text-xs">
                      <span className="font-medium">{table.name}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="font-medium">{fk.referencesTable}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <code>{table.name}.{fk.name}</code> references <code>{fk.referencesTable}.{fk.referencesColumn}</code>
                    </div>
                  </div>
                );
              });
              
              return acc;
            }, [])}
            
            {tables.some((table) => 
              table.schema.columns.some((col) => col.isForeignKey)
            ) || (
              <div className="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
                No relationships defined in this schema
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      <div className="border-t border-gray-300 dark:border-gray-600 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Need help with queries?</span>
          <Button 
            variant="link" 
            className="text-xs text-primary font-medium hover:text-primary-hover flex items-center p-0"
          >
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
              <path fill="currentColor" d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-3.53 2.61-6.43 6-6.92V2.05c-4.39.49-8 4.31-8 8.95 0 5 4.03 9 9 9s9-4 9-9c0-4.64-3.61-8.46-8-8.95z"/>
            </svg>
            Ask AI Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SchemaViewer;
