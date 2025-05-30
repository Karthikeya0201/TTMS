import mongoose from 'mongoose';
const timetableEntrySchema = new mongoose.Schema(
  {
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
    timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: "TimeSlot", required: true },
  },
  {
    timestamps: true,
    indexes: [
      { key: { timeSlot: 1, faculty: 1 } },
      { key: { timeSlot: 1, classroom: 1 } },
      { key: { timeSlot: 1, section: 1 } },
    ],
  }
);
export default mongoose.models.TimetableEntry || mongoose.model('TimetableEntry', timetableEntrySchema);