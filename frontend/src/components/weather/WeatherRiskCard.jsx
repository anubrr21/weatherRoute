// frontend/src/components/weather/WeatherRiskCard.jsx
import React from 'react';
import { AlertTriangle, Wind, CloudRain, Eye, Thermometer, Shield } from 'lucide-react';
import { getRiskLevel, getDrivingRecommendation } from '../../utils/weatherUtils';

const WeatherRiskCard = ({ riskAnalysis, weatherSummary }) => {
  if (!riskAnalysis) return null;
  
  const riskLevel = getRiskLevel(riskAnalysis.score);
  
  return (
    <div className="space-y-4">
      {/* Overall Risk Score */}
      <div className={`p-4 rounded-lg ${riskLevel.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${riskLevel.color}`} />
            <span className={`font-semibold ${riskLevel.color}`}>
              {riskLevel.text}
            </span>
          </div>
          <span className="text-2xl font-bold">{Math.round(riskAnalysis.score)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-current rounded-full h-2 transition-all duration-500"
            style={{ 
              width: `${riskAnalysis.score}%`,
              backgroundColor: riskAnalysis.score < 30 ? '#10B981' : riskAnalysis.score < 60 ? '#F59E0B' : '#EF4444'
            }}
          />
        </div>
      </div>
      
      {/* Weather Summary */}
      {weatherSummary && (
        <div className="space-y-2">
          <h3 className="font-semibold dark:text-white">Route Weather Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-dark-300 rounded">
              <span className="text-gray-600 dark:text-gray-400">Primary Condition</span>
              <span className="font-medium dark:text-white">{weatherSummary.primaryCondition}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-dark-300 rounded">
              <span className="text-gray-600 dark:text-gray-400">Avg Temperature</span>
              <span className="font-medium dark:text-white">{weatherSummary.averageTemperature}°C</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-dark-300 rounded">
              <span className="text-gray-600 dark:text-gray-400">Temp Range</span>
              <span className="font-medium dark:text-white">{weatherSummary.temperatureRange.min}° - {weatherSummary.temperatureRange.max}°</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-dark-300 rounded">
              <span className="text-gray-600 dark:text-gray-400">Max Wind</span>
              <span className="font-medium dark:text-white">{weatherSummary.maxWindSpeed} m/s</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Warnings */}
      {riskAnalysis.warnings && riskAnalysis.warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Weather Warnings
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {riskAnalysis.warnings.map((warning, idx) => (
              <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">At {warning.distance}km: </span>
                  {warning.warnings.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommendations */}
      {riskAnalysis.recommendations && riskAnalysis.recommendations.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold dark:text-white">Travel Recommendations</h3>
          <ul className="space-y-1">
            {riskAnalysis.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Weather Summary Recommendation */}
      {weatherSummary && weatherSummary.recommendation && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 {weatherSummary.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherRiskCard;