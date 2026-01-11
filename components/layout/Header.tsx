
import React, { memo, useState } from 'react';
import { MenuIcon } from '../common/icons/MenuIcon';
import { SearchIcon } from '../common/icons/SearchIcon';
import { UserCircleIcon } from '../common/icons/UserCircleIcon';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isDarkMode, onToggleTheme, onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchValue);
    }
  };

  return (
    <header className="flex-shrink-0 bg-beige-100/80 dark:bg-zinc-900/50 backdrop-blur-xl border-b border-beige-200 dark:border-white/10 transition-colors duration-500">
      <div className="flex items-center justify-between p-4 h-20">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleSidebar} 
            className="p-3 rounded-2xl text-brown-600 dark:text-zinc-400 hover:bg-beige-200 dark:hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-khaki-500/20 transition-all active:scale-90"
            aria-label="Toggle Menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="relative hidden md:block group">
            <SearchIcon className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 text-brown-400 dark:text-zinc-500 group-focus-within:text-khaki-600 transition-colors" />
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search library..." 
              className="pl-12 pr-5 py-3.5 w-72 border border-beige-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl focus:outline-none focus:ring-4 focus:ring-khaki-500/10 focus:border-khaki-500/50 text-brown-800 dark:text-zinc-200 transition-all placeholder:text-brown-400 dark:placeholder:text-zinc-600 shadow-sm" 
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
            <button 
              onClick={onToggleTheme}
              className="p-3 text-brown-600 dark:text-zinc-400 hover:bg-beige-200 dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button className="p-2 transition-transform active:scale-90" aria-label="User Account">
              <UserCircleIcon className="w-11 h-11 text-brown-400 dark:text-zinc-600 cursor-pointer hover:text-khaki-700 dark:hover:text-khaki-500 transition-colors"/>
            </button>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
