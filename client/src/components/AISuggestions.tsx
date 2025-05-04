import React from 'react';
import { AiSuggestion } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Bot, Terminal, Plus, X } from 'lucide-react';

interface AISuggestionsProps {
  suggestion: AiSuggestion | null;
  isLoading: boolean;
  onApplySuggestion: (suggestion: string) => void;
  onDismiss: () => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  suggestion,
  isLoading,
  onApplySuggestion,
  onDismiss
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-accent border-opacity-50 dark:border-opacity-50 p-4 mb-4 animate-pulse">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent mr-3">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!suggestion) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-accent border-opacity-50 dark:border-opacity-50 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent mr-3">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-accent">AI Suggestion</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{suggestion.message}</p>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3 text-sm font-mono">
            {suggestion.suggestions.map((item, index) => (
              <div key={index} className="text-sm">
                <span className="text-accent">•</span>{' '}
                <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{item}</code>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Button 
              variant="link" 
              size="sm" 
              className="text-xs text-accent hover:text-accent-hover flex items-center p-0"
              onClick={() => suggestion.suggestions.length > 0 && onApplySuggestion(suggestion.suggestions[0])}
            >
              <Plus className="w-3 h-3 mr-1" /> Apply Suggestions
            </Button>
            <Button 
              variant="link" 
              size="sm" 
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-0"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
