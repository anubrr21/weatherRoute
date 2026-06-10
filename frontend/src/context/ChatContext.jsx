// frontend/src/context/ChatContext.jsx
import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import chatService from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  
  // NEW: Track if last message was from voice input
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // Store messages per user for account isolation
  const messagesCache = useRef(new Map());

  useEffect(() => {
    if (isAuthenticated && user) {
      const userMessages = messagesCache.current.get(user.id);
      if (userMessages && userMessages.length > 0) {
        setMessages(userMessages);
      } else {
        addWelcomeMessage();
      }
    } else {
      setMessages([]);
    }
  }, [isAuthenticated, user]);

  const addWelcomeMessage = () => {
    const userName = user?.username || 'friend';
    const welcomeMsg = {
      id: Date.now(),
      role: 'assistant',
      content: `Hey ${userName}! 👋 I'm **WISE** (Weather Intelligence & Smart Assistant), your personal travel companion! 🌟\n\nI'm here to make your journeys amazing with:\n\n🌤️ **Smart Weather Insights** - Real-time conditions with comfort advice\n🗺️ **Detailed Route Planning** - Complete guides with rest stops and scenic spots\n⚠️ **Weather Risk Analysis** - Safety assessments for your trips\n🚗 **Rest Stop Recommendations** - Where to eat, rest, and refuel\n🔄 **Alternative Routes** - Options to avoid bad weather\n✅ **Travel Tips** - Packing advice and best departure times\n\n**Try asking me things like:**\n• "Plan a route from Delhi to Jaipur with rest stops"\n• "What's the weather in Mumbai and what should I wear?"\n• "Is it safe to travel from Bangalore to Chennai today?"\n• "Show me alternative routes from Hyderabad to Pune"\n• "Where can I find my route history?"\n\nI can also answer in Hindi if you prefer! 🇮🇳\n\nHow can I make your journey amazing today? 🚗✨`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMsg]);
    if (user) {
      messagesCache.current.set(user.id, [welcomeMsg]);
    }
  };

  const sendMessage = async (content, isFromVoice = false) => {
    if (!content.trim() || !isAuthenticated) return;

    // NEW: Set voice mode flag
    if (isFromVoice) {
      setIsVoiceMode(true);
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (user) {
      messagesCache.current.set(user.id, updatedMessages);
    }
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(content.trim(), {
        currentPage: window.location.pathname
      });

      let responseText = response.message || "I'm here to help with your travel plans! 🌟 What would you like to know?";

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
        // NEW: Mark if this response should be spoken
        shouldSpeak: isFromVoice
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      if (user) {
        messagesCache.current.set(user.id, finalMessages);
      }
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again. In the meantime, you can use the weather search or route planner directly! 🌤️\n\n[ACTION:NAVIGATE:dashboard]",
        timestamp: new Date().toISOString(),
        shouldSpeak: isFromVoice
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      if (user) {
        messagesCache.current.set(user.id, finalMessages);
      }
    } finally {
      setIsLoading(false);
      // NEW: Reset voice mode after delay
      setTimeout(() => {
        setIsVoiceMode(false);
      }, 1000);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    addWelcomeMessage();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const value = {
    messages,
    isOpen,
    isLoading,
    unreadCount,
    isVoiceMode,
    sendMessage,
    toggleChat,
    clearMessages,
    messagesEndRef,
    setIsVoiceMode
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};