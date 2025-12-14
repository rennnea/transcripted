
import React from 'react';
import { TranscriptedAIIcon } from './icons/TranscriptedAIIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { FolderIcon } from './icons/FolderIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { HelpIcon } from './icons/HelpIcon';

interface SidebarProps {
  isOpen: boolean;
}

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active, disabled }) => {
  const baseClasses = "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200";
  const activeClasses = "bg-khaki-600 text-white shadow-sm";
  const inactiveClasses = "text-brown-700 hover:bg-beige-200 hover:text-brown-800";
  const disabledClasses = "text-brown-500/60 cursor-not-allowed opacity-70";

  const finalClasses = `${baseClasses} ${disabled ? disabledClasses : (active ? activeClasses : inactiveClasses)}`;

  return (
    <a 
      href={disabled ? undefined : "#"} 
      onClick={disabled ? (e) => e.preventDefault() : undefined}
      className={finalClasses}
      title={disabled ? "This feature is coming soon!" : undefined}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <nav className={`flex-shrink-0 bg-beige-100 border-r border-beige-200 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center space-x-3 p-4 h-16 border-b border-beige-200">
            <div className="p-1.5 bg-khaki-600 rounded-lg">
                <TranscriptedAIIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-brown-800 font-poppins">TranscriptedAI</h1>
        </div>
        <div className="flex-1 p-4 space-y-2">
            <NavLink icon={<DashboardIcon className="w-6 h-6"/>} label="Dashboard" active />
            <NavLink icon={<FolderIcon className="w-6 h-6"/>} label="All Transcripts" disabled />
            <NavLink icon={<SettingsIcon className="w-6 h-6"/>} label="Settings" disabled />
        </div>
        <div className="p-4 border-t border-beige-200">
            <NavLink icon={<HelpIcon className="w-6 h-6"/>} label="Help & Support" />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
