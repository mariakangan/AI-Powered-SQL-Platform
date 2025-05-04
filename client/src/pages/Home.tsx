import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSQL } from '@/hooks/use-sql';
import { useThemeDetector } from '@/hooks/use-theme';
import { apiRequest } from '@/lib/queryClient';
import { getAiSuggestion } from '@/lib/openai';
import { sampleDatasets, sampleQueries } from '@/lib/sqlHelpers';
import { 
  AiSuggestion, 
  Dataset, 
  SavedQuery, 
  CustomTable, 
  QueryResult, 
  TableDefinition 
} from '@shared/schema';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SQLEditor from '@/components/SQLEditor';
import AISuggestions from '@/components/AISuggestions';
import QueryResults from '@/components/QueryResults';
import SchemaViewer from '@/components/SchemaViewer';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Home: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'editor' | 'schema' | 'ai'>('editor');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [sql, setSql] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false);
  const [queryError, setQueryError] = useState<Error | null>(null);
  const [saveQueryDialogOpen, setSaveQueryDialogOpen] = useState(false);
  const [savedQueryName, setSavedQueryName] = useState('');
  const [savedQueryDescription, setSavedQueryDescription] = useState('');
  
  // Hooks
  const { isDarkMode, toggleDarkMode } = useThemeDetector();
  const { database, isLoading: dbLoading, error: dbError, runQuery, loadDataset } = useSQL();
  const { toast } = useToast();
  
  // Load datasets from backend
  const { data: datasets = sampleDatasets } = useQuery({
    queryKey: ['/api/datasets'],
    onError: (error) => {
      console.error('Failed to fetch datasets:', error);
      // Fallback to sample datasets
    }
  });
  
  // Load saved queries from backend
  const { data: savedQueries = sampleQueries } = useQuery({
    queryKey: ['/api/saved-queries'],
    onError: (error) => {
      console.error('Failed to fetch saved queries:', error);
      // Fallback to sample queries
    }
  });
  
  // Load custom tables from backend
  const { data: customTables = [] } = useQuery<CustomTable[]>({
    queryKey: ['/api/custom-tables'],
    onError: (error) => {
      console.error('Failed to fetch custom tables:', error);
    }
  });
  
  // Save query mutation
  const saveQueryMutation = useMutation({
    mutationFn: (query: { name: string; description: string; sql: string; datasetId?: number }) => 
      apiRequest('POST', '/api/saved-queries', query),
    onSuccess: () => {
      toast({
        title: "Query saved",
        description: "Your query has been saved successfully."
      });
      setSaveQueryDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error saving query",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Set initial dataset
  useEffect(() => {
    if (datasets.length > 0 && !currentDataset) {
      setCurrentDataset(datasets[0]);
    }
  }, [datasets, currentDataset]);
  
  // Load dataset into SQL.js when current dataset changes
  useEffect(() => {
    if (currentDataset && !dbLoading && database) {
      loadDataset(currentDataset.tables).then(() => {
        toast({
          title: "Dataset loaded",
          description: `${currentDataset.name} dataset is ready for queries.`
        });
      }).catch(error => {
        toast({
          title: "Error loading dataset",
          description: error.message,
          variant: "destructive"
        });
      });
    }
  }, [currentDataset, dbLoading, database]);
  
  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handlers
  const handleSelectDataset = (dataset: Dataset) => {
    setCurrentDataset(dataset);
    // Clear previous results
    setQueryResult(null);
  };
  
  const handleSelectCustomTable = (table: CustomTable) => {
    // Convert custom table to dataset format
    const customDataset: Dataset = {
      id: table.id,
      name: table.name,
      description: table.description || '',
      icon: 'ri-table-line',
      isDefault: false,
      tables: [{
        name: table.name,
        schema: table.schema,
        data: table.data
      }],
      createdAt: table.createdAt
    };
    
    setCurrentDataset(customDataset);
    setQueryResult(null);
  };
  
  const handleSelectSavedQuery = (query: SavedQuery) => {
    // Find and set the corresponding dataset if available
    if (query.datasetId) {
      const dataset = datasets.find(d => d.id === query.datasetId);
      if (dataset) {
        setCurrentDataset(dataset);
      }
    }
    
    // Set the SQL query
    setSql(query.sql);
  };
  
  const handleRunQuery = async () => {
    if (!sql.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive"
      });
      return;
    }
    
    setQueryError(null);
    
    try {
      const result = await runQuery(sql);
      setQueryResult(result);
      
      // Get AI suggestions for the query
      setAiSuggestionLoading(true);
      const suggestion = await getAiSuggestion(sql);
      setAiSuggestion(suggestion);
      setAiSuggestionLoading(false);
    } catch (error) {
      setQueryError(error instanceof Error ? error : new Error(String(error)));
    }
  };
  
  const handleSaveQuery = () => {
    setSavedQueryName('');
    setSavedQueryDescription('');
    setSaveQueryDialogOpen(true);
  };
  
  const handleSaveQuerySubmit = () => {
    if (!savedQueryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your query",
        variant: "destructive"
      });
      return;
    }
    
    saveQueryMutation.mutate({
      name: savedQueryName,
      description: savedQueryDescription,
      sql,
      datasetId: currentDataset?.id
    });
  };
  
  const handleApplySuggestion = (suggestion: string) => {
    // Simple replacement for demo
    // In a real app, we would parse the suggestion and apply it more intelligently
    setSql(sql => {
      const lines = sql.split('\n');
      const lastLine = lines[lines.length - 1];
      
      // Check if last line is empty, if not add a new line
      if (lastLine.trim() !== '') {
        lines.push('');
      }
      
      lines.push(suggestion);
      return lines.join('\n');
    });
    
    // Dismiss the suggestion
    setAiSuggestion(null);
  };
  
  const handleDismissSuggestion = () => {
    setAiSuggestion(null);
  };
  
  // Render
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        datasets={datasets}
        customTables={customTables}
        savedQueries={savedQueries}
        currentDataset={currentDataset}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectDataset={handleSelectDataset}
        onSelectCustomTable={handleSelectCustomTable}
        onSelectSavedQuery={handleSelectSavedQuery}
        onNewCustomTable={() => {
          toast({
            title: "Coming soon",
            description: "Custom table creation will be available in a future update."
          });
        }}
        onSaveCurrentQuery={handleSaveQuery}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onToggleDarkMode={toggleDarkMode}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isDarkMode={isDarkMode}
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
            {/* Editor Section */}
            <div className="lg:col-span-3 flex flex-col">
              {activeTab === 'editor' && (
                <>
                  <SQLEditor
                    sql={sql}
                    onChange={setSql}
                    onRun={handleRunQuery}
                    onSave={handleSaveQuery}
                    isRunning={dbLoading}
                    isDarkMode={isDarkMode}
                  />
                  
                  {aiSuggestion && (
                    <AISuggestions
                      suggestion={aiSuggestion}
                      isLoading={aiSuggestionLoading}
                      onApplySuggestion={handleApplySuggestion}
                      onDismiss={handleDismissSuggestion}
                    />
                  )}
                  
                  <QueryResults
                    result={queryResult}
                    isLoading={dbLoading}
                    error={queryError}
                  />
                </>
              )}
              
              {activeTab === 'schema' && (
                <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 p-4">
                  <h2 className="text-lg font-semibold mb-4">Database Schema</h2>
                  {currentDataset ? (
                    <>
                      <p className="mb-4 text-gray-600 dark:text-gray-400">
                        {currentDataset.description || `Schema for ${currentDataset.name} dataset`}
                      </p>
                      
                      {currentDataset.tables.map(table => (
                        <div key={table.name} className="mb-6">
                          <h3 className="text-md font-medium mb-2">{table.name}</h3>
                          <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto">
                            {`CREATE TABLE ${table.name} (\n` + 
                              table.schema.columns.map(col => {
                                let def = `  ${col.name} ${col.type}`;
                                if (col.isPrimaryKey) def += ' PRIMARY KEY';
                                if (col.notNull) def += ' NOT NULL';
                                if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
                                return def;
                              }).join(',\n') + 
                            '\n);'}
                          </pre>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center p-10 text-gray-500 dark:text-gray-400">
                      Select a dataset to view its schema
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'ai' && (
                <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 p-4">
                  <h2 className="text-lg font-semibold mb-4">AI SQL Assistant</h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Ask the AI assistant to help you write SQL queries for your dataset.
                  </p>
                  
                  <div className="mb-4">
                    <Label htmlFor="ai-prompt">What would you like to query?</Label>
                    <Textarea 
                      id="ai-prompt" 
                      placeholder="e.g., Find all accommodations with a pool and WiFi that cost less than $100 per night"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button className="mb-6">
                    Generate SQL Query
                  </Button>
                  
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-2">Example prompts</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Find the average price of accommodations by location</li>
                      <li>• List all accommodations with a rating above 4.5, sorted by price</li>
                      <li>• Count how many accommodations have each amenity</li>
                      <li>• Get the top 3 highest-rated accommodations with kitchen and workspace</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Schema Panel */}
            <div className="lg:col-span-2 hidden lg:block">
              {currentDataset ? (
                <SchemaViewer tables={currentDataset.tables} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 h-full flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-lg font-medium mb-2">No Dataset Selected</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a dataset from the sidebar to view its schema
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Save Query Dialog */}
      <Dialog open={saveQueryDialogOpen} onOpenChange={setSaveQueryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save SQL Query</DialogTitle>
            <DialogDescription>
              Save this query to access it later. Saved queries are stored in your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="query-name">Query Name</Label>
              <Input 
                id="query-name" 
                placeholder="e.g., Budget Accommodations with WiFi" 
                value={savedQueryName}
                onChange={e => setSavedQueryName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="query-description">Description (optional)</Label>
              <Textarea 
                id="query-description" 
                placeholder="Briefly describe what this query does" 
                className="resize-none"
                value={savedQueryDescription}
                onChange={e => setSavedQueryDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveQueryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuerySubmit} disabled={saveQueryMutation.isPending}>
              {saveQueryMutation.isPending ? "Saving..." : "Save Query"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
