
import React, { useRef, useEffect, useState } from 'react';
import { useChatSession } from '../hooks/useChatSession';
import { ChatIcon } from './common/icons/ChatIcon';
import { SendIcon } from './common/icons/SendIcon';
import { UserCircleIcon } from './common/icons/UserCircleIcon';
import { TranscriptedAIIcon } from './common/icons/TranscriptedAIIcon';
import { ErrorIcon } from './common/icons/ErrorIcon';
import { Zap } from 'lucide-react';

interface ChatbotProps {
  transcriptionText: string;
  cacheName?: string;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ transcriptionText, cacheName, onClose }) => {
  const { messages, isLoading, isInitializing, error, sendMessage } = useChatSession(transcriptionText, cacheName);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (userInput.trim() && !isLoading) {
      sendMessage(userInput);
      setUserInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm">
      <header className="flex items-center justify-between p-4 border-b border-beige-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <ChatIcon className="w-6 h-6 text-khaki-600" />
          <h2 className="text-lg font-semibold text-brown-800 flex items-center">
            AI Chat Assistant 
            {cacheName && (
              <div className="flex items-center ml-3 px-2.5 py-1 bg-green-100/80 border border-green-200 rounded-full text-xs font-medium text-green-700 shadow-sm" title="Context is cached for faster responses">
                <Zap className="w-3 h-3 mr-1.5 fill-green-500 text-green-600" />
                <span>Context Cached</span>
              </div>
            )}
          </h2>
        </div>
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-brown-700 bg-beige-200 rounded-lg hover:bg-beige-300 transition-colors">
          Close
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex items-center space-x-2 text-brown-500">
              <ChatIcon className="w-5 h-5 animate-pulse" />
              <p className="font-medium">Initializing AI chat session...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-red-600">
            <ErrorIcon className="w-8 h-8 mb-2" />
            <p className="font-semibold">Failed to Start Chat</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 flex-shrink-0 bg-khaki-600 rounded-full flex items-center justify-center">
                    <TranscriptedAIIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-khaki-600 text-white rounded-br-none shadow-md' : 'bg-white border border-beige-200 shadow-sm text-brown-800 rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 flex-shrink-0 bg-beige-200 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-brown-500" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex-shrink-0 bg-khaki-600 rounded-full flex items-center justify-center">
                    <TranscriptedAIIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="max-w-lg px-4 py-3 rounded-2xl bg-white border border-beige-200 text-brown-800 rounded-bl-none shadow-sm">
                      <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-khaki-500 rounded-full animate-pulse delay-0"></span>
                          <span className="w-2 h-2 bg-khaki-500 rounded-full animate-pulse delay-150"></span>
                          <span className="w-2 h-2 bg-khaki-500 rounded-full animate-pulse delay-300"></span>
                      </div>
                  </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t border-beige-200 flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-b-2xl">
        <div className="flex items-center bg-white border border-beige-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-khaki-500 shadow-sm transition-shadow">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isInitializing ? "Please wait..." : 
              error ? "Chat disabled" : 
              "Ask a question about the transcription..."
            }
            className="flex-1 bg-transparent border-none focus:outline-none resize-none px-2 text-sm text-brown-800 placeholder-brown-400"
            rows={1}
            disabled={isLoading || isInitializing || !!error}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || !userInput.trim() || isInitializing || !!error} 
            className="p-2 bg-khaki-600 text-white rounded-lg hover:bg-khaki-700 disabled:bg-brown-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chatbot;
