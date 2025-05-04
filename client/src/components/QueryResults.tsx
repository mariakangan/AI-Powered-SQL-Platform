import React, { useState } from 'react';
import { QueryResult } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Copy, 
  Maximize, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';

interface QueryResultsProps {
  result: QueryResult | null;
  isLoading: boolean;
  error: Error | null;
}

const QueryResults: React.FC<QueryResultsProps> = ({
  result,
  isLoading,
  error
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const exportCsv = () => {
    if (!result) return;
    
    const headers = result.columns.join(',');
    const rows = result.values.map(row => row.join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'query_result.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const copyAsJson = () => {
    if (!result) return;
    
    const json = result.values.map(row => {
      const obj: Record<string, unknown> = {};
      result.columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
    
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
  };
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-red-300 dark:border-red-700 overflow-hidden">
        <div className="border-b border-red-300 dark:border-red-700 p-3 bg-red-50 dark:bg-red-900/20">
          <h3 className="font-medium text-red-700 dark:text-red-400">Error</h3>
        </div>
        <div className="p-4 text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap font-mono">
          {error.message}
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden animate-pulse">
        <div className="border-b border-gray-300 dark:border-gray-600 p-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="ml-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  if (!result || result.columns.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
        <div className="border-b border-gray-300 dark:border-gray-600 p-3">
          <h3 className="font-medium">Results</h3>
        </div>
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Run a query to see results
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      <div className="border-b border-gray-300 dark:border-gray-600 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="font-medium">Results</h3>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            ({result.values.length} {result.values.length === 1 ? 'row' : 'rows'}, {result.executionTime.toFixed(1)}ms)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            title="Export CSV"
            onClick={exportCsv}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            title="Copy as JSON"
            onClick={copyAsJson}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            onClick={toggleFullscreen}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {result.columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {result.values.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {row.map((cell, cellIndex) => {
                  // Check if cell is a boolean to render a check or X icon
                  const isBool = typeof cell === 'boolean' || cell === 0 || cell === 1;
                  const boolValue = cell === true || cell === 1;
                  
                  return (
                    <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {isBool ? (
                        boolValue ? (
                          <CheckCircle2 className="text-green-500 h-4 w-4" />
                        ) : (
                          <XCircle className="text-gray-400 h-4 w-4" />
                        )
                      ) : (
                        String(cell)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryResults;
