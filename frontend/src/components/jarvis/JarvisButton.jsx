// frontend/src/components/jarvis/JarvisButton.jsx
import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useJarvis } from '../../context/JarvisContext';

const JarvisButton = () => {
  const { isEnabled, isListening, wakeWordDetected, enableJarvis, disableJarvis } = useJarvis();

  return (
    <button
      onClick={isEnabled ? disableJarvis : enableJarvis}
      className={`fixed bottom-24 left-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group ${
        isEnabled 
          ? wakeWordDetected 
            ? 'bg-green-500 animate-pulse'
            : isListening 
              ? 'bg-yellow-500' 
              : 'bg-primary-500'
          : 'bg-gray-500'
      }`}
      title={isEnabled ? 'Jarvis Mode ON - Click to OFF' : 'Jarvis Mode OFF - Click to ON'}
    >
      {isEnabled ? (
        wakeWordDetected ? (
          <Volume2 className="w-5 h-5 text-white animate-pulse" />
        ) : isListening ? (
          <Mic className="w-5 h-5 text-white animate-pulse" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )
      ) : (
        <MicOff className="w-5 h-5 text-white" />
      )}
      
      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {isEnabled ? 'Jarvis Mode: ON' : 'Jarvis Mode: OFF'}
        {isEnabled && wakeWordDetected && ' - Listening...'}
      </span>
    </button>
  );
};

export default JarvisButton;