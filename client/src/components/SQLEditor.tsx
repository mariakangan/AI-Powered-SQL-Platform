import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Save, 
  MoreHorizontal,
  Share,
  Download,
  Copy
} from 'lucide-react';
import CodeMirror from './CodeMirror';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SQLEditorProps {
  sql: string;
  onChange: (sql: string) => void;
  onRun: () => void;
  onSave: () => void;
  isRunning: boolean;
  isDarkMode: boolean;
}

const SQLEditor: React.FC<SQLEditorProps> = ({
  sql,
  onChange,
  onRun,
  onSave,
  isRunning,
  isDarkMode
}) => {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(sql);
  };

  const handleFormat = () => {
    // Simple SQL formatting logic
    // For a real implementation, we'd use a proper SQL formatter library
    const formattedSql = sql
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*;\s*/g, ';\n')
      .replace(/\s*(SELECT|FROM|WHERE|JOIN|ON|GROUP BY|ORDER BY|HAVING|LIMIT)\s+/gi, '\n$1 ')
      .replace(/\s*(AND|OR)\s+/gi, '\n  $1 ');
    
    onChange(formattedSql);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">SQL Query</h2>
        
        <div className="flex items-center space-x-2">
          <Button
            className="flex items-center"
            onClick={onRun}
            disabled={isRunning}
          >
            <Play className="w-4 h-4 mr-1" />
            Run Query
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center"
            onClick={onSave}
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Query Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFormat}>
                <Share className="w-4 h-4 mr-2" />
                Format Query
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export as File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden mb-4">
        <CodeMirror
          value={sql}
          onChange={onChange}
          isDarkMode={isDarkMode}
          height="200px"
        />
      </div>
    </div>
  );
};

export default SQLEditor;
