// frontend/src/services/chatService.js
import api from './api';

class ChatService {
  async sendMessage(message, context = {}) {
    try {
      const response = await api.post('/ai/chat', {
        message,
        context
      });
      return response.data.data;
    } catch (error) {
      console.error('Chat error:', error);
      
      // Check if it's a quota/rate limit error
      const isQuotaError = error.response?.status === 429 || 
                          error.response?.status === 503 ||
                          error.message?.includes('quota') ||
                          error.message?.includes('rate limit');
      
      if (isQuotaError) {
        return {
          message: "🌟 I'm experiencing high demand right now! But don't worry - you can still use WeatherRoute directly:\n\n🌤️ **Weather** - Use the search bar at the top\n🗺️ **Routes** - Go to Route Planner\n📊 **Dashboard** - View your stats and history\n\n[ACTION:NAVIGATE:dashboard]\n\nI'll be back to full capacity soon! 🚀",
          error: false,
          fallback: true
        };
      }
      
      return {
        message: "I'm having trouble connecting right now. Please check your connection and try again. In the meantime, you can use the weather search or route planner directly! 🌤️\n\n[ACTION:NAVIGATE:dashboard]",
        error: true
      };
    }
  }

  async clearSession() {
    try {
      await api.delete('/ai/session');
      return true;
    } catch (error) {
      console.error('Clear session error:', error);
      return false;
    }
  }
}

export default new ChatService();