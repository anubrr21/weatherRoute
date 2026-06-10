// frontend/src/components/transport/TrainRouteCard.jsx
import React, { useState } from 'react';
import { Train, Clock, MapPin, Calendar, ChevronDown, ChevronUp, IndianRupee } from 'lucide-react';

const TrainRouteCard = ({ train, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="weather-card p-4 mb-3 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Train className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-lg dark:text-white">{train.trainName}</h3>
            <span className="text-xs bg-gray-100 dark:bg-dark-300 px-2 py-1 rounded-full">
              {train.trainNumber}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Departure</p>
              <p className="font-semibold dark:text-white">{train.departureTime}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Duration</p>
              <p className="font-semibold dark:text-white">{train.duration}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 dark:text-gray-400">Arrival</p>
              <p className="font-semibold dark:text-white">{train.arrivalTime}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {train.classes.map((cls, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-300 rounded-full">
                {cls}
              </span>
            ))}
          </div>
          
          <div className={`text-sm text-gray-600 dark:text-gray-400 ${expanded ? '' : 'line-clamp-1'}`}>
            <span className="font-medium">Amenities:</span> {train.amenities.join(', ')}
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-gray-400 hover:text-primary-500"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-dark-300">
          <h4 className="font-semibold dark:text-white mb-2">Fare (Approx)</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(train.fare).map(([cls, price]) => (
              <div key={cls} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{cls.toUpperCase()}:</span>
                <span className="font-semibold dark:text-white flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />{price}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Availability: {train.availability}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainRouteCard;