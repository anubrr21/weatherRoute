// frontend/src/components/calendar/AddEventModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar as CalendarIcon, MapPin, Clock, AlertCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AddEventModal = ({ isOpen, onClose, onSave, onPlanRegularTrip, regularTrips, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startDateTime, setStartDateTime] = useState(selectedDate || new Date());
  const [notificationHours, setNotificationHours] = useState(12);
  const [notes, setNotes] = useState('');
  const [tripType, setTripType] = useState('custom');
  const [selectedRegularTrip, setSelectedRegularTrip] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setStartDateTime(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (tripType === 'regular_trip' && selectedRegularTrip) {
      setLoading(true);
      await onPlanRegularTrip(selectedRegularTrip);
      setLoading(false);
      onClose();
      resetForm();
      return;
    }
    
    if (!title || !startLocation || !endLocation) {
      alert('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    await onSave({
      title,
      startLocation,
      endLocation,
      startDateTime: startDateTime.toISOString(),
      notificationHours,
      notes,
      type: 'custom'
    });
    setLoading(false);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setStartLocation('');
    setEndLocation('');
    setNotificationHours(12);
    setNotes('');
    setTripType('custom');
    setSelectedRegularTrip('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-300 sticky top-0 bg-white dark:bg-dark-200">
          <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            Add to Calendar
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Trip Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trip Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTripType('custom')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tripType === 'custom'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                Custom Trip
              </button>
              <button
                type="button"
                onClick={() => setTripType('regular_trip')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tripType === 'regular_trip'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                Regular Trip
              </button>
            </div>
          </div>

          {tripType === 'regular_trip' && regularTrips.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Regular Trip
              </label>
              <select
                value={selectedRegularTrip}
                onChange={(e) => setSelectedRegularTrip(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-300"
                required
              >
                <option value="">Select a trip...</option>
                {regularTrips.map((trip, idx) => (
                  <option key={idx} value={trip.name}>
                    {trip.name}: {trip.startLocation} → {trip.endLocation}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Bell className="w-3 h-3" />
                You'll get a notification 12 hours before
              </p>
            </div>
          ) : tripType === 'regular_trip' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                No regular trips found. Add regular trips in Preferences panel first.
              </p>
            </div>
          )}

          {tripType === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trip Name *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekend Getaway"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-dark-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From *
                  </label>
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="Start city"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-dark-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To *
                  </label>
                  <input
                    type="text"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    placeholder="Destination"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-dark-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date & Time *
                </label>
                <DatePicker
                  selected={startDateTime}
                  onChange={(date) => setStartDateTime(date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-dark-300"
                  minDate={new Date()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification (hours before)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="48"
                    value={notificationHours}
                    onChange={(e) => setNotificationHours(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{notificationHours}h</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="Any special notes..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-dark-300"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <CalendarIcon className="w-4 h-4" />
                Add to Calendar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;