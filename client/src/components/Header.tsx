import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Table2, 
  Bot, 
  Menu, 
  HelpCircle, 
  Sun, 
  Moon 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'editor' | 'schema' | 'ai';
  onChangeTab: (tab: 'editor' | 'schema' | 'ai') => void;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  onToggleDarkMode,
  onToggleSidebar,
  isDarkMode
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button 
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden" 
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={activeTab === 'editor' ? 'bg-gray-100 dark:bg-gray-700' : ''}
              onClick={() => onChangeTab('editor')}
            >
              <Code className="w-4 h-4 mr-1" /> SQL Editor
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={activeTab === 'schema' ? 'bg-gray-100 dark:bg-gray-700' : ''}
              onClick={() => onChangeTab('schema')}
            >
              <Table2 className="w-4 h-4 mr-1" /> Schema
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={activeTab === 'ai' ? 'bg-gray-100 dark:bg-gray-700' : ''}
              onClick={() => onChangeTab('ai')}
            >
              <Bot className="w-4 h-4 mr-1" /> AI Assistant
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" aria-label="Help">
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Toggle theme" 
            onClick={onToggleDarkMode}
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
