// frontend/src/services/transportService.js
import api from './api';

const transportService = {
  /**
   * Get all transport options (Road, Train, Flight)
   */
  getAllTransportOptions: async ({ startLocation, endLocation, travelDate }) => {
    try {
      const response = await api.post('/transport/all', {
        startLocation,
        endLocation,
        travelDate
      });
      return response.data.data;
    } catch (error) {
      console.error('Transport options error:', error);
      throw error;
    }
  }
};

export default transportService;