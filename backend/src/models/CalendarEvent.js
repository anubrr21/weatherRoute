// backend/src/models/CalendarEvent.js
import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['regular_trip', 'custom', 'reminder', 'meeting'],
    default: 'custom'
  },
  startLocation: {
    type: String,
    trim: true
  },
  endLocation: {
    type: String,
    trim: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date
  },
  allDay: {
    type: Boolean,
    default: false
  },
  notificationHours: {
    type: Number,
    default: 12
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  lastNotificationSentAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  weatherData: {
    type: mongoose.Schema.Types.Mixed
  },
  routeData: {
    type: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for notification scheduler
calendarEventSchema.index({ startDateTime: 1, notificationSent: 1, isActive: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;