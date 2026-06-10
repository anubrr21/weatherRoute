// backend/src/controllers/aiController.js
import catchAsync from '../utils/catchAsync.js';
import geminiService from '../services/geminiService.js';
import aiToolService from '../services/aiToolService.js';

export const chat = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const userId = req.user.id;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Message is required'
    });
  }

  const executeFunction = async (functionName, parameters) => {
    return await aiToolService.executeFunction(functionName, parameters, req.headers.authorization);
  };

  const response = await geminiService.chatWithFunctions(userId, message, executeFunction);
  
  res.status(200).json({
    status: 'success',
    data: {
      message: response.text,
      functionCalls: response.functionCalls,
      functionResults: response.functionResults,
      timestamp: new Date().toISOString()
    }
  });
});

export const clearSession = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  geminiService.clearUserSession(userId);
  
  res.status(200).json({
    status: 'success',
    message: 'Chat session cleared'
  });
});

export const getFunctions = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      functions: [
        'getWeather',
        'getForecast',
        'planRoute',
        'getRouteAlternatives',
        'getAirQuality',
        'getRouteWeatherRisk',
        'searchCities',
        'getTravelRecommendation'
      ]
    }
  });
});