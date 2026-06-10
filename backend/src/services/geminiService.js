// backend/src/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.chatSessions = new Map(); // Store chat sessions per user
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      tools: [{
        functionDeclarations: this.getFunctionDeclarations()
      }]
    });
    console.log('✅ Gemini AI service initialized with Function Calling');
  }

  getFunctionDeclarations() {
    return [
      {
        name: 'getWeather',
        description: 'Get current weather information for a specific city or coordinates',
        parameters: {
          type: 'OBJECT',
          properties: {
            city: {
              type: 'STRING',
              description: 'The name of the city to get weather for (e.g., "Mumbai", "New York")'
            },
            lat: {
              type: 'NUMBER',
              description: 'Latitude coordinate (alternative to city name)'
            },
            lon: {
              type: 'NUMBER',
              description: 'Longitude coordinate (alternative to city name)'
            }
          },
          required: ['city']
        }
      },
      {
        name: 'getForecast',
        description: 'Get 5-day weather forecast for a specific city',
        parameters: {
          type: 'OBJECT',
          properties: {
            city: {
              type: 'STRING',
              description: 'The name of the city to get forecast for'
            },
            days: {
              type: 'NUMBER',
              description: 'Number of days for forecast (default: 5)'
            }
          },
          required: ['city']
        }
      },
      {
        name: 'planRoute',
        description: 'Plan a driving route between two locations with weather information along the route',
        parameters: {
          type: 'OBJECT',
          properties: {
            startLocation: {
              type: 'STRING',
              description: 'Starting location name or address'
            },
            endLocation: {
              type: 'STRING',
              description: 'Destination location name or address'
            },
            waypoints: {
              type: 'ARRAY',
              description: 'Optional intermediate stops along the route',
              items: {
                type: 'STRING'
              }
            }
          },
          required: ['startLocation', 'endLocation']
        }
      },
      {
        name: 'getRouteAlternatives',
        description: 'Get alternative routes between two locations with weather risk comparison',
        parameters: {
          type: 'OBJECT',
          properties: {
            startLocation: {
              type: 'STRING',
              description: 'Starting location name or address'
            },
            endLocation: {
              type: 'STRING',
              description: 'Destination location name or address'
            }
          },
          required: ['startLocation', 'endLocation']
        }
      },
      {
        name: 'getAirQuality',
        description: 'Get air quality index (AQI) for a specific city',
        parameters: {
          type: 'OBJECT',
          properties: {
            city: {
              type: 'STRING',
              description: 'The name of the city to get air quality for'
            },
            lat: {
              type: 'NUMBER',
              description: 'Latitude coordinate'
            },
            lon: {
              type: 'NUMBER',
              description: 'Longitude coordinate'
            }
          },
          required: ['city']
        }
      },
      {
        name: 'getRouteWeatherRisk',
        description: 'Get weather risk analysis for an existing or planned route',
        parameters: {
          type: 'OBJECT',
          properties: {
            startLocation: {
              type: 'STRING',
              description: 'Starting location name or address'
            },
            endLocation: {
              type: 'STRING',
              description: 'Destination location name or address'
            }
          },
          required: ['startLocation', 'endLocation']
        }
      },
      {
        name: 'searchCities',
        description: 'Search for cities by name (autocomplete)',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description: 'Partial city name to search for'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'getTravelRecommendation',
        description: 'Get travel recommendation based on weather conditions along a route',
        parameters: {
          type: 'OBJECT',
          properties: {
            startLocation: {
              type: 'STRING',
              description: 'Starting location'
            },
            endLocation: {
              type: 'STRING',
              description: 'Destination location'
            },
            travelDate: {
              type: 'STRING',
              description: 'Date of travel (optional)'
            }
          },
          required: ['startLocation', 'endLocation']
        }
      }
    ];
  }

  getSystemPrompt() {
    return `You are WISE (Weather Intelligence & Smart Assistant), a professional travel and weather assistant for the WeatherRoute application.

Your personality:
- Friendly, helpful, and professional
- Provide accurate weather and travel advice
- Keep responses concise but informative
- Use emojis occasionally for better engagement
- Always use the available functions to get real data instead of making assumptions

When responding:
1. If a user asks about weather, call getWeather()
2. If a user asks about forecast, call getForecast()  
3. If a user asks to plan a route, call planRoute()
4. If a user asks for alternative routes, call getRouteAlternatives()
5. If a user asks about air quality, call getAirQuality()
6. If a user asks about travel safety or recommendations, call getTravelRecommendation()

Always format responses in a user-friendly way with relevant emojis. Keep responses under 150 words when possible.`;

  }

  async chatWithFunctions(userId, userMessage, executeFunction) {
    if (!this.model) {
      return this.getFallbackResponse();
    }

    try {
      // Get or create chat session for this user
      let chat = this.chatSessions.get(userId);
      
      if (!chat) {
        chat = await this.model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: this.getSystemPrompt() }]
            },
            {
              role: 'model',
              parts: [{ text: 'Understood. I am WISE, your weather and travel assistant. I will use the available functions to provide accurate information.' }]
            }
          ]
        });
        this.chatSessions.set(userId, chat);
      }

      // Send user message
      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      
      // Check if Gemini wants to call a function
      const functionCalls = this.extractFunctionCalls(response);
      
      if (functionCalls && functionCalls.length > 0) {
        // Execute the function calls
        const functionResults = [];
        for (const functionCall of functionCalls) {
          const result = await executeFunction(functionCall.name, functionCall.args);
          functionResults.push({
            name: functionCall.name,
            result: result
          });
        }
        
        // Send function results back to Gemini
        const functionResponseParts = functionResults.map(fr => ({
          functionResponse: {
            name: fr.name,
            response: { result: fr.result }
          }
        }));
        
        const finalResult = await chat.sendMessage(functionResponseParts);
        const finalResponse = await finalResult.response;
        
        return {
          text: finalResponse.text(),
          functionCalls: functionCalls,
          functionResults: functionResults
        };
      }
      
      return {
        text: response.text(),
        functionCalls: [],
        functionResults: []
      };
      
    } catch (error) {
      console.error('Gemini chat error:', error);
      return {
        text: this.getFallbackResponse(),
        functionCalls: [],
        functionResults: [],
        error: true
      };
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

  getFallbackResponse() {
    return {
      text: "I'm WISE, your weather travel assistant! 🌤️\n\nI can help you with:\n• 🌡️ Current weather & forecasts\n• 🗺️ Route planning with weather checkpoints\n• ⚠️ Weather risk analysis\n• 🚗 Alternative route suggestions\n\nHow can I help you today?",
      functionCalls: [],
      functionResults: []
    };
  }

  clearUserSession(userId) {
    this.chatSessions.delete(userId);
  }
}

export default new GeminiService();