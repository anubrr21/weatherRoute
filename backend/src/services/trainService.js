// backend/src/services/trainService.js
import irctcService from './irctcService.js';

/**
 * Train Service - Real train data from IRCTC API
 * Falls back to mock data if API is unavailable
 */
class TrainService {
  constructor() {
    this.useMockData = !process.env.IRCTC_API_KEY;
  }

 async getTrainRoutes(startLocation, endLocation, travelDate) {
    console.log(`🚂 Fetching trains from ${startLocation} to ${endLocation}`);
    
    // Try to get real data from IRCTC API
    const realData = await irctcService.searchTrains(startLocation, endLocation, travelDate);
    
    console.log(`📊 API Result: success=${realData.success}, isMock=${realData.isMock}`);
    
    if (realData.success && realData.data && realData.data.data && realData.data.data.length > 0) {
      console.log(`✅ Found ${realData.data.data.length} real trains`);
      return this.formatRealTrainData(realData.data, startLocation, endLocation, travelDate);
    }
    
    // Fallback to mock data if API fails
    console.log(`⚠️ Using mock train data for ${startLocation} → ${endLocation}`);
    return this.generateMockTrains(startLocation, endLocation, travelDate);
  }
  formatRealTrainData(apiData, startLocation, endLocation, travelDate) {
    const trains = [];
    const trainList = apiData.data || [];
    
    for (const train of trainList.slice(0, 10)) {
      trains.push({
        trainName: train.train_name || train.name || `${startLocation} ${endLocation} Express`,
        trainNumber: train.train_number || train.number || 'XXXXX',
        departureTime: this.formatTime(train.from_departure_time || train.departure_time || train.departureTime),
        arrivalTime: this.formatTime(train.to_arrival_time || train.arrival_time || train.arrivalTime),
        duration: train.duration || this.calculateDuration(train.departure_time, train.arrival_time),
        classes: this.extractClasses(train.classes || train.available_classes),
        availability: train.availability || 'Available',
        fare: this.extractFare(train.fare || train.price),
        sourceStation: train.from_station_name || startLocation,
        destinationStation: train.to_station_name || endLocation,
        runningDays: train.running_days || 'Daily',
        amenities: ['Pantry Car', 'Charging Points', 'Water Available']
      });
    }
    
    return {
      success: true,
      source: startLocation,
      destination: endLocation,
      travelDate: travelDate || new Date().toISOString().split('T')[0],
      trains: trains,
      isMockData: false,
      sourceAPI: 'IRCTC Real Data',
      totalTrainsFound: trainList.length
    };
  }

  formatTime(timeString) {
    if (!timeString) return '--:--';
    // Handle various time formats
    if (timeString.includes(':')) {
      let hour = parseInt(timeString.split(':')[0]);
      const minute = timeString.split(':')[1].substring(0, 2);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${minute} ${ampm}`;
    }
    return timeString;
  }

  calculateDuration(departure, arrival) {
    if (!departure || !arrival) return '--';
    // Simple calculation - can be enhanced
    return 'Estimated';
  }

  generateMockTrains(startLocation, endLocation, travelDate) {
    const distance = this.estimateDistance(startLocation, endLocation);
    const durationHours = Math.max(4, Math.round(distance / 60));
    
    return {
      success: true,
      source: startLocation,
      destination: endLocation,
      travelDate: travelDate || new Date().toISOString().split('T')[0],
      trains: [
        {
          trainName: `${this.getCityCode(startLocation)} ${this.getCityCode(endLocation)} Express`,
          trainNumber: Math.floor(10000 + Math.random() * 90000),
          departureTime: "06:00 AM",
          arrivalTime: this.addHoursToTime("06:00 AM", durationHours),
          duration: `${durationHours}h ${Math.floor(Math.random() * 59)}min`,
          classes: ["Sleeper", "3A", "2A", "1A"],
          availability: "Available",
          fare: {
            sleeper: Math.floor(300 + distance * 1.5),
            ac3: Math.floor(500 + distance * 2),
            ac2: Math.floor(800 + distance * 2.5),
            ac1: Math.floor(1200 + distance * 3)
          },
          amenities: ["Pantry Car", "Charging Points", "WiFi Available"]
        },
        {
          trainName: `${this.getCityCode(startLocation)} Superfast Express`,
          trainNumber: Math.floor(10000 + Math.random() * 90000),
          departureTime: "10:30 PM",
          arrivalTime: this.addHoursToTime("10:30 PM", durationHours - 1),
          duration: `${durationHours - 1}h ${Math.floor(Math.random() * 59)}min`,
          classes: ["3A", "2A", "1A"],
          availability: "Limited",
          fare: {
            ac3: Math.floor(600 + distance * 2.2),
            ac2: Math.floor(900 + distance * 2.7),
            ac1: Math.floor(1400 + distance * 3.2)
          },
          amenities: ["Pantry Car", "Charging Points"]
        },
        {
          trainName: `${this.getCityCode(endLocation)} Duronto Express`,
          trainNumber: Math.floor(10000 + Math.random() * 90000),
          departureTime: "08:15 AM",
          arrivalTime: this.addHoursToTime("08:15 AM", durationHours + 1),
          duration: `${durationHours + 1}h ${Math.floor(Math.random() * 59)}min`,
          classes: ["3A", "2A"],
          availability: "Waiting List",
          fare: {
            ac3: Math.floor(550 + distance * 2),
            ac2: Math.floor(850 + distance * 2.5)
          },
          amenities: ["Premium Pantry", "Linen Provided"]
        }
      ],
      isMockData: true,
      message: '⚠️ Using mock train data. Real IRCTC API may need subscription upgrade.'
    };
  }

  extractClasses(classes) {
    if (!classes) return ["Sleeper", "3A", "2A", "1A"];
    if (Array.isArray(classes)) return classes;
    if (typeof classes === 'string') return classes.split(',').map(c => c.trim());
    return ["Sleeper", "3A", "2A", "1A"];
  }

  extractFare(fare) {
    if (!fare) return { sleeper: 500, ac3: 800, ac2: 1200, ac1: 1800 };
    if (typeof fare === 'object') return fare;
    if (typeof fare === 'number') return { general: fare, ac3: fare * 1.5, ac2: fare * 2, ac1: fare * 2.5 };
    return { sleeper: 500, ac3: 800, ac2: 1200, ac1: 1800 };
  }

  estimateDistance(start, end) {
    const distances = {
      'delhi-mumbai': 1400, 'mumbai-delhi': 1400,
      'delhi-kolkata': 1450, 'kolkata-delhi': 1450,
      'delhi-chennai': 2100, 'chennai-delhi': 2100,
      'mumbai-kolkata': 1900, 'kolkata-mumbai': 1900,
      'delhi-bangalore': 2100, 'bangalore-delhi': 2100,
      'mumbai-bangalore': 980, 'bangalore-mumbai': 980,
      'delhi-jaipur': 280, 'jaipur-delhi': 280,
      'mumbai-pune': 150, 'pune-mumbai': 150,
      'delhi-hyderabad': 1500, 'hyderabad-delhi': 1500,
      'mumbai-hyderabad': 700, 'hyderabad-mumbai': 700,
      'chennai-bangalore': 350, 'bangalore-chennai': 350
    };
    
    const key = `${start.toLowerCase()}-${end.toLowerCase()}`;
    const reverseKey = `${end.toLowerCase()}-${start.toLowerCase()}`;
    return distances[key] || distances[reverseKey] || 800;
  }

  getCityCode(cityName) {
    const codes = {
      'delhi': 'NDLS', 'mumbai': 'CSTM', 'kolkata': 'HWH',
      'chennai': 'MAS', 'bangalore': 'SBC', 'hyderabad': 'HYB',
      'pune': 'PUNE', 'jaipur': 'JP', 'ahmedabad': 'ADI',
      'lucknow': 'LKO', 'kanpur': 'CNB', 'agra': 'AGC',
      'varanasi': 'BSB', 'patna': 'PNBE', 'bhopal': 'BPL'
    };
    return codes[cityName.toLowerCase()] || cityName.substring(0, 4).toUpperCase();
  }

  addHoursToTime(timeStr, hoursToAdd) {
    const isPM = timeStr.includes('PM');
    let hour = parseInt(timeStr.split(':')[0]);
    const minute = parseInt(timeStr.split(':')[1].split(' ')[0]);
    
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    let newHour = hour + hoursToAdd;
    let newIsPM = newHour >= 12;
    let displayHour = newHour % 12;
    if (displayHour === 0) displayHour = 12;
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${newIsPM ? 'PM' : 'AM'}`;
  }
}

export default new TrainService();