
import React, { memo } from 'react';
import { TranscriptedAIIcon } from '../common/icons/TranscriptedAIIcon';
import { DashboardIcon } from '../common/icons/DashboardIcon';
import { HistoryIcon } from '../common/icons/HistoryIcon';
import { SettingsIcon } from '../common/icons/SettingsIcon';
import { HelpIcon } from '../common/icons/HelpIcon';
import { TokenIcon } from '../common/icons/TokenIcon';
import { TestIcon } from '../common/icons/TestIcon';
import { ChatIcon } from '../common/icons/ChatIcon';
import { Activity, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  estimatedTokens: number | null;
  onRunTests: () => void;
  onShowDashboard: () => void;
  onShowHistory: () => void;
  onShowChatbot: () => void;
  onShowSentimentLab: () => void;
  activeView: 'landing' | 'upload' | 'transcribing' | 'result' | 'history' | 'chatbot' | 'sentiment-lab';
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
  const activeClasses = "bg-khaki-600 text-white shadow-sm";
  const inactiveClasses = "text-brown-700 hover:bg-beige-200 hover:text-brown-800";
  const disabledClasses = "text-brown-500/60 cursor-not-allowed opacity-70";

  const finalClasses = `${baseClasses} ${disabled ? disabledClasses : (active ? activeClasses : inactiveClasses)}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={finalClasses}
      title={tooltip}
    >
      {icon}
      <span className="font-medium truncate">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose,
  estimatedTokens, 
  onRunTests, 
  onShowDashboard, 
  onShowHistory, 
  onShowChatbot, 
  onShowSentimentLab, 
  activeView, 
  isResultAvailable 
}) => {
  const isDashboardActive = ['landing', 'upload', 'transcribing', 'result'].includes(activeView);
  const isHistoryActive = activeView === 'history';
  const isChatbotActive = activeView === 'chatbot';
  const isSentimentLabActive = activeView === 'sentiment-lab';

  const handleNavAction = (action: () => void) => {
    action();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-brown-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <nav className={`
        fixed md:static inset-y-0 left-0 z-50 
        flex-shrink-0 bg-beige-100 border-r border-beige-200 
        transition-[width,transform,opacity] duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0 opacity-100 shadow-2xl md:shadow-none' : 'w-0 -translate-x-full opacity-0 md:w-0 md:opacity-100 md:translate-x-0'} 
        overflow-hidden h-full flex flex-col
      `}>
        <div className="flex flex-col h-full w-64">
          {/* Header / Home Button */}
          <div className="flex items-center justify-between p-4 h-16 border-b border-beige-200">
              <button 
                onClick={() => handleNavAction(onShowDashboard)}
                className="flex items-center space-x-3 text-left hover:opacity-80 transition-opacity focus:outline-none group"
                title="Go to Homepage"
              >
                <div className="p-1.5 bg-khaki-600 rounded-lg group-hover:bg-khaki-700 transition-colors">
                    <TranscriptedAIIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-brown-800 font-poppins whitespace-nowrap">TranscriptedAI</h1>
              </button>
              
              {/* Mobile Close Button */}
              <button 
                onClick={onClose}
                className="md:hidden p-1.5 text-brown-500 hover:bg-beige-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
          </div>

          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              <NavLink icon={<DashboardIcon className="w-6 h-6 flex-shrink-0"/>} label="Dashboard" onClick={() => handleNavAction(onShowDashboard)} active={isDashboardActive} />
              <NavLink icon={<HistoryIcon className="w-6 h-6 flex-shrink-0"/>} label="History" onClick={() => handleNavAction(onShowHistory)} active={isHistoryActive} />
              <NavLink 
                icon={<ChatIcon className="w-6 h-6 flex-shrink-0"/>} 
                label="AI Chat" 
                onClick={() => handleNavAction(onShowChatbot)} 
                active={isChatbotActive} 
                disabled={!isResultAvailable} 
                tooltip={!isResultAvailable ? "Transcribe a file to enable the AI Chat" : "Ask questions about your transcript"}
              />
              <NavLink icon={<Activity size={24} className="flex-shrink-0" />} label="Sentiment Lab" onClick={() => handleNavAction(onShowSentimentLab)} active={isSentimentLabActive} />
              <NavLink icon={<SettingsIcon className="w-6 h-6 flex-shrink-0"/>} label="Settings" disabled tooltip="Coming soon!" />
          </div>

          <div className="p-4 border-t border-beige-200 space-y-4">
              {estimatedTokens !== null && activeView !== 'history' && activeView !== 'sentiment-lab' && (
                <div className="p-3 bg-beige-200/70 rounded-lg text-xs text-brown-700">
                  <div className="flex items-center space-x-2.5">
                    <TokenIcon className="w-5 h-5 text-khaki-700 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate" title={`${estimatedTokens.toLocaleString()} tokens`}>~ {estimatedTokens.toLocaleString()} tokens</p>
                      <p className="text-brown-500 truncate">Estimated for current file</p>
                    </div>
                  </div>
                </div>
              )}
              <NavLink icon={<TestIcon className="w-6 h-6 flex-shrink-0"/>} label="Run Tests" onClick={() => handleNavAction(onRunTests)} />
              <NavLink icon={<HelpIcon className="w-6 h-6 flex-shrink-0"/>} label="Help & Support" disabled tooltip="Coming soon!" />
          </div>
        </div>
      </nav>
    </>
  );
};

export default memo(Sidebar);
