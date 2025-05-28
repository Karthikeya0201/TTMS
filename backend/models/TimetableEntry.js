import mongoose from 'mongoose';

const TimeTableEntrySchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true,
  },
  timeSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true,
  },
}, {
  timestamps: true,
  indexes: [
    { key: { timeSlot: 1, faculty: 1 }, unique: true }, // Prevent faculty double-booking
    { key: { timeSlot: 1, classroom: 1 }, unique: true }, // Prevent classroom double-booking
  ],
});

TimeTableEntrySchema.pre('save', async function (next) {
  const existingEntry = await mongoose.model('TimeTableEntry').findOne({
    $or: [
      { timeSlot: this.timeSlot, faculty: this.faculty },
      { timeSlot: this.timeSlot, classroom: this.classroom },
    ],
  });
  if (existingEntry) {
    next(new Error('Conflict: Faculty or Classroom already assigned for this time slot'));
  }
  next();
});

export default mongoose.models.TimeTableEntry || mongoose.model('TimeTableEntry', TimeTableEntrySchema);