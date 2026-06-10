// frontend/src/components/transport/FlightRouteCard.jsx
import React, { useState } from 'react';
import { Plane, Clock, MapPin, Calendar, ChevronDown, ChevronUp, IndianRupee, Star } from 'lucide-react';

const FlightRouteCard = ({ flight, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="weather-card p-4 mb-3 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg dark:text-white">{flight.airline}</h3>
            <span className="text-xs bg-gray-100 dark:bg-dark-300 px-2 py-1 rounded-full">
              {flight.flightNumber}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs">{flight.rating}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Departure</p>
              <p className="font-semibold dark:text-white">{flight.departureTime}</p>
              <p className="text-xs text-gray-400">{flight.departureAirport}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Duration</p>
              <p className="font-semibold dark:text-white">{flight.duration}</p>
              <p className="text-xs text-gray-400">{flight.stops}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 dark:text-gray-400">Arrival</p>
              <p className="font-semibold dark:text-white">{flight.arrivalTime}</p>
              <p className="text-xs text-gray-400">{flight.arrivalAirport}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-green-600" />
              <span className="font-bold text-lg dark:text-white">{flight.price.toLocaleString()}</span>
              <span className="text-xs text-gray-400">per person</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              flight.cancellationPolicy === 'Free cancellation' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-dark-300'
            }`}>
              {flight.cancellationPolicy}
            </span>
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
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Baggage:</span>
              <p className="font-medium dark:text-white">{flight.baggage}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Currency:</span>
              <p className="font-medium dark:text-white">{flight.currency}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightRouteCard;