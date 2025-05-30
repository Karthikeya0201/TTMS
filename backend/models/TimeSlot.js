import mongoose from 'mongoose';
const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  period: {
    type: Number,
    required: [true, 'Period is required'],
    min: 1,
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: (value) => /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value),
      message: 'Start time must be in HH:MM 24-hour format',
    },
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: (value) => /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value),
      message: 'End time must be in HH:MM 24-hour format',
    },
  },
}, {
  timestamps: true,
  indexes: [{ key: { day: 1, period: 1 }, unique: true }],
});

// Validate that endTime is after startTime
timeSlotSchema.pre('validate', function (next) {
  const [startHour, startMinute] = this.startTime.split(':').map(Number);
  const [endHour, endMinute] = this.endTime.split(':').map(Number);
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;
  if (endInMinutes <= startInMinutes) {
    return next(new Error('End time must be after start time'));
  }
  next();
});
export default mongoose.models.TimeSlot || mongoose.model('TimeSlot', timeSlotSchema);  