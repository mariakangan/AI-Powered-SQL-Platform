import React from 'react';
import { Dataset, SavedQuery, CustomTable } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Home, 
  Bus, 
  UtensilsCrossed, 
  Route, 
  Table2, 
  FileText, 
  Plus, 
  Menu, 
  X 
} from 'lucide-react';

interface SidebarProps {
  datasets: Dataset[];
  customTables: CustomTable[];
  savedQueries: SavedQuery[];
  currentDataset: Dataset | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectDataset: (dataset: Dataset) => void;
  onSelectCustomTable: (table: CustomTable) => void;
  onSelectSavedQuery: (query: SavedQuery) => void;
  onNewCustomTable: () => void;
  onSaveCurrentQuery: () => void;
}

const getIconForDataset = (iconName: string) => {
  switch (iconName) {
    case 'ri-home-line':
      return <Home className="w-4 h-4 mr-2" />;
    case 'ri-bus-line':
      return <Bus className="w-4 h-4 mr-2" />;
    case 'ri-restaurant-line':
      return <UtensilsCrossed className="w-4 h-4 mr-2" />;
    case 'ri-route-line':
      return <Route className="w-4 h-4 mr-2" />;
    default:
      return <Database className="w-4 h-4 mr-2" />;
  }
};

const Sidebar: React.FC<SidebarProps> = ({
  datasets,
  customTables,
  savedQueries,
  currentDataset,
  isOpen,
  onToggle,
  onSelectDataset,
  onSelectCustomTable,
  onSelectSavedQuery,
  onNewCustomTable,
  onSaveCurrentQuery
}) => {
  return (
    <aside 
      className={`w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 md:block transition-all duration-300 ease-in-out z-20 fixed md:relative h-full ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Database className="text-primary w-5 h-5 mr-2" />
          <h1 className="text-lg font-bold">SQLPractice</h1>
        </div>
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onToggle}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Datasets
          </h2>
          
          {datasets.map((dataset) => (
            <button
              key={dataset.id}
              className={`flex items-center px-3 py-2 w-full rounded-md text-left mb-1 font-medium transition-colors duration-150 ${
                currentDataset?.id === dataset.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => onSelectDataset(dataset)}
            >
              {getIconForDataset(dataset.icon || '')}
              <span>{dataset.name}</span>
            </button>
          ))}
          
          <Separator className="my-4" />
          
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Custom Tables
          </h2>
          
          {customTables.map((table) => (
            <button
              key={table.id}
              className="flex items-center px-3 py-2 w-full rounded-md text-left mb-1 font-medium transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              onClick={() => onSelectCustomTable(table)}
            >
              <Table2 className="w-4 h-4 mr-2 text-gray-500" />
              <span>{table.name}</span>
            </button>
          ))}
          
          <Button 
            variant="link" 
            className="flex items-center px-3 py-2 w-full rounded-md text-left mb-3 text-primary font-medium"
            onClick={onNewCustomTable}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>New Custom Table</span>
          </Button>
          
          <Separator className="my-4" />
          
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Saved Queries
          </h2>
          
          {savedQueries.map((query) => (
            <button
              key={query.id}
              className="flex items-center px-3 py-2 w-full rounded-md text-left mb-1 font-medium transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              onClick={() => onSelectSavedQuery(query)}
            >
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              <span>{query.name}</span>
            </button>
          ))}
          
          <Button 
            variant="link" 
            className="flex items-center px-3 py-2 w-full rounded-md text-left mb-3 text-primary font-medium"
            onClick={onSaveCurrentQuery}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Save Current Query</span>
          </Button>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
