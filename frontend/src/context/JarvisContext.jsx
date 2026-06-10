// frontend/src/context/JarvisContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import jarvisService from '../services/jarvisService';
import toast from 'react-hot-toast';

const JarvisContext = createContext();

export const useJarvis = () => {
  const context = useContext(JarvisContext);
  if (!context) {
    throw new Error('useJarvis must be used within JarvisProvider');
  }
  return context;
};

export const JarvisProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const commandHandlerRef = useRef(null);

  useEffect(() => {
    // Initialize jarvis service
    jarvisService.init();
    
    // Set up command handler
    jarvisService.onCommand((command) => {
      setLastCommand(command);
      if (commandHandlerRef.current) {
        commandHandlerRef.current(command);
      }
    });
    
    jarvisService.onWakeWord(() => {
      setWakeWordDetected(true);
      toast.success('🎤 WISE is listening...', { duration: 2000 });
      setTimeout(() => setWakeWordDetected(false), 3000);
    });
    
    // Update listening status
    const interval = setInterval(() => {
      const status = jarvisService.getStatus();
      setIsListening(status.isListening);
    }, 500);
    
    return () => {
      clearInterval(interval);
      if (isEnabled) {
        jarvisService.stop();
      }
    };
  }, []);

  const enableJarvis = () => {
    const success = jarvisService.start();
    if (success) {
      setIsEnabled(true);
      toast.success('🎙️ Jarvis Mode Activated! Say "WISE" followed by your command', {
        duration: 5000,
        icon: '🎙️'
      });
    } else {
      toast.error('Voice recognition not supported in this browser');
    }
  };

  const disableJarvis = () => {
    jarvisService.stop();
    setIsEnabled(false);
    setIsListening(false);
    setWakeWordDetected(false);
    toast.success('Jarvis Mode Deactivated');
  };

  const setCommandHandler = (handler) => {
    commandHandlerRef.current = handler;
  };

  const value = {
    isEnabled,
    isListening,
    wakeWordDetected,
    lastCommand,
    enableJarvis,
    disableJarvis,
    setCommandHandler
  };

  return (
    <JarvisContext.Provider value={value}>
      {children}
    </JarvisContext.Provider>
  );
};