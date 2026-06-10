// frontend/src/components/chatbot/ChatInput.jsx
import React, { useState } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading, onVoiceSubmit }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      console.log('🟢 Speech recognition started');
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🟢 Voice transcript received:', transcript);
      setInput(transcript);
      setIsListening(false);
      
      setTimeout(() => {
        if (transcript.trim()) {
          console.log('🟢 Calling onVoiceSubmit(true)');
          if (onVoiceSubmit) {
            onVoiceSubmit(true);
          }
          // FIXED: Pass true as the second parameter for voice
          console.log('🟢 Calling onSendMessage with voice flag = true');
          onSendMessage(transcript, true);  // ← CHANGED: Added true as second param
          setInput('');
          setTimeout(() => {
            if (onVoiceSubmit) {
              console.log('🟢 Calling onVoiceSubmit(false)');
              onVoiceSubmit(false);
            }
          }, 500);
        }
      }, 100);
    };

    recognitionInstance.onerror = (event) => {
      console.error('🔴 Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Please allow microphone access to use voice input.');
      }
    };

    recognitionInstance.onend = () => {
      console.log('🟢 Speech recognition ended');
      setIsListening(false);
    };

    return recognitionInstance;
  };

  const handleVoiceInput = () => {
    console.log('🔵 handleVoiceInput called, isListening:', isListening);
    
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      return;
    }

    const newRecognition = initSpeechRecognition();
    if (newRecognition) {
      setRecognition(newRecognition);
      newRecognition.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔵 handleSubmit called, input:', input);
    if (input.trim() && !isLoading) {
      // FIXED: Pass false for typed messages (not voice)
      onSendMessage(input, false);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-dark-300">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask WISE about weather, routes, travel tips..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-200 dark:text-white"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-2 rounded-lg transition-colors ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-200'
          }`}
          disabled={isLoading}
          title={isListening ? 'Stop listening' : 'Voice input'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          type="submit"
          className="p-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-400">
          💡 Try: "Plan a route from Delhi to Jaipur" | "Weather in Mumbai" | "Is it safe to travel?"
        </p>
        {isListening && (
          <span className="text-xs text-red-500 animate-pulse">
            🎤 Listening...
          </span>
        )}
      </div>
    </form>
  );
};

export default ChatInput;