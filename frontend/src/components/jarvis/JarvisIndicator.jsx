// frontend/src/components/jarvis/JarvisIndicator.jsx
import React from 'react';
import { useJarvis } from '../../context/JarvisContext';

const JarvisIndicator = () => {
  const { isEnabled, isListening, wakeWordDetected, lastCommand } = useJarvis();

  if (!isEnabled) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
        wakeWordDetected 
          ? 'bg-green-500' 
          : isListening 
            ? 'bg-yellow-500' 
            : 'bg-primary-500'
      } text-white text-sm`}>
        <div className={`w-2 h-2 rounded-full ${
          wakeWordDetected 
            ? 'bg-white animate-ping' 
            : isListening 
              ? 'bg-white animate-pulse' 
              : 'bg-white'
        }`} />
        <span>
          {wakeWordDetected 
            ? 'Listening...' 
            : isListening 
              ? 'Jarvis Active' 
              : 'Jarvis Ready'}
        </span>
      </div>
      {lastCommand && (
        <div className="mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg max-w-xs">
          Command: {lastCommand}
        </div>
      )}
    </div>
  );
};

export default JarvisIndicator;