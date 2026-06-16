// frontend/src/components/calendar/CalendarWidget.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Bell, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import calendarService from '../../services/calendarService';

const CalendarWidget = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const events = await calendarService.getEvents(now.toISOString(), sevenDaysLater.toISOString());
      // Sort by date and take first 3
      const sortedEvents = events.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
      setUpcomingEvents(sortedEvents.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days away`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleEventClick = (event) => {
    navigate('/route-planner', {
      state: {
        loadSavedRoute: true,
        startLocation: event.startLocation,
        endLocation: event.endLocation,
        travelDate: event.startDateTime,
        tripName: event.title
      }
    });
  };

  if (loading) {
    return (
      <div className="weather-card p-6">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-card p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold dark:text-white">Upcoming Trips</h2>
        </div>
        <button
          onClick={() => navigate('/calendar')}
          className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {upcomingEvents.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming trips scheduled</p>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event._id}
              onClick={() => handleEventClick(event)}
              className="p-3 bg-gray-50 dark:bg-dark-300 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium dark:text-white">{event.title}</h3>
                  {event.startLocation && event.endLocation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {event.startLocation} → {event.endLocation}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(event.startDateTime)}
                  </p>
                  {event.notificationHours && (
                    <p className="text-xs text-primary-500 flex items-center gap-1 mt-1">
                      <Bell className="w-3 h-3" />
                      Notify {event.notificationHours}h before
                    </p>
                  )}
                </div>
                {event.type === 'regular_trip' && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                    Regular
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;