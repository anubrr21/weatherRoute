// backend/src/models/SharedRoute.js
import mongoose from 'mongoose';

const sharedRouteSchema = new mongoose.Schema({
  shareToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  startLocation: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  endLocation: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  waypoints: [{
    name: String,
    lat: Number,
    lng: Number
  }],
  routeData: {
    distance: mongoose.Schema.Types.Mixed,
    duration: mongoose.Schema.Types.Mixed,
    geometry: mongoose.Schema.Types.Mixed,
    summary: String
  },
  weatherData: {
    points: Array,
    riskAnalysis: mongoose.Schema.Types.Mixed,
    summary: mongoose.Schema.Types.Mixed
  },
  shareSettings: {
    expiresAt: { type: Date, default: null },
    maxViews: { type: Number, default: null },
    allowTracking: { type: Boolean, default: false }
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
  }
});

// Index for cleanup
sharedRouteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SharedRoute = mongoose.model('SharedRoute', sharedRouteSchema);
export default SharedRoute;