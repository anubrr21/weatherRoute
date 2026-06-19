// frontend/src/components/user/PreferencesPanel.jsx
import React, { useState, useEffect } from 'react';
import { Brain, Car, Train, Plane, Utensils, DollarSign, Star, Plus, X, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PreferencesPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    preferredTransport: 'any',
    avoidTransport: [],
    maxDrivingHoursPerDay: 8,
    avoidNightDriving: false,
    dietaryPreference: 'any',
    routePreference: 'fastest',
    budgetCategory: 'moderate',
    favoriteDestinations: [],
    regularTrips: []
  });
  const [newFavorite, setNewFavorite] = useState('');
  const [newTrip, setNewTrip] = useState({ name: '', startLocation: '', endLocation: '', preferredDays: 'weekend' });
  const [tempPreferences, setTempPreferences] = useState(null);

  // ✅ FIX #1: Only fetch preferences if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchPreferences();
    }
  }, []);

  // ✅ FIX #2: Check token before making API call
  const fetchPreferences = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get('/preferences/travel');
      const prefs = response.data.data.preferences || {
        preferredTransport: 'any',
        avoidTransport: [],
        maxDrivingHoursPerDay: 8,
        avoidNightDriving: false,
        dietaryPreference: 'any',
        routePreference: 'fastest',
        budgetCategory: 'moderate',
        favoriteDestinations: [],
        regularTrips: []
      };
      setPreferences(prefs);
      setTempPreferences(prefs);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      // ✅ FIX #3: Only show error if it's not 401
      if (error.response?.status !== 401) {
        toast.error('Could not load preferences');
      }
    }
  };

  const updateTempPreference = (key, value) => {
    setTempPreferences(prev => ({ ...prev, [key]: value }));
  };

  const saveAllPreferences = async () => {
    setSaving(true);
    try {
      const response = await api.put('/preferences/travel', tempPreferences);
      setPreferences(response.data.data.preferences);
      setTempPreferences(response.data.data.preferences);
      toast.success('All preferences saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const addFavoriteDestination = async () => {
    if (!newFavorite.trim()) return;
    setLoading(true);
    try {
      await api.post('/preferences/travel/favorite', { destination: newFavorite });
      const updatedFavorites = [...(tempPreferences.favoriteDestinations || []), newFavorite];
      setTempPreferences(prev => ({ ...prev, favoriteDestinations: updatedFavorites }));
      setNewFavorite('');
      toast.success('Favorite destination added!');
    } catch (error) {
      console.error('Add favorite error:', error);
      toast.error('Failed to add destination');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (destination) => {
    const updatedFavorites = (tempPreferences.favoriteDestinations || []).filter(d => d !== destination);
    setTempPreferences(prev => ({ ...prev, favoriteDestinations: updatedFavorites }));
  };

  const addRegularTrip = async () => {
    if (!newTrip.name || !newTrip.startLocation || !newTrip.endLocation) {
      toast.error('Please fill all trip fields');
      return;
    }
    setLoading(true);
    try {
      console.log('Sending trip data:', newTrip);
      const response = await api.post('/preferences/travel/regular-trip', newTrip);
      console.log('Response:', response.data);
      const updatedTrips = [...(tempPreferences.regularTrips || []), newTrip];
      setTempPreferences(prev => ({ ...prev, regularTrips: updatedTrips }));
      setNewTrip({ name: '', startLocation: '', endLocation: '', preferredDays: 'weekend' });
      toast.success('Regular trip saved!');
    } catch (error) {
      console.error('Add trip error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const removeTrip = (tripName) => {
    const updatedTrips = (tempPreferences.regularTrips || []).filter(t => t.name !== tripName);
    setTempPreferences(prev => ({ ...prev, regularTrips: updatedTrips }));
  };

  const TransportButton = ({ value, label, icon }) => {
    const isSelected = tempPreferences?.preferredTransport === value;
    return (
      <button
        onClick={() => updateTempPreference('preferredTransport', value)}
        className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
          isSelected
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
        }`}
      >
        {icon}
        <span className="text-xs">{label}</span>
      </button>
    );
  };

  const DietaryButton = ({ value, label }) => (
    <button
      onClick={() => updateTempPreference('dietaryPreference', value)}
      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
        tempPreferences?.dietaryPreference === value
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const BudgetButton = ({ value, label }) => (
    <button
      onClick={() => updateTempPreference('budgetCategory', value)}
      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
        tempPreferences?.budgetCategory === value
          ? 'bg-yellow-500 text-white'
          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const RouteButton = ({ value, label }) => (
    <button
      onClick={() => updateTempPreference('routePreference', value)}
      className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
        tempPreferences?.routePreference === value
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* AI Brain Icon - Bottom Left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 p-3 bg-gradient-to-r from-purple-500 to-primary-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        title="AI Travel Copilot Preferences"
      >
        <Brain className="w-6 h-6 text-white" />
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          AI Preferences
        </span>
      </button>

      {/* Preferences Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-dark-200 p-4 border-b border-gray-200 dark:border-dark-300 flex justify-between items-center">
              <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI Travel Copilot Preferences
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Transport Preferences */}
              <div>
                <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4" /> Preferred Transport
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <TransportButton value="road" label="Road" icon={<Car className="w-5 h-5" />} />
                  <TransportButton value="train" label="Train" icon={<Train className="w-5 h-5" />} />
                  <TransportButton value="flight" label="Flight" icon={<Plane className="w-5 h-5" />} />
                  <TransportButton value="any" label="Any" icon={<Star className="w-5 h-5" />} />
                </div>
              </div>

              {/* Driving Preferences */}
              <div className="border-t border-gray-200 dark:border-dark-300 pt-4">
                <h3 className="font-semibold dark:text-white mb-3">Driving Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Max Driving Hours/Day</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateTempPreference('maxDrivingHoursPerDay', Math.max(1, (tempPreferences?.maxDrivingHoursPerDay || 8) - 1))}
                        className="w-8 h-8 bg-gray-100 dark:bg-dark-300 rounded-lg"
                      >-</button>
                      <span className="w-12 text-center">{tempPreferences?.maxDrivingHoursPerDay || 8}h</span>
                      <button
                        onClick={() => updateTempPreference('maxDrivingHoursPerDay', Math.min(16, (tempPreferences?.maxDrivingHoursPerDay || 8) + 1))}
                        className="w-8 h-8 bg-gray-100 dark:bg-dark-300 rounded-lg"
                      >+</button>
                    </div>
                  </div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avoid Night Driving</span>
                    <input
                      type="checkbox"
                      checked={tempPreferences?.avoidNightDriving || false}
                      onChange={(e) => updateTempPreference('avoidNightDriving', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                  </label>
                </div>
              </div>

              {/* Route Preference */}
              <div className="border-t border-gray-200 dark:border-dark-300 pt-4">
                <h3 className="font-semibold dark:text-white mb-3">Route Preference</h3>
                <div className="flex gap-2 flex-wrap">
                  <RouteButton value="fastest" label="Fastest" />
                  <RouteButton value="shortest" label="Shortest" />
                  <RouteButton value="scenic" label="Scenic" />
                  <RouteButton value="weather_safe" label="Weather Safe" />
                </div>
              </div>

              {/* Dietary Preference */}
              <div className="border-t border-gray-200 dark:border-dark-300 pt-4">
                <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4" /> Dietary Preference
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <DietaryButton value="vegetarian" label="Vegetarian" />
                  <DietaryButton value="non-vegetarian" label="Non-Veg" />
                  <DietaryButton value="vegan" label="Vegan" />
                  <DietaryButton value="any" label="Any" />
                </div>
              </div>

              {/* Budget Category */}
              <div className="border-t border-gray-200 dark:border-dark-300 pt-4">
                <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Budget
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <BudgetButton value="budget" label="Budget (₹)" />
                  <BudgetButton value="moderate" label="Moderate (₹₹)" />
                  <BudgetButton value="luxury" label="Luxury (₹₹₹)" />
                </div>
              </div>

              {/* Favorite Destinations */}
              <div className="border-t border-gray-200 dark:border-dark-300 pt-4">
                <h3 className="font-semibold dark:text-white mb-3">Favorite Destinations</h3>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {(tempPreferences?.favoriteDestinations || []).map((dest, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center gap-1">
                      {dest}
                      <button onClick={() => removeFavorite(dest)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFavorite}
                    onChange={(e) => setNewFavorite(e.target.value)}
                    placeholder="Add destination (e.g., Jaipur)"
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-dark-300"
                  />
                  <button onClick={addFavoriteDestination} className="px-3 py-2 bg-primary-500 text-white rounded-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Regular Trips */}
              <div className="border-t border-gray-200 dark:border-dark-300 pt-4">
                <h3 className="font-semibold dark:text-white mb-3">Regular Trips</h3>
                {(tempPreferences?.regularTrips || []).map((trip, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 dark:bg-dark-300 rounded-lg mb-2 text-sm flex justify-between items-center">
                    <div>
                      <span className="font-medium">{trip.name}</span>: {trip.startLocation} → {trip.endLocation}
                      <span className="text-gray-500 ml-2">({trip.preferredDays})</span>
                    </div>
                    <button onClick={() => removeTrip(trip.name)} className="text-red-500 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Trip name (e.g., Weekend Getaway)"
                    value={newTrip.name}
                    onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-dark-300"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Start location"
                      value={newTrip.startLocation}
                      onChange={(e) => setNewTrip({ ...newTrip, startLocation: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-dark-300"
                    />
                    <input
                      type="text"
                      placeholder="End location"
                      value={newTrip.endLocation}
                      onChange={(e) => setNewTrip({ ...newTrip, endLocation: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-dark-300"
                    />
                  </div>
                  <button onClick={addRegularTrip} className="w-full py-2 bg-primary-500 text-white rounded-lg">
                    <Plus className="w-4 h-4 inline mr-1" /> Add Regular Trip
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t border-gray-200 dark:border-dark-300 pt-4">
                <button
                  onClick={saveAllPreferences}
                  disabled={saving}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save All Preferences
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  These preferences help WISE personalize your travel recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreferencesPanel;