// backend/src/models/SearchHistory.js
import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  city: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  lat: {
    type: Number,
    required: true
  },
  lon: {
    type: Number,
    required: true
  },
  country: {
    type: String,
    default: ''
  },
  temperature: {
    type: Number
  },
  weatherCondition: {
    type: String
  },
  searchedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for duplicate prevention
searchHistorySchema.index({ userId: 1, city: 1, lat: 1, lon: 1, searchedAt: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
export default SearchHistory;