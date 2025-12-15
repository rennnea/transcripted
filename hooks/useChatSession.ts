import { useState, useEffect, useRef } from 'react';
import { Chat, GenerateContentResponse } from '@google/genai';
import { ai } from '../services/gemini/client';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const useChatSession = (transcriptionText: string, cacheName?: string) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initChat = async () => {
      setIsInitializing(true);
      setError(null);
      setMessages([]);

      try {
        let chatSession: Chat;

        if (cacheName) {
          console.log(`Initializing chat with cache: ${cacheName}`);
          // Option A: Cached Content
          chatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { cachedContent: cacheName }
          });
        } else {
          console.log("Initializing chat with standard history injection.");
          // Option B: Fallback History
          chatSession = ai.chats.create({
            model: 'gemini-3-pro-preview',
            history: [
              {
                role: 'user',
                parts: [{ text: `You are an expert AI assistant specialized in analyzing text. The user has provided the following document. Answer questions based *only* on it.\n\n---\n\n${transcriptionText.substring(0, 30000)}\n\n---` }],
              },
              {
                role: 'model',
                parts: [{ text: "Understood. I have received the document context." }],
              },
            ],
          });
        }
        setChat(chatSession);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setError("Could not start the chat session. Please try again later.");
      } finally {
        setIsInitializing(false);
      }
    };

    if (transcriptionText) {
      initChat();
    }
  }, [transcriptionText, cacheName]);

  const sendMessage = async (text: string) => {
    if (!chat || !text.trim()) return;

    const newUserMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Add placeholder for model response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      const stream = await chat.sendMessageStream({ message: text });
      
      let fullResponse = "";
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullResponse += c.text;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'model') {
                lastMsg.text = fullResponse;
            }
            return newMessages;
          });
        }
      }
    } catch (err) {
      console.error("Message failed:", err);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.text = "Sorry, I encountered an error. Please try again.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, isInitializing, error, sendMessage };
};
