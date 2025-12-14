
import React from 'react';
import { TranscriptedAIIcon } from './icons/TranscriptedAIIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { HelpIcon } from './icons/HelpIcon';
import { TokenIcon } from './icons/TokenIcon';
import { TestIcon } from './icons/TestIcon';
import { ChatIcon } from './icons/ChatIcon';

interface SidebarProps {
  isOpen: boolean;
  estimatedTokens: number | null;
  onRunTests: () => void;
  onShowDashboard: () => void;
  onShowHistory: () => void;
  onShowChatbot: () => void;
  activeView: 'landing' | 'upload' | 'transcribing' | 'result' | 'history' | 'chatbot';
  isResultAvailable: boolean;
}

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  tooltip?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active, disabled, onClick, tooltip }) => {
  const baseClasses = "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 w-full text-left";
  const activeClasses = "bg-khaki-600 dark:bg-khaki-600 text-white shadow-sm";
  const inactiveClasses = "text-brown-700 dark:text-gray-300 hover:bg-beige-200 dark:hover:bg-gray-700 hover:text-brown-800 dark:hover:text-gray-100";
  const disabledClasses = "text-brown-500/60 dark:text-gray-500 cursor-not-allowed opacity-70";

  const finalClasses = `${baseClasses} ${disabled ? disabledClasses : (active ? activeClasses : inactiveClasses)}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={finalClasses}
      title={tooltip}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, estimatedTokens, onRunTests, onShowDashboard, onShowHistory, onShowChatbot, activeView, isResultAvailable }) => {
  const isDashboardActive = ['landing', 'upload', 'transcribing', 'result'].includes(activeView);
  const isHistoryActive = activeView === 'history';
  const isChatbotActive = activeView === 'chatbot';

  return (
    <nav className={`flex-shrink-0 bg-beige-100 dark:bg-gray-800 border-r border-beige-200 dark:border-gray-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center space-x-3 p-4 h-16 border-b border-beige-200 dark:border-gray-700">
            <div className="p-1.5 bg-khaki-600 dark:bg-khaki-600 rounded-lg">
                <TranscriptedAIIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-brown-800 dark:text-gray-100 font-poppins">TranscriptedAI</h1>
        </div>
        <div className="flex-1 p-4 space-y-2">
            <NavLink icon={<DashboardIcon className="w-6 h-6"/>} label="Dashboard" onClick={onShowDashboard} active={isDashboardActive} />
            <NavLink icon={<HistoryIcon className="w-6 h-6"/>} label="History" onClick={onShowHistory} active={isHistoryActive} />
            <NavLink 
              icon={<ChatIcon className="w-6 h-6"/>} 
              label="AI Chat" 
              onClick={onShowChatbot} 
              active={isChatbotActive} 
              disabled={!isResultAvailable} 
              tooltip={!isResultAvailable ? "Transcribe a file to enable the AI Chat" : "Ask questions about your transcript"}
            />
            <NavLink icon={<SettingsIcon className="w-6 h-6"/>} label="Settings" disabled tooltip="Coming soon!" />
        </div>
        <div className="p-4 border-t border-beige-200 dark:border-gray-700 space-y-4">
            {estimatedTokens !== null && activeView !== 'history' && (
              <div className="p-3 bg-beige-200/70 dark:bg-gray-700/70 rounded-lg text-xs text-brown-700 dark:text-gray-300">
                <div className="flex items-center space-x-2.5">
                  <TokenIcon className="w-5 h-5 text-khaki-700 dark:text-khaki-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">~ {estimatedTokens.toLocaleString()} tokens</p>
                    <p className="text-brown-500 dark:text-gray-400">Estimated for current file</p>
                  </div>
                </div>
              </div>
            )}
            <NavLink icon={<TestIcon className="w-6 h-6"/>} label="Run Tests" onClick={onRunTests} />
            <NavLink icon={<HelpIcon className="w-6 h-6"/>} label="Help & Support" disabled tooltip="Coming soon!" />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
