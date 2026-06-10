// frontend/src/components/share/ShareButton.jsx
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareModal from './ShareModal';

const ShareButton = ({ routeData, locations, weatherData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!routeData || !locations) return null;
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mb-4"
      >
        <Share2 className="w-4 h-4" />
        Share This Route
      </button>
      
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        routeData={routeData}
        locations={locations}
        weatherData={weatherData}
      />
    </>
  );
};

export default ShareButton;