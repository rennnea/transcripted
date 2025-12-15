import React, { memo } from 'react';
import { MenuIcon } from '../common/icons/MenuIcon';
import { SearchIcon } from '../common/icons/SearchIcon';
import { UserCircleIcon } from '../common/icons/UserCircleIcon';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="flex-shrink-0 bg-beige-100 border-b border-beige-200">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center space-x-4">
          <button onClick={onToggleSidebar} className="p-2 rounded-md text-brown-500 hover:bg-beige-200 focus:outline-none focus:ring-2 focus:ring-khaki-500">
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="relative hidden md:block">
            <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-brown-500" />
            <input type="text" placeholder="Search transcripts..." className="pl-10 pr-4 py-2 w-64 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-500" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <UserCircleIcon className="w-9 h-9 text-brown-500 cursor-pointer hover:text-khaki-600"/>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);