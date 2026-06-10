// frontend/src/components/chatbot/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Trash2, Minimize2, Maximize2, Volume2, ChevronDown } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useAuth } from '../../context/AuthContext';
import JumpToLatestButton from './JumpToLatestButton';
import routeService from '../../services/routeService';
import { useJarvis } from '../../context/JarvisContext';

const ChatBot = () => {
  const navigate = useNavigate();
  const {
    isOpen,
    toggleChat,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    unreadCount,
    messagesEndRef,
    isVoiceMode,
    setIsVoiceMode
  } = useChat();

  const { isAuthenticated } = useAuth();
  const messagesContainerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [processedActionIds, setProcessedActionIds] = useState(new Set());
  const [spokenMessageIds, setSpokenMessageIds] = useState(new Set());

  // ========== NEW: Voice selection state ==========
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);

  const { setCommandHandler } = useJarvis();

  const [suggestions] = useState([
    '🌤️ Weather in Mumbai',
    '🗺️ Plan route from Delhi to Jaipur',
    '⚠️ Is it safe to travel from Bangalore to Chennai?',
    '🔄 Show alternative routes',
    '📍 Find rest stops along my route'
  ]);

  // ========== NEW: Load available voices ==========
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang === 'en-US');
      setAvailableVoices(englishVoices);
      
      // Set default voice preference (Google UK English Female is best)
      const defaultVoice = englishVoices.find(v => v.name === 'Google UK English Female') ||
                          englishVoices.find(v => v.name === 'Google US English') ||
                          englishVoices.find(v => v.name === 'Microsoft Ava') ||
                          englishVoices.find(v => v.name === 'Samantha') ||
                          englishVoices[0];
      
      if (defaultVoice && !selectedVoiceName) {
        setSelectedVoiceName(defaultVoice.name);
      }
    };
    
    loadVoices();
    
    // Some browsers need this event
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // ========== Text-to-Speech for voice responses ==========
  const speakText = (text, messageId) => {
    if (spokenMessageIds.has(messageId)) return;
    
    if (!window.speechSynthesis) {
      console.log('Speech synthesis not supported');
      return;
    }
    
    let cleanText = text.replace(/\[ACTION:[^\]]+\]/g, '');
    cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleanText = cleanText.replace(/[#*_`]/g, '');
    
    console.log('🔊 Speaking:', cleanText.substring(0, 100));
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // ========== NEW: Use selected voice if available ==========
    if (selectedVoiceName) {
      const selectedVoice = availableVoices.find(v => v.name === selectedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🎤 Using voice:', selectedVoice.name);
      }
    }
    
    utterance.onstart = () => console.log('🎤 Speaking started');
    utterance.onend = () => console.log('🎤 Speaking finished');
    utterance.onerror = (e) => console.error('Speech error:', e);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    
    setSpokenMessageIds(prev => new Set([...prev, messageId]));
  };

  // Auto-speak when new assistant message arrives from voice
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log('New message:', { 
        role: lastMessage.role, 
        shouldSpeak: lastMessage.shouldSpeak 
      });
      
      if (lastMessage.role === 'assistant' && lastMessage.shouldSpeak && lastMessage.content) {
        setTimeout(() => {
          speakText(lastMessage.content, lastMessage.id);
        }, 500);
      }
    }
  }, [messages]);

  // ========== Action Parser Function ==========
  const cleanContentFromActions = (content) => {
    if (!content) return content;
    
    let cleaned = content;
    cleaned = cleaned.replace(/\[ACTION:REDIRECT_ROUTE:[^\]]+\]/g, '');
    cleaned = cleaned.replace(/\[ACTION:REDIRECT_WEATHER:[^\]]+\]/g, '');
    cleaned = cleaned.replace(/\[ACTION:NAVIGATE:[^\]]+\]/g, '');
    cleaned = cleaned.replace(/\[ACTION:SUGGEST:[^\]]+\]/g, '');
    
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  // ========== Execute actions ==========
  const executeActions = (content, messageId) => {
    if (processedActionIds.has(messageId)) return;
    
    const routeMatch = content.match(/\[ACTION:REDIRECT_ROUTE:([^:]+):([^:]+):([^\]]*)\]/);
    if (routeMatch) {
      const startLocation = routeMatch[1];
      const endLocation = routeMatch[2];
      const waypoints = routeMatch[3] ? routeMatch[3].split(',') : [];
      
      navigate('/route-planner', {
        state: {
          loadSavedRoute: true,
          startLocation: startLocation,
          endLocation: endLocation,
          waypoints: waypoints
        }
      });
    }
    
    const weatherMatch = content.match(/\[ACTION:REDIRECT_WEATHER:([^\]]+)\]/);
    if (weatherMatch) {
      const city = weatherMatch[1];
      navigate(`/weather/${encodeURIComponent(city)}`);
    }
    
    const navigateMatch = content.match(/\[ACTION:NAVIGATE:([^\]]+)\]/);
    if (navigateMatch) {
      const page = navigateMatch[1];
      const routes = {
        'dashboard': '/dashboard',
        'routePlanner': '/route-planner',
        'route-planner': '/route-planner',
        'favorites': '/favorites',
        'searchHistory': '/search-history',
        'search-history': '/search-history',
        'routeHistory': '/route-history',
        'route-history': '/route-history'
      };
      if (routes[page]) {
        navigate(routes[page]);
      } else if (page === 'dashboard') {
        navigate('/dashboard');
      }
    }
    
    // ========== NEW: Check for TRANSPORT action ==========
    const transportMatch = content.match(/\[ACTION:TRANSPORT:([^\]]+)\]/);
    if (transportMatch) {
      const mode = transportMatch[1];
      // Store the selected transport mode in sessionStorage for RoutePlannerPage to read
      sessionStorage.setItem('selectedTransportMode', mode);
      navigate('/route-planner');
    }
    
    setProcessedActionIds(prev => new Set([...prev, messageId]));
  };

  const getProcessedMessages = () => {
    return messages.map(msg => {
      if (msg.role === 'assistant' && msg.content && msg.content.includes('[ACTION:')) {
        return {
          ...msg,
          content: cleanContentFromActions(msg.content)
        };
      }
      return msg;
    });
  };

  // Execute actions from latest message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content && lastMessage.content.includes('[ACTION:')) {
        executeActions(lastMessage.content, lastMessage.id);
      }
    }
  }, [messages]);

  useEffect(() => {
  // Set up command handler for Jarvis
  setCommandHandler(async (command) => {
    console.log('🎤 Jarvis command received:', command);
    
    // Map voice commands to actions
    if (command.includes('weather') || command.includes('temperature')) {
      // Extract city name
      const cityMatch = command.match(/(?:in|at|for)\s+([a-z\s]+)/i);
      if (cityMatch) {
        const city = cityMatch[1].trim();
        sendMessage(`What's the weather in ${city}`, true);
      } else {
        sendMessage(`What's the weather`, true);
      }
    } 
    else if (command.includes('route') || command.includes('plan') || command.includes('trip')) {
      const fromMatch = command.match(/(?:from|starting from)\s+([a-z\s]+?)(?:\s+to\s+|\s+and\s+)/i);
      const toMatch = command.match(/(?:to|destination)\s+([a-z\s]+)/i);
      
      if (fromMatch && toMatch) {
        sendMessage(`Plan a route from ${fromMatch[1]} to ${toMatch[1]}`, true);
      } else {
        sendMessage(`Plan a route`, true);
      }
    }
    else if (command.includes('favorite') || command.includes('save')) {
      sendMessage(`Add current location to favorites`, true);
    }
    else if (command.includes('dashboard')) {
      navigate('/dashboard');
    }
    else if (command.includes('route planner')) {
      navigate('/route-planner');
    }
    else if (command.includes('favorites')) {
      navigate('/favorites');
    }
    else if (command.includes('history')) {
      if (command.includes('route')) {
        navigate('/route-history');
      } else {
        navigate('/search-history');
      }
    }
    else if (command.includes('zoom in')) {
      // Map zoom - will be handled by map component
      window.dispatchEvent(new CustomEvent('jarvis:zoomIn'));
    }
    else if (command.includes('zoom out')) {
      window.dispatchEvent(new CustomEvent('jarvis:zoomOut'));
    }
    else if (command.includes('add stop') || command.includes('add waypoint')) {
      const placeMatch = command.match(/(?:add stop|add waypoint)(?:\s+at|\s+in)?\s+([a-z\s]+)/i);
      if (placeMatch) {
        sendMessage(`Add waypoint at ${placeMatch[1]}`, true);
      }
    }
    else {
      // Default: send to chat
      sendMessage(command, true);
    }
  });
}, []);

  // Auto-scroll logic
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const atBottom = distanceFromBottom < 50;
      setIsAtBottom(atBottom);
      setIsUserScrolledUp(!atBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll to bottom when new messages arrive ONLY if user is at bottom
  useEffect(() => {
    if (isAtBottom && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  const jumpToLatest = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setIsUserScrolledUp(false);
      setIsAtBottom(true);
    }
  };

  if (!isAuthenticated) return null;

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion, false);
  };

  const handleVoiceSubmit = (isVoice) => {
    console.log('🎤 Voice submit detected:', isVoice);
    setIsVoiceMode(isVoice);
  };

  // This function handles both typed and voice messages
  const handleSendMessage = (msg, isFromVoice) => {
    console.log('Sending message:', msg, 'isFromVoice:', isFromVoice);
    sendMessage(msg, isFromVoice || false);
  };

  // ========== NEW: Handle voice selection change ==========
  const handleVoiceChange = (voiceName) => {
    setSelectedVoiceName(voiceName);
    setShowVoiceDropdown(false);
    console.log('🎤 Voice changed to:', voiceName);
  };

  const displayMessages = getProcessedMessages();

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      >
        <MessageCircle className="w-6 h-6 text-white" />

        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}

        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask WISE 🌟
        </span>
      </button>

      {isOpen && (
        <div
          className={`fixed z-50 bg-white dark:bg-dark-200 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300

          bottom-24 right-4
          w-[95vw] sm:w-[420px]

          ${
            isMinimized
              ? 'h-14'
              : 'h-[75vh] max-h-[650px]'
          }`}
        >
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <span className="text-2xl">🌤️</span>
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  WISE Assistant
                </h3>

                <p className="text-xs opacity-90">
                  Weather Intelligence & Smart Assistant • Online 🟢
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* ========== NEW: Voice selector button ========== */}
              <div className="relative">
                <button
                  onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1"
                  title="Change voice"
                >
                  <Volume2 className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showVoiceDropdown && availableVoices.length > 0 && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 max-h-48 overflow-y-auto bg-white dark:bg-dark-300 rounded-lg shadow-lg z-50">
                    {availableVoices.map((voice) => (
                      <button
                        key={voice.name}
                        onClick={() => handleVoiceChange(voice.name)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors ${
                          selectedVoiceName === voice.name ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : ''
                        }`}
                      >
                        {voice.name}
                        {selectedVoiceName === voice.name && ' ✓'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={clearMessages}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={toggleChat}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 relative"
              >
                {displayMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-dark-300 rounded-2xl rounded-tl-none p-3">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {messages.length <= 1 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2 text-center">
                      ✨ Try these suggestions:
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleSuggestionClick(suggestion)
                          }
                          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <JumpToLatestButton 
                containerRef={messagesContainerRef}
                onJump={jumpToLatest}
                isAtBottom={isAtBottom}
              />

              <ChatInput
                onSendMessage={handleSendMessage}
                onVoiceSubmit={handleVoiceSubmit}
                isLoading={isLoading}
              />

              <div className="px-4 py-1.5 bg-gray-50 dark:bg-dark-300 text-center">
                <p className="text-xs text-gray-400">
                  🔒 Secure • Powered by Gemini AI • Your travel companion
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;