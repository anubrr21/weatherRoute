// backend/src/services/flightService.js
import axios from 'axios';
import airportService from './airportService.js';

/**
 * Flight Service - REAL data from AviationStack API
 * Get free API key: https://aviationstack.com/signup/free
 */
class FlightService {
  constructor() {
    this.apiKey = process.env.AVIATIONSTACK_API_KEY;
    this.baseUrl = 'http://api.aviationstack.com/v1';
  }

  async getFlightRoutes(startLocation, endLocation, travelDate) {
    const departureAirport = airportService.getAirportCode(startLocation);
    const arrivalAirport = airportService.getAirportCode(endLocation);
    
    if (!departureAirport || !arrivalAirport) {
      return this.getFallbackFlights(startLocation, endLocation, departureAirport, arrivalAirport);
    }
    
    console.log(`✈️ Fetching REAL flights from ${departureAirport.code} to ${arrivalAirport.code}`);
    
    // Try real API
    if (this.apiKey) {
      const realFlights = await this.fetchRealFlights(departureAirport.code, arrivalAirport.code);
      if (realFlights && realFlights.length > 0) {
        return this.formatRealFlights(realFlights, startLocation, endLocation, departureAirport, arrivalAirport);
      }
    }
    
    // Fallback to realistic data
    return this.getFallbackFlights(startLocation, endLocation, departureAirport, arrivalAirport);
  }

  async fetchRealFlights(departureCode, arrivalCode) {
    try {
      const response = await axios.get(`${this.baseUrl}/flights`, {
        params: {
          access_key: this.apiKey,
          dep_icao: departureCode,
          arr_icao: arrivalCode,
          limit: 20,
          flight_status: 'scheduled'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.data) {
        const flights = response.data.data.filter(f => 
          f.flight_status === 'scheduled' || f.flight_status === 'active'
        );
        console.log(`✅ Found ${flights.length} real flights`);
        return flights;
      }
      return [];
    } catch (error) {
      console.error('AviationStack error:', error.message);
      return [];
    }
  }

  formatRealFlights(flights, start, end, depAirport, arrAirport) {
    const formatted = flights.slice(0, 20).map(flight => ({
      airline: flight.airline?.name || 'Unknown',
      flightNumber: flight.flight?.iata || flight.flight?.number || 'XXXX',
      departureAirport: depAirport.code,
      arrivalAirport: arrAirport.code,
      departureTime: this.formatTime(flight.departure?.scheduled),
      arrivalTime: this.formatTime(flight.arrival?.scheduled),
      duration: this.calculateDuration(flight.departure?.scheduled, flight.arrival?.scheduled),
      stops: flight.flight?.codes_shared ? '1 stop' : 'Non-stop',
      price: this.estimatePrice(start, end),
      currency: 'INR',
      rating: 4.0,
      status: flight.flight_status || 'Scheduled',
      isReal: true
    }));
    
    return {
      success: true,
      source: start,
      destination: end,
      flights: formatted,
      isRealData: true,
      count: formatted.length,
      message: `✈️ ${formatted.length} real flights found`
    };
  }

  getFallbackFlights(start, end, depAirport, arrAirport) {
    // Realistic flight data for popular routes
    const routeKey = `${start.toLowerCase()}-${end.toLowerCase()}`;
    
    const routeData = {
      'delhi-mumbai': [
        { airline: 'IndiGo', flight: '6E 213', dep: '06:00', arr: '08:00', price: 3899 },
        { airline: 'Air India', flight: 'AI 863', dep: '07:15', arr: '09:15', price: 4520 },
        { airline: 'SpiceJet', flight: 'SG 872', dep: '08:30', arr: '10:30', price: 3599 },
        { airline: 'Vistara', flight: 'UK 944', dep: '09:45', arr: '11:45', price: 4899 },
        { airline: 'Akasa Air', flight: 'QP 1526', dep: '11:00', arr: '13:00', price: 3999 },
        { airline: 'IndiGo', flight: '6E 534', dep: '13:15', arr: '15:15', price: 4199 },
        { airline: 'Air India', flight: 'AI 102', dep: '15:30', arr: '17:30', price: 4980 },
        { airline: 'SpiceJet', flight: 'SG 245', dep: '17:45', arr: '19:45', price: 3799 },
        { airline: 'Vistara', flight: 'UK 981', dep: '20:00', arr: '22:00', price: 5299 }
      ],
      'delhi-bangalore': [
        { airline: 'IndiGo', flight: '6E 405', dep: '05:30', arr: '08:00', price: 5499 },
        { airline: 'Air India', flight: 'AI 506', dep: '07:00', arr: '09:30', price: 5999 },
        { airline: 'SpiceJet', flight: 'SG 123', dep: '09:30', arr: '12:00', price: 5199 },
        { airline: 'Akasa Air', flight: 'QP 1608', dep: '12:00', arr: '14:30', price: 5699 },
        { airline: 'Vistara', flight: 'UK 814', dep: '15:00', arr: '17:30', price: 6499 },
        { airline: 'IndiGo', flight: '6E 927', dep: '18:00', arr: '20:30', price: 5899 },
        { airline: 'Air India', flight: 'AI 239', dep: '20:30', arr: '23:00', price: 6299 }
      ],
      'mumbai-bangalore': [
        { airline: 'IndiGo', flight: '6E 335', dep: '06:00', arr: '07:30', price: 3799 },
        { airline: 'SpiceJet', flight: 'SG 678', dep: '08:15', arr: '09:45', price: 3499 },
        { airline: 'Akasa Air', flight: 'QP 1422', dep: '10:30', arr: '12:00', price: 3999 },
        { airline: 'Air India', flight: 'AI 607', dep: '13:45', arr: '15:15', price: 4299 },
        { airline: 'Vistara', flight: 'UK 452', dep: '16:00', arr: '17:30', price: 4599 },
        { airline: 'IndiGo', flight: '6E 891', dep: '19:00', arr: '20:30', price: 3999 }
      ],
      'delhi-goa': [
        { airline: 'IndiGo', flight: '6E 267', dep: '06:30', arr: '09:15', price: 5299 },
        { airline: 'SpiceJet', flight: 'SG 894', dep: '09:00', arr: '11:45', price: 4999 },
        { airline: 'Akasa Air', flight: 'QP 1733', dep: '12:30', arr: '15:15', price: 5599 },
        { airline: 'Air India', flight: 'AI 685', dep: '15:45', arr: '18:30', price: 5999 },
        { airline: 'Vistara', flight: 'UK 521', dep: '19:00', arr: '21:45', price: 6499 }
      ],
      'delhi-hyderabad': [
        { airline: 'IndiGo', flight: '6E 512', dep: '07:00', arr: '09:00', price: 4599 },
        { airline: 'SpiceJet', flight: 'SG 354', dep: '10:30', arr: '12:30', price: 4299 },
        { airline: 'Air India', flight: 'AI 829', dep: '14:00', arr: '16:00', price: 4999 },
        { airline: 'Akasa Air', flight: 'QP 1955', dep: '17:30', arr: '19:30', price: 4699 },
        { airline: 'Vistara', flight: 'UK 677', dep: '20:45', arr: '22:45', price: 5499 }
      ]
    };
    
    let flights = routeData[routeKey] || routeData['delhi-mumbai'];
    
    const formattedFlights = flights.map((f, idx) => ({
      airline: f.airline,
      flightNumber: f.flight,
      departureAirport: depAirport?.code || 'DEL',
      arrivalAirport: arrAirport?.code || 'BOM',
      departureTime: this.convertToAmPm(f.dep),
      arrivalTime: this.convertToAmPm(f.arr),
      duration: this.calcDuration(f.dep, f.arr),
      stops: 'Non-stop',
      price: f.price,
      currency: 'INR',
      rating: 4.2 - (idx * 0.05),
      status: 'Scheduled',
      aircraft: ['Boeing 737', 'Airbus A320', 'Airbus A321'][idx % 3],
      isReal: false
    }));
    
    return {
      success: true,
      source: start,
      destination: end,
      flights: formattedFlights,
      isRealData: false,
      count: formattedFlights.length,
      message: '✈️ Showing estimated flight schedules. Get API key for real-time data.'
    };
  }

  formatTime(timeString) {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  convertToAmPm(time24) {
    let [hours, minutes] = time24.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  }

  calcDuration(dep, arr) {
    let depHour = parseInt(dep.split(':')[0]);
    let arrHour = parseInt(arr.split(':')[0]);
    let duration = arrHour - depHour;
    if (duration < 0) duration += 12;
    return `${duration}h ${Math.floor(Math.random() * 50)}min`;
  }

  calculateDuration(dep, arr) {
    if (!dep || !arr) return '2h 30min';
    const depDate = new Date(dep);
    const arrDate = new Date(arr);
    const diff = (arrDate - depDate) / (1000 * 60 * 60);
    return `${Math.floor(diff)}h ${Math.round((diff % 1) * 60)}min`;
  }

  estimatePrice(start, end) {
    const prices = {
      'delhi-mumbai': 3899, 'mumbai-delhi': 3899,
      'delhi-bangalore': 5499, 'bangalore-delhi': 5499,
      'mumbai-bangalore': 3799, 'bangalore-mumbai': 3799,
      'delhi-goa': 5299, 'goa-delhi': 5299,
      'delhi-hyderabad': 4599, 'hyderabad-delhi': 4599
    };
    const key = `${start.toLowerCase()}-${end.toLowerCase()}`;
    return prices[key] || 4999;
  }
}

export default new FlightService();