// frontend/src/components/weather/WeatherChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';

const WeatherChart = ({ forecast }) => {
  // Prepare data for chart
  const chartData = forecast.map(day => ({
    day: day.day,
    temperature: Math.round(day.tempAvg),
    high: Math.round(day.tempHigh),
    low: Math.round(day.tempLow),
    humidity: day.humidity,
    rain: day.rainProbability
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-200 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-dark-300">
          <p className="font-semibold dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}°C
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="day" stroke="#6b7280" />
        <YAxis yAxisId="temp" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
        <YAxis yAxisId="rain" orientation="right" label={{ value: 'Rain Probability (%)', angle: 90, position: 'insideRight' }} stroke="#3b82f6" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          yAxisId="rain"
          type="monotone" 
          dataKey="rain" 
          fill="#93c5fd" 
          stroke="#3b82f6" 
          name="Rain Probability %"
          opacity={0.3}
        />
        <Line 
          yAxisId="temp"
          type="monotone" 
          dataKey="temperature" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Avg Temperature"
        />
        <Line 
          yAxisId="temp"
          type="monotone" 
          dataKey="high" 
          stroke="#f97316" 
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={{ r: 3 }}
          name="High"
        />
        <Line 
          yAxisId="temp"
          type="monotone" 
          dataKey="low" 
          stroke="#3b82f6" 
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={{ r: 3 }}
          name="Low"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default WeatherChart;