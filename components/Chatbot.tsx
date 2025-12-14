
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { ChatIcon } from './icons/ChatIcon';
import { SendIcon } from './icons/SendIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { TranscriptedAIIcon } from './icons/TranscriptedAIIcon';
import { ErrorIcon } from './icons/ErrorIcon';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface ChatbotProps {
  transcriptionText: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ transcriptionText, onClose }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializingChat, setIsInitializingChat] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsInitializingChat(true);
    setInitializationError(null);
    setMessages([]); // Clear messages from any previous session

    try {
      // This operation is synchronous in the current SDK version
      const chatSession = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: [
          {
            role: 'user',
            parts: [{ text: `You are an expert AI assistant specialized in analyzing text. The user has provided the following document, which is a transcription of an audio file. Your task is to answer the user's questions based *only* on the information contained within this document. If the answer cannot be found in the text, state that clearly. Do not make up information. Here is the document:\n\n---\n\n${transcriptionText}\n\n---` }],
          },
          {
            role: 'model',
            parts: [{ text: "Understood. I have received the document's context. I am ready to answer questions based on its content." }],
          },
        ],
      });
      setChat(chatSession);
    } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setInitializationError("Could not start the chat session. Please try again later.");
    } finally {
        setIsInitializingChat(false);
    }
  }, [transcriptionText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!chat || !userInput.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      const stream = await chat.sendMessageStream({ message: userInput });
      
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text;
        if (chunkText) {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text += chunkText;
                return newMessages;
            });
        }
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1].role === 'model') {
            newMessages[newMessages.length - 1].text = errorMessage;
          } else {
            newMessages.push({ role: 'model', text: errorMessage });
          }
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-beige-100 border border-beige-200/80 rounded-2xl shadow-sm">
      <header className="flex items-center justify-between p-4 border-b border-beige-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <ChatIcon className="w-6 h-6 text-khaki-600" />
          <h2 className="text-lg font-semibold text-brown-800">AI Chat Assistant</h2>
        </div>
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-brown-700 bg-beige-200 rounded-lg hover:bg-beige-300">
          Close
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {isInitializingChat ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex items-center space-x-2 text-brown-500">
              <ChatIcon className="w-5 h-5 animate-pulse" />
              <p className="font-medium">Initializing AI chat session...</p>
            </div>
          </div>
        ) : initializationError ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-red-600">
            <ErrorIcon className="w-8 h-8 mb-2" />
            <p className="font-semibold">Failed to Start Chat</p>
            <p className="text-sm">{initializationError}</p>
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
                <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-khaki-600 text-white rounded-br-none' : 'bg-beige-50 border border-beige-200/80 text-brown-800 rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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
                  <div className="max-w-lg px-4 py-3 rounded-2xl bg-beige-50 border border-beige-200/80 text-brown-800 rounded-bl-none">
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

      <footer className="p-4 border-t border-beige-200 flex-shrink-0">
        <div className="flex items-center bg-beige-50 border border-beige-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-khaki-500">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isInitializingChat ? "Please wait..." : 
              initializationError ? "Chat disabled due to an error" : 
              "Ask a question about the transcription..."
            }
            className="flex-1 bg-transparent border-none focus:outline-none resize-none px-2 text-sm text-brown-800 placeholder-brown-500"
            rows={1}
            disabled={isLoading || isInitializingChat || !!initializationError}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !userInput.trim() || !chat || isInitializingChat || !!initializationError} 
            className="p-2 bg-khaki-600 text-white rounded-lg hover:bg-khaki-700 disabled:bg-brown-500/50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chatbot;
