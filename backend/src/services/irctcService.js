// backend/src/services/irctcService.js
import axios from 'axios';

/**
 * IRCTC Service - Real train data from RapidAPI
 */
class IRCTCService {
  constructor() {
    this.apiKey = process.env.IRCTC_API_KEY;
    this.apiHost = process.env.IRCTC_API_HOST;
    this.baseUrl = `https://${this.apiHost}`;
  }

  async searchTrains(source, destination, date) {
    if (!this.apiKey) {
      console.log('⚠️ IRCTC_API_KEY not found, using mock data');
      return { success: false, isMock: true, message: 'API key not configured' };
    }

    try {
      // Get station codes from direct mapping (no API call)
      const sourceCode = this.getStationCodeDirect(source);
      const destCode = this.getStationCodeDirect(destination);
      
      console.log(`🔍 Searching trains from ${sourceCode} to ${destCode} on ${date || this.getTodayDate()}`);
      
      const response = await axios.get(`${this.baseUrl}/api/v3/trainBetweenStations`, {
        params: {
          fromStation: sourceCode,
          toStation: destCode,
          date: date || this.getTodayDate()
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`✅ IRCTC API response status: ${response.status}`);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        return {
          success: true,
          isMock: false,
          data: response.data
        };
      }
      
      return { success: false, isMock: true, message: 'No trains found for this route' };
      
    } catch (error) {
      console.error('IRCTC API error:', error.response?.status, error.response?.data?.message || error.message);
      return {
        success: false,
        isMock: true,
        message: `API error: ${error.response?.status || 'unknown'}`,
        error: true
      };
    }
  }

  // DIRECT station code mapping - NO API CALL
  getStationCodeDirect(cityName) {
    const stations = {
      // Major stations
      'delhi': 'NDLS', 'new delhi': 'NDLS', 'old delhi': 'DLI',
      'mumbai': 'CSTM', 'mumbai central': 'CSTM', 'bandra': 'BDTS', 'dadar': 'DR',
      'kolkata': 'HWH', 'howrah': 'HWH', 'sealdah': 'SDAH',
      'chennai': 'MAS', 'chennai central': 'MAS', 'egmore': 'MS',
      'bangalore': 'SBC', 'bengaluru': 'SBC', 'yesvantpur': 'YPR',
      'hyderabad': 'HYB', 'secunderabad': 'SC', 'kacheguda': 'KCG',
      'pune': 'PUNE',
      'jaipur': 'JP',
      'ahmedabad': 'ADI',
      'lucknow': 'LKO',
      'kanpur': 'CNB',
      'agra': 'AGC',
      'varanasi': 'BSB',
      'patna': 'PNBE',
      'bhopal': 'BPL',
      'indore': 'INDB',
      'nagpur': 'NGP',
      'surat': 'ST',
      'vadodara': 'BRC',
      'coimbatore': 'CBE',
      'kochi': 'ERS',
      'goa': 'MAO',
      'chandigarh': 'CDG',
      'dehradun': 'DDN',
      'amritsar': 'ASR',
      'lucknow': 'LKO',
      'jodhpur': 'JU',
      'udaipur': 'UDZ',
      'mysore': 'MYS',
      'mangalore': 'MAQ',
      'trivandrum': 'TVC',
      'vizag': 'VSKP', 'visakhapatnam': 'VSKP',
      'bhubaneswar': 'BBS',
      'guwahati': 'GHY',
      'srinagar': 'SINA',
      'jammu': 'JAT',
      'haridwar': 'HW',
      'rishikesh': 'RKSH',
      'mathura': 'MTJ',
      'allahabad': 'ALD', 'prayagraj': 'PRYJ',
      'gorakhpur': 'GKP',
      'muzaffarpur': 'MFP',
      'darbhanga': 'DBG',
      'bhagalpur': 'BGP',
      'ranchi': 'RNC',
      'jamshedpur': 'TATA',
      'dhanbad': 'DHN',
      'raipur': 'R',
      'bilaspur': 'BSP',
      'jabalpur': 'JBP',
      'ujjain': 'UJN',
      'gwalior': 'GWL',
      'jhansi': 'JHS',
      'solapur': 'SUR',
      'kolhapur': 'KOP',
      'nashik': 'NK',
      'aurangabad': 'AWB',
      'nalanda': 'NLD',
      'bodhgaya': 'GAYA'
    };
    
    const lowerCity = cityName.toLowerCase().trim();
    
    // Direct match
    if (stations[lowerCity]) return stations[lowerCity];
    
    // Try partial match (e.g., "new delhi" -> "NDLS")
    for (const [key, code] of Object.entries(stations)) {
      if (lowerCity.includes(key) || key.includes(lowerCity)) {
        return code;
      }
    }
    
    // Fallback: return uppercase first 4 letters
    const fallback = cityName.substring(0, 4).toUpperCase();
    console.log(`⚠️ Station code not found for "${cityName}", using fallback: ${fallback}`);
    return fallback;
  }

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}

export default new IRCTCService();