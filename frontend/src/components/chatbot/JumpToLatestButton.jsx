// frontend/src/components/chatbot/JumpToLatestButton.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const JumpToLatestButton = ({ containerRef, onJump, isAtBottom }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Show button when user is more than 150px away from bottom
      const show = distanceFromBottom > 150;
      setIsVisible(show);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  if (!isVisible || isAtBottom) return null;

  return (
    <button
      onClick={onJump}
      className="absolute bottom-20 right-4 z-10 p-2.5 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 hover:scale-110 animate-bounce"
      title="Jump to latest message"
    >
      <ChevronDown className="w-5 h-5" />
    </button>
  );
};

export default JumpToLatestButton;