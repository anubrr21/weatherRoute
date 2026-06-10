// backend/src/services/airportService.js
/**
 * Airport Service - Converts city names to airport codes
 * No API calls - pure mapping
 */
class AirportService {
  constructor() {
    // Comprehensive airport database for Indian and major international cities
    this.airports = {
      // Indian Cities
      'delhi': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
      'new delhi': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
      'ncr': { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
      'mumbai': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
      'bombay': { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
      'kolkata': { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata' },
      'calcutta': { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata' },
      'chennai': { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai' },
      'madras': { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai' },
      'bangalore': { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore' },
      'bengaluru': { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore' },
      'hyderabad': { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad' },
      'pune': { code: 'PNQ', name: 'Pune International Airport', city: 'Pune' },
      'jaipur': { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur' },
      'ahmedabad': { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad' },
      'goa': { code: 'GOI', name: 'Goa International Airport', city: 'Goa' },
      'kochi': { code: 'COK', name: 'Cochin International Airport', city: 'Kochi' },
      'cochin': { code: 'COK', name: 'Cochin International Airport', city: 'Kochi' },
      'trivandrum': { code: 'TRV', name: 'Trivandrum International Airport', city: 'Thiruvananthapuram' },
      'lucknow': { code: 'LKO', name: 'Chaudhary Charan Singh Airport', city: 'Lucknow' },
      'guwahati': { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi Airport', city: 'Guwahati' },
      'patna': { code: 'PAT', name: 'Jay Prakash Narayan Airport', city: 'Patna' },
      'bhubaneswar': { code: 'BBI', name: 'Biju Patnaik Airport', city: 'Bhubaneswar' },
      'vizag': { code: 'VTZ', name: 'Visakhapatnam Airport', city: 'Visakhapatnam' },
      'visakhapatnam': { code: 'VTZ', name: 'Visakhapatnam Airport', city: 'Visakhapatnam' },
      'coimbatore': { code: 'CJB', name: 'Coimbatore International Airport', city: 'Coimbatore' },
      'nagpur': { code: 'NAG', name: 'Dr. Babasaheb Ambedkar Airport', city: 'Nagpur' },
      'indore': { code: 'IDR', name: 'Devi Ahilya Bai Holkar Airport', city: 'Indore' },
      'bhopal': { code: 'BHO', name: 'Raja Bhoj Airport', city: 'Bhopal' },
      'vadodara': { code: 'BDQ', name: 'Vadodara Airport', city: 'Vadodara' },
      'surat': { code: 'STV', name: 'Surat Airport', city: 'Surat' },
      'udaipur': { code: 'UDR', name: 'Maharana Pratap Airport', city: 'Udaipur' },
      'jodhpur': { code: 'JDH', name: 'Jodhpur Airport', city: 'Jodhpur' },
      'chandigarh': { code: 'IXC', name: 'Chandigarh Airport', city: 'Chandigarh' },
      'amritsar': { code: 'ATQ', name: 'Sri Guru Ram Dass Jee Airport', city: 'Amritsar' },
      'srinagar': { code: 'SXR', name: 'Srinagar Airport', city: 'Srinagar' },
      'leh': { code: 'IXL', name: 'Kushok Bakula Rimpochee Airport', city: 'Leh' },
      'port blair': { code: 'IXZ', name: 'Veer Savarkar Airport', city: 'Port Blair' },
      
      // International Cities
      'dubai': { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
      'london': { code: 'LHR', name: 'Heathrow Airport', city: 'London' },
      'new york': { code: 'JFK', name: 'John F. Kennedy Airport', city: 'New York' },
      'nyc': { code: 'JFK', name: 'John F. Kennedy Airport', city: 'New York' },
      'singapore': { code: 'SIN', name: 'Changi Airport', city: 'Singapore' },
      'kuala lumpur': { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur' },
      'bangkok': { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok' },
      'paris': { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
      'frankfurt': { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
      'tokyo': { code: 'HND', name: 'Haneda Airport', city: 'Tokyo' },
      'hong kong': { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong' },
      'sydney': { code: 'SYD', name: 'Sydney Airport', city: 'Sydney' },
      'melbourne': { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne' },
      'toronto': { code: 'YYZ', name: 'Toronto Pearson Airport', city: 'Toronto' },
      'san francisco': { code: 'SFO', name: 'San Francisco Airport', city: 'San Francisco' }
    };
  }

  getAirportCode(cityName) {
    if (!cityName) return null;
    
    const lowerCity = cityName.toLowerCase().trim();
    
    // Direct match
    if (this.airports[lowerCity]) {
      return this.airports[lowerCity];
    }
    
    // Partial match - check if city name contains any key or vice versa
    for (const [key, airport] of Object.entries(this.airports)) {
      if (lowerCity.includes(key) || key.includes(lowerCity)) {
        return airport;
      }
    }
    
    // If still not found, return null
    console.log(`⚠️ Airport code not found for: ${cityName}`);
    return null;
  }

  getAirportByCode(code) {
    if (!code) return null;
    const upperCode = code.toUpperCase();
    for (const [key, airport] of Object.entries(this.airports)) {
      if (airport.code === upperCode) {
        return airport;
      }
    }
    return null;
  }

  getAllAirports() {
    return this.airports;
  }
}

export default new AirportService();