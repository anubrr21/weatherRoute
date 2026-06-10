// backend/src/models/RouteHistory.js
import mongoose from 'mongoose';

const routeHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startLocation: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  waypoints: [{
    type: String,
    trim: true
  }],
  distance: {
    type: String
  },
  duration: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

routeHistorySchema.index({ userId: 1, createdAt: -1 });

const RouteHistory = mongoose.model('RouteHistory', routeHistorySchema);
export default RouteHistory;