// backend/src/controllers/advancedAIController.js
import catchAsync from '../utils/catchAsync.js';
import advancedGeminiService from '../services/advancedGeminiService.js';
import enhancedAIToolService from '../services/enhancedAIToolService.js';

export const chat = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const userId = req.user.id;
  const userName = req.user.username;
  
  // Fetch user preferences
  const userPreferences = req.user.travelPreferences || null;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Message is required'
    });
  }

  const executeFunction = async (functionName, parameters) => {
    return await enhancedAIToolService.executeFunction(functionName, parameters, req.headers.authorization);
  };

  // Pass preferences to gemini service
  const response = await advancedGeminiService.chatWithFunctions(
    userId, 
    userName, 
    message, 
    executeFunction,
    userPreferences  // ← ADD THIS
  );
  
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
  advancedGeminiService.clearUserSession(userId);
  
  res.status(200).json({
    status: 'success',
    message: 'Chat session cleared'
  });
});