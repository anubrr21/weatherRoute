// backend/src/controllers/historyController.js
import catchAsync from '../utils/catchAsync.js';
import SearchHistory from '../models/SearchHistory.js';
import RouteHistory from '../models/RouteHistory.js';

// ============ SEARCH HISTORY ============

export const saveSearch = catchAsync(async (req, res, next) => {
  const { city, lat, lon, country, temperature, weatherCondition } = req.body;
  
  // Check for duplicate search within last 5 seconds
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  const existingSearch = await SearchHistory.findOne({
    userId: req.user.id,
    city: city,
    lat: lat,
    lon: lon,
    searchedAt: { $gte: fiveSecondsAgo }
  });
  
  if (existingSearch) {
    // Update the existing search's timestamp instead of creating duplicate
    existingSearch.searchedAt = new Date();
    existingSearch.temperature = temperature;
    existingSearch.weatherCondition = weatherCondition;
    await existingSearch.save();
    
    return res.status(200).json({
      status: 'success',
      data: { search: existingSearch },
      message: 'Search timestamp updated'
    });
  }
  
  // Create new search only if no duplicate found
  const search = await SearchHistory.create({
    userId: req.user.id,
    city,
    lat,
    lon,
    country,
    temperature,
    weatherCondition
  });
  
  res.status(201).json({
    status: 'success',
    data: { search }
  });
});

export const getSearchHistory = catchAsync(async (req, res, next) => {
  const searches = await SearchHistory.find({ userId: req.user.id })
    .sort({ searchedAt: -1 })
    .limit(50);
  
  // Remove duplicates by city (keep most recent per city for display)
  const uniqueSearches = [];
  const seenCities = new Set();
  
  for (const search of searches) {
    if (!seenCities.has(search.city)) {
      seenCities.add(search.city);
      uniqueSearches.push(search);
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: { searches: uniqueSearches }
  });
});

export const clearSearchHistory = catchAsync(async (req, res, next) => {
  await SearchHistory.deleteMany({ userId: req.user.id });
  
  res.status(200).json({
    status: 'success',
    message: 'Search history cleared'
  });
});

export const getSearchStats = catchAsync(async (req, res, next) => {
  // Count unique cities (not total records) for accurate stats
  const uniqueCities = await SearchHistory.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: '$city', count: { $sum: 1 } } }
  ]);
  
  const totalSearches = uniqueCities.length;
  
  // Most searched city (by frequency of searches, but count unique occurrences properly)
  const mostSearched = await SearchHistory.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);
  
  // Searches this week (unique cities searched in last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const searchesThisWeekAgg = await SearchHistory.aggregate([
    { 
      $match: { 
        userId: req.user._id,
        searchedAt: { $gte: weekAgo }
      } 
    },
    { $group: { _id: '$city' } }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      totalSearches: totalSearches,
      mostSearchedCity: mostSearched[0] ? { city: mostSearched[0]._id, count: mostSearched[0].count } : null,
      searchesThisWeek: searchesThisWeekAgg.length
    }
  });
});

// ============ ROUTE HISTORY ============

export const saveRoute = catchAsync(async (req, res, next) => {
  const { startLocation, destination, waypoints, distance, duration } = req.body;
  
  const route = await RouteHistory.create({
    userId: req.user.id,
    startLocation,
    destination,
    waypoints: waypoints || [],
    distance,
    duration
  });
  
  res.status(201).json({
    status: 'success',
    data: { route }
  });
});

export const getRouteHistory = catchAsync(async (req, res, next) => {
  const routes = await RouteHistory.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  
  res.status(200).json({
    status: 'success',
    data: { routes }
  });
});

export const deleteRoute = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  await RouteHistory.findOneAndDelete({
    _id: id,
    userId: req.user.id
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Route deleted'
  });
});

export const getRouteStats = catchAsync(async (req, res, next) => {
  const totalRoutes = await RouteHistory.countDocuments({ userId: req.user.id });
  
  const lastRoute = await RouteHistory.findOne({ userId: req.user.id })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    data: {
      totalRoutes,
      lastRoute: lastRoute || null
    }
  });
});