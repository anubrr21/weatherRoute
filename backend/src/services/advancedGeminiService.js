// backend/src/services/advancedGeminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class AdvancedGeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.chatSessions = new Map();
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      tools: [{
        functionDeclarations: this.getFunctionDeclarations()
      }]
    });
    console.log('✅ Advanced Gemini AI service initialized');
  }

  getFunctionDeclarations() {
    return [
      {
        name: 'getWeather',
        description: 'Get current weather information for a specific city. Supports date references like "today", "tomorrow", "next Monday".',
        parameters: {
          type: 'OBJECT',
          properties: {
            city: { type: 'STRING', description: 'City name' },
            dateReference: { type: 'STRING', description: 'Date reference: today, tomorrow, day after tomorrow, this weekend, next weekend, or specific date like "25 December"' }
          },
          required: ['city']
        }
      },
      {
        name: 'getForecast',
        description: 'Get detailed weather forecast for a city for specific days',
        parameters: {
          type: 'OBJECT',
          properties: {
            city: { type: 'STRING', description: 'City name' },
            days: { type: 'NUMBER', description: 'Number of days (1-5)' }
          },
          required: ['city']
        }
      },
      {
        name: 'planRoute',
        description: 'Plan a detailed route with weather, rest stops, and recommendations. Supports date references.',
        parameters: {
          type: 'OBJECT',
          properties: {
            startLocation: { type: 'STRING', description: 'Starting location' },
            endLocation: { type: 'STRING', description: 'Destination' },
            waypoints: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Optional stops' },
            travelDate: { type: 'STRING', description: 'Travel date reference like "tomorrow", "next weekend", or specific date' }
          },
          required: ['startLocation', 'endLocation']
        }
      },
      {
        name: 'getRouteAlternatives',
        description: 'Get alternative routes with weather comparison',
        parameters: {
          type: 'OBJECT',
          properties: {
            startLocation: { type: 'STRING', description: 'Starting location' },
            endLocation: { type: 'STRING', description: 'Destination' }
          },
          required: ['startLocation', 'endLocation']
        }
      },
      {
        name: 'getWebsiteInfo',
        description: 'Get information about WeatherRoute website features and where to find them',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'What the user is looking for (e.g., "where to find route history")' }
          },
          required: ['query']
        }
      },
      {
        name: 'suggestFeature',
        description: 'Suggest a relevant feature to the user based on context',
        parameters: {
          type: 'OBJECT',
          properties: {
            context: { type: 'STRING', description: 'Current context (e.g., "route planned", "weather searched")' },
            featureName: { type: 'STRING', description: 'Feature to suggest' }
          },
          required: ['context']
        }
      }
    ];
  }

  getSystemPrompt(currentDate, currentDay, currentYear) {
    return `You are WISE (Weather Intelligence & Smart Assistant) - an ultra-intelligent travel companion for WeatherRoute.

## CURRENT DATE CONTEXT
Today is ${currentDate} (${currentDay}) in year ${currentYear}. Use this to understand:
- "today" = ${currentDate}
- "tomorrow" = add 1 day
- "day after tomorrow" = add 2 days
- "this weekend" = upcoming Saturday/Sunday
- "next weekend" = following Saturday/Sunday
- Specific dates like "25 December" = calculate based on current year

## WEBSITE FEATURES YOU KNOW
You have complete knowledge of the WeatherRoute website. Guide users to:
- Dashboard (/dashboard): View favorites, search history, statistics
- Route Planner (/route-planner): Plan routes with weather checkpoints
- Favorites (/favorites): Manage saved locations
- Search History (/search-history): View past weather searches
- Route History (/route-history): View past planned routes
- Weather Search (/): Search any city for current weather and forecast

## FEATURES TO SUGGEST BASED ON CONTEXT
- After planning a route: Suggest "Compare Alternative Routes"
- After weather search: Suggest "View 5-day forecast"
- If route risk > 30: Suggest "Check weather risk analysis"
- If user seems lost: Suggest specific feature

## RESPONSE FORMAT WITH ACTIONS
Include action tags at the END of your response:

For weather: [ACTION:REDIRECT_WEATHER:city]
For route: [ACTION:REDIRECT_ROUTE:start:end:]
For navigation: [ACTION:NAVIGATE:section]
For feature suggestion: [ACTION:SUGGEST:feature_name]

Example weather response:
"It's 27°C and sunny in Jaipur today. Perfect weather for sightseeing! [ACTION:REDIRECT_WEATHER:Jaipur]"

Example route response:
"Route from Delhi to Jaipur is 280km, about 5 hours. [ACTION:REDIRECT_ROUTE:Delhi:Jaipur:]"

## DETAILED ROUTE RESPONSE FORMAT (200-400 words)
When a user asks for a route, provide:
1. Distance and duration (exact numbers)
2. Weather conditions at start, midpoint, destination
3. 2-3 specific rest stops with city names and distances
4. Fuel/petrol station recommendations
5. Food recommendations (local specialties if known)
6. Scenic spots or points of interest
7. Safety tips based on weather
8. Best departure time
9. Packing recommendations
10. Alternative route mention if available

## FALLBACK INSTRUCTIONS
If you cannot complete a request, ALWAYS guide the user to the relevant feature:
- Weather query → "Use the Weather Search bar at the top"
- Route query → "Go to Route Planner"
- History query → "Check your Dashboard or History pages"

Be enthusiastic, use emojis, be specific, be helpful. The user's name is available in context.`;
  }

  // ========== NEW: Method to inject user preferences ==========
  getSystemPromptWithPreferences(currentDate, currentDay, currentYear, userPreferences = null) {
    let prompt = this.getSystemPrompt(currentDate, currentDay, currentYear);
    
    if (userPreferences) {
      prompt += this.getPreferencesPrompt(userPreferences);
    }
    
    return prompt;
  }

  // ========== NEW: Method to format preferences prompt ==========
  getPreferencesPrompt(preferences) {
    if (!preferences) return '';
    
    let prefPrompt = `\n\n## USER TRAVEL PREFERENCES (IMPORTANT - Use these to personalize responses)\n`;
    
    if (preferences.preferredTransport && preferences.preferredTransport !== 'any') {
      prefPrompt += `- Preferred transport: ${preferences.preferredTransport.toUpperCase()}\n`;
    }
    
    if (preferences.avoidTransport && preferences.avoidTransport.length > 0) {
      prefPrompt += `- Avoid: ${preferences.avoidTransport.join(', ').toUpperCase()}\n`;
    }
    
    if (preferences.avoidNightDriving) {
      prefPrompt += `- Does NOT like night driving. Suggest routes that avoid night travel.\n`;
    }
    
    if (preferences.maxDrivingHoursPerDay) {
      prefPrompt += `- Maximum driving hours per day: ${preferences.maxDrivingHoursPerDay} hours\n`;
    }
    
    if (preferences.dietaryPreference && preferences.dietaryPreference !== 'any') {
      prefPrompt += `- Dietary preference: ${preferences.dietaryPreference}\n`;
      prefPrompt += `  → Suggest ${preferences.dietaryPreference} restaurants along the route\n`;
    }
    
    if (preferences.routePreference) {
      prefPrompt += `- Route preference: ${preferences.routePreference}\n`;
    }
    
    if (preferences.budgetCategory && preferences.budgetCategory !== 'moderate') {
      prefPrompt += `- Budget category: ${preferences.budgetCategory.toUpperCase()}\n`;
    }
    
    if (preferences.favoriteDestinations && preferences.favoriteDestinations.length > 0) {
      prefPrompt += `- Favorite destinations: ${preferences.favoriteDestinations.join(', ')}\n`;
    }
    
    if (preferences.regularTrips && preferences.regularTrips.length > 0) {
      prefPrompt += `- Regular trips:\n`;
      for (const trip of preferences.regularTrips) {
        prefPrompt += `  • "${trip.name}": ${trip.startLocation} → ${trip.endLocation} (${trip.preferredDays})\n`;
      }
    }
    
    prefPrompt += `\n**IMPORTANT**: When suggesting trips, prioritize:\n`;
    prefPrompt += `1. The user's preferred transport (${preferences.preferredTransport || 'any'})\n`;
    prefPrompt += `2. ${preferences.avoidNightDriving ? 'AVOID night driving' : 'Night driving is acceptable'}\n`;
    prefPrompt += `3. ${preferences.dietaryPreference !== 'any' ? `Suggest ${preferences.dietaryPreference} food options` : 'No dietary restrictions'}\n`;
    prefPrompt += `4. Keep within ${preferences.budgetCategory || 'moderate'} budget\n\n`;
    
    prefPrompt += `If user says "plan my usual trip", use their regular trips.`;
    
    return prefPrompt;
  }

  async chatWithFunctions(userId, userName, userMessage, executeFunction, userPreferences = null) {
    if (!this.model) {
      return this.getFallbackResponse(userName, false, userMessage);
    }

    try {
      const currentDateObj = new Date();
      const currentDate = currentDateObj.toLocaleDateString('en-IN');
      const currentDay = currentDateObj.toLocaleDateString('en-IN', { weekday: 'long' });
      const currentYear = currentDateObj.getFullYear();
      
      let chat = this.chatSessions.get(userId);
      
      if (!chat) {
        // Build system prompt with user preferences
        let systemPrompt = this.getSystemPrompt(currentDate, currentDay, currentYear);
        if (userPreferences) {
          systemPrompt += this.getPreferencesPrompt(userPreferences);
        }
        
        const personalizedPrompt = userName ? 
          `${systemPrompt}\n\nThe user's name is ${userName}. Always address them by name.` : 
          systemPrompt;
        
        chat = await this.model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: personalizedPrompt }]
            },
            {
              role: 'model',
              parts: [{ text: `Hello${userName ? ' ' + userName : ''}! I'm WISE! Today is ${currentDate} (${currentDay}). I know your travel preferences and will personalize recommendations for you! How can I help with your travel plans today? 🌟🚗` }]
            }
          ]
        });
        this.chatSessions.set(userId, chat);
      }

      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      
      const functionCalls = this.extractFunctionCalls(response);
      
      if (functionCalls && functionCalls.length > 0) {
        const functionResults = [];
        for (const functionCall of functionCalls) {
          const result = await executeFunction(functionCall.name, functionCall.args);
          functionResults.push({
            name: functionCall.name,
            result: result
          });
        }
        
        const functionResponseParts = functionResults.map(fr => ({
          functionResponse: {
            name: fr.name,
            response: { result: fr.result }
          }
        }));
        
        const finalResult = await chat.sendMessage(functionResponseParts);
        const finalResponse = await finalResult.response;
        
        let responseText = finalResponse.text();
        
        const hasRouteFunction = functionCalls.some(fc => fc.name === 'planRoute');
        if (hasRouteFunction && !responseText.includes('[ACTION:REDIRECT_ROUTE:')) {
          const routeData = functionResults.find(fr => fr.name === 'planRoute')?.result;
          if (routeData && !routeData.error) {
            responseText += `\n\n[ACTION:REDIRECT_ROUTE:${routeData.startLocation}:${routeData.endLocation}:]`;
          }
        }
        
        const hasWeatherFunction = functionCalls.some(fc => fc.name === 'getWeather');
        if (hasWeatherFunction && !responseText.includes('[ACTION:REDIRECT_WEATHER:')) {
          const weatherData = functionResults.find(fr => fr.name === 'getWeather')?.result;
          if (weatherData && !weatherData.error && weatherData.city) {
            responseText += `\n\n[ACTION:REDIRECT_WEATHER:${weatherData.city}]`;
          }
        }
        
        return {
          text: responseText,
          functionCalls: functionCalls,
          functionResults: functionResults
        };
      }
      
      let responseText = response.text();
      
      if (responseText.toLowerCase().includes("i don't know") || 
          responseText.toLowerCase().includes("i cannot") ||
          responseText.toLowerCase().includes("i'm not sure") ||
          responseText.toLowerCase().includes("unable to")) {
        return this.getFallbackResponse(userName, false, userMessage);
      }
      
      return {
        text: responseText,
        functionCalls: [],
        functionResults: []
      };
      
    } catch (error) {
      console.error('Gemini chat error:', error);
      const isQuotaError = error.message?.includes('429') || 
                          error.message?.includes('503') ||
                          error.message?.includes('quota') ||
                          error.message?.includes('rate limit');
      
      return this.getFallbackResponse(userName, isQuotaError, userMessage);
    }
  }

  extractFunctionCalls(response) {
    try {
      const candidates = response.candidates;
      if (candidates && candidates[0] && candidates[0].content) {
        const parts = candidates[0].content.parts;
        const functionCalls = [];
        
        for (const part of parts) {
          if (part.functionCall) {
            functionCalls.push({
              name: part.functionCall.name,
              args: part.functionCall.args || {}
            });
          }
        }
        
        return functionCalls;
      }
      return null;
    } catch (error) {
      console.error('Error extracting function calls:', error);
      return null;
    }
  }

  // ========== Enhanced fallback response with weather/route detection ==========
  getFallbackResponse(userName, isQuotaError = false, userMessage = '') {
    const nameGreeting = userName ? `Hey ${userName}! ` : 'Hey there! ';
    
    // Normalize message for better matching (remove filler words, extra spaces)
    const normalizedMessage = userMessage.toLowerCase()
      .replace(/[?,.!]/g, '')
      .replace(/\b(um|uh|ah|like|please|kindly|just|then|so|well)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // ========== IMPROVED: Route detection for voice and text ==========
    const isRouteQuery = 
      normalizedMessage.includes('plan a route') ||
      normalizedMessage.includes('plan route') ||
      normalizedMessage.includes('route from') ||
      normalizedMessage.includes('route between') ||
      normalizedMessage.includes('trip from') ||
      normalizedMessage.includes('travel from') ||
      normalizedMessage.includes('navigate from') ||
      normalizedMessage.includes('way from') ||
      (normalizedMessage.includes('from') && normalizedMessage.includes('to'));
    
    // ========== IMPROVED: Extract start and destination for voice ==========
    let startLocation = '';
    let endLocation = '';
    
    if (isRouteQuery) {
      // Pattern 1: "from X to Y"
      let match = normalizedMessage.match(/(?:from|starting at|starting from)\s+([a-z\s]+?)(?:\s+to\s+|\s+and\s+|\s+then\s+)([a-z\s]+)/i);
      
      // Pattern 2: "between X and Y"
      if (!match) {
        match = normalizedMessage.match(/between\s+([a-z\s]+?)\s+and\s+([a-z\s]+)/i);
      }
      
      // Pattern 3: "X to Y" (no "from")
      if (!match) {
        match = normalizedMessage.match(/^([a-z\s]+?)\s+to\s+([a-z\s]+)$/i);
      }
      
      if (match) {
        startLocation = match[1].trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        endLocation = match[2].trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      
      // Clean up common suffixes
      startLocation = startLocation.replace(/\s+(please|pls|now)$/i, '');
      endLocation = endLocation.replace(/\s+(please|pls|now)$/i, '');
    }
    
    // ========== IMPROVED: Weather detection for voice ==========
    const isWeatherQuery = 
      normalizedMessage.includes('weather') ||
      normalizedMessage.includes('temperature') ||
      normalizedMessage.includes('rain') ||
      normalizedMessage.includes('sunny') ||
      normalizedMessage.includes('cloudy') ||
      normalizedMessage.includes('forecast') ||
      normalizedMessage.includes('humidity') ||
      normalizedMessage.includes('what\'s the weather') ||
      normalizedMessage.includes('what is the weather');
    
    let detectedCity = '';
    if (isWeatherQuery) {
      // Try to extract city name
      let cityPatterns = [
        /weather\s+(?:in|of|for|at)\s+([a-z\s]+?)(?:\?|$)/i,
        /(?:what'?s|what is)\s+the\s+weather\s+(?:in|of|for|at)\s+([a-z\s]+?)(?:\?|$)/i,
        /temperature\s+(?:in|of|for|at)\s+([a-z\s]+?)(?:\?|$)/i,
        /(?:in|at)\s+([a-z\s]+?)\s+weather/i,
        /weather\s+([a-z\s]+?)(?:\?|$)/i
      ];
      
      for (const pattern of cityPatterns) {
        const match = normalizedMessage.match(pattern);
        if (match && match[1]) {
          detectedCity = match[1].trim();
          break;
        }
      }
      
      if (detectedCity) {
        detectedCity = detectedCity.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }
    
    // ========== DETECTION LOGS (for debugging) ==========
    console.log('🔍 Fallback Detection:', {
      originalMessage: userMessage,
      normalizedMessage,
      isRouteQuery,
      startLocation,
      endLocation,
      isWeatherQuery,
      detectedCity
    });
    
    if (isQuotaError) {
      let fallbackMessage = `${nameGreeting}I'm temporarily experiencing high demand. 🌟\n\n`;
      
      if (detectedCity) {
        fallbackMessage += `I see you're asking about weather in ${detectedCity}. You can directly check the weather!\n\n[ACTION:REDIRECT_WEATHER:${detectedCity}]\n\n`;
      } else if (startLocation && endLocation) {
        fallbackMessage += `I see you want to plan a route from ${startLocation} to ${endLocation}.\n\n[ACTION:REDIRECT_ROUTE:${startLocation}:${endLocation}:]\n\n`;
      } else {
        fallbackMessage += `You can still use WeatherRoute directly:\n\n🌤️ **Weather** - Use the search bar at the top\n🗺️ **Routes** - Go to Route Planner\n📊 **Dashboard** - View your stats and history\n\n[ACTION:NAVIGATE:dashboard]\n\n`;
      }
      
      fallbackMessage += `I'll be back to full capacity soon! 🚀`;
      
      return {
        text: fallbackMessage,
        functionCalls: [],
        functionResults: []
      };
    }
    
    // Regular fallback with detection
    let fallbackMessage = `${nameGreeting}I'm WISE, your personal travel assistant! 🌟\n\n`;
    
    if (detectedCity) {
      fallbackMessage += `I see you're asking about the weather in **${detectedCity}**!\n\n🌤️ You can check the complete weather forecast below:\n\n[ACTION:REDIRECT_WEATHER:${detectedCity}]\n\n`;
    } else if (startLocation && endLocation) {
      fallbackMessage += `I see you want to plan a route from **${startLocation}** to **${endLocation}**!\n\n🗺️ Here's your route with weather checkpoints and rest stops:\n\n[ACTION:REDIRECT_ROUTE:${startLocation}:${endLocation}:]\n\n`;
    } else {
      fallbackMessage += `I can help you with:\n• 🌡️ **Real-time weather** for any city\n• 🗺️ **Route planning** with detailed guidance\n• ⚠️ **Weather risk analysis** for safe travel\n• 🚗 **Rest stop recommendations** along your route\n• 🛣️ **Alternative routes** to avoid bad weather\n• 📍 **Website navigation** - I can guide you to any section!\n\nTry asking:\n• "Plan a route from Delhi to Jaipur"\n• "What's the weather in Mumbai today?"\n• "Where can I find my route history?"\n\nHow can I make your journey amazing today? 🚗✨`;
    }
    
    return {
      text: fallbackMessage,
      functionCalls: [],
      functionResults: []
    };
  }
}

export default new AdvancedGeminiService();