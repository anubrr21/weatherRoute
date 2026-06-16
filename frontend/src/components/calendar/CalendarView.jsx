// frontend/src/components/calendar/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Plus, Bell, Clock, MapPin, Trash2 } from 'lucide-react';
import calendarService from '../../services/calendarService';
import AddEventModal from './AddEventModal';
import toast from 'react-hot-toast';

const CalendarView = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await calendarService.getEvents();
      const formattedEvents = eventsData.map(event => ({
        id: event._id,
        title: event.title,
        start: event.startDateTime,
        end: event.endDateTime || event.startDateTime,
        extendedProps: {
          startLocation: event.startLocation,
          endLocation: event.endLocation,
          type: event.type,
          notes: event.notes,
          eventId: event._id
        }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Could not load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo.start);
    setShowAddModal(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;
    
    // Redirect to route planner with trip details
    if (extendedProps.startLocation && extendedProps.endLocation) {
      navigate('/route-planner', {
        state: {
          loadSavedRoute: true,
          startLocation: extendedProps.startLocation,
          endLocation: extendedProps.endLocation,
          travelDate: event.start,
          tripName: event.title
        }
      });
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${eventTitle}" from calendar?`)) {
      try {
        await calendarService.deleteEvent(eventId);
        toast.success('Event deleted');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const handleAddEvent = async (eventData) => {
    try {
      await calendarService.createEvent(eventData);
      toast.success('Event added to calendar!');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const handlePlanRegularTrip = async (tripName) => {
    try {
      await calendarService.createRegularTripEvent(tripName);
      toast.success(`"${tripName}" added to calendar!`);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to add regular trip to calendar');
    }
  };

  return (
    <div className="weather-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-semibold dark:text-white">Trip Calendar</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          <Plus className="w-4 h-4" />
          Add Trip
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventContent={(eventInfo) => (
            <div className="p-1 relative group">
              <div className="font-medium text-sm dark:text-white">
                {eventInfo.event.title}
              </div>
              {eventInfo.event.extendedProps.startLocation && (
                <div className="text-xs opacity-75 dark:text-gray-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {eventInfo.event.extendedProps.startLocation} → {eventInfo.event.extendedProps.endLocation}
                </div>
              )}
              {eventInfo.event.extendedProps.type === 'regular_trip' && (
                <div className="text-xs flex items-center gap-1 mt-1 text-primary-500">
                  <Bell className="w-3 h-3" />
                  Regular
                </div>
              )}
              <button
                onClick={(e) => handleDeleteEvent(eventInfo.event.id, eventInfo.event.title, e)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        />
      )}

      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddEvent}
        onPlanRegularTrip={handlePlanRegularTrip}
        regularTrips={JSON.parse(localStorage.getItem('userRegularTrips') || '[]')}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarView;