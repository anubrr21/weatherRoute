// backend/src/models/Favorite.js
import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster queries
  },
  locationName: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  customName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  notes: {
    type: String,
    maxlength: 200
  },
  // Store last known weather for quick display
  cachedWeather: {
    temp: Number,
    condition: String,
    icon: String,
    updatedAt: Date
  }
}, {
  timestamps: true
});

// Ensure a user can't favorite the same location twice
favoriteSchema.index({ userId: 1, lat: 1, lng: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;