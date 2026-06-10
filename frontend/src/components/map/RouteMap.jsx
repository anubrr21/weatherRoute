// frontend/src/components/map/RouteMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers for start, waypoints, end
const startIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background-color: #10B981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
  iconSize: [20, 20],
  popupAnchor: [0, -10]
});

const endIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
  iconSize: [20, 20],
  popupAnchor: [0, -10]
});

const waypointIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background-color: #F59E0B; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
  iconSize: [16, 16],
  popupAnchor: [0, -8]
});

// Helper function to get color based on weather condition
const getMarkerColor = (condition) => {
  const colorMap = {
    'Clear': '#10B981',
    'Clouds': '#F59E0B',
    'Rain': '#EF4444',
    'Drizzle': '#EF4444',
    'Thunderstorm': '#DC2626',
    'Snow': '#3B82F6',
    'Mist': '#F97316',
    'Fog': '#F97316',
    'Haze': '#F97316'
  };
  return colorMap[condition] || '#6B7280';
};

// Helper function to get weather icon for marker
const getWeatherIconForMarker = (condition) => {
  const iconMap = {
    'Clear': '☀️',
    'Clouds': '⛅',
    'Rain': '🌧️',
    'Drizzle': '🌧️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  return iconMap[condition] || '🌤️';
};

// Local cache for location names (frontend side)
const locationNameFrontendCache = new Map();

const getLocationNameFromBackend = async (lat, lng) => {
  // Round coordinates to 3 decimal places for consistent caching
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const cacheKey = `${roundedLat},${roundedLng}`;
  
  // Check frontend cache first
  if (locationNameFrontendCache.has(cacheKey)) {
    return locationNameFrontendCache.get(cacheKey);
  }
  
  try {
    const response = await api.get('/geocode/reverse', {
      params: { lat: roundedLat, lng: roundedLng }
    });
    
    const locationName = response.data.data.locationName;
    if (locationName) {
      locationNameFrontendCache.set(cacheKey, locationName);
      // Clear cache after 1 hour
      setTimeout(() => locationNameFrontendCache.delete(cacheKey), 3600000);
    }
    return locationName;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

const RouteMap = ({ routeData, locations, weatherPoints, onMapReady, height = '400px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);
  const weatherMarkersRef = useRef([]);
  const [locationNames, setLocationNames] = useState({});

  // Fetch location names for weather points using backend API
  useEffect(() => {
    const fetchNames = async () => {
      if (!weatherPoints || weatherPoints.length === 0) return;
      
      const names = {};
      for (let i = 0; i < weatherPoints.length; i++) {
        const point = weatherPoints[i];
        const key = `${point.coordinates.lat},${point.coordinates.lng}`;
        
        // Skip start and destination - they already have names from locations
        if (i === 0 && locations?.start) {
          names[key] = locations.start.name.split(',')[0];
        } else if (i === weatherPoints.length - 1 && locations?.end) {
          names[key] = locations.end.name.split(',')[0];
        } else {
          // Fetch from backend API (no CORS issues)
          const name = await getLocationNameFromBackend(point.coordinates.lat, point.coordinates.lng);
          if (name) {
            names[key] = name;
          }
        }
      }
      setLocationNames(names);
    };
    
    fetchNames();
  }, [weatherPoints, locations]);

  // Function to create checkpoint marker with place name
  const createCheckpointMarker = (point, idx, totalPoints) => {
    const condition = point.weather?.condition || 'Clear';
    const weatherIcon = getWeatherIconForMarker(condition);
    const markerColor = getMarkerColor(condition);
    const temp = point.weather?.temp || '--';
    const distance = point.distanceFromStartKm || Math.round(point.distanceFromStart / 1000) || '?';
    const coordKey = `${point.coordinates.lat},${point.coordinates.lng}`;
    const placeName = locationNames[coordKey];
    
    // Determine label for the marker
    let label = '';
    if (idx === 0) {
      label = '🏁 Start';
    } else if (idx === totalPoints - 1) {
      label = '🏆 Destination';
    } else {
      label = placeName ? `📍 ${placeName}` : `📍 Checkpoint ${idx}`;
    }
    
    const checkpointIcon = L.divIcon({
      className: 'checkpoint-marker',
      html: `
        <div style="
          background: ${markerColor};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.2s;
        "
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform='scale(1)'">
          ${weatherIcon}
        </div>
      `,
      iconSize: [36, 36],
      popupAnchor: [0, -18],
      tooltipAnchor: [0, -18]
    });
    
    const marker = L.marker(
      [point.coordinates.lat, point.coordinates.lng],
      { icon: checkpointIcon }
    ).addTo(mapInstanceRef.current);
    
    // Tooltip on hover
    marker.bindTooltip(`
      <div style="
        background: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 3px solid ${markerColor};
      ">
        <div>${label}</div>
        <div>${weatherIcon} ${condition} • ${temp}°C</div>
        <div style="font-size: 10px; color: #666;">${distance} km from start</div>
      </div>
    `, {
      permanent: false,
      direction: 'top',
      offset: [0, -20]
    });
    
    // Popup on click
    marker.bindPopup(`
      <div style="min-width: 260px; font-family: system-ui;">
        <div style="
          background: ${markerColor};
          color: white;
          padding: 10px;
          border-radius: 8px 8px 0 0;
          margin: -12px -12px 0 -12px;
        ">
          <strong>${label}</strong>
        </div>
        <div style="padding: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="font-size: 32px;">${weatherIcon}</span>
            <div>
              <div style="font-weight: bold; font-size: 18px;">${condition}</div>
              <div style="color: #666;">${temp}°C</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><span style="color: #666;">Distance:</span> ${distance} km</div>
            <div><span style="color: #666;">Humidity:</span> ${point.weather?.humidity || '--'}%</div>
            <div><span style="color: #666;">Wind:</span> ${point.weather?.windSpeed || '--'} m/s</div>
            <div><span style="color: #666;">Visibility:</span> ${((point.weather?.visibility || 0) / 1000).toFixed(1)} km</div>
          </div>
        </div>
      </div>
    `);
    
    return marker;
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
    
    if (onMapReady) onMapReady(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onMapReady]);

  // Draw route
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
    }
    
    if (!routeData || !routeData.geometry) return;

    const geojson = routeData.geometry;
    const routeLayer = L.geoJSON(geojson, {
      style: {
        color: '#3B82F6',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }
    }).addTo(mapInstanceRef.current);
    
    routeLayerRef.current = routeLayer;

    const bounds = routeLayer.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [150, 150] });
    }
  }, [routeData]);

  // Add start/destination/waypoint markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];
    
    if (!locations) return;

    if (locations.start?.coordinates) {
      const startMarker = L.marker(
        [locations.start.coordinates.lat, locations.start.coordinates.lng],
        { icon: startIcon }
      ).addTo(mapInstanceRef.current);
      startMarker.bindPopup(`<b>Start</b><br>${locations.start.name}`);
      markersRef.current.push(startMarker);
    }

    if (locations.waypoints?.length > 0) {
      locations.waypoints.forEach((wp, idx) => {
        if (wp.coordinates) {
          const wpMarker = L.marker(
            [wp.coordinates.lat, wp.coordinates.lng],
            { icon: waypointIcon }
          ).addTo(mapInstanceRef.current);
          wpMarker.bindPopup(`<b>Waypoint ${idx + 1}</b><br>${wp.name}`);
          markersRef.current.push(wpMarker);
        }
      });
    }

    if (locations.end?.coordinates) {
      const endMarker = L.marker(
        [locations.end.coordinates.lat, locations.end.coordinates.lng],
        { icon: endIcon }
      ).addTo(mapInstanceRef.current);
      endMarker.bindPopup(`<b>Destination</b><br>${locations.end.name}`);
      markersRef.current.push(endMarker);
    }
  }, [locations]);

  // Add weather checkpoint markers with place names
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Clear existing weather markers
    weatherMarkersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    weatherMarkersRef.current = [];
    
    if (!weatherPoints || weatherPoints.length === 0) return;
    
    // Create markers for ALL weather points
    weatherPoints.forEach((point, idx) => {
      if (!point.coordinates?.lat || !point.coordinates?.lng) return;
      
      try {
        const marker = createCheckpointMarker(point, idx, weatherPoints.length);
        weatherMarkersRef.current.push(marker);
      } catch (error) {
        console.error('Failed to create marker:', error);
      }
    });
  }, [weatherPoints, locationNames]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: '0.5rem'
      }}
      className="overflow-hidden shadow-lg"
    />
  );
};

export default RouteMap;