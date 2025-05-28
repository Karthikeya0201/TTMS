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
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
  },
}, {
  timestamps: true,
  indexes: [{ key: { day: 1, period: 1 }, unique: true }],
});

export default mongoose.models.TimeSlot || mongoose.model('TimeSlot', timeSlotSchema);