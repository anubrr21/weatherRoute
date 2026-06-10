// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema - Defines the structure of user documents in MongoDB
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: {
    temperatureUnit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'celsius'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      weatherAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  // ========== NEW: AI Travel Copilot Preferences ==========
  travelPreferences: {
    // Transport preferences
    preferredTransport: {
      type: String,
      enum: ['road', 'train', 'flight', 'any'],
      default: 'any'
    },
    avoidTransport: {
      type: [String],
      enum: ['road', 'train', 'flight'],
      default: []
    },
    // Driving preferences
    maxDrivingHoursPerDay: {
      type: Number,
      default: 8,
      min: 1,
      max: 16
    },
    avoidNightDriving: {
      type: Boolean,
      default: false
    },
    preferredRestStopInterval: {
      type: Number,
      default: 120, // km between rest stops
      min: 50,
      max: 300
    },
    // Food preferences
    dietaryPreference: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian', 'vegan', 'any'],
      default: 'any'
    },
    // Route preferences
    routePreference: {
      type: String,
      enum: ['fastest', 'shortest', 'scenic', 'weather_safe'],
      default: 'fastest'
    },
    // Budget preferences
    budgetCategory: {
      type: String,
      enum: ['budget', 'moderate', 'luxury'],
      default: 'moderate'
    },
    // Favorite destinations
    favoriteDestinations: [{
      type: String,
      trim: true
    }],
    // Regular trips (e.g., "weekend trip to Jaipur")
    regularTrips: [{
      name: { type: String, trim: true },
      startLocation: { type: String, trim: true },
      endLocation: { type: String, trim: true },
      preferredDays: { type: String, default: 'weekend' }
    }],
    // Learned preferences from chat
    learnedPreferences: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    },
    // Last updated
    preferencesLastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  favoriteLocations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Favorite'
  }],
  searchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SearchHistory'
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;