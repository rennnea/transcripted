
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { SearchIcon } from './icons/SearchIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { useTheme } from '../contexts/ThemeContext';


interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex-shrink-0 bg-beige-100 dark:bg-gray-800 border-b border-beige-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center space-x-4">
          <button onClick={onToggleSidebar} className="p-2 rounded-md text-brown-500 dark:text-gray-300 hover:bg-beige-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-khaki-500 dark:focus:ring-khaki-400">
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="relative hidden md:block">
            <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-brown-500 dark:text-gray-400" />
            <input type="text" placeholder="Search transcripts..." className="pl-10 pr-4 py-2 w-64 border border-beige-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-500 dark:focus:ring-khaki-400" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-md text-brown-500 dark:text-gray-300 hover:bg-beige-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-khaki-500 dark:focus:ring-khaki-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
            <UserCircleIcon className="w-9 h-9 text-brown-500 dark:text-gray-300 cursor-pointer hover:text-khaki-600 dark:hover:text-khaki-400"/>
        </div>
      </div>
    </header>
  );
};

export default Header;