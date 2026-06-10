// frontend/src/components/transport/TransportTabs.jsx
import React, { useState } from 'react';
import { Car, Train, Plane, AlertCircle } from 'lucide-react';
import TrainRouteCard from './TrainRouteCard';
import FlightRouteCard from './FlightRouteCard';

const TransportTabs = ({ roadData, trainData, flightData, isLoading, onRoadSelect }) => {
  const [activeTab, setActiveTab] = useState('road');
  
  const tabs = [
    { id: 'road', label: 'Road', icon: <Car className="w-4 h-4" />, count: roadData ? 1 : 0 },
    { id: 'train', label: 'Train', icon: <Train className="w-4 h-4" />, count: trainData?.trains?.length || 0 },
    { id: 'flight', label: 'Flight', icon: <Plane className="w-4 h-4" />, count: flightData?.flights?.length || 0 }
  ];
  
  if (isLoading) {
    return (
      <div className="weather-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-3"></div>
        <p className="text-gray-500">Loading transport options...</p>
      </div>
    );
  }
  
  return (
    <div className="weather-card overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 dark:border-dark-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-300'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
            {tab.count > 0 && (
              <span className="text-xs bg-gray-200 dark:bg-dark-300 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="p-4">
        {/* Road Tab - Preserve existing road route display */}
        {activeTab === 'road' && (
          <div>
            {roadData ? (
              <div>
                {/* This is where the existing road route content will go */}
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Distance: {roadData.distance?.text || 'N/A'} | Duration: {roadData.duration?.text || 'N/A'}
                </p>
                {/* The existing road route details will be rendered by the parent component */}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Plan a road route first</p>
              </div>
            )}
          </div>
        )}
        
        {/* Train Tab */}
        {activeTab === 'train' && (
          <div>
            {trainData?.trains?.length > 0 ? (
              <div>
                {trainData.isMockData && (
                  <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-lg">
                    ℹ️ {trainData.message}
                  </div>
                )}
                <div className="max-h-96 overflow-y-auto">
                  {trainData.trains.map((train, idx) => (
                    <TrainRouteCard key={idx} train={train} index={idx} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Train className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No trains found for this route</p>
              </div>
            )}
          </div>
        )}
        
        {/* Flight Tab */}
        {activeTab === 'flight' && (
          <div>
            {flightData?.flights?.length > 0 ? (
              <div>
                {flightData.isMockData && (
                  <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-lg">
                    ℹ️ {flightData.message}
                  </div>
                )}
                <div className="max-h-96 overflow-y-auto">
                  {flightData.flights.map((flight, idx) => (
                    <FlightRouteCard key={idx} flight={flight} index={idx} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No flights found for this route</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportTabs;